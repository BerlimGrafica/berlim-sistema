// Papelaria de casamento — manual de padrinhos: a regra sem tela.
//
// É a mesma conta de components/calculadoras/CalculadoraCasamento.jsx, tirada
// de lá para a tela nova (/novascalculadoras) usar sem copiar. Enquanto as duas
// telas existirem, mudar um preço aqui é mudar só na nova.
//
//   quantos cabem numa A4: área útil de 20 x 28,7 cm, peças em pé
//   folhas: as impressões divididas pelo que cabe, mais 2 de acerto
//   capa em outro papel: uma capa por manual, tirada das impressões; a capa
//     vira uma tiragem à parte, com as suas folhas e os seus 2 de acerto
//   furo: R$ 2,50 por folha; com ilhós, mais R$ 3 por manual
//   corte especial: R$ 2,50 por folha; laminação brilho ou fosca: R$ 1,05 por
//     folha — os dois só a partir de 10 folhas no pedido (miolo e capa somados)
//   artes variáveis: R$ 5 cada até 30; acima de 30, R$ 3 cada

// A ordem aqui é a ordem da lista na tela: offset primeiro, cada laser logo
// depois do seu papel comum.
export const PAPEIS = {
    'Offset 180g': 2.75,
    'Offset 180g Laser': 3.75,
    'Offset 240g': 3.5,
    'Offset 240g Laser': 4.5,
    'Couche 170g': 3.75,
    'Couche 250g': 4.25,
    'Papel Perolizado 180g': 6.5,
    'Papel Linho 180g': 3.5,
    'Papel Linho 180g Laser': 4.5,
    'Papel Vegetal 180g': 6.5,
};

export const FUROS = ['Sem furo', 'Somente furo', 'Furo e Ilhós'];
export const CAPAS = [
    { valor: 'mesmo', rotulo: 'Mesmo papel' },
    { valor: 'outro', rotulo: 'Outro papel' },
];
export const LAMINACOES = ['Sem laminação', 'Laminação brilho', 'Laminação fosca'];

export const AREA_A4 = { largura: 20, altura: 28.7 };
export const FOLHAS_DE_ACERTO = 2;
export const FURO_POR_FOLHA = 2.5;
export const ILHOS_POR_MANUAL = 3;
export const CORTE_ESPECIAL_POR_FOLHA = 2.5;
export const LAMINACAO_POR_FOLHA = 1.05;
// Corte especial e laminação só entram com o pedido a partir daqui.
export const FOLHAS_MINIMAS_ACABAMENTO = 10;

export const CONFIG_PADRAO = {
    qtdManuais: 20,
    largura: '9,5',
    altura: '9,5',
    qtdImpressoes: 90,
    papel: 'Papel Linho 180g',
    capa: 'mesmo',
    papelCapa: 'Papel Perolizado 180g',
    furo: 'Furo e Ilhós',
    corteEspecial: false,
    laminacao: 'Sem laminação',
    qtdVariaveis: 6,
};

const folhasPara = (pecas, porA4) => (porA4 > 0 && pecas > 0 ? Math.ceil(pecas / porA4) + FOLHAS_DE_ACERTO : 0);
const brl = v => v.toFixed(2).replace('.', ',');

export function calcularManual(entrada) {
    const m = { ...CONFIG_PADRAO, ...entrada };
    const larg = parseFloat(String(m.largura).replace(',', '.')) || 0;
    const alt = parseFloat(String(m.altura).replace(',', '.')) || 0;
    const qtdManuais = parseInt(m.qtdManuais, 10) || 0;
    const qtdImpressoes = parseInt(m.qtdImpressoes, 10) || 0;
    const qtdVariaveis = parseInt(m.qtdVariaveis, 10) || 0;

    let qtdPorA4 = 0;
    if (larg > 0 && alt > 0) qtdPorA4 = Math.floor(AREA_A4.largura / larg) * Math.floor(AREA_A4.altura / alt);

    // Capa em outro papel: uma por manual, saindo das impressões.
    const capaSeparada = m.capa === 'outro';
    const qtdCapas = capaSeparada ? Math.min(qtdManuais, qtdImpressoes) : 0;
    const qtdMiolo = qtdImpressoes - qtdCapas;

    const folhasMiolo = folhasPara(qtdMiolo, qtdPorA4);
    const folhasCapa = folhasPara(qtdCapas, qtdPorA4);
    const qtdFolhasA4 = folhasMiolo + folhasCapa;

    const precoPapel = PAPEIS[m.papel] || 0;
    const precoPapelCapa = capaSeparada ? PAPEIS[m.papelCapa] || 0 : 0;
    const custoMiolo = precoPapel * folhasMiolo;
    const custoCapa = precoPapelCapa * folhasCapa;
    const custoImpressao = custoMiolo + custoCapa;

    let custoFuro = 0;
    if (m.furo === 'Somente furo') custoFuro = qtdFolhasA4 * FURO_POR_FOLHA;
    else if (m.furo === 'Furo e Ilhós') custoFuro = (qtdFolhasA4 * FURO_POR_FOLHA) + (qtdManuais * ILHOS_POR_MANUAL);

    // A tela manda o sim/não como texto ('true'/'false').
    const corteEspecial = m.corteEspecial === true || m.corteEspecial === 'true';
    const laminacao = LAMINACOES.includes(m.laminacao) ? m.laminacao : LAMINACOES[0];
    const laminado = laminacao !== LAMINACOES[0];
    const acabamentoLiberado = qtdFolhasA4 >= FOLHAS_MINIMAS_ACABAMENTO;
    const custoCorteEspecial = corteEspecial ? qtdFolhasA4 * CORTE_ESPECIAL_POR_FOLHA : 0;
    const custoLaminacao = laminado ? qtdFolhasA4 * LAMINACAO_POR_FOLHA : 0;

    const custoVariavel = qtdVariaveis <= 30 ? qtdVariaveis * 5 : qtdVariaveis * 3;
    const valorFinal = custoImpressao + custoFuro + custoCorteEspecial + custoLaminacao + custoVariavel;

    // Pedido com corte especial ou laminação abaixo de 10 folhas não tem preço.
    const pedidoCompleto = qtdPorA4 > 0 && qtdImpressoes > 0;
    const motivo = pedidoCompleto && (corteEspecial || laminado) && !acabamentoLiberado
        ? `${[corteEspecial && 'Corte especial', laminado && 'Laminação'].filter(Boolean).join(' e ')} só a partir de ${FOLHAS_MINIMAS_ACABAMENTO} folhas: este pedido usa ${qtdFolhasA4}.`
        : '';

    const partes = [
        `${qtdManuais} manuais`,
        `${qtdImpressoes} impressões`,
        `${m.largura}x${m.altura}cm`,
        capaSeparada ? `Miolo em ${m.papel}` : m.papel,
        ...(capaSeparada ? [`Capa em ${m.papelCapa}`] : []),
        m.furo,
        ...(corteEspecial ? ['Corte especial'] : []),
        ...(laminado ? [laminacao] : []),
        '4x0 (Colorido e somente frente)',
        ...(corteEspecial ? [] : ['Refile']),
        'Artes variáveis',
    ];
    const textoWhatsapp = `${partes.join(' | ')} - R$ ${brl(valorFinal)}`;

    return {
        ok: pedidoCompleto && !motivo,
        motivo,
        qtdPorA4, qtdFolhasA4, precoPapel, custoImpressao, custoFuro, custoVariavel, valorFinal, textoWhatsapp,
        capaSeparada, qtdCapas, qtdMiolo, folhasMiolo, folhasCapa, precoPapelCapa, custoMiolo, custoCapa,
        corteEspecial, laminacao, laminado, acabamentoLiberado, custoCorteEspecial, custoLaminacao,
    };
}
