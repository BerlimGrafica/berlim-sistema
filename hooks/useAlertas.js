"use client";
import { useState, useEffect, useRef } from 'react';

// Alertas/notificações in-app: estado + dedup por tipo + funções "notificarSeX"
// chamadas tanto por carregarDados() quanto pelos efeitos de realtime em
// AppContext.jsx. Recebe `usuario` porque toda a lógica de alerta é por-usuário
// (quem vê o quê, e a persistência no localStorage é por usuario.id).
export function useAlertas(usuario) {
    const [alertasNaoLidos, setAlertasNaoLidos] = useState([]);
    const [toasts, setToasts] = useState([]);
    // Ids de alertas já vistos (pra saber quais são "novos" e merecem um toast).
    // Alimentado tanto pela hidratação do localStorage (marca os antigos como já
    // vistos, sem toast) quanto pelo efeito de diff abaixo (marca os novos).
    const idsConhecidosRef = useRef(new Set());
    const removerToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
    // Substituto de window.alert(): toast avulso, não entra em alertasNaoLidos
    // (não é uma notificação persistente do sino, é feedback de uma ação pontual).
    // severidade: 'info' | 'sucesso' | 'erro'.
    const avisar = (mensagem, severidade = 'info') => {
        const id = Date.now() + Math.random();
        idsConhecidosRef.current.add(id);
        setToasts(prev => [...prev, { id, msg: mensagem, severidade, avisoManual: true }]);
    };
    // Substituto de window.confirm(): retorna uma Promise<boolean>, resolvida
    // quando o usuário clica em Confirmar/Cancelar no ConfirmDialog.
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const confirmar = (mensagem) => new Promise(resolve => setPendingConfirm({ mensagem, resolve }));
    const resolverConfirm = (valor) => {
        setPendingConfirm(prev => { prev?.resolve(valor); return null; });
    };
    const alertasFuturaDisparados = useRef(new Set());
    const alertasBoletoDisparados = useRef(new Set());
    const alertasContaPagarDisparados = useRef(new Set());
    const alertasRetiradaDisparados = useRef(new Set());
    const alertasFaturamentoAnaliseDisparados = useRef(new Set());
    const alertasTarefaDisparadas = useRef(new Set());
    const alertasNotaFiscalDisparadas = useRef(new Set());
    const alertasLinkPagamentoDisparados = useRef(new Set());
    const [modalAlertasAberto, setModalAlertasAberto] = useState(false);
    // Notificações vivem só em memória e um F5 zera o estado — persiste no
    // localStorage (por usuário) pra sobreviver a um refresh da página.
    useEffect(() => {
        if (!usuario) return;
        try {
            const salvas = localStorage.getItem('notificacoes_' + usuario.id);
            if (salvas) {
                // A designação de O.S. deixou de ser notificada (a tabela de
                // produção já mostra o responsável). Descarta as que ficaram
                // gravadas antes disso, senão elas sobrevivem indefinidamente
                // no sino de quem já as tinha.
                const lista = JSON.parse(salvas).filter(a => a.tipo !== 'atribuicao');
                // Marca como "já vistos" antes de popular o estado — são notificações
                // antigas (de antes deste F5), não devem virar toast de novo.
                lista.forEach(a => idsConhecidosRef.current.add(a.id));
                setAlertasNaoLidos(lista);
            }
        } catch (e) { /* localStorage indisponível ou dado corrompido, ignora */ }
    }, [usuario?.id]);

    // Toast: dispara um pra cada alerta genuinamente novo (id ainda não visto),
    // não importa qual das funções abaixo (ou o realtime em AppContext.jsx) o criou.
    useEffect(() => {
        const novos = alertasNaoLidos.filter(a => !idsConhecidosRef.current.has(a.id));
        if (novos.length === 0) return;
        novos.forEach(a => idsConhecidosRef.current.add(a.id));
        setToasts(prev => [...prev, ...novos]);
    }, [alertasNaoLidos]);

    useEffect(() => {
        if (!usuario) return;
        try {
            localStorage.setItem('notificacoes_' + usuario.id, JSON.stringify(alertasNaoLidos));
        } catch (e) { /* localStorage indisponível (modo privado, quota etc.), ignora */ }
    }, [alertasNaoLidos, usuario?.id]);
    const ehUsuario = (nome) => (usuario?.nome || '').trim().toLowerCase() === nome.toLowerCase();
    function notificarSeFaturamentoEmAnalise(empresa) {
        if (!ehUsuario('Vinicius') || !empresa) return;
        if (empresa.status === 'Em Análise') {
            if (!alertasFaturamentoAnaliseDisparados.current.has(empresa.id)) {
                alertasFaturamentoAnaliseDisparados.current.add(empresa.id);
                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Empresa "${empresa.nome}" está com faturamento em análise.`, tipo: 'faturamento_em_analise' }]);
            }
        } else {
            alertasFaturamentoAnaliseDisparados.current.delete(empresa.id);
        }
    }

    function notificarSeTarefaMinha(tarefa) {
        if (!tarefa || !usuario) return;
        const nomeUsuario = (usuario.nome || '').trim().toLowerCase();
        const responsaveis = (tarefa.responsavel || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const souResponsavel = responsaveis.includes(nomeUsuario);

        if (souResponsavel && tarefa.status !== 'Concluída') {
            if (!alertasTarefaDisparadas.current.has(tarefa.id)) {
                alertasTarefaDisparadas.current.add(tarefa.id);
                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Você tem uma tarefa: ${tarefa.titulo}`, tipo: 'nova_tarefa' }]);
            }
        } else {
            alertasTarefaDisparadas.current.delete(tarefa.id);
        }
    }

    function notificarSeNotaFiscalPreenchida(nota) {
        if (!nota || !usuario) return;
        const preenchida = nota.concluido === false && (!!nota.servico_feito || !!nota.valor_pago);
        const destinatarioCerto = (nota.tipo_nota === 'DANFE' && usuario?.nivel === 'Financeiro') || (nota.tipo_nota === 'Serviço' && ehUsuario('Vinicius'));

        if (preenchida && destinatarioCerto) {
            if (!alertasNotaFiscalDisparadas.current.has(nota.id)) {
                alertasNotaFiscalDisparadas.current.add(nota.id);
                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Nota Fiscal (${nota.cliente || nota.cnpj}) preenchida!`, tipo: 'nf_preenchida' }]);
            }
        } else {
            alertasNotaFiscalDisparadas.current.delete(nota.id);
        }
    }

    function notificarSeLinkPagamentoNovo(link) {
        if (!link || !ehUsuario('Giovana')) return;
        const ativo = link.status !== 'Inativo' && link.status !== 'Pago' && link.status !== 'Concluído';

        if (ativo) {
            if (!alertasLinkPagamentoDisparados.current.has(link.id)) {
                alertasLinkPagamentoDisparados.current.add(link.id);
                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Novo link de pagamento para: ${link.cliente}`, tipo: 'novo_link' }]);
            }
        } else {
            alertasLinkPagamentoDisparados.current.delete(link.id);
        }
    }

    function notificarSeContaPagarUrgente(conta) {
        if (!conta || !conta.vencimento) return;
        if (!(usuario?.nivel === 'Financeiro' || ehUsuario('Giovana'))) return;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        const hojeStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
        const amanhaStr = amanha.getFullYear() + '-' + String(amanha.getMonth() + 1).padStart(2, '0') + '-' + String(amanha.getDate()).padStart(2, '0');

        const alertId = `${conta.id}_${conta.vencimento}`;
        const urgente = conta.status !== 'Pago' && conta.vencimento <= amanhaStr;

        if (urgente) {
            if (!alertasContaPagarDisparados.current.has(alertId)) {
                alertasContaPagarDisparados.current.add(alertId);
                let msg = `A conta "${conta.descricao}" vence amanhã!`;
                if (conta.vencimento === hojeStr) msg = `A conta "${conta.descricao}" vence HOJE!`;
                else if (conta.vencimento < hojeStr) msg = `A conta "${conta.descricao}" está VENCIDA!`;
                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg, tipo: 'alerta_conta_pagar' }]);
            }
        } else {
            alertasContaPagarDisparados.current.delete(alertId);
        }
    }

    return {
        alertasNaoLidos, setAlertasNaoLidos,
        toasts, removerToast, avisar,
        pendingConfirm, confirmar, resolverConfirm,
        modalAlertasAberto, setModalAlertasAberto,
        ehUsuario,
        notificarSeFaturamentoEmAnalise,
        notificarSeTarefaMinha,
        notificarSeNotaFiscalPreenchida,
        notificarSeLinkPagamentoNovo,
        notificarSeContaPagarUrgente,
        // Refs de dedup, expostas caso o realtime precise consultar diretamente
        // (não são usadas fora do domínio de alertas hoje, mas fazem parte do estado interno).
        alertasFuturaDisparados,
        alertasBoletoDisparados,
        alertasRetiradaDisparados,
    };
}
