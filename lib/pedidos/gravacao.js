import { supabase } from '@/lib/supabaseClient';
import { paraCentavos } from '@/lib/utils/formatters';

// Camada de gravação das linhas filhas de O.S. e de orçamento.
//
// Fica fora do AppContext de propósito: é a tradução entre o carrinho do modal
// (valores como texto no formato brasileiro) e as tabelas (centavos inteiros),
// mais a chamada das funções transacionais do banco. Nada aqui conhece React,
// avisos na tela ou estado — quem chama decide o que dizer ao usuário.
//
// Todas devolvem { erro } em caso de falha. Como a troca acontece dentro de uma
// transação no Postgres (ver supabase/gravacao_transacional_migration.sql), erro
// significa literalmente "nada mudou": as linhas antigas continuam lá.

// Carrinho -> linhas de pedido_itens / orcamento_itens. A posição no array é a
// ordem; o campo "concluido" é ignorado pelo orçamento, que não tem essa coluna.
export function carrinhoParaLinhasItens(itens) {
    return itens.map((i, idx) => ({
        produto_id: i.id_produto || null,
        ordem: idx,
        nome: i.nome || null,
        descricao: i.descricao || null,
        valor_centavos: paraCentavos(i.valor),
        valor_original_centavos: i.valor_original ? paraCentavos(i.valor_original) : null,
        desconto_percentual: i.desconto ? Number(i.desconto) : null,
        local_producao: i.local_producao || null,
        concluido: !!i.concluido,
    }));
}

// Carrinho -> linhas de pedido_pagamentos.
export function carrinhoParaLinhasPagamentos(pagamentos) {
    return pagamentos.map((p, idx) => ({
        ordem: idx,
        forma: p.forma || 'Indefinido',
        valor_centavos: paraCentavos(p.valor),
        parcelas: p.parcelas ?? null,
        instituicao: p.instituicao || null,
        bandeira: p.bandeira || null,
        data: p.data || null,
        vencimento_boleto: p.vencimento_boleto || null,
        boleto_concluido: p.boleto_concluido ?? null,
        lote_id: p.lote_id || null,
    }));
}

// Substitui itens e pagamentos de uma O.S. de uma vez só.
export async function gravarItensPagamentos(pedidoId, itens, pagamentos) {
    const { data, error } = await supabase.rpc('salvar_itens_pagamentos', {
        p_pedido_id: pedidoId,
        p_itens: carrinhoParaLinhasItens(itens),
        p_pagamentos: carrinhoParaLinhasPagamentos(pagamentos),
    });
    if (error) return { erro: error };
    return { pedido_itens: data?.pedido_itens || [], pedido_pagamentos: data?.pedido_pagamentos || [] };
}

// Copia os itens de uma O.S. para outra, sem pagamentos: a cópia é uma O.S.
// nova, ainda não paga. As linhas de origem já vêm no formato das tabelas, então
// não passam pela conversão do carrinho.
export async function clonarItensParaPedido(pedidoDestinoId, itensOrigem) {
    const linhas = [...(itensOrigem || [])]
        .sort((a, b) => a.ordem - b.ordem)
        .map(item => ({
            produto_id: item.produto_id, ordem: item.ordem,
            nome: item.nome, descricao: item.descricao,
            valor_centavos: item.valor_centavos,
            valor_original_centavos: item.valor_original_centavos,
            desconto_percentual: item.desconto_percentual,
            local_producao: item.local_producao,
            concluido: item.concluido,
        }));

    const { data, error } = await supabase.rpc('salvar_itens_pagamentos', {
        p_pedido_id: pedidoDestinoId, p_itens: linhas, p_pagamentos: [],
    });
    if (error) return { erro: error };
    return { pedido_itens: data?.pedido_itens || [] };
}

// Substitui os itens de um orçamento formalizado.
export async function gravarItensOrcamento(orcamentoId, itens) {
    const { data, error } = await supabase.rpc('salvar_itens_orcamento', {
        p_orcamento_id: orcamentoId,
        p_itens: carrinhoParaLinhasItens(itens),
    });
    if (error) return { erro: error };
    return { orcamento_itens: data || [] };
}
