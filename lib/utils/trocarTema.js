"use client";

// Troca de tema que "acende" a partir do botão clicado: o escuro se espalha
// em círculo saindo dele e, ao voltar para o claro, se recolhe para dentro
// dele — o mesmo caminho ao contrário, um pouco mais rápido (como a gaveta).
//
// Usa a View Transitions API: o navegador fotografa a tela antes e depois da
// troca e anima só o recorte da foto de cima; a camada de baixo fica parada.
// As regras de camada estão no globals.css, presas ao atributo
// `data-troca-tema` para não mexerem em nenhuma outra transição. Navegador
// sem a API troca seco, como antes; com movimento reduzido, um esmaecer curto
// no lugar do círculo.
let trocaAtual = null;

export function trocarTema(escuro, origem, aplicar) {
    const raiz = document.documentElement;
    const trocar = () => { raiz.classList.toggle('dark', escuro); aplicar?.(); };
    if (!document.startViewTransition) return trocar();

    const r = origem?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : innerWidth / 2;
    const y = r ? r.top + r.height / 2 : innerHeight / 2;
    // até o canto mais distante, para o círculo cobrir a tela inteira
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

    raiz.dataset.trocaTema = '';
    const troca = document.startViewTransition(trocar);
    trocaAtual = troca;
    let anim;
    troca.ready.then(() => {
        const circulo = [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`];
        anim = raiz.animate(
            reduzido ? { opacity: escuro ? [0, 1] : [1, 0] } : { clipPath: escuro ? circulo : circulo.reverse() },
            {
                duration: reduzido ? 200 : escuro ? 600 : 450,
                easing: reduzido ? 'ease' : escuro ? 'cubic-bezier(.45,0,.2,1)' : 'cubic-bezier(.8,0,.55,1)',
                fill: 'forwards',
                // a camada escura é a de cima: a nova ao escurecer, a antiga ao clarear
                pseudoElement: escuro ? '::view-transition-new(root)' : '::view-transition-old(root)',
            },
        );
    }).catch(() => {});
    // O recorte final fica preso (fill) até a troca acabar e então é
    // cancelado — senão a próxima troca herdaria o círculo desta. Dois cliques
    // seguidos: a segunda troca interrompe a primeira, e só a última tira o
    // atributo.
    const fim = () => { anim?.cancel(); if (trocaAtual === troca) delete raiz.dataset.trocaTema; };
    troca.finished.then(fim, fim);
}
