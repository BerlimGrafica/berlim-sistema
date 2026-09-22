-- ============================================================================
-- Busca sem acento e sem caixa
-- Rode este arquivo inteiro no SQL Editor do Supabase. É seguro rodar de novo.
-- ============================================================================
--
-- PROBLEMA
-- `ilike` ignora a caixa, mas não o acento. Com 7.314 clientes cadastrados —
-- centenas deles com ç, ã ou ê no nome — procurar "goncalves" não achava
-- "Gonçalves", e o atendente concluía que o cliente não existia e cadastrava
-- de novo. É a mesma origem das duplicatas que o telefone_digits resolveu do
-- lado do telefone.
--
-- SOLUÇÃO
-- Mesmo desenho do telefone_digits: uma coluna GERADA com o texto já
-- normalizado, que o Postgres mantém sozinho — inclusive nas linhas que já
-- existem — e na qual não é possível gravar direto, então ela nunca sai de
-- sincronia com a coluna de origem.
--
-- Por que `translate` e não a extensão `unaccent`:
--   * unaccent() é STABLE, não IMMUTABLE, e coluna gerada exige IMMUTABLE. O
--     contorno é chamar a forma de dois argumentos com o dicionário explícito,
--     que depende de saber em qual schema a extensão foi instalada — no
--     Supabase ela vai para `extensions`, em outra instalação vai para
--     `public`, e o arquivo quebraria num dos dois casos.
--   * translate() é built-in, IMMUTABLE por natureza e cobre o português
--     inteiro numa linha. O preço é manter a tabela de-para aqui, que não
--     muda desde 1990.
-- ----------------------------------------------------------------------------

create or replace function public.sem_acento(t text)
returns text
language sql
immutable
parallel safe
as $$
  select lower(translate(
    coalesce(t, ''),
    'àáâãäåÀÁÂÃÄÅèéêëÈÉÊËìíîïÌÍÎÏòóôõöøÒÓÔÕÖØùúûüÙÚÛÜçÇñÑýÿÝ',
    'aaaaaaAAAAAAeeeeEEEEiiiiIIIIooooooOOOOOOuuuuUUUUcCnNyyY'
  ))
$$;

comment on function public.sem_acento(text) is
  'Minúsculas e sem acento, para comparação de busca. Espelha semAcento() de lib/utils/busca.js.';

-- ----------------------------------------------------------------------------
-- Colunas geradas
-- ----------------------------------------------------------------------------

alter table public.clientes
  add column if not exists nome_busca text
  generated always as (public.sem_acento(nome)) stored;

alter table public.clientes
  add column if not exists email_busca text
  generated always as (public.sem_acento(email)) stored;

-- pedidos.cliente guarda o nome desnormalizado; é por ele que o histórico de
-- O.S. procura.
alter table public.pedidos
  add column if not exists cliente_busca text
  generated always as (public.sem_acento(cliente)) stored;

-- ----------------------------------------------------------------------------
-- Índices
--
-- A busca é `%termo%`, com curinga dos dois lados, e para isso um índice btree
-- não serve — só trigrama resolve. O bloco abaixo tenta o pg_trgm e, se a
-- extensão não estiver disponível, cai num btree, que pelo menos atende o
-- filtro por letra inicial ("A", "B"...) da tela de clientes. Em nenhum dos
-- casos o arquivo falha: um índice ausente deixa a busca mais lenta, não
-- quebrada.
-- ----------------------------------------------------------------------------

do $$
begin
  create extension if not exists pg_trgm;

  execute 'create index if not exists idx_clientes_nome_busca_trgm
             on public.clientes using gin (nome_busca gin_trgm_ops)';
  execute 'create index if not exists idx_clientes_email_busca_trgm
             on public.clientes using gin (email_busca gin_trgm_ops)';
  execute 'create index if not exists idx_pedidos_cliente_busca_trgm
             on public.pedidos using gin (cliente_busca gin_trgm_ops)';

  raise notice 'Índices de trigrama criados.';
exception when others then
  raise notice 'pg_trgm indisponível (%), caindo para btree.', sqlerrm;
  execute 'create index if not exists idx_clientes_nome_busca
             on public.clientes (nome_busca text_pattern_ops)';
  execute 'create index if not exists idx_pedidos_cliente_busca
             on public.pedidos (cliente_busca text_pattern_ops)';
end $$;

-- ----------------------------------------------------------------------------
-- Conferência
--
--   select nome, nome_busca from public.clientes
--    where nome_busca like '%goncalves%' limit 5;
--
-- Deve trazer os "Gonçalves" — que é o que a busca antiga não trazia.
-- ----------------------------------------------------------------------------
