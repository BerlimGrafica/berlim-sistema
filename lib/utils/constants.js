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

// Etapas em que prazo vencido NÃO é atraso.
// - Aguardando Pagamento e Aguardando Retorno, as que vêm antes da arte: o
//   serviço está esperando o cliente pagar ou responder. O prazo ali não depende
//   da gráfica, e contá-lo como atraso cobrava da equipe o que está na mão do
//   cliente.
// - Retirada: o serviço já está pronto esperando o cliente buscar. O prazo de
//   produção virou história, e pintá-lo de vermelho enchia a tela de falsos
//   atrasos.
// Entrega fica de fora de propósito — ali a O.S. ainda precisa sair, e o atraso
// é real. Os protótipos (inicio.html, producao.html) recebem esta mesma lista
// pela página da rota, para a regra continuar escrita num lugar só.
export const STATUSES_SEM_ATRASO = ['Aguardando Pagamento', 'Aguardando Retorno', 'Retirada'];
export const contaComoAtraso = (status) => !STATUSES_SEM_ATRASO.includes(status);

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
// Quantos dias faltam para o prazo: negativo é atraso, 0 é hoje. Fica separado
// porque a mesma régua pinta dois desenhos — o contorno do seletor de data na
// tabela e o selo da linha compacta no celular — e duas cópias da conta
// divergiriam na primeira vez que alguém mudasse o limite de "em cima da hora".
const diasAteOPrazo = (prazo) => {
    const hoje = new Date(`${obterDataAtual()}T00:00:00`);
    const dataPrazo = new Date(`${prazo}T00:00:00`);
    return Math.round((dataPrazo - hoje) / 86400000);
};

// `status` é opcional: nas etapas de STATUSES_SEM_ATRASO o prazo fica neutro.
export const obterCorContornoPrazo = (prazo, status) => {
    if (!prazo) return 'border-borda';
    if (status && !contaComoAtraso(status)) return 'border-borda-forte';
    const dias = diasAteOPrazo(prazo);
    if (dias <= 0) return 'border-red-500 dark:border-red-500';
    if (dias === 1) return 'border-yellow-500 dark:border-yellow-400';
    return 'border-emerald-500 dark:border-emerald-500';
};

// O mesmo estado, preenchido em vez de contornado. Na linha compacta o prazo é
// um selo de dois dígitos; contorno fino nesse tamanho não se lê de relance.
export const obterCorSeloPrazo = (prazo, status) => {
    if (!prazo) return 'bg-realce text-tinta-fraca border border-borda';
    if (status && !contaComoAtraso(status)) return 'bg-realce text-tinta-suave border border-borda';
    const dias = diasAteOPrazo(prazo);
    if (dias <= 0) return 'bg-red-500 text-white';
    if (dias === 1) return 'bg-yellow-500 dark:bg-yellow-600 text-white';
    return 'bg-realce text-tinta-suave border border-borda';
};

// Horário limite (opcional) da O.S. — "entregar até as 14h". O selo só existe
// quando há hora; a cor segue a mesma ideia do prazo, mas medida em minutos no
// dia do prazo: vermelho se a hora já passou (ou se o dia já passou), âmbar
// faltando 2h ou menos, neutro no resto.
export const formatarHoraPrazo = (hora) => (hora ? hora.slice(0, 5) : '');
export const minutosAteOHorario = (prazo, hora) => {
    if (!prazo || !hora) return null;
    const [h, m] = hora.split(':').map(Number);
    return Math.round((new Date(`${prazo}T00:00:00`).getTime() + (h * 60 + m) * 60000 - Date.now()) / 60000);
};
export const obterCorSeloHora = (prazo, hora, status) => {
    const minutos = minutosAteOHorario(prazo, hora);
    if (minutos === null) return '';
    if (status && !contaComoAtraso(status)) return 'bg-superficie text-tinta-corpo border-borda-forte';
    if (minutos <= 0) return 'bg-red-500 text-white border-red-500';
    if (minutos <= 120) return 'bg-amber-400 text-amber-950 border-amber-400';
    return 'bg-superficie text-tinta-corpo border-borda-forte';
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
// da listagem e o ponto da legenda do gráfico. `cor` é o mesmo tom em hex, para
// os protótipos e gráficos (como as cores fixas dos locais terceiros).
//
// A paleta evita de propósito as três cores que já têm significado no sistema:
// vermelho (vencido / vence hoje), âmbar (vence amanhã) e verde (valor, pago).
// Antes Manutenção era âmbar e Impostos vermelho, e uma conta de imposto em dia
// parecia vencida. Ver DESIGN.md › cor de categoria de conta.
export const CATEGORIAS_CONTA = [
    {
        value: 'Despesa', label: 'Despesa', icone: 'dollar-sign', cor: '#64748B',
        cartao: { borda: 'border-slate-500', fundo: 'bg-slate-50 dark:bg-slate-800/40', icone: 'bg-slate-500', texto: 'text-slate-700 dark:text-slate-300' },
        chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
        ponto: 'bg-slate-500',
    },
    {
        value: 'Material', label: 'Material', icone: 'shopping-bag', cor: '#2A78D6',
        cartao: { borda: 'border-blue-500', fundo: 'bg-blue-50 dark:bg-blue-900/20', icone: 'bg-blue-500', texto: 'text-blue-700 dark:text-blue-300' },
        chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        ponto: 'bg-blue-500',
    },
    {
        value: 'Manutenção', label: 'Manutenção', icone: 'wrench', cor: '#EB6834',
        cartao: { borda: 'border-orange-500', fundo: 'bg-orange-50 dark:bg-orange-900/20', icone: 'bg-orange-500', texto: 'text-orange-700 dark:text-orange-300' },
        chip: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        ponto: 'bg-orange-500',
    },
    {
        value: 'Terceirização', label: 'Terceirização', icone: 'package', cor: '#6250D6',
        cartao: { borda: 'border-violet-500', fundo: 'bg-violet-50 dark:bg-violet-900/20', icone: 'bg-violet-500', texto: 'text-violet-700 dark:text-violet-300' },
        chip: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
        ponto: 'bg-violet-500',
    },
    {
        // Imposto não tem fornecedor: a conta é descrita à mão, como a Despesa.
        value: 'Impostos', label: 'Impostos', icone: 'file-text', cor: '#E87BA4',
        cartao: { borda: 'border-pink-400', fundo: 'bg-pink-50 dark:bg-pink-900/20', icone: 'bg-pink-400', texto: 'text-pink-700 dark:text-pink-300' },
        chip: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        ponto: 'bg-pink-400',
    },
];

// Conta sem categoria é Despesa — é o que o banco assume ao agrupar
// (ver metricas_vendas_migration.sql).
export const categoriaConta = (valor) => CATEGORIAS_CONTA.find(c => c.value === valor) ?? CATEGORIAS_CONTA[0];

// Nomes de mês por extenso. Usados onde o rótulo é montado fora de um
// calendário — o DatePicker e o DateRangePicker mantêm cópias próprias, que
// vivem junto da grade de dias.
// Vem de uma constante, e não de toLocaleDateString('pt-BR'), porque a tela é
// renderizada no servidor antes de chegar ao navegador: formatação por locale
// pode divergir entre os dois e provocar erro de hidratação.
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
