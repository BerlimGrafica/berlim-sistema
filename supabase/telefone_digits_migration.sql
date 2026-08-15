-- ============================================================================
-- Busca e anti-duplicata de telefone por dígitos
-- Rode no SQL Editor do Supabase. É idempotente.
-- ============================================================================
--
-- PROBLEMA
-- A coluna `telefone` guarda o número já formatado — "(11) 4457-6742". Toda
-- comparação era feita contra esse texto, então:
--   * buscar "44576742" não achava "(11) 4457-6742" (o hífen quebra o trecho);
--   * o anti-duplicata procurava os 4 últimos dígitos "6742" dentro do texto
--     e também não achava, concluindo que não havia duplicata — foi assim que
--     o mesmo cliente entrou várias vezes.
--
-- SOLUÇÃO
-- Uma coluna gerada com só os dígitos. O Postgres a mantém sozinho, inclusive
-- para as linhas que já existem — não há dado para migrar, e ela nunca sai de
-- sincronia com `telefone` porque não é possível gravar nela diretamente.
-- ----------------------------------------------------------------------------

alter table public.clientes
  add column if not exists telefone_digits text
  generated always as (regexp_replace(coalesce(telefone, ''), '\D', '', 'g')) stored;

create index if not exists idx_clientes_telefone_digits
  on public.clientes (telefone_digits);

-- Conferência: as duas Silvanas duplicadas devem sair com o mesmo
-- telefone_digits, que é o que agora permite detectá-las.
--
--   select id, nome, telefone, telefone_digits
--     from public.clientes
--    where telefone_digits like '%44576742%';
