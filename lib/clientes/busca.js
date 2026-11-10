import { supabase } from '@/lib/supabaseClient';
import { apenasDigitos } from '@/lib/utils/formatters';
import { campoDeBusca, empresaNoBanco, valorDoFiltro } from '@/lib/utils/busca';

// Consultas de cliente usadas pelos dois modais de O.S. — o de hoje (via
// AppContext) e o novo (NovaOSPorCima) —, para os dois acharem e recusarem os
// mesmos clientes.

// Busca no banco o que foi digitado no campo de cliente: até 15, como sempre.
// Só dígitos e pontuação de telefone ("4457-6742", "(11) 99999") é busca por
// telefone, comparando dígito com dígito (coluna gerada telefone_digits):
// comparar com a coluna formatada falha por causa do hífen. O resto procura no
// nome e na empresa — quem atende ouve o nome da empresa tanto quanto o do
// contato —, sem acento quando a migração já rodou.
export async function buscarClientes(texto) {
    const digitado = String(texto ?? '');
    if (!digitado.trim()) return [];
    const digitos = apenasDigitos(digitado);
    const pareceTelefone = digitos.length >= 3 && /^[\d\s().+-]+$/.test(digitado.trim());
    let query = supabase.from('clientes').select('*').limit(15);
    if (pareceTelefone) {
        query = query.ilike('telefone_digits', `%${digitos}%`);
    } else {
        const { coluna, termo } = await campoDeBusca(supabase, 'nome', digitado);
        const empresa = await campoDeBusca(supabase, 'empresa', digitado.trim());
        query = await empresaNoBanco(supabase)
            ? query.or(`${coluna}.ilike.${valorDoFiltro(`%${termo}%`)},${empresa.coluna}.ilike.${valorDoFiltro(`%${empresa.termo}%`)}`)
            : query.ilike(coluna, `%${termo}%`);
    }
    const { data } = await query;
    return data || [];
}

// Uma página da lista de clientes do cadastro, filtrada NO BANCO (são milhares:
// baixar tudo para filtrar aqui estouraria o limite de 1.000 linhas e o
// tráfego). Usada pela tela de Cadastros de hoje e pelo protótipo novo, para as
// duas acharem os mesmos clientes.
// - letra: o começo do nome, pela coluna sem acento ("Ângela" cai no A).
// - busca: dígitos e pontuação de telefone vão para a coluna de dígitos; o
//   resto procura no nome, no e-mail e na empresa, sem acento.
// - soProblema: só os marcados como cliente com pendência.
export async function buscarCadastroClientes({ busca = '', letra = '', soProblema = false, pagina = 1, porPagina = 50 } = {}) {
    let query = supabase.from('clientes').select('*', { count: 'exact' });
    if (soProblema) query = query.eq('cliente_problema', true);
    if (letra) {
        const { coluna, termo } = await campoDeBusca(supabase, 'nome', letra);
        query = query.ilike(coluna, `${termo}%`);
    }
    if (busca) {
        const digitos = apenasDigitos(busca);
        const pareceTelefone = digitos.length >= 3 && /^[\d\s().+-]+$/.test(busca.trim());
        if (pareceTelefone) {
            query = query.ilike('telefone_digits', `%${digitos}%`);
        } else {
            const nome = await campoDeBusca(supabase, 'nome', busca);
            const email = await campoDeBusca(supabase, 'email', busca);
            const filtros = [`${nome.coluna}.ilike.%${nome.termo}%`, `${email.coluna}.ilike.%${email.termo}%`];
            if (await empresaNoBanco(supabase)) {
                const empresa = await campoDeBusca(supabase, 'empresa', busca.trim());
                filtros.push(`${empresa.coluna}.ilike.${valorDoFiltro(`%${empresa.termo}%`)}`);
            }
            query = query.or(filtros.join(','));
        }
    }
    const de = (Math.max(1, pagina) - 1) * porPagina;
    const { data, count, error } = await query.order('nome', { ascending: true }).range(de, de + porPagina - 1);
    return { lista: data || [], total: count ?? null, erro: error || null };
}

// O cliente que já tem este WhatsApp, ou null. Os 8 últimos dígitos são o
// número sem DDD — pega tanto quem está gravado com DDD quanto sem. A busca vai
// na coluna de dígitos: procurar no texto formatado não achava a duplicata,
// porque o hífen fica no meio do trecho procurado. `idIgnorar` é o próprio
// cliente, quando se está editando um cadastro.
export async function acharTelefoneDuplicado(telefone, idIgnorar = null) {
    const telNormalizado = apenasDigitos(telefone);
    if (telNormalizado.length < 8) return null;
    const { data } = await supabase.from('clientes').select('id,nome,telefone').ilike('telefone_digits', `%${telNormalizado.slice(-8)}%`);
    return (data || []).find(c => {
        if (idIgnorar && c.id === idIgnorar) return false;
        if (!c.telefone) return false;
        const cTelNorm = c.telefone.replace(/\D/g, '');
        return cTelNorm.endsWith(telNormalizado) || telNormalizado.endsWith(cTelNorm);
    }) || null;
}
