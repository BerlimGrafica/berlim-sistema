// POST /api/whatsapp/orcamento
//
// Cria um orçamento/lead com o que a IA coletou na conversa do WhatsApp.
// Body esperado (JSON):
// { nomeCliente, telefone, tipoPeca, quantidade, tamanho, material, prazo, temArte }
//
// Grava direto na tabela "orcamentos_formalizados" (a mesma da aba
// Orçamentos do sistema), com valor 0 — quem vai calcular e confirmar o
// preço é um humano na aba Orçamentos, não a IA.

import { NextResponse } from 'next/server';
import { checkApiKey } from '@/lib/whatsapp-auth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 });
  }

  const dados = await req.json();
  const { nomeCliente, telefone, tipoPeca, quantidade, tamanho, material, prazo, temArte, alertaArte, simulado } = dados;

  if (!telefone || !tipoPeca) {
    return NextResponse.json(
      { erro: 'telefone e tipoPeca são obrigatórios' },
      { status: 400 }
    );
  }

  const partesDescricao = [
    tamanho ? `Tamanho: ${tamanho}` : null,
    material ? `Material: ${material}` : null,
    prazo ? `Prazo desejado: ${prazo}` : null,
    temArte != null ? `Arte pronta: ${temArte ? 'sim' : 'não'}` : null,
  ].filter(Boolean);

  const observacoes = [
    'Recebido via agente de IA do WhatsApp — falta calcular e confirmar com o cliente.',
    alertaArte ? `⚠️ Revisar arte antes de produzir: ${alertaArte}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  // Modo de teste (usado pelo sandbox de validação em /whatsapp-sandbox): valida
  // os dados normalmente, mas não grava nada de verdade no Supabase.
  if (simulado) {
    return NextResponse.json({
      criado: true,
      id: null,
      simulado: true,
      preview: {
        cliente: nomeCliente || 'Cliente WhatsApp',
        telefone,
        produto: tipoPeca,
        descricao: partesDescricao.join('\n'),
        quantidade: quantidade || 1,
        observacoes,
      },
    });
  }

  const admin = getSupabaseAdmin();
  const { data: orcamento, error } = await admin
    .from('orcamentos_formalizados')
    .insert([{
      cliente: nomeCliente || 'Cliente WhatsApp',
      telefone,
      produto: tipoPeca,
      descricao: partesDescricao.join('\n'),
      quantidade: quantidade || 1,
      valor: 0,
      observacoes,
      criado_por: 'IA WhatsApp',
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ criado: true, id: orcamento.id });
}
