"use client";
import { useRef } from 'react';

// Fecha o modal só quando o mousedown E o mouseup aconteceram ambos no
// backdrop (não no card) — evita fechar acidentalmente ao selecionar texto
// dentro do modal e soltar o clique em cima do backdrop.
export function useFecharAoClicarFora() {
    const cliqueForaAlvo = useRef(false);
    return (fn) => ({
        onMouseDown: (e) => { cliqueForaAlvo.current = e.target === e.currentTarget; },
        onMouseUp: (e) => {
            if (cliqueForaAlvo.current && e.target === e.currentTarget) fn();
            cliqueForaAlvo.current = false;
        },
    });
}
