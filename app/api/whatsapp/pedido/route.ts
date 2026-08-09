// GET /api/whatsapp/pedido?telefone=5511999999999
//
// Devolve o status do pedido mais recente daquele telefone, pra IA
// responder perguntas do tipo "cadê meu pedido".
//
// A tabela "pedidos" guarda o cliente só como nome em texto solto (sem
// vínculo por ID com "clientes" — ver comentário em context/AppContext.jsx
// perto de "clientes').select('*').ilike('nome', ...)"). Por isso a busca é
// em duas etapas: acha o cliente pelo telefone, depois acha o pedido mais
// recente com esse nome.

import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/whatsapp-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

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
  const { data: cliente } = await admin
    .from('clientes')
    .select('nome')
    .ilike('telefone', `%${digitos.slice(-8)}%`)
    .limit(1)
    .maybeSingle();

  if (!cliente) {
    return NextResponse.json({ encontrado: false });
  }

  const { data: pedido } = await admin
    .from('pedidos')
    .select('status, prazo, servico')
    .ilike('cliente', cliente.nome.trim())
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ encontrado: false });
  }

  return NextResponse.json({
    encontrado: true,
    status: pedido.status, // ex: "Produzir", "Impressão", "Retirada", "Concluído"
    previsaoEntrega: pedido.prazo,
    descricao: pedido.servico,
  });
}
