"use client";
import { useState } from 'react';

// Campo numérico que não atrapalha quem está digitando.
//
// A versão anterior reformatava o valor a cada tecla: guardava o número e
// reconstruía o texto a partir dele. Isso parece inofensivo e não é — digitar
// "1" virava "1.0" na hora, com o cursor depois de um zero que ninguém escreveu,
// e a tecla seguinte produzia "1.02" em vez de "12". Pior no meio de um decimal:
// "7" + "." reconstruía "7.0", o ponto sumia e era impossível chegar a 7,5.
//
// A saída é separar as duas coisas. Enquanto o campo está sendo editado, quem
// manda no texto é o RASCUNHO — exatamente o que foi digitado, inclusive
// estados intermediários que não são número ainda ("7," ou "-"). O valor
// numérico sobe em paralelo, quando dá para interpretá-lo. Ao sair do campo o
// rascunho é descartado e o texto volta a ser a forma canônica do valor.
//
// Aceita vírgula porque é assim que se escreve número em português, e por isso
// o input é `text` com `inputMode="decimal"`: um `type="number"` recusa a
// vírgula em quase todo navegador e devolve string vazia sem avisar.

// 0,075 × 100 dá 7.500000000000001 em ponto flutuante. Cortar na 12ª casa
// significativa devolve 7,5 sem estragar valor nenhum que alguém vá digitar.
const limpar = (n) => Number(Number(n).toPrecision(12));

const paraTexto = (valor, pct) => {
    if (valor === '' || valor === null || valor === undefined) return '';
    const n = Number(valor);
    if (!Number.isFinite(n)) return '';
    return String(pct ? limpar(n * 100) : limpar(n)).replace('.', ',');
};

export function CampoNumerico({
    valor, aoMudar, pct = false, placeholder, className = '', autoFocus = false, ariaLabel,
}) {
    const [rascunho, setRascunho] = useState(null);
    const texto = rascunho !== null ? rascunho : paraTexto(valor, pct);

    const digitou = (bruto) => {
        setRascunho(bruto);
        if (bruto.trim() === '') return aoMudar('');
        const n = Number(bruto.replace(',', '.'));
        // Texto que ainda não é número ("7," no meio da digitação) fica só no
        // rascunho: o valor lá em cima segue o último que fez sentido, então a
        // conta não pisca com resultado errado enquanto a pessoa escreve.
        if (Number.isFinite(n)) aoMudar(pct ? n / 100 : n);
    };

    return (
        <input
            type="text"
            inputMode="decimal"
            autoFocus={autoFocus}
            aria-label={ariaLabel}
            value={texto}
            placeholder={placeholder}
            onChange={(e) => digitou(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={() => setRascunho(null)}
            className={className}
        />
    );
}
