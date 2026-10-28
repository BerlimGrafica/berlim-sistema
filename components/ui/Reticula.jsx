"use client";
import { useEffect, useImperativeHandle, useRef } from 'react';

// A retícula do fundo de marca (tela de entrada e tela bloqueada): pontos de
// meio-tom numa grade a 45°, maiores onde o tom é mais escuro, como a retícula
// de uma prova de impressão. São milhares de pontos, então vão num canvas, e
// tudo é redesenhado quando o tamanho muda.
//
// Ao montar, os pontos "imprimem" numa varredura diagonal, do canto de cima à
// esquerda para o de baixo à direita. `ref.current.animar(0, ms)` faz o
// caminho de volta (a tela bloqueada usa ao desbloquear). Com "reduzir
// movimento", os pontos aparecem e somem de uma vez.

const suave = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
const saidaExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

// O tom de cada ponto, de 0 a 1, pela posição relativa (u, v) e a proporção
// da área. Na entrada, escurece para o canto de baixo, longe do texto; no
// bloqueio, fica claro no meio, onde estão o relógio e o cartão.
export const tomEntrada = (u, v) => suave(0.72, 1.5, u * 0.75 + v * 0.85 + 0.06 * Math.sin(u * 6.5 + v * 2.5));
export const tomBloqueio = (u, v, proporcao) =>
    suave(0.46, 1.1, Math.hypot((u - 0.5) * Math.max(proporcao, 1), (v - 0.52) * 1.1) + 0.05 * Math.sin(u * 7 + v * 4));

export default function Reticula({ tom, duracao = 1200, ref }) {
    const canvasRef = useRef(null);
    const animarRef = useRef(() => Promise.resolve());

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let pontos = [], w = 0, h = 0, progresso = 0, quadro = 0;

        const desenhar = () => {
            ctx.clearRect(0, 0, w, h);
            if (progresso <= 0) return;
            ctx.fillStyle = getComputedStyle(canvas).color;
            ctx.beginPath();
            for (let i = 0; i < pontos.length; i += 4) {
                // cada ponto cresce na sua vez da varredura
                const k = progresso >= 1 ? 1 : saidaExpo(Math.min(1, Math.max(0, (progresso - pontos[i + 3] * 0.45) / 0.55)));
                const r = pontos[i + 2] * k;
                if (r < 0.35) continue;
                ctx.moveTo(pontos[i] + r, pontos[i + 1]);
                ctx.arc(pontos[i], pontos[i + 1], r, 0, Math.PI * 2);
            }
            ctx.fill();
        };
        const medir = () => {
            const caixa = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = caixa.width; h = caixa.height;
            if (!w || !h) return;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // Linhas a meio passo, uma sim, outra não, deslocadas meio ponto:
            // a grade a 45° da retícula do preto numa chapa.
            const passo = w < 640 ? 11 : 14, meio = passo / 2;
            pontos = [];
            for (let linha = 0; linha * meio < h + passo; linha++) {
                const y = linha * meio;
                for (let x = linha % 2 ? meio : 0; x < w + passo; x += passo) {
                    const t = tom(x / w, y / h, w / h);
                    if (t < 0.03) continue;
                    // A área do ponto acompanha o tom, por isso o raio vai pela
                    // raiz; até 70% de tom, para os pontos nunca virarem mancha.
                    pontos.push(x, y, Math.sqrt(t * 0.7) * passo * 0.4, (x / w + y / h) / 2);
                }
            }
            desenhar();
        };
        const animar = (para, ms) => {
            cancelAnimationFrame(quadro);
            if (reduzido) { progresso = para; desenhar(); return Promise.resolve(); }
            const de = progresso, inicio = performance.now();
            return new Promise((pronto) => {
                const passo = (agora) => {
                    const t = Math.min(1, (agora - inicio) / ms);
                    progresso = de + (para - de) * t;
                    desenhar();
                    if (t < 1) quadro = requestAnimationFrame(passo);
                    else pronto();
                };
                quadro = requestAnimationFrame(passo);
            });
        };
        animarRef.current = animar;

        const observador = new ResizeObserver(medir);
        observador.observe(canvas);
        medir();
        animar(1, duracao);
        return () => {
            observador.disconnect();
            cancelAnimationFrame(quadro);
            animarRef.current = () => Promise.resolve();
        };
    }, [tom, duracao]);

    useImperativeHandle(ref, () => ({ animar: (para, ms) => animarRef.current(para, ms) }), []);

    return <canvas ref={canvasRef} aria-hidden="true" className="reticula absolute inset-0 w-full h-full pointer-events-none" />;
}
