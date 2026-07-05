// config.js
const supabase = supabase.createClient(
    'https://xbanoipgoleuahwbqksy.supabase.co',
    'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh'
);

// ==== LISTAS GLOBAIS DE ESTADOS ====
const STATUSES_PRODUCAO = [
    'Aguardando Pagamento', 'Aguardando Retorno', 'Desenvolvimento de Arte', 
    'Etiqueta Escolar', 'Produzir', 'Produção', 'Avisar Cliente', 'Retirada'
];
const STATUSES_FINALIZADOS = ['Abandonado', 'Concluído'];
const RESPONSAVEIS = ['Gi', 'Murilo', 'Bruno', 'Nicole', 'Hellen', 'Jessica', 'Vini'];
const LOCAIS = ['Berlim', 'Futura', 'Atual Card', 'Alvo', 'Xexe', 'StampMix'];

// ==== MAPEAMENTO DE CORES DOS STATUS ====
const obterCorStatus = (status) => {
    switch (status) {
        case 'Aguardando Pagamento': return 'text-emerald-500 dark:text-emerald-400';
        case 'Aguardando Retorno': return 'text-lime-500 dark:text-lime-400';
        case 'Desenvolvimento de Arte': return 'text-cyan-500 dark:text-cyan-400';
        case 'Etiqueta Escolar': return 'text-blue-600 dark:text-blue-500';
        case 'Produzir': return 'text-purple-500 dark:text-purple-400';
        case 'Produção': return 'text-gray-500 dark:text-gray-400';
        case 'Avisar Cliente': return 'text-pink-500 dark:text-pink-400';
        case 'Retirada': return 'text-sky-500 dark:text-sky-400';
        case 'Abandonado': return 'text-yellow-600 dark:text-yellow-400';
        case 'Concluído': return 'text-orange-500 dark:text-orange-400';
        default: return 'text-gray-700 dark:text-[#EDEDED]';
    }
};
