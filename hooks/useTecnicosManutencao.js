"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Os técnicos que podem constar numa manutenção: os fornecedores do tipo
// Manutenção (Cadastros › Fornecedores / Locais).
//
// Vêm da vista fornecedores_manutencao_nomes, e não da tabela de
// fornecedores: a tabela só é lida por Administrador e Financeiro, e quem
// registra a manutenção é a Produção. A vista expõe só id e nome. Ver
// supabase/equipamentos_manutencao_tecnico_migration.sql.
//
// Sem a vista (migração ainda não rodada) a lista vem vazia e a manutenção
// continua podendo ser registrada como feita pela equipe.
export function useTecnicosManutencao() {
    const [tecnicos, setTecnicos] = useState([]);

    useEffect(() => {
        let ativo = true;
        supabase
            .from('fornecedores_manutencao_nomes')
            .select('id, nome')
            .order('nome', { ascending: true })
            .then(({ data, error }) => {
                if (!ativo) return;
                if (error) {
                    console.warn('Técnicos indisponíveis — rode supabase/equipamentos_manutencao_tecnico_migration.sql no SQL Editor do Supabase.', error.message);
                    return;
                }
                setTecnicos(data ?? []);
            });
        return () => { ativo = false; };
    }, []);

    return tecnicos;
}
