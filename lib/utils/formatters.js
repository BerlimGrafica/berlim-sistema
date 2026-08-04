// ==== FORMATADORES ====
export const formatarValorFinanceiro = (valor) => {
    if (valor == null || isNaN(valor)) return '0,00';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
};

export const formatarMoeda = (valor) => {
    if (!valor) return '';
    const numeroLimpo = valor.toString().replace(/\D/g, '');
    if (numeroLimpo === '') return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(numeroLimpo) / 100);
};

// Inverso de formatarMoeda: converte "1.234,56" (string no padrão brasileiro) para 1234.56 (number).
export const parseValorMoeda = (valor) => parseFloat(String(valor ?? '').replace(/\./g, '').replace(',', '.')) || 0;

// As colunas financeiras do banco (pedidos.valor_total, orcamentos_formalizados.valor,
// contas_pagar.valor, notas_fiscais.valor_pago, produtos.preco_base, links_pagamento.valor)
// guardam centavos (inteiro), pra não sofrer erro de arredondamento de float. Use
// paraCentavos() ao montar o payload de insert/update e centavosParaReais() ao ler
// essas colunas de volta pra exibir ou calcular.
export const paraCentavos = (valorMoeda) => Math.round(parseValorMoeda(valorMoeda) * 100);
export const centavosParaReais = (centavos) => (Number(centavos) || 0) / 100;

export const formatarTelefone = (valor) => {
    if (!valor) return '';
    const x = valor.replace(/\D/g, '').substring(0, 11).match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    if (!x) return '';
    if (!x[2]) return x[1] ? `(${x[1]}` : '';
    return `(${x[1]}) ${x[2]}${x[3] ? '-' + x[3] : ''}`;
};

export const formatarCnpjCpf = (valor) => {
    if (!valor) return '';
    let v = valor.replace(/\D/g, '');
    if (v.length <= 11) {
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    } else {
        if (v.length > 14) v = v.substring(0, 14);
        if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
        else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
        else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    }
    return v;
};

// No modo demonstração (isDemo), esconde o nome do cliente exibido nos pedidos —
// a tabela "clientes" já vem vazia via RLS, mas o nome também vive como texto
// livre em pedidos.cliente e precisa ser mascarado na renderização.
export const mascararCliente = (nome, isDemo) => (isDemo ? 'Cliente Demo' : nome);

export const obterDataAtual = () => new Date().toISOString().split('T')[0];

export const formatarDataExibicao = (dataISO) => {
    if (!dataISO) return '---';
    const partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

export const formatarMesAno = (str) => {
    if(!str) return '';
    const [y, m] = str.split('-');
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${mesesNomes[parseInt(m)-1]}/${y}`;
};
