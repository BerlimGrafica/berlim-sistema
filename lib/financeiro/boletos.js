import { supabase } from '@/lib/supabaseClient';
import { obterDataAtual } from '@/lib/utils/formatters';

// Os boletos da tela de Financeiro, lidos pelo lado do pagamento: uma linha
// por boleto, com só os campos da O.S. que a tela mostra. Nada de itens, nem de
// O.S. sem boleto.
//
// O período é o VENCIMENTO (pedidos.prazo_pagamento, o campo que a tela de hoje
// edita), filtrado no banco:
// - em aberto: os que vencem no período, mais os sem vencimento (não têm data
//   para cair em período nenhum, e são justamente os que precisam de atenção);
// - pagos: os que venciam no período;
// - e só a CONTAGEM dos vencidos de antes do período, para a tela avisar que
//   eles existem sem precisar baixá-los.

const CAMPOS = `
    id, valor_centavos, parcelas, instituicao, vencimento_boleto, boleto_concluido, data,
    pedidos!inner ( id, cliente, status, valor_total, prazo_pagamento, boleto_cnpj, boleto_numero, boleto_data_emissao, boleto_protesto_negativacao )
`;
const EM_ABERTO = 'boleto_concluido.is.null,boleto_concluido.eq.false';

// Síncronas de propósito: a consulta do Supabase é "thenable", e devolvê-la de
// uma função async faria o await executá-la ali mesmo.
function base(campos = CAMPOS, opcoes) {
    return supabase.from('pedido_pagamentos').select(campos, opcoes)
        .eq('forma', 'Boleto')
        .not('pedidos.status', 'in', '("Abandonado","Cancelado")');
}
function noPeriodo(q, { de, ate }) {
    if (de) q = q.gte('pedidos.prazo_pagamento', de);
    if (ate) q = q.lte('pedidos.prazo_pagamento', ate);
    return q;
}

export async function buscarBoletos(periodo = {}) {
    const { de, ate } = periodo;
    const faixa = [de && `prazo_pagamento.gte.${de}`, ate && `prazo_pagamento.lte.${ate}`].filter(Boolean);
    let abertos = base().or(EM_ABERTO);
    if (faixa.length) abertos = abertos.or(`prazo_pagamento.is.null,and(${faixa.join(',')})`, { referencedTable: 'pedidos' });
    // Vencidos de antes: vencimento antes do início do período e antes de hoje.
    const hoje = obterDataAtual();
    const limite = de && de < hoje ? de : hoje;
    const [a, p, antes] = await Promise.all([
        abertos.order('id', { ascending: true }),
        noPeriodo(base().eq('boleto_concluido', true), periodo).order('data', { ascending: false }),
        de ? base('id, pedidos!inner(id)', { count: 'exact', head: true }).or(EM_ABERTO).lt('pedidos.prazo_pagamento', limite)
            : Promise.resolve({ count: 0 }),
    ]);
    const erro = a.error || p.error;
    if (erro) return { erro };
    const lista = [...(a.data || []), ...(p.data || [])].map(b => {
        const pd = b.pedidos || {};
        return {
            id: b.id, os: pd.id, cliente: pd.cliente || '', status: pd.status || '', totalOS: pd.valor_total || 0,
            valor: b.valor_centavos || 0, parcelas: b.parcelas || 1, banco: b.instituicao || '',
            vence: pd.prazo_pagamento || b.vencimento_boleto || '',
            pago: b.boleto_concluido === true, pagoEm: b.boleto_concluido ? (b.data || '') : '',
            numero: pd.boleto_numero || '', emissao: pd.boleto_data_emissao || '', cnpj: pd.boleto_cnpj || '',
            protesto: !!pd.boleto_protesto_negativacao,
        };
    });
    return { lista, vencidosAntes: antes.count ?? 0 };
}
