"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { calcularPendencias, contarPorDestino, piorGravidade } from '@/lib/alertas/pendencias';
import { obterDataAtual } from '@/lib/utils/formatters';

// Casca de estado em volta de calcularPendencias(), que é pura.
//
// Três responsabilidades, e só:
//   1. recalcular quando os dados mudam (barato: filtros sobre listas em memória);
//   2. decidir o que é NOVO desde a última vez, para avisar uma vez só;
//   3. lembrar se o resumo de entrada já foi mostrado nesta sessão.
//
// Não existe estado de "lida" nem de "dispensada": uma pendência sai da lista
// quando o trabalho é feito, e nada mais a remove. É isso que faz o número no
// sino valer alguma coisa — se marca 3, são 3 coisas de verdade.
export function usePendencias(dados, avisar) {
    const { usuario } = dados;
    const pendencias = useMemo(
        () => calcularPendencias({ ...dados, hoje: obterDataAtual() }),
        // A data entra como valor calculado aqui dentro, não como dependência:
        // recalcular à meia-noite não vale um timer, e a primeira mudança de
        // dado do dia seguinte já reclassifica tudo.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dados.usuario, dados.pedidos, dados.contasPagar, dados.notasFiscais,
         dados.tarefasInternas, dados.requisicoesMaterial, dados.linksPagamento,
         dados.empresasFaturamento],
    );

    const porDestino = useMemo(() => contarPorDestino(pendencias), [pendencias]);
    const gravidadeGeral = useMemo(() => piorGravidade(pendencias), [pendencias]);
    const urgentes = useMemo(() => pendencias.filter(p => p.gravidade !== 'tarefa'), [pendencias]);

    // Ids já anunciados. Persistido por usuário para que um F5 não repita o
    // aviso de tudo que já estava lá — era exatamente o defeito do sistema
    // antigo, que recriava os avisos a cada carregamento.
    const jaAnunciadas = useRef(null);
    const [resumoDeEntrada, setResumoDeEntrada] = useState(null);

    useEffect(() => {
        if (!usuario) { jaAnunciadas.current = null; return; }
        try {
            const salvo = localStorage.getItem('pendencias_anunciadas_' + usuario.id);
            jaAnunciadas.current = new Set(salvo ? JSON.parse(salvo) : []);
        } catch {
            jaAnunciadas.current = new Set();
        }
    }, [usuario?.id]);

    useEffect(() => {
        if (!usuario || jaAnunciadas.current === null) return;

        const novas = pendencias.filter(p => !jaAnunciadas.current.has(p.id));

        // Primeira passada da sessão: a lista inteira é "nova" porque ninguém
        // anunciou nada ainda nesta aba. Disparar um toast por item daria uma
        // avalanche no login — em vez disso, vira o resumo de entrada.
        const chaveSessao = 'pendencias_resumo_' + usuario.id;
        let jaMostrouResumo = true;
        try { jaMostrouResumo = sessionStorage.getItem(chaveSessao) === '1'; } catch { /* sem sessionStorage */ }

        if (!jaMostrouResumo) {
            try { sessionStorage.setItem(chaveSessao, '1'); } catch { /* ignora */ }
            if (pendencias.length > 0) setResumoDeEntrada(pendencias);
        } else if (novas.length > 0) {
            // Já em regime: cada pendência que surge no meio do expediente
            // (chegou pelo tempo real) ganha seu próprio aviso.
            novas.forEach(p => avisar(`${p.titulo}: ${p.detalhe}`, p.gravidade === 'critico' ? 'erro' : 'info', p));
        }

        if (novas.length > 0) {
            novas.forEach(p => jaAnunciadas.current.add(p.id));
            // Só os ids que ainda existem: sem esta poda, a lista de anunciadas
            // cresceria para sempre com pendências já resolvidas.
            const vivos = new Set(pendencias.map(p => p.id));
            jaAnunciadas.current = new Set([...jaAnunciadas.current].filter(id => vivos.has(id)));
            try {
                localStorage.setItem('pendencias_anunciadas_' + usuario.id, JSON.stringify([...jaAnunciadas.current]));
            } catch { /* localStorage indisponível */ }
        }
    }, [pendencias, usuario?.id, avisar]);

    // Memorizado porque o resultado alimenta o contexto de UI: devolver um
    // objeto novo a cada render faria todo consumidor de useUi() re-renderizar
    // junto, a cada tecla digitada em qualquer campo da aplicação.
    return useMemo(() => ({
        pendencias,
        urgentes,
        porDestino,
        gravidadeGeral,
        resumoDeEntrada,
        fecharResumoDeEntrada: () => setResumoDeEntrada(null),
    }), [pendencias, urgentes, porDestino, gravidadeGeral, resumoDeEntrada]);
}
