-- ----------------------------------------------------------------------------
-- Pagamento em lote gravado de uma vez só.
--
-- Um pagamento que quita várias O.S. (um Pix de R$ 75,00 para uma O.S. de
-- R$ 50,00 e outra de R$ 25,00) vira uma linha em pedido_pagamentos por O.S.,
-- todas com o mesmo lote_id. A divisão é o que diz quanto cada O.S. recebeu; o
-- lote_id é o que diz que as partes são um pagamento só.
--
-- Antes: o app inseria uma parte por vez, uma chamada por O.S., e a parte da
-- O.S. aberta só entrava quando ela era salva em seguida. Uma queda de rede no
-- meio deixava o pagamento pela metade: uma O.S. paga, a outra não, e nada na
-- tela dizendo que os R$ 75,00 estavam incompletos.
--
-- Agora: todas as partes entram dentro desta função. O Postgres executa a
-- função numa transação — ou o pagamento inteiro grava, ou nada muda.
--
-- Só o dinheiro fica aqui: o status de cada O.S. não muda. Quitar não é dar
-- baixa; a baixa continua sendo pelo Finalizar.
--
-- security invoker, como em gravacao_transacional_migration.sql: a RLS segue
-- valendo linha a linha, e a conta de demonstração continua sem gravar.
-- ----------------------------------------------------------------------------

create or replace function public.registrar_pagamento_lote(
    p_lote_id text,
    p_pagamento jsonb,
    p_partes jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_linhas jsonb;
    v_partes int;
    v_pedidos int;
begin
    if coalesce(p_lote_id, '') = '' then
        raise exception 'Pagamento em lote sem identificação.';
    end if;

    select count(*), count(distinct x.pedido_id)
      into v_partes, v_pedidos
      from jsonb_to_recordset(coalesce(p_partes, '[]'::jsonb)) as x(pedido_id bigint, valor_centavos int);

    if v_partes < 1 then
        raise exception 'Pagamento em lote sem nenhuma O.S.';
    end if;
    if v_pedidos <> v_partes then
        raise exception 'A mesma O.S. apareceu duas vezes no pagamento em lote.';
    end if;
    if exists (
        select 1
          from jsonb_to_recordset(p_partes) as x(pedido_id bigint, valor_centavos int)
         where x.pedido_id is null or coalesce(x.valor_centavos, 0) <= 0
    ) then
        raise exception 'Cada O.S. do pagamento em lote precisa de um valor maior que zero.';
    end if;

    with novos as (
        insert into public.pedido_pagamentos (
            pedido_id, ordem, forma, valor_centavos, parcelas,
            instituicao, bandeira, data, vencimento_boleto, boleto_concluido, lote_id
        )
        select x.pedido_id,
               -- Depois do último pagamento que a O.S. já tem.
               coalesce((select max(pp.ordem) + 1 from public.pedido_pagamentos pp where pp.pedido_id = x.pedido_id), 0),
               coalesce(m.forma, 'Indefinido'), x.valor_centavos, m.parcelas,
               m.instituicao, m.bandeira, m.data, m.vencimento_boleto, m.boleto_concluido, p_lote_id
          from jsonb_to_recordset(p_partes) as x(pedido_id bigint, valor_centavos int)
         cross join jsonb_to_record(coalesce(p_pagamento, '{}'::jsonb)) as m(
               forma text, parcelas int, instituicao text, bandeira text,
               data date, vencimento_boleto date, boleto_concluido boolean
         )
        returning *
    )
    select coalesce(jsonb_agg(to_jsonb(n) order by n.pedido_id), '[]'::jsonb) into v_linhas from novos n;

    return v_linhas;
end;
$$;

grant execute on function public.registrar_pagamento_lote(text, jsonb, jsonb) to authenticated;
