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
-- DUAS HERANÇAS CORRIGIDAS (a versão inicial desta função as preservava de
-- propósito, para permitir a conferência número a número contra o cálculo
-- antigo; provada a equivalência, foram corrigidas):
--
--   1) "recebido" contava o valor cheio de um pedido Concluído/Finalizado que
--      não tivesse NENHUM pagamento lançado — reportava como dinheiro em caixa
--      algo que ninguém registrou ter entrado, e o erro sempre apontava para
--      mais. Agora "recebido" só soma o que tem lançamento, e esses pedidos
--      viram um indicador próprio ("sem_baixa"), com a lista para cobrança.
--      Efeito colateral correto: eles passam a pesar no saldo devedor.
--   2) os rankings por forma de pagamento e por instituição somavam o valor
--      bruto da linha, sem inverter o sinal de Estorno — enquanto o total
--      recebido invertia. A soma dos rankings não fechava com o recebido.
--      Agora usam o mesmo sinal.
--
-- Valores sempre em CENTAVOS (inteiro), como no resto do sistema. A conversão
-- para reais acontece só na exibição.
--
-- FATURAMENTO DE ANTES DO SISTEMA (vendas_historico, ver
-- vendas_historico_migration.sql): até julho de 2026 só existe o total de cada
-- mês, de uma planilha. Ele entra SÓ nas leituras de tendência: as séries por
-- mês e por ano e o comparativo do ano. Resumo, recebido, a receber, ticket,
-- rankings e "sem baixa" continuam só com O.S., porque a planilha não tem esse
-- detalhe e somar um total sem pedido ali estragaria cada uma dessas contas.
-- Para o período escolhido, o que a planilha tem nele vai num campo à parte
-- ("historico"), e a tela decide como mostrar.
-- Ordem para rodar: vendas_historico_migration.sql, depois os dados, depois
-- este arquivo (a função lê a tabela, que precisa existir antes).
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
-- indicadores que são explicitamente históricos (séries, comparativo ano a
-- ano, que somam também a planilha em fat_mes) e por "Vendas Hoje".
base_historico as (
    select p.data_pedido, p.valor_total
    from public.pedidos p
    where p.status not in ('Cancelado', 'Cancelada')
      and p.data_pedido is not null
),

-- Um pedido encerrado sem nenhum pagamento lançado não é dinheiro recebido:
-- é cobrança pendente. Fica separado, com nome próprio e lista.
sem_baixa as (
    select id, cliente, status, valor_total,
           to_char(data_pedido, 'YYYY-MM-DD') as data_pedido
    from base
    where qtd_pag = 0 and status in ('Concluído', 'Finalizado')
),

resumo as (
    select
        coalesce(sum(valor_total), 0)::bigint as bruto,
        coalesce(sum(case when qtd_pag > 0 then pago_centavos else 0 end), 0)::bigint as recebido,
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

-- Pagamentos dos pedidos do período. Mesmo sinal do total recebido: estorno é
-- dinheiro voltando ao cliente, então entra negativo. Assim a soma dos rankings
-- fecha com o "recebido" — antes as duas contas divergiam em silêncio.
pag_periodo as (
    select coalesce(nullif(trim(pp.forma), ''), 'Indefinido') as forma,
           coalesce(nullif(trim(pp.instituicao), ''), 'Indefinido') as instituicao,
           case when pp.forma = 'Estorno' then -pp.valor_centavos else pp.valor_centavos end as valor_centavos
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
    where forma in ('PIX', 'Depósito Bancário', 'Link de Pagamento', 'Boleto')
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

-- O faturamento de antes do sistema: um total por mês, sem pedido nenhum.
historico as (
    select mes, valor_centavos from public.vendas_historico
),

-- Faturamento por mês para as leituras de tendência: o da planilha nos meses
-- que ela cobre, o das O.S. no resto. Num mês que a planilha cobre, uma O.S.
-- com data antiga (digitada errada, por exemplo) não soma: vale o número
-- importado. "planilha" diz quanto do mês veio dela, para a tela marcar.
fat_mes as (
    select mes, valor_centavos as centavos, valor_centavos as planilha
    from historico
    union all
    select date_trunc('month', data_pedido)::date, sum(valor_total)::bigint, 0
    from base_historico
    where date_trunc('month', data_pedido)::date not in (select mes from historico)
    group by 1
),

-- O que a planilha tem dentro do período escolhido. Ela só tem o total do mês,
-- então só conta o mês que cabe inteiro no período; o mês cortado pelo período
-- vai à parte, para a tela dizer que ficou de fora em vez de inventar um pedaço.
historico_periodo as (
    select mes, valor_centavos,
           (mes >= p_inicio and (mes + interval '1 month' - interval '1 day')::date <= p_fim) as inteiro
    from historico
    where mes <= p_fim and (mes + interval '1 month' - interval '1 day')::date >= p_inicio
),

-- As três séries de "Faturamento no tempo" não seguem o período escolhido:
-- elas mostram a evolução do faturamento, que é uma leitura de tendência e não
-- do recorte selecionado. Com o filtro aplicado, "por dia" dentro de um período
-- de um mês repetia o que o próprio filtro já dizia, e comparar dois meses
-- exigia trocar o período — justamente o que a série deveria evitar.
-- O `limit 15` é o que segura o tamanho: são sempre os 15 dias, meses e anos
-- mais recentes COM faturamento, independente do intervalo escolhido em cima.
-- Mês e ano incluem a planilha; dia não, porque ela não tem o dia.
serie_dia as (
    select to_char(data_pedido, 'YYYY-MM-DD') as rotulo, sum(valor_total)::bigint as centavos
    from base_historico group by 1 order by 1 desc limit 15
),
serie_mes as (
    select to_char(mes, 'YYYY-MM') as rotulo, centavos, planilha
    from fat_mes order by mes desc limit 15
),
-- "meses": quantos meses do ano têm faturamento. O primeiro ano da planilha
-- (2020) tem só dois, e a tela não o trata como ano fechado.
serie_ano as (
    select to_char(mes, 'YYYY') as rotulo, sum(centavos)::bigint as centavos, sum(planilha)::bigint as planilha,
           count(*)::int as meses
    from fat_mes group by 1 order by 1 desc limit 15
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

-- O ano corrente contra o anterior, pelo faturamento por mês (com a planilha).
-- "fechado" é de janeiro até o mês passado: a comparação justa, os mesmos meses
-- dos dois anos. O ano anterior inteiro continua indo, para dar o tamanho dele.
ano_atual as (
    select to_char(d, 'YYYY') as a,
           extract(year from d)::int as ano,
           extract(month from d)::int - 1 as fechados
    from hoje
),
totais_ano as (
    select
        coalesce(sum(f.centavos) filter (where extract(year from f.mes) = h.ano), 0)::bigint as atual,
        coalesce(sum(f.centavos) filter (where extract(year from f.mes) = h.ano - 1), 0)::bigint as anterior,
        coalesce(sum(f.centavos) filter (where extract(year from f.mes) = h.ano and extract(month from f.mes) <= h.fechados), 0)::bigint as atual_fechado,
        coalesce(sum(f.centavos) filter (where extract(year from f.mes) = h.ano - 1 and extract(month from f.mes) <= h.fechados), 0)::bigint as anterior_fechado,
        coalesce(sum(f.planilha) filter (where extract(year from f.mes) = h.ano), 0)::bigint as atual_planilha,
        h.fechados
    from ano_atual h
    left join fat_mes f on extract(year from f.mes) between h.ano - 1 and h.ano
    group by h.fechados
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

    -- Pedidos encerrados sem nenhum pagamento lançado: não são receita, são
    -- cobrança. A lista vai junto para a tela poder mostrar o que perseguir.
    'sem_baixa', jsonb_build_object(
        'total_centavos', (select coalesce(sum(valor_total), 0)::bigint from sem_baixa),
        'qtd', (select count(*)::int from sem_baixa),
        'pedidos', coalesce((select jsonb_agg(jsonb_build_object(
            'id', id, 'cliente', cliente, 'centavos', valor_total, 'status', status, 'data_pedido', data_pedido
        ) order by valor_total desc, id) from sem_baixa), '[]'::jsonb)
    ),

    'vendas_hoje_centavos', (select coalesce(sum(valor_total), 0)::bigint from base_historico where data_pedido = (select d from hoje)),

    'ano', (select jsonb_build_object(
        'rotulo', (select a from ano_atual),
        'atual_centavos', atual,
        'anterior_centavos', anterior,
        'meses_fechados', fechados,
        'atual_fechado_centavos', atual_fechado,
        'anterior_fechado_centavos', anterior_fechado,
        'planilha_centavos', atual_planilha,
        -- Os mesmos meses fechados dos dois anos. Antes era o ano corrente até
        -- hoje contra o anterior inteiro, que só fica justo em dezembro. Em
        -- janeiro não há mês fechado: sem crescimento (null), em vez de um
        -- número que compara dias com um ano.
        'crescimento_pct', case
            when fechados = 0 then null
            when anterior_fechado > 0 then round(((atual_fechado - anterior_fechado)::numeric / anterior_fechado) * 100, 1)
            when atual_fechado > 0 then 100
            else 0 end
    ) from totais_ano),

    -- O que a planilha tem no período escolhido (só meses inteiros; os
    -- cortados vão listados) e o último mês dela: dali em diante é o sistema.
    'historico', jsonb_build_object(
        'centavos', (select coalesce(sum(valor_centavos), 0)::bigint from historico_periodo where inteiro),
        'meses', (select count(*)::int from historico_periodo where inteiro),
        'cortados', coalesce((select jsonb_agg(to_char(mes, 'YYYY-MM') order by mes) from historico_periodo where not inteiro), '[]'::jsonb),
        'ultimo_mes', (select to_char(max(mes), 'YYYY-MM') from historico)
    ),

    -- A ordem é reafirmada no jsonb_agg: o "order by" de uma CTE não é garantia
    -- de ordem na agregação de fora. Mais recente primeiro, como na tela.
    -- planilha_centavos: quanto daquele mês ou ano veio da planilha.
    'serie_ano', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos, 'planilha_centavos', planilha, 'meses', meses) order by rotulo desc) from serie_ano), '[]'::jsonb),
    'serie_mes', coalesce((select jsonb_agg(jsonb_build_object('rotulo', rotulo, 'centavos', centavos, 'planilha_centavos', planilha) order by rotulo desc) from serie_mes), '[]'::jsonb),
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
