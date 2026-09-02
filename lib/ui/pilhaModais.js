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

// ---- Voltas no histórico pedidas pelo próprio código ----
//
// Cada modal empilha uma entrada de histórico ao abrir (para o botão voltar
// fechá-lo) e a retira ao fechar, com history.back(). Esse back dispara um
// popstate igual ao de um clique de verdade — e o modal de baixo, que acabou de
// virar o topo da pilha, o entendia como "o usuário quer voltar" e disparava o
// guarda de descarte. Fechar "Novo Cliente" por cima da O.S. pedia confirmação
// de perda no modal da O.S., sem ninguém ter tocado nele.
let voltasDoCodigo = 0;

export function voltarDoHistorico() {
    voltasDoCodigo += 1;
    // Inscrito agora, depois dos ouvintes dos modais já abertos: eles rodam
    // primeiro e ainda enxergam a marca; este zera logo em seguida. O `once`
    // garante que a marca dure exatamente um popstate, mesmo que nenhum modal
    // esteja aberto para lê-la.
    window.addEventListener('popstate', () => {
        voltasDoCodigo = Math.max(0, voltasDoCodigo - 1);
    }, { once: true });
    window.history.back();
}

export function voltaVeioDoCodigo() {
    return voltasDoCodigo > 0;
}
