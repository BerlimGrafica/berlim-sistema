"use client";
import { useState, useRef } from 'react';

// Avisos efêmeros e confirmação — o que aparece por causa de UMA ação e some.
//
// A lista persistente de notificações saiu daqui. Ela guardava eventos ("uma
// conta venceu"), e nada os removia quando o trabalho era feito; o controle de
// duplicata vivia só em memória, então cada recarregamento reprocessava tudo e
// empilhava cópias por cima do que o localStorage já tinha. Hoje o que a pessoa
// precisa fazer é derivado do estado, em lib/alertas/pendencias.js: existe
// enquanto a condição é verdadeira e some sozinho quando deixa de ser.
export function useAlertas(usuario) {
    const [toasts, setToasts] = useState([]);
    const removerToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    // Substituto de window.alert(): toast avulso. `pendencia` é opcional e só
    // existe quando o aviso tem para onde levar — aí clicar no toast navega.
    const avisar = (mensagem, severidade = 'info', pendencia = null) => {
        setToasts(prev => [...prev, { id: Date.now() + Math.random(), msg: mensagem, severidade, pendencia }]);
    };

    // Substituto de window.confirm(): devolve Promise<boolean>, resolvida quando
    // o usuário clica em Confirmar/Cancelar no ConfirmDialog.
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const confirmar = (mensagem) => new Promise(resolve => setPendingConfirm({ mensagem, resolve }));
    const resolverConfirm = (valor) => {
        setPendingConfirm(prev => { prev?.resolve(valor); return null; });
    };

    const [modalAlertasAberto, setModalAlertasAberto] = useState(false);

    const ehUsuario = (nome) => (usuario?.nome || '').trim().toLowerCase() === nome.toLowerCase();

    return {
        toasts, removerToast, avisar,
        pendingConfirm, confirmar, resolverConfirm,
        modalAlertasAberto, setModalAlertasAberto,
        ehUsuario,
    };
}
