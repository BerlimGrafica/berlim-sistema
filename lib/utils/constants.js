import { obterDataAtual } from './formatters';

// ==== LISTAS GLOBAIS DE ESTADOS ====
export const STATUSES_PRODUCAO = [
    'Aguardando Pagamento', 'Aguardando Retorno', 'Desenvolvimento de Arte',
    'Etiqueta Escolar', 'Produzir', 'Produção', 'Avisar Cliente', 'Entrega', 'Retirada'
];
export const STATUSES_FINALIZADOS = ['Abandonado', 'Cancelado', 'Concluído', 'Finalizado'];

// Etapas em que o serviço já voltou da terceirizada e está na loja. O alerta de
// prazo da Futura ("Retirar!") é sobre buscar o material lá — depois que a O.S.
// chega numa destas, ele vira ruído: a retirada já aconteceu.
export const STATUSES_JA_RETIRADO_DA_FUTURA = ['Avisar Cliente', 'Entrega', 'Retirada'];

// ==== MAPEAMENTO DE CORES DOS STATUS ====
export const obterCorStatus = (status) => {
    switch (status) {
        case 'Aguardando Pagamento': return 'text-emerald-500 dark:text-emerald-400';
        case 'Aguardando Retorno': return 'text-lime-500 dark:text-lime-400';
        case 'Desenvolvimento de Arte': return 'text-cyan-500 dark:text-cyan-400';
        case 'Etiqueta Escolar': return 'text-blue-600 dark:text-blue-500';
        case 'Produzir': return 'text-purple-500 dark:text-purple-400';
        case 'Produção': return 'text-tinta-suave';
        case 'Avisar Cliente': return 'text-pink-500 dark:text-pink-400';
        case 'Retirada': return 'text-sky-500 dark:text-sky-400';
        case 'Entrega': return 'text-teal-500 dark:text-teal-400';
        case 'Abandonado': return 'text-yellow-600 dark:text-yellow-400';
        case 'Cancelado': return 'text-red-500 dark:text-red-400';
        case 'Concluído': return 'text-orange-500 dark:text-orange-400';
        case 'Finalizado': return 'text-indigo-500 dark:text-indigo-400';
        default: return 'text-tinta-corpo';
    }
};

// Mesmo mapeamento de obterCorStatus, mas como fundo sólido (cor cheia, texto
// branco) em vez de texto colorido — usado na linha de cabeçalho de cada grupo
// de status na aba Produção.
export const obterCorFundoStatus = (status) => {
    switch (status) {
        case 'Aguardando Pagamento': return 'bg-emerald-500 dark:bg-emerald-600';
        case 'Aguardando Retorno': return 'bg-lime-500 dark:bg-lime-600';
        case 'Desenvolvimento de Arte': return 'bg-cyan-500 dark:bg-cyan-600';
        case 'Etiqueta Escolar': return 'bg-blue-600 dark:bg-blue-700';
        case 'Produzir': return 'bg-purple-500 dark:bg-purple-600';
        case 'Produção': return 'bg-gray-500 dark:bg-gray-600';
        case 'Avisar Cliente': return 'bg-pink-500 dark:bg-pink-600';
        case 'Retirada': return 'bg-sky-500 dark:bg-sky-600';
        case 'Entrega': return 'bg-teal-500 dark:bg-teal-600';
        case 'Abandonado': return 'bg-yellow-600 dark:bg-yellow-700';
        case 'Cancelado': return 'bg-red-500 dark:bg-red-600';
        case 'Concluído': return 'bg-orange-500 dark:bg-orange-600';
        case 'Finalizado': return 'bg-indigo-500 dark:bg-indigo-600';
        default: return 'bg-gray-500 dark:bg-gray-600';
    }
};

// Cor do contorno do campo de prazo, de acordo com a proximidade da data:
// verde por padrão, amarelo faltando 1 dia, vermelho no último dia ou atrasado.
export const obterCorContornoPrazo = (prazo) => {
    if (!prazo) return 'border-borda';
    const hoje = new Date(`${obterDataAtual()}T00:00:00`);
    const dataPrazo = new Date(`${prazo}T00:00:00`);
    const diffDias = Math.round((dataPrazo - hoje) / 86400000);
    if (diffDias <= 0) return 'border-red-500 dark:border-red-500';
    if (diffDias === 1) return 'border-yellow-500 dark:border-yellow-400';
    return 'border-emerald-500 dark:border-emerald-500';
};

// ==== CATEGORIAS DE CONTA A PAGAR ====
// Fonte única de rótulo, ícone e cor.
//
// A mesma categoria era pintada de quatro jeitos: o modal e o cadastro de
// fornecedores concordavam (azul/âmbar/roxo), mas o chip da listagem usava
// teal/roxo/índigo e a legenda do gráfico, cinza/roxo/índigo. O pior não era a
// feiura — era o roxo significar "Manutenção" numa tela e "Terceirização" na
// outra, o que treina a pessoa a ler a cor errada.
//
// As classes ficam escritas por extenso, e não montadas com o nome do tom: o
// Tailwind só gera o que encontra escrito no código, e `bg-${tom}-100` sairia
// como classe inexistente.
//
// Três formatos porque são três desenhos: o cartão de escolha do modal, o chip
// da listagem e o ponto da legenda do gráfico.
export const CATEGORIAS_CONTA = [
    {
        value: 'Despesa', label: 'Despesa', icone: 'dollar-sign',
        cartao: { borda: 'border-emerald-500', fundo: 'bg-emerald-50 dark:bg-emerald-900/20', icone: 'bg-emerald-500', texto: 'text-emerald-700 dark:text-emerald-300' },
        chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        ponto: 'bg-emerald-500',
    },
    {
        value: 'Material', label: 'Material', icone: 'shopping-bag',
        cartao: { borda: 'border-blue-500', fundo: 'bg-blue-50 dark:bg-blue-900/20', icone: 'bg-blue-500', texto: 'text-blue-700 dark:text-blue-300' },
        chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        ponto: 'bg-blue-500',
    },
    {
        value: 'Manutenção', label: 'Manutenção', icone: 'wrench',
        cartao: { borda: 'border-amber-500', fundo: 'bg-amber-50 dark:bg-amber-900/20', icone: 'bg-amber-500', texto: 'text-amber-700 dark:text-amber-300' },
        chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        ponto: 'bg-amber-500',
    },
    {
        value: 'Terceirização', label: 'Terceirização', icone: 'package',
        cartao: { borda: 'border-purple-500', fundo: 'bg-purple-50 dark:bg-purple-900/20', icone: 'bg-purple-500', texto: 'text-purple-700 dark:text-purple-300' },
        chip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        ponto: 'bg-purple-500',
    },
    {
        // Imposto não tem fornecedor: a conta é descrita à mão, como a Despesa.
        value: 'Impostos', label: 'Impostos', icone: 'file-text',
        cartao: { borda: 'border-rose-500', fundo: 'bg-rose-50 dark:bg-rose-900/20', icone: 'bg-rose-500', texto: 'text-rose-700 dark:text-rose-300' },
        chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        ponto: 'bg-rose-500',
    },
];

// Conta sem categoria é Despesa — é o que o banco assume ao agrupar
// (ver metricas_vendas_migration.sql).
export const categoriaConta = (valor) => CATEGORIAS_CONTA.find(c => c.value === valor) ?? CATEGORIAS_CONTA[0];
