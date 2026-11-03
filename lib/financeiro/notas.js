import { supabase } from '@/lib/supabaseClient';

// As notas fiscais já concluídas, por período (dia em que o cliente pediu a
// nota), filtradas no banco. As pendentes a tela tira da memória: são poucas e
// o sistema já as usa nos alertas. O histórico de concluídas só cresce, e não
// precisa vir inteiro para ninguém.

const CAMPOS = 'id, cliente, razao_social, cnpj, contato, forma_envio, tipo_nota, servico_feito, valor_pago, observacoes, observacao_cliente, forma_pagamento, forma_transporte, endereco, created_at, concluido';
// O dia do pedido é o de Brasília: created_at é um instante, e às 22h de lá já
// é o dia seguinte em UTC.
const FUSO = '-03:00';

export async function buscarNotasConcluidas({ de, ate } = {}) {
    let q = supabase.from('notas_fiscais').select(CAMPOS, { count: 'exact' }).eq('concluido', true);
    if (de) q = q.gte('created_at', `${de}T00:00:00${FUSO}`);
    if (ate) q = q.lte('created_at', `${ate}T23:59:59.999${FUSO}`);
    const { data, count, error } = await q.order('created_at', { ascending: false }).limit(500);
    if (error) return { erro: error };
    return { lista: data || [], total: count ?? (data || []).length };
}
