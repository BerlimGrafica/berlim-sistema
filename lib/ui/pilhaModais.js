// Pilha de modais abertos.
//
// Existe porque os modais aninham: dá para abrir "Novo Cliente" e "Novo Produto"
// de dentro do modal de O.S. Qualquer efeito global — travar o scroll, marcar a
// página de trás como inerte, decidir quem responde ao Esc — precisa saber
// quantos estão abertos, e não apenas se "um" abriu. Uma trava aplicada no
// mount e desfeita no unmount destravaria tudo ao fechar o modal de cima, com o
// de baixo ainda aberto.
//
// Estado de módulo, e não contexto do React, porque quem lê isto é o layout
// (via useSyncExternalStore) e os próprios modais, que vivem em ramos
// diferentes da árvore.

let pilha = [];
const ouvintes = new Set();

let overflowAnterior = '';
let paddingAnterior = '';

function travarScroll() {
    const body = document.body;
    overflowAnterior = body.style.overflow;
    paddingAnterior = body.style.paddingRight;
    // Compensa a barra de rolagem que some junto com o overflow, senão a página
    // inteira dá um pulo lateral no instante em que o modal abre.
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    if (larguraBarra > 0) body.style.paddingRight = `${larguraBarra}px`;
    body.style.overflow = 'hidden';
}

function destravarScroll() {
    document.body.style.overflow = overflowAnterior;
    document.body.style.paddingRight = paddingAnterior;
}

function notificar() {
    ouvintes.forEach(fn => fn());
}

// Chamado por cada modal ao montar. Devolve a função de saída.
export function entrarNaPilha(marca) {
    if (pilha.length === 0) travarScroll();
    pilha.push(marca);
    notificar();
    return () => {
        pilha = pilha.filter(m => m !== marca);
        if (pilha.length === 0) destravarScroll();
        notificar();
    };
}

// Só o modal do topo reage ao Esc — sem isso, um Esc com "Novo Produto" aberto
// por cima da O.S. fecharia os dois de uma vez.
export function souOTopo(marca) {
    return pilha[pilha.length - 1] === marca;
}

export function haModalAberto() {
    return pilha.length > 0;
}

export function inscrever(aoMudar) {
    ouvintes.add(aoMudar);
    return () => ouvintes.delete(aoMudar);
}

// O servidor renderiza sem modal aberto; sem isto o useSyncExternalStore quebra
// no SSR ao tentar ler document/window.
export function haModalAbertoNoServidor() {
    return false;
}
