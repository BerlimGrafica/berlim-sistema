-- ----------------------------------------------------------------------------
-- Métricas de vendas somadas no banco, com período explícito.
--
-- Antes: TODO o painel de Vendas era calculado em JavaScript
-- (components/vendas/useFinanceiroMetrics.js), no navegador de quem abriu a
-- tela, sobre a lista de pedidos que por acaso estivesse em memória. Essa lista
-- é "pedidos do ano anterior para cá OU ainda em produção" — uma janela que
-- existe por razão de carregamento, não de negócio. O card chamava-se "Resumo
-- do Período" sem que período nenhum fosse escolhido, e as despesas entravam
-- inteiras enquanto a receita entrava só pela janela: duas réguas no mesmo
-- número ("Total Bruto" = recebido - despesas).
--
-- Agora: uma função recebe início e fim e devolve tudo pronto. A tela só exibe.
-- Consequências: o número é o mesmo para todo mundo, não depende de quem abriu
-- nem de quando, não encolhe sozinho quando a janela de carregamento avança, e
-- receita e despesa passam a ser recortadas pelo MESMO período.
--
-- SEMÂNTICA PRESERVADA de propósito (para permitir conferência número a número
-- contra a versão antiga). Duas heranças ficam registradas aqui porque são
-- decisões de negócio, não bugs de tradução, e devem ser tratadas à parte:
--
--   1) "recebido" de um pedido SEM nenhum pagamento lançado, mas com status
--      Concluído/Finalizado, conta o valor cheio como recebido. Isso infla o
--      recebido com dinheiro que ninguém registrou ter entrado.
--   2) os rankings por forma de pagamento e por instituição somam o valor bruto
--      da linha, sem inverter o sinal de Estorno (o total recebido inverte).
--
-- Valores sempre em CENTAVOS (inteiro), como no resto do sistema. A conversão
-- para reais acontece só na exibição.
--
-- security invoker (padrão): a RLS continua valendo: quem não enxerga
-- contas_pagar recebe as despesas zeradas, em vez de furar a política.
-- ----------------------------------------------------------------------------

create or replace function public.metricas_vendas(p_inicio date, p_fim date)
returns jsonb
language sql
stable
set search_path = public
as $$
with
-- "Hoje" no fuso de quem usa o sistema, nunca em UTC: o servidor roda em UTC e
-- a partir das 21h de Brasília já viraria o dia, zerando "Vendas Hoje" cedo.
hoje as (
    select (now() at time zone 'America/Sao_Paulo')::date as d
),

-- Pagamentos somados por pedido. Estorno é dinheiro voltando: entra negativo.
pagos_por_pedido as (
    select pedido_id,
           count(*)::int as qtd,
           sum(case when forma = 'Estorno' then -valor_centavos else valor_centavos end)::bigint as recebido
    from public.pedido_pagamentos
    group by pedido_id
),

-- Pedidos do período escolhido, cancelados de fora.
base as (
    select p.id, p.valor_total, p.status, p.data_pedido, p.local_producao,
           p.cliente, p.cliente_id,
           coalesce(pg.qtd, 0) as qtd_pag,
           coalesce(pg.recebido, 0) as pago_centavos
    from public.pedidos p
    left join pagos_por_pedido pg on pg.pedido_id = p.id
    where p.status not in ('Cancelado', 'Cancelada')
      and p.data_pedido between p_inicio and p_fim
),

-- Todos os pedidos não cancelados, sem recorte de período: usado só pelos
-- indicadores que são explicitamente históricos (série anual, comparativo
-- ano a ano) e por "Vendas Hoje".
base_historico as (
    select p.data_pedido, p.valor_total
    from public.pedidos p
    where p.status not in ('Cancelado', 'Cancelada')
      and p.data_pedido is not null
),

resumo as (
    select
        coalesce(sum(valor_total), 0)::bigint as bruto,
        coalesce(sum(case
            when qtd_pag > 0 then pago_centavos
            when status in ('Concluído', 'Finalizado') then valor_total
            else 0
        end), 0)::bigint as recebido,
        count(*)::int as qtd
    from base
),

-- Local de produção é texto separado por vírgula ("Berlim, Futura"). O valor do
-- pedido é dividido igualmente entre os locais citados, como já era feito.
local_expandido as (
    select b.id, b.valor_total,
           array_remove(array(select trim(x.parte) from unnest(string_to_array(b.local_producao, ',')) as x(parte)), '') as locais
    from base b
    where b.local_producao is not null
),
ranking_local as (
    select u.local as rotulo, sum(le.valor_total::numeric / array_length(le.locais, 1))::bigint as centavos
    from local_expandido le, unnest(le.locais) as u(local)
    where coalesce(array_length(le.locais, 1), 0) > 0
    group by u.local
),

-- Pagamentos dos pedidos do período (valor bruto da linha — ver nota 2 acima).
pag_periodo as (
    select coalesce(nullif(trim(pp.forma), ''), 'Indefinido') as forma,
           coalesce(nullif(trim(pp.instituicao), ''), 'Indefinido') as instituicao,
           pp.valor_centavos
    from public.pedido_pagamentos pp
    join base b on b.id = pp.pedido_id
),
ranking_forma as (
    select forma as rotulo, sum(valor_centavos)::bigint as centavos
    from pag_periodo group by forma
),
ranking_instituicao as (
    select instituicao as rotulo, sum(valor_centavos)::bigint as centavos
    from pag_periodo
    where forma in ('PIX', 'Link de Pagamento', 'Boleto')
    group by instituicao
),

-- Nome de exibição do item: o do catálogo quando há vínculo; senão o do
-- catálogo que casa por nome; senão o texto digitado. Mesma ordem de tentativa
-- da versão em JavaScript, inclusive o desempate por "ordem" do catálogo.
itens_periodo as (
    select coalesce(pr_id.nome, pr_nome.nome, trim(i.nome)) as rotulo, i.valor_centavos
    from base b
    join public.pedido_itens i on i.pedido_id = b.id
    left join public.produtos pr_id on pr_id.id = i.produto_id
    left join lateral (
        select pr.nome from public.produtos pr
        where i.produto_id is null and lower(pr.nome) = lower(trim(i.nome))
        order by pr.ordem nulls last, pr.id
        limit 1
    ) pr_nome on true
),
ranking_produto as (
    select rotulo, sum(valor_centavos)::bigint as centavos
    from itens_periodo
    where coalesce(rotulo, '') <> ''
    group by rotulo
),

-- Cliente agrupado pelo VÍNCULO, nunca pelo nome digitado: o cadastro tem
-- centenas de homônimos e somar por texto fundiria pessoas diferentes numa
-- linha só. Sem vínculo é venda de balcão.
cliente_base as (
    select coalesce(cliente_id::text, 'balcao') as chave,
           (cliente_id is null) as eh_balcao,
           id, cliente, valor_total
    from base
),
ranking_cliente as (
    select chave, eh_balcao,
           case when eh_balcao then 'Balcão'
                else coalesce((array_agg(cliente order by id desc))[1], '---') end as rotulo,
           sum(valor_total)::bigint as centavos,
           count(*)::int as qtd
    from cliente_base
    group by chave, eh_balcao
),

serie_dia as (
    select to_char(data_pedido, 'YYYY-MM-DD') as rotulo, sum(valor_total)::bigint as centavos
    from base group by 1 order by 1 desc limit 15
),
serie_mes as (
    select to_char(data_pedido, 'YYYY-MM') as rotulo, sum(valor_total)::bigint as centavos
    from base group by 1 order by 1 desc limit 15
),
serie_ano as (
    select to_char(data_pedido, 'YYYY') as rotulo, sum(valor_total)::bigint as centavos
    from base_historico group by 1 order by 1 desc limit 15
),

-- Contas a pagar recortadas pelo MESMO período da receita (pelo vencimento).
contas as (
    select c.id, c.descricao, c.valor, c.vencimento, c.status,
           coalesce(nullif(trim(c.categoria), ''), 'Despesa') as categoria,
           (c.status <> 'Pago' and c.vencimento < (select d from hoje)) as vencida
    from public.contas_pagar c
    where c.vencimento between p_inicio and p_fim
),
despesa_categoria as (
    select categoria as rotulo, sum(valor)::bigint as centavos
    from contas group by categoria
),
despesa_resumo as (
    select
        coalesce(sum(valor), 0)::bigint as total,
        coalesce(sum(valor) filter (where status <> 'Pago'), 0)::bigint as pendente,
        coalesce(sum(valor) filter (where status = 'Pago'), 0)::bigint as pago,
        count(*) filter (where vencida)::int as qtd_vencidas
    from contas
),
maiores_contas as (
    select id, descricao, valor::bigint as centavos, status, to_char(vencimento, 'YYYY-MM-DD') as vencimento
    from contas order by valor desc, id limit 8
),

-- Série de 12 meses por produto (gráfico de linhas). Independe do período
-- escolhido: é sempre "os últimos 12 meses até o mês corrente".
meses_grafico as (
    select to_char(g.inicio_mes, 'YYYY-MM') as mes
    from generate_series(
        date_trunc('month', (select d from hoje)::timestamp) - interval '11 months',
        date_trunc('month', (select d from hoje)::timestamp),
        interval '1 month'
    ) as g(inicio_mes)
),
itens_12m as (
    select to_char(p.data_pedido, 'YYYY-MM') as mes,
           coalesce(pr_id.nome, pr_nome.nome, trim(i.nome)) as produto,
           i.valor_centavos
    from public.pedidos p
    join public.pedido_itens i on i.pedido_id = p.id
    left join public.produtos pr_id on pr_id.id = i.produto_id
    left join lateral (
        select pr.nome from public.produtos pr
        where i.produto_id is null and lower(pr.nome) = lower(trim(i.nome))
        order by pr.ordem nulls last, pr.id
        limit 1
    ) pr_nome on true
    where p.status not in ('Cancelado', 'Cancelada')
      and p.data_pedido is not null
      and to_char(p.data_pedido, 'YYYY-MM') in (select mes from meses_grafico)
),
itens_12m_somados as (
    select mes, produto, sum(valor_centavos)::bigint as centavos
    from itens_12m
    where coalesce(produto, '') <> ''
    group by mes, produto
),
serie_produto as (
    select prod.produto,
           jsonb_agg(coalesce(s.centavos, 0) order by m.mes) as valores
    from (select distinct produto from itens_12m_somados) prod
    cross join meses_grafico m
    left join itens_12m_somados s on s.produto = prod.produto and s.mes = m.mes
    group by prod.produto
),

ano_atual as (select to_char((select d from hoje), 'YYYY') as a),
totais_ano as (
    select
        coalesce(sum(valor_total) filter (where to_char(data_pedido, 'YYYY') = (select a from ano_atual)), 0)::bigint as atual,
        coalesce(sum(valor_total) filter (where to_char(data_pedido, 'YYYY') = ((select a from ano_atual)::int - 1)::text), 0)::bigint as anterior
    from base_historico
)

select jsonb_build_object(
    'periodo', jsonb_build_object('inicio', p_inicio, 'fim', p_fim),
    'gerado_em', now(),

    'resumo', (select jsonb_build_object(
        'bruto_centavos', bruto,
        'recebido_centavos', recebido,
        'a_receber_centavos', bruto - recebido,
        'qtd_pedidos', qtd,
        -- round() e não divisão inteira: bigint/int no Postgres trunca, e o
        -- ticket médio ficaria um centavo abaixo do valor correto.
        'ticket_medio_centavos', case when qtd > 0 then round(bruto::numeric / qtd)::bigint else 0 end
    ) from resumo),

    'vendas_hoje_centavos', (select coalesce(sum(valor_total), 0)::bigint from base_historico where data_pedido = (select d from hoje)),

    'ano', (select jsonb_build_object(
        'rotulo', (select a from ano_atual),
        'atual_centavos', atual,
        'anterior_centavos', anterior,
        'crescimento_pct', case
            when anterior > 0 then round(((atual - anterior)::numeric / anterior) * 100, 1)
            when atual > 0 then 100
            else 0 end
    ) from totais_ano),

    -- A ordem é reafirmada no jsonb_agg: o "order by" de uma CTE não é garantia
    -- de ordem na agregação de fora. Mais recente primeiro, como na tela.
    'serie_ano', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by rotulo desc) from serie_ano), '[]'::jsonb),
    'serie_mes', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by rotulo desc) from serie_mes), '[]'::jsonb),
    'serie_dia', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by rotulo desc) from serie_dia), '[]'::jsonb),

    'ranking_local', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by centavos desc) from ranking_local), '[]'::jsonb),
    'ranking_forma', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by centavos desc) from ranking_forma), '[]'::jsonb),
    'ranking_instituicao', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by centavos desc) from ranking_instituicao), '[]'::jsonb),
    'ranking_produto', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by centavos desc) from ranking_produto), '[]'::jsonb),
    'ranking_cliente', coalesce((select jsonb_agg(jsonb_build_object(
        'chave', chave, 'rotulo', rotulo, 'eh_balcao', eh_balcao, 'centavos', centavos, 'qtd', qtd
    ) order by centavos desc) from ranking_cliente), '[]'::jsonb),

    'despesas', (select jsonb_build_object(
        'total_centavos', total,
        'pendente_centavos', pendente,
        'pago_centavos', pago,
        'qtd_vencidas', qtd_vencidas,
        'por_categoria', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos) order by centavos desc) from despesa_categoria), '[]'::jsonb),
        'maiores', coalesce((select jsonb_agg(jsonb_build_object(
            'id', id, 'descricao', descricao, 'centavos', centavos, 'status', status, 'vencimento', vencimento
        ) order by centavos desc, id) from maiores_contas), '[]'::jsonb)
    ) from despesa_resumo),

    'serie_produto_mes', jsonb_build_object(
        'meses', coalesce((select jsonb_agg(mes order by mes) from meses_grafico), '[]'::jsonb),
        'series', coalesce((select jsonb_agg(jsonb_build_object('produto', produto, 'valores', valores) order by produto) from serie_produto), '[]'::jsonb)
    )
);
$$;

grant execute on function public.metricas_vendas(date, date) to authenticated;

-- Índices que esta função passa a exercitar. pedido_id de itens e pagamentos já
-- têm índice (pedido_itens_pagamentos_migration.sql); falta o recorte por data,
-- que é o filtro principal de todo o painel.
create index if not exists idx_pedidos_data_pedido on public.pedidos (data_pedido);
create index if not exists idx_contas_pagar_vencimento on public.contas_pagar (vencimento);
