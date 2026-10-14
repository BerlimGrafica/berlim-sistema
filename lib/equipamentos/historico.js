// O que a folha de papel nunca respondia sozinha, calculado a partir dos
// registros: quando foi a última carga de cada tinta, qual o último contador e
// quantas páginas cada carga rendeu.
//
// Funções puras sobre a lista de registros — sem rede, sem estado — para que a
// tela e o modal façam a mesma conta e para que a conta possa ser testada.

// Ordem cronológica de verdade: pela data e, no mesmo dia, pela ordem em que
// foram lançados. Duas cargas no mesmo dia acontecem (trocou o ciano de manhã,
// vazou, trocou de novo à tarde) e o id é quem as desempata.
const antes = (a, b) => (a.data === b.data ? a.id < b.id : a.data < b.data);

export const daMaquina = (registros, equipamentoId) =>
    (registros || []).filter(r => r.equipamento === equipamentoId);

// O registro mais recente de cada tinta reabastecida nesta máquina.
export function ultimaCargaPorTinta(registros, equipamentoId) {
    const mapa = {};
    for (const r of daMaquina(registros, equipamentoId)) {
        if (r.tipo !== 'Reabastecimento') continue;
        for (const t of r.cores || []) {
            if (!mapa[t] || antes(mapa[t], r)) mapa[t] = r;
        }
    }
    return mapa;
}

// O contador mais recente informado nesta máquina, venha de carga ou de
// manutenção — os dois leem o mesmo painel.
export function ultimoRegistroComContador(registros, equipamentoId) {
    let ultimo = null;
    for (const r of daMaquina(registros, equipamentoId)) {
        if (r.contador == null) continue;
        if (!ultimo || antes(ultimo, r)) ultimo = r;
    }
    return ultimo;
}

// Quantas páginas a carga ANTERIOR desta tinta rendeu, medidas no momento em
// que ela foi trocada por esta. É a pergunta que justifica anotar o contador:
// só se sabe quanto uma carga rendeu quando chega a próxima.
//
// Devolve null quando não há como saber (primeira carga registrada, contador
// em branco num dos dois) e quando o resultado seria negativo — o contador
// pode ter sido zerado num reparo, e um rendimento negativo seria um número
// falso apresentado como medida.
export function rendimentoDaCargaAnterior(registros, registro, tinta) {
    if (registro.tipo !== 'Reabastecimento' || registro.contador == null) return null;
    let anterior = null;
    for (const r of daMaquina(registros, registro.equipamento)) {
        if (r.id === registro.id || r.tipo !== 'Reabastecimento') continue;
        if (!(r.cores || []).includes(tinta) || !antes(r, registro)) continue;
        if (!anterior || antes(anterior, r)) anterior = r;
    }
    if (!anterior || anterior.contador == null) return null;
    const paginas = registro.contador - anterior.contador;
    return paginas >= 0 ? paginas : null;
}

// As tintas há mais tempo sem carga, entre as que já tiveram alguma — é a
// pergunta que a tira de tintas existe para responder de relance. Tinta nunca
// recarregada não entra: "nunca" não é "mais antiga", é desconhecida, e já
// aparece como tal. Quando todas têm a mesma idade não há o que destacar, e
// destacar todas seria o mesmo que não destacar nenhuma.
export function tintasMaisAntigas(ultimaCarga, tintas, hojeIso) {
    const idades = tintas
        .filter(t => ultimaCarga[t])
        .map(t => ({ t, dias: diasDesde(ultimaCarga[t].data, hojeIso) }));
    if (idades.length < 2) return new Set();
    const maior = Math.max(...idades.map(i => i.dias));
    const menor = Math.min(...idades.map(i => i.dias));
    if (maior === menor) return new Set();
    return new Set(idades.filter(i => i.dias === maior).map(i => i.t));
}

// Dias inteiros entre duas datas 'AAAA-MM-DD', sem passar por fuso.
export function diasDesde(dataIso, hojeIso) {
    if (!dataIso || !hojeIso) return null;
    const [a1, m1, d1] = dataIso.split('-').map(Number);
    const [a2, m2, d2] = hojeIso.split('-').map(Number);
    return Math.round((new Date(a2, m2 - 1, d2) - new Date(a1, m1 - 1, d1)) / 86400000);
}

// "hoje", "ontem", "12d". Curto, porque mora embaixo de uma amostra de tinta
// num cartão estreito de celular, ao lado de outras três.
export function idadeCurta(dias) {
    if (dias == null) return '—';
    if (dias <= 0) return 'hoje';
    if (dias === 1) return 'ontem';
    return `${dias}d`;
}

export const formatarContador = (n) =>
    n == null ? '—' : Number(n).toLocaleString('pt-BR');
