// Precificação de livros com Hot Melt.
//
// Porte de calculadora_hotmelt_berlim.xlsx (abas "Calculadora" e "Tabela Hot
// Melt"). Diferente da calculadora de bloquinhos, esta NÃO calcula custo: a
// planilha já parte de preços de venda por face impressa e por livro
// encadernado. O caminho é um só e é direto:
//
//     (impressão + capas + laminação + hot melt) × multiplicador de prazo
//     + prova física
//
// A prova física entra DEPOIS do multiplicador, de propósito: são R$ 50 fixos
// por um exemplar de aprovação, e produzir esse exemplar antes do lote não fica
// mais caro porque o resto do pedido é urgente.
//
// Duas coisas valem saber sobre as faixas de preço, porque são fáceis de ler
// errado:
//
//   A faixa de IMPRESSÃO é escolhida pelo número de FACES A4 do pedido inteiro,
//   não pela quantidade de livros. Um pedido de 10 livros de 400 páginas cai
//   numa faixa melhor que 100 livros de 20 páginas.
//
//   A faixa do HOT MELT é escolhida pela quantidade de LIVROS, e o preço dela
//   é por livro.
//
// Todas as tabelas são editáveis, como as células amarelas da aba de
// parâmetros. O que está aqui é só o valor de partida.

// Todo campo da tela chega como texto, e em português decimal se escreve com
// vírgula. Number('7,5') devolve NaN em silêncio, e um NaN solto contamina a
// conta inteira sem dizer de onde veio. Tudo entra por aqui.
const numero = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const n = Number(String(v ?? '').replace(',', '.').trim());
    return Number.isFinite(n) ? n : 0;
};

// ---------------------------------------------------------------------------
// Opções
// ---------------------------------------------------------------------------

export const MODALIDADES = [
    {
        valor: 'Livro completo',
        resumo: 'A Berlim imprime o miolo, faz a capa e encaderna.',
    },
    {
        valor: 'Somente Hot Melt',
        resumo: 'O cliente traz miolo e capa prontos; cobramos só a encadernação.',
    },
];

export const LAMINACOES = ['Fosca', 'Brilho', 'Sem laminação'];

// O papel do miolo decide o preço da face impressa.
//
// Na planilha ele era decorativo — uma célula de escolha que nenhuma fórmula
// lia, e offset 75g custava o mesmo que couchê. Agora cada papel tem o seu
// preço, e dois deles se comportam de forma diferente:
//
//   `temPB`      só o offset 75g tem preço separado para preto e branco. Nos
//                outros a impressão custa o mesmo dos dois jeitos, então a
//                tela nem oferece a divisão — é tudo colorido.
//   `porVolume`  só o offset 75g tem desconto por quantidade de faces (as
//                quatro faixas da planilha). Os outros têm um preço só, que
//                vale para dez faces ou dez mil.
export const PAPEIS_MIOLO = [
    { nome: 'Offset 75g',  temPB: true,  porVolume: true },
    { nome: 'Offset 90g',  temPB: false, porVolume: false },
    { nome: 'Offset 120g', temPB: false, porVolume: false },
    { nome: 'Couchê 115g', temPB: false, porVolume: false },
];

export const papelPorNome = (nome) => PAPEIS_MIOLO.find(p => p.nome === nome) || PAPEIS_MIOLO[0];

// Os degraus da escada de quantidade na tela. Não saem da planilha: são as
// faixas de hot melt (1, 2, 3, 5, 10, 25, 50) reduzidas ao que um pedido de
// livro costuma ser, para a coluna não virar uma lista de sete linhas quase
// idênticas.
export const QUANTIDADES_TABELA = [1, 5, 10, 25, 50, 100];

// ---------------------------------------------------------------------------
// Parâmetros (aba "Tabela Hot Melt") — tudo editável
// ---------------------------------------------------------------------------

export const PREMISSAS_PADRAO = {
    parametros: {
        capaColoridaPorLivro: 4.25,
        laminacaoPorFace: 1,
        minimoLaminacao: 10,
        provaFisica: 50,
        minimoLoteHotMelt: 50,
    },

    // Páginas que cabem numa face A4, por formato fechado. A4 é uma página por
    // face; A5 são duas; A6 são quatro.
    formatos: { A4: 1, A5: 2, A6: 4 },

    // Offset 75g, por faixa de volume. A chave é o MÍNIMO de faces da faixa —
    // a linha que vale é a última cujo mínimo não passou do total.
    impressaoPB:    { 1: 0.35, 501: 0.30, 1001: 0.25, 2501: 0.22 },
    impressaoColor: { 1: 0.60, 501: 0.50, 1001: 0.45, 2501: 0.42 },

    // Os demais papéis: um preço por face, sem faixa e sem distinção de cor.
    outrosPapeis: { 'Offset 90g': 0.90, 'Offset 120g': 1.50, 'Couchê 115g': 2.50 },

    // Hot melt por livro, por faixa de quantidade de livros.
    hotMeltPorLivro: { 1: 35, 2: 25, 3: 20, 5: 18, 10: 15, 25: 13, 50: 11 },

    // Multiplicador sobre o subtotal da produção. Os números da planilha são
    // 10/9, 13/9 e 16/9 — daí as dízimas.
    prazos: {
        '4 dias úteis': 1,
        '2–3 dias úteis': 10 / 9,
        '1 dia útil': 13 / 9,
        'Mesmo dia': 16 / 9,
    },
};

export const PRAZOS = Object.keys(PREMISSAS_PADRAO.prazos);
export const FORMATOS = Object.keys(PREMISSAS_PADRAO.formatos);

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
            // barra isso, mas o que está guardado no navegador pode ter vindo
            // de uma versão anterior ou ter sido mexido à mão, e um zero
            // silencioso aqui baixaria o preço sem nada explicando por quê.
            const n = vazio ? NaN : Number(String(bruto).replace(',', '.').trim());
            saida[grupo][campo] = Number.isFinite(n) ? n : padrao;
        }
    }
    return saida;
}

// Tabela de faixa guardada como mapa: vale a última chave <= o valor
// procurado. É o VLOOKUP com quarto argumento TRUE da planilha.
export function faixaDe(tabela, valor) {
    const chaves = Object.keys(tabela).map(Number).sort((a, b) => a - b);
    let achada = chaves[0];
    for (const k of chaves) if (valor >= k) achada = k;
    return { minimo: achada, valor: tabela[achada] };
}

// ---------------------------------------------------------------------------
// Cálculo
// ---------------------------------------------------------------------------

export const CONFIG_PADRAO = {
    modalidade: 'Livro completo',
    quantidade: 50,
    formato: 'A5',
    paginasPorFaceA4: '',   // vazio = usa o do formato
    paginasPB: 100,
    paginasColoridas: 0,
    prazo: '4 dias úteis',
    provaFisica: false,
    laminacao: 'Fosca',
    // Offset 75g por padrão: é o único com preço de P&B, e é o papel cujos
    // números vieram da planilha original.
    papelMiolo: 'Offset 75g',
    perda: 0.075,
};

export function calcularHotmelt(entrada, ajustes) {
    const c = { ...CONFIG_PADRAO, ...entrada };
    const p = mesclarPremissas(ajustes);

    const qtd = Math.floor(numero(c.quantidade));
    const paginasPB = Math.floor(numero(c.paginasPB));
    const paginasColoridas = Math.floor(numero(c.paginasColoridas));
    const paginas = paginasPB + paginasColoridas;
    const perda = numero(c.perda);

    const papel = papelPorNome(c.papelMiolo);
    const somenteHotMelt = c.modalidade === 'Somente Hot Melt';
    const semLaminacao = c.laminacao === 'Sem laminação';
    const querProva = !!c.provaFisica;

    const doFormato = p.formatos[c.formato] ?? 0;
    const manual = Math.floor(numero(c.paginasPorFaceA4));
    const paginasPorFace = manual > 0 ? manual : doFormato;
    const aproveitamentoForcado = manual > 0 && manual !== doFormato;

    // --- Impedimentos e ressalvas ------------------------------------------
    //
    // A planilha resolve isso numa célula de "Situação" só, e calcula o total
    // de qualquer jeito. Aqui a distinção importa: o que impede a conta de
    // existir vira ERRO e zera o preço; o que é decisão de quem atende vira
    // AVISO e deixa o orçamento passar.
    const erros = [];
    const avisos = [];

    if (qtd < 1) erros.push('Informe a quantidade de livros.');
    if (!somenteHotMelt) {
        if (paginas < 1) erros.push('Informe quantas páginas o livro tem.');
        if (paginasPorFace < 1) erros.push('Informe quantas páginas cabem numa face A4.');
        if (paginas > 0 && paginas % 2 !== 0) {
            avisos.push(`${paginas} páginas é número ímpar — confirme com o cliente antes de fechar.`);
        }
        if (querProva && c.prazo === 'Mesmo dia') {
            avisos.push('Prova física não sai no mesmo dia. O prazo precisa ser de pelo menos 1 dia útil.');
        }
    } else if (querProva) {
        avisos.push('Prova física não se aplica quando o cliente traz miolo e capa prontos — não foi cobrada.');
    }

    const podeCalcular = erros.length === 0;
    const porFace = Math.max(1, paginasPorFace);

    // --- Impressão do miolo -------------------------------------------------
    // A perda entra ANTES de escolher a faixa: o papel perdido também é papel
    // impresso, e é o total impresso que define o preço por face.
    const facesPB = somenteHotMelt ? 0 : Math.ceil(paginasPB * qtd / porFace * (1 + perda));
    const facesColoridas = somenteHotMelt ? 0 : Math.ceil(paginasColoridas * qtd / porFace * (1 + perda));
    const facesTotais = facesPB + facesColoridas;

    // Papel com faixa lê a tabela de volume; os outros têm preço único. Numa
    // página P&B de papel que não tem preço de P&B, vale o preço do papel — e
    // não zero, que seria imprimir de graça por causa de um campo esquecido.
    const linhaPB = faixaDe(p.impressaoPB, facesPB);
    const linhaColor = faixaDe(p.impressaoColor, facesColoridas);
    const precoDoPapel = p.outrosPapeis[papel.nome] ?? 0;
    const precoDe = (colorido, linha) => papel.porVolume ? linha.valor : precoDoPapel;

    const precoFacePB = facesPB > 0 ? precoDe(false, linhaPB) : 0;
    const precoFaceColor = facesColoridas > 0 ? precoDe(true, linhaColor) : 0;
    const impressaoMiolo = facesPB * precoFacePB + facesColoridas * precoFaceColor;

    // --- Capa, laminação e encadernação -------------------------------------
    const capas = somenteHotMelt ? 0 : qtd * p.parametros.capaColoridaPorLivro;
    const laminacao = (somenteHotMelt || semLaminacao)
        ? 0
        : Math.max(qtd * p.parametros.laminacaoPorFace, p.parametros.minimoLaminacao);

    const linhaHotMelt = faixaDe(p.hotMeltPorLivro, qtd);
    const hotMeltPorLivro = linhaHotMelt.valor;
    // O mínimo de lote é o que sustenta um pedido de uma ou duas unidades:
    // abrir a máquina custa o mesmo para um livro e para cinquenta.
    const hotMelt = Math.max(qtd * hotMeltPorLivro, p.parametros.minimoLoteHotMelt);
    const hotMeltNoMinimo = qtd * hotMeltPorLivro < p.parametros.minimoLoteHotMelt;

    // --- Prazo, prova e total -----------------------------------------------
    const subtotal = impressaoMiolo + capas + laminacao + hotMelt;
    const multiplicador = p.prazos[c.prazo] ?? 1;
    const adicionalUrgencia = subtotal * (multiplicador - 1);
    const prova = (!somenteHotMelt && querProva) ? p.parametros.provaFisica : 0;

    const total = podeCalcular ? subtotal * multiplicador + prova : 0;
    const porLivro = podeCalcular && qtd > 0 ? total / qtd : 0;

    const observacao = somenteHotMelt
        ? 'Cliente fornece miolo e capa prontos.'
        : (querProva
            ? 'Uma unidade completa será produzida antes do restante do lote.'
            : 'Capa sem orelhas e frete não incluído.');

    return {
        ok: podeCalcular,
        erros, avisos, observacao,
        somenteHotMelt,
        paginas, paginasPorFace, aproveitamentoForcado, formatoPadrao: doFormato,
        facesPB, facesColoridas, facesTotais,
        precoFacePB, precoFaceColor,
        papel,
        faixaPB: papel.porVolume ? linhaPB.minimo : null,
        faixaColor: papel.porVolume ? linhaColor.minimo : null,
        hotMeltPorLivro, hotMeltNoMinimo, faixaHotMelt: linhaHotMelt.minimo,
        partes: {
            impressaoMiolo,
            capas,
            laminacao,
            hotMelt,
            adicionalUrgencia,
            prova,
        },
        subtotal, multiplicador, adicionalUrgencia, prova,
        total, porLivro,
    };
}

// A mesma configuração recalculada em outras quantidades. Responde "e se eu
// levar mais?" sem obrigar a mexer no formulário.
export function calcularFaixas(config, ajustes) {
    return QUANTIDADES_TABELA.map(quantidade => {
        const r = calcularHotmelt({ ...config, quantidade }, ajustes);
        return { quantidade, total: r.total, porLivro: r.porLivro, ok: r.ok };
    });
}

const reais = (v) => v.toFixed(2).replace('.', ',');

export function textoWhatsapp(config, r) {
    if (!r.ok) return 'Corrija a configuração antes de gerar o texto.';

    // Papel sem preço de P&B não tem divisão para contar: é tudo impressão
    // colorida, e dizer "0 P&B" no orçamento só levantaria a pergunta.
    const paginas = !r.papel.temPB
        ? `${r.paginas} páginas coloridas`
        : `${r.paginas} páginas`
            + (Number(config.paginasColoridas) > 0
                ? ` (${config.paginasPB} P&B + ${config.paginasColoridas} coloridas)`
                : ' em P&B');

    const descricao = r.somenteHotMelt
        ? `${config.quantidade} livros — encadernação Hot Melt (miolo e capa fornecidos pelo cliente)`
        : `${config.quantidade} livros ${config.formato} | ${paginas}`
            + ` | Miolo em ${config.papelMiolo} | Capa colorida${config.laminacao === 'Sem laminação' ? ' sem laminação' : ` com laminação ${config.laminacao.toLowerCase()}`}`
            + ' | Encadernação Hot Melt';

    return [
        'Olá! Segue o orçamento:',
        '',
        descricao,
        `Prazo: ${config.prazo}${config.provaFisica && !r.somenteHotMelt ? ' | Com prova física' : ''}`,
        '',
        `Valor total: R$ ${reais(r.total)}`,
        `Valor por livro: R$ ${reais(r.porLivro)}`,
        '',
        'O Hot Melt inclui vinco e refiles. Capa sem orelhas. Frete não incluído. '
        + 'Alterações após a prova são cobradas separadamente.',
    ].join('\n');
}

// ---------------------------------------------------------------------------
// NOTAS SOBRE A PLANILHA DE ORIGEM
//
// 1. Na planilha, o "Papel do miolo" era uma célula de escolha que nenhuma
//    fórmula lia: offset 75g custava o mesmo que couchê. Aqui ele passou a ter
//    preço próprio, e essa é a única diferença de comportamento em relação ao
//    arquivo original. Offset 75g reproduz a planilha inteira (0,35 e 0,60 com
//    as quatro faixas de volume); os demais são mais caros e sem faixa.
//
// 2. A laminação escolhida não muda nada: só "Sem laminação" altera a
//    conta. Fosca e brilho custam o mesmo R$ 1,00 por face.
//
// 3. A planilha diz, nas regras, que a prova física "conta como uma unidade do
//    pedido" — mas nenhuma fórmula soma essa unidade à quantidade produzida.
//    Aqui também não soma, para não inventar uma cobrança que a planilha não
//    faz; o texto do orçamento avisa que a unidade será produzida antes.
// ---------------------------------------------------------------------------
