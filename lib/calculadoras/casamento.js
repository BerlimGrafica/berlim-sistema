// Papelaria de casamento — manual de padrinhos: a regra sem tela.
//
// É a mesma conta de components/calculadoras/CalculadoraCasamento.jsx, tirada
// de lá para a tela nova (/novascalculadoras) usar sem copiar. Enquanto as duas
// telas existirem, mudar um preço aqui é mudar só na nova.
//
//   quantos cabem numa A4: área útil de 20 x 28,7 cm, peças em pé
//   folhas: as impressões divididas pelo que cabe, mais 2 de acerto
//   furo: R$ 2,50 por folha; com ilhós, mais R$ 3 por manual
//   artes variáveis: R$ 5 cada até 30; acima de 30, R$ 3 cada

export const PAPEIS = {
    'Couche 170g': 3.75,
    'Couche 250g': 4.25,
    'Offset 180g': 2.75,
    'Offset 240g': 3,
    'Papel Perolizado 180g': 6.5,
    'Papel Linho 180g': 3.5,
};

export const FUROS = ['Sem furo', 'Somente furo', 'Furo e Ilhós'];

export const AREA_A4 = { largura: 20, altura: 28.7 };
export const FOLHAS_DE_ACERTO = 2;

export const CONFIG_PADRAO = {
    qtdManuais: 20,
    largura: '9,5',
    altura: '9,5',
    qtdImpressoes: 90,
    papel: 'Papel Linho 180g',
    furo: 'Furo e Ilhós',
    qtdVariaveis: 6,
};

export function calcularManual(entrada) {
    const m = { ...CONFIG_PADRAO, ...entrada };
    const larg = parseFloat(String(m.largura).replace(',', '.')) || 0;
    const alt = parseFloat(String(m.altura).replace(',', '.')) || 0;
    const qtdManuais = parseInt(m.qtdManuais, 10) || 0;
    const qtdImpressoes = parseInt(m.qtdImpressoes, 10) || 0;
    const qtdVariaveis = parseInt(m.qtdVariaveis, 10) || 0;

    let qtdPorA4 = 0;
    if (larg > 0 && alt > 0) qtdPorA4 = Math.floor(AREA_A4.largura / larg) * Math.floor(AREA_A4.altura / alt);

    let qtdFolhasA4 = 0;
    if (qtdPorA4 > 0 && qtdImpressoes > 0) qtdFolhasA4 = Math.ceil(qtdImpressoes / qtdPorA4) + FOLHAS_DE_ACERTO;

    const precoPapel = PAPEIS[m.papel] || 0;
    const custoImpressao = precoPapel * qtdFolhasA4;

    let custoFuro = 0;
    if (m.furo === 'Somente furo') custoFuro = qtdFolhasA4 * 2.5;
    else if (m.furo === 'Furo e Ilhós') custoFuro = (qtdFolhasA4 * 2.5) + (qtdManuais * 3);

    const custoVariavel = qtdVariaveis <= 30 ? qtdVariaveis * 5 : qtdVariaveis * 3;
    const valorFinal = custoImpressao + custoFuro + custoVariavel;

    const textoWhatsapp = `${qtdManuais} manuais | ${qtdImpressoes} impressões | ${m.largura}x${m.altura}cm | ${m.papel} | ${m.furo} | 4x0 (Colorido e somente frente) | Refile | Artes variáveis - R$ ${valorFinal.toFixed(2).replace('.', ',')}`;

    return {
        ok: qtdPorA4 > 0 && qtdImpressoes > 0,
        qtdPorA4, qtdFolhasA4, precoPapel, custoImpressao, custoFuro, custoVariavel, valorFinal, textoWhatsapp,
    };
}
