"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Busca as métricas do painel de Vendas já somadas no banco, para um período
// explícito (ver supabase/metricas_vendas_migration.sql). Antes disso, cada
// número era recalculado em JavaScript a cada renderização, sobre a lista de
// pedidos que estivesse em memória — que é uma janela de carregamento, não um
// período de negócio.
//
// Uma chamada serve os três painéis da aba (Visão Geral, Produto, Cliente):
// quem faz a chamada é o VendasTab, e o resultado desce por props.
export function useMetricasVendas(inicio, fim, gatilho) {
    // Guarda junto o período a que o resultado pertence: assim "carregando" é
    // derivado (o que está na tela ainda não é o período pedido), em vez de um
    // setState disparado dentro do efeito.
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        if (!inicio || !fim) return;
        let ativo = true;

        supabase
            .rpc('metricas_vendas', { p_inicio: inicio, p_fim: fim })
            .then(({ data, error }) => {
                if (!ativo) return;
                setResultado(anterior => ({
                    inicio,
                    fim,
                    // Em caso de erro mantém o último resultado bom na tela, em vez
                    // de piscar zeros — que seriam lidos como "não vendemos nada".
                    dados: error ? (anterior?.dados ?? null) : data,
                    erro: error ? error.message : null,
                }));
            });

        return () => { ativo = false; };
    }, [inicio, fim, gatilho]);

    // Uma rebusca disparada pelo tempo real (mesmo período) não acende o
    // indicador: é atualização de fundo, não espera do usuário.
    const carregando = !resultado || resultado.inicio !== inicio || resultado.fim !== fim;

    return { metricas: resultado?.dados ?? null, carregando, erro: resultado?.erro ?? null };
}
