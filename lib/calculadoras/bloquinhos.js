// Precificação de bloquinhos de anotação.
//
// Porte de Planilha_Precificacao_Bloquinhos_Berlim_v2.xlsx (abas Orçamento,
// Custos, Cálculos, Listas e Fontes), com UMA diferença de política: a planilha
// calculava o preço por dois caminhos — uma tabela de preços comerciais e um
// piso de custo — e cobrava o maior dos dois. Aqui só existe o custo.
//
//     preço = custo industrial × (1 + margem) + arte
//
// A troca não é cosmética. Com dois caminhos, mexer num custo quase nunca mexia
// no preço: a tabela comercial vencia por larga margem e absorvia o aumento
// dentro do lucro, em silêncio. Agora todo real de custo aparece no preço na
// hora, multiplicado pela margem — e a margem é a única decisão comercial que
// sobra, num campo só.
//
// A arte entra DEPOIS da margem, de propósito: é repasse, não produção. Marcar
// R$ 50 de arte para R$ 110 seria cobrar lucro sobre uma hora de Illustrator
// que já foi cobrada pelo valor cheio.
//
// TODAS as premissas são editáveis, como na aba "Custos" da planilha. O que
// está aqui é só o valor de partida; quem chama passa os ajustes e este módulo
// funde os dois. Nada de número solto no meio da conta: se um dia o papel
// subir, o lugar de mexer é a tela, não este arquivo.

// Todo campo da tela chega como texto, e em português decimal se escreve com
// vírgula. Number('7,5') devolve NaN em silêncio, e um NaN solto contamina a
// conta inteira sem dizer de onde veio — o orçamento aparece vazio e não há
// pista de qual campo o quebrou. Tudo entra por aqui.
const numero = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const n = Number(String(v ?? '').replace(',', '.').trim());
    return Number.isFinite(n) ? n : 0;
};

// ---------------------------------------------------------------------------
// Papéis (aba "Listas", colunas K:Q)
//
// Uma tabela só para miolo e capa, porque é assim na origem: a capa de couchê
// 250g lê o mesmo preço de pacote que qualquer outro uso daquele papel. Separar
// em duas tabelas faria o mesmo papel ter dois preços a manter.
// ---------------------------------------------------------------------------
export const PAPEIS = [
    { nome: 'Sulfite 75g',      precoPacote: 23.90,  folhas: 500, rendimentoA4: 1, gramatura: 75,  miolo: true },
    { nome: 'Sulfite 90g',      precoPacote: 48.20,  folhas: 500, rendimentoA4: 1, gramatura: 90,  miolo: true },
    { nome: 'Offset 120g',      precoPacote: 168.22, folhas: 250, rendimentoA4: 9, gramatura: 120, miolo: true },
    { nome: 'Offset 240g',      precoPacote: 169.17, folhas: 125, rendimentoA4: 9, gramatura: 240 },
    { nome: 'Couchê 250g',      precoPacote: 169.29, folhas: 125, rendimentoA4: 9, gramatura: 250 },
    { nome: 'Couchê 300g',      precoPacote: 203.15, folhas: 125, rendimentoA4: 9, gramatura: 300 },
    { nome: 'Adesivo Colacril', precoPacote: 263.00, folhas: 100, rendimentoA4: 9, gramatura: 0 },
    { nome: 'Kraft 240g A4',    precoPacote: 108.00, folhas: 500, rendimentoA4: 1, gramatura: 240 },
];

export const PAPEIS_MIOLO = PAPEIS.filter(p => p.miolo);

export const IMPRESSOES_MIOLO = [
    { nome: 'Sem impressão',     custoA4: 0,    descricao: 'em branco' },
    { nome: '1x0 PB - Lexmark',  custoA4: 0.01, descricao: 'impressão 1x0 em preto' },
    { nome: '4x0 color - Epson', custoA4: 0.01, descricao: 'impressão colorida 4x0' },
];

export const ENCADERNACOES = ['Colado', 'Espiral', 'Wire-o'];

// `papel` aponta para a tabela acima: o custo do material da capa é o custo por
// A4 daquele papel. A capa dura não tem papel associado — ela é Paraná mais
// adesivo, e tem conta própria.
export const CAPAS = [
    { nome: 'Kraft 240g - laser colorida',           papel: 'Kraft 240g A4', impressaoA4: 0.30, passadasBopp: 0, dura: false, descricao: 'Capa e contracapa em kraft 240g, com impressão colorida' },
    { nome: 'Offset 240g - jato color',              papel: 'Offset 240g',   impressaoA4: 0.01, passadasBopp: 0, dura: false, descricao: 'Capa e contracapa em offset 240g, com impressão colorida' },
    { nome: 'Couchê 250g - laser color',             papel: 'Couchê 250g',   impressaoA4: 0.30, passadasBopp: 0, dura: false, descricao: 'Capa e contracapa em couchê 250g, com impressão colorida' },
    { nome: 'Couchê 250g - laser color + laminação', papel: 'Couchê 250g',   impressaoA4: 0.30, passadasBopp: 1, dura: false, descricao: 'Capa e contracapa em couchê 250g, com impressão colorida e laminação' },
    { nome: 'Couchê 300g - laser color',             papel: 'Couchê 300g',   impressaoA4: 0.30, passadasBopp: 0, dura: false, descricao: 'Capa e contracapa em couchê 300g, com impressão colorida' },
    { nome: 'Couchê 300g - laser color + laminação', papel: 'Couchê 300g',   impressaoA4: 0.30, passadasBopp: 1, dura: false, descricao: 'Capa e contracapa em couchê 300g, com impressão colorida e laminação' },
    { nome: 'Capa dura Paraná 1,9mm',                papel: null,            impressaoA4: 0,    passadasBopp: 0, dura: true,  descricao: 'Capa dura em papel Paraná 1,9mm, revestida com adesivo impresso e laminado' },
];

export const EMBALAGENS = ['Embalado coletivamente', 'Embalado individualmente'];
export const ARTES = ['Cliente envia arte pronta', 'Criar arte (+ R$ 50,00)'];

// Tabelas de faixa: vale a última linha cujo mínimo é <= o valor procurado.
// É o VLOOKUP com quarto argumento TRUE da planilha.
export const ESPIRAIS = [
    { minFolhas: 0,   tamanho: '7 mm',  custoPorBloco: 0.12 },
    { minFolhas: 26,  tamanho: '9 mm',  custoPorBloco: 0.13 },
    { minFolhas: 51,  tamanho: '12 mm', custoPorBloco: 0.15 },
    { minFolhas: 71,  tamanho: '14 mm', custoPorBloco: 0.18 },
    { minFolhas: 86,  tamanho: '17 mm', custoPorBloco: 0.21 },
    { minFolhas: 101, tamanho: '20 mm', custoPorBloco: 0.25 },
    { minFolhas: 121, tamanho: '23 mm', custoPorBloco: 0.28 },
    { minFolhas: 151, tamanho: '25 mm', custoPorBloco: 0.32 },
];

export const WIREOS = [
    { minFolhas: 0,   tamanho: '1/4"',  custoPorBloco: 0.60, passo: '3x1' },
    { minFolhas: 31,  tamanho: '5/16"', custoPorBloco: 0.67, passo: '3x1' },
    { minFolhas: 51,  tamanho: '3/8"',  custoPorBloco: 0.82, passo: '3x1' },
    { minFolhas: 61,  tamanho: '7/16"', custoPorBloco: 1.05, passo: '3x1' },
    { minFolhas: 86,  tamanho: '1/2"',  custoPorBloco: 1.12, passo: '3x1' },
    { minFolhas: 101, tamanho: '5/8"',  custoPorBloco: 0.65, passo: '2x1' },
    { minFolhas: 121, tamanho: '3/4"',  custoPorBloco: 0.85, passo: '2x1' },
    { minFolhas: 151, tamanho: '7/8"',  custoPorBloco: 1.10, passo: '2x1' },
    { minFolhas: 181, tamanho: '1"',    custoPorBloco: 1.25, passo: '2x1' },
];

export const QUANTIDADES_TABELA = [10, 20, 50, 100, 200, 500];
export const QUANTIDADE_MINIMA = 10;

// ---------------------------------------------------------------------------
// Formato
//
// A planilha trazia dois formatos fixos com o rendimento escrito à mão (10x14
// rende 4 por A4; A6 rende 2). Aqui a medida é sempre digitada, porque na
// prática ela varia pedido a pedido — e o rendimento é calculado.
// ---------------------------------------------------------------------------

// Área útil de uma A4 depois das margens que a impressora não alcança. É a
// mesma medida usada pela calculadora de papelaria de casamento.
const A4_UTIL = { largura: 20, altura: 28.7 };

// Quantas peças saem de uma A4, testando as duas orientações. Não é enfeite:
// um 10x14 rende 4 em pé e 2 deitado, e um A6 rende 1 em pé e 2 deitado — quem
// escolhe é a maior das duas contas. Esta regra reproduz exatamente os dois
// rendimentos que a planilha trazia fixos, o que é o teste de que ela é a mesma
// que o Vini usou na mão.
export function pecasPorA4(larguraCm, alturaCm) {
    const l = numero(larguraCm), a = numero(alturaCm);
    if (!(l > 0) || !(a > 0)) return 0;
    const cabem = (peL, peA) => Math.floor(A4_UTIL.largura / peL) * Math.floor(A4_UTIL.altura / peA);
    return Math.max(cabem(l, a), cabem(a, l));
}

// ---------------------------------------------------------------------------
// Premissas (aba "Custos") — tudo editável
// ---------------------------------------------------------------------------

export const PREMISSAS_PADRAO = {
    maoDeObra: {
        funcionarios: 5,
        salarioMedio: 2500,
        encargos: 0.70,          // sobre o salário
        horasMes: 220,
        aproveitamento: 0.70,    // parte das horas que é de fato produtiva
    },
    materiais: {
        boppPrecoBobina: 39.90,
        boppMetrosBobina: 100,
        boppConsumoPorA4: 0.21,  // A4 entrando pelo lado de 21 cm
        saquinhoPrecoPacote: 49.40,
        saquinhoUnidades: 590,
        durexPorUnidade: 0.04,
        embalagemColetivaMaterial: 2,   // kraft ou caixa, por pacote
        blocosPorPacote: 20,
        colaPorBlocoColado: 0.03,
        paranaPorBloco: 1.38,           // par de placas
        impressaoCapaDuraPorBloco: 0.30,
    },
    // Minutos. Os "setup" são por PEDIDO; o resto multiplica por A4, por folha
    // ou por bloquinho.
    tempos: {
        preparacaoPedido: 15,
        setupImpressao: 10,
        setupCorte: 15,
        setupColado: 20,
        setupEspiral: 15,
        setupWireO: 20,
        setupCapaFlexivel: 10,
        setupCapaDura: 25,
        manuseioPorA4: 0.015,
        laminacaoPorA4: 0.05,
        corteContagemPorBloco: 0.25,
        corteContagemPorFolha: 0.006,
        montagemColado: 0.55,
        montagemEspiral: 0.80,
        montagemWireO: 1.00,
        acabamentoCapaDura: 5.00,
        acabamentoCapaFlexivel: 0.30,
        embalagemIndividualPorBloco: 1,
        embalagemColetivaPorPacote: 4,
    },
    precificacao: {
        custosIndiretos: 0.30,   // sobre o custo industrial

        // A única decisão comercial que sobrou.
        //
        // 121% não é um número arbitrário: é a margem que reproduz o orçamento
        // fechado de R$ 511,25 (50 un., 10x14, 50 folhas 75g, wire-o, couchê
        // 250 laminada), que é a única referência de mercado que a gráfica tem.
        // Sai R$ 511,50 — 25 centavos acima, pelo arredondamento de R$ 0,25.
        margemSobreCusto: 1.21,

        valorCriacaoArte: 50,
        arredondamentoPreco: 0.25,
    },
    // Preço do pacote/resma de cada papel, por nome. O custo por A4 sai daqui
    // dividido pelas folhas do pacote e pelo rendimento.
    papeis: Object.fromEntries(PAPEIS.map(p => [p.nome, p.precoPacote])),
};

// Funde os ajustes vindos da tela com o padrão, em dois níveis, e coage tudo a
// número — os campos chegam como texto de <input>.
export function mesclarPremissas(ajustes = {}) {
    const saida = {};
    for (const [grupo, campos] of Object.entries(PREMISSAS_PADRAO)) {
        saida[grupo] = {};
        for (const [campo, padrao] of Object.entries(campos)) {
            const bruto = ajustes?.[grupo]?.[campo];
            const vazio = bruto === undefined || bruto === null || String(bruto).trim() === '';
            // Texto que não é número cai no PADRÃO, e não em zero. A tela já
            // barra isso — o campo segura o rascunho inválido sem publicá-lo —,
            // mas o que está guardado no navegador pode ter vindo de uma versão
            // anterior ou ter sido mexido à mão, e um zero silencioso aqui
            // baixaria o preço sem nada na tela dizendo por quê.
            const n = vazio ? NaN : Number(String(bruto).replace(',', '.').trim());
            saida[grupo][campo] = Number.isFinite(n) ? n : padrao;
        }
    }
    return saida;
}

export const custoHoraProdutiva = (p) => {
    const { funcionarios, salarioMedio, encargos, horasMes, aproveitamento } = p.maoDeObra;
    const horas = funcionarios * horasMes * aproveitamento;
    return horas > 0 ? (funcionarios * salarioMedio * (1 + encargos)) / horas : 0;
};

export const custoPapelPorA4 = (nome, p) => {
    const papel = PAPEIS.find(x => x.nome === nome);
    if (!papel) return 0;
    const preco = p.papeis[nome] ?? papel.precoPacote;
    return preco / (papel.folhas * papel.rendimentoA4);
};

export const custoBoppPorA4 = (p) => {
    const { boppPrecoBobina, boppMetrosBobina, boppConsumoPorA4 } = p.materiais;
    return boppMetrosBobina > 0 ? boppPrecoBobina / (boppMetrosBobina / boppConsumoPorA4) : 0;
};

export const custoSaquinho = (p) =>
    p.materiais.saquinhoUnidades > 0 ? p.materiais.saquinhoPrecoPacote / p.materiais.saquinhoUnidades : 0;

// ---------------------------------------------------------------------------
// Cálculo (aba "Cálculos")
// ---------------------------------------------------------------------------

const acharPorNome = (lista, nome) => lista.find(x => x.nome === nome) || lista[0];
const faixa = (tabela, valor) => {
    let achada = tabela[0];
    for (const linha of tabela) if (valor >= linha.minFolhas) achada = linha;
    return achada;
};

export const CONFIG_PADRAO = {
    quantidade: 50,
    larguraCm: 10,
    alturaCm: 14,
    rendimentoA4: '',       // vazio = calcular pelas medidas
    folhas: 50,
    papelMiolo: 'Sulfite 75g',
    impressaoMiolo: 'Sem impressão',
    encadernacao: 'Wire-o',
    capa: 'Couchê 250g - laser color + laminação',
    embalagem: 'Embalado coletivamente',
    arte: 'Cliente envia arte pronta',
    perda: 0.075,
};

// Quantas A4 de adesivo a capa dura consome por bloquinho. A planilha trazia
// 1,5 para o 10x14 e 2 para o A6 — dois números soltos, sem fórmula. O que os
// separa é o aproveitamento na folha: quanto mais peças cabem numa A4, menos
// adesivo por bloquinho. A regra abaixo devolve exatamente aqueles dois valores
// e estende o resto pelo lado conservador.
const adesivoPorBloco = (rendimento) => (rendimento >= 4 ? 1.5 : 2);

export function resolverFormato(c) {
    const largura = numero(c.larguraCm);
    const altura = numero(c.alturaCm);
    const calculado = pecasPorA4(largura, altura);
    const informado = numero(c.rendimentoA4);
    const rendimentoA4 = informado > 0 ? Math.floor(informado) : calculado;
    const medida = (n) => String(Number(n.toPrecision(12))).replace('.', ',');

    return {
        nome: largura > 0 && altura > 0 ? `${medida(largura)}x${medida(altura)} cm` : 'Sem medida',
        largura, altura,
        rendimentoA4,
        rendimentoCalculado: calculado,
        // Rendimento digitado à mão: a tela avisa quando ele diverge do
        // calculado, porque é a diferença entre um ajuste consciente de
        // montagem e um número esquecido de outro orçamento.
        rendimentoForcado: informado > 0 && Math.floor(informado) !== calculado,
        a4PorCapaDura: adesivoPorBloco(rendimentoA4),
    };
}

export function calcularBloquinho(entrada, ajustes) {
    const c = { ...CONFIG_PADRAO, ...entrada };
    const p = mesclarPremissas(ajustes);
    const qtd = Math.floor(numero(c.quantidade));
    const folhas = Math.floor(numero(c.folhas));
    const perda = numero(c.perda);

    const formato = resolverFormato(c);
    const papel = acharPorNome(PAPEIS_MIOLO, c.papelMiolo);
    const impressao = acharPorNome(IMPRESSOES_MIOLO, c.impressaoMiolo);
    const capa = acharPorNome(CAPAS, c.capa);
    const colado = c.encadernacao === 'Colado';
    const espiral = c.encadernacao === 'Espiral';
    const individual = c.embalagem === 'Embalado individualmente';
    const criarArte = c.arte === 'Criar arte (+ R$ 50,00)';
    const t = p.tempos;

    // --- Impedimentos ------------------------------------------------------
    const erros = [];
    if (qtd < QUANTIDADE_MINIMA) erros.push(`Quantidade mínima de ${QUANTIDADE_MINIMA} unidades.`);
    if (folhas < 1) erros.push('Informe quantas folhas tem cada bloquinho.');
    if (formato.rendimentoA4 < 1) erros.push('Este formato não cabe numa folha A4 — confira as medidas.');
    if (colado && capa.dura) erros.push('Capa dura não pode ser colada — use espiral ou wire-o.');

    const rendimento = Math.max(1, formato.rendimentoA4);

    // --- Folhas A4 consumidas ----------------------------------------------
    const a4Miolo = Math.ceil(qtd * folhas / rendimento);
    const a4CapaFlexivel = capa.dura ? 0 : Math.ceil(qtd * 2 / rendimento);
    const a4AdesivoCapaDura = capa.dura ? Math.ceil(qtd * formato.a4PorCapaDura) : 0;

    // --- Materiais ---------------------------------------------------------
    const boppA4 = custoBoppPorA4(p);
    const custoPapelMiolo = a4Miolo * custoPapelPorA4(papel.nome, p);
    const custoImpressaoMiolo = a4Miolo * impressao.custoA4;
    const materialCapaFlexivel = a4CapaFlexivel * (capa.papel ? custoPapelPorA4(capa.papel, p) : 0);
    const impressaoCapaFlexivel = a4CapaFlexivel * capa.impressaoA4;
    const boppCapaFlexivel = a4CapaFlexivel * capa.passadasBopp * boppA4;
    const materialCapaDura = capa.dura
        ? qtd * p.materiais.paranaPorBloco + a4AdesivoCapaDura * custoPapelPorA4('Adesivo Colacril', p)
        : 0;
    const impressaoCapaDura = capa.dura ? qtd * (p.materiais.impressaoCapaDuraPorBloco + boppA4) : 0;

    // --- Encadernação ------------------------------------------------------
    // "Folhas equivalentes" normaliza pela gramatura: 50 folhas de 120g ocupam
    // a lombada de 80 folhas de 75g, e é a lombada que escolhe o wire-o.
    const folhasEquivalentes = folhas * papel.gramatura / 75 + (capa.dura ? 35 : 10);
    const linhaEspiral = faixa(ESPIRAIS, folhasEquivalentes);
    const linhaWireO = faixa(WIREOS, folhasEquivalentes);
    const encadernacaoSugerida = colado ? 'Colado'
        : espiral ? linhaEspiral.tamanho
        : `${linhaWireO.tamanho} ${linhaWireO.passo}`;
    const custoEncadernacao = colado ? 0 : qtd * (espiral ? linhaEspiral.custoPorBloco : linhaWireO.custoPorBloco);
    const custoCola = colado ? qtd * p.materiais.colaPorBlocoColado : 0;

    // --- Embalagem ---------------------------------------------------------
    const pacotes = Math.ceil(qtd / Math.max(1, p.materiais.blocosPorPacote));
    const custoEmbalagem = individual
        ? qtd * (custoSaquinho(p) + p.materiais.durexPorUnidade)
        : pacotes * p.materiais.embalagemColetivaMaterial;

    // --- Mão de obra -------------------------------------------------------
    const minutos =
        t.preparacaoPedido + t.setupImpressao + t.setupCorte
        + (colado ? t.setupColado : espiral ? t.setupEspiral : t.setupWireO)
        + (capa.dura ? t.setupCapaDura : t.setupCapaFlexivel)
        + (impressao.nome === 'Sem impressão' ? 0 : a4Miolo * t.manuseioPorA4)
        + (a4CapaFlexivel + (capa.dura ? qtd : 0)) * t.manuseioPorA4
        + (a4CapaFlexivel * capa.passadasBopp + (capa.dura ? qtd : 0)) * t.laminacaoPorA4
        + qtd * (t.corteContagemPorBloco + folhas * t.corteContagemPorFolha)
        + qtd * (colado ? t.montagemColado : espiral ? t.montagemEspiral : t.montagemWireO)
        + qtd * (capa.dura ? t.acabamentoCapaDura : t.acabamentoCapaFlexivel)
        + (individual ? qtd * t.embalagemIndividualPorBloco : pacotes * t.embalagemColetivaPorPacote);
    const custoMaoDeObra = minutos / 60 * custoHoraProdutiva(p);

    // --- Custo industrial --------------------------------------------------
    //
    // A planilha soma aqui o intervalo P:X inteiro, que inclui as colunas R e V
    // — a CONTAGEM de folhas A4 da capa, não o custo delas. Ver a nota no fim
    // deste arquivo: aqui só entram as colunas de dinheiro.
    const materiaisDiretos =
        custoPapelMiolo + custoImpressaoMiolo
        + materialCapaFlexivel + impressaoCapaFlexivel + boppCapaFlexivel
        + materialCapaDura + impressaoCapaDura
        + custoEncadernacao + custoCola + custoEmbalagem;

    const custoIndustrial = (materiaisDiretos * (1 + perda) + custoMaoDeObra) * (1 + p.precificacao.custosIndiretos);
    const custoArte = criarArte ? p.precificacao.valorCriacaoArte : 0;
    const custoTotal = custoIndustrial + custoArte;
    const perdasEIndiretos = custoIndustrial - (materiaisDiretos + custoMaoDeObra);

    // --- Preço -------------------------------------------------------------
    const passo = p.precificacao.arredondamentoPreco || 0.01;
    const margem = p.precificacao.margemSobreCusto;
    const precoSugerido = erros.length
        ? 0
        : Math.round((custoIndustrial * (1 + margem) + custoArte) / passo) * passo;

    const precoUnitario = qtd > 0 ? precoSugerido / qtd : 0;
    const lucroBruto = precoSugerido - custoTotal;
    const margemBruta = precoSugerido > 0 ? lucroBruto / precoSugerido : 0;

    return {
        ok: erros.length === 0,
        erros,
        formato,
        a4Miolo, a4CapaFlexivel, a4AdesivoCapaDura,
        folhasEquivalentes, encadernacaoSugerida,
        minutos, pacotes,
        custos: {
            papelMiolo: custoPapelMiolo,
            impressaoMiolo: custoImpressaoMiolo,
            capas: materialCapaFlexivel + impressaoCapaFlexivel + boppCapaFlexivel + materialCapaDura + impressaoCapaDura,
            encadernacao: custoEncadernacao + custoCola,
            embalagem: custoEmbalagem,
            maoDeObra: custoMaoDeObra,
            perdasEIndiretos,
            arte: custoArte,
        },
        materiaisDiretos, custoIndustrial, custoTotal,
        margemAplicada: margem,
        precoSugerido, precoUnitario, lucroBruto, margemBruta,
    };
}

// A tabela de faixas da aba "Orçamento": a mesma configuração recalculada em
// 10, 20, 50, 100, 200 e 500 unidades. Responde "e se eu levar mais?" sem
// obrigar a mexer no formulário.
export function calcularFaixas(config, ajustes) {
    return QUANTIDADES_TABELA.map(quantidade => {
        const r = calcularBloquinho({ ...config, quantidade }, ajustes);
        return { quantidade, total: r.precoSugerido, unitario: r.precoUnitario, ok: r.ok };
    });
}

const reais = (v) => v.toFixed(2).replace('.', ',');

export function textoWhatsapp(config, r) {
    if (!r.ok) return 'Corrija a configuração antes de gerar o texto.';
    const capa = acharPorNome(CAPAS, config.capa);
    const impressao = acharPorNome(IMPRESSOES_MIOLO, config.impressaoMiolo);
    const arte = config.arte === 'Criar arte (+ R$ 50,00)'
        ? ' | Criação da arte inclusa'
        : ' | Cliente envia a arte pronta';

    return [
        'Olá! Segue o orçamento:',
        '',
        `${config.quantidade} bloquinhos de anotação | Tamanho: ${r.formato.nome} | ${capa.descricao} | `
        + `Encadernação: ${config.encadernacao} | Miolo: ${impressao.descricao} - ${config.folhas} folhas em ${config.papelMiolo} | `
        + `${config.embalagem}${arte}`,
        '',
        `Valor total: R$ ${reais(r.precoSugerido)}`,
        `Valor unitário: R$ ${reais(r.precoUnitario)}`,
        '',
        'Produção mínima: 10 unidades. A produção começa após a aprovação da arte e confirmação do pedido. '
        + 'Antes da produção, enviaremos a arte para conferência de todos os dados.',
    ].join('\n');
}

// ---------------------------------------------------------------------------
// NOTA SOBRE UMA DIFERENÇA PROPOSITAL EM RELAÇÃO À PLANILHA
//
// Em 'Cálculos', a coluna AF (materiais diretos) é =SUM(P5:X5)+AA5+AB5+AC5.
// Esse intervalo atravessa as colunas R ("A4 capa flexível") e V ("A4 adesivo
// capa dura"), que são CONTAGENS de folhas e não valores em reais — as colunas
// de custo delas são as vizinhas (S, T, U para a flexível; W, X para a dura).
//
// O efeito é somar um real por folha A4 de capa. No orçamento de referência
// (50 un., capa flexível, 25 A4) isso inflava o custo industrial de R$ 231,41
// para R$ 266,35 — 15% a mais. Numa capa dura a distorção é maior, porque a
// contagem de adesivo é de 1,5 A4 por bloquinho.
//
// Aqui o cálculo é sem esse acréscimo. Antes isso só mudava a margem exibida;
// agora que o preço nasce do custo, mudaria o preço — e é mais uma razão para
// não reproduzir o erro.
// ---------------------------------------------------------------------------
