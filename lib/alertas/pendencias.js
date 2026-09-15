import { STATUSES_FINALIZADOS, STATUSES_JA_RETIRADO_DA_FUTURA } from '@/lib/utils/constants';

// Pendências são DERIVADAS do estado, não gravadas quando algo acontece.
//
// O sistema antigo empilhava um aviso no instante do evento e o guardava no
// localStorage. Nada o removia quando o trabalho era feito, e o controle de
// duplicata vivia só em memória — então cada F5 reprocessava todas as contas,
// notas e tarefas e empilhava tudo de novo por cima do que já estava lá. O sino
// virava um depósito de repetições de coisas resolvidas, e um número que não
// significa nada é um número que ninguém olha.
//
// Aqui cada pendência é uma função do dado atual: existe enquanto a condição é
// verdadeira e desaparece sozinha quando deixa de ser. Como o id vem do sujeito
// (`conta:74`), e não de Date.now(), duplicata é impossível por construção e
// "já avisei sobre isto" é uma comparação de ids.

// Três níveis, e só três: a cor precisa decidir sozinha o que fazer primeiro.
export const GRAVIDADES = {
    critico: {
        ordem: 0,
        rotulo: 'Atrasado',
        ponto: 'bg-red-500',
        texto: 'text-perigo',
        contador: 'bg-red-500',
        faixa: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50',
    },
    atencao: {
        ordem: 1,
        rotulo: 'Para hoje',
        ponto: 'bg-amber-500',
        texto: 'text-aviso',
        contador: 'bg-amber-500',
        faixa: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
    },
    tarefa: {
        ordem: 2,
        rotulo: 'A fazer',
        ponto: 'bg-blue-500',
        texto: 'text-info',
        contador: 'bg-blue-500',
        faixa: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
    },
};

export const gravidadeDe = (chave) => GRAVIDADES[chave] ?? GRAVIDADES.tarefa;

// Datas em 'AAAA-MM-DD' e aritmética em dias inteiros, sem passar por Date no
// caminho comum: comparar strings nesse formato já dá a ordem cronológica, e
// Date com fuso é justamente o que faz "vence hoje" virar "venceu ontem".
const somarDias = (iso, n) => {
    const [a, m, d] = iso.split('-').map(Number);
    const data = new Date(a, m - 1, d + n);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
};

export const diasEntre = (de, ate) => {
    if (!de || !ate) return 0;
    const [a1, m1, d1] = de.split('-').map(Number);
    const [a2, m2, d2] = ate.split('-').map(Number);
    return Math.round((new Date(a2, m2 - 1, d2) - new Date(a1, m1 - 1, d1)) / 86400000);
};

// "venceu há 3 dias" comunica urgência; "Agora" — que era o que a lista mostrava
// em toda linha, fixo no código — não comunica nada.
export const descreverPrazo = (data, hoje, { passado = 'venceu', futuro = 'vence' } = {}) => {
    if (!data) return '';
    const dias = diasEntre(hoje, data);
    if (dias === 0) return `${futuro} hoje`;
    if (dias === 1) return `${futuro} amanhã`;
    if (dias === -1) return `${passado} ontem`;
    if (dias < 0) return `${passado} há ${-dias} dias`;
    return `${futuro} em ${dias} dias`;
};

const ehPessoa = (usuario, nome) => (usuario?.nome || '').trim().toLowerCase() === nome.toLowerCase();

const responsavelInclui = (campo, usuario) => {
    const eu = (usuario?.nome || '').trim().toLowerCase();
    if (!eu) return false;
    return String(campo || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean).includes(eu);
};

// Cada regra devolve as pendências que existem AGORA para este usuário. Uma
// regra que não se aplica ao cargo devolve lista vazia — quem decide o que cada
// um vê é este arquivo, num lugar só, e não um `if` espalhado por evento.
const REGRAS = [
    // ---- Contas a pagar ----
    ({ usuario, contasPagar, hoje }) => {
        // Mesmo alcance de antes: Financeiro e Giovana. Administrador não entra —
        // quem cuida do contas a pagar é o financeiro, e alargar isso encheria o
        // sino de quem não vai pagar a conta.
        if (!(usuario?.nivel === 'Financeiro' || ehPessoa(usuario, 'Giovana'))) return [];
        const limite = somarDias(hoje, 1);
        return contasPagar
            .filter(c => c.status !== 'Pago' && c.vencimento && c.vencimento <= limite)
            .map(c => ({
                id: `conta:${c.id}`,
                gravidade: c.vencimento < hoje ? 'critico' : 'atencao',
                titulo: c.vencimento < hoje ? 'Conta vencida' : 'Conta a pagar',
                detalhe: `${c.descricao} — ${descreverPrazo(c.vencimento, hoje)}`,
                destino: '/financeiro',
                aba: 'contas_pagar',
                quando: c.vencimento,
            }));
    },

    // ---- Prazo da Futura: lembrete de ir buscar o material lá ----
    ({ usuario, pedidos, hoje }) => {
        if (usuario?.nivel !== 'Administrador') return [];
        const jaVoltou = [...STATUSES_FINALIZADOS, ...STATUSES_JA_RETIRADO_DA_FUTURA];
        const limite = somarDias(hoje, 1);
        return pedidos
            .filter(p => p.local_producao?.toLowerCase().includes('futura') && !jaVoltou.includes(p.status) && p.prazo && p.prazo <= limite)
            .map(p => ({
                id: `futura:${p.id}`,
                gravidade: p.prazo <= hoje ? 'critico' : 'atencao',
                titulo: 'Retirar na Futura',
                detalhe: `O.S. #${p.id} — prazo ${descreverPrazo(p.prazo, hoje, { passado: 'venceu' })}`,
                destino: '/producao',
                osId: p.id,
                quando: p.prazo,
            }));
    },

    // ---- Boletos ----
    ({ usuario, pedidos, hoje }) => {
        if (!(usuario?.nivel === 'Financeiro' || ehPessoa(usuario, 'Giovana'))) return [];
        // "Concluído" continua no radar: o serviço pode estar pronto com o
        // boleto em aberto. Só sai quando a O.S. é encerrada de fato.
        const encerrados = STATUSES_FINALIZADOS.filter(s => s !== 'Concluído');
        const limite = somarDias(hoje, 1);
        return pedidos
            .filter(p => !encerrados.includes(p.status) && p.prazo_pagamento && p.prazo_pagamento <= limite
                && (p.pedido_pagamentos || []).some(pag => pag.forma === 'Boleto' && !pag.boleto_concluido))
            .map(p => ({
                id: `boleto:${p.id}`,
                gravidade: p.prazo_pagamento < hoje ? 'critico' : 'atencao',
                titulo: p.prazo_pagamento < hoje ? 'Boleto vencido' : 'Boleto a vencer',
                detalhe: `O.S. #${p.id} (${p.cliente}) — ${descreverPrazo(p.prazo_pagamento, hoje)}`,
                destino: '/financeiro',
                aba: 'boletos',
                osId: p.id,
                quando: p.prazo_pagamento,
            }));
    },

    // ---- O.S. parada aguardando retirada ----
    ({ usuario, pedidos, hoje }) => {
        if (usuario?.nivel !== 'Atendimento') return [];
        return pedidos
            .filter(p => p.status === 'Retirada' && p.data_retirada && diasEntre(p.data_retirada, hoje) >= 15)
            .map(p => {
                const dias = diasEntre(p.data_retirada, hoje);
                return {
                    id: `retirada:${p.id}`,
                    gravidade: dias >= 30 ? 'critico' : 'atencao',
                    titulo: 'Parada na retirada',
                    detalhe: `O.S. #${p.id} (${p.cliente}) — ${dias} dias aguardando`,
                    destino: '/producao',
                    osId: p.id,
                    quando: p.data_retirada,
                };
            });
    },

    // ---- Avisar cliente ----
    ({ usuario, pedidos }) => {
        if (usuario?.nivel !== 'Atendimento') return [];
        return pedidos
            .filter(p => p.status === 'Avisar Cliente')
            .map(p => ({
                id: `avisar:${p.id}`,
                gravidade: 'tarefa',
                titulo: 'Avisar cliente',
                detalhe: `O.S. #${p.id} — ${p.cliente}`,
                destino: '/producao',
                osId: p.id,
                quando: p.prazo,
            }));
    },

    // ---- Tarefas internas ----
    ({ usuario, tarefasInternas, hoje }) => tarefasInternas
        .filter(t => t.status !== 'Concluída' && responsavelInclui(t.responsavel, usuario))
        .map(t => ({
            id: `tarefa:${t.id}`,
            gravidade: t.prazo && t.prazo < hoje ? 'critico' : t.prazo && t.prazo <= somarDias(hoje, 1) ? 'atencao' : 'tarefa',
            titulo: 'Sua tarefa',
            detalhe: t.prazo ? `${t.titulo} — ${descreverPrazo(t.prazo, hoje)}` : t.titulo,
            destino: '/comunicacao',
            quando: t.prazo || t.created_at?.slice(0, 10),
        })),

    // ---- Notas fiscais: quem preenche e quem emite ----
    ({ usuario, notasFiscais }) => {
        if (usuario?.nivel !== 'Atendimento') return [];
        return notasFiscais
            .filter(n => n.concluido === false && !n.servico_feito && !n.valor_pago)
            .map(n => ({
                id: `nf-preencher:${n.id}`,
                gravidade: 'tarefa',
                titulo: 'Nota a preencher',
                detalhe: `${n.cliente || n.razao_social || n.cnpj} — solicitada pelo cliente`,
                destino: '/notas-fiscais',
                quando: n.created_at?.slice(0, 10),
            }));
    },
    ({ usuario, notasFiscais }) => notasFiscais
        .filter(n => n.concluido === false && (n.servico_feito || n.valor_pago)
            && ((n.tipo_nota === 'DANFE' && usuario?.nivel === 'Financeiro') || (n.tipo_nota === 'Serviço' && ehPessoa(usuario, 'Vinicius'))))
        .map(n => ({
            id: `nf-emitir:${n.id}`,
            gravidade: 'tarefa',
            titulo: 'Nota a emitir',
            detalhe: `${n.cliente || n.razao_social || n.cnpj} — ${n.tipo_nota}`,
            destino: '/financeiro',
            aba: 'notas_fiscais',
            quando: n.created_at?.slice(0, 10),
        })),

    // ---- Links de pagamento em aberto ----
    ({ usuario, linksPagamento }) => {
        if (!ehPessoa(usuario, 'Giovana')) return [];
        return linksPagamento
            .filter(l => !['Inativo', 'Pago', 'Concluído'].includes(l.status))
            .map(l => ({
                id: `link:${l.id}`,
                gravidade: 'tarefa',
                titulo: 'Link de pagamento',
                detalhe: `${l.cliente || l.titulo} — aguardando`,
                destino: '/comunicacao',
                quando: l.created_at?.slice(0, 10),
            }));
    },

    // ---- Requisições de material ----
    ({ usuario, requisicoesMaterial }) => {
        if (!ehPessoa(usuario, 'Vinicius')) return [];
        return requisicoesMaterial
            .filter(r => r.status === 'Pendente')
            .map(r => ({
                id: `requisicao:${r.id}`,
                gravidade: 'tarefa',
                titulo: 'Material a comprar',
                detalhe: r.itens,
                destino: '/comunicacao',
                quando: r.created_at?.slice(0, 10),
            }));
    },

    // ---- Faturamento em análise ----
    ({ usuario, empresasFaturamento }) => {
        if (!ehPessoa(usuario, 'Vinicius')) return [];
        return empresasFaturamento
            .filter(e => e.status === 'Em Análise')
            .map(e => ({
                id: `faturamento:${e.id}`,
                gravidade: 'tarefa',
                titulo: 'Faturamento em análise',
                detalhe: e.nome,
                destino: '/financeiro',
                aba: 'empresas_aprovadas',
                quando: e.created_at?.slice(0, 10),
            }));
    },
];

export function calcularPendencias(dados) {
    if (!dados.usuario) return [];
    const lista = REGRAS.flatMap(regra => {
        try {
            return regra(dados) || [];
        } catch {
            // Uma regra que quebre (campo inesperado num registro antigo) não
            // pode derrubar o painel inteiro — as outras continuam valendo.
            return [];
        }
    });
    // Mais grave primeiro e, dentro do mesmo nível, o mais antigo — que é o que
    // está esperando há mais tempo.
    return lista.sort((a, b) =>
        gravidadeDe(a.gravidade).ordem - gravidadeDe(b.gravidade).ordem
        || String(a.quando || '').localeCompare(String(b.quando || ''))
    );
}

// Quantas pendências pertencem a cada tela, para o contador no menu.
export function contarPorDestino(pendencias) {
    return pendencias.reduce((mapa, p) => {
        if (!p.destino) return mapa;
        mapa[p.destino] = (mapa[p.destino] || 0) + 1;
        return mapa;
    }, {});
}

// A gravidade que manda no sino e na faixa: a pior da lista.
export function piorGravidade(pendencias) {
    return pendencias.reduce(
        (pior, p) => (gravidadeDe(p.gravidade).ordem < gravidadeDe(pior).ordem ? p.gravidade : pior),
        'tarefa',
    );
}

// Texto curto da faixa fixa: "2 contas vencidas · 1 boleto a vencer" seria
// melhor por tipo, mas os títulos já são curtos e agrupá-los por título dá o
// mesmo efeito sem uma tabela de plurais para manter.
export function resumirPendencias(pendencias, limite = 3) {
    const porTitulo = new Map();
    for (const p of pendencias) porTitulo.set(p.titulo, (porTitulo.get(p.titulo) || 0) + 1);
    const partes = [...porTitulo.entries()].slice(0, limite).map(([titulo, n]) => (n > 1 ? `${n} × ${titulo}` : titulo));
    const resto = porTitulo.size - partes.length;
    return resto > 0 ? `${partes.join(' · ')} · +${resto}` : partes.join(' · ');
}
