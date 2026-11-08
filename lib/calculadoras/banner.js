// Banner / lona: a regra da calculadora de banner, sem tela.
//
// É a mesma conta de components/calculadoras/CalculadoraBanner.jsx, tirada de
// lá para a tela nova (/novascalculadoras) usar sem copiar. Enquanto as duas
// telas existirem, mudar um preço aqui é mudar só na nova: a antiga ainda tem
// a conta dela.
//
//   preço do m²: lona simples R$ 90, laminada R$ 130; sem acabamento, -R$ 10/m²
//   até 1x1 m: até 0,5 m² sai pelo mínimo de R$ 65; acima, um m² cheio
//   maior que 1 m num lado: cada lado conta pelo menos 1 m
//   prazo: para outro dia +30%, no mesmo dia +60%

export const TIPOS_LONA = [
    { valor: 'simples', rotulo: 'Lona 440g brilho', precoM2: 90, texto: 'Lona 440g Brilho | Sem Laminação (Película de proteção)' },
    { valor: 'laminado', rotulo: 'Lona 440g laminada', precoM2: 130, texto: 'Lona 440g Brilho | Laminado Brilho ou Fosco' },
];

export const ACABAMENTOS = [
    { valor: 'bastao_corda', rotulo: 'Bastão e corda', texto: 'Acabamento em Bastão e Corda' },
    { valor: 'ilhos', rotulo: 'Ilhós', texto: 'Acabamento em Ilhós (Argolas de Ferro)' },
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

export const CONFIG_PADRAO = { largura: '', altura: '', tipo: 'simples', acabamento: 'bastao_corda', prazo: 'padrao', quantidade: 1 };

const medida = (v) => parseFloat(String(v ?? '').replace(',', '.'));

export function calcularBanner(entrada) {
    const c = { ...CONFIG_PADRAO, ...entrada };
    const l = medida(c.largura);
    const a = medida(c.altura);
    const quantidade = parseInt(c.quantidade, 10) || 1;
    if (isNaN(l) || isNaN(a) || l <= 0 || a <= 0) return { ok: false, total: 0, quantidade };

    let valorM2 = c.tipo === 'simples' ? 90.0 : 130.0;
    if (c.acabamento === 'sem_acabamento') valorM2 -= 10.0;

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
    const acabamento = ACABAMENTOS.find(x => x.valor === c.acabamento) || ACABAMENTOS[2];
    const dimensao = `${Math.round(l * 100)}x${Math.round(a * 100)}cm`;
    const texto = `${quantidade} ${quantidade > 1 ? 'Banners' : 'Banner'} | ${dimensao} | ${tipo.texto} | ${acabamento.texto} - R$ ${total.toFixed(2).replace('.', ',')}`;

    return {
        ok: true, quantidade, valorM2, areaFisica, areaCobrada, regra, multiplicador,
        unitario: total / quantidade, total, texto,
        valorAlto: total > VALOR_ALTO,
    };
}
