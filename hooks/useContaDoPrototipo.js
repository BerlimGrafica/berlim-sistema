"use client";
import { useEffect } from 'react';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { formatarMoeda } from '@/lib/utils/formatters';

// Os protótipos (/novoinicio, /novascontas) rodam num iframe e não gravam nada.
// "Editar" e "Nova conta" pedem por mensagem, e a página abre o modal de conta
// de hoje (ContaModal, montado em Modals.jsx), que é quem grava — o mesmo
// caminho do "Editar no modal atual" das O.S.
//
// Recebe o ref do iframe da página: só ele fala com ela.
export function useContaDoPrototipo(iframeRef) {
    const { contasPagar, setNovaConta, setModalContaAberto } = useFinanceiro();

    useEffect(() => {
        // O clique veio de dentro do iframe, então o foco ainda está lá: o Esc
        // fecharia a gaveta de trás e o teclado digitaria no nada. Tirar o foco
        // do iframe devolve o teclado para a página, onde o modal está.
        const abrirModal = () => { iframeRef.current?.blur(); setModalContaAberto(true); };
        const aoReceber = (e) => {
            if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
            // O novo modal do protótipo pode mandar junto o que já foi digitado
            // (`rascunho`, valor em centavos): ele entra no modal de hoje para
            // gravar sem precisar digitar de novo.
            const rascunho = e.data?.rascunho || {};
            const comRascunho = (conta) => {
                const c = { ...conta, ...rascunho };
                return { ...c, valor: c.valor ? formatarMoeda(Math.round(c.valor).toString()) : '' };
            };
            if (e.data?.tipo === 'editar-conta' && Number.isInteger(e.data.id)) {
                const conta = contasPagar.find(c => c.id === e.data.id);
                if (!conta) return;
                setNovaConta(comRascunho(conta));
                abrirModal();
            }
            if (e.data?.tipo === 'nova-conta') {
                setNovaConta(comRascunho({ id: null, descricao: '', valor: 0, vencimento: '', status: 'Pendente', recorrente: false, recorrente_total_parcelas: null, recorrente_parcela_atual: 1, categoria: 'Despesa', fornecedor_id: null }));
                abrirModal();
            }
        };
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [iframeRef, contasPagar, setNovaConta, setModalContaAberto]);
}
