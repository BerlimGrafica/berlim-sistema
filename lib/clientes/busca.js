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
