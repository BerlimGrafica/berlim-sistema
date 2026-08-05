import { obterDataAtual } from './formatters';

// ==== LISTAS GLOBAIS DE ESTADOS ====
export const STATUSES_PRODUCAO = [
    'Aguardando Pagamento', 'Aguardando Retorno', 'Desenvolvimento de Arte',
    'Etiqueta Escolar', 'Produzir', 'Produção', 'Avisar Cliente', 'Retirada', 'Entrega'
];
export const STATUSES_FINALIZADOS = ['Abandonado', 'Cancelado', 'Concluído', 'Finalizado'];

// ==== MAPEAMENTO DE CORES DOS STATUS ====
export const obterCorStatus = (status) => {
    switch (status) {
        case 'Aguardando Pagamento': return 'text-emerald-500 dark:text-emerald-400';
        case 'Aguardando Retorno': return 'text-lime-500 dark:text-lime-400';
        case 'Desenvolvimento de Arte': return 'text-cyan-500 dark:text-cyan-400';
        case 'Etiqueta Escolar': return 'text-blue-600 dark:text-blue-500';
        case 'Produzir': return 'text-purple-500 dark:text-purple-400';
        case 'Produção': return 'text-gray-500 dark:text-gray-400';
        case 'Avisar Cliente': return 'text-pink-500 dark:text-pink-400';
        case 'Retirada': return 'text-sky-500 dark:text-sky-400';
        case 'Entrega': return 'text-teal-500 dark:text-teal-400';
        case 'Abandonado': return 'text-yellow-600 dark:text-yellow-400';
        case 'Cancelado': return 'text-red-500 dark:text-red-400';
        case 'Concluído': return 'text-orange-500 dark:text-orange-400';
        case 'Finalizado': return 'text-indigo-500 dark:text-indigo-400';
        default: return 'text-gray-700 dark:text-[#EDEDED]';
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
    if (!prazo) return 'border-gray-200 dark:border-darkBorder';
    const hoje = new Date(`${obterDataAtual()}T00:00:00`);
    const dataPrazo = new Date(`${prazo}T00:00:00`);
    const diffDias = Math.round((dataPrazo - hoje) / 86400000);
    if (diffDias <= 0) return 'border-red-500 dark:border-red-500';
    if (diffDias === 1) return 'border-yellow-500 dark:border-yellow-400';
    return 'border-emerald-500 dark:border-emerald-500';
};
