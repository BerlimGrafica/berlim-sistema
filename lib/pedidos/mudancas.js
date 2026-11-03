// Quais O.S. o tempo real viu mudar (AppContext, junto do triggerRealtime).
// Telas que leem do banco por conta própria (as abas Contas a receber e
// Boletos do protótipo do Financeiro) releem só essas O.S., em vez da lista
// inteira: cada mudança custa uma consulta de poucas linhas.
//
// `tudo` vem quando um evento chegou sem dizer de qual O.S. era (um pagamento
// apagado, por exemplo): aí não há como saber o que mudou, e a tela relê tudo.
const ouvintes = new Set();

export function avisarPedidosMudados(ids, tudo = false) {
    if (!ids.length && !tudo) return;
    ouvintes.forEach(fn => fn({ ids, tudo }));
}

export function ouvirPedidosMudados(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
}
