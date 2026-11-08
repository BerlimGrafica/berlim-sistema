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
export function usePendencias(dados, avisar, abrirSino) {
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
    // "Urgente" é só o vermelho: é o que segura a faixa (components/
    // FaixaPendencias.jsx). O âmbar e as tarefas ficam no sino.
    const urgentes = useMemo(() => pendencias.filter(p => p.gravidade === 'critico'), [pendencias]);

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
            // Com algo vermelho, o resumo é a faixa aberta só com ele; sem
            // vermelho, é o painel do sino, que tem o resto. Nunca os dois.
            const criticas = pendencias.filter(p => p.gravidade === 'critico');
            if (criticas.length > 0) setResumoDeEntrada(criticas);
            else if (pendencias.length > 0) abrirSino?.(true);
        } else if (novas.length > 0) {
            // Já em regime: o que surge no meio do expediente (chegou pelo
            // tempo real ou virou o dia) vira UM aviso por tipo. Sozinha, a
            // pendência mostra o detalhe e abre a O.S.; em grupo ("3 × Boleto
            // a vencer"), o aviso leva só à tela, onde estão todas — cinco
            // toasts empilhados de uma vez ninguém lê.
            const porTitulo = new Map();
            for (const p of novas) porTitulo.set(p.titulo, [...(porTitulo.get(p.titulo) || []), p]);
            for (const [titulo, grupo] of porTitulo) {
                const primeira = grupo[0];
                const severidade = grupo.some(p => p.gravidade === 'critico') ? 'erro' : 'info';
                if (grupo.length === 1) avisar(`${titulo}: ${primeira.detalhe}`, severidade, primeira);
                else avisar(`${grupo.length} × ${titulo}`, severidade, { ...primeira, osId: null });
            }
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
    }, [pendencias, usuario?.id, avisar, abrirSino]);

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
