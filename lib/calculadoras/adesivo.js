import { multiplicadorDoPrazo } from '@/lib/calculadoras/banner';

// Adesivos de vinil: a regra sem tela.
//
// É a mesma conta de components/calculadoras/CalculadoraAdesivo.jsx (e as
// folhas de MontagemNaFolha.jsx), tirada de lá para a tela nova
// (/novascalculadoras) usar sem copiar. Enquanto as duas telas existirem,
// mudar uma regra aqui é mudar só na nova — menos o encaixe na folha
// (`cabem`/`encaixe`), que a tela de hoje importa daqui.
//
// O preço sai da MENOR folha em que a quantidade inteira cabe:
//   folha SRA3 (área útil 26 x 39 cm)  → preço de SRA3 do tipo
//   meio metro (44 x 94 cm)            → preço de 1/2 metro do tipo
//   metro (94 x 94 cm)                 → preço do metro do tipo
//   mais que um metro                  → metros necessários × preço do metro
// Cada peça leva 0,2 cm de sangria e é montada em pé ou deitada, a posição em
// que cabem mais: 4x6 e 6x4 dão o mesmo preço. Os preços vêm do catálogo
// (produtos 15 a 21); sem o produto, vale o número de sempre.

export const SANGRIA = 0.2;
export const MINIMO_CM = 3;

// w e h são a área útil, a que a conta usa; wTotal e hTotal, a folha inteira
// (3 cm de margem de cada lado), que o desenho da montagem mostra em volta.
export const FOLHAS = {
    sra3: { rotulo: 'SRA3', nome: 'folha SRA3', w: 26, h: 39, wTotal: 32, hTotal: 45 },
    meio: { rotulo: 'Meio metro', nome: 'meio metro', w: 44, h: 94, wTotal: 50, hTotal: 100 },
    metro: { rotulo: 'Metro', nome: 'metro', w: 94, h: 94, wTotal: 100, hTotal: 100 },
};

// Como as peças se montam na folha: em colunas e linhas, na posição em que
// cabem mais. `deitado` diz se a peça foi girada (largura no lugar da altura);
// no empate fica em pé, como foi digitada. Uma posição só para a folha toda:
// é assim que a imposição sai para o corte.
export function encaixe(folha, l, a) {
    const emPe = { cols: Math.floor(folha.w / l), lins: Math.floor(folha.h / a), deitado: false };
    const girado = { cols: Math.floor(folha.w / a), lins: Math.floor(folha.h / l), deitado: true };
    const n = x => x.cols * x.lins;
    const melhor = n(girado) > n(emPe) ? girado : emPe;
    return { ...melhor, n: n(melhor) };
}
export const cabem = (folha, l, a) => encaixe(folha, l, a).n;

// A mesma escolha do preço: a menor folha em que a quantidade inteira cabe.
export function folhaDoPreco(largura, altura, quantidade) {
    const l = largura + SANGRIA, a = altura + SANGRIA;
    if (quantidade > 0 && quantidade <= cabem(FOLHAS.sra3, l, a)) return 'sra3';
    if (quantidade > 0 && quantidade <= cabem(FOLHAS.meio, l, a)) return 'meio';
    return 'metro';
}

// Os três tipos: o produto do metro, o da folha SRA3 e como aparecem no texto.
export const TIPOS = [
    { valor: '17', rotulo: 'Vinil branco', produtoMetro: 17, produtoSra3: 15, nome: 'Adesivo Vinil Branco', laminacao: ' | Sem Laminação' },
    { valor: '18', rotulo: 'Vinil branco laminado', produtoMetro: 18, produtoSra3: 21, nome: 'Adesivo Vinil Branco', laminacao: ' | Laminado Brilho/Fosco' },
    { valor: '19', rotulo: 'Vinil transparente', produtoMetro: 19, produtoSra3: 16, nome: 'Adesivo Vinil Transparente', laminacao: '' },
];

const PRECOS_DE_SEMPRE = { 15: 33, 16: 33, 17: 90, 18: 130, 19: 115, 21: 55 };
export const PRECO_MEIO_METRO_TRANSPARENTE = 80;

// Preço (em reais) e nome de cada produto usado, lidos do catálogo.
// `produtos` vem do banco com preco_base em centavos.
export function precosDoCatalogo(produtos = []) {
    const saida = {};
    for (const id of Object.keys(PRECOS_DE_SEMPRE)) {
        const p = produtos.find(x => Number(x.id) === Number(id));
        saida[id] = { preco: p ? (Number(p.preco_base) || 0) / 100 : PRECOS_DE_SEMPRE[id], nome: p?.nome || null };
    }
    return saida;
}

// O 1/2 metro tem regra própria por tipo: o transparente usa um valor fixo, o
// laminado é o dobro do SRA3 dele (produto 21) e o sem laminação sai por
// 0,7333 do metro.
export function precoMeioMetro(tipo, precos) {
    if (tipo === '19') return PRECO_MEIO_METRO_TRANSPARENTE;
    if (tipo === '18') return precos[21].preco * 2;
    return precos[17].preco * 0.7333;
}

// Os três preços do tipo, já sem prazo: [SRA3, meio metro, metro].
export function precosDoTipo(tipo, precos) {
    const t = TIPOS.find(x => x.valor === tipo) || TIPOS[0];
    return { sra3: precos[t.produtoSra3].preco, meio: precoMeioMetro(t.valor, precos), metro: precos[t.produtoMetro].preco };
}

export const CONFIG_PADRAO = { largura: '', altura: '', tipo: '17', prazo: 'padrao', quantidade: '' };

const medida = (v) => parseFloat(String(v ?? '').replace(',', '.'));
const reais = (v) => v.toFixed(2).replace('.', ',');
// No texto para o cliente a medida vai com vírgula ("5,5x5cm"), como se escreve
// em português, e o valor leva o preço de cada adesivo entre parênteses. Nisso
// o texto da tela nova difere do da tela de hoje, que escreve "5.5x5cm".
const medidaNoTexto = (n) => String(Number(n.toPrecision(12))).replace('.', ',');
// O unitário sai do total que o cliente lê (já em centavos), não do valor
// cru: R$ 85,80 por 40 dá R$ 2,15, e não os R$ 2,14 de 85,7961 ÷ 40.
const comUnitario = (total, quantidade) => {
    const centavos = Math.round(total * 100);
    return `R$ ${reais(centavos / 100)}${quantidade > 0 ? ` (R$ ${reais(Math.round(centavos / quantidade) / 100)} cada)` : ''}`;
};

export function calcularAdesivo(entrada, precos) {
    const c = { ...CONFIG_PADRAO, ...entrada };
    const lRaw = medida(c.largura);
    const aRaw = medida(c.altura);
    const qtd = parseInt(c.quantidade, 10) || 0;
    const multiplicador = multiplicadorDoPrazo(c.prazo);
    const abaixoDoMinimo = (lRaw > 0 && lRaw < MINIMO_CM) || (aRaw > 0 && aRaw < MINIMO_CM);
    const temMedidas = !isNaN(lRaw) && !isNaN(aRaw) && lRaw > 0 && aRaw > 0;

    const base = { ok: false, total: 0, metros: 0, quantidade: qtd, multiplicador, abaixoDoMinimo, temMedidas, largura: lRaw, altura: aRaw };
    if (!temMedidas) return base;

    const l = lRaw + SANGRIA, a = aRaw + SANGRIA;
    const porFolha = { sra3: cabem(FOLHAS.sra3, l, a), meio: cabem(FOLHAS.meio, l, a), metro: cabem(FOLHAS.metro, l, a) };
    const precosTipo = precosDoTipo(c.tipo, precos);
    const comPrazo = { sra3: precosTipo.sra3 * multiplicador, meio: precosTipo.meio * multiplicador, metro: precosTipo.metro * multiplicador };
    if (qtd <= 0) return { ...base, porFolha, precos: comPrazo };

    let total, folha;
    if (porFolha.sra3 > 0 && qtd <= porFolha.sra3) { total = precosTipo.sra3; folha = 'sra3'; }
    else if (porFolha.meio > 0 && qtd <= porFolha.meio) { total = precosTipo.meio; folha = 'meio'; }
    else if (porFolha.metro > 0 && qtd <= porFolha.metro) { total = precosTipo.metro; folha = 'metro'; }
    else if (porFolha.metro > 0) { total = (qtd / porFolha.metro) * precosTipo.metro; folha = 'metros'; }
    else { total = ((l * a) / 10000) * qtd * precosTipo.metro; folha = 'area'; }
    total = Number((total * multiplicador).toFixed(2));

    const metros = porFolha.metro > 0 ? Number((qtd / porFolha.metro).toFixed(2)) : 0;

    // O texto diz onde coube: é isso que decide a impressão e a entrega.
    const t = TIPOS.find(x => x.valor === c.tipo) || TIPOS[0];
    let impressao, entrega;
    if (porFolha.sra3 > 0 && qtd <= porFolha.sra3) { impressao = ' | Impressão Laser'; entrega = ' | Entregue em folha A3'; }
    else if (porFolha.meio > 0 && qtd <= porFolha.meio) { impressao = ' | Impressão Laser ou Látex'; entrega = ' | Entregue em folha A3 ou 1/2 metro'; }
    else { impressao = ' | Impressão Látex'; entrega = ' | Entregue em folha de 1/2 metro'; }
    const texto = `${qtd} ${qtd > 1 ? 'Adesivos' : 'Adesivo'} | ${medidaNoTexto(lRaw)}x${medidaNoTexto(aRaw)}cm | ${t.nome}${t.laminacao}${impressao} | 1/2 corte${entrega} - ${comUnitario(total, qtd)}`;

    return { ...base, ok: true, porFolha, precos: comPrazo, total, unitario: total / qtd, folha, metros, texto };
}

// As quantidades máximas de cada folha, arredondadas para baixo de 10 em 10,
// com o preço de cada uma — o "e se levar mais?" do adesivo. Uma linha por
// folha em que cabe pelo menos 10.
export function quantidadesMaximas(entrada, precos) {
    const r = calcularAdesivo({ ...entrada, quantidade: '' }, precos);
    if (!r.temMedidas) return [];
    const ordem = [
        ['sra3', ' | Impressão Laser ou Látex', ' | Entregue em folha A3'],
        ['meio', ' | Impressão Laser ou Látex', ' | Entregue em folha A3 ou 1/2 metro'],
        ['metro', ' | Impressão Látex', ' | Entregue em folha de 1/2 metro'],
    ];
    const t = TIPOS.find(x => x.valor === (entrada.tipo || '17')) || TIPOS[0];
    return ordem.map(([folha, impressao, entrega]) => {
        const quantidade = Math.floor(r.porFolha[folha] / 10) * 10;
        const preco = r.precos[folha];
        return {
            folha, quantidade, preco,
            texto: `${quantidade} Adesivos | ${medidaNoTexto(r.largura)}x${medidaNoTexto(r.altura)}cm | ${t.nome}${impressao}${t.laminacao} | 1/2 corte${entrega} - ${comUnitario(preco, quantidade)}`,
        };
    }).filter(x => x.quantidade > 0);
}
