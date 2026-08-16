-- ----------------------------------------------------------------------------
-- Gravação transacional dos itens/pagamentos de O.S. e dos itens de orçamento.
--
-- Antes: o app apagava todas as linhas filhas e depois inseria as novas, em
-- duas chamadas independentes. Se a segunda falhasse — queda de rede, sessão
-- expirada, tempo esgotado — a O.S. ficava SEM NENHUM item e SEM NENHUM
-- pagamento, com o valor total intacto e nada que o explicasse. Não havia
-- desfazer, e o usuário via apenas um aviso de erro. Improvável, catastrófico
-- e silencioso: acontece justamente em conexão ruim, que é quando as pessoas
-- mais salvam de novo.
--
-- Agora: apagar e inserir acontecem dentro de uma função. O Postgres executa
-- cada função dentro de uma transação — ou tudo grava, ou nada muda. Em caso
-- de erro as linhas antigas continuam lá, intactas.
--
-- As funções devolvem as linhas inseridas (com o id real) para o app manter o
-- pedido em memória consistente sem precisar recarregar tudo.
--
-- security invoker: a RLS continua valendo linha a linha — em especial a
-- política que impede o papel 'demo' de escrever (ver
-- pedido_itens_pagamentos_migration.sql). Uma função com direitos do dono
-- furaria exatamente essa proteção.
--
-- jsonb_to_recordset em vez de ->> campo a campo: a tipagem das colunas é
-- declarada uma vez e o Postgres recusa a chamada inteira se o app mandar algo
-- fora do tipo, em vez de gravar lixo convertido em silêncio.
-- ----------------------------------------------------------------------------

create or replace function public.salvar_itens_pagamentos(
    p_pedido_id bigint,
    p_itens jsonb default '[]'::jsonb,
    p_pagamentos jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_itens jsonb;
    v_pagamentos jsonb;
begin
    delete from public.pedido_itens where pedido_id = p_pedido_id;
    delete from public.pedido_pagamentos where pedido_id = p_pedido_id;

    with novos as (
        insert into public.pedido_itens (
            pedido_id, produto_id, ordem, nome, descricao,
            valor_centavos, valor_original_centavos, desconto_percentual,
            local_producao, concluido
        )
        select p_pedido_id, x.produto_id, coalesce(x.ordem, 0), x.nome, x.descricao,
               coalesce(x.valor_centavos, 0), x.valor_original_centavos, x.desconto_percentual,
               x.local_producao, coalesce(x.concluido, false)
        from jsonb_to_recordset(coalesce(p_itens, '[]'::jsonb)) as x(
            produto_id bigint, ordem int, nome text, descricao text,
            valor_centavos int, valor_original_centavos int, desconto_percentual numeric,
            local_producao text, concluido boolean
        )
        returning *
    )
    select coalesce(jsonb_agg(to_jsonb(n) order by n.ordem, n.id), '[]'::jsonb) into v_itens from novos n;

    with novos as (
        insert into public.pedido_pagamentos (
            pedido_id, ordem, forma, valor_centavos, parcelas,
            instituicao, bandeira, data, vencimento_boleto, boleto_concluido, lote_id
        )
        select p_pedido_id, coalesce(x.ordem, 0), coalesce(x.forma, 'Indefinido'),
               coalesce(x.valor_centavos, 0), x.parcelas,
               x.instituicao, x.bandeira, x.data, x.vencimento_boleto, x.boleto_concluido, x.lote_id
        from jsonb_to_recordset(coalesce(p_pagamentos, '[]'::jsonb)) as x(
            ordem int, forma text, valor_centavos int, parcelas int,
            instituicao text, bandeira text, data date, vencimento_boleto date,
            boleto_concluido boolean, lote_id text
        )
        returning *
    )
    select coalesce(jsonb_agg(to_jsonb(n) order by n.ordem, n.id), '[]'::jsonb) into v_pagamentos from novos n;

    return jsonb_build_object('pedido_itens', v_itens, 'pedido_pagamentos', v_pagamentos);
end;
$$;

grant execute on function public.salvar_itens_pagamentos(bigint, jsonb, jsonb) to authenticated;


-- Mesmo problema, mesmo remédio, para os itens de orçamento formalizado.
create or replace function public.salvar_itens_orcamento(
    p_orcamento_id bigint,
    p_itens jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_itens jsonb;
begin
    delete from public.orcamento_itens where orcamento_id = p_orcamento_id;

    with novos as (
        insert into public.orcamento_itens (
            orcamento_id, produto_id, ordem, nome, descricao,
            valor_centavos, valor_original_centavos, desconto_percentual, local_producao
        )
        select p_orcamento_id, x.produto_id, coalesce(x.ordem, 0), x.nome, x.descricao,
               coalesce(x.valor_centavos, 0), x.valor_original_centavos, x.desconto_percentual,
               x.local_producao
        from jsonb_to_recordset(coalesce(p_itens, '[]'::jsonb)) as x(
            produto_id bigint, ordem int, nome text, descricao text,
            valor_centavos int, valor_original_centavos int, desconto_percentual numeric,
            local_producao text
        )
        returning *
    )
    select coalesce(jsonb_agg(to_jsonb(n) order by n.ordem, n.id), '[]'::jsonb) into v_itens from novos n;

    return v_itens;
end;
$$;

grant execute on function public.salvar_itens_orcamento(bigint, jsonb) to authenticated;
