"use client";
import { useEffect } from 'react';
import { useAbrirOSDoPrototipo } from '@/hooks/useAbrirOSDoPrototipo';

// O novo modal de O.S. aberto de fora de uma tela: as pendências (o sino e a
// faixa vermelha) pedem uma O.S. com o evento ABRIR_NOVA_OS, e quem usa as telas
// novas (lib/acesso/telasNovas.js) a vê no modal novo, no lugar do antigo.
//
// Fica montado no layout, e só para essas pessoas: as telas novas têm o modal
// delas para o que vem do próprio iframe; este atende o resto do sistema.
export const ABRIR_NOVA_OS = 'berlim:abrir-nova-os';

export default function NovaOSGlobal() {
    const { modalOS, abrir } = useAbrirOSDoPrototipo();

    useEffect(() => {
        const aoPedir = (e) => { if (Number.isInteger(e.detail?.id)) abrir(e.detail.id); };
        window.addEventListener(ABRIR_NOVA_OS, aoPedir);
        return () => window.removeEventListener(ABRIR_NOVA_OS, aoPedir);
    }, [abrir]);

    return modalOS;
}
