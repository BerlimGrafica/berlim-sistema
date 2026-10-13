// O ponto de pendência que algumas sub-abas mostram ao lado do nome.
//
// Vive aqui, e não dentro de uma tela, porque agora duas peças o mostram: a
// faixa de sub-abas da própria tela (no celular, e no computador quando o menu
// lateral está escondido) e o menu lateral. Escrita nos dois lugares, a regra
// divergiria na primeira mudança — e um ponto que aparece num e some no outro
// ensina a desconfiar dos dois.
//
// Devolve um mapa pelo id composto da sub-aba ('financeiro:notas_fiscais'), o
// mesmo de lib/acesso/telas.js. Sub-aba fora do mapa não tem sinal.
export function sinaisDasSubAbas({ notasFiscais = [] } = {}) {
    return {
        // Nota fiscal ainda não concluída: há trabalho esperando na aba.
        'financeiro:notas_fiscais': notasFiscais.some(n => !n.concluido),
    };
}
