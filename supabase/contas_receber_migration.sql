-- ----------------------------------------------------------------------------
-- Contas a receber somadas no banco (vista contas_receber).
--
-- Antes: a aba Financeiro > Contas a Receber baixava TODA O.S. não finalizada,
-- com itens e pagamentos inteiros, para somar e filtrar no navegador. Pesava no
-- tráfego do plano gratuito e, passando de 1.000 O.S., o Supabase cortava as
-- mais novas sem avisar.
--
-- Agora: uma linha por O.S. que ainda tem dinheiro para entrar, com as contas
-- prontas. A tela só lê.
--
-- Boleto lançado e ainda não pago NÃO é dinheiro recebido. Antes ele contava
-- como pago, e a O.S. sumia do contas a receber assim que o boleto era gerado.
-- Aqui ele fica numa coluna própria:
--   recebido  = pagamentos de fato (Estorno entra negativo), sem boleto em aberto
--   em_boleto = boletos lançados e ainda não marcados como pagos
--   saldo     = o que nem foi combinado: total - recebido - em_boleto
-- Entra a O.S. que tem total - recebido > 0. Finalizada só entra se ainda tiver
-- boleto em aberto (é comum dar baixa na O.S. assim que o boleto sai).
--
-- Valores em centavos, como no resto do sistema. O vencimento sai como texto
-- 'AAAA-MM-DD': pedidos.prazo_pagamento é texto e vencimento_boleto é data, e
-- converter o texto para data quebraria a vista inteira por causa de um valor
-- antigo fora do formato.
-- security_invoker: a RLS de pedidos e pedido_pagamentos continua valendo.
-- ----------------------------------------------------------------------------

create or replace view public.contas_receber
with (security_invoker = true) as
with pagamentos as (
    select pedido_id,
           sum(case
                   when forma = 'Boleto' and boleto_concluido is not true then 0
                   when forma = 'Estorno' then -valor_centavos
                   else valor_centavos
               end)::bigint as recebido,
           sum(case when forma = 'Boleto' and boleto_concluido is not true then valor_centavos else 0 end)::bigint as em_boleto,
           min(vencimento_boleto) filter (where forma = 'Boleto' and boleto_concluido is not true) as boleto_vence,
           max(data) filter (where not (forma = 'Boleto' and boleto_concluido is not true) and forma <> 'Estorno') as ultimo_pagamento,
           array_agg(distinct forma) filter (where forma <> 'Estorno') as formas
    from public.pedido_pagamentos
    group by pedido_id
),
itens as (
    select pedido_id,
           count(*)::int as n_itens,
           left(string_agg(coalesce(nullif(trim(nome), ''), 'Item'), ' · ' order by ordem), 200) as itens
    from public.pedido_itens
    group by pedido_id
)
select p.id,
       p.cliente,
       p.cliente_id,
       p.status,
       p.data_pedido,
       p.prazo,
       p.data_retirada,
       coalesce(nullif(trim(p.prazo_pagamento), ''), g.boleto_vence::text) as boleto_vence,
       p.valor_total as total,
       coalesce(g.recebido, 0) as recebido,
       coalesce(g.em_boleto, 0) as em_boleto,
       greatest(p.valor_total - coalesce(g.recebido, 0) - coalesce(g.em_boleto, 0), 0) as saldo,
       g.ultimo_pagamento,
       coalesce(g.formas, '{}') as formas,
       coalesce(i.n_itens, 0) as n_itens,
       coalesce(i.itens, '') as itens
from public.pedidos p
left join pagamentos g on g.pedido_id = p.id
left join itens i on i.pedido_id = p.id
where p.status not in ('Abandonado', 'Cancelado')
  and (p.status <> 'Finalizado' or coalesce(g.em_boleto, 0) > 0)
  and p.valor_total - coalesce(g.recebido, 0) > 0;

revoke all on public.contas_receber from public, anon;
grant select on public.contas_receber to authenticated;

notify pgrst, 'reload schema';
