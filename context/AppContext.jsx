"use client";
import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { flushSync } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS } from '@/lib/utils/constants';
import { formatarMoeda, parseValorMoeda, valorPagamentoComSinal, valorPagamentoComSinalCentavos, paraCentavos, centavosParaReais, obterDataAtual, adicionarMesData, apenasDigitos } from '@/lib/utils/formatters';
import { desconstruirTextoServico, construirTextoServico, itemDbParaCarrinho, pagamentoDbParaCarrinho } from '@/lib/utils/servico';
import { useAuth } from '@/hooks/useAuth';
import { useAlertas } from '@/hooks/useAlertas';
import { useChat } from '@/hooks/useChat';
import { SessaoContext } from '@/context/SessaoContext';
import { UiContext } from '@/context/UiContext';
import { ChatContext } from '@/context/ChatContext';
import { PedidosContext } from '@/context/PedidosContext';
import { OsModalContext } from '@/context/OsModalContext';
import { OrcamentosContext } from '@/context/OrcamentosContext';
import { ClientesContext } from '@/context/ClientesContext';
import { CadastrosContext } from '@/context/CadastrosContext';
import { NotasFiscaisContext } from '@/context/NotasFiscaisContext';
import { FinanceiroContext } from '@/context/FinanceiroContext';
import { ComunicacaoContext } from '@/context/ComunicacaoContext';

export { supabase };

// O antigo contexto único foi fatiado por domínio (ver context/*Context.jsx).
// Toda a lógica continua neste AppProvider; o que mudou é a publicação: cada
// fatia vai num Provider próprio, com valor memoizado, para uma tela assinar
// só o que usa. useAppContext() segue existindo como camada de
// compatibilidade que funde todas as fatias (mesmo comportamento de antes).

// Numeração dos pedidos deve continuar a partir do último número usado no sistema anterior.
const NUMERO_INICIAL_PEDIDO = 17930;

export const AppProvider = ({ children }) => {
    const pathname = usePathname();
    const {
        isAdmin, isOperador, isDemo,
        restaurandoSessao,
        usuariosSistema, setUsuariosSistema,
        usuario, setUsuario,
        googleVinculado, vincularGoogle: vincularGoogleBase, desvincularGoogle: desvincularGoogleBase,
        loginInput, setLoginInput,
        senhaInput, setSenhaInput,
        erroLogin, setErroLogin,
        darkMode, setDarkMode,
        efetuarLogin, entrarComoDemo, entrarComGoogle, logout, toggleDarkMode,
    } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    // Flags de primeira carga — controlam os esqueletos das listagens.
    // dadosCarregados vira true quando o primeiro carregarDados() completa e
    // nunca volta a false (refetches do realtime são invisíveis de propósito);
    // as demais cobrem as buscas sob demanda que têm ciclo próprio.
    const [dadosCarregados, setDadosCarregados] = useState(false);
    const [historicoCarregado, setHistoricoCarregado] = useState(false);
    const [clientesCadCarregados, setClientesCadCarregados] = useState(false);
    const [carregandoContasReceber, setCarregandoContasReceber] = useState(false);
    const [carregandoBoletos, setCarregandoBoletos] = useState(false);
    const [draggedProdutoIndex, setDraggedProdutoIndex] = useState(null);
    
    // ESTADOS ORÇAMENTOS
    const [abaOrcamentos, setAbaOrcamentos] = useState('formalizados'); // 'formalizados' | 'pre_prontos'
    const [orcamentosFormalizados, setOrcamentosFormalizados] = useState([]);
    const [orcamentosPreProntos, setOrcamentosPreProntos] = useState([]);
    const [modalOrcamentoPreAberto, setModalOrcamentoPreAberto] = useState(false);
    const [novoOrcamentoPre, setNovoOrcamentoPre] = useState({ id: null, titulo: '', texto: '' });
    const [modalOrcamentoFormalizadoAberto, setModalOrcamentoFormalizadoAberto] = useState(false);
    const [orcamentoFormalizadoEmEdicao, setOrcamentoFormalizadoEmEdicao] = useState(null);
    
    const [clientes, setClientes] = useState([]);
    const [clientesCadastrados, setClientesCadastrados] = useState([]);
    const [totalClientesCad, setTotalClientesCad] = useState(0);
    const [clientesProblema, setClientesProblema] = useState([]);
    // Qual OS pediu o telefone do cliente por último — descarta resposta atrasada
    // de uma OS que o usuário já fechou (ver abrirEdicao).
    const clienteInfoPedidoRef = useRef(null);
    const [fornecedores, setFornecedores] = useState([]);
    const [fornecedoresTerceirizacaoNomes, setFornecedoresTerceirizacaoNomes] = useState([]);
    const [abaCadastros, setAbaCadastros] = useState('clientes');
    const [abaOS, setAbaOS] = useState('abertas');
    const [buscaCadClientes, setBuscaCadClientes] = useState('');
    const [buscaCadProdutos, setBuscaCadProdutos] = useState('');
    const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false);
    const [novoFornecedor, setNovoFornecedor] = useState({ id: null, nome: '', contato: '', observacoes: '', tipo: 'Produção' });
    const [paginaClientes, setPaginaClientes] = useState(1);
    const [letraFiltroCliente, setLetraFiltroCliente] = useState('');
    
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [filtroNotas, setFiltroNotas] = useState('pendentes');
    const [buscaNotaFiscal, setBuscaNotaFiscal] = useState('');
    const [paginaNotasFiscais, setPaginaNotasFiscais] = useState(1);
    const [modalNotaFiscalAberto, setModalNotaFiscalAberto] = useState(false);
    const [notaFiscalEmEdicao, setNotaFiscalEmEdicao] = useState(null);
    const [salvandoNotaFiscal, setSalvandoNotaFiscal] = useState(false);

    

    // Filtros
    const [buscaHistoricoText, setBuscaHistoricoText] = useState('');
    
    // Paginação
    const [paginaHistorico, setPaginaHistorico] = useState(1);
    const [pedidosHistorico, setPedidosHistorico] = useState([]);
    const [totalPedidosHistorico, setTotalPedidosHistorico] = useState(0);
    const [ordenacaoHistoricoOS, setOrdenacaoHistoricoOS] = useState('desc');
    const [triggerRealtime, setTriggerRealtime] = useState(0);
    const itensPorPagina = 50;
    const [dataFiltroInicio, setDataFiltroInicio] = useState('');
    const [dataFiltroFim, setDataFiltroFim] = useState('');

    const [buscaProducaoText, setBuscaProducaoText] = useState('');

    const [dataFiltroContasPagarInicio, setDataFiltroContasPagarInicio] = useState('');
    const [dataFiltroContasPagarFim, setDataFiltroContasPagarFim] = useState('');
    const [dataFiltroContasReceberInicio, setDataFiltroContasReceberInicio] = useState('');
    const [dataFiltroContasReceberFim, setDataFiltroContasReceberFim] = useState('');
    const [dataFiltroBoletosInicio, setDataFiltroBoletosInicio] = useState('');
    const [dataFiltroBoletosFim, setDataFiltroBoletosFim] = useState('');
    const [pedidosSaldoDevedor, setPedidosSaldoDevedor] = useState([]);
    const [pedidosBoleto, setPedidosBoleto] = useState([]);

    // Financeiro Expandido e Alertas
    const [abaFinanceiro, setAbaFinanceiro] = useState('contas_pagar');
    const [abaVendas, setAbaVendas] = useState('geral');
    const [produtosSelecionadosGrafico, setProdutosSelecionadosGrafico] = useState(null);
    const [contasPagar, setContasPagar] = useState([]);
    const [calculadoraAtiva, setCalculadoraAtiva] = useState('banner');
    const [modalContaAberto, setModalContaAberto] = useState(false);
    const [novaConta, setNovaConta] = useState({ id: null, descricao: '', valor: '', vencimento: '', status: 'Pendente', recorrente: false, recorrente_total_parcelas: null, recorrente_parcela_atual: 1, categoria: 'Despesa', fornecedor_id: null });
    
    const [empresasFaturamento, setEmpresasFaturamento] = useState([]);
    const [modalEmpresaFaturamentoAberto, setModalEmpresaFaturamentoAberto] = useState(false);
    const [novaEmpresaFaturamento, setNovaEmpresaFaturamento] = useState({ id: null, nome: '', cnpj: '', status: 'Aprovado' });
    const {
        alertasNaoLidos, setAlertasNaoLidos,
        toasts, removerToast, avisar,
        pendingConfirm, confirmar, resolverConfirm,
        modalAlertasAberto, setModalAlertasAberto,
        ehUsuario,
        notificarSeFaturamentoEmAnalise, notificarSeTarefaMinha, notificarSeAtribuidoAMim, notificarSeNotaFiscalPreenchida,
        notificarSeLinkPagamentoNovo, notificarSeContaPagarUrgente,
        alertasFuturaDisparados, alertasBoletoDisparados, alertasRetiradaDisparados,
    } = useAlertas(usuario);
    // Envolve os retornos de useAuth() com avisar() — useAuth() roda antes de
    // useAlertas() no corpo do componente, então não tem acesso a avisar ainda.
    const vincularGoogle = async () => {
        const erro = await vincularGoogleBase();
        if (erro) avisar('Não foi possível vincular a conta Google: ' + erro, 'erro');
    };
    const desvincularGoogle = async () => {
        const erro = await desvincularGoogleBase();
        if (erro) avisar('Não foi possível desvincular a conta Google: ' + erro, 'erro');
    };

    // Menu de contexto (clique direito) genérico — qualquer tabela monta sua
    // própria lista de itens e chama abrirContextMenu(e, itens); o componente
    // visual (ContextMenu.jsx) cuida de posição, fechamento e é o mesmo em todo o app.
    const [contextMenu, setContextMenu] = useState(null); // { x, y, itens } | null
    const abrirContextMenu = (e, itens) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, itens });
    };
    const fecharContextMenu = () => setContextMenu(null);
    const {
        chatAberto, setChatAberto,
        chatMensagens, setChatMensagens,
        chatNaoLidas, setChatNaoLidas,
        enviandoChat, chatAbertoRef,
        carregarChat, nomeDoUsuarioChat, abrirChat, enviarMensagemChat, excluirMensagemChat,
    } = useChat(usuario, usuariosSistema, avisar);

    // === COMUNICAÇÃO INTERNA ===
    const [abaComunicacao, setAbaComunicacao] = useState('requisicoes');
    const [requisicoesMaterial, setRequisicoesMaterial] = useState([]);
    const [tarefasInternas, setTarefasInternas] = useState([]);
    const [linksPagamento, setLinksPagamento] = useState([]);
    
    const [modalRequisicaoAberto, setModalRequisicaoAberto] = useState(false);
    const [novaRequisicao, setNovaRequisicao] = useState({ id: null, itens: '', observacoes: '', status: 'Pendente' });
    
    const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
    const [novaTarefa, setNovaTarefa] = useState({ id: null, titulo: '', descricao: '', responsavel: '', prazo: '', status: 'Pendente', fixa: false });
    
    const [modalLinkAberto, setModalLinkAberto] = useState(false);
    const [novoLink, setNovoLink] = useState({ id: null, titulo: '', link: '', valor: '', cliente: '', status: 'Ativo' });

    const [modalAberto, setModalAberto] = useState(false);
    const [salvandoOS, setSalvandoOS] = useState(false);
    const [osParaImprimir, setOsParaImprimir] = useState(null);
    const [orcamentoParaImprimir, setOrcamentoParaImprimir] = useState(null);
    const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null); 
    const [idOrcamentoOrigem, setIdOrcamentoOrigem] = useState(null);

    const [itensPedido, setItensPedido] = useState([]);
    const [itemAtual, setItemAtual] = useState({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });

    const [buscaCliente, setBuscaCliente] = useState('');
    // Guarda o telefone do cliente exatamente clicado no dropdown (não re-busca por
    // nome depois) — pedidos guardam cliente como texto solto, então quando existe
    // mais de um cliente com o mesmo nome, buscar de novo por nome é ambíguo e pode
    // pegar o registro errado. null = nenhuma seleção confirmada nesta sessão (cai
    // no melhor-esforço por nome, mesmo comportamento de antes).
    const [clienteSelecionadoInfo, setClienteSelecionadoInfo] = useState(null);
    const [clienteDropdownAberto, setClienteDropdownAberto] = useState(false);
    const [buscaProduto, setBuscaProduto] = useState('');
    const [produtoDropdownAberto, setProdutoDropdownAberto] = useState(false);

    const [pagamentosPedido, setPagamentosPedido] = useState([]);
    const [novoPagamento, setNovoPagamento] = useState({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', bandeira: '', data: obterDataAtual() });

    const [novoPedido, setNovoPedido] = useState({
        cliente: '', cliente_id: null, servico: '', valor_total: '',
        status: 'Produzir', data_pedido: obterDataAtual(),
        prazo: '', responsavel: '', local_producao: 'Berlim', aprovado: false,
        entrega: false
    });
    const [outrasOSAbertas, setOutrasOSAbertas] = useState([]);

    const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
    const [salvandoProduto, setSalvandoProduto] = useState(false);
    const [novoProduto, setNovoProduto] = useState({ id: null, nome: '', texto_padrao: '', preco_base: '' });

    const [modalClienteAberto, setModalClienteAberto] = useState(false);
    const [salvandoCliente, setSalvandoCliente] = useState(false);
    const [novoCliente, setNovoCliente] = useState({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false });

    const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({ id: null, nome: '', email: '', senha: '', nivel: 'Atendimento' });

    useEffect(() => {
        if(usuario) {
            carregarDados();
            carregarChat();

            // LIGA O RADAR DE TEMPO REAL DO SUPABASE
            const canalRealTime = supabase
                .channel('mudancas-banco')
                .on(
                    'postgres_changes', 
                    { event: '*', schema: 'public', table: 'pedidos' }, 
                    (payload) => {
                        // Lógica de alerta
                        if (payload.eventType === 'UPDATE') {
                            const oldResponsavel = payload.old?.responsavel || '';
                            const newResponsavel = payload.new?.responsavel || '';
                            
                            const oldList = oldResponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                            const newList = newResponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

                            const nomeUsuario = (usuario.nome || '').trim().toLowerCase();

                            if (!oldList.includes(nomeUsuario) && newList.includes(nomeUsuario)) {
                                setAlertasNaoLidos(prev => {
                                    if(prev.some(a => a.os_id === payload.new.id && a.tipo === 'atribuicao')) return prev;
                                    return [...prev, { id: Date.now(), msg: `Você foi designado para a O.S. #${payload.new.id}`, os_id: payload.new.id, tipo: 'atribuicao' }];
                                });
                            }

                            // Alerta: Avisar Cliente (apenas Atendimento)
                            if (payload.new.status === 'Avisar Cliente' && payload.old?.status !== 'Avisar Cliente') {
                                if (usuario?.nivel === 'Atendimento') {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 5, msg: `Avisar cliente: ${payload.new.cliente} (O.S. #${payload.new.id})`, os_id: payload.new.id, tipo: 'avisar_cliente' }]);
                                }
                            }

                        } else if (payload.eventType === 'INSERT') {
                            const newResponsavel = payload.new?.responsavel || '';
                            const newList = newResponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                            const nomeUsuario = (usuario.nome || '').trim().toLowerCase();
                            
                            if (newList.includes(nomeUsuario)) {
                                setAlertasNaoLidos(prev => [...prev, { id: Date.now(), msg: `Nova O.S. #${payload.new.id} atribuída a você`, os_id: payload.new.id, tipo: 'atribuicao' }]);
                            }
                        }

                        carregarDados(); // Puxa os dados novos invisivelmente
                        setTriggerRealtime(prev => prev + 1);
                    }
                )
                .on(
                    'postgres_changes', 
                    { event: '*', schema: 'public', table: 'notas_fiscais' }, 
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            if (usuario?.nivel === 'Atendimento') {
                                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 3, msg: `Nova Nota Fiscal solicitada (${payload.new.cliente || payload.new.cnpj})`, os_id: null, tipo: 'nf_nova' }]);
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            notificarSeNotaFiscalPreenchida(payload.new);
                        }

                        carregarDados(); // Puxa os dados novos invisivelmente
                        setTriggerRealtime(prev => prev + 1);
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'chat_mensagens' },
                    (payload) => {
                        setChatMensagens(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
                        if (!chatAbertoRef.current && payload.new.usuario_id !== usuario?.id) {
                            setChatNaoLidas(prev => prev + 1);
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'DELETE', schema: 'public', table: 'chat_mensagens' },
                    (payload) => {
                        setChatMensagens(prev => prev.filter(m => m.id !== payload.old.id));
                    }
                )
                .on(
                    // Alerta: novo pagamento Boleto lançado numa OS (para Financeiro e
                    // Giovana). Reage direto ao INSERT em pedido_pagamentos em vez de
                    // diffar payload.old/new.servico — mais simples e correto (o evento
                    // que importa é "surgiu um pagamento Boleto", não uma heurística de
                    // diff de texto).
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'pedido_pagamentos', filter: 'forma=eq.Boleto' },
                    (payload) => {
                        if (usuario?.nivel !== 'Financeiro' && !ehUsuario('Giovana')) return;
                        const pedidoId = payload.new.pedido_id;
                        setAlertasNaoLidos(prev => {
                            if (prev.some(a => a.os_id === pedidoId && a.tipo === 'boleto_novo')) return prev;
                            return [...prev, { id: Date.now() + 6, msg: `Novo boleto registrado na O.S. #${pedidoId}`, os_id: pedidoId, tipo: 'boleto_novo' }];
                        });
                    }
                )
            .subscribe();

            // Desliga o radar se o usuário fizer logoff
            return () => {
                supabase.removeChannel(canalRealTime);
            };
        }
    }, [usuario]);

    // Redundância pro Realtime: se a aba ficar em segundo plano por um tempo, o
    // navegador pode suspender a conexão e perder eventos nesse meio-tempo. Ao
    // voltar a ficar visível, recarrega tudo de novo pra garantir que não ficou
    // nada desatualizado (novo produto, pedido, etc.).
    useEffect(() => {
        if (!usuario) return;
        function aoVoltarVisivel() {
            if (document.visibilityState === 'visible') { carregarDados(); carregarChat(); }
        }
        document.addEventListener('visibilitychange', aoVoltarVisivel);
        return () => document.removeEventListener('visibilitychange', aoVoltarVisivel);
    }, [usuario]);


    // Casa só pelo cliente_id, em OS e em orçamento. Comparar por nome marcava
    // homônimo errado — o cadastro tem dezenas de "Lucas"/"Silvana", então uma
    // venda de balcão com o nome anotado virava "cliente problemático" por causa
    // de outra pessoa, e o aviso deixava de significar qualquer coisa.
    // `nome` continua na assinatura só pelos call sites; não é mais consultado.
    // É chamada durante a renderização das tabelas, então NÃO entra no pacote de
    // ações estáveis: a identidade precisa mudar junto com clientesProblema para
    // a fatia de clientes invalidar e as linhas re-renderizarem com o aviso certo.
    const isClienteProblema = useMemo(() => (nome, clienteId) => {
        if (!clienteId) return false;
        return clientesProblema.some(c => c.id === clienteId);
    }, [clientesProblema]);


    // === CHAT DA EQUIPE e ALERTAS/NOTIFICAÇÕES ===
    // Toda essa lógica (chat + notificarSeX) foi extraída para hooks/useChat.js e
    // hooks/useAlertas.js — ver desestruturação no topo do componente.

    async function carregarDados() {
        let todosPedidos = [];
        let from = 0;
        let limit = 1000;
        let fetchMore = true;

        const anoAnteriorStr = (new Date().getFullYear() - 1).toString();
        const dataCorte = `${anoAnteriorStr}-01-01`;

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        const hojeStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
        const amanhaStr = amanha.getFullYear() + '-' + String(amanha.getMonth() + 1).padStart(2, '0') + '-' + String(amanha.getDate()).padStart(2, '0');
        const statusIgnorados = STATUSES_FINALIZADOS;
        // Alerta de boleto não pode ignorar "Concluído": o serviço pode estar pronto
        // com o boleto ainda em aberto. Só sai do radar quando a OS é encerrada de
        // fato (Finalizado/Cancelado/Abandonado).
        const statusIgnoradosBoleto = STATUSES_FINALIZADOS.filter(s => s !== 'Concluído');

        while (fetchMore) {
            const { data: batch, error } = await supabase
                .from('pedidos')
                .select('*, pedido_itens(*), pedido_pagamentos(*)')
                .or(`data_pedido.gte.${dataCorte},status.in.(Produzir,Arte,Impressão,Acabamento,Retirada)`)
                .order('id', { ascending: false })
                .range(from, from + limit - 1);
                
            if (error) {
                console.error('Erro ao buscar pedidos:', error);
                break;
            }
            if (batch && batch.length > 0) {
                todosPedidos = [...todosPedidos, ...batch];
                if (batch.length < limit) {
                    fetchMore = false;
                } else {
                    from += limit;
                }
            } else {
                fetchMore = false;
            }
        }
        if (todosPedidos.length > 0) {
            // Regra de pedidos Abandonados (Em Retirada por mais de 31 dias)
            const pedidosParaAbandonar = todosPedidos.filter(p => {
                if (p.status !== 'Retirada' || !p.data_retirada) return false;
                const partes = p.data_retirada.split('-');
                if (partes.length !== 3) return false;
                const dataRetirada = new Date(partes[0], partes[1] - 1, partes[2]);
                const diasEmRetirada = Math.floor((hoje - dataRetirada) / (1000 * 60 * 60 * 24));
                return diasEmRetirada > 31;
            });
            if (pedidosParaAbandonar.length > 0) {
                pedidosParaAbandonar.forEach(async p => {
                    await supabase.from('pedidos').update({status: 'Abandonado'}).eq('id', p.id);
                });
                pedidosParaAbandonar.forEach(p => p.status = 'Abandonado');
            }

            setPedidos(todosPedidos);
            todosPedidos.forEach(notificarSeAtribuidoAMim);

            if (usuario?.nivel === 'Administrador') {
                const pedidosFuturaAlertar = todosPedidos.filter(p => p.local_producao && p.local_producao.toLowerCase().includes('futura') && !statusIgnorados.includes(p.status) && p.prazo && p.prazo <= amanhaStr);

                if (pedidosFuturaAlertar.length > 0) {
                    setAlertasNaoLidos(prev => {
                        let novosAlertas = [...prev];
                        pedidosFuturaAlertar.forEach(p => {
                            if (!novosAlertas.some(a => a.os_id === p.id && a.tipo === 'alerta_futura') && !alertasFuturaDisparados.current.has(p.id)) {
                                let msg = `Prazo da Futura termina amanhã (O.S. #${p.id}). Retirar!`;
                                if (p.prazo === hojeStr) msg = `Prazo da Futura é HOJE (O.S. #${p.id}). Retirar o quanto antes!`;
                                else if (p.prazo < hojeStr) msg = `Prazo da Futura VENCIDO (O.S. #${p.id}). Verifique imediatamente!`;

                                novosAlertas.push({ id: Date.now() + Math.random(), msg, os_id: p.id, tipo: 'alerta_futura' });
                                alertasFuturaDisparados.current.add(p.id);
                            }
                        });
                        return novosAlertas;
                    });
                }
            }

            if (usuario?.nivel === 'Financeiro' || ehUsuario('Giovana')) {
                const pedidosComBoletoAberto = todosPedidos
                    .map(p => ({ ...p, pagamentos: p.pedido_pagamentos || [] }))
                    .filter(p => !statusIgnoradosBoleto.includes(p.status) && p.prazo_pagamento && p.pagamentos.some(pag => pag.forma === 'Boleto' && !pag.boleto_concluido));

                if (pedidosComBoletoAberto.length > 0) {
                    let novosAlertasBoleto = [];
                    pedidosComBoletoAberto.forEach(p => {
                        if (p.prazo_pagamento === hojeStr || p.prazo_pagamento === amanhaStr) {
                            const alertId = `${p.id}_${p.prazo_pagamento}`;
                            if (!alertasBoletoDisparados.current.has(alertId)) {
                                let msg = `O boleto da O.S. #${p.id} vence amanhã!`;
                                if (p.prazo_pagamento === hojeStr) msg = `O boleto da O.S. #${p.id} vence HOJE!`;

                                novosAlertasBoleto.push({ id: Date.now() + Math.random(), msg, os_id: p.id, tipo: 'alerta_boleto' });
                                alertasBoletoDisparados.current.add(alertId);
                            }
                        }
                    });

                    if (novosAlertasBoleto.length > 0) {
                        setAlertasNaoLidos(prev => {
                            let mergeAlertas = [...prev];
                            novosAlertasBoleto.forEach(n => {
                                if (!mergeAlertas.some(a => a.msg === n.msg && a.os_id === n.os_id)) {
                                    mergeAlertas.push(n);
                                }
                            });
                            return mergeAlertas;
                        });
                    }
                }
            }

            if (usuario?.nivel === 'Atendimento') {
                const pedidosEmRetirada = todosPedidos.filter(p => p.status === 'Retirada' && p.data_retirada);
                let novosAlertasRetirada = [];
                pedidosEmRetirada.forEach(p => {
                    const partes = p.data_retirada.split('-');
                    if (partes.length !== 3) return;
                    const dataRetirada = new Date(partes[0], partes[1] - 1, partes[2]);
                    const diasEmRetirada = Math.floor((hoje - dataRetirada) / (1000 * 60 * 60 * 24));
                    let faixa = null;
                    if (diasEmRetirada >= 30) faixa = 30;
                    else if (diasEmRetirada >= 15) faixa = 15;
                    if (faixa) {
                        const alertId = `${p.id}_retirada_${faixa}`;
                        if (!alertasRetiradaDisparados.current.has(alertId)) {
                            novosAlertasRetirada.push({ id: Date.now() + Math.random(), msg: `O.S. #${p.id} está há ${diasEmRetirada} dias aguardando retirada!`, os_id: p.id, tipo: 'alerta_retirada' });
                            alertasRetiradaDisparados.current.add(alertId);
                        }
                    }
                });

                if (novosAlertasRetirada.length > 0) {
                    setAlertasNaoLidos(prev => {
                        let mergeAlertas = [...prev];
                        novosAlertasRetirada.forEach(n => {
                            if (!mergeAlertas.some(a => a.msg === n.msg && a.os_id === n.os_id)) {
                                mergeAlertas.push(n);
                            }
                        });
                        return mergeAlertas;
                    });
                }
            }
        }
        
        const { data: listaProdutos } = await supabase.from('produtos').select('*').order('ordem', { ascending: true });
        if (listaProdutos) setProdutos(listaProdutos);
        
        // Clientes não são mais puxados integralmente aqui.

        const { data: listaUsuarios } = await supabase.from('profiles').select('*').order('nome', { ascending: true });
        if (listaUsuarios) setUsuariosSistema(listaUsuarios);

        const { data: listaNotas } = await supabase.from('notas_fiscais').select('*').order('created_at', { ascending: false });
        if (listaNotas) {
            setNotasFiscais(listaNotas);
            listaNotas.forEach(notificarSeNotaFiscalPreenchida);
        }
        
        const { data: listaEmpresasFaturamento } = await supabase.from('empresas_faturamento').select('*').order('nome', { ascending: true });
        if (listaEmpresasFaturamento) {
            setEmpresasFaturamento(listaEmpresasFaturamento);
            listaEmpresasFaturamento.forEach(notificarSeFaturamentoEmAnalise);
        }

        const { data: listaContas, error: erroContas } = await supabase.from('contas_pagar').select('*').order('vencimento', { ascending: true });
        if (!erroContas && listaContas) {
            setContasPagar(listaContas);
            listaContas.forEach(notificarSeContaPagarUrgente);
        }

        const { data: listaFornecedores } = await supabase.from('fornecedores').select('*').order('id', { ascending: true });
        if (listaFornecedores) setFornecedores(listaFornecedores);

        const { data: listaFornecedoresTerc } = await supabase.from('fornecedores_terceirizacao_nomes').select('*').order('id', { ascending: true });
        if (listaFornecedoresTerc) setFornecedoresTerceirizacaoNomes(listaFornecedoresTerc);

        const { data: listaOrcF } = await supabase.from('orcamentos_formalizados').select('*, orcamento_itens(*)').order('created_at', { ascending: false });
        if (listaOrcF) setOrcamentosFormalizados(listaOrcF);

        const { data: listaOrcPP } = await supabase.from('orcamentos_pre_prontos').select('*').order('created_at', { ascending: false });
        if (listaOrcPP) setOrcamentosPreProntos(listaOrcPP);

        const { data: listaReq } = await supabase.from('requisicoes_material').select('*').order('created_at', { ascending: false }).limit(150);
        if (listaReq) setRequisicoesMaterial(listaReq);

        const { data: listaTar } = await supabase.from('tarefas_internas').select('*').order('created_at', { ascending: false }).limit(150);
        if (listaTar) {
            const listaTarAtualizada = await resetarTarefasFixasDoDia(listaTar);
            setTarefasInternas(listaTarAtualizada);
            listaTarAtualizada.forEach(notificarSeTarefaMinha);
        }

        const { data: listaLnk } = await supabase.from('links_pagamento').select('*').order('created_at', { ascending: false }).limit(150);
        if (listaLnk) {
            setLinksPagamento(listaLnk);
            listaLnk.forEach(notificarSeLinkPagamentoNovo);
        }

        setDadosCarregados(true);
    }
    
    // Reseta a página do histórico quando o filtro muda. Ajustado durante a
    // renderização (em vez de num useEffect) para não disparar um commit extra.
    const [filtroHistoricoAnterior, setFiltroHistoricoAnterior] = useState({ buscaHistoricoText, dataFiltroInicio, dataFiltroFim, ordenacaoHistoricoOS });
    if (filtroHistoricoAnterior.buscaHistoricoText !== buscaHistoricoText || filtroHistoricoAnterior.dataFiltroInicio !== dataFiltroInicio || filtroHistoricoAnterior.dataFiltroFim !== dataFiltroFim || filtroHistoricoAnterior.ordenacaoHistoricoOS !== ordenacaoHistoricoOS) {
        setFiltroHistoricoAnterior({ buscaHistoricoText, dataFiltroInicio, dataFiltroFim, ordenacaoHistoricoOS });
        if (paginaHistorico !== 1) setPaginaHistorico(1);
    }

    useEffect(() => {
        if (!usuario) return;

        async function fetchHistorico() {
            let query = supabase.from('pedidos').select('*', { count: 'exact' });
            
            if (abaOS === 'abertas') {
                query = query.not('status', 'in', '("Concluído","Finalizado","Cancelado","Abandonado")');
            } else if (abaOS === 'concluidas') {
                query = query.eq('status', 'Concluído');
            } else if (abaOS === 'finalizadas') {
                query = query.eq('status', 'Finalizado');
            } else if (abaOS === 'canceladas') {
                const quinzeDiasAtras = new Date();
                quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
                query = query.eq('status', 'Cancelado').gte('cancelado_em', quinzeDiasAtras.toISOString());
            } else if (abaOS === 'abandonadas') {
                query = query.eq('status', 'Abandonado');
            }

            // Removido o filtro de operador para que Atendimento e Produção possam ver tudo na aba OS

            if (buscaHistoricoText) {
                const isNum = !isNaN(buscaHistoricoText);
                if (isNum) {
                    query = query.or(`cliente.ilike.%${buscaHistoricoText}%,id.eq.${buscaHistoricoText}`);
                } else {
                    query = query.ilike('cliente', `%${buscaHistoricoText}%`);
                }
            }

            if (dataFiltroInicio) query = query.gte('data_pedido', dataFiltroInicio);
            if (dataFiltroFim) query = query.lte('data_pedido', dataFiltroFim);

            query = query.order('id', { ascending: ordenacaoHistoricoOS === 'asc' });

            const from = (paginaHistorico - 1) * itensPorPagina;
            const to = from + itensPorPagina - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;
            if (!error && data) {
                setPedidosHistorico(data);
                if (count !== null) setTotalPedidosHistorico(count);
            }
            // Mesmo com erro: melhor a lista vazia do que esqueleto eterno.
            setHistoricoCarregado(true);
        }

        const timeout = setTimeout(fetchHistorico, 300);
        return () => clearTimeout(timeout);
    }, [usuario, abaOS, paginaHistorico, buscaHistoricoText, dataFiltroInicio, dataFiltroFim, triggerRealtime, ordenacaoHistoricoOS]);

    useEffect(() => {
        if (!usuario) return;
        async function fetchProblemas() {
            const { data } = await supabase.from('clientes').select('id, nome').eq('cliente_problema', true);
            if (data) setClientesProblema(data);
        }
        fetchProblemas();
    }, [usuario, triggerRealtime]);

    // Limpa os resultados assim que a busca fica vazia, ajustado durante a
    // renderização (em vez de num useEffect) para não disparar um commit extra.
    const [buscaClienteAnterior, setBuscaClienteAnterior] = useState(buscaCliente);
    if (buscaClienteAnterior !== buscaCliente) {
        setBuscaClienteAnterior(buscaCliente);
        if (!buscaCliente || buscaCliente.length < 1) setClientes([]);
    }

    useEffect(() => {
        if (!buscaCliente || buscaCliente.length < 1) return;
        const timeout = setTimeout(async () => {
            // Só dígitos e pontuação de telefone ("4457-6742", "(11) 99999")
            // significa busca por telefone. O teste antigo era !isNaN(), que
            // dava falso para qualquer número com hífen — digitar um telefone
            // formatado caía na busca por nome e não achava nada.
            const digitos = apenasDigitos(buscaCliente);
            const pareceTelefone = digitos.length >= 3 && /^[\d\s().+-]+$/.test(buscaCliente.trim());
            let query = supabase.from('clientes').select('*').limit(15);
            if (pareceTelefone) {
                // Compara dígito com dígito (coluna gerada telefone_digits);
                // comparar com a coluna formatada falha por causa do hífen.
                query = query.ilike('telefone_digits', `%${digitos}%`);
            } else {
                query = query.ilike('nome', `%${buscaCliente}%`);
            }
            const { data } = await query;
            if (data) setClientes(data);
        }, 300);
        return () => clearTimeout(timeout);
    }, [buscaCliente]);

    // Dispara ao abrir o modal pra EDITAR uma OS existente (nunca numa OS nova —
    // sem id ainda, não entra no lote). Usa o cliente_id como veio do banco
    // (pedidoEmEdicao), não o que está sendo digitado em novoPedido, pra não
    // refazer a busca a cada tecla.
    useEffect(() => {
        const promise = (modalAberto && pedidoEmEdicao)
            ? buscarOutrasOSAbertasDoCliente(pedidoEmEdicao.id, pedidoEmEdicao.cliente_id)
            : Promise.resolve([]);
        promise.then(setOutrasOSAbertas);
    }, [modalAberto, pedidoEmEdicao?.id]);

    // Busca (e refaz ao voltar pra aba ou após qualquer gravação que mexa em
    // pagamentos/status, via triggerRealtime) só quando a aba Contas a Receber
    // está mesmo aberta — evita consulta desnecessária em toda troca de tela.
    useEffect(() => {
        const buscando = abaFinanceiro === 'contas_receber';
        if (buscando) setCarregandoContasReceber(true);
        const promise = buscando ? buscarPedidosComSaldoDevedor() : Promise.resolve([]);
        promise.then((lista) => { setPedidosSaldoDevedor(lista); setCarregandoContasReceber(false); });
    }, [abaFinanceiro, triggerRealtime]);

    // Mesmo raciocínio de buscarPedidosComSaldoDevedor: só dispara quando a
    // aba Boletos está aberta.
    useEffect(() => {
        const buscando = abaFinanceiro === 'boletos';
        if (buscando) setCarregandoBoletos(true);
        const promise = buscando ? buscarPedidosComBoleto() : Promise.resolve([]);
        promise.then((lista) => { setPedidosBoleto(lista); setCarregandoBoletos(false); });
    }, [abaFinanceiro, triggerRealtime]);

    useEffect(() => {
        if (pathname !== '/cadastros' || abaCadastros !== 'clientes' || !usuario) return;

        async function fetchClientesCadastrados() {
            let query = supabase.from('clientes').select('*', { count: 'exact' });
            
            if (letraFiltroCliente) {
                query = query.ilike('nome', `${letraFiltroCliente}%`);
            }
            if (buscaCadClientes) {
                // Mesmo critério da busca do modal: dígitos e pontuação de
                // telefone caem na coluna de dígitos; o resto busca nome/e-mail.
                const digitosCad = apenasDigitos(buscaCadClientes);
                const pareceTelefoneCad = digitosCad.length >= 3 && /^[\d\s().+-]+$/.test(buscaCadClientes.trim());
                if (pareceTelefoneCad) {
                    query = query.ilike('telefone_digits', `%${digitosCad}%`);
                } else {
                    query = query.or(`nome.ilike.%${buscaCadClientes}%,email.ilike.%${buscaCadClientes}%`);
                }
            }
            
            query = query.order('nome', { ascending: true });
            
            const from = (paginaClientes - 1) * itensPorPagina;
            const to = from + itensPorPagina - 1;
            query = query.range(from, to);
            
            const { data, count } = await query;
            if (data) {
                setClientesCadastrados(data);
                if (count !== null) setTotalClientesCad(count);
            }
            setClientesCadCarregados(true);
        }
        
        const timeout = setTimeout(fetchClientesCadastrados, 300);
        return () => clearTimeout(timeout);
    }, [usuario, pathname, abaCadastros, paginaClientes, buscaCadClientes, letraFiltroCliente, triggerRealtime]);


    async function atualizarCampoInline(id, campo, valor) {
        let payload = { [campo]: valor };
        if (campo === 'status' && valor === 'Concluído') {
            payload.prazo = obterDataAtual();
        }
        if (campo === 'status' && valor === 'Retirada') {
            const pedidoAtual = pedidos.find(p => p.id === id);
            if (!pedidoAtual || pedidoAtual.status !== 'Retirada') {
                payload.data_retirada = obterDataAtual();
            }
        }
        if (campo === 'status' && valor === 'Cancelado') {
            payload.cancelado_em = new Date().toISOString();
        }

        setPedidos(pedidos.map(p => {
            if (p.id === id) {
                return { ...p, ...payload };
            }
            return p;
        }));
        // pedidosBoleto é uma busca separada (ver buscarPedidosComBoleto) que não
        // reflete mudanças em `pedidos` automaticamente; sincroniza aqui também
        // (no-op quando o id não está nessa lista, ex: Prazo/CNPJ/Número editados
        // na tela de Boletos).
        setPedidosBoleto(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));

        const { error } = await supabase.from('pedidos').update(payload).eq('id', id);
        if (error) {
            avisar('Erro ao atualizar: ' + error.message, 'erro');
            carregarDados();
        }
    }

    // Alterna o campo concluido de um item específico direto em pedido_itens
    // (usado pelo checklist de produção — ItensChecklist.jsx). Update de uma
    // linha só, sem reserializar o carrinho inteiro nem pedidos.servico — o
    // que eliminava o bug antigo de esquecer [ITENS_JSON] ao reserializar por
    // aqui. pedidos.servico fica levemente desatualizado nesse campo
    // especificamente até a OS ser reaberta e salva de novo pelo modal.
    async function atualizarItemConcluido(pedidoId, itemId, concluido) {
        setPedidos(prev => prev.map(p => p.id !== pedidoId ? p : {
            ...p,
            pedido_itens: (p.pedido_itens || []).map(i => i.id === itemId ? { ...i, concluido } : i),
        }));
        const { error } = await supabase.from('pedido_itens').update({ concluido }).eq('id', itemId);
        if (error) {
            avisar('Erro ao atualizar item: ' + error.message, 'erro');
            carregarDados();
        }
    }

    // Aplica `patch` ao pagamento "Boleto" da OS. Usado tanto para marcar como
    // concluído quanto para editar o valor do boleto direto na tabela de
    // Boletos — os únicos dois campos do pagamento que essa tela manipula, e
    // os únicos que continuam vinculados/visíveis no modal da O.S.
    // pedido_pagamentos é a fonte de verdade; o patch equivalente também é
    // aplicado em pedidos.servico (espelho, ainda lido por PrintLayout,
    // WhatsApp API e telas de resumo não migradas nesta entrega).
    async function atualizarPagamentoBoleto(pedido, patch) {
        if (!pedido || !pedido.servico) return;

        const partes = pedido.servico.split('\n\n[PAGAMENTOS]\n');
        let pagamentos = [];
        try { pagamentos = JSON.parse(partes[1] || '[]'); } catch (e) { pagamentos = []; }

        const pagamentosAtualizados = pagamentos.map(pag => pag.forma === 'Boleto' ? { ...pag, ...patch } : pag);
        const novoServico = partes[0] + '\n\n[PAGAMENTOS]\n' + JSON.stringify(pagamentosAtualizados);

        const patchCentavos = { ...patch };
        if ('valor' in patch) { patchCentavos.valor_centavos = paraCentavos(patch.valor); delete patchCentavos.valor; }

        setPedidos(prev => prev.map(p => p.id === pedido.id ? {
            ...p, servico: novoServico,
            pedido_pagamentos: (p.pedido_pagamentos || []).map(pg => pg.forma === 'Boleto' ? { ...pg, ...patchCentavos } : pg),
        } : p));
        setPedidosBoleto(prev => prev.map(p => p.id === pedido.id ? { ...p, servico: novoServico, boleto: { ...p.boleto, ...patch } } : p));

        const [{ error: errorServico }, { error: errorPagamento }] = await Promise.all([
            supabase.from('pedidos').update({ servico: novoServico }).eq('id', pedido.id),
            supabase.from('pedido_pagamentos').update(patchCentavos).eq('pedido_id', pedido.id).eq('forma', 'Boleto'),
        ]);
        if (errorServico || errorPagamento) {
            avisar('Erro ao atualizar boleto: ' + (errorServico || errorPagamento).message, 'erro');
            carregarDados();
        }
    }

    // Ao concluir, a linha não sai mais da tabela de Boletos — só muda de
    // Situação para "Pago" e grava a data do clique como data do pagamento
    // (mesma data exibida no modal da O.S.).
    async function concluirBoletoContasReceber(pedido) {
        await atualizarPagamentoBoleto(pedido, { boleto_concluido: true, data: obterDataAtual() });
    }

    // carregarDados() só traz OS's recentes ou em produção ativa; um boleto de
    // uma OS antiga (ou já Finalizada — boleto pago costuma levar a
    // Finalizado) não pode ficar de fora só porque já foi pago. Busca
    // dedicada, sem filtro de data, incluindo Finalizado de propósito.
    async function buscarPedidosComBoleto() {
        const { data, error } = await supabase.from('pedidos').select('*, pedido_itens(*), pedido_pagamentos(*)')
            .not('status', 'in', '("Abandonado","Cancelado")')
            .order('id', { ascending: true });
        if (error) { console.error('Erro ao buscar boletos:', error); return []; }

        return (data || [])
            .map(p => {
                const pg = (p.pedido_pagamentos || []).find(pag => pag.forma === 'Boleto');
                // BoletoRow.jsx espera boleto.valor como string formatada (mesmo
                // padrão do antigo pagamento parseado do texto).
                const boleto = pg ? { ...pg, valor: formatarMoeda(String(pg.valor_centavos)) } : null;
                return boleto ? { ...p, boleto } : null;
            })
            .filter(Boolean);
    }

    // Busca outras OS's do mesmo cliente com saldo devedor. Não usa o array
    // `pedidos` em memória: carregarDados() só traz OS's com data_pedido no
    // último ano OU em produção ativa — uma "Concluído" antiga e ainda não paga
    // pode ficar de fora. Precisa de consulta própria, sem esse filtro de data.
    // Só casa por cliente_id. Sem vínculo, a OS não se agrupa com ninguém — é venda
    // de balcão (legítimo) ou vínculo ainda não feito. Casar por nome somava o saldo
    // de homônimos e oferecia quitar a OS de um cliente com o pagamento de outro,
    // que é justamente o risco que o cliente_id existe pra eliminar.
    async function buscarOutrasOSAbertasDoCliente(pedidoAtualId, clienteId) {
        if (!clienteId) return [];

        const { data, error } = await supabase.from('pedidos').select('*, pedido_pagamentos(*)')
            .not('status', 'in', '("Abandonado","Cancelado","Finalizado")')
            .neq('id', pedidoAtualId)
            .eq('cliente_id', clienteId)
            .order('id', { ascending: true });
        if (error) { console.error('Erro ao buscar outras OS do cliente:', error); return []; }

        return (data || [])
            .map(p => {
                const totalPago = (p.pedido_pagamentos || []).reduce((acc, pag) => acc + valorPagamentoComSinalCentavos(pag), 0);
                return { ...p, saldo: centavosParaReais(p.valor_total) - totalPago };
            })
            .filter(p => p.saldo > 0.001);
    }

    // Busca TODAS as OS's com saldo devedor (qualquer forma de pagamento, ou
    // nenhuma ainda), pra a tela Financeiro > Contas a Receber. Mesmo motivo de
    // buscarOutrasOSAbertasDoCliente pra não usar o array `pedidos` em memória:
    // carregarDados() só traz OS's recentes ou em produção ativa, e um
    // "Concluído" antigo ainda não pago não pode sumir de um relatório de
    // contas a receber.
    async function buscarPedidosComSaldoDevedor() {
        const { data, error } = await supabase.from('pedidos').select('*, pedido_itens(*), pedido_pagamentos(*)')
            .not('status', 'in', '("Abandonado","Cancelado","Finalizado")')
            .order('id', { ascending: true });
        if (error) { console.error('Erro ao buscar contas a receber:', error); return []; }

        return (data || [])
            .map(p => {
                const totalPago = (p.pedido_pagamentos || []).reduce((acc, pag) => acc + valorPagamentoComSinalCentavos(pag), 0);
                const totalReais = centavosParaReais(p.valor_total);
                return { ...p, totalPago, totalReais, saldo: totalReais - totalPago };
            })
            .filter(p => p.saldo > 0.001);
    }

    // Grava, em cada uma das "outras" OS's, a fatia que lhe cabe de um pagamento
    // físico único (nunca chamado para a OS atualmente aberta no modal — essa
    // vai por salvarOS(), ver OSModal.jsx). Cada fatia carrega um lote_id comum,
    // pra dar pra rastrear depois que era uma única transação no caixa.
    // Grava uma OS de cada vez (o Supabase client não expõe transação
    // multi-linha sem uma function no Postgres) — se alguma falhar no meio, para
    // e avisa quais já foram gravadas, pra conferência manual.
    async function registrarPagamentoLoteOutrasOS(loteId, metadados, alocacoes) {
        const podeFinalizar = usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro';
        const concluidos = [];
        for (const { pedido, valorAlocado } of alocacoes) {
            const pagamento = { ...metadados, valor: valorAlocado, lote_id: loteId };
            const partes = (pedido.servico || '').split('\n\n[PAGAMENTOS]\n');
            let pagamentosExistentes = [];
            try { pagamentosExistentes = JSON.parse(partes[1] || '[]'); } catch (e) { pagamentosExistentes = []; }
            const novosPagamentos = [...pagamentosExistentes, pagamento];
            const novoServico = partes[0] + '\n\n[PAGAMENTOS]\n' + JSON.stringify(novosPagamentos);

            const pagamentosDb = pedido.pedido_pagamentos || [];
            const totalPagoCentavos = pagamentosDb.reduce((acc, p) => acc + (p.forma === 'Estorno' ? -1 : 1) * p.valor_centavos, 0) + paraCentavos(valorAlocado);
            const saldoRestante = centavosParaReais(pedido.valor_total) - centavosParaReais(totalPagoCentavos);

            const payload = { servico: novoServico };
            if (podeFinalizar && saldoRestante <= 0.001 && pedido.status !== 'Finalizado') payload.status = 'Finalizado';

            const linhaPagamento = {
                pedido_id: pedido.id, ordem: pagamentosDb.length, forma: metadados.forma || 'Indefinido',
                valor_centavos: paraCentavos(valorAlocado), parcelas: metadados.parcelas ?? null,
                instituicao: metadados.instituicao || null, bandeira: metadados.bandeira || null,
                data: metadados.data || null, vencimento_boleto: metadados.vencimento_boleto || null,
                boleto_concluido: metadados.boleto_concluido ?? null, lote_id: loteId,
            };

            const [{ data, error }, { data: pagamentoInserido, error: errorPagamento }] = await Promise.all([
                supabase.from('pedidos').update(payload).eq('id', pedido.id).select(),
                supabase.from('pedido_pagamentos').insert([linhaPagamento]).select(),
            ]);
            if (error || !data || data.length === 0 || errorPagamento) {
                const jaGravadas = concluidos.length > 0 ? ` Já gravado em: ${concluidos.map(c => '#' + c.id).join(', ')}.` : '';
                avisar(`Pagamento em lote interrompido na OS #${pedido.id}: ${(error || errorPagamento)?.message || 'erro desconhecido'}.${jaGravadas}`, 'erro');
                carregarDados();
                return { sucesso: false };
            }
            concluidos.push({ ...data[0], pedido_pagamentos: [...pagamentosDb, ...(pagamentoInserido || [])] });
        }
        if (concluidos.length > 0) {
            setPedidos(prev => prev.map(p => concluidos.find(c => c.id === p.id) || p));
            setTriggerRealtime(prev => prev + 1);
        }
        return { sucesso: true };
    }

    function fecharModalOS() {
        setModalAberto(false);
        setPedidoEmEdicao(null);
        setIdOrcamentoOrigem(null);
        setBuscaCliente('');
        setClienteSelecionadoInfo(null);
        setBuscaProduto('');
        setItensPedido([]); 
        setPagamentosPedido([]);
        setNovoPagamento({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', data: obterDataAtual() });
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });
        setNovoPedido({
            cliente: '', cliente_id: null, servico: '', valor_total: '',
            status: 'Produzir', data_pedido: obterDataAtual(),
            prazo: '', responsavel: '', local_producao: 'Berlim', aprovado: false,
            entrega: false
        });
        setOutrasOSAbertas([]);
    }

    function abrirEdicao(pedido) {
        const dadosDesconstruidos = desconstruirTextoServico(pedido.servico);
        setPedidoEmEdicao(pedido);
        setBuscaCliente(pedido.cliente);
        // Busca o cliente vinculado pela chave primária. Não dá pra tirar isso da
        // lista de busca por nome: ela é limitada a 15 resultados, e com dezenas
        // de homônimos (há 12 clientes chamados só "Vanessa") o cliente da OS
        // costuma ficar de fora — aí a tela caía no primeiro nome igual e exibia
        // o telefone de outra pessoa.
        setClienteSelecionadoInfo(null);
        if (pedido.cliente_id) {
            clienteInfoPedidoRef.current = pedido.id;
            supabase.from('clientes').select('id, telefone').eq('id', pedido.cliente_id).single()
                .then(({ data }) => {
                    // Ignora a resposta se o usuário já abriu outra OS nesse meio tempo.
                    if (data && clienteInfoPedidoRef.current === pedido.id) {
                        setClienteSelecionadoInfo({ id: data.id, telefone: data.telefone });
                    }
                });
        }
        const itensCarregados = pedido.pedido_itens
            ? [...pedido.pedido_itens].sort((a, b) => a.ordem - b.ordem).map(itemDbParaCarrinho)
            : dadosDesconstruidos.itens;
        setItensPedido(itensCarregados);
        const pagamentosRecuperados = pedido.pedido_pagamentos
            ? [...pedido.pedido_pagamentos].sort((a, b) => a.ordem - b.ordem).map(pagamentoDbParaCarrinho)
            : (dadosDesconstruidos.pagamentos || []);
        setPagamentosPedido(pagamentosRecuperados);

        const totalPago = pagamentosRecuperados.reduce((acc, p) => acc + valorPagamentoComSinal(p), 0);
        const totalOSStr = centavosParaReais(pedido.valor_total);
        const saldoRestante = totalOSStr - totalPago;
        
        setNovoPagamento({
            valor: saldoRestante > 0 ? formatarMoeda((saldoRestante * 100).toFixed(0).toString()) : '',
            forma: 'PIX', parcelas: 1, instituicao: 'Itaú', data: obterDataAtual()
        });
        setNovoPedido({
            cliente: pedido.cliente,
            cliente_id: pedido.cliente_id || null,
            servico: dadosDesconstruidos.observacoes,
            status: pedido.status,
            valor_total: formatarMoeda(Math.round(pedido.valor_total).toString()),
            data_pedido: pedido.data_pedido || null,
            prazo: pedido.prazo || null,
            responsavel: pedido.responsavel || '',
            local_producao: pedido.local_producao || 'Berlim',
            aprovado: pedido.aprovado || false,
            entrega: pedido.entrega || false
        });
        setModalAberto(true);
    }

    function abrirEdicaoProduto(produto) {
        setNovoProduto({ id: produto.id, nome: produto.nome, texto_padrao: produto.texto_padrao, preco_base: formatarMoeda(Math.round(produto.preco_base).toString()) });
        setModalProdutoAberto(true);
    }

    function abrirEdicaoCliente(cliente) {
        setNovoCliente({ id: cliente.id, nome: cliente.nome, telefone: cliente.telefone, email: cliente.email, observacoes: cliente.observacoes, cliente_problema: cliente.cliente_problema || false });
        setModalClienteAberto(true);
    }

    function abrirEdicaoUsuario(usr) {
        setNovoUsuario({ id: usr.id, nome: usr.nome, email: '', senha: '', nivel: usr.nivel });
        setModalUsuarioAberto(true);
    }

    async function salvarUsuario(e) {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { avisar('Sessão expirada, faça login novamente.', 'erro'); return; }

        const metodo = novoUsuario.id ? 'PUT' : 'POST';
        const payload = novoUsuario.id
            ? { id: novoUsuario.id, nome: novoUsuario.nome, nivel: novoUsuario.nivel, novaSenha: novoUsuario.senha || undefined }
            : { email: novoUsuario.email, senha: novoUsuario.senha, nome: novoUsuario.nome, nivel: novoUsuario.nivel };

        const resposta = await fetch('/api/usuarios', {
            method: metodo,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify(payload),
        });
        const resultado = await resposta.json();

        if (!resposta.ok) {
            avisar('Falha ao salvar usuário: ' + (resultado.error || 'erro desconhecido'), 'erro');
            return;
        }

        if (novoUsuario.id) {
            setUsuariosSistema(usuariosSistema.map(u => u.id === resultado.perfil.id ? resultado.perfil : u));
        } else {
            setUsuariosSistema([...usuariosSistema, resultado.perfil]);
        }
        setModalUsuarioAberto(false);
    }

    function adicionarItemAoCarrinho() {
        if (!itemAtual.descricao || !itemAtual.valor) return;
        const pctDesconto = parseFloat(itemAtual.desconto) || 0;
        const numOriginal = parseValorMoeda(itemAtual.valor);
        const valorFinalCalculadoNum = numOriginal * (1 - pctDesconto / 100);
        const valorFinalCalculadoStr = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorFinalCalculadoNum);
        
        const novoItemEmpacotado = { 
            ...itemAtual, valor_original: itemAtual.valor, valor: valorFinalCalculadoStr, id_temp: Math.random() + Date.now() 
        };

        const novosItens = [...itensPedido, novoItemEmpacotado];
        setItensPedido(novosItens); 
        
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseValorMoeda(i.valor); });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
        
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });
        setBuscaProduto('');
    }

    function removerItemDoCarrinho(id_temp) {
        const novosItens = itensPedido.filter(i => i.id_temp !== id_temp);
        setItensPedido(novosItens);
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseValorMoeda(i.valor); });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
    }

    function salvarEdicaoItemCarrinho(id_temp) {
        if (!itemAtual.descricao || !itemAtual.valor) return;
        const pctDesconto = parseFloat(itemAtual.desconto) || 0;
        const numOriginal = parseValorMoeda(itemAtual.valor);
        const valorFinalCalculadoNum = numOriginal * (1 - pctDesconto / 100);
        const valorFinalCalculadoStr = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorFinalCalculadoNum);

        const itemAtualizado = { ...itemAtual, valor_original: itemAtual.valor, valor: valorFinalCalculadoStr, id_temp };

        const novosItens = itensPedido.map(i => i.id_temp === id_temp ? itemAtualizado : i);
        setItensPedido(novosItens);

        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseValorMoeda(i.valor); });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});

        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });
        setBuscaProduto('');
    }

    // Grava pedido_itens/pedido_pagamentos a partir do carrinho do modal
    // (delete-then-insert por pedido_id, idempotente — reflete exatamente o
    // carrinho atual, igual ao que já acontece com pedidos.servico). Devolve
    // as linhas inseridas (com id real do banco) pra manter o pedido em
    // memória consistente sem precisar de um carregarDados() completo.
    // Fonte de verdade nova; pedidos.servico continua sendo gravado em
    // paralelo (espelho) pelos chamadores — ver [[project-segmentacao-2026-08]]
    // style comment no topo do arquivo de migração SQL.
    async function salvarItensPagamentosDoPedido(pedidoId, itens, pagamentos) {
        await Promise.all([
            supabase.from('pedido_itens').delete().eq('pedido_id', pedidoId),
            supabase.from('pedido_pagamentos').delete().eq('pedido_id', pedidoId),
        ]);

        const linhasItens = itens.map((i, idx) => ({
            pedido_id: pedidoId, produto_id: i.id_produto || null, ordem: idx,
            nome: i.nome || null, descricao: i.descricao || null,
            valor_centavos: paraCentavos(i.valor),
            valor_original_centavos: i.valor_original ? paraCentavos(i.valor_original) : null,
            desconto_percentual: i.desconto ? Number(i.desconto) : null,
            local_producao: i.local_producao || null, concluido: !!i.concluido,
        }));
        const linhasPagamentos = pagamentos.map((p, idx) => ({
            pedido_id: pedidoId, ordem: idx, forma: p.forma || 'Indefinido',
            valor_centavos: paraCentavos(p.valor), parcelas: p.parcelas ?? null,
            instituicao: p.instituicao || null, bandeira: p.bandeira || null,
            data: p.data || null, vencimento_boleto: p.vencimento_boleto || null,
            boleto_concluido: p.boleto_concluido ?? null, lote_id: p.lote_id || null,
        }));

        const [{ data: itensInseridos, error: errItens }, { data: pagamentosInseridos, error: errPag }] = await Promise.all([
            linhasItens.length > 0 ? supabase.from('pedido_itens').insert(linhasItens).select() : Promise.resolve({ data: [], error: null }),
            linhasPagamentos.length > 0 ? supabase.from('pedido_pagamentos').insert(linhasPagamentos).select() : Promise.resolve({ data: [], error: null }),
        ]);
        if (errItens || errPag) {
            console.error('Erro ao gravar itens/pagamentos da OS:', errItens || errPag);
            avisar('OS salva, mas houve erro ao gravar itens/pagamentos estruturados: ' + (errItens || errPag).message, 'erro');
        }
        return { pedido_itens: itensInseridos || [], pedido_pagamentos: pagamentosInseridos || [] };
    }

    async function salvarOS(e, querImprimir = false, statusForcado = null) {
        if (e) e.preventDefault();

        // Nome digitado sem escolher ninguém no autocomplete: ou é venda de balcão
        // (legítimo — cliente_id fica null de propósito) ou o atendente esqueceu de
        // selecionar. Só quem está cadastrando sabe qual dos dois, então pergunta
        // antes de gravar. Campo vazio NÃO pergunta: aí a venda avulsa é inequívoca,
        // e um diálogo em toda venda de balcão vira reflexo de clicar "Confirmar" —
        // aí ele deixa de funcionar justamente no caso ambíguo, que é o que importa.
        // Vem antes do setSalvandoOS(true): cancelar aqui não pode deixar o botão
        // preso em "salvando".
        if (novoPedido.cliente?.trim() && !novoPedido.cliente_id) {
            const querSalvarAvulsa = await confirmar(
                'Nenhum cliente do cadastro foi selecionado para esta OS.\n\n' +
                'Salvar como venda avulsa (Balcão)? O nome digitado continua na OS como referência, ' +
                'mas ela não entra na consolidação de pagamentos nem no ranking desse cliente.\n\n' +
                'Para vincular, cancele e escolha o cliente na lista.'
            );
            if (!querSalvarAvulsa) return;
        }

        setSalvandoOS(true);
        const statusFinal = statusForcado || novoPedido.status;

        const textoFinalServico = construirTextoServico({ itens: itensPedido, observacoes: novoPedido.servico, pagamentos: pagamentosPedido });

        const valorNumericoFinal = paraCentavos(novoPedido.valor_total);

        // Calcular locais unicos da OS a partir dos itens
        const locaisOS = [...new Set(itensPedido.map(i => i.local_producao || 'Berlim'))].join(', ');

        const payload = {
            cliente: novoPedido.cliente,
            cliente_id: novoPedido.cliente_id || null,
            servico: textoFinalServico,
            status: statusFinal,
            valor_total: valorNumericoFinal,
            data_pedido: novoPedido.data_pedido || null,
            prazo: novoPedido.prazo || null,
            responsavel: novoPedido.responsavel,
            local_producao: locaisOS,
            aprovado: novoPedido.aprovado,
            entrega: novoPedido.entrega
        };

        if (statusFinal === 'Concluído' && (!pedidoEmEdicao || pedidoEmEdicao.status !== 'Concluído')) {
            payload.prazo = obterDataAtual();
        }
        if (statusFinal === 'Retirada' && (!pedidoEmEdicao || pedidoEmEdicao.status !== 'Retirada')) {
            payload.data_retirada = obterDataAtual();
        }
        if (statusFinal === 'Cancelado' && (!pedidoEmEdicao || pedidoEmEdicao.status !== 'Cancelado')) {
            payload.cancelado_em = new Date().toISOString();
        }

        if (pedidoEmEdicao) {
            const { data, error } = await supabase.from('pedidos').update(payload).eq('id', pedidoEmEdicao.id).select();

            if (error) {
                avisar('Erro ao atualizar OS: ' + error.message, 'erro');
            } else if (data && data.length > 0) {
                const itensPagamentos = await salvarItensPagamentosDoPedido(data[0].id, itensPedido, pagamentosPedido);
                setPedidos(pedidos.map(p => p.id === data[0].id ? { ...data[0], ...itensPagamentos } : p));
                fecharModalOS();
                if (querImprimir) imprimirOS({ ...data[0], ...itensPagamentos });
            } else {
                // Se a resposta for vazia, puxa as informações limpas e fecha sem travar
                await salvarItensPagamentosDoPedido(pedidoEmEdicao.id, itensPedido, pagamentosPedido);
                carregarDados();
                fecharModalOS();
                if (querImprimir) imprimirOS({ ...pedidoEmEdicao, ...payload });
            }
        } else {
            const { data: ultimoPedido } = await supabase.from('pedidos').select('id').order('id', { ascending: false }).limit(1);
            const idBase = ultimoPedido && ultimoPedido.length > 0 ? ultimoPedido[0].id : (pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) : 0);
            let novoId = Math.max(idBase, NUMERO_INICIAL_PEDIDO - 1) + 1;
            payload.criado_por = usuario?.nome || 'Desconhecido';

            let data, error;
            for (let tentativa = 0; tentativa < 5; tentativa++) {
                payload.id = novoId;
                ({ data, error } = await supabase.from('pedidos').insert([payload]).select());
                if (!error || error.code !== '23505') break;
                novoId += 1; // ID já usado por outra O.S. criada nesse meio tempo; tenta o próximo.
            }

            if (error) {
                avisar('Erro ao salvar OS: ' + error.message, 'erro');
            } else if (data && data.length > 0) {
                const itensPagamentos = await salvarItensPagamentosDoPedido(data[0].id, itensPedido, pagamentosPedido);
                setPedidos([{ ...data[0], ...itensPagamentos }, ...pedidos]);
                if (idOrcamentoOrigem) {
                    supabase.from('orcamentos_formalizados').delete().eq('id', idOrcamentoOrigem).then(({ error }) => {
                        if (!error) setOrcamentosFormalizados(prev => prev.filter(o => o.id !== idOrcamentoOrigem));
                    });
                }
                fecharModalOS();
                if (querImprimir) imprimirOS({ ...data[0], ...itensPagamentos });
            } else {
                // Se a resposta for vazia, puxa as informações limpas e fecha sem travar
                await salvarItensPagamentosDoPedido(novoId, itensPedido, pagamentosPedido);
                if (idOrcamentoOrigem) {
                    supabase.from('orcamentos_formalizados').delete().eq('id', idOrcamentoOrigem).then(({ error }) => {
                        if (!error) setOrcamentosFormalizados(prev => prev.filter(o => o.id !== idOrcamentoOrigem));
                    });
                }
                carregarDados();
                fecharModalOS();
                if (querImprimir) avisar('Pedido atualizado com sucesso! Para evitar lentidão, inicie a impressão manualmente através do Histórico.', 'sucesso');
            }
        }
        setSalvandoOS(false);
    }

    // Duplica uma O.S. como um pedido novo e independente: mesmo cliente/serviço/
    // valor/responsável/local, mas sem os pagamentos já lançados e reiniciando o
    // fluxo (status inicial, sem prazo, arte/entrega não aprovadas ainda).
    async function duplicarOS(pedido) {
        const servicoSemPagamentos = pedido.servico ? pedido.servico.split('\n\n[PAGAMENTOS]\n')[0] : '';
        const { data: ultimoPedido } = await supabase.from('pedidos').select('id').order('id', { ascending: false }).limit(1);
        const idBase = ultimoPedido && ultimoPedido.length > 0 ? ultimoPedido[0].id : (pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) : 0);
        let novoId = Math.max(idBase, NUMERO_INICIAL_PEDIDO - 1) + 1;
        const payload = {
            cliente: pedido.cliente,
            cliente_id: pedido.cliente_id || null,
            servico: servicoSemPagamentos,
            status: 'Aguardando Pagamento',
            valor_total: pedido.valor_total,
            data_pedido: obterDataAtual(),
            prazo: null,
            responsavel: pedido.responsavel,
            local_producao: pedido.local_producao,
            aprovado: false,
            entrega: false,
            criado_por: usuario?.nome || 'Desconhecido',
        };
        let data, error;
        for (let tentativa = 0; tentativa < 5; tentativa++) {
            payload.id = novoId;
            ({ data, error } = await supabase.from('pedidos').insert([payload]).select());
            if (!error || error.code !== '23505') break;
            novoId += 1;
        }
        if (error) { avisar('Erro ao duplicar O.S.: ' + error.message, 'erro'); return; }
        if (data && data.length > 0) {
            // Clona pedido_itens (sem pedido_pagamentos, igual ao texto acima
            // que já descarta os pagamentos da OS original).
            const itensOrigem = pedido.pedido_itens || [];
            let itensClonados = [];
            if (itensOrigem.length > 0) {
                const linhas = [...itensOrigem].sort((a, b) => a.ordem - b.ordem).map(item => ({
                    pedido_id: data[0].id, produto_id: item.produto_id, ordem: item.ordem,
                    nome: item.nome, descricao: item.descricao,
                    valor_centavos: item.valor_centavos, valor_original_centavos: item.valor_original_centavos,
                    desconto_percentual: item.desconto_percentual, local_producao: item.local_producao,
                    concluido: item.concluido,
                }));
                const { data: inseridos, error: errItens } = await supabase.from('pedido_itens').insert(linhas).select();
                if (errItens) console.error('Erro ao clonar itens da OS:', errItens);
                itensClonados = inseridos || [];
            }
            setPedidos([{ ...data[0], pedido_itens: itensClonados, pedido_pagamentos: [] }, ...pedidos]);
            avisar(`O.S. duplicada como #${data[0].id}.`, 'sucesso');
        }
    }

    // === FUNÇÕES ORÇAMENTOS PRÉ PRONTOS ===
    async function salvarOrcamentoPre(e) {
        e.preventDefault();
        const payload = { titulo: novoOrcamentoPre.titulo, texto: novoOrcamentoPre.texto, empresa: novoOrcamentoPre.empresa || 'Berlim' };
        if (novoOrcamentoPre.id) {
            const { data, error } = await supabase.from('orcamentos_pre_prontos').update(payload).eq('id', novoOrcamentoPre.id).select();
            if (!error && data) {
                setOrcamentosPreProntos(orcamentosPreProntos.map(o => o.id === novoOrcamentoPre.id ? data[0] : o));
                setModalOrcamentoPreAberto(false);
            } else avisar('Erro: ' + error?.message, 'erro');
        } else {
            const { data, error } = await supabase.from('orcamentos_pre_prontos').insert([payload]).select();
            if (!error && data) {
                setOrcamentosPreProntos([data[0], ...orcamentosPreProntos]);
                setModalOrcamentoPreAberto(false);
            } else avisar('Erro: ' + error?.message, 'erro');
        }
    }

    async function excluirOrcamentoPre(id) {
        if (!(await confirmar('Excluir este modelo pré-pronto?'))) return;
        const { error } = await supabase.from('orcamentos_pre_prontos').delete().eq('id', id);
        if (!error) setOrcamentosPreProntos(orcamentosPreProntos.filter(o => o.id !== id));
        else avisar('Erro: ' + error.message, 'erro');
    }

    // === FUNÇÕES ORÇAMENTOS FORMALIZADOS ===
    async function salvarOrcamentoFormalizado(e, querImprimir = false) {
        if (e) e.preventDefault();

        // Mesma regra do salvarOS: nome digitado sem escolher no autocomplete pode
        // ser orçamento avulso (legítimo) ou seleção esquecida — só quem cadastra
        // sabe. Campo vazio não pergunta, pra não virar clique reflexo.
        if (novoPedido.cliente?.trim() && !novoPedido.cliente_id) {
            const querSalvarAvulso = await confirmar(
                'Nenhum cliente do cadastro foi selecionado para este orçamento.\n\n' +
                'Salvar assim mesmo? O nome digitado continua no orçamento, mas ele não fica ' +
                'vinculado ao cadastro — sem telefone no PDF e sem aviso de cliente problemático.\n\n' +
                'Para vincular, cancele e escolha o cliente na lista.'
            );
            if (!querSalvarAvulso) return;
        }

        const textoFinalServico = construirTextoServico({ itens: itensPedido, observacoes: novoPedido.servico, pagamentos: [] });

        const valorNumericoFinal = paraCentavos(novoPedido.valor_total);

        const payload = {
            cliente: novoPedido.cliente,
            cliente_id: novoPedido.cliente_id || null,
            // Cliente clicado agora; senão o vínculo gravado; senão o telefone que já
            // estava no orçamento (reedição sem mexer no cliente). Nunca busca por
            // nome: com homônimo (13 "Silvana" no cadastro) isso gravava o telefone
            // de outra pessoa no orçamento e no PDF impresso.
            telefone: clienteSelecionadoInfo?.telefone
                ?? (novoPedido.cliente_id ? clientes.find(c => c.id === novoPedido.cliente_id)?.telefone : undefined)
                ?? orcamentoFormalizadoEmEdicao?.telefone ?? '',
            produto: itensPedido.map(i => i.nome).join(', ') || 'Serviços Diversos',
            descricao: textoFinalServico,
            quantidade: 1,
            valor: valorNumericoFinal,
            observacoes: novoPedido.servico,
            criado_por: usuario?.nome || 'Desconhecido'
        };

        // Grava orcamento_itens a partir do carrinho (delete-then-insert por
        // orcamento_id, mesmo padrão de salvarItensPagamentosDoPedido).
        async function salvarItensOrcamento(orcamentoId) {
            await supabase.from('orcamento_itens').delete().eq('orcamento_id', orcamentoId);
            if (itensPedido.length === 0) return [];
            const linhas = itensPedido.map((i, idx) => ({
                orcamento_id: orcamentoId, produto_id: i.id_produto || null, ordem: idx,
                nome: i.nome || null, descricao: i.descricao || null,
                valor_centavos: paraCentavos(i.valor),
                valor_original_centavos: i.valor_original ? paraCentavos(i.valor_original) : null,
                desconto_percentual: i.desconto ? Number(i.desconto) : null,
                local_producao: i.local_producao || null,
            }));
            const { data: inseridos, error } = await supabase.from('orcamento_itens').insert(linhas).select();
            if (error) {
                console.error('Erro ao gravar itens do orçamento:', error);
                avisar('Orçamento salvo, mas houve erro ao gravar itens estruturados: ' + error.message, 'erro');
            }
            return inseridos || [];
        }

        if (orcamentoFormalizadoEmEdicao) {
            const { data, error } = await supabase.from('orcamentos_formalizados').update(payload).eq('id', orcamentoFormalizadoEmEdicao.id).select();
            if (error) avisar('Erro: ' + error.message, 'erro');
            else if (data && data.length > 0) {
                const orcamento_itens = await salvarItensOrcamento(data[0].id);
                setOrcamentosFormalizados(orcamentosFormalizados.map(o => o.id === data[0].id ? { ...data[0], orcamento_itens } : o));
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento({ ...data[0], orcamento_itens });
            }
        } else {
            const { data, error } = await supabase.from('orcamentos_formalizados').insert([payload]).select();
            if (error) avisar('Erro: ' + error.message, 'erro');
            else if (data && data.length > 0) {
                const orcamento_itens = await salvarItensOrcamento(data[0].id);
                setOrcamentosFormalizados([{ ...data[0], orcamento_itens }, ...orcamentosFormalizados]);
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento({ ...data[0], orcamento_itens });
            }
        }
    }

    async function baixarPDFOrcamento(orc) {
        setOsParaImprimir(null);
        setOrcamentoParaImprimir(orc);
        
        // Dados do cliente no PDF vêm do vínculo. Antes era .eq('nome', ...).single(),
        // que com homônimo tinha dois desfechos, ambos ruins: erro silencioso (single()
        // exige exatamente 1 linha, e há 13 "Silvana") ou, pior, endereço e documento
        // de outra pessoa impressos no orçamento. Sem vínculo, imprime sem clienteInfo.
        if (orc.cliente_id) {
            const { data } = await supabase.from('clientes').select('*').eq('id', orc.cliente_id).maybeSingle();
            if (data) setOrcamentoParaImprimir(prev => ({...prev, clienteInfo: data}));
        }
        
        setTimeout(() => window.print(), 200);
    }
    
    function abrirEdicaoOrcamento(orcamento) {
        const itensCarregados = [...(orcamento.orcamento_itens || [])].sort((a, b) => a.ordem - b.ordem).map(itemDbParaCarrinho);
        const obs = orcamento.observacoes || (orcamento.descricao ? desconstruirTextoServico(orcamento.descricao.split('\n\n[ITENS_JSON]')[0]).observacoes : '');
        
        setOrcamentoFormalizadoEmEdicao(orcamento);
        setBuscaCliente(orcamento.cliente);
        setClienteSelecionadoInfo(null);
        setItensPedido(itensCarregados);
        setNovoPedido({
            cliente: orcamento.cliente,
            // Sem isso, reabrir e salvar um orçamento já vinculado zerava o
            // cliente_id — a edição apagaria justamente o vínculo que se quer manter.
            cliente_id: orcamento.cliente_id || null,
            servico: obs || '',
            valor_total: formatarMoeda(Math.round(orcamento.valor).toString()),
            status: 'Orçamento',
            data_pedido: obterDataAtual(),
            prazo: '',
            responsavel: usuario?.nome || '',
            entrega: false
        });
        setModalOrcamentoFormalizadoAberto(true);
    }
    
    function transformarEmOS(orcamento) {
        const itensCarregados = [...(orcamento.orcamento_itens || [])].sort((a, b) => a.ordem - b.ordem).map(itemDbParaCarrinho);
        setPedidoEmEdicao(null);
        setBuscaCliente(orcamento.cliente);
        setClienteSelecionadoInfo(null);
        setItensPedido(itensCarregados);
        setNovoPedido({
            cliente: orcamento.cliente,
            // Carrega o vínculo do orçamento pra OS que nasce dele: sem isso, todo
            // orçamento aprovado geraria uma OS sem cliente_id e a confirmação de
            // venda avulsa apareceria em cima de um cliente que já estava vinculado.
            cliente_id: orcamento.cliente_id || null,
            servico: '',
            valor_total: formatarMoeda(Math.round(orcamento.valor).toString()),
            status: 'Produzir',
            data_pedido: obterDataAtual(),
            prazo: '',
            responsavel: usuario?.nome || '',
            entrega: false
        });
        setIdOrcamentoOrigem(orcamento.id);
        setModalAberto(true);
    }
    
    async function excluirOrcamentoFormalizado(id) {
        if (!(await confirmar('Excluir este orçamento formalizado?'))) return;
        const { error } = await supabase.from('orcamentos_formalizados').delete().eq('id', id);
        if (!error) setOrcamentosFormalizados(orcamentosFormalizados.filter(o => o.id !== id));
        else avisar('Erro: ' + error.message, 'erro');
    }

    async function salvarProduto(e) {
        e.preventDefault();
        setSalvandoProduto(true);
        const produtoFormatado = { nome: novoProduto.nome, texto_padrao: novoProduto.texto_padrao, preco_base: paraCentavos(novoProduto.preco_base) };

        if (novoProduto.id) {
            const { data, error } = await supabase.from('produtos').update(produtoFormatado).eq('id', novoProduto.id).select();
            if (!error && data) { setProdutos(produtos.map(p => p.id === novoProduto.id ? data[0] : p)); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); }
            else avisar('Falha ao atualizar: ' + error.message, 'erro');
        } else {
            const { data, error } = await supabase.from('produtos').insert([produtoFormatado]).select();
            if (!error && data) { setProdutos([...produtos, data[0]]); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); }
            else avisar('Falha ao salvar: ' + error.message, 'erro');
        }
        setSalvandoProduto(false);
    }

    // Busca o catálogo direto do banco (sem esperar o Realtime), pra usar em
    // pontos onde é crítico não trabalhar com uma lista de produtos desatualizada
    // — ex: ao focar o campo de busca de item dentro de um pedido já aberto.
    async function atualizarCatalogoProdutos() {
        const { data } = await supabase.from('produtos').select('*').order('ordem', { ascending: true });
        if (data) setProdutos(data);
    }

    async function criarCopiaRecorrente(contaOriginal) {
        const parcelaAtual = contaOriginal.recorrente_parcela_atual || 1;
        const totalParcelas = contaOriginal.recorrente_total_parcelas;
        // Parcelamento com fim definido (ex: 10x): ao pagar a última parcela, não gera cópia nova.
        if (totalParcelas && parcelaAtual >= totalParcelas) return;

        const copiaPendente = {
            descricao: contaOriginal.descricao,
            valor: 0,
            vencimento: adicionarMesData(contaOriginal.vencimento),
            status: 'Pendente',
            recorrente: true,
            recorrente_total_parcelas: totalParcelas || null,
            recorrente_parcela_atual: parcelaAtual + 1,
            categoria: contaOriginal.categoria || 'Despesa',
            fornecedor_id: contaOriginal.fornecedor_id || null
        };
        const { data: novaCopia, error } = await supabase.from('contas_pagar').insert([copiaPendente]).select();
        if (!error && novaCopia) {
            setContasPagar(prev => [...prev, novaCopia[0]]);
            notificarSeContaPagarUrgente(novaCopia[0]);
        }
    }

    async function concluirConta(id) {
        const contaAnterior = contasPagar.find(c => c.id === id);
        if (!contaAnterior || contaAnterior.status === 'Pago') return;
        if (!(await confirmar(`Deseja marcar a conta "${contaAnterior.descricao}" como paga?`))) return;

        const { data, error } = await supabase.from('contas_pagar').update({ status: 'Pago' }).eq('id', id).select();
        if (!error && data) {
            setContasPagar(prev => prev.map(c => c.id === id ? data[0] : c));
            if (contaAnterior.recorrente) {
                await criarCopiaRecorrente(data[0]);
            }
        } else {
            avisar('Falha ao concluir: ' + (error?.message || 'Erro desconhecido'), 'erro');
        }
    }

    const [salvandoConta, setSalvandoConta] = useState(false);
    async function salvarConta(e) {
        e.preventDefault();
        setSalvandoConta(true);
        const contaFormatada = {
            descricao: novaConta.descricao,
            valor: paraCentavos(novaConta.valor),
            vencimento: novaConta.vencimento,
            status: novaConta.status,
            recorrente: novaConta.recorrente,
            recorrente_total_parcelas: novaConta.recorrente ? (novaConta.recorrente_total_parcelas || null) : null,
            recorrente_parcela_atual: novaConta.recorrente_parcela_atual || 1,
            categoria: novaConta.categoria || 'Despesa',
            fornecedor_id: novaConta.categoria && novaConta.categoria !== 'Despesa' ? (novaConta.fornecedor_id || null) : null
        };

        if (novaConta.id) {
            const contaAnterior = contasPagar.find(c => c.id === novaConta.id);
            const tornouPaga = contaAnterior && contaAnterior.status !== 'Pago' && contaFormatada.status === 'Pago';

            const { data, error } = await supabase.from('contas_pagar').update(contaFormatada).eq('id', novaConta.id).select();
            if (!error && data) {
                setContasPagar(prev => prev.map(c => c.id === novaConta.id ? data[0] : c));
                notificarSeContaPagarUrgente(data[0]);
                if (tornouPaga && contaFormatada.recorrente) {
                    await criarCopiaRecorrente(data[0]);
                }
                setModalContaAberto(false);
            } else {
                avisar('Falha ao atualizar (Tabela contas_pagar existe no Supabase?): ' + (error?.message || 'Erro desconhecido'), 'erro');
            }
        } else {
            const { data, error } = await supabase.from('contas_pagar').insert([contaFormatada]).select();
            if (!error && data) {
                setContasPagar([...contasPagar, data[0]]);
                if (usuario?.nivel === 'Financeiro' || ehUsuario('Giovana')) {
                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Nova conta a pagar: ${data[0].descricao}`, tipo: 'nova_conta_pagar' }]);
                }
                notificarSeContaPagarUrgente(data[0]);
                setModalContaAberto(false);
            } else {
                avisar('Falha ao salvar (Tabela contas_pagar existe no Supabase?): ' + (error?.message || 'Erro desconhecido'), 'erro');
            }
        }
        setSalvandoConta(false);
    }

    const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
    async function salvarEmpresaFaturamento(e) {
        e.preventDefault();
        setSalvandoEmpresa(true);
        const payload = { nome: novaEmpresaFaturamento.nome, cnpj: novaEmpresaFaturamento.cnpj, status: novaEmpresaFaturamento.status, observacoes: novaEmpresaFaturamento.observacoes };
        if (novaEmpresaFaturamento.id) {
            const { data, error } = await supabase.from('empresas_faturamento').update(payload).eq('id', novaEmpresaFaturamento.id).select();
            if (!error && data) {
                setEmpresasFaturamento(empresasFaturamento.map(x => x.id === data[0].id ? data[0] : x));
                notificarSeFaturamentoEmAnalise(data[0]);
            }
            else if (error) avisar('Falha ao atualizar (A tabela empresas_faturamento foi criada?): ' + error.message, 'erro');
        } else {
            const { data, error } = await supabase.from('empresas_faturamento').insert([payload]).select();
            if (!error && data) {
                setEmpresasFaturamento([...empresasFaturamento, data[0]]);
                notificarSeFaturamentoEmAnalise(data[0]);
            }
            else if (error) avisar('Falha ao salvar (A tabela empresas_faturamento foi criada?): ' + error.message, 'erro');
        }
        setModalEmpresaFaturamentoAberto(false);
        setSalvandoEmpresa(false);
    }

    async function excluirEmpresaFaturamento(id) {
        if (!(await confirmar('Deseja excluir esta empresa?'))) return;
        const { error } = await supabase.from('empresas_faturamento').delete().eq('id', id);
        if (!error) setEmpresasFaturamento(empresasFaturamento.filter(x => x.id !== id));
    }

    async function excluirProduto(id, e) {
        e.stopPropagation(); // Evita que o clique no lixo abra a tela de edição
        
        if (!(await confirmar("Tem certeza que deseja excluir este produto do catálogo?"))) return;

        const { error } = await supabase.from('produtos').delete().eq('id', id);

        if (error) {
            avisar('Erro ao excluir produto: ' + error.message, 'erro');
        } else {
            setProdutos(produtos.filter(p => p.id !== id));
        }
    }

    async function excluirConta(id) {
        if (!(await confirmar('Deseja excluir esta conta?'))) return;
        const { error } = await supabase.from('contas_pagar').delete().eq('id', id);
        if (!error) setContasPagar(contasPagar.filter(x => x.id !== id));
    }

    async function duplicarProduto(produto) {
        const payload = { nome: produto.nome + ' (cópia)', texto_padrao: produto.texto_padrao, preco_base: produto.preco_base, ordem: produtos.length };
        const { data, error } = await supabase.from('produtos').insert([payload]).select();
        if (!error && data) { setProdutos([...produtos, data[0]]); avisar('Produto duplicado.', 'sucesso'); }
        else avisar('Erro ao duplicar produto: ' + (error?.message || 'erro desconhecido'), 'erro');
    }

    async function duplicarFornecedor(fornecedor) {
        const payload = { nome: fornecedor.nome + ' (cópia)', contato: fornecedor.contato, observacoes: fornecedor.observacoes, tipo: fornecedor.tipo };
        const { data, error } = await supabase.from('fornecedores').insert([payload]).select();
        if (!error && data) { setFornecedores([...fornecedores, data[0]]); avisar('Fornecedor duplicado.', 'sucesso'); }
        else avisar('Erro ao duplicar fornecedor: ' + (error?.message || 'erro desconhecido'), 'erro');
    }

    // Duplica uma conta a pagar como um lançamento novo e independente — nunca
    // como recorrente (evitaria criar um encadeamento de parcelas indesejado).
    async function duplicarConta(conta) {
        const payload = {
            descricao: conta.descricao,
            valor: conta.valor,
            vencimento: conta.vencimento,
            status: 'Pendente',
            recorrente: false,
            recorrente_total_parcelas: null,
            recorrente_parcela_atual: 1,
            categoria: conta.categoria || 'Despesa',
            fornecedor_id: conta.fornecedor_id || null,
        };
        const { data, error } = await supabase.from('contas_pagar').insert([payload]).select();
        if (!error && data) { setContasPagar(prev => [...prev, data[0]]); avisar('Conta duplicada.', 'sucesso'); }
        else avisar('Erro ao duplicar conta: ' + (error?.message || 'erro desconhecido'), 'erro');
    }

    async function handleDragStartProduto(e, index) {
        setDraggedProdutoIndex(index);
        e.dataTransfer.effectAllowed = "move";
    }

    async function handleDropProduto(e, targetIndex) {
        e.preventDefault();
        if (draggedProdutoIndex === null || draggedProdutoIndex === targetIndex) return;

        const novaLista = [...produtos];
        const [itemArrastado] = novaLista.splice(draggedProdutoIndex, 1);
        novaLista.splice(targetIndex, 0, itemArrastado);

        const listaComOrdem = novaLista.map((prod, idx) => ({ ...prod, ordem: idx }));
        setProdutos(listaComOrdem);
        setDraggedProdutoIndex(null);

        const payloadSupabase = listaComOrdem.map(p => ({
            id: p.id,
            nome: p.nome,
            texto_padrao: p.texto_padrao,
            preco_base: p.preco_base,
            ordem: p.ordem
        }));
        
        const { error } = await supabase.from('produtos').upsert(payloadSupabase);
        if (error) {
            console.error("Erro ao reordenar produtos:", error);
            avisar("Erro ao reordenar produtos: " + error.message, 'erro');
        }
    }

    async function salvarCliente(e) {
        e.preventDefault();
        setSalvandoCliente(true);
        const clienteFormatado = { nome: novoCliente.nome, telefone: novoCliente.telefone, email: novoCliente.email, observacoes: novoCliente.observacoes, cliente_problema: novoCliente.cliente_problema || false };

        if (clienteFormatado.telefone && clienteFormatado.telefone.trim() !== '') {
            const telNormalizado = apenasDigitos(clienteFormatado.telefone);
            let duplicado = null;
            if (telNormalizado.length >= 8) {
                // Os 8 últimos dígitos são o número sem DDD — pega tanto quem
                // está gravado com DDD quanto sem. A busca vai na coluna de
                // dígitos: procurar no texto formatado não achava a duplicata,
                // porque o hífen fica no meio do trecho procurado.
                const searchString = `%${telNormalizado.slice(-8)}%`;
                const { data: dupData } = await supabase.from('clientes').select('id,nome,telefone').ilike('telefone_digits', searchString);
                if (dupData) {
                    duplicado = dupData.find(c => {
                        if (novoCliente.id && c.id === novoCliente.id) return false;
                        if (!c.telefone) return false;
                        const cTelNorm = c.telefone.replace(/\D/g, '');
                        return cTelNorm.endsWith(telNormalizado) || telNormalizado.endsWith(cTelNorm);
                    });
                }
            }
            
            if (duplicado) {
                avisar('Aviso: Este número de WhatsApp/Telefone já está cadastrado no cliente "' + duplicado.nome + '"!');
                setSalvandoCliente(false);
                return;
            }
        }

        if (novoCliente.id) {
            const { data, error } = await supabase.from('clientes').update(clienteFormatado).eq('id', novoCliente.id).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); }
            else avisar('Falha ao atualizar: ' + error.message, 'erro');
        } else {
            const { data, error } = await supabase.from('clientes').insert([clienteFormatado]).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setNovoPedido({...novoPedido, cliente: data[0].nome, cliente_id: data[0].id}); setBuscaCliente(data[0].nome); setClienteSelecionadoInfo({ id: data[0].id, telefone: data[0].telefone }); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); }
            else avisar('Falha ao salvar: ' + error.message, 'erro');
        }
        setSalvandoCliente(false);
    }

    async function salvarNotaFiscal(e) {
        e.preventDefault();
        setSalvandoNotaFiscal(true);

        const valorNumerico = notaFiscalEmEdicao.valor_pago ? paraCentavos(notaFiscalEmEdicao.valor_pago) : null;

        const ehDanfe = notaFiscalEmEdicao.tipo_nota === 'DANFE';
        const payload = {
            servico_feito: notaFiscalEmEdicao.servico_feito,
            valor_pago: valorNumerico,
            observacoes: notaFiscalEmEdicao.observacoes,
            cliente: notaFiscalEmEdicao.cliente,
            tipo_nota: notaFiscalEmEdicao.tipo_nota,
            forma_pagamento: ehDanfe ? (notaFiscalEmEdicao.forma_pagamento || null) : null,
            forma_transporte: ehDanfe ? (notaFiscalEmEdicao.forma_transporte || null) : null
        };
        const { data, error } = await supabase.from('notas_fiscais').update(payload).eq('id', notaFiscalEmEdicao.id).select();
        if (!error && data) {
            setNotasFiscais(notasFiscais.map(n => n.id === notaFiscalEmEdicao.id ? data[0] : n));
            notificarSeNotaFiscalPreenchida(data[0]);
            setModalNotaFiscalAberto(false);
        } else {
            avisar('Falha ao atualizar nota: ' + error.message, 'erro');
        }
        setSalvandoNotaFiscal(false);
    }

    async function duplicarNotaFiscal(nota) {
        const payload = {
            cliente: nota.cliente,
            razao_social: nota.razao_social,
            cnpj: nota.cnpj,
            endereco: nota.endereco,
            contato: nota.contato,
            forma_envio: nota.forma_envio,
            observacao_cliente: nota.observacao_cliente,
            servico_feito: nota.servico_feito,
            valor_pago: nota.valor_pago,
            tipo_nota: nota.tipo_nota,
            forma_pagamento: nota.forma_pagamento,
            forma_transporte: nota.forma_transporte,
            observacoes: nota.observacoes,
            concluido: false,
        };
        const { data, error } = await supabase.from('notas_fiscais').insert([payload]).select();
        if (!error && data) { setNotasFiscais(prev => [data[0], ...prev]); avisar('Nota fiscal duplicada.', 'sucesso'); }
        else avisar('Erro ao duplicar nota fiscal: ' + (error?.message || 'erro desconhecido'), 'erro');
    }

    async function concluirNotaFiscal(id) {
        if (!(await confirmar('Deseja realmente marcar esta nota como concluída? Ela não aparecerá mais nesta lista.'))) return;
        const { data, error } = await supabase.from('notas_fiscais').update({ concluido: true }).eq('id', id).select();
        if (!error && data) {
            setNotasFiscais(notasFiscais.map(n => n.id === id ? data[0] : n));
        } else {
            avisar('Falha ao concluir: ' + error.message, 'erro');
        }
    }

    async function excluirNotaFiscal(id) {
        if (!(await confirmar('Deseja excluir esta nota fiscal? Essa ação não pode ser desfeita.'))) return;
        const { error } = await supabase.from('notas_fiscais').delete().eq('id', id);
        if (!error) setNotasFiscais(notasFiscais.filter(n => n.id !== id));
        else avisar('Falha ao excluir: ' + error.message, 'erro');
    }

    async function reabrirNotaFiscal(nota) {
        if (!(await confirmar(`Deseja gerar uma nova nota pendente para "${nota.razao_social || nota.cnpj}"?`))) return;

        const payload = {
            razao_social: nota.razao_social,
            cnpj: nota.cnpj,
            endereco: nota.endereco,
            contato: nota.contato,
            forma_envio: nota.forma_envio,
            observacao_cliente: nota.observacao_cliente,
            cliente: '',
            servico_feito: '',
            valor_pago: null,
            observacoes: '',
            tipo_nota: null,
            forma_pagamento: null,
            forma_transporte: null,
            concluido: false
        };

        const { data, error } = await supabase.from('notas_fiscais').insert([payload]).select();
        if (!error && data) {
            setNotasFiscais(prev => [data[0], ...prev]);
            if (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Atendimento' || usuario?.nivel === 'Produção') {
                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Nova Nota Fiscal solicitada (${data[0].cliente || data[0].cnpj})`, os_id: null, tipo: 'nf_nova' }]);
            }
        } else {
            avisar('Falha ao gerar nova nota: ' + (error?.message || 'Erro desconhecido'), 'erro');
        }
    }

    async function concluirRequisicao(id) {
        if (!(await confirmar('Deseja marcar esta requisição como comprada/concluída?'))) return;
        const { data, error } = await supabase.from('requisicoes_material').update({ status: 'Comprado' }).eq('id', id).select();
        if (!error && data) setRequisicoesMaterial(requisicoesMaterial.map(x => x.id === id ? data[0] : x));
    }

    async function concluirTarefa(id) {
        const tarefa = tarefasInternas.find(t => t.id === id);
        if (!tarefa?.fixa && !(await confirmar('Deseja marcar esta tarefa como concluída?'))) return;
        const payload = tarefa?.fixa ? { status: 'Concluída', ultima_conclusao: obterDataAtual() } : { status: 'Concluída' };
        const { data, error } = await supabase.from('tarefas_internas').update(payload).eq('id', id).select();
        if (!error && data) setTarefasInternas(tarefasInternas.map(x => x.id === id ? data[0] : x));
    }
    async function reabrirTarefaFixa(id) {
        const { data, error } = await supabase.from('tarefas_internas').update({ status: 'Pendente', ultima_conclusao: null }).eq('id', id).select();
        if (!error && data) setTarefasInternas(tarefasInternas.map(x => x.id === id ? data[0] : x));
    }
    async function resetarTarefasFixasDoDia(lista) {
        const hoje = obterDataAtual();
        const paraResetar = lista.filter(t => t.fixa && t.status === 'Concluída' && t.ultima_conclusao !== hoje);
        if (paraResetar.length === 0) return lista;
        const { data, error } = await supabase.from('tarefas_internas').update({ status: 'Pendente' }).in('id', paraResetar.map(t => t.id)).select();
        if (error || !data) return lista;
        return lista.map(t => data.find(d => d.id === t.id) || t);
    }

    async function concluirLink(id) {
        if (!(await confirmar('Deseja marcar este link como pago/concluído?'))) return;
        const { data, error } = await supabase.from('links_pagamento').update({ status: 'Pago' }).eq('id', id).select();
        if (!error && data) {
            setLinksPagamento(linksPagamento.map(x => x.id === id ? data[0] : x));
            notificarSeLinkPagamentoNovo(data[0]);
        }
    }

    async function imprimirOS(pedido) {
        setOrcamentoParaImprimir(null);
        setOsParaImprimir(pedido);
        // Pedido guarda o cliente como texto solto (sem vínculo por ID com a tabela
        // clientes) — usa ilike/trim pra não perder o telefone por causa de
        // maiúscula ou espaço divergente entre o nome no pedido e o cadastro atual.
        const { data } = await supabase.from('clientes').select('*').ilike('nome', (pedido.cliente || '').trim()).limit(1).maybeSingle();
        if (data) {
            // flushSync força o React a aplicar e renderizar esse estado antes da
            // próxima linha — sem isso, window.print() captura o DOM antes do
            // telefone aparecer (o setState sozinho só agenda a renderização).
            flushSync(() => setOsParaImprimir(prev => ({...prev, clienteInfo: data})));
        }
        window.print();
    }

    const clientesFiltrados = clientes;
    // Lógica para elencar os 5 produtos mais vendidos com base no histórico
    const vendasPorProduto = useMemo(() => {
        const mapa = {};
        pedidos.forEach(p => {
            const itens = p.pedido_itens || [];

            itens.forEach(item => {
                const nomeLimpo = (item.nome || '').trim();
                const valorNum = centavosParaReais(item.valor_centavos);

                const prod = item.produto_id
                    ? produtos.find(p => String(p.id) === String(item.produto_id))
                    : produtos.find(prod => prod.nome.toLowerCase() === nomeLimpo.toLowerCase());

                const finalName = prod ? prod.nome : nomeLimpo;

                if (mapa[finalName]) mapa[finalName] += valorNum;
                else mapa[finalName] = valorNum;
            });
        });
        return mapa;
    }, [pedidos]);

    const top5Produtos = useMemo(() => {
        return Object.entries(vendasPorProduto)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }, [vendasPorProduto]);

    // Derivados memoizados: cada um entra numa fatia de contexto, então precisa
    // manter a identidade enquanto as fontes não mudarem — sem isso a fatia
    // invalidaria a cada renderização e a divisão por domínio não filtraria nada.
    const produtosFiltrados = useMemo(() => produtos.filter(p => p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) || p.id.toString().includes(buscaProduto)).sort((a, b) => {
        // Prioriza os top 5 vendidos se não houver busca ativa (ou mesmo se houver, os que sobrarem da busca ainda terão prioridade)
        const indexA = top5Produtos.indexOf(a.nome);
        const indexB = top5Produtos.indexOf(b.nome);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // Se nenhum for top 5, mantém a ordenação original do catálogo
        return (a.ordem || 0) - (b.ordem || 0);
    }), [produtos, buscaProduto, top5Produtos]);

    // (Filtros locais de Clientes foram substituídos por busca no servidor e paginação)

    const produtosCatalogoFiltrados = useMemo(() => produtos.filter(p => {
        if (!buscaCadProdutos) return true;
        const termo = buscaCadProdutos.toLowerCase();
        return (p.nome && p.nome.toLowerCase().includes(termo));
    }), [produtos, buscaCadProdutos]);
    const clientesPaginados = clientesCadastrados;
    const totalPaginasClientes = Math.ceil(totalClientesCad / itensPorPagina) || 1;

    // Filtros e paginação da aba Notas Fiscais
    const notasFiscaisAbaFiltro = useMemo(() => notasFiscais.filter(n => {
        const checkStatus = filtroNotas === 'pendentes' ? !n.concluido : n.concluido;
        if (!checkStatus) return false;
        if (!buscaNotaFiscal) return true;
        const termo = buscaNotaFiscal.toLowerCase();
        return (n.cliente && n.cliente.toLowerCase().includes(termo)) ||
               (n.razao_social && n.razao_social.toLowerCase().includes(termo)) ||
               (n.cnpj && n.cnpj.toLowerCase().includes(termo));
    }), [notasFiscais, filtroNotas, buscaNotaFiscal]);
    const notasFiscaisPaginadas = useMemo(() => notasFiscaisAbaFiltro.slice((paginaNotasFiscais - 1) * itensPorPagina, paginaNotasFiscais * itensPorPagina), [notasFiscaisAbaFiltro, paginaNotasFiscais]);
    const totalPaginasNotasFiscais = Math.ceil(notasFiscaisAbaFiltro.length / itensPorPagina) || 1;
    
    // === COMUNICAÇÃO INTERNA CRUD ===
    const salvarRequisicao = async () => {
        let payload = { ...novaRequisicao };
        if (!payload.id) {
            delete payload.id;
            payload.criado_por = usuario?.nome || '';
            const { data, error } = await supabase.from('requisicoes_material').insert([payload]).select();
            if (error) console.error("Erro ao salvar requisicao:", error);
            if (!error && data) setRequisicoesMaterial([data[0], ...requisicoesMaterial]);
        } else {
            const { id, ...rest } = payload;
            const { data, error } = await supabase.from('requisicoes_material').update(rest).eq('id', id).select();
            if (!error && data) setRequisicoesMaterial(requisicoesMaterial.map(r => r.id === id ? data[0] : r));
        }
        setModalRequisicaoAberto(false);
    };
    const excluirRequisicao = async (id) => {
        if(await confirmar('Tem certeza que deseja excluir esta requisição?')) {
            const { error } = await supabase.from('requisicoes_material').delete().eq('id', id);
            if (!error) setRequisicoesMaterial(requisicoesMaterial.filter(r => r.id !== id));
        }
    };
    const salvarTarefa = async () => {
        let payload = { ...novaTarefa };
        if (!payload.prazo) payload.prazo = null;
        if (!payload.id) {
            delete payload.id;
            payload.criado_por = usuario?.nome || '';
            const { data, error } = await supabase.from('tarefas_internas').insert([payload]).select();
            if (error) console.error("Erro ao salvar tarefa:", error);
            if (!error && data && data.length > 0) {
                setTarefasInternas(prev => [data[0], ...prev]);
                notificarSeTarefaMinha(data[0]);
            }
        } else {
            const { id, ...rest } = payload;
            const { data, error } = await supabase.from('tarefas_internas').update(rest).eq('id', id).select();
            if (error) console.error("Erro ao atualizar tarefa:", error);
            if (!error && data && data.length > 0) {
                setTarefasInternas(prev => prev.map(t => t.id === id ? data[0] : t));
                notificarSeTarefaMinha(data[0]);
            }
        }
        setModalTarefaAberto(false);
    };
    const excluirTarefa = async (id) => {
        if(await confirmar('Tem certeza que deseja excluir esta tarefa?')) {
            const { error } = await supabase.from('tarefas_internas').delete().eq('id', id);
            if (!error) setTarefasInternas(tarefasInternas.filter(t => t.id !== id));
        }
    };
    const salvarLink = async () => {
        let payload = { ...novoLink };
        if (payload.valor && typeof payload.valor === 'string') {
            payload.valor = paraCentavos(payload.valor);
        }
        if (!payload.id) {
            delete payload.id;
            payload.criado_por = usuario?.nome || '';
            const { data, error } = await supabase.from('links_pagamento').insert([payload]).select();
            if (error) console.error("Erro ao salvar link:", error);
            if (!error && data) {
                setLinksPagamento([data[0], ...linksPagamento]);
                notificarSeLinkPagamentoNovo(data[0]);
            }
        } else {
            const { id, ...rest } = payload;
            const { data, error } = await supabase.from('links_pagamento').update(rest).eq('id', id).select();
            if (!error && data) {
                setLinksPagamento(linksPagamento.map(l => l.id === id ? data[0] : l));
                notificarSeLinkPagamentoNovo(data[0]);
            }
        }
        setModalLinkAberto(false);
    };
    const excluirLink = async (id) => {
        if(await confirmar('Tem certeza que deseja excluir este link?')) {
            const { error } = await supabase.from('links_pagamento').delete().eq('id', id);
            if (!error) setLinksPagamento(linksPagamento.filter(l => l.id !== id));
        }
    };

    // Filtro Produção Aprimorado (Sem data e buscando em MultiSelect)
    const pedidosProducaoAtivos = useMemo(() => pedidos.filter(p => {
        const statusPermitido = STATUSES_PRODUCAO.includes(p.status);
        if (!statusPermitido) return false;

        const termo = buscaProducaoText.toLowerCase();
        const matchTermo = !termo ||
            (p.cliente && p.cliente.toLowerCase().includes(termo)) ||
            (p.id && p.id.toString().includes(termo)) ||
            (p.responsavel && p.responsavel.toLowerCase().includes(termo));

        return matchTermo;
    }), [pedidos, buscaProducaoText]);

    // (Filtros locais do Histórico foram substituídos por busca no servidor e paginação)

    const opcoesStatusPermitidas = useMemo(() => isOperador ? [...STATUSES_PRODUCAO, 'Abandonado', 'Concluído'] : [...STATUSES_PRODUCAO, ...STATUSES_FINALIZADOS], [isOperador]);
    const isModalTrancado = (pedidoEmEdicao && pedidoEmEdicao.status === 'Finalizado' && isOperador) ? true : false;

    // Realtime subscriptions
    useEffect(() => {
        if (!usuario) return;

        const channel = supabase.channel('system-alerts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tarefas_internas' }, (payload) => {
                notificarSeTarefaMinha(payload.new);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tarefas_internas' }, (payload) => {
                notificarSeTarefaMinha(payload.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requisicoes_material' }, (payload) => {
                if (ehUsuario('Vinicius')) {
                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Nova requisição de material!\nItem(s): ${payload.new.itens}`, tipo: 'nova_requisicao' }]);
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'links_pagamento' }, (payload) => {
                notificarSeLinkPagamentoNovo(payload.new);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'links_pagamento' }, (payload) => {
                notificarSeLinkPagamentoNovo(payload.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contas_pagar' }, (payload) => {
                if (usuario?.nivel === 'Financeiro' || ehUsuario('Giovana')) {
                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + Math.random(), msg: `Nova conta a pagar: ${payload.new.descricao}`, tipo: 'nova_conta_pagar' }]);
                }
                notificarSeContaPagarUrgente(payload.new);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contas_pagar' }, (payload) => {
                notificarSeContaPagarUrgente(payload.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'empresas_faturamento' }, (payload) => {
                notificarSeFaturamentoEmAnalise(payload.new);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'empresas_faturamento' }, (payload) => {
                notificarSeFaturamentoEmAnalise(payload.new);
            })
            // Atualiza os dados da tela em tempo real para qualquer alteração no banco
            .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                carregarDados();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [usuario]);

    // === IDENTIDADE ESTÁVEL DAS FUNÇÕES PUBLICADAS ===
    // Sem useCallback, cada função era recriada a cada renderização e invalidava
    // o contexto inteiro. Em vez de embrulhar ~70 funções uma a uma (cada qual
    // com sua lista de dependências), todas passam por um wrapper de identidade
    // fixa que, na hora da chamada, delega para a versão da renderização mais
    // recente via ref — identidade nunca muda e não existe closure velha.
    // (isClienteProblema fica de fora de propósito: é lida durante o render —
    // ver comentário na declaração dela.)
    const acoesRef = useRef(null);
    acoesRef.current = {
        entrarComoDemo, efetuarLogin, logout, toggleDarkMode, vincularGoogle, desvincularGoogle,
        removerToast, avisar, confirmar, resolverConfirm, abrirContextMenu, fecharContextMenu,
        abrirChat, nomeDoUsuarioChat, enviarMensagemChat, excluirMensagemChat,
        carregarDados, atualizarCampoInline, atualizarItemConcluido,
        atualizarPagamentoBoleto, concluirBoletoContasReceber, buscarOutrasOSAbertasDoCliente, registrarPagamentoLoteOutrasOS,
        fecharModalOS, abrirEdicao, adicionarItemAoCarrinho, removerItemDoCarrinho, salvarEdicaoItemCarrinho,
        salvarOS, duplicarOS, imprimirOS,
        salvarOrcamentoPre, excluirOrcamentoPre, salvarOrcamentoFormalizado, baixarPDFOrcamento,
        abrirEdicaoOrcamento, transformarEmOS, excluirOrcamentoFormalizado,
        abrirEdicaoCliente, salvarCliente,
        abrirEdicaoProduto, salvarProduto, atualizarCatalogoProdutos, excluirProduto, duplicarProduto,
        handleDragStartProduto, handleDropProduto, duplicarFornecedor,
        abrirEdicaoUsuario, salvarUsuario,
        salvarConta, excluirConta, concluirConta, duplicarConta,
        salvarEmpresaFaturamento, excluirEmpresaFaturamento,
        salvarNotaFiscal, concluirNotaFiscal, duplicarNotaFiscal, reabrirNotaFiscal, excluirNotaFiscal,
        salvarRequisicao, excluirRequisicao, concluirRequisicao,
        salvarTarefa, excluirTarefa, concluirTarefa, reabrirTarefaFixa,
        salvarLink, excluirLink, concluirLink,
    };
    const [acoes] = useState(() => {
        const estaveis = {};
        for (const nome of Object.keys(acoesRef.current)) {
            estaveis[nome] = (...args) => acoesRef.current[nome](...args);
        }
        return estaveis;
    });

    // === FATIAS DE CONTEXTO (uma por domínio) ===
    // Setters de useState têm identidade estável por natureza e `acoes` também,
    // então as dependências de cada fatia são só os estados/derivados dela.
    const sessaoValue = useMemo(() => ({
        isAdmin, isOperador, isDemo,
        usuario, setUsuario, usuariosSistema, setUsuariosSistema,
        googleVinculado, loginInput, setLoginInput, senhaInput, setSenhaInput, erroLogin, setErroLogin,
        darkMode, setDarkMode,
        entrarComoDemo: acoes.entrarComoDemo, efetuarLogin: acoes.efetuarLogin, logout: acoes.logout,
        toggleDarkMode: acoes.toggleDarkMode, vincularGoogle: acoes.vincularGoogle, desvincularGoogle: acoes.desvincularGoogle,
    }), [acoes, isAdmin, isOperador, isDemo, usuario, usuariosSistema, googleVinculado, loginInput, senhaInput, erroLogin, darkMode]);

    const uiValue = useMemo(() => ({
        alertasNaoLidos, setAlertasNaoLidos, toasts, pendingConfirm,
        contextMenu, modalAlertasAberto, setModalAlertasAberto,
        calculadoraAtiva, setCalculadoraAtiva,
        removerToast: acoes.removerToast, avisar: acoes.avisar, confirmar: acoes.confirmar,
        resolverConfirm: acoes.resolverConfirm, abrirContextMenu: acoes.abrirContextMenu,
        fecharContextMenu: acoes.fecharContextMenu, carregarDados: acoes.carregarDados,
    }), [acoes, alertasNaoLidos, toasts, pendingConfirm, contextMenu, modalAlertasAberto, calculadoraAtiva]);

    const chatValue = useMemo(() => ({
        chatAberto, setChatAberto, chatMensagens, chatNaoLidas, enviandoChat,
        abrirChat: acoes.abrirChat, nomeDoUsuarioChat: acoes.nomeDoUsuarioChat,
        enviarMensagemChat: acoes.enviarMensagemChat, excluirMensagemChat: acoes.excluirMensagemChat,
    }), [acoes, chatAberto, chatMensagens, chatNaoLidas, enviandoChat]);

    const pedidosValue = useMemo(() => ({
        pedidos, setPedidos, itensPorPagina,
        dadosCarregados, historicoCarregado,
        abaOS, setAbaOS, buscaHistoricoText, setBuscaHistoricoText,
        paginaHistorico, setPaginaHistorico, pedidosHistorico, setPedidosHistorico,
        totalPedidosHistorico, setTotalPedidosHistorico, ordenacaoHistoricoOS, setOrdenacaoHistoricoOS,
        triggerRealtime, setTriggerRealtime,
        dataFiltroInicio, setDataFiltroInicio, dataFiltroFim, setDataFiltroFim,
        buscaProducaoText, setBuscaProducaoText, pedidosProducaoAtivos,
        vendasPorProduto, top5Produtos,
        abaVendas, setAbaVendas, produtosSelecionadosGrafico, setProdutosSelecionadosGrafico,
        osParaImprimir, setOsParaImprimir, orcamentoParaImprimir, setOrcamentoParaImprimir,
        // Aqui (e não na fatia do modal) para telas como a Produção abrirem o
        // modal sem assinarem o estado de digitação dele.
        setModalAberto, setPedidoEmEdicao, opcoesStatusPermitidas,
        atualizarCampoInline: acoes.atualizarCampoInline, atualizarItemConcluido: acoes.atualizarItemConcluido,
        abrirEdicao: acoes.abrirEdicao, duplicarOS: acoes.duplicarOS, imprimirOS: acoes.imprimirOS,
    }), [acoes, pedidos, dadosCarregados, historicoCarregado, abaOS, buscaHistoricoText, paginaHistorico, pedidosHistorico, totalPedidosHistorico,
        ordenacaoHistoricoOS, triggerRealtime, dataFiltroInicio, dataFiltroFim, buscaProducaoText,
        pedidosProducaoAtivos, vendasPorProduto, top5Produtos, abaVendas, produtosSelecionadosGrafico,
        osParaImprimir, orcamentoParaImprimir, opcoesStatusPermitidas]);

    const osModalValue = useMemo(() => ({
        modalAberto, salvandoOS, setSalvandoOS, pedidoEmEdicao,
        itensPedido, setItensPedido, itemAtual, setItemAtual,
        buscaCliente, setBuscaCliente, clienteSelecionadoInfo, setClienteSelecionadoInfo,
        clienteDropdownAberto, setClienteDropdownAberto,
        buscaProduto, setBuscaProduto, produtoDropdownAberto, setProdutoDropdownAberto,
        pagamentosPedido, setPagamentosPedido, novoPagamento, setNovoPagamento,
        outrasOSAbertas, novoPedido, setNovoPedido,
        produtosFiltrados, isModalTrancado,
        fecharModalOS: acoes.fecharModalOS, adicionarItemAoCarrinho: acoes.adicionarItemAoCarrinho,
        removerItemDoCarrinho: acoes.removerItemDoCarrinho, salvarEdicaoItemCarrinho: acoes.salvarEdicaoItemCarrinho,
        salvarOS: acoes.salvarOS, registrarPagamentoLoteOutrasOS: acoes.registrarPagamentoLoteOutrasOS,
        buscarOutrasOSAbertasDoCliente: acoes.buscarOutrasOSAbertasDoCliente,
    }), [acoes, modalAberto, salvandoOS, pedidoEmEdicao, itensPedido, itemAtual, buscaCliente,
        clienteSelecionadoInfo, clienteDropdownAberto, buscaProduto, produtoDropdownAberto,
        pagamentosPedido, novoPagamento, outrasOSAbertas, novoPedido, produtosFiltrados, isModalTrancado]);

    const orcamentosValue = useMemo(() => ({
        abaOrcamentos, setAbaOrcamentos,
        orcamentosFormalizados, setOrcamentosFormalizados,
        orcamentosPreProntos, setOrcamentosPreProntos,
        modalOrcamentoPreAberto, setModalOrcamentoPreAberto, novoOrcamentoPre, setNovoOrcamentoPre,
        modalOrcamentoFormalizadoAberto, setModalOrcamentoFormalizadoAberto,
        orcamentoFormalizadoEmEdicao, setOrcamentoFormalizadoEmEdicao,
        salvarOrcamentoPre: acoes.salvarOrcamentoPre, excluirOrcamentoPre: acoes.excluirOrcamentoPre,
        salvarOrcamentoFormalizado: acoes.salvarOrcamentoFormalizado, baixarPDFOrcamento: acoes.baixarPDFOrcamento,
        abrirEdicaoOrcamento: acoes.abrirEdicaoOrcamento, transformarEmOS: acoes.transformarEmOS,
        excluirOrcamentoFormalizado: acoes.excluirOrcamentoFormalizado,
    }), [acoes, abaOrcamentos, orcamentosFormalizados, orcamentosPreProntos, modalOrcamentoPreAberto,
        novoOrcamentoPre, modalOrcamentoFormalizadoAberto, orcamentoFormalizadoEmEdicao]);

    const clientesValue = useMemo(() => ({
        clientes, setClientes, clientesFiltrados, clientesPaginados, clientesCadCarregados, totalPaginasClientes,
        paginaClientes, setPaginaClientes, letraFiltroCliente, setLetraFiltroCliente,
        buscaCadClientes, setBuscaCadClientes,
        modalClienteAberto, setModalClienteAberto, salvandoCliente, setSalvandoCliente,
        novoCliente, setNovoCliente, isClienteProblema,
        abrirEdicaoCliente: acoes.abrirEdicaoCliente, salvarCliente: acoes.salvarCliente,
    }), [acoes, clientes, clientesPaginados, clientesCadCarregados, totalPaginasClientes, paginaClientes, letraFiltroCliente,
        buscaCadClientes, modalClienteAberto, salvandoCliente, novoCliente, isClienteProblema]);

    const cadastrosValue = useMemo(() => ({
        produtos, setProdutos, draggedProdutoIndex, setDraggedProdutoIndex,
        buscaCadProdutos, setBuscaCadProdutos, produtosCatalogoFiltrados,
        modalProdutoAberto, setModalProdutoAberto, salvandoProduto, setSalvandoProduto,
        novoProduto, setNovoProduto,
        fornecedores, setFornecedores, fornecedoresTerceirizacaoNomes,
        modalFornecedorAberto, setModalFornecedorAberto, novoFornecedor, setNovoFornecedor,
        abaCadastros, setAbaCadastros,
        modalUsuarioAberto, setModalUsuarioAberto, novoUsuario, setNovoUsuario,
        abrirEdicaoProduto: acoes.abrirEdicaoProduto, salvarProduto: acoes.salvarProduto,
        atualizarCatalogoProdutos: acoes.atualizarCatalogoProdutos, excluirProduto: acoes.excluirProduto,
        duplicarProduto: acoes.duplicarProduto, handleDragStartProduto: acoes.handleDragStartProduto,
        handleDropProduto: acoes.handleDropProduto, duplicarFornecedor: acoes.duplicarFornecedor,
        abrirEdicaoUsuario: acoes.abrirEdicaoUsuario, salvarUsuario: acoes.salvarUsuario,
    }), [acoes, produtos, draggedProdutoIndex, buscaCadProdutos, produtosCatalogoFiltrados,
        modalProdutoAberto, salvandoProduto, novoProduto, fornecedores, fornecedoresTerceirizacaoNomes,
        modalFornecedorAberto, novoFornecedor, abaCadastros, modalUsuarioAberto, novoUsuario]);

    const notasFiscaisValue = useMemo(() => ({
        notasFiscais, setNotasFiscais, dadosCarregados, filtroNotas, setFiltroNotas,
        buscaNotaFiscal, setBuscaNotaFiscal, paginaNotasFiscais, setPaginaNotasFiscais,
        modalNotaFiscalAberto, setModalNotaFiscalAberto, notaFiscalEmEdicao, setNotaFiscalEmEdicao,
        salvandoNotaFiscal, setSalvandoNotaFiscal,
        notasFiscaisAbaFiltro, notasFiscaisPaginadas, totalPaginasNotasFiscais,
        salvarNotaFiscal: acoes.salvarNotaFiscal, concluirNotaFiscal: acoes.concluirNotaFiscal,
        duplicarNotaFiscal: acoes.duplicarNotaFiscal, reabrirNotaFiscal: acoes.reabrirNotaFiscal,
        excluirNotaFiscal: acoes.excluirNotaFiscal,
    }), [acoes, notasFiscais, dadosCarregados, filtroNotas, buscaNotaFiscal, paginaNotasFiscais, modalNotaFiscalAberto,
        notaFiscalEmEdicao, salvandoNotaFiscal, notasFiscaisAbaFiltro, notasFiscaisPaginadas, totalPaginasNotasFiscais]);

    const financeiroValue = useMemo(() => ({
        abaFinanceiro, setAbaFinanceiro,
        contasPagar, setContasPagar, modalContaAberto, setModalContaAberto,
        novaConta, setNovaConta, salvandoConta, setSalvandoConta,
        empresasFaturamento, setEmpresasFaturamento,
        modalEmpresaFaturamentoAberto, setModalEmpresaFaturamentoAberto,
        novaEmpresaFaturamento, setNovaEmpresaFaturamento, salvandoEmpresa, setSalvandoEmpresa,
        dataFiltroContasPagarInicio, setDataFiltroContasPagarInicio, dataFiltroContasPagarFim, setDataFiltroContasPagarFim,
        dataFiltroContasReceberInicio, setDataFiltroContasReceberInicio, dataFiltroContasReceberFim, setDataFiltroContasReceberFim,
        dataFiltroBoletosInicio, setDataFiltroBoletosInicio, dataFiltroBoletosFim, setDataFiltroBoletosFim,
        pedidosSaldoDevedor, pedidosBoleto,
        dadosCarregados, carregandoContasReceber, carregandoBoletos,
        salvarConta: acoes.salvarConta, excluirConta: acoes.excluirConta, concluirConta: acoes.concluirConta,
        duplicarConta: acoes.duplicarConta, salvarEmpresaFaturamento: acoes.salvarEmpresaFaturamento,
        excluirEmpresaFaturamento: acoes.excluirEmpresaFaturamento,
        atualizarPagamentoBoleto: acoes.atualizarPagamentoBoleto,
        concluirBoletoContasReceber: acoes.concluirBoletoContasReceber,
    }), [acoes, abaFinanceiro, contasPagar, modalContaAberto, novaConta, salvandoConta,
        empresasFaturamento, modalEmpresaFaturamentoAberto, novaEmpresaFaturamento, salvandoEmpresa,
        dataFiltroContasPagarInicio, dataFiltroContasPagarFim, dataFiltroContasReceberInicio, dataFiltroContasReceberFim,
        dataFiltroBoletosInicio, dataFiltroBoletosFim, pedidosSaldoDevedor, pedidosBoleto,
        dadosCarregados, carregandoContasReceber, carregandoBoletos]);

    const comunicacaoValue = useMemo(() => ({
        abaComunicacao, setAbaComunicacao,
        requisicoesMaterial, setRequisicoesMaterial,
        tarefasInternas, setTarefasInternas,
        linksPagamento, setLinksPagamento,
        modalRequisicaoAberto, setModalRequisicaoAberto, novaRequisicao, setNovaRequisicao,
        modalTarefaAberto, setModalTarefaAberto, novaTarefa, setNovaTarefa,
        modalLinkAberto, setModalLinkAberto, novoLink, setNovoLink,
        salvarRequisicao: acoes.salvarRequisicao, excluirRequisicao: acoes.excluirRequisicao,
        concluirRequisicao: acoes.concluirRequisicao,
        salvarTarefa: acoes.salvarTarefa, excluirTarefa: acoes.excluirTarefa,
        concluirTarefa: acoes.concluirTarefa, reabrirTarefaFixa: acoes.reabrirTarefaFixa,
        salvarLink: acoes.salvarLink, excluirLink: acoes.excluirLink, concluirLink: acoes.concluirLink,
    }), [acoes, abaComunicacao, requisicoesMaterial, tarefasInternas, linksPagamento,
        modalRequisicaoAberto, novaRequisicao, modalTarefaAberto, novaTarefa, modalLinkAberto, novoLink]);

    // ==== TELA DE LOGIN ====
    if (!usuario) {
        // Sessão ainda sendo restaurada (F5 já logado, volta do redirect do
        // Google): splash neutra em vez de piscar a tela de login. É também o
        // que fica no HTML pré-renderizado.
        if (restaurandoSessao) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-[#EDEFF0] select-none">
                    <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain animate-pulse" />
                </div>
            );
        }
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#EDEFF0] text-[#454545] p-4 select-none font-sans">
                <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col gap-6">
                    <div className="text-center flex flex-col items-center">
                        <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain mb-3" />
                        <p className="text-[11px] text-gray-400 mt-1">Insira suas credenciais para acessar o ERP</p>
                    </div>
                    
                    <form onSubmit={efetuarLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">E-mail</label>
                            <input required type="email" value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition text-gray-800" placeholder="seu@email.com" autoComplete="username" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Senha</label>
                            <input required type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition text-gray-800" placeholder="••••••" autoComplete="current-password" />
                        </div>
                        {erroLogin && <p className="text-[11px] text-red-500 font-medium text-center">{erroLogin}</p>}
                        <button type="submit" className="w-full bg-brand hover:bg-brandHover text-white py-2 rounded text-[13px] font-semibold shadow transition mt-2">
                            Entrar no Sistema
                        </button>
                    </form>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ou</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <button type="button" onClick={entrarComGoogle} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded text-[13px] font-semibold shadow-sm transition">
                        <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.6 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.3-3.5z"/>
                            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6.5 29.6 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
                            <path fill="#4CAF50" d="M24 44.5c5.5 0 10.3-1.9 14-5l-6.5-5.3C29.5 35.7 26.9 36.5 24 36.5c-5.3 0-9.8-3.1-11.4-7.6l-6.6 5.1C9.5 40.1 16.2 44.5 24 44.5z"/>
                            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.3C41.4 35.9 44.5 30.4 44.5 24c0-1.2-.1-2.4-.3-3.5z"/>
                        </svg>
                        Entrar com Google
                    </button>

                    {process.env.NEXT_PUBLIC_DEMO_EMAIL && (
                        <button type="button" onClick={entrarComoDemo} className="w-full flex items-center justify-center gap-2 bg-white border border-dashed border-brand text-brand hover:bg-brand/5 py-2 rounded text-[13px] font-semibold transition">
                            Entrar como Visitante (Demo)
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <SessaoContext.Provider value={sessaoValue}>
        <UiContext.Provider value={uiValue}>
        <ChatContext.Provider value={chatValue}>
        <ClientesContext.Provider value={clientesValue}>
        <CadastrosContext.Provider value={cadastrosValue}>
        <PedidosContext.Provider value={pedidosValue}>
        <OsModalContext.Provider value={osModalValue}>
        <OrcamentosContext.Provider value={orcamentosValue}>
        <NotasFiscaisContext.Provider value={notasFiscaisValue}>
        <FinanceiroContext.Provider value={financeiroValue}>
        <ComunicacaoContext.Provider value={comunicacaoValue}>
            {children}
        </ComunicacaoContext.Provider>
        </FinanceiroContext.Provider>
        </NotasFiscaisContext.Provider>
        </OrcamentosContext.Provider>
        </OsModalContext.Provider>
        </PedidosContext.Provider>
        </CadastrosContext.Provider>
        </ClientesContext.Provider>
        </ChatContext.Provider>
        </UiContext.Provider>
        </SessaoContext.Provider>
    );
};

// Camada de compatibilidade: devolve a fusão de todas as fatias, no mesmo
// formato do contexto único antigo. Quem usa este hook re-renderiza quando
// QUALQUER fatia muda (comportamento igual ao de antes da divisão) — telas
// migradas trocam por usePedidos()/useFinanceiro()/useClientes()/etc. e
// passam a re-renderizar só quando a própria fatia mudar.
export const useAppContext = () => {
    const sessao = useContext(SessaoContext);
    const ui = useContext(UiContext);
    const chat = useContext(ChatContext);
    const clientes = useContext(ClientesContext);
    const cadastros = useContext(CadastrosContext);
    const pedidos = useContext(PedidosContext);
    const osModal = useContext(OsModalContext);
    const orcamentos = useContext(OrcamentosContext);
    const notasFiscais = useContext(NotasFiscaisContext);
    const financeiro = useContext(FinanceiroContext);
    const comunicacao = useContext(ComunicacaoContext);
    return useMemo(() => ({
        ...sessao, ...ui, ...chat, ...clientes, ...cadastros, ...pedidos,
        ...osModal, ...orcamentos, ...notasFiscais, ...financeiro, ...comunicacao,
    }), [sessao, ui, chat, clientes, cadastros, pedidos, osModal, orcamentos, notasFiscais, financeiro, comunicacao]);
};
