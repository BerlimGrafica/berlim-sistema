"use client";
import { useSyncExternalStore } from 'react';

// O roteiro das telas novas: todas as rotas de protótipo numa ordem só (a do
// menu), para passar por elas uma a uma sem digitar endereço. A página
// /telas-novas lista; a faixa no topo de cada tela (RoteiroTelasNovas) leva à
// anterior e à próxima e marca a tela como validada.
//
// `substitui` é a tela de hoje que a nova vai trocar; `conferir` é o que mudou
// e merece um olhar. `fora` abre numa aba nova: é uma página pública, fora do
// sistema (o formulário que o cliente preenche), e por isso vai por último:
// no meio da sequência, o "Próxima" abriria a aba nova e deixaria a pessoa
// parada na mesma tela.
export const TELAS_NOVAS = [
    {
        href: '/novoinicio', nome: 'Início', icone: 'layout-dashboard', substitui: 'Início',
        conferir: 'Uma tela por cargo. Use o "Ver como" para conferir a do administrador, do atendimento, da produção e do financeiro.',
    },
    {
        href: '/novaproducao', nome: 'Produção', icone: 'grid', substitui: 'Produção',
        conferir: 'A lista das O.S. em produção, a troca de status e a O.S. abrindo no modal novo por cima.',
    },
    {
        href: '/novabaixa', nome: 'O.S.', icone: 'check-circle', substitui: 'O.S. (Histórico e baixa)',
        conferir: 'As cinco abas por situação, a lista agrupada por mês da venda e a baixa.',
    },
    {
        href: '/novaos', nome: 'Modal de O.S.', icone: 'plus', substitui: 'O modal de O.S.',
        conferir: 'Criar e editar uma O.S. Aqui os clientes são fictícios e nada grava; aberto por cima das outras telas novas, ele grava de verdade.',
    },
    {
        href: '/novosequipamentos', nome: 'Equipamentos', icone: 'printer', substitui: 'Equipamentos',
        conferir: 'O quadro de tintas por máquina, os registros de reabastecimento e manutenção e o histórico com filtros.',
    },
    {
        href: '/novascalculadoras', nome: 'Calculadoras', icone: 'calculator', substitui: 'Calculadoras',
        conferir: 'As cinco calculadoras numa tela. No adesivo, 4×6 e 6×4 dão o mesmo resultado, e acima de um metro o preço segue o m² usado.',
    },
    {
        href: '/novofinanceiro', nome: 'Financeiro', icone: 'dollar-sign', substitui: 'Financeiro',
        conferir: 'As cinco partes em abas. Os dados do boleto e o "pago" gravam de verdade, como na tela de Boletos de hoje.',
    },
    {
        href: '/novascontas', nome: 'Contas a pagar (avulsa)', icone: 'file-text', substitui: 'Financeiro › Contas a pagar',
        conferir: 'A primeira versão de Contas a pagar, sozinha. A mesma tela já está na aba do Financeiro novo: dá para pular.',
    },
    {
        href: '/novavendas', nome: 'Vendas', icone: 'trending-up', substitui: 'Vendas',
        conferir: 'Visão geral, Produtos, Clientes e o relatório do dia, com a comparação com o período anterior.',
    },
    {
        href: '/novosorcamentos', nome: 'Orçamentos', icone: 'edit-3', substitui: 'Orçamentos',
        conferir: 'A lista, abrir para editar, novo, aprovar e virar O.S., imprimir e excluir.',
    },
    {
        href: '/preprontos', nome: 'Pré-prontos', icone: 'copy', substitui: 'Orçamentos › Pré-prontos',
        conferir: 'O balcão de textos (busca, fixados, categorias, copiar com um clique) com a conversa do WhatsApp do lado.',
    },
    {
        href: '/novoscadastros', nome: 'Cadastros', icone: 'users', substitui: 'Cadastros',
        conferir: 'Clientes, catálogo, fornecedores e usuários em abas. Usuários só aparece para o administrador.',
    },
    {
        href: '/novacomunicacao', nome: 'Comunicação', icone: 'mail', substitui: 'Comunicação',
        conferir: 'Compras (lista do que falta, fornecedor, "Comprei"), Tarefas (equipe, rotinas, concluídas por data) e links. Confirmar e excluir agora têm Desfazer.',
    },
    {
        href: '/prototipos/solicitar-nota.html', nome: 'Pedido de nota fiscal', icone: 'external-link', substitui: 'O formulário público de nota fiscal',
        conferir: 'A página que o cliente preenche, fora do sistema. Abre numa aba nova.', fora: true,
    },
];

export const indiceDaTela = (pathname) => TELAS_NOVAS.findIndex(t => !t.fora && t.href === pathname);

// Quais telas a pessoa já marcou como validadas. Fica neste navegador: é uma
// lista de conferência de quem está validando, não um dado do sistema. Sem
// acesso ao armazenamento (janela anônima, bloqueio), a lista só começa vazia.
const CHAVE = 'berlim:telas-novas-validadas';
const ouvintes = new Set();
let cache = null;

function ler() {
    if (cache) return cache;
    try {
        const v = JSON.parse(localStorage.getItem(CHAVE) || '[]');
        cache = Array.isArray(v) ? v : [];
    } catch {
        cache = [];
    }
    return cache;
}

function gravar(lista) {
    cache = lista;
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch { /* fica só nesta visita */ }
    ouvintes.forEach(f => f());
}

function inscrever(f) {
    ouvintes.add(f);
    // Outra aba marcou: relê.
    const aoMudar = (e) => { if (e.key === CHAVE) { cache = null; f(); } };
    addEventListener('storage', aoMudar);
    return () => { ouvintes.delete(f); removeEventListener('storage', aoMudar); };
}

const VAZIA = [];

export function useValidadas() {
    const validadas = useSyncExternalStore(inscrever, ler, () => VAZIA);
    return {
        validadas,
        alternar: (href) => gravar(validadas.includes(href) ? validadas.filter(h => h !== href) : [...validadas, href]),
        limpar: () => gravar([]),
    };
}
