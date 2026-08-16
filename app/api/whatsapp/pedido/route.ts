// GET /api/whatsapp/pedido?telefone=5511999999999
//
// Devolve o status do pedido mais recente daquele telefone, pra IA
// responder perguntas do tipo "cadê meu pedido".
//
// Casa o pedido por cliente_id, nunca pelo nome do cliente: o cadastro tem
// dezenas de homônimos (12 "Vanessa", 13 "Silvana"), e casar por nome fazia
// esta rota devolver o pedido de outra pessoa para quem perguntasse. Cliente
// sem vínculo (venda de balcão) simplesmente não é encontrado aqui — melhor
// não achar do que achar errado.
//
// A resposta leva só o que o cliente pode saber sobre o próprio pedido:
// status, prazo e o resumo dos itens. Nunca os pagamentos.

import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/whatsapp-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { resumoDoPedido } from '@/lib/utils/servico';

export async function GET(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const telefone = searchParams.get('telefone');

  if (!telefone) {
    return NextResponse.json({ erro: 'informe o parâmetro telefone' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const digitos = telefone.replace(/\D/g, '');
  // Compara na coluna de dígitos, não na `telefone` formatada: "(11)98467-4562"
  // não contém "84674562" porque o hífen fica no meio do trecho — a busca
  // antiga não achava nenhum cliente, nem celular.
  const { data: clientes } = await admin
    .from('clientes') .select('id, nome') .ilike('telefone_digits', `%${digitos.slice(-8)}%`)
    .limit(2);

  // Nenhum cadastro com esse telefone, ou mais de um (números diferentes que
  // terminam nos mesmos 8 dígitos). No segundo caso, escolher um seria chutar
  // entre duas pessoas — a IA deve pedir confirmação em vez de arriscar.
  if (!clientes || clientes.length !== 1) {
    return NextResponse.json({ encontrado: false });
  }
  const cliente = clientes[0];

  const { data: pedido } = await admin
    .from('pedidos') .select('id, status, prazo, pedido_itens(nome, ordem)') .eq('cliente_id', cliente.id) .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ encontrado: false });
  }

  return NextResponse.json({
    encontrado: true,
    numeroOS: pedido.id,
    status: pedido.status, // ex: "Produzir", "Impressão", "Retirada", "Concluído"
    previsaoEntrega: pedido.prazo,
    descricao: resumoDoPedido(pedido),
  });
}
