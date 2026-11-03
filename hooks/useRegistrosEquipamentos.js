"use client";
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { buscarResumo, contarRegistros } from '@/lib/equipamentos/consultas';

// Os registros de reabastecimento e manutenção que a tela de máquinas usa.
//
// Não é a tabela inteira: é o RESUMO (lib/equipamentos/consultas.js) — os
// registros recentes de cada máquina, a última e a penúltima carga de cada
// tinta, o último contador. É o que basta para a idade de cada tinta, o
// contador e o rendimento da última carga, por mais anos de histórico que
// existam. O histórico completo vem por outro caminho, em páginas e só quando é
// aberto (useHistoricoEquipamentos). `total` é quantos registros existem.
//
// Fica num hook próprio, fora do AppContext: só esta tela usa, e carregar na
// abertura do sistema seria pagar por um dado que a maioria nunca abre.

// A tabela ainda não existe enquanto a migração não for rodada. Os dois códigos
// são o do Postgres e o do PostgREST para "relação não encontrada".
const TABELA_AUSENTE = new Set(['42P01', 'PGRST205']);

// Lê o resumo e a contagem e devolve o estado do hook (sem tocar nele).
async function lerResumo() {
    const [resumo, total] = await Promise.all([buscarResumo(), contarRegistros()]);
    if (resumo.erro) {
        const indisponivel = TABELA_AUSENTE.has(resumo.erro.code);
        if (indisponivel) {
            console.warn('Registros de equipamentos indisponíveis — rode supabase/equipamentos_migration.sql no SQL Editor do Supabase.');
        }
        return { registros: [], total: 0, erro: indisponivel ? null : resumo.erro.message, indisponivel };
    }
    return { registros: resumo.registros, total, erro: null, indisponivel: false };
}

export function useRegistrosEquipamentos() {
    const [estado, setEstado] = useState({ registros: null, total: 0, erro: null, indisponivel: false });

    useEffect(() => {
        let ativo = true;
        lerResumo().then(novo => { if (ativo) setEstado(novo); });
        return () => { ativo = false; };
    }, []);

    // `criado_por` não vai na entrada: o banco preenche com quem está logado, e a
    // política de insert recusa qualquer outro valor. O registro novo é o mais
    // recente da máquina, então entra no resumo como está.
    const registrar = useCallback(async (entrada) => {
        const { data, error } = await supabase
            .from('equipamento_registros')
            .insert([entrada])
            .select()
            .single();
        if (error) return { erro: error.message };
        setEstado(e => ({ ...e, registros: [data, ...(e.registros || [])], total: e.total + 1 }));
        return { registro: data };
    }, []);

    // `.select()` no delete é o que revela a recusa: sob RLS, apagar um registro
    // de outra pessoa não dá erro — simplesmente não apaga nada. Sem conferir o
    // que voltou, a linha sumiria da tela e reapareceria no próximo carregamento.
    // Depois de apagar, o resumo é lido de novo: sem a última carga de uma
    // tinta, a anterior a ela volta a ser a que conta.
    const apagar = useCallback(async (id) => {
        const { data, error } = await supabase
            .from('equipamento_registros')
            .delete()
            .eq('id', id)
            .select('id');
        if (error) return { erro: error.message };
        if (!data?.length) return { erro: 'Só quem lançou o registro, ou um administrador, pode apagá-lo.' };
        setEstado(e => ({ ...e, registros: (e.registros || []).filter(r => r.id !== id), total: Math.max(0, e.total - 1) }));
        lerResumo().then(setEstado);
        return {};
    }, []);

    return {
        registros: estado.registros ?? [],
        total: estado.total,
        carregando: estado.registros === null,
        erro: estado.erro,
        indisponivel: estado.indisponivel,
        registrar,
        apagar,
    };
}
