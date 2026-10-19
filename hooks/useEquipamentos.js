"use client";
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// As máquinas cadastradas — em uso e arquivadas. As arquivadas vêm junto
// porque o histórico continua mostrando os registros delas, com o nome certo.
//
// Só o administrador cadastra; a equipe altera (a RLS garante as duas regras —
// ver equipamentos_edicao_equipe_migration.sql). As funções abaixo conferem o que
// voltou do banco porque, sob RLS, uma gravação sem permissão não dá erro —
// simplesmente não grava nada.

const TABELA_AUSENTE = new Set(['42P01', 'PGRST205']);
const SEM_PERMISSAO_CADASTRO = 'Só um administrador pode cadastrar máquinas.';
const SEM_PERMISSAO = 'Seu usuário não tem permissão para alterar as máquinas.';

const porOrdem = (a, b) => (a.ordem - b.ordem) || (a.id - b.id);

function mensagemDeErro(error) {
    if (error.code === '23505') return 'Já existe outra máquina em uso com esse nome.';
    return error.message;
}

export function useEquipamentos() {
    const [estado, setEstado] = useState({ equipamentos: null, erro: null, indisponivel: false });

    useEffect(() => {
        let ativo = true;
        supabase
            .from('equipamentos')
            .select('*')
            .then(({ data, error }) => {
                if (!ativo) return;
                if (error) {
                    const indisponivel = TABELA_AUSENTE.has(error.code);
                    if (indisponivel) {
                        console.warn('Máquinas indisponíveis — rode supabase/equipamentos_migration.sql no SQL Editor do Supabase.');
                    }
                    setEstado({ equipamentos: [], erro: indisponivel ? null : error.message, indisponivel });
                    return;
                }
                setEstado({ equipamentos: (data ?? []).sort(porOrdem), erro: null, indisponivel: false });
            });
        return () => { ativo = false; };
    }, []);

    const trocar = (atualizado) => setEstado(e => ({
        ...e,
        equipamentos: (e.equipamentos || []).map(x => (x.id === atualizado.id ? atualizado : x)).sort(porOrdem),
    }));

    // Máquina nova entra no fim do grupo dela.
    const criar = useCallback(async (dados) => {
        const doGrupo = (estado.equipamentos || []).filter(e => e.tipo === dados.tipo);
        const ordem = doGrupo.reduce((m, e) => Math.max(m, e.ordem), 0) + 1;
        const { data, error } = await supabase.from('equipamentos').insert([{ ...dados, ordem }]).select().single();
        if (error) return { erro: error.code === '42501' ? SEM_PERMISSAO_CADASTRO : mensagemDeErro(error) };
        setEstado(e => ({ ...e, equipamentos: [...(e.equipamentos || []), data].sort(porOrdem) }));
        return { equipamento: data };
    }, [estado.equipamentos]);

    const atualizar = useCallback(async (id, dados) => {
        const { data, error } = await supabase.from('equipamentos').update(dados).eq('id', id).select();
        if (error) return { erro: mensagemDeErro(error) };
        if (!data?.length) return { erro: SEM_PERMISSAO };
        trocar(data[0]);
        return { equipamento: data[0] };
    }, []);

    const arquivar = useCallback((id) => atualizar(id, { arquivado_em: new Date().toISOString() }), [atualizar]);
    const restaurar = useCallback((id) => atualizar(id, { arquivado_em: null }), [atualizar]);

    // A tela já mostra a ordem nova antes da resposta: arrastar e esperar o
    // banco para ver o card assentar pareceria travado. Se o banco recusar, a
    // ordem anterior volta.
    const reordenar = useCallback(async (ids) => {
        const anterior = estado.equipamentos;
        const posicao = new Map(ids.map((id, i) => [id, i + 1]));
        setEstado(e => ({
            ...e,
            equipamentos: (e.equipamentos || []).map(x => (posicao.has(x.id) ? { ...x, ordem: posicao.get(x.id) } : x)).sort(porOrdem),
        }));
        const { error } = await supabase.rpc('reordenar_equipamentos', { ids });
        if (error) {
            setEstado(e => ({ ...e, equipamentos: anterior }));
            return { erro: error.message };
        }
        return {};
    }, [estado.equipamentos]);

    return {
        equipamentos: estado.equipamentos ?? [],
        carregando: estado.equipamentos === null,
        erro: estado.erro,
        indisponivel: estado.indisponivel,
        criar,
        atualizar,
        arquivar,
        restaurar,
        reordenar,
    };
}
