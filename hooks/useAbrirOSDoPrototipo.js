"use client";
import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import NovaOSPorCima from '@/components/prototipos/NovaOSPorCima';
import { entrarNaPilha, souOTopo, voltarDoHistorico, voltaVeioDoCodigo } from '@/lib/ui/pilhaModais';

// Os protótipos (/novabaixa, /novaproducao) rodam num iframe e não gravam nada.
// "Abrir O.S. completa" — o ⤢ e o Enter da gaveta — pede por mensagem, e a
// página abre por cima o novo modal de O.S. (NovaOSPorCima) com a O.S. real.
// Ele ainda só mostra; o "Editar no modal atual" de lá abre o modal de hoje,
// que relê a O.S. pelo id e grava com as permissões de quem está logado.
//
// `statusDe(id)` diz a situação da O.S. quando a página a conhece: baixada fica
// trancada para Atendimento e Produção, como na tela de hoje (BaixaTab).
//
// Devolve o ref do iframe da tela e o modal a desenhar ao lado dele.
export function useAbrirOSDoPrototipo(statusDe) {
    const iframeRef = useRef(null);
    const [osAberta, setOsAberta] = useState(null);
    const { isOperador } = useSessao();
    const aberta = osAberta !== null;
    const fechar = useCallback(() => setOsAberta(null), []);

    useEffect(() => {
        const aoReceber = (e) => {
            // Só o iframe desta página fala com ela.
            if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
            if (e.data?.tipo !== 'abrir-os' || !Number.isInteger(e.data.id)) return;
            if (isOperador && statusDe?.(e.data.id) === 'Finalizado') return;
            setOsAberta(e.data.id);
        };
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [isOperador, statusDe]);

    // A janela entra na pilha de modais como as outras: a página de trás fica
    // inerte, o voltar do navegador fecha a janela em vez de trocar de tela, e o
    // Esc (enquanto o foco ainda está deste lado) fecha.
    //
    // Fica aqui, e não no componente da janela, pelo mesmo motivo do chat e do
    // modal de O.S.: quem entra e sai da pilha precisa já estar montado. Em
    // desenvolvimento o React monta tudo duas vezes; montando junto com a
    // janela, a volta do histórico da primeira montagem chegava na segunda como
    // se a pessoa tivesse apertado voltar, e a janela fechava ao abrir.
    useEffect(() => {
        if (!aberta) return;
        const marca = {};
        const sair = entrarNaPilha(marca);
        window.history.pushState({ modalBerlimAberto: true }, '');
        function aoVoltar() {
            if (!souOTopo(marca) || voltaVeioDoCodigo()) return;
            window.history.pushState({ modalBerlimAberto: true }, '');
            fechar();
        }
        function aoTeclar(e) {
            if (e.key !== 'Escape' || !souOTopo(marca) || e.defaultPrevented) return;
            e.preventDefault();
            fechar();
        }
        document.addEventListener('keydown', aoTeclar);
        window.addEventListener('popstate', aoVoltar);
        return () => {
            document.removeEventListener('keydown', aoTeclar);
            window.removeEventListener('popstate', aoVoltar);
            sair();
            if (window.history.state?.modalBerlimAberto) voltarDoHistorico();
        };
    }, [aberta, fechar]);

    const modalOS = aberta ? createElement(NovaOSPorCima, { key: osAberta, id: osAberta, aoFechar: fechar }) : null;

    return { iframeRef, modalOS };
}
