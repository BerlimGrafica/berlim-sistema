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

// pag.valor é sempre uma magnitude positiva (o que o usuário digitou). Um
// Estorno é dinheiro voltando pro cliente, então entra negativo em qualquer
// soma de "total pago" — use este helper em vez de parseValorMoeda(pag.valor)
// sempre que estiver somando uma lista de pagamentos.
export const valorPagamentoComSinal = (pag) => (pag.forma === 'Estorno' ? -1 : 1) * parseValorMoeda(pag.valor);

// Mesma regra de sinal acima, para pagamentos vindos de pedido_pagamentos
// (valor_centavos inteiro em vez de string BR) — devolve reais.
export const valorPagamentoComSinalCentavos = (pag) => (pag.forma === 'Estorno' ? -1 : 1) * centavosParaReais(pag.valor_centavos);

// As colunas financeiras do banco (pedidos.valor_total, orcamentos_formalizados.valor,
// contas_pagar.valor, notas_fiscais.valor_pago, produtos.preco_base, links_pagamento.valor)
// guardam centavos (inteiro), pra não sofrer erro de arredondamento de float. Use
// paraCentavos() ao montar o payload de insert/update e centavosParaReais() ao ler
// essas colunas de volta pra exibir ou calcular.
export const paraCentavos = (valorMoeda) => Math.round(parseValorMoeda(valorMoeda) * 100);
export const centavosParaReais = (centavos) => (Number(centavos) || 0) / 100;

// Só os dígitos, para comparar telefone com telefone. Nunca compare a string
// formatada: "(11) 4457-6742" e "1144576742" são o mesmo número, e o hífen no
// meio faz qualquer busca por trecho falhar.
export const apenasDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

// Celular tem 9 dígitos depois do DDD (11 no total) e quebra 5-4; fixo tem 8
// (10 no total) e quebra 4-4. Enquanto não chega a 11 tratamos como fixo, senão
// o hífen pularia de lugar no meio da digitação.
export const formatarTelefone = (valor) => {
    const d = apenasDigitos(valor).substring(0, 11);
    if (!d) return '';
    if (d.length <= 2) return `(${d}`;
    const corpo = d.slice(2);
    const corte = d.length === 11 ? 5 : 4;
    const p1 = corpo.slice(0, corte);
    const p2 = corpo.slice(corte);
    return `(${d.slice(0, 2)}) ${p1}${p2 ? '-' + p2 : ''}`;
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

// ==== COR CONSISTENTE POR NOME (pessoa ou local) ====
// Usada tanto no avatar do chat (ChatPanel.jsx) quanto nos chips de responsável/local
// (ChipNome), pra que a cor de uma pessoa seja sempre a mesma em qualquer lugar do
// sistema. As cores fixas abaixo têm prioridade; qualquer outro nome cai no hash
// automático da paleta.
const CORES_NOME_FIXAS = {
    'murilo': 'bg-green-500',
    'produção': 'bg-black',
    'giovana': 'bg-purple-400',
    'vinicius': 'bg-red-500',
    'nicole': 'bg-yellow-400',
    'berlim': 'bg-orange-500',
    'futura': 'bg-blue-500',
    // Os demais locais de produção. Ficam fixos, e não no hash abaixo, porque o
    // hash colide: com 8 cores na paleta, AtualCard caía no mesmo laranja da
    // Berlim e ChromeSet no mesmo fúcsia da Alvo Print — e confundir terceirizado
    // com interno na tela da produção custa caro. Ao cadastrar um fornecedor novo
    // de terceirização, acrescente-o aqui com uma cor ainda não usada.
    'alvo print': 'bg-fuchsia-500',
    'atualcard': 'bg-teal-600',
    'xexe': 'bg-lime-600',
    'stampmix': 'bg-rose-500',
    'gráfica chromeset': 'bg-indigo-500',
    'outros': 'bg-slate-500',
};
export const PALETA_CORES_NOME = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500', 'bg-sky-500', 'bg-indigo-500', 'bg-fuchsia-500'];
export function corPorNome(nome) {
    const str = (nome || '?').trim().toLowerCase();
    let bg = CORES_NOME_FIXAS[str];
    if (!bg) {
        let soma = 0;
        for (let i = 0; i < str.length; i++) soma += str.charCodeAt(i);
        bg = PALETA_CORES_NOME[soma % PALETA_CORES_NOME.length];
    }
    // Fundo claro (amarelo) precisa de texto escuro pra manter contraste legível.
    return { bg, text: bg === 'bg-yellow-400' ? 'text-gray-900' : 'text-white' };
}

// A mesma cor do nome, invertida: fundo da superfície, texto e contorno no tom.
// Usada nos chips de local, onde vários chips coloridos cheios lado a lado
// pesavam mais que o nome do cliente acima deles.
//
// Uma entrada por fundo possível (os fixos acima e a paleta), escrita por
// extenso: o Tailwind só gera a classe que encontra escrita no código. O texto
// usa o tom 700 no claro e o 400 no escuro — o 500 do fundo cheio, como texto
// pequeno sobre branco, fica abaixo do contraste mínimo de leitura.
const CONTORNO_POR_FUNDO = {
    'bg-green-500': 'text-green-700 border-green-300 dark:text-green-400 dark:border-green-500/40',
    'bg-black': 'text-gray-900 border-gray-400 dark:text-gray-100 dark:border-gray-500',
    'bg-purple-400': 'text-purple-700 border-purple-300 dark:text-purple-300 dark:border-purple-400/40',
    'bg-red-500': 'text-red-700 border-red-300 dark:text-red-400 dark:border-red-500/40',
    'bg-yellow-400': 'text-yellow-700 border-yellow-300 dark:text-yellow-300 dark:border-yellow-400/40',
    'bg-orange-500': 'text-orange-700 border-orange-300 dark:text-orange-400 dark:border-orange-500/40',
    'bg-blue-500': 'text-blue-700 border-blue-300 dark:text-blue-400 dark:border-blue-500/40',
    'bg-fuchsia-500': 'text-fuchsia-700 border-fuchsia-300 dark:text-fuchsia-400 dark:border-fuchsia-500/40',
    'bg-teal-600': 'text-teal-700 border-teal-300 dark:text-teal-400 dark:border-teal-500/40',
    'bg-teal-500': 'text-teal-700 border-teal-300 dark:text-teal-400 dark:border-teal-500/40',
    'bg-lime-600': 'text-lime-700 border-lime-300 dark:text-lime-400 dark:border-lime-500/40',
    'bg-rose-500': 'text-rose-700 border-rose-300 dark:text-rose-400 dark:border-rose-500/40',
    'bg-indigo-500': 'text-indigo-700 border-indigo-300 dark:text-indigo-400 dark:border-indigo-500/40',
    'bg-slate-500': 'text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-500/50',
    'bg-amber-500': 'text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-500/40',
    'bg-emerald-500': 'text-emerald-700 border-emerald-300 dark:text-emerald-400 dark:border-emerald-500/40',
    'bg-sky-500': 'text-sky-700 border-sky-300 dark:text-sky-400 dark:border-sky-500/40',
};
export const corContornoPorNome = (nome) =>
    CONTORNO_POR_FUNDO[corPorNome(nome).bg] || 'text-tinta-corpo border-borda-forte';

// No modo demonstração (isDemo), esconde o nome do cliente exibido nos pedidos —
// a tabela "clientes" já vem vazia via RLS, mas o nome também vive como texto
// livre em pedidos.cliente e precisa ser mascarado na renderização.
export const mascararCliente = (nome, isDemo) => (isDemo ? 'Cliente Demo' : nome);

// Data de "hoje" no fuso LOCAL (não UTC). Importante: .toISOString() é sempre
// UTC — no fuso de Brasília (UTC-3, sem horário de verão desde 2019), isso
// fazia "hoje" virar "amanhã" já às 21h local, 3h antes da meia-noite de
// verdade (ex: "Vendas Hoje" zerando cedo, contas marcadas como vencidas
// antes da hora). Datas de calendário (vencimento, prazo etc.) devem sempre
// ser comparadas no fuso de quem usa o sistema, não em UTC.
export const obterDataAtual = () => {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

// Soma 1 mês a uma data "YYYY-MM-DD", preservando o dia quando possível e
// ajustando para o último dia do mês de destino quando ele não existe
// (ex: 31/01 -> 28 ou 29/02). Usada ao gerar a próxima parcela de uma conta
// recorrente, cujo vencimento deve avançar em relação ao vencimento anterior
// (não à data em que a conta foi paga).
export const adicionarMesData = (dataISO) => {
    if (!dataISO) return dataISO;
    const [ano, mes, dia] = dataISO.split('-').map(Number);
    let novoMes = mes + 1;
    let novoAno = ano;
    if (novoMes > 12) { novoMes = 1; novoAno++; }
    const ultimoDiaDoMes = new Date(novoAno, novoMes, 0).getDate();
    const novoDia = Math.min(dia, ultimoDiaDoMes);
    return `${novoAno}-${String(novoMes).padStart(2, '0')}-${String(novoDia).padStart(2, '0')}`;
};

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

// CPF tem 11 dígitos, CNPJ tem 14 — o próprio número diz qual documento é. Por
// isso não vale guardar um campo "tipo de pessoa" ao lado: seriam duas fontes
// para o mesmo fato, livres para divergir, e as notas já gravadas continuariam
// sem resposta. Derivar do número corrige o histórico junto.
//
// Enquanto o campo está sendo digitado (até 11 dígitos) vale CPF, que é a mesma
// fronteira usada por formatarCnpjCpf para escolher a máscara.
export const rotuloDocumento = (valor) => {
    const d = apenasDigitos(valor);
    if (!d) return 'CPF / CNPJ';
    return d.length > 11 ? 'CNPJ' : 'CPF';
};
