// ==== CONEXÃO COM BANCO E LISTAS ====
var supabase = window.supabase.createClient(
    'https://xbanoipgoleuahwbqksy.supabase.co',
    'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh'
);

var STATUSES_PRODUCAO = [
    'Aguardando Pagamento', 'Aguardando Retorno', 'Desenvolvimento de Arte', 
    'Etiqueta Escolar', 'Produzir', 'Produção', 'Avisar Cliente', 'Retirada'
];
var STATUSES_FINALIZADOS = ['Abandonado', 'Concluído', 'Finalizado'];
var RESPONSAVEIS = ['Gi', 'Murilo', 'Bruno', 'Nicole', 'Hellen', 'Jessica', 'Vini'];
var LOCAIS = ['Berlim', 'Futura', 'Atual Card', 'Alvo', 'Xexe', 'StampMix'];

// ==== FUNÇÕES DE FORMATAÇÃO GLOBAL ====
function obterCorStatus(status) {
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
        case 'Finalizado': return 'text-indigo-500 dark:text-indigo-400';
        default: return 'text-gray-700 dark:text-[#EDEDED]';
    }
}

function formatarMoeda(valor) {
    if (!valor) return '';
    const numeroLimpo = valor.toString().replace(/\D/g, ''); 
    if (numeroLimpo === '') return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(numeroLimpo) / 100);
}

function formatarTelefone(valor) {
    if (!valor) return '';
    let v = valor.replace(/\D/g, ''); 
    if (v.length > 11) v = v.substring(0, 11); 
    if (v.length > 2) v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length > 10) v = `${v.substring(0, 10)}-${v.substring(10)}`;
    return v;
}

function obterDataAtual() { 
    return new Date().toISOString().split('T')[0]; 
}

function formatarDataExibicao(dataISO) {
    if (!dataISO) return '---';
    const partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarMesAno(str) {
    if(!str) return '';
    const [y, m] = str.split('-');
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${mesesNomes[parseInt(m)-1]}/${y}`;
}

function desconstruirTextoServico(texto) {
    if (!texto) return { itens: [], observacoes: '' };
    let partes = texto.split('\n\n[OBSERVAÇÕES GERAIS]\n');
    let blocoItens = partes[0];
    let obs = partes[1] || '';
    if (!blocoItens.startsWith('• ') && partes.length === 1) return { itens: [], observacoes: texto };
    
    let itensTraduzidos = [];
    let blocosIndividuais = blocoItens.split('\n\n');
    
    for (let bloco of blocosIndividuais) {
        if (!bloco.startsWith('• ')) { obs = obs ? obs + '\n' + bloco : bloco; continue; }
        let lines = bloco.split('\n');
        if (lines.length < 3) { obs = obs ? obs + '\n' + bloco : bloco; continue; }
        
        let nome = lines[0].replace('• ', '').trim();
        let descricao = lines[1].replace(/^  /, '').trim();
        let AppValor = lines[2].replace(/^  Valor: R\$ /, '').trim();
        
        let valor = AppValor; let desconto = '';
        let matchDesconto = AppValor.match(/\s\(-(\d+)%\)$/);
        if (matchDesconto) { desconto = matchDesconto[1]; valor = AppValor.replace(matchDesconto[0], '').trim(); }
        
        itensTraduzidos.push({ nome, descricao, valor, desconto, id_temp: Math.random() + Date.now() });
    }
    return { itens: itensTraduzidos, observacoes: obs };
}

function obterResumoServicos(texto) {
    const desc = desconstruirTextoServico(texto);
    if (desc.itens.length > 0) {
        return desc.itens.map(i => i.nome).join(' + ');
    }
    return texto ? texto.substring(0, 40) + '...' : '---';
}
