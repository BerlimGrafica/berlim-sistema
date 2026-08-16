// GET /api/whatsapp/catalogo
//
// Devolve os produtos cadastrados em "Cadastros > Produtos" — a mesma lista
// que já é usada para montar O.S. e orçamentos no sistema. Só cadastre ali
// os itens "padronizados" que a IA pode cotar sozinha, sem precisar de um
// humano; o resto ela recolhe os dados e manda pra fila via /orcamento.

import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/whatsapp-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { centavosParaReais } from '@/lib/utils/formatters';

export async function GET(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: produtos, error } = await admin
    .from('produtos') .select('nome, texto_padrao, preco_base') .order('ordem', { ascending: true });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const catalogo = (produtos || []).map((p) => ({
    nome: p.nome,
    descricao: p.texto_padrao,
    precoBase: `R$ ${centavosParaReais(p.preco_base).toFixed(2).replace('.', ',')}`,
  }));

  return NextResponse.json({ produtos: catalogo });
}
