"use client";
import { useEffect, useRef } from 'react';
import { useUi } from '@/context/UiContext';
import { useChatEquipe } from '@/context/ChatContext';

// Marca o ícone da aba enquanto houver pendência ou mensagem não lida.
//
// Os outros quatro sinais (sino, contador no menu, faixa e resumo de entrada)
// só existem com o sistema na tela. Quem está com a aba em segundo plano — o
// caso normal de quem trabalha com outra coisa aberta — não vê nenhum deles. O
// título da aba e o ícone são a única superfície que sobra.
//
// Ponto só, sem número e sem distinguir a origem: a 16px o algarismo vira
// borrão, e duas cores diferentes não seriam lidas. O que precisa passar é
// "tem coisa te esperando" — qual coisa, a pessoa descobre ao voltar.
export default function FaviconPendencias() {
    const { pendencias } = useUi();
    const { chatNaoLidas } = useChatEquipe();
    const temPendencia = pendencias.length > 0 || chatNaoLidas > 0;
    const originalRef = useRef(null);
    const comPontoRef = useRef(null);

    useEffect(() => {
        const link = document.querySelector("link[rel~='icon']");
        if (!link) return;
        // O href original vem do ícone que o Next injeta no <head>, com hash de
        // versão. Guardado na primeira passada para conseguir voltar atrás.
        if (originalRef.current === null) originalRef.current = link.getAttribute('href');

        if (!temPendencia) {
            link.setAttribute('href', originalRef.current);
            return;
        }
        if (comPontoRef.current) {
            link.setAttribute('href', comPontoRef.current);
            return;
        }

        const img = new Image();
        img.onload = () => {
            const tela = document.createElement('canvas');
            tela.width = 64;
            tela.height = 64;
            const ctx = tela.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(img, 0, 0, 64, 64);

            // Anel claro por baixo: sem ele o vermelho encosta no desenho do
            // logo e, no tamanho de favicon, os dois viram uma mancha só.
            ctx.beginPath();
            ctx.arc(46, 18, 17, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(46, 18, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();

            try {
                comPontoRef.current = tela.toDataURL('image/png');
                link.setAttribute('href', comPontoRef.current);
            } catch {
                // Canvas contaminado só aconteceria com ícone de outro domínio;
                // aqui ele é servido pela própria aplicação. Se falhar, a aba
                // simplesmente fica sem o ponto.
            }
        };
        img.src = originalRef.current;
    }, [temPendencia]);

    // Restaura o ícone limpo ao sair (logout desmonta a árvore da aplicação).
    useEffect(() => () => {
        const link = document.querySelector("link[rel~='icon']");
        if (link && originalRef.current) link.setAttribute('href', originalRef.current);
    }, []);

    return null;
}
