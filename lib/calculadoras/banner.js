// Banner / lona: a regra da calculadora de banner, sem tela.
//
// É a mesma conta de components/calculadoras/CalculadoraBanner.jsx, tirada de
// lá para a tela nova (/novascalculadoras) usar sem copiar. Enquanto as duas
// telas existirem, mudar um preço aqui é mudar só na nova: a antiga ainda tem
// a conta dela.
//
//   preço do m²: lona simples R$ 90, laminada R$ 130; sem acabamento, -R$ 10/m²;
//     ilhós de alumínio, +R$ 40/m² sobre o ilhós comum (como a laminada sobre a simples)
//   até 1x1 m: até 0,5 m² sai pelo mínimo de R$ 65; acima, um m² cheio
//   maior que 1 m num lado: cada lado conta pelo menos 1 m
//   prazo: para outro dia +30%, no mesmo dia +60%
//   bastão: tem o comprimento do lado onde vai (em cima e embaixo, a largura;
//     nas laterais, a altura). Até 100 cm, o comum; de 100 até 150 cm, o
//     grosso, +R$ 10/m²; acima de 150 cm não dá bastão nesse lado — vai no
//     outro, se ele couber, e senão só ilhós ou sem acabamento.
//
// As medidas entram em CENTÍMETROS (é assim que o balcão fala e o texto da O.S.
// sai); a conta do m² converte aqui dentro.

export const TIPOS_LONA = [
    { valor: 'simples', rotulo: 'Lona 440g brilho', precoM2: 90, texto: 'Lona 440g Brilho | Sem Laminação (Película de proteção)' },
    { valor: 'laminado', rotulo: 'Lona 440g laminada', precoM2: 130, texto: 'Lona 440g Brilho | Laminado Brilho ou Fosco' },
];

// No bastão e corda, onde vão os bastões: em cima e embaixo (o banner pendurado
// pelo lado de cima) ou nas laterais (pendurado de lado). O preço é o mesmo; o
// texto da O.S. diz qual, para a produção acabar do jeito certo.
export const BASTOES = [
    { valor: 'cima', rotulo: 'Em cima e embaixo' },
    { valor: 'lados', rotulo: 'Nas laterais' },
];

export const ACABAMENTOS = [
    { valor: 'bastao_corda', rotulo: 'Bastão e corda', texto: 'Acabamento em Bastão e Corda' },
    { valor: 'ilhos', rotulo: 'Ilhós', texto: 'Acabamento em Ilhós (Argolas de Ferro)' },
    { valor: 'ilhos_aluminio', rotulo: 'Ilhós de alumínio', texto: 'Acabamento em Ilhós de Alumínio', acrescimoM2: 40 },
    { valor: 'sem_acabamento', rotulo: 'Sem acabamento', texto: 'Sem Acabamento', descontoM2: 10 },
];

// Os mesmos três prazos servem ao banner e ao adesivo.
export const PRAZOS = [
    { valor: 'padrao', rotulo: 'Padrão', multiplicador: 1 },
    { valor: 'outro_dia', rotulo: 'Para outro dia', multiplicador: 1.3, acrescimo: '+30%' },
    { valor: 'mesmo_dia', rotulo: 'No mesmo dia', multiplicador: 1.6, acrescimo: '+60%' },
];
export const multiplicadorDoPrazo = (prazo) => PRAZOS.find(p => p.valor === prazo)?.multiplicador ?? 1;

export const PRECO_MINIMO = 65;
// Acima disto, quem atende confirma a disponibilidade antes de fechar.
export const VALOR_ALTO = 300;

// Os limites do bastão, em cm, e o acréscimo do grosso no m².
export const BASTAO_COMUM_ATE = 100;
export const BASTAO_LIMITE = 150;
export const BASTAO_GROSSO_M2 = 10;

// Onde o bastão vai, para um banner de l × a cm: o comprimento dele em cada
// posição, se cabe, e a posição que vale — a escolhida, ou a outra quando a
// escolhida passa de 150 cm e a outra não. `posicao` null: não dá bastão.
export function bastaoPara(lCm, aCm, preferida = 'cima') {
    const comprimento = { cima: lCm, lados: aCm };
    const cabe = { cima: lCm <= BASTAO_LIMITE, lados: aCm <= BASTAO_LIMITE };
    const outra = preferida === 'lados' ? 'cima' : 'lados';
    const posicao = cabe[preferida] ? preferida : cabe[outra] ? outra : null;
    return {
        posicao, cabe, comprimento,
        trocou: !!posicao && posicao !== preferida,
        grosso: !!posicao && comprimento[posicao] > BASTAO_COMUM_ATE,
    };
}

export const CONFIG_PADRAO = { largura: '', altura: '', tipo: 'simples', acabamento: 'bastao_corda', bastoes: 'cima', prazo: 'padrao', quantidade: 1 };

const medida = (v) => parseFloat(String(v ?? '').replace(',', '.'));

export function calcularBanner(entrada) {
    const c = { ...CONFIG_PADRAO, ...entrada };
    // Digitado em cm; a conta do m² é em metros.
    const l = medida(c.largura) / 100;
    const a = medida(c.altura) / 100;
    const quantidade = parseInt(c.quantidade, 10) || 1;
    if (isNaN(l) || isNaN(a) || l <= 0 || a <= 0) return { ok: false, total: 0, quantidade };

    // Bastão e corda: onde ele vai, e se dá. Os dois lados acima de 150 cm não
    // têm bastão: o preço não sai, e a tela diz o porquê.
    const bastao = c.acabamento === 'bastao_corda' ? bastaoPara(l * 100, a * 100, c.bastoes) : null;
    if (bastao && !bastao.posicao) {
        return {
            ok: false, total: 0, quantidade, bastao,
            motivo: `Bastão vai até ${BASTAO_LIMITE} cm, e os dois lados passam disso: só ilhós ou sem acabamento.`,
        };
    }

    let valorM2 = c.tipo === 'simples' ? 90.0 : 130.0;
    // O acabamento mexe no m²: sem acabamento tira, ilhós de alumínio põe.
    const acab = ACABAMENTOS.find(x => x.valor === c.acabamento);
    valorM2 += (acab?.acrescimoM2 || 0) - (acab?.descontoM2 || 0);
    if (bastao?.grosso) valorM2 += BASTAO_GROSSO_M2;

    let precoUnitario, regra, areaCobrada;
    const areaFisica = l * a;
    if (l <= 1 && a <= 1) {
        if (areaFisica <= 0.5) { precoUnitario = PRECO_MINIMO; regra = 'minimo'; areaCobrada = areaFisica; }
        else { precoUnitario = valorM2; regra = 'metro'; areaCobrada = 1; }
    } else {
        areaCobrada = Math.max(l, 1) * Math.max(a, 1);
        precoUnitario = areaCobrada * valorM2;
        regra = l < 1 || a < 1 ? 'lado-minimo' : 'area';
    }

    const multiplicador = multiplicadorDoPrazo(c.prazo);
    const total = Number(((precoUnitario * multiplicador) * quantidade).toFixed(2));

    const tipo = TIPOS_LONA.find(t => t.valor === c.tipo) || TIPOS_LONA[1];
    const acabamento = ACABAMENTOS.find(x => x.valor === c.acabamento) || ACABAMENTOS.find(x => x.valor === 'sem_acabamento');
    const dimensao = `${Math.round(l * 100)}x${Math.round(a * 100)}cm`;
    // O texto da O.S. diz o bastão de verdade: grosso ou comum, e nas laterais.
    const textoAcabamento = bastao
        ? `Acabamento em Bastão${bastao.grosso ? ' Grosso' : ''} e Corda${bastao.posicao === 'lados' ? ' nas Laterais' : ''}`
        : acabamento.texto;
    const texto = `${quantidade} ${quantidade > 1 ? 'Banners' : 'Banner'} | ${dimensao} | ${tipo.texto} | ${textoAcabamento} - R$ ${total.toFixed(2).replace('.', ',')}`;

    return {
        ok: true, quantidade, valorM2, areaFisica, areaCobrada, regra, multiplicador, bastao,
        unitario: total / quantidade, total, texto,
        valorAlto: total > VALOR_ALTO,
    };
}
