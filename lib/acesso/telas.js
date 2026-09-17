// Quem enxerga o quê: catálogo de telas, sub-abas, cargos e o cruzamento deles.
//
// Antes a regra morava em dois lugares diferentes e incompatíveis: uma lista
// dentro da Navbar decidia o menu principal, e cada tela repetia, no meio do
// seu próprio JSX, um `ve:` por sub-aba. Aquilo respondia "este cargo vê isto?"
// e nada mais — não havia onde encaixar uma exceção por pessoa, e a tela de
// cadastro de usuários não tinha o que listar.
//
// Aqui a permissão vira DADO, nos dois níveis. O cargo define um conjunto
// padrão; o usuário pode ter uma lista própria que o substitui. Ler
// `profiles.telas` como nulo significa "segue o cargo" — é o estado normal, e
// é o que mantém o comportamento de antes para quem nunca foi personalizado.
//
// A lista gravada é plana e mistura os dois níveis. Uma tela é o próprio id
// ('financeiro'); uma sub-aba é o id composto ('financeiro:boletos'). Plana
// porque é assim que ela cabe numa coluna text[] e é assim que a checagem fica
// barata: ver uma sub-aba é procurar uma string num Set.

// Uma linha por tela navegável, com as sub-abas que ela tem por dentro.
//
// `href` é a chave real — é por ele que a Navbar e o guarda de rota casam com
// a URL —, mas o `id` é o que vai para o banco: um slug curto e estável, que
// não quebra se um dia a rota for renomeada. Os ids das sub-abas são os mesmos
// que cada tela já usava no seu estado interno (`abaFinanceiro`, `abaOS`...),
// de propósito: é o que permite filtrar a faixa de sub-abas sem tradução.
export const TELAS = [
    {
        id: 'inicio',
        href: '/',
        rotulo: 'Início',
        icone: 'layout-dashboard',
        resumo: 'Painel do dia, pendências e atalhos.',
        // Ninguém pode ficar sem porta de entrada: sem uma tela inicial, a
        // pessoa entra no sistema e cai direto num aviso de acesso negado.
        fixa: true,
    },
    {
        id: 'producao',
        href: '/producao',
        rotulo: 'Produção',
        icone: 'grid',
        resumo: 'Quadro das O.S. em andamento, por etapa.',
    },
    {
        id: 'baixa',
        href: '/baixa',
        rotulo: 'O.S.',
        icone: 'check-circle',
        resumo: 'Histórico de ordens, baixa e reimpressão.',
        subtelas: [
            { id: 'abertas',     rotulo: 'Abertas',     icone: 'list' },
            { id: 'concluidas',  rotulo: 'À dar Baixa', icone: 'check-circle' },
            { id: 'finalizadas', rotulo: 'Baixadas',    icone: 'check-square' },
            { id: 'canceladas',  rotulo: 'Canceladas',  icone: 'x-circle' },
            { id: 'abandonadas', rotulo: 'Abandonadas', icone: 'alert-triangle' },
        ],
    },
    {
        id: 'calculadoras',
        href: '/calculadoras',
        rotulo: 'Calculadoras',
        icone: 'calculator',
        resumo: 'Orçamento rápido de impressão e acabamento.',
        subtelas: [
            { id: 'banner',    rotulo: 'Banner / Lona',       icone: 'image' },
            { id: 'adesivo',   rotulo: 'Adesivos (Vinil)',    icone: 'grid' },
            { id: 'casamento', rotulo: 'Papelaria Casamento', icone: 'heart' },
            { id: 'bloquinho', rotulo: 'Bloquinhos',          icone: 'layers' },
        ],
    },
    {
        id: 'financeiro',
        href: '/financeiro',
        rotulo: 'Financeiro',
        icone: 'dollar-sign',
        resumo: 'Contas a pagar, recebimentos e notas.',
        subtelas: [
            { id: 'contas_pagar',       rotulo: 'Contas a Pagar',   icone: 'file-text' },
            { id: 'contas_receber',     rotulo: 'Contas a Receber', icone: 'dollar-sign' },
            { id: 'boletos',            rotulo: 'Boletos',          icone: 'calendar' },
            { id: 'empresas_aprovadas', rotulo: 'Faturamento',      icone: 'check-circle' },
            { id: 'notas_fiscais',      rotulo: 'Notas Fiscais',    icone: 'file-text' },
        ],
    },
    {
        id: 'vendas',
        href: '/vendas',
        rotulo: 'Vendas',
        icone: 'trending-up',
        resumo: 'Faturamento, metas e ranking de clientes.',
        subtelas: [
            { id: 'geral',          rotulo: 'Visão Geral',        icone: 'pie-chart' },
            { id: 'vendas_produto', rotulo: 'Vendas por Produto', icone: 'tag' },
            { id: 'vendas_cliente', rotulo: 'Vendas por Cliente', icone: 'users' },
        ],
    },
    {
        id: 'notas-fiscais',
        href: '/notas-fiscais',
        rotulo: 'Notas Fiscais',
        icone: 'file-text',
        resumo: 'Tela própria de NF-e, para quem não usa o Financeiro.',
    },
    {
        id: 'orcamentos',
        href: '/orcamentos',
        rotulo: 'Orçamentos',
        icone: 'edit-3',
        resumo: 'Orçamentos formalizados e modelos prontos.',
        subtelas: [
            { id: 'formalizados', rotulo: 'Formalizados', icone: 'file-text' },
            { id: 'pre_prontos',  rotulo: 'Pré Prontos',  icone: 'file-text' },
        ],
    },
    {
        id: 'cadastros',
        href: '/cadastros',
        rotulo: 'Cadastros',
        icone: 'users',
        resumo: 'Clientes, catálogo, fornecedores e usuários.',
        subtelas: [
            { id: 'clientes',     rotulo: 'Clientes',              icone: 'users' },
            { id: 'produtos',     rotulo: 'Catálogo',              icone: 'package' },
            { id: 'fornecedores', rotulo: 'Fornecedores / Locais', icone: 'truck' },
            // Gerenciar acessos é privilégio de Administrador e isso é decidido
            // no SERVIDOR: /api/usuarios confere o nível de quem chama antes de
            // qualquer gravação. Marcar esta sub-aba para outro cargo abriria
            // uma tela que responde 403 em todo botão — uma permissão que o
            // sistema não tem como cumprir. Ela some para quem não é admin.
            { id: 'usuarios',     rotulo: 'Usuários',              icone: 'user', soAdmin: true },
        ],
    },
    {
        id: 'comunicacao',
        href: '/comunicacao',
        rotulo: 'Comunicação',
        icone: 'mail',
        resumo: 'Tarefas internas, requisições e recados.',
        subtelas: [
            { id: 'requisicoes', rotulo: 'Requisição de Material', icone: 'shopping-bag' },
            { id: 'tarefas',     rotulo: 'Tarefas',                icone: 'check-square' },
            { id: 'links',       rotulo: 'Link de Pagamento',      icone: 'link' },
        ],
    },
];

export const telaPorId = (id) => TELAS.find(t => t.id === id) || null;
export const telaPorHref = (href) => TELAS.find(t => t.href === href) || null;
export const subtelasDaTela = (telaId) => telaPorId(telaId)?.subtelas || [];

// O id composto de uma sub-aba. Existe como função (e não escrito à mão com um
// template em cada ponto) porque é o formato gravado no banco: mudá-lo é uma
// decisão de um lugar só.
export const idSub = (telaId, subId) => `${telaId}:${subId}`;

// Telas que não se pode desmarcar. Hoje só a inicial, mas a regra é declarada
// e não escrita à mão nos dois lugares que precisam dela.
export const TELAS_FIXAS = TELAS.filter(t => t.fixa).map(t => t.id);

// Os cargos, com o conjunto que cada um recebe por padrão.
//
// `padrao` lista TELAS; as sub-abas de cada uma entram todas, menos as que
// estiverem em `semSubtelas`. Isso reproduz o que o sistema fazia antes — os
// `ve:` que viviam dentro do CadastrosTab, onde Catálogo, Fornecedores e
// Usuários eram só de Administrador —, agora num lugar onde dá para ler a
// regra inteira de uma vez.
export const CARGOS = [
    {
        valor: 'Administrador',
        rotulo: 'Administrador',
        resumo: 'Enxerga o sistema inteiro e gerencia os acessos.',
        icone: 'shield',
        // Duas classes por cargo: a cor do selo na listagem e a do cartão
        // selecionado no modal. Ficam juntas do cargo para não existirem duas
        // tabelas de cor divergindo com o tempo.
        selo: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
        realce: 'text-red-500',
        // Tudo o que existe, menos a tela solta de Notas Fiscais: para quem tem
        // Financeiro, ela é uma das sub-abas de lá, e um segundo caminho no menu
        // principal só duplicaria o mesmo destino. Ela continua no catálogo
        // porque é o ÚNICO caminho de quem não tem Financeiro — o Atendimento.
        //
        // Escrito como uma varredura do catálogo, e não como uma lista fixa: uma
        // tela nova entra e o administrador já a enxerga, sem depender de alguém
        // lembrar de acrescentá-la aqui também.
        padrao: TELAS.map(t => t.id).filter(id => id !== 'notas-fiscais'),
    },
    {
        valor: 'Atendimento',
        rotulo: 'Atendimento',
        resumo: 'Balcão: abre O.S., orçamentos e notas fiscais.',
        icone: 'phone',
        selo: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
        realce: 'text-blue-500',
        padrao: ['inicio', 'producao', 'baixa', 'calculadoras', 'notas-fiscais', 'orcamentos', 'cadastros', 'comunicacao'],
        semSubtelas: ['cadastros:produtos', 'cadastros:fornecedores', 'cadastros:usuarios'],
    },
    {
        valor: 'Produção',
        rotulo: 'Produção',
        resumo: 'Chão de gráfica: toca as O.S. até a entrega.',
        icone: 'grid',
        selo: 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900/60',
        realce: 'text-violet-500',
        padrao: ['inicio', 'producao', 'baixa', 'calculadoras', 'orcamentos', 'cadastros', 'comunicacao'],
        semSubtelas: ['cadastros:produtos', 'cadastros:fornecedores', 'cadastros:usuarios'],
    },
    {
        valor: 'Financeiro',
        rotulo: 'Equipe Financeira',
        resumo: 'Contas, faturamento e acompanhamento de vendas.',
        icone: 'dollar-sign',
        selo: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
        realce: 'text-emerald-500',
        padrao: ['inicio', 'baixa', 'financeiro', 'vendas', 'comunicacao'],
    },
];

export const NIVEIS_VALIDOS = CARGOS.map(c => c.valor);

// Cargo que não existe mais no catálogo — foi o caso do 'demo', aposentado —
// não pode cair no primeiro da lista: seria conceder em silêncio o acesso de
// outro cargo a uma conta esquecida no banco. Cai no mínimo, que é a tela
// inicial, e o rótulo diz o que houve em vez de fingir normalidade.
const CARGO_DESCONHECIDO = {
    valor: '',
    rotulo: 'Cargo inválido',
    resumo: 'Este cargo não existe mais. Escolha um dos atuais para restaurar o acesso.',
    icone: 'alert-triangle',
    selo: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
    realce: 'text-aviso',
    padrao: [...TELAS_FIXAS],
};

export const cargoDe = (nivel) => CARGOS.find(c => c.valor === nivel) || CARGO_DESCONHECIDO;

export function telasDoCargo(nivel) {
    const cargo = cargoDe(nivel);
    const tem = new Set(cargo.padrao);
    const fora = new Set(cargo.semSubtelas || []);
    const saida = [];
    for (const t of TELAS) {
        if (!tem.has(t.id)) continue;
        saida.push(t.id);
        for (const s of t.subtelas || []) {
            if (!fora.has(idSub(t.id, s.id))) saida.push(idSub(t.id, s.id));
        }
    }
    return saida;
}

// Peneira a lista contra o catálogo e devolve algo sempre coerente:
//   - id desconhecido cai fora (uma tela removida do sistema continuaria
//     salva no banco);
//   - sub-aba órfã, cuja tela está desligada, cai junto;
//   - tela ligada sem nenhuma sub-aba marcada recebe todas de volta — uma tela
//     assim abriria vazia, e isso nunca é o que alguém quis dizer;
//   - as fixas entram de qualquer jeito.
// A ordem é a do catálogo, para que o que se grava não dependa da ordem em que
// a pessoa foi clicando.
export function normalizarTelas(lista) {
    if (!Array.isArray(lista)) return null;
    const pedidas = new Set([...lista, ...TELAS_FIXAS]);
    const saida = [];
    for (const t of TELAS) {
        if (!pedidas.has(t.id)) continue;
        saida.push(t.id);
        const todas = t.subtelas || [];
        const marcadas = todas.filter(s => pedidas.has(idSub(t.id, s.id)));
        for (const s of (marcadas.length ? marcadas : todas)) saida.push(idSub(t.id, s.id));
    }
    return saida;
}

// `telas` nulo ou ausente = segue o cargo. É o estado de quem nunca foi
// personalizado, e o que mantém o sistema idêntico ao de antes por padrão.
export function usaPadraoDoCargo(usuario) {
    return !Array.isArray(usuario?.telas);
}

// Sub-abas que valem só para Administrador, venham de onde vierem — do padrão
// do cargo ou de uma lista própria. Ver o comentário em 'cadastros:usuarios'.
const SO_ADMIN = new Set(
    TELAS.flatMap(t => (t.subtelas || []).filter(s => s.soAdmin).map(s => idSub(t.id, s.id))),
);

// A lista plana efetiva: telas E sub-abas.
export function permissoesDe(usuario) {
    if (!usuario) return [];
    const base = usaPadraoDoCargo(usuario) ? telasDoCargo(usuario.nivel) : normalizarTelas(usuario.telas);
    if (usuario.nivel === 'Administrador') return base;

    // Tirar uma sub-aba pode esvaziar a tela que a continha; nesse caso ela sai
    // junto, pelo mesmo motivo de sempre — tela que abre vazia não é acesso.
    const restante = new Set(base.filter(id => !SO_ADMIN.has(id)));
    for (const t of TELAS) {
        if (!restante.has(t.id) || t.fixa) continue;
        const subs = t.subtelas || [];
        if (subs.length && !subs.some(s => restante.has(idSub(t.id, s.id)))) restante.delete(t.id);
    }
    return base.filter(id => restante.has(id));
}

// Objetos completos do catálogo, na ordem do menu — o que a Navbar precisa.
export function telasVisiveis(usuario) {
    const liberadas = new Set(permissoesDe(usuario));
    return TELAS.filter(t => liberadas.has(t.id));
}

// Rota fora do catálogo (a caixa de areia do WhatsApp, por exemplo) não é
// barrada: este módulo só manda no que ele conhece.
export function podeVerTela(usuario, href) {
    const tela = telaPorHref(href);
    if (!tela) return true;
    return permissoesDe(usuario).includes(tela.id);
}

export function podeVerSubtela(usuario, telaId, subId) {
    return permissoesDe(usuario).includes(idSub(telaId, subId));
}

// As sub-abas liberadas de uma tela, na ordem do catálogo. É daqui que cada
// tela monta a sua faixa de sub-abas — o `ve:` escrito no meio do JSX saiu.
export function subtelasVisiveis(usuario, telaId) {
    const liberadas = new Set(permissoesDe(usuario));
    return subtelasDaTela(telaId).filter(s => liberadas.has(idSub(telaId, s.id)));
}

// Para onde mandar quem perdeu o acesso à tela em que estava: a primeira tela
// que ele ainda tem. Sempre existe, porque a inicial é fixa.
export function primeiraTelaDe(usuario) {
    return telasVisiveis(usuario)[0]?.href || '/';
}
