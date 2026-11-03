import { supabase } from '@/lib/supabaseClient';
import { valorDoFiltro } from '@/lib/utils/busca';

// Como a tela de equipamentos lê os registros sem trazer a tabela inteira
// (ver supabase/equipamentos_historico_sob_demanda_migration.sql):
//
// - o RESUMO: só os registros que o quadro de máquinas, a gaveta e o formulário
//   usam (os recentes de cada máquina, a última e a penúltima carga de cada
//   tinta...). As contas de lib/equipamentos/historico.js continuam valendo
//   sobre ele.
// - o HISTÓRICO: uma página por vez, com os filtros feitos no banco e o
//   rendimento de cada carga já calculado lá (a carga anterior pode estar numa
//   página que não foi lida).
//
// Enquanto a migração não rodar, as duas caem na leitura antiga, da tabela, em
// vez de deixar a tela vazia.

// "Função/relação não encontrada", no Postgres e no PostgREST.
const NAO_EXISTE = new Set(['42883', 'PGRST202', '42P01', 'PGRST205']);
export const POR_PAGINA = 50;

export async function buscarResumo() {
    const { data, error } = await supabase.rpc('equipamentos_resumo');
    if (!error) return { registros: data || [] };
    if (!NAO_EXISTE.has(error.code)) return { erro: error };
    console.warn('Resumo de equipamentos indisponível — rode supabase/equipamentos_historico_sob_demanda_migration.sql no SQL Editor do Supabase. Até lá, a tela lê a tabela inteira.');
    const antigo = await supabase.from('equipamento_registros').select('*')
        .order('data', { ascending: false }).order('id', { ascending: false });
    return antigo.error ? { erro: antigo.error } : { registros: antigo.data || [] };
}

// Quantos registros existem, para o número da aba: só a contagem, sem linhas.
export async function contarRegistros() {
    const { count } = await supabase.from('equipamento_registros').select('id', { count: 'exact', head: true });
    return count ?? 0;
}

// Um valor ou uma lista de valores vira sempre lista (vazia = sem filtro).
const lista = v => (v == null ? [] : Array.isArray(v) ? v : [v]).filter(x => x != null && x !== '');

// Os filtros do histórico. Cada um aceita um valor ou vários (vale qualquer um
// deles); entre filtros, todos. Cor: a carga que tem qualquer das tintas.
// Técnico "Equipe" é a manutenção sem técnico de fora.
// Síncrona de propósito: a consulta do Supabase é "thenable", e devolvê-la de
// uma função async faria o await executá-la ali mesmo.
function filtrar(q, { equipamento, tipo, cor, tecnico } = {}) {
    const maquinas = lista(equipamento), tipos = lista(tipo), cores = lista(cor), tecnicos = lista(tecnico);
    if (maquinas.length) q = q.in('equipamento', maquinas);
    if (tipos.length) q = q.in('tipo', tipos);
    if (cores.length) q = q.overlaps('cores', cores);
    if (tecnicos.length) {
        const deFora = tecnicos.filter(t => t !== 'Equipe');
        const partes = [];
        if (deFora.length) partes.push(`tecnico_nome.in.(${deFora.map(valorDoFiltro).join(',')})`);
        if (tecnicos.includes('Equipe')) partes.push(`and(tipo.eq.${valorDoFiltro('Manutenção')},tecnico_nome.is.null)`);
        q = q.or(partes.join(','));
    }
    return q;
}

// Uma página do histórico, do mais recente para o mais antigo, a partir de `de`.
export async function buscarHistorico(filtros, de = 0) {
    const pagina = fonte => filtrar(supabase.from(fonte).select('*', { count: 'exact' }), filtros)
        .order('data', { ascending: false }).order('id', { ascending: false })
        .range(de, de + POR_PAGINA - 1);
    let { data, count, error } = await pagina('equipamento_registros_hist');
    // Sem a vista: a tabela, sem o rendimento pronto (a tela calcula com o que tem).
    if (error && NAO_EXISTE.has(error.code)) ({ data, count, error } = await pagina('equipamento_registros'));
    if (error) return { erro: error };
    return { registros: data || [], total: count ?? (data || []).length };
}
