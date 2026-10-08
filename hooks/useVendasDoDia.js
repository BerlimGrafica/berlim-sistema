"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Detalha um dia da série "Por dia" do painel de Vendas.
//
// O RECORTE TEM DE SER O MESMO DA BARRA
// O número que a barra mostra vem de `serie_dia`, em
// supabase/metricas_vendas_migration.sql: soma de `valor_total` dos pedidos
// agrupados por `data_pedido`, com os cancelados de fora e sem recorte de
// período. Esta consulta repete exatamente esse recorte — data, filtro de
// status e campo somado. Se divergir, o modal exibe um total diferente do da
// barra que o abriu, e aí não dá para confiar em nenhum dos dois números.
//
// A busca é feita aqui, e não dentro de metricas_vendas, por dois motivos: o
// detalhe só interessa quando alguém clica num dia (carregar os quinze de uma
// vez seria trazer centenas de pedidos para nada), e assim o recurso não
// depende de rodar uma migração nova no banco.
//
// Vem junto o que foi pago de verdade. Um pedido pode valer R$ 800 e ter só
// R$ 300 lançados — a barra conta os R$ 800, porque ela mede venda, não caixa.
// Mostrar os dois lado a lado é o que transforma a lista num relatório: dá para
// ver, no mesmo lugar, quanto o dia vendeu e quanto ainda não entrou.

const CANCELADOS = '("Cancelado","Cancelada")';

const CAMPOS = `
    id, cliente, cliente_id, servico, valor_total, status, responsavel, local_producao,
    pedido_itens ( nome, descricao, valor_centavos, ordem ),
    pedido_pagamentos ( forma, valor_centavos, parcelas, instituicao, bandeira )
`;

export function useVendasDoDia(dia) {
    // O dia viaja junto do resultado para "carregando" ser derivado — o que está
    // na tela ainda não é o dia pedido — em vez de um setState solto no efeito.
    // Mesmo arranjo de hooks/useMetricasVendas.js.
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        if (!dia) return;
        let ativo = true;

        supabase
            .from('pedidos')
            .select(CAMPOS)
            .eq('data_pedido', dia)
            .not('status', 'in', CANCELADOS)
            .order('valor_total', { ascending: false })
            .then(({ data, error }) => {
                if (!ativo) return;
                setResultado({
                    dia,
                    pedidos: error ? null : (data ?? []),
                    erro: error ? error.message : null,
                });
            });

        return () => { ativo = false; };
    }, [dia]);

    const carregando = !resultado || resultado.dia !== dia;

    return {
        pedidos: resultado?.pedidos ?? null,
        carregando,
        erro: resultado?.erro ?? null,
    };
}
