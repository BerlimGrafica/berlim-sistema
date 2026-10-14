"use client";
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Os registros de reabastecimento e manutenção das máquinas.
//
// A tabela é pequena — algumas linhas por máquina por mês — e a tela precisa
// dela inteira para calcular a idade de cada tinta e o rendimento de cada
// carga, então ela vem toda de uma vez. Fica num hook próprio, fora do
// AppContext: só esta tela usa, e carregar na abertura do sistema para todo
// mundo seria pagar por um dado que a maioria nunca abre.

// A tabela ainda não existe enquanto a migração não for rodada. Os dois códigos
// são o do Postgres e o do PostgREST para "relação não encontrada".
const TABELA_AUSENTE = new Set(['42P01', 'PGRST205']);

export function useRegistrosEquipamentos() {
    const [estado, setEstado] = useState({ registros: null, erro: null, indisponivel: false });

    useEffect(() => {
        let ativo = true;
        supabase
            .from('equipamento_registros')
            .select('*')
            .order('data', { ascending: false })
            .order('id', { ascending: false })
            .then(({ data, error }) => {
                if (!ativo) return;
                if (error) {
                    const indisponivel = TABELA_AUSENTE.has(error.code);
                    if (indisponivel) {
                        console.warn('Registros de equipamentos indisponíveis — rode supabase/equipamentos_migration.sql no SQL Editor do Supabase.');
                    }
                    setEstado({ registros: [], erro: indisponivel ? null : error.message, indisponivel });
                    return;
                }
                setEstado({ registros: data ?? [], erro: null, indisponivel: false });
            });
        return () => { ativo = false; };
    }, []);

    // `criado_por` não vai na entrada: o banco preenche com quem está logado, e a
    // política de insert recusa qualquer outro valor.
    const registrar = useCallback(async (entrada) => {
        const { data, error } = await supabase
            .from('equipamento_registros')
            .insert([entrada])
            .select()
            .single();
        if (error) return { erro: error.message };
        setEstado(e => ({ ...e, registros: [data, ...(e.registros || [])] }));
        return { registro: data };
    }, []);

    // `.select()` no delete é o que revela a recusa: sob RLS, apagar um registro
    // de outra pessoa não dá erro — simplesmente não apaga nada. Sem conferir o
    // que voltou, a linha sumiria da tela e reapareceria no próximo carregamento.
    const apagar = useCallback(async (id) => {
        const { data, error } = await supabase
            .from('equipamento_registros')
            .delete()
            .eq('id', id)
            .select('id');
        if (error) return { erro: error.message };
        if (!data?.length) return { erro: 'Só quem lançou o registro, ou um administrador, pode apagá-lo.' };
        setEstado(e => ({ ...e, registros: (e.registros || []).filter(r => r.id !== id) }));
        return {};
    }, []);

    return {
        registros: estado.registros ?? [],
        carregando: estado.registros === null,
        erro: estado.erro,
        indisponivel: estado.indisponivel,
        registrar,
        apagar,
    };
}
