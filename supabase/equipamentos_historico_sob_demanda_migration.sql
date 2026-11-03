-- ============================================================================
-- Equipamentos: o histórico lido sob demanda
-- Rode no SQL Editor do Supabase. É idempotente.
-- ============================================================================
--
-- PROBLEMA
-- A tela de equipamentos lia a tabela equipamento_registros inteira ao abrir.
-- Hoje são poucas linhas, mas a tabela só cresce (algumas por máquina por mês)
-- e o Supabase devolve no máximo 1.000 linhas por consulta: passado esse ponto,
-- os registros mais antigos sumiriam do histórico sem aviso. E cada abertura da
-- tela baixaria anos de histórico para mostrar a primeira tela.
--
-- SOLUÇÃO
-- Duas leituras, cada uma do tamanho do que a tela mostra:
--
-- 1) equipamentos_resumo(): só os registros que o quadro de máquinas, a gaveta
--    e o formulário usam — por máquina, os 5 mais recentes, a última carga e a
--    penúltima de cada tinta (o rendimento da última carga), o último com
--    contador e o último de cada tipo. Poucas dezenas de linhas, por mais anos
--    de histórico que existam. As contas da tela (lib/equipamentos/historico.js)
--    continuam as mesmas, feitas sobre este recorte.
--
-- 2) equipamento_registros_hist: a vista do histórico, com o rendimento de cada
--    carga já calculado (quantas páginas a carga anterior da mesma tinta
--    rendeu). O histórico vem em páginas, com os filtros feitos no banco; o
--    rendimento não pode ser calculado na tela, porque a carga anterior pode
--    estar numa página que não foi lida.
--
-- As duas rodam com os direitos de quem lê (security_invoker): a política de
-- leitura de equipamento_registros continua valendo.
-- ============================================================================

create or replace view public.equipamento_registros_hist
    with (security_invoker = true) as
with cargas as (
    -- Uma linha por tinta de cada carga, com o contador da carga anterior da
    -- mesma tinta na mesma máquina (mesma ordem de lib/equipamentos/historico.js:
    -- pela data e, no mesmo dia, pelo id).
    select r.id, t.tinta, r.contador,
           lag(r.contador) over (partition by r.equipamento, t.tinta order by r.data, r.id) as contador_anterior,
           lag(r.id) over (partition by r.equipamento, t.tinta order by r.data, r.id) as id_anterior
      from public.equipamento_registros r
     cross join lateral unnest(r.cores) as t(tinta)
     where r.tipo = 'Reabastecimento'
),
rendimentos as (
    -- Sem contador numa das duas, ou com resultado negativo (contador zerado num
    -- reparo), não há rendimento: um número falso seria pior que nenhum.
    select id, jsonb_object_agg(tinta, contador - contador_anterior) as rendimentos
      from cargas
     where id_anterior is not null
       and contador is not null and contador_anterior is not null
       and contador - contador_anterior >= 0
     group by id
)
select r.*, coalesce(rd.rendimentos, '{}'::jsonb) as rendimentos
  from public.equipamento_registros r
  left join rendimentos rd on rd.id = r.id;

revoke all on public.equipamento_registros_hist from anon;
grant select on public.equipamento_registros_hist to authenticated;

create or replace function public.equipamentos_resumo()
returns setof public.equipamento_registros_hist
language sql
stable
security invoker
set search_path = public
as $$
    with ordem as (
        select r.id,
               row_number() over (partition by r.equipamento order by r.data desc, r.id desc) as n_maquina,
               row_number() over (partition by r.equipamento, r.tipo order by r.data desc, r.id desc) as n_tipo,
               row_number() over (partition by r.equipamento, (r.contador is not null) order by r.data desc, r.id desc) as n_contador,
               r.contador
          from public.equipamento_registros r
    ),
    por_tinta as (
        select r.id,
               row_number() over (partition by r.equipamento, t.tinta order by r.data desc, r.id desc) as n
          from public.equipamento_registros r
         cross join lateral unnest(r.cores) as t(tinta)
         where r.tipo = 'Reabastecimento'
    ),
    escolhidos as (
        select id from ordem
         where n_maquina <= 5 or n_tipo = 1 or (contador is not null and n_contador = 1)
        union
        select id from por_tinta where n <= 2
    )
    select h.*
      from public.equipamento_registros_hist h
     where h.id in (select id from escolhidos)
     order by h.data desc, h.id desc;
$$;

-- Função nasce executável por todos (public); só quem está logado precisa dela.
revoke all on function public.equipamentos_resumo() from public, anon;
grant execute on function public.equipamentos_resumo() to authenticated;

-- O histórico filtra por máquina e ordena pela data; este índice já existia
-- (equipamentos_migration.sql), repetido aqui só para garantir.
create index if not exists equipamento_registros_maquina_data_idx
    on public.equipamento_registros (equipamento, data desc, id desc);

-- Avisa a API do Supabase que há função e vista novas, sem esperar o ciclo dela.
notify pgrst, 'reload schema';
