import { supabase } from '@/lib/supabaseClient';

// As vezes em que uma rotina foi feita (supabase/tarefas_conclusoes_migration.sql).
// Lidas por período, só com a tela de Comunicação aberta: o de hoje para a
// lista de rotinas ("feita às 8:40, 2x") e o período escolhido em Concluídas.
//
// O dia é o de Brasília: "12/11" vai de 00:00 a 23:59 no horário daqui, que é
// como a pessoa conta o dia (o banco guarda em UTC).

const FUSO = '-03:00';
const POR_PAGINA = 1000;   // o teto do Supabase por consulta
const MAXIMO = 5000;       // "Todo o período" para de juntar aqui

// Uma linha do banco no formato da tela: o dia e a hora já no horário daqui.
function paraLinha(r) {
    const d = new Date(r.concluida_em);
    const local = new Date(d.getTime() - 3 * 3600e3);
    const iso = local.toISOString();
    return { id: r.id, tarefa: r.tarefa_id, dia: iso.slice(0, 10), hora: iso.slice(11, 16), por: r.concluida_por || '' };
}

// { de, ate } em 'AAAA-MM-DD' (um dos dois pode faltar; sem nenhum, tudo até
// MAXIMO). Devolve { lista, erro, cortado }: `cortado` diz que havia mais.
export async function buscarConclusoes({ de = '', ate = '' } = {}) {
    const lista = [];
    for (let p = 0; p < MAXIMO; p += POR_PAGINA) {
        let q = supabase.from('tarefas_conclusoes').select('id, tarefa_id, concluida_em, concluida_por')
            .order('concluida_em', { ascending: false }).order('id', { ascending: false });
        if (de) q = q.gte('concluida_em', `${de}T00:00:00${FUSO}`);
        if (ate) q = q.lte('concluida_em', `${ate}T23:59:59.999${FUSO}`);
        const { data, error } = await q.range(p, p + POR_PAGINA - 1);
        if (error) return { lista: [], erro: error };
        lista.push(...data.map(paraLinha));
        if (data.length < POR_PAGINA) return { lista, cortado: false };
    }
    return { lista, cortado: true };
}
