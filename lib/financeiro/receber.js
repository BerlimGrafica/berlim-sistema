import { supabase } from '@/lib/supabaseClient';

// Contas a receber lidas prontas do banco: uma linha por O.S. que ainda tem
// dinheiro para entrar, com total, recebido, em boleto e saldo já somados
// (ver supabase/contas_receber_migration.sql). Só as colunas que a tela usa.
//
// Enquanto a migração não rodar, cai numa leitura enxuta da tabela de pedidos
// (sem itens inteiros, só o nome) e faz a mesma conta aqui, em vez de deixar a
// tela vazia.

// "Relação não encontrada", no Postgres e no PostgREST.
const NAO_EXISTE = new Set(['42P01', 'PGRST205', 'PGRST200']);

const CAMPOS = 'id, cliente, cliente_id, status, data_pedido, prazo, data_retirada, boleto_vence, total, recebido, em_boleto, saldo, ultimo_pagamento, formas, n_itens, itens';

// O período é a data do pedido, filtrado no banco. Junto vem só a CONTAGEM das
// O.S. a receber de antes do período: a tela avisa que elas existem sem baixá-las.
// Síncrona de propósito: a consulta do Supabase é "thenable", e devolvê-la de
// uma função async faria o await executá-la ali mesmo.
function noPeriodo(q, { de, ate } = {}) {
    if (de) q = q.gte('data_pedido', de);
    if (ate) q = q.lte('data_pedido', ate);
    return q;
}

// Com `ids`, só essas O.S. (o tempo real avisou que mudaram): a tela troca as
// linhas delas e o resto da lista fica como está.
const soEstas = (q, ids) => (ids ? q.in('id', ids) : q);

export async function buscarContasReceber(periodo = {}, ids = null) {
    const [{ data, count, error }, antes] = await Promise.all([
        soEstas(noPeriodo(supabase.from('contas_receber').select(CAMPOS, { count: 'exact' }), periodo), ids).order('id', { ascending: true }),
        periodo.de
            ? supabase.from('contas_receber').select('id', { count: 'exact', head: true }).lt('data_pedido', periodo.de)
            : Promise.resolve({ count: 0 }),
    ]);
    if (!error) return { lista: data || [], total: count ?? (data || []).length, antes: antes.count ?? 0 };
    if (!NAO_EXISTE.has(error.code)) return { erro: error };
    console.warn('Vista contas_receber indisponível — rode supabase/contas_receber_migration.sql no SQL Editor do Supabase. Até lá, a tela soma no navegador.');
    return lerDaTabela(periodo, ids);
}

const boletoEmAberto = pg => pg.forma === 'Boleto' && pg.boleto_concluido !== true;

// Sem a vista não dá para contar "as de antes" sem baixá-las: fica sem o aviso.
async function lerDaTabela(periodo, ids) {
    const { data, error } = await soEstas(noPeriodo(supabase.from('pedidos')
        .select('id, cliente, cliente_id, status, data_pedido, prazo, data_retirada, prazo_pagamento, valor_total, pedido_pagamentos ( forma, valor_centavos, boleto_concluido, vencimento_boleto, data ), pedido_itens ( nome, ordem )')
        .not('status', 'in', '("Abandonado","Cancelado")'), periodo), ids)
        .order('id', { ascending: true });
    if (error) return { erro: error };
    const lista = (data || []).map(p => {
        const pgs = p.pedido_pagamentos || [];
        const recebido = pgs.reduce((s, pg) => s + (boletoEmAberto(pg) ? 0 : (pg.forma === 'Estorno' ? -1 : 1) * pg.valor_centavos), 0);
        const emBoleto = pgs.reduce((s, pg) => s + (boletoEmAberto(pg) ? pg.valor_centavos : 0), 0);
        const vencs = pgs.filter(boletoEmAberto).map(pg => pg.vencimento_boleto).filter(Boolean).sort();
        const datas = pgs.filter(pg => !boletoEmAberto(pg) && pg.forma !== 'Estorno').map(pg => pg.data).filter(Boolean).sort();
        const itens = (p.pedido_itens || []).slice().sort((a, b) => a.ordem - b.ordem);
        const total = p.valor_total || 0;
        return {
            id: p.id, cliente: p.cliente, cliente_id: p.cliente_id, status: p.status,
            data_pedido: p.data_pedido, prazo: p.prazo, data_retirada: p.data_retirada,
            boleto_vence: p.prazo_pagamento || vencs[0] || null,
            total, recebido, em_boleto: emBoleto, saldo: Math.max(total - recebido - emBoleto, 0),
            ultimo_pagamento: datas.at(-1) || null,
            formas: [...new Set(pgs.filter(pg => pg.forma !== 'Estorno').map(pg => pg.forma))],
            n_itens: itens.length,
            itens: itens.map(i => (i.nome || '').trim() || 'Item').join(' · ').slice(0, 200),
        };
    }).filter(o => o.total - o.recebido > 0 && (o.status !== 'Finalizado' || o.em_boleto > 0));
    return { lista, total: lista.length, antes: 0 };
}

