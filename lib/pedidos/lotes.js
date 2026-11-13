import { supabase } from '@/lib/supabaseClient';

// Pagamento em lote: um pagamento só (um Pix de R$ 75,00) dividido entre
// várias O.S. Em pedido_pagamentos ele é uma linha por O.S., todas com o mesmo
// lote_id. Cada parte diz quanto aquela O.S. recebeu; o lote_id é o que deixa
// as telas mostrarem que elas são um pagamento só.
//
// Nada aqui conhece React nem avisos na tela, como lib/pedidos/gravacao.js.

// As partes de cada lote, para a tela dizer "parte de um pagamento de
// R$ 75,00, com a O.S. #102". Recebe os lote_id que estão à vista (os da O.S.
// aberta, os do dia do relatório) e busca só esses, só quando há algum.
//
// Devolve { [lote_id]: { total, forma, partes: [{ id, valor, status }] } },
// com valores em centavos e as partes na ordem do número da O.S. Um lote que
// ficou com uma parte só (a outra foi removida) não entra: virou um pagamento
// comum.
export async function buscarLotes(loteIds) {
    const ids = [...new Set((loteIds || []).filter(Boolean))];
    if (!ids.length) return {};
    const { data, error } = await supabase.from('pedido_pagamentos')
        .select('lote_id, pedido_id, valor_centavos, forma, pedidos ( status )')
        .in('lote_id', ids);
    if (error || !data) return {};

    const lotes = {};
    for (const linha of data) {
        const lote = lotes[linha.lote_id] ??= { total: 0, forma: linha.forma, partes: [] };
        lote.total += linha.valor_centavos || 0;
        const parte = lote.partes.find(p => p.id === linha.pedido_id);
        if (parte) parte.valor += linha.valor_centavos || 0;
        else lote.partes.push({ id: linha.pedido_id, valor: linha.valor_centavos || 0, status: linha.pedidos?.status || '' });
    }
    for (const [id, lote] of Object.entries(lotes)) {
        if (lote.partes.length < 2) delete lotes[id];
        else lote.partes.sort((a, b) => a.id - b.id);
    }
    return lotes;
}

// Grava todas as partes de um lote de uma vez (ou todas, ou nenhuma), pela
// função do banco em supabase/pagamento_lote_migration.sql.
//
// `partes` é [{ pedido_id, valor_centavos }]. Devolve { linhas } com o que foi
// inserido, { semFuncao: true } quando a função ainda não existe no banco (quem
// chama cai no caminho antigo, uma O.S. por vez) ou { erro }.
export async function gravarPagamentoLote(loteId, pagamento, partes) {
    const { data, error } = await supabase.rpc('registrar_pagamento_lote', {
        p_lote_id: loteId,
        p_pagamento: {
            forma: pagamento.forma || 'Indefinido',
            parcelas: pagamento.parcelas ?? null,
            instituicao: pagamento.instituicao || null,
            bandeira: pagamento.bandeira || null,
            data: pagamento.data || null,
            vencimento_boleto: pagamento.vencimento_boleto || null,
            boleto_concluido: pagamento.boleto_concluido ?? null,
        },
        p_partes: partes,
    });
    if (error) {
        // PGRST202: o PostgREST não achou a função (a migração não rodou).
        const semFuncao = error.code === 'PGRST202' || error.code === '42883';
        return semFuncao ? { semFuncao: true } : { erro: error };
    }
    return { linhas: data || [] };
}

// Tira das OUTRAS O.S. as partes de um lote (a da O.S. aberta sai pela própria
// O.S., ao salvar). Uma instrução só no banco: ou saem todas, ou nenhuma.
// Devolve { removidas: [{ id, pedido_id }] } ou { erro }.
export async function removerPartesDoLote(loteId, pedidoAtualId) {
    const { data, error } = await supabase.from('pedido_pagamentos')
        .delete()
        .eq('lote_id', loteId)
        .neq('pedido_id', pedidoAtualId)
        .select('id, pedido_id');
    if (error) return { erro: error };
    return { removidas: data || [] };
}

// Para as listas de O.S. com os pagamentos junto (o relatório do dia): põe em
// cada pagamento de lote `lote: { total, outras }` — de quanto foi o pagamento
// inteiro, em centavos, e os números das outras O.S. Os pagamentos precisam
// vir com lote_id. Uma busca a mais, e só quando a lista tem algum lote.
export async function anexarLotes(pedidos) {
    const lista = pedidos || [];
    const lotes = await buscarLotes(lista.flatMap(p => (p.pedido_pagamentos || []).map(g => g.lote_id)));
    if (!Object.keys(lotes).length) return lista;
    return lista.map(p => ({
        ...p,
        pedido_pagamentos: (p.pedido_pagamentos || []).map(g => {
            const lote = lotes[g.lote_id];
            const outras = lote ? lote.partes.filter(x => x.id !== p.id).map(x => x.id) : [];
            return outras.length ? { ...g, lote: { total: lote.total, outras } } : g;
        }),
    }));
}

// "a O.S. #102" ou "as O.S. #101 e #103", para as notas de lote.
export const asOutrasOS = ids => {
    const n = ids.map(id => `#${id}`);
    return n.length > 1 ? `as O.S. ${n.slice(0, -1).join(', ')} e ${n.at(-1)}` : `a O.S. ${n[0] || ''}`;
};
