"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { supabase } from '@/lib/supabaseClient';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

export { supabase };

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
/// ==== CONTROLE DE SESSÃO E USUÁRIOS ====
    const [usuariosSistema, setUsuariosSistema] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [googleVinculado, setGoogleVinculado] = useState(false);

    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [erroLogin, setErroLogin] = useState('');

    const [abaAtual, setAbaAtual] = useState('dashboard');
    const [pedidos, setPedidos] = useState([]);
    const [produtos, setProdutos] = useState([]);
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
    const [fornecedores, setFornecedores] = useState([]);
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

    const [darkMode, setDarkMode] = useState(false); 
    
    useEffect(() => {
        if (darkMode) { document.documentElement.classList.add('dark'); }
        else { document.documentElement.classList.remove('dark'); }
    }, [darkMode]);
    const isAdmin = usuario?.nivel === 'Administrador';
    const isOperador = usuario?.nivel === 'Atendimento' || usuario?.nivel === 'Produção';

    // Filtros
    const [buscaHistoricoText, setBuscaHistoricoText] = useState('');
    
    // Paginação
    const [paginaProducao, setPaginaProducao] = useState(1);
    const [paginaHistorico, setPaginaHistorico] = useState(1);
    const [pedidosHistorico, setPedidosHistorico] = useState([]);
    const [totalPedidosHistorico, setTotalPedidosHistorico] = useState(0);
    const [triggerRealtime, setTriggerRealtime] = useState(0);
    const [paginaFinanceiro, setPaginaFinanceiro] = useState(1);
    const itensPorPagina = 50;
    const [dataFiltroInicio, setDataFiltroInicio] = useState('');
    const [dataFiltroFim, setDataFiltroFim] = useState('');

    const [buscaProducaoText, setBuscaProducaoText] = useState('');

    const [dataFiltroFinInicio, setDataFiltroFinInicio] = useState('');
    const [dataFiltroFinFim, setDataFiltroFinFim] = useState('');
    
    // Financeiro Expandido e Alertas
    const [abaFinanceiro, setAbaFinanceiro] = useState('geral');
    const [produtosSelecionadosGrafico, setProdutosSelecionadosGrafico] = useState(null);
    const [contasPagar, setContasPagar] = useState([]);
    const [calculadoraAtiva, setCalculadoraAtiva] = useState('banner');
    const [modalContaAberto, setModalContaAberto] = useState(false);
    const [novaConta, setNovaConta] = useState({ id: null, descricao: '', valor: '', vencimento: '', status: 'Pendente', recorrente: false, categoria: 'Despesa', fornecedor_id: null });
    
    const [empresasFaturamento, setEmpresasFaturamento] = useState([]);
    const [modalEmpresaFaturamentoAberto, setModalEmpresaFaturamentoAberto] = useState(false);
    const [novaEmpresaFaturamento, setNovaEmpresaFaturamento] = useState({ id: null, nome: '', cnpj: '', status: 'Aprovado' });
    const [alertasNaoLidos, setAlertasNaoLidos] = useState([]);
    const alertasFuturaDisparados = useRef(new Set());
    const alertasBoletoDisparados = useRef(new Set());
    const alertasContaPagarDisparados = useRef(new Set());
    const alertasRetiradaDisparados = useRef(new Set());
    const alertasFaturamentoAnaliseDisparados = useRef(new Set());
    const alertasTarefaDisparadas = useRef(new Set());
    const alertasNotaFiscalDisparadas = useRef(new Set());
    const alertasLinkPagamentoDisparados = useRef(new Set());
    const [modalAlertasAberto, setModalAlertasAberto] = useState(false);

    // === CHAT DA EQUIPE (canal único) ===
    const [chatAberto, setChatAberto] = useState(false);
    const [chatMensagens, setChatMensagens] = useState([]);
    const [chatNaoLidas, setChatNaoLidas] = useState(0);
    const [enviandoChat, setEnviandoChat] = useState(false);
    const chatAbertoRef = useRef(false);
    useEffect(() => { chatAbertoRef.current = chatAberto; }, [chatAberto]);

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
    const [clienteDropdownAberto, setClienteDropdownAberto] = useState(false);
    const [buscaProduto, setBuscaProduto] = useState('');
    const [produtoDropdownAberto, setProdutoDropdownAberto] = useState(false);

    const [pagamentosPedido, setPagamentosPedido] = useState([]);
    const [novoPagamento, setNovoPagamento] = useState({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú' });

    const [novoPedido, setNovoPedido] = useState({ 
        cliente: '', servico: '', valor_total: '', 
        status: 'Produzir', data_pedido: obterDataAtual(),
        prazo: '', responsavel: '', local_producao: 'Berlim', aprovado: false,
        entrega: false, urgente: false
    });
    
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
                        console.log('Atualização em tempo real (pedidos) recebida!', payload);
                        const isFin = usuario?.nivel === 'Financeiro';

                        const extrairBoletos = (servico) => {
                            const str = servico && servico.split('\n\n[PAGAMENTOS]\n')[1];
                            if (!str) return [];
                            try { return JSON.parse(str).filter(pg => pg.forma === 'Boleto'); } catch (e) { return []; }
                        };

                        // Alerta: Novo boleto registrado na O.S. (para Financeiro e Giovana)
                        if (isFin || ehUsuario('Giovana')) {
                            const boletosAntes = extrairBoletos(payload.old?.servico);
                            const boletosDepois = extrairBoletos(payload.new?.servico);
                            if (boletosDepois.length > 0 && boletosAntes.length === 0) {
                                setAlertasNaoLidos(prev => {
                                    if (prev.some(a => a.os_id === payload.new.id && a.tipo === 'boleto_novo')) return prev;
                                    return [...prev, { id: Date.now() + 6, msg: `Novo boleto registrado na O.S. #${payload.new.id}`, os_id: payload.new.id, tipo: 'boleto_novo' }];
                                });
                            }
                        }

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

                            // Alerta: Serviço de Urgência (apenas para o responsável pela O.S.)
                            if (payload.new.urgente && !payload.old?.urgente) {
                                if (newList.includes(nomeUsuario)) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 2, msg: `Urgência marcada na O.S. #${payload.new.id}!`, os_id: payload.new.id, tipo: 'urgencia' }]);
                                }
                            }

                        } else if (payload.eventType === 'INSERT') {
                            const newResponsavel = payload.new?.responsavel || '';
                            const newList = newResponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                            const nomeUsuario = (usuario.nome || '').trim().toLowerCase();
                            
                            if (newList.includes(nomeUsuario)) {
                                setAlertasNaoLidos(prev => [...prev, { id: Date.now(), msg: `Nova O.S. #${payload.new.id} atribuída a você`, os_id: payload.new.id, tipo: 'atribuicao' }]);
                            }
                            
                            // Alerta: Serviço de Urgência no cadastro (apenas para o responsável pela O.S.)
                            if (payload.new.urgente) {
                                if (newList.includes(nomeUsuario)) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 2, msg: `Urgência na nova O.S. #${payload.new.id}!`, os_id: payload.new.id, tipo: 'urgencia' }]);
                                }
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
                        console.log('Atualização em tempo real (notas_fiscais) recebida!', payload);

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
            .subscribe();

            // Desliga o radar se o usuário fizer logoff
            return () => {
                supabase.removeChannel(canalRealTime);
            };
        }
    }, [usuario]);

    const isClienteProblema = (nome) => {
        if (!nome) return false;
        return clientesProblema.includes(nome);
    };

    const ehUsuario = (nome) => (usuario?.nome || '').trim().toLowerCase() === nome.toLowerCase();

    // === CHAT DA EQUIPE ===
    async function carregarChat() {
        const { data, error } = await supabase
            .from('chat_mensagens')
            .select('*')
            .order('criado_em', { ascending: true })
            .limit(200);
        if (!error && data) setChatMensagens(data);
    }

    function nomeDoUsuarioChat(usuarioId) {
        if (usuarioId === usuario?.id) return usuario?.nome || 'Você';
        return usuariosSistema.find(u => u.id === usuarioId)?.nome || 'Usuário';
    }

    function abrirChat() {
        setChatAberto(true);
        setChatNaoLidas(0);
    }

    async function enviarMensagemChat(conteudo) {
        const texto = (conteudo || '').trim();
        if (!texto || !usuario) return;
        setEnviandoChat(true);
        const { error } = await supabase.from('chat_mensagens').insert([{ conteudo: texto, usuario_id: usuario.id }]);
        setEnviandoChat(false);
        if (error) alert('Erro ao enviar mensagem: ' + error.message);
    }

    async function excluirMensagemChat(id) {
        const { error } = await supabase.from('chat_mensagens').delete().eq('id', id);
        if (error) alert('Erro ao apagar mensagem: ' + error.message);
        else setChatMensagens(prev => prev.filter(m => m.id !== id));
    }

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
        const statusIgnorados = ['Concluída', 'Finalizada', 'Cancelada', 'Abandonada'];

        while (fetchMore) {
            const { data: batch, error } = await supabase
                .from('pedidos')
                .select('*')
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
                const pedidosComBoletoAberto = todosPedidos.map(p => {
                    const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                    let pagamentos = [];
                    if (pagamentosStr) {
                        try { pagamentos = JSON.parse(pagamentosStr); } catch(e) {}
                    }
                    return { ...p, pagamentos };
                }).filter(p => !statusIgnorados.includes(p.status) && p.prazo_pagamento && p.pagamentos.some(pag => pag.forma === 'Boleto' && !pag.boleto_concluido));

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

        const { data: listaOrcF } = await supabase.from('orcamentos_formalizados').select('*').order('created_at', { ascending: false });
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
    }
    
    useEffect(() => {
        setPaginaHistorico(1);
    }, [buscaHistoricoText, dataFiltroInicio, dataFiltroFim]);

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

            query = query.order('id', { ascending: false });
            
            const from = (paginaHistorico - 1) * itensPorPagina;
            const to = from + itensPorPagina - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;
            if (!error && data) {
                setPedidosHistorico(data);
                if (count !== null) setTotalPedidosHistorico(count);
            }
        }
        
        const timeout = setTimeout(fetchHistorico, 300);
        return () => clearTimeout(timeout);
    }, [usuario, abaOS, paginaHistorico, buscaHistoricoText, dataFiltroInicio, dataFiltroFim, triggerRealtime]);

    useEffect(() => {
        if (!usuario) return;
        async function fetchProblemas() {
            const { data } = await supabase.from('clientes').select('nome').eq('cliente_problema', true);
            if (data) setClientesProblema(data.map(c => c.nome));
        }
        fetchProblemas();
    }, [usuario, triggerRealtime]);

    useEffect(() => {
        if (!buscaCliente || buscaCliente.length < 1) {
            setClientes([]);
            return;
        }
        const timeout = setTimeout(async () => {
            const isNum = !isNaN(buscaCliente);
            let query = supabase.from('clientes').select('*').limit(15);
            if (isNum) {
                query = query.ilike('telefone', `%${buscaCliente}%`);
            } else {
                query = query.ilike('nome', `%${buscaCliente}%`);
            }
            const { data } = await query;
            if (data) setClientes(data);
        }, 300);
        return () => clearTimeout(timeout);
    }, [buscaCliente]);

    useEffect(() => {
        if (abaAtual !== 'cadastros' || abaCadastros !== 'clientes' || !usuario) return;
        
        async function fetchClientesCadastrados() {
            let query = supabase.from('clientes').select('*', { count: 'exact' });
            
            if (letraFiltroCliente) {
                query = query.ilike('nome', `${letraFiltroCliente}%`);
            }
            if (buscaCadClientes) {
                const isNum = !isNaN(buscaCadClientes);
                if (isNum) {
                    query = query.ilike('telefone', `%${buscaCadClientes}%`);
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
        }
        
        const timeout = setTimeout(fetchClientesCadastrados, 300);
        return () => clearTimeout(timeout);
    }, [usuario, abaAtual, abaCadastros, paginaClientes, buscaCadClientes, letraFiltroCliente, triggerRealtime]);

    async function carregarPerfil(userId) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error || !data) return null;
        return data;
    }

    // Reflete se a sessão atual tem uma identidade Google vinculada (usado no botão de "Vincular Google" da Navbar).
    function atualizarGoogleVinculado(user) {
        setGoogleVinculado(!!user?.identities?.some(i => i.provider === 'google'));
        sincronizarAvatarGoogle(user);
    }

    // Copia a foto de perfil do Google (se ainda não tiver sido salva) para profiles.avatar_url,
    // via RPC que só grava essa coluna e só na própria linha (ver avatar_google_migration.sql).
    async function sincronizarAvatarGoogle(user) {
        const identidadeGoogle = user?.identities?.find(i => i.provider === 'google');
        const avatarGoogle = identidadeGoogle?.identity_data?.avatar_url || identidadeGoogle?.identity_data?.picture || null;
        if (!avatarGoogle) return;

        const { error } = await supabase.rpc('atualizar_meu_avatar', { novo_avatar_url: avatarGoogle });
        if (!error) {
            setUsuario(prev => (prev && prev.avatar_url !== avatarGoogle ? { ...prev, avatar_url: avatarGoogle } : prev));
            setUsuariosSistema(prev => prev.map(u => (u.id === user.id && u.avatar_url !== avatarGoogle ? { ...u, avatar_url: avatarGoogle } : u)));
        }
    }

    const efetuarLogin = async (e) => {
        e.preventDefault();
        setErroLogin('Entrando...');

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginInput.trim(),
            password: senhaInput,
        });

        if (error) {
            setErroLogin('E-mail ou senha incorretos.');
            return;
        }

        const perfil = await carregarPerfil(data.user.id);
        if (!perfil) {
            setErroLogin('Login válido, mas sem perfil cadastrado (tabela profiles). Fale com um administrador.');
            await supabase.auth.signOut();
            return;
        }

        atualizarGoogleVinculado(data.user);
        setUsuario(perfil);
        setErroLogin('');
        setLoginInput('');
        setSenhaInput('');
        setAbaAtual('dashboard');
    };

    // Login direto com Google — só entra se essa identidade já estiver vinculada a uma conta
    // com perfil cadastrado (ver vincularGoogle); senão cai no mesmo aviso de "sem perfil".
    const entrarComGoogle = async () => {
        setErroLogin('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) setErroLogin('Não foi possível iniciar o login com Google.');
    };

    // Vincula a conta Google à sessão atual (usuário já logado por e-mail/senha).
    // Depois disso, ele também pode entrar direto pelo botão "Entrar com Google".
    const vincularGoogle = async () => {
        const { error } = await supabase.auth.linkIdentity({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) alert('Não foi possível vincular a conta Google: ' + error.message);
    };

    const desvincularGoogle = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const identidadeGoogle = user?.identities?.find(i => i.provider === 'google');
        if (!identidadeGoogle) return;
        const { error } = await supabase.auth.unlinkIdentity(identidadeGoogle);
        if (error) { alert('Não foi possível desvincular a conta Google: ' + error.message); return; }
        setGoogleVinculado(false);

        const { error: erroAvatar } = await supabase.rpc('atualizar_meu_avatar', { novo_avatar_url: null });
        if (!erroAvatar) {
            setUsuario(prev => (prev ? { ...prev, avatar_url: null } : prev));
            setUsuariosSistema(prev => prev.map(u => (u.id === user.id ? { ...u, avatar_url: null } : u)));
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUsuario(null);
    };

    // Restaura a sessão ao recarregar a página e reage a logout/expiração feitos em outra aba
    // (e também ao voltar do redirect do Google, seja de login ou de vinculação de conta)
    useEffect(() => {
        let ativo = true;
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!session || !ativo) return;
            const perfil = await carregarPerfil(session.user.id);
            if (!ativo) return;
            if (perfil) {
                atualizarGoogleVinculado(session.user);
                setUsuario(perfil);
            } else {
                setErroLogin('Login válido, mas sem perfil cadastrado (tabela profiles). Fale com um administrador.');
                await supabase.auth.signOut();
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') { setUsuario(null); setGoogleVinculado(false); }
            if (event === 'USER_UPDATED' && session?.user) atualizarGoogleVinculado(session.user);
        });

        return () => {
            ativo = false;
            listener?.subscription?.unsubscribe();
        };
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) { document.documentElement.classList.remove('dark'); } 
        else { document.documentElement.classList.add('dark'); }
        setDarkMode(!darkMode);
    };

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

        const { error } = await supabase.from('pedidos').update(payload).eq('id', id);
        if (error) {
            alert('Erro ao atualizar: ' + error.message);
            carregarDados();
        }
    }

    async function concluirBoletoContasReceber(id) {
        const pedido = pedidos.find(p => p.id === id);
        if (!pedido || !pedido.servico) return;

        const partes = pedido.servico.split('\n\n[PAGAMENTOS]\n');
        let pagamentos = [];
        try { pagamentos = JSON.parse(partes[1] || '[]'); } catch (e) { pagamentos = []; }

        const pagamentosAtualizados = pagamentos.map(pag => pag.forma === 'Boleto' ? { ...pag, boleto_concluido: true } : pag);
        const novoServico = partes[0] + '\n\n[PAGAMENTOS]\n' + JSON.stringify(pagamentosAtualizados);

        setPedidos(pedidos.map(p => p.id === id ? { ...p, servico: novoServico } : p));

        const { error } = await supabase.from('pedidos').update({ servico: novoServico }).eq('id', id);
        if (error) {
            alert('Erro ao concluir boleto: ' + error.message);
            carregarDados();
        }
    }

    function fecharModalOS() {
        setModalAberto(false);
        setPedidoEmEdicao(null);
        setIdOrcamentoOrigem(null);
        setBuscaCliente('');
        setBuscaProduto('');
        setItensPedido([]); 
        setPagamentosPedido([]);
        setNovoPagamento({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú' });
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });
        setNovoPedido({ 
            cliente: '', servico: '', valor_total: '', 
            status: 'Produzir', data_pedido: obterDataAtual(),
            prazo: '', responsavel: '', local_producao: 'Berlim', aprovado: false,
            entrega: false, urgente: false
        });
    }

    function abrirEdicao(pedido) {
        const dadosDesconstruidos = desconstruirTextoServico(pedido.servico);
        setPedidoEmEdicao(pedido);
        setBuscaCliente(pedido.cliente);
        setItensPedido(dadosDesconstruidos.itens); 
        const pagamentosRecuperados = dadosDesconstruidos.pagamentos || [];
        setPagamentosPedido(pagamentosRecuperados);
        
        const totalPago = pagamentosRecuperados.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
        const totalOSStr = parseFloat(String(pedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
        const saldoRestante = totalOSStr - totalPago;
        
        setNovoPagamento({ 
            valor: saldoRestante > 0 ? formatarMoeda((saldoRestante * 100).toFixed(0).toString()) : '', 
            forma: 'PIX', parcelas: 1, instituicao: 'Itaú' 
        });
        setNovoPedido({
            cliente: pedido.cliente,
            servico: dadosDesconstruidos.observacoes,
            status: pedido.status,
            valor_total: formatarMoeda((pedido.valor_total * 100).toFixed(0).toString()),
            data_pedido: pedido.data_pedido || null,
            prazo: pedido.prazo || null,
            responsavel: pedido.responsavel || '',
            local_producao: pedido.local_producao || 'Berlim',
            aprovado: pedido.aprovado || false,
            entrega: pedido.entrega || false,
            urgente: pedido.urgente || false
        });
        setModalAberto(true);
    }

    function abrirEdicaoProduto(produto) {
        setNovoProduto({ id: produto.id, nome: produto.nome, texto_padrao: produto.texto_padrao, preco_base: formatarMoeda((produto.preco_base * 100).toFixed(0).toString()) });
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
        if (!session) { alert('Sessão expirada, faça login novamente.'); return; }

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
            alert('Falha ao salvar usuário: ' + (resultado.error || 'erro desconhecido'));
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
        const numOriginal = parseFloat(itemAtual.valor.replace(/\./g, '').replace(',', '.')) || 0;
        const valorFinalCalculadoNum = numOriginal * (1 - pctDesconto / 100);
        const valorFinalCalculadoStr = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorFinalCalculadoNum);
        
        const novoItemEmpacotado = { 
            ...itemAtual, valor_original: itemAtual.valor, valor: valorFinalCalculadoStr, id_temp: Math.random() + Date.now() 
        };

        const novosItens = [...itensPedido, novoItemEmpacotado];
        setItensPedido(novosItens); 
        
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseFloat(i.valor.replace(/\./g, '').replace(',', '.')) || 0; });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
        
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });
        setBuscaProduto('');
    }

    function removerItemDoCarrinho(id_temp) {
        const novosItens = itensPedido.filter(i => i.id_temp !== id_temp);
        setItensPedido(novosItens);
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseFloat(i.valor.replace(/\./g, '').replace(',', '.')) || 0; });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
    }

    async function salvarOS(e, querImprimir = false, statusForcado = null) {
        if (e) e.preventDefault();
        setSalvandoOS(true);
        const statusFinal = statusForcado || novoPedido.status;

        let textoFinalServico = '';
        if (itensPedido.length > 0) {
            const itensTextoArray = itensPedido.map(i => {
                const strDesconto = i.desconto ? ' (-' + i.desconto + '%)' : '';
                const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
                const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
                const strConcluido = i.concluido ? '\n  [✓] Concluído' : '';
                return strNome + '\n  ' + i.descricao + '\n  Valor: R$ ' + i.valor + strDesconto + strLocal + strConcluido;
            });
            textoFinalServico += itensTextoArray.join('\n\n') + '\n\n';
            if (novoPedido.servico) textoFinalServico += '[OBSERVAÇÕES GERAIS]\n' + novoPedido.servico;
        } else {
            textoFinalServico = novoPedido.servico;
        }

        if (pagamentosPedido.length > 0) {
            textoFinalServico += '\n\n[PAGAMENTOS]\n' + JSON.stringify(pagamentosPedido);
        }

        const valorNumericoFinal = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;

        // Calcular locais unicos da OS a partir dos itens
        const locaisOS = [...new Set(itensPedido.map(i => i.local_producao || 'Berlim'))].join(', ');

        const payload = {
            cliente: novoPedido.cliente,
            servico: textoFinalServico,
            status: statusFinal,
            valor_total: valorNumericoFinal,
            data_pedido: novoPedido.data_pedido || null,
            prazo: novoPedido.prazo || null,
            responsavel: novoPedido.responsavel,
            local_producao: locaisOS,
            aprovado: novoPedido.aprovado,
            entrega: novoPedido.entrega,
            urgente: novoPedido.urgente
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
                alert('Erro ao atualizar OS: ' + error.message);
            } else if (data && data.length > 0) {
                setPedidos(pedidos.map(p => p.id === data[0].id ? data[0] : p)); 
                fecharModalOS(); 
                if (querImprimir) imprimirOS(data[0]); 
            } else {
                // Se a resposta for vazia, puxa as informações limpas e fecha sem travar
                carregarDados();
                fecharModalOS();
                if (querImprimir) imprimirOS({ ...pedidoEmEdicao, ...payload });
            }
        } else {
            const { data: ultimoPedido } = await supabase.from('pedidos').select('id').order('id', { ascending: false }).limit(1);
            const idBase = ultimoPedido && ultimoPedido.length > 0 ? ultimoPedido[0].id : (pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) : 0);
            let novoId = idBase + 1;
            payload.criado_por = usuario?.nome || 'Desconhecido';

            let data, error;
            for (let tentativa = 0; tentativa < 5; tentativa++) {
                payload.id = novoId;
                ({ data, error } = await supabase.from('pedidos').insert([payload]).select());
                if (!error || error.code !== '23505') break;
                novoId += 1; // ID já usado por outra O.S. criada nesse meio tempo; tenta o próximo.
            }

            if (error) {
                alert('Erro ao salvar OS: ' + error.message);
            } else if (data && data.length > 0) {
                setPedidos([data[0], ...pedidos]); 
                if (idOrcamentoOrigem) {
                    supabase.from('orcamentos_formalizados').delete().eq('id', idOrcamentoOrigem).then(({ error }) => {
                        if (!error) setOrcamentosFormalizados(prev => prev.filter(o => o.id !== idOrcamentoOrigem));
                    });
                }
                fecharModalOS(); 
                if (querImprimir) imprimirOS(data[0]); 
            } else {
                // Se a resposta for vazia, puxa as informações limpas e fecha sem travar
                if (idOrcamentoOrigem) {
                    supabase.from('orcamentos_formalizados').delete().eq('id', idOrcamentoOrigem).then(({ error }) => {
                        if (!error) setOrcamentosFormalizados(prev => prev.filter(o => o.id !== idOrcamentoOrigem));
                    });
                }
                carregarDados();
                fecharModalOS();
                if (querImprimir) alert('Pedido atualizado com sucesso! Para evitar lentidão, inicie a impressão manualmente através do Histórico.');
            }
        }
        setSalvandoOS(false);
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
            } else alert('Erro: ' + error?.message);
        } else {
            const { data, error } = await supabase.from('orcamentos_pre_prontos').insert([payload]).select();
            if (!error && data) {
                setOrcamentosPreProntos([data[0], ...orcamentosPreProntos]);
                setModalOrcamentoPreAberto(false);
            } else alert('Erro: ' + error?.message);
        }
    }
    
    async function excluirOrcamentoPre(id) {
        if (!confirm('Excluir este modelo pré-pronto?')) return;
        const { error } = await supabase.from('orcamentos_pre_prontos').delete().eq('id', id);
        if (!error) setOrcamentosPreProntos(orcamentosPreProntos.filter(o => o.id !== id));
        else alert('Erro: ' + error.message);
    }

    // === FUNÇÕES ORÇAMENTOS FORMALIZADOS ===
    async function salvarOrcamentoFormalizado(e, querImprimir = false) {
        if (e) e.preventDefault();
        
        let textoFinalServico = '';
        if (itensPedido.length > 0) {
            const itensTextoArray = itensPedido.map(i => {
                const strDesconto = i.desconto ? ' (-' + i.desconto + '%)' : '';
                const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
                const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
                return strNome + '\n  ' + i.descricao + '\n  Valor: R$ ' + i.valor + strDesconto + strLocal;
            });
            textoFinalServico += itensTextoArray.join('\n\n') + '\n\n';
            if (novoPedido.servico) textoFinalServico += '[OBSERVAÇÕES GERAIS]\n' + novoPedido.servico;
        } else {
            textoFinalServico = novoPedido.servico;
        }

        const valorNumericoFinal = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;

        const payload = {
            cliente: novoPedido.cliente,
            telefone: clientes.find(c => c.nome === novoPedido.cliente)?.telefone || '',
            produto: itensPedido.map(i => i.nome).join(', ') || 'Serviços Diversos',
            descricao: textoFinalServico + (itensPedido.length > 0 ? '\n\n[ITENS_JSON]\n' + JSON.stringify(itensPedido) : ''),
            quantidade: 1,
            valor: valorNumericoFinal,
            observacoes: novoPedido.servico,
            criado_por: usuario?.nome || 'Desconhecido'
        };

        if (orcamentoFormalizadoEmEdicao) {
            const { data, error } = await supabase.from('orcamentos_formalizados').update(payload).eq('id', orcamentoFormalizadoEmEdicao.id).select();
            if (error) alert('Erro: ' + error.message);
            else if (data && data.length > 0) {
                setOrcamentosFormalizados(orcamentosFormalizados.map(o => o.id === data[0].id ? data[0] : o));
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento(data[0]);
            }
        } else {
            const { data, error } = await supabase.from('orcamentos_formalizados').insert([payload]).select();
            if (error) alert('Erro: ' + error.message);
            else if (data && data.length > 0) {
                setOrcamentosFormalizados([data[0], ...orcamentosFormalizados]);
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento(data[0]);
            }
        }
    }

    async function baixarPDFOrcamento(orc) {
        setOsParaImprimir(null);
        setOrcamentoParaImprimir(orc);
        
        const { data } = await supabase.from('clientes').select('*').eq('nome', orc.cliente).single();
        if (data) {
            setOrcamentoParaImprimir(prev => ({...prev, clienteInfo: data}));
        }
        
        setTimeout(() => window.print(), 200);
    }
    
    function extrairItensOrcamento(orc) {
        if (!orc.descricao) return [];
        const match = orc.descricao.match(/\[ITENS_JSON\]\n(.*)/);
        if (match) {
            try { return JSON.parse(match[1]); } catch(e) {}
        }
        return desconstruirTextoServico(orc.descricao).itens;
    }

    function abrirEdicaoOrcamento(orcamento) {
        const itensCarregados = extrairItensOrcamento(orcamento);
        const obs = orcamento.observacoes || (orcamento.descricao ? desconstruirTextoServico(orcamento.descricao.split('\n\n[ITENS_JSON]')[0]).observacoes : '');
        
        setOrcamentoFormalizadoEmEdicao(orcamento);
        setBuscaCliente(orcamento.cliente);
        setItensPedido(itensCarregados);
        setNovoPedido({
            cliente: orcamento.cliente,
            servico: obs || '',
            valor_total: formatarMoeda((orcamento.valor * 100).toFixed(0).toString()),
            status: 'Orçamento',
            data_pedido: obterDataAtual(),
            prazo: '',
            responsavel: usuario?.nome || '',
            entrega: false,
            urgente: false
        });
        setModalOrcamentoFormalizadoAberto(true);
    }
    
    function transformarEmOS(orcamento) {
        const itensCarregados = extrairItensOrcamento(orcamento);
        setPedidoEmEdicao(null);
        setBuscaCliente(orcamento.cliente);
        setItensPedido(itensCarregados);
        setNovoPedido({
            cliente: orcamento.cliente,
            servico: '',
            valor_total: formatarMoeda((orcamento.valor * 100).toFixed(0).toString()),
            status: 'Produzir',
            data_pedido: obterDataAtual(),
            prazo: '',
            responsavel: usuario?.nome || '',
            entrega: false,
            urgente: false
        });
        setIdOrcamentoOrigem(orcamento.id);
        setModalAberto(true);
    }
    
    async function excluirOrcamentoFormalizado(id) {
        if (!confirm('Excluir este orçamento formalizado?')) return;
        const { error } = await supabase.from('orcamentos_formalizados').delete().eq('id', id);
        if (!error) setOrcamentosFormalizados(orcamentosFormalizados.filter(o => o.id !== id));
        else alert('Erro: ' + error.message);
    }

    async function salvarProduto(e) {
        e.preventDefault();
        setSalvandoProduto(true);
        const produtoFormatado = { nome: novoProduto.nome, texto_padrao: novoProduto.texto_padrao, preco_base: parseFloat(novoProduto.preco_base.replace(/\./g, '').replace(',', '.')) || 0 };

        if (novoProduto.id) {
            const { data, error } = await supabase.from('produtos').update(produtoFormatado).eq('id', novoProduto.id).select();
            if (!error && data) { setProdutos(produtos.map(p => p.id === novoProduto.id ? data[0] : p)); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); } 
            else alert('Falha ao atualizar: ' + error.message);
        } else {
            const { data, error } = await supabase.from('produtos').insert([produtoFormatado]).select();
            if (!error && data) { setProdutos([...produtos, data[0]]); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); } 
            else alert('Falha ao salvar: ' + error.message);
        }
        setSalvandoProduto(false);
    }

    async function criarCopiaRecorrente(contaOriginal) {
        const copiaPendente = {
            descricao: contaOriginal.descricao,
            valor: 0,
            vencimento: contaOriginal.vencimento,
            status: 'Pendente',
            recorrente: true,
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
        if (!confirm(`Deseja marcar a conta "${contaAnterior.descricao}" como paga?`)) return;

        const { data, error } = await supabase.from('contas_pagar').update({ status: 'Pago' }).eq('id', id).select();
        if (!error && data) {
            setContasPagar(prev => prev.map(c => c.id === id ? data[0] : c));
            if (contaAnterior.recorrente) {
                await criarCopiaRecorrente(data[0]);
            }
        } else {
            alert('Falha ao concluir: ' + (error?.message || 'Erro desconhecido'));
        }
    }

    const [salvandoConta, setSalvandoConta] = useState(false);
    async function salvarConta(e) {
        e.preventDefault();
        setSalvandoConta(true);
        const contaFormatada = {
            descricao: novaConta.descricao,
            valor: parseFloat(String(novaConta.valor).replace(/\./g, '').replace(',', '.')) || 0,
            vencimento: novaConta.vencimento,
            status: novaConta.status,
            recorrente: novaConta.recorrente,
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
                alert('Falha ao atualizar (Tabela contas_pagar existe no Supabase?): ' + (error?.message || 'Erro desconhecido'));
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
                alert('Falha ao salvar (Tabela contas_pagar existe no Supabase?): ' + (error?.message || 'Erro desconhecido'));
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
            else if (error) alert('Falha ao atualizar (A tabela empresas_faturamento foi criada?): ' + error.message);
        } else {
            const { data, error } = await supabase.from('empresas_faturamento').insert([payload]).select();
            if (!error && data) {
                setEmpresasFaturamento([...empresasFaturamento, data[0]]);
                notificarSeFaturamentoEmAnalise(data[0]);
            }
            else if (error) alert('Falha ao salvar (A tabela empresas_faturamento foi criada?): ' + error.message);
        }
        setModalEmpresaFaturamentoAberto(false);
        setSalvandoEmpresa(false);
    }

    async function excluirEmpresaFaturamento(id) {
        if (!confirm('Deseja excluir esta empresa?')) return;
        const { error } = await supabase.from('empresas_faturamento').delete().eq('id', id);
        if (!error) setEmpresasFaturamento(empresasFaturamento.filter(x => x.id !== id));
    }

    async function excluirProduto(id, e) {
        e.stopPropagation(); // Evita que o clique no lixo abra a tela de edição
        
        if (!window.confirm("Tem certeza que deseja excluir este produto do catálogo?")) return;

        const { error } = await supabase.from('produtos').delete().eq('id', id);
        
        if (error) {
            alert('Erro ao excluir produto: ' + error.message);
        } else {
            setProdutos(produtos.filter(p => p.id !== id));
        }
    }

    async function excluirConta(id) {
        if (!confirm('Deseja excluir esta conta?')) return;
        const { error } = await supabase.from('contas_pagar').delete().eq('id', id);
        if (!error) setContasPagar(contasPagar.filter(x => x.id !== id));
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
            alert("Erro ao reordenar produtos: " + error.message);
        }
    }

    async function salvarCliente(e) {
        e.preventDefault();
        setSalvandoCliente(true);
        const clienteFormatado = { nome: novoCliente.nome, telefone: novoCliente.telefone, email: novoCliente.email, observacoes: novoCliente.observacoes, cliente_problema: novoCliente.cliente_problema || false };

        if (clienteFormatado.telefone && clienteFormatado.telefone.trim() !== '') {
            const telNormalizado = clienteFormatado.telefone.replace(/\D/g, '');
            let duplicado = null;
            if (telNormalizado.length >= 8) {
                const searchString = `%${telNormalizado.slice(-4)}%`;
                const { data: dupData } = await supabase.from('clientes').select('id,nome,telefone').ilike('telefone', searchString);
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
                alert('Aviso: Este número de WhatsApp/Telefone já está cadastrado no cliente "' + duplicado.nome + '"!');
                setSalvandoCliente(false);
                return;
            }
        }

        if (novoCliente.id) {
            const { data, error } = await supabase.from('clientes').update(clienteFormatado).eq('id', novoCliente.id).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); } 
            else alert('Falha ao atualizar: ' + error.message);
        } else {
            const { data, error } = await supabase.from('clientes').insert([clienteFormatado]).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setNovoPedido({...novoPedido, cliente: data[0].nome}); setBuscaCliente(data[0].nome); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); } 
            else alert('Falha ao salvar: ' + error.message);
        }
        setSalvandoCliente(false);
    }

    async function salvarNotaFiscal(e) {
        e.preventDefault();
        setSalvandoNotaFiscal(true);

        const valorNumerico = notaFiscalEmEdicao.valor_pago ? parseFloat(String(notaFiscalEmEdicao.valor_pago).replace(/\./g, '').replace(',', '.')) : null;

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
            alert('Falha ao atualizar nota: ' + error.message);
        }
        setSalvandoNotaFiscal(false);
    }

    async function concluirNotaFiscal(id) {
        if (!confirm('Deseja realmente marcar esta nota como concluída? Ela não aparecerá mais nesta lista.')) return;
        const { data, error } = await supabase.from('notas_fiscais').update({ concluido: true }).eq('id', id).select();
        if (!error && data) {
            setNotasFiscais(notasFiscais.map(n => n.id === id ? data[0] : n));
        } else {
            alert('Falha ao concluir: ' + error.message);
        }
    }

    async function reabrirNotaFiscal(nota) {
        if (!confirm(`Deseja gerar uma nova nota pendente para "${nota.razao_social || nota.cnpj}"?`)) return;

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
            alert('Falha ao gerar nova nota: ' + (error?.message || 'Erro desconhecido'));
        }
    }

    async function concluirRequisicao(id) {
        if (!confirm('Deseja marcar esta requisição como comprada/concluída?')) return;
        const { data, error } = await supabase.from('requisicoes_material').update({ status: 'Comprado' }).eq('id', id).select();
        if (!error && data) setRequisicoesMaterial(requisicoesMaterial.map(x => x.id === id ? data[0] : x));
    }

    async function concluirTarefa(id) {
        const tarefa = tarefasInternas.find(t => t.id === id);
        if (!tarefa?.fixa && !confirm('Deseja marcar esta tarefa como concluída?')) return;
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
        if (!confirm('Deseja marcar este link como pago/concluído?')) return;
        const { data, error } = await supabase.from('links_pagamento').update({ status: 'Pago' }).eq('id', id).select();
        if (!error && data) {
            setLinksPagamento(linksPagamento.map(x => x.id === id ? data[0] : x));
            notificarSeLinkPagamentoNovo(data[0]);
        }
    }

    async function imprimirOS(pedido) {
        setOrcamentoParaImprimir(null);
        setOsParaImprimir(pedido);
        const { data } = await supabase.from('clientes').select('*').eq('nome', pedido.cliente).single();
        if (data) {
            setOsParaImprimir(prev => ({...prev, clienteInfo: data}));
        }
        setTimeout(() => window.print(), 200);
    }

    const clientesFiltrados = clientes;
    // Lógica para elencar os 5 produtos mais vendidos com base no histórico
    const vendasPorProduto = useMemo(() => {
        const mapa = {};
        pedidos.forEach(p => {
            if (!p.servico) return;
            const { itens } = desconstruirTextoServico(p.servico);
            
            itens.forEach(item => {
                const id_produto_match = item.id_produto;
                const nomeLimpo = item.nome.trim();
                const valorNum = parseFloat(item.valor.replace(/\./g, '').replace(',', '.')) || 0;
                
                const prod = id_produto_match 
                    ? produtos.find(p => String(p.id) === String(id_produto_match)) 
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

    const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) || p.id.toString().includes(buscaProduto)).sort((a, b) => {
        // Prioriza os top 5 vendidos se não houver busca ativa (ou mesmo se houver, os que sobrarem da busca ainda terão prioridade)
        const indexA = top5Produtos.indexOf(a.nome);
        const indexB = top5Produtos.indexOf(b.nome);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // Se nenhum for top 5, mantém a ordenação original do catálogo
        return (a.ordem || 0) - (b.ordem || 0);
    });
    
    // (Filtros locais de Clientes foram substituídos por busca no servidor e paginação)

    const produtosCatalogoFiltrados = produtos.filter(p => {
        if (!buscaCadProdutos) return true;
        const termo = buscaCadProdutos.toLowerCase();
        return (p.nome && p.nome.toLowerCase().includes(termo));
    });
    const clientesPaginados = clientesCadastrados;
    const totalPaginasClientes = Math.ceil(totalClientesCad / itensPorPagina) || 1;

    // Filtros e paginação da aba Notas Fiscais
    const notasFiscaisAbaFiltro = notasFiscais.filter(n => {
        const checkStatus = filtroNotas === 'pendentes' ? !n.concluido : n.concluido;
        if (!checkStatus) return false;
        if (!buscaNotaFiscal) return true;
        const termo = buscaNotaFiscal.toLowerCase();
        return (n.cliente && n.cliente.toLowerCase().includes(termo)) || 
               (n.razao_social && n.razao_social.toLowerCase().includes(termo)) || 
               (n.cnpj && n.cnpj.toLowerCase().includes(termo));
    });
    const notasFiscaisPaginadas = notasFiscaisAbaFiltro.slice((paginaNotasFiscais - 1) * itensPorPagina, paginaNotasFiscais * itensPorPagina);
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
        if(confirm('Tem certeza que deseja excluir esta requisição?')) {
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
        if(confirm('Tem certeza que deseja excluir esta tarefa?')) {
            const { error } = await supabase.from('tarefas_internas').delete().eq('id', id);
            if (!error) setTarefasInternas(tarefasInternas.filter(t => t.id !== id));
        }
    };
    const salvarLink = async () => {
        let payload = { ...novoLink };
        if (payload.valor && typeof payload.valor === 'string') {
            // Remove pontos de milhar e substitui vírgula decimal por ponto
            payload.valor = parseFloat(payload.valor.replace(/\./g, '').replace(',', '.'));
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
        if(confirm('Tem certeza que deseja excluir este link?')) {
            const { error } = await supabase.from('links_pagamento').delete().eq('id', id);
            if (!error) setLinksPagamento(linksPagamento.filter(l => l.id !== id));
        }
    };

    // Filtro Produção Aprimorado (Sem data e buscando em MultiSelect)
    const pedidosProducaoAtivos = pedidos.filter(p => {
        const statusPermitido = STATUSES_PRODUCAO.includes(p.status);
        if (!statusPermitido) return false;

        const termo = buscaProducaoText.toLowerCase();
        const matchTermo = !termo || 
            (p.cliente && p.cliente.toLowerCase().includes(termo)) || 
            (p.id && p.id.toString().includes(termo)) || 
            (p.responsavel && p.responsavel.toLowerCase().includes(termo));
        
        return matchTermo;
    });

    // (Filtros locais do Histórico foram substituídos por busca no servidor e paginação)

    const opcoesStatusPermitidas = isOperador ? [...STATUSES_PRODUCAO, 'Abandonado', 'Concluído'] : [...STATUSES_PRODUCAO, ...STATUSES_FINALIZADOS];
    const isModalTrancado = (pedidoEmEdicao && pedidoEmEdicao.status === 'Finalizado' && isOperador) ? true : false;

    // Render de barras para o Financeiro
    const renderBarHorizontal = (label, valor, maxVal, isCaixa = false, customColor = null) => {
        const pct = maxVal > 0 ? (valor / maxVal) * 100 : 0;
        const barColor = customColor || (isCaixa ? 'bg-emerald-500' : 'bg-brand');
        return (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[11px] group">
                <span className="w-24 sm:w-32 font-medium truncate text-gray-700 dark:text-gray-300">{label}</span>
                <div className="flex-1 bg-gray-100 dark:bg-darkElevated h-6 rounded overflow-hidden relative border dark:border-darkBorder">
                    <div className={`${barColor} h-full transition-all duration-500 opacity-80 group-hover:opacity-100`} style={{ width: `${Math.max(pct, 1)}%` }}></div>
                </div>
                <span className="w-24 text-right font-semibold text-gray-900 dark:text-[#EDEDED]">
                    R$ {formatarValorFinanceiro(valor)}
                </span>
            </div>
        )
    };

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

    // ==== TELA DE LOGIN ====
    if (!usuario) {
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
                </div>
            </div>
        );
    }

    const value = {
        itensPorPagina,
        isAdmin,
        isOperador,
        usuariosSistema,
        setUsuariosSistema,
        usuario,
        setUsuario,
        googleVinculado,
        vincularGoogle,
        desvincularGoogle,
        entrarComGoogle,
        loginInput,
        setLoginInput,
        senhaInput,
        setSenhaInput,
        erroLogin,
        setErroLogin,
        abaAtual,
        setAbaAtual,
        pedidos,
        setPedidos,
        produtos,
        setProdutos,
        draggedProdutoIndex,
        setDraggedProdutoIndex,
        abaOrcamentos,
        setAbaOrcamentos,
        orcamentosFormalizados,
        setOrcamentosFormalizados,
        orcamentosPreProntos,
        setOrcamentosPreProntos,
        modalOrcamentoPreAberto,
        setModalOrcamentoPreAberto,
        novoOrcamentoPre,
        setNovoOrcamentoPre,
        modalOrcamentoFormalizadoAberto,
        setModalOrcamentoFormalizadoAberto,
        orcamentoFormalizadoEmEdicao,
        setOrcamentoFormalizadoEmEdicao,
        clientes,
        setClientes,
        clientesCadastrados,
        setClientesCadastrados,
        totalClientesCad,
        setTotalClientesCad,
        clientesProblema,
        setClientesProblema,
        fornecedores,
        setFornecedores,
        abaCadastros,
        setAbaCadastros,
        abaOS,
        setAbaOS,
        buscaCadClientes,
        setBuscaCadClientes,
        buscaCadProdutos,
        setBuscaCadProdutos,
        modalFornecedorAberto,
        setModalFornecedorAberto,
        novoFornecedor,
        setNovoFornecedor,
        paginaClientes,
        setPaginaClientes,
        letraFiltroCliente,
        setLetraFiltroCliente,
        notasFiscais,
        setNotasFiscais,
        filtroNotas,
        setFiltroNotas,
        buscaNotaFiscal,
        setBuscaNotaFiscal,
        paginaNotasFiscais,
        setPaginaNotasFiscais,
        modalNotaFiscalAberto,
        setModalNotaFiscalAberto,
        notaFiscalEmEdicao,
        setNotaFiscalEmEdicao,
        salvandoNotaFiscal,
        setSalvandoNotaFiscal,
        darkMode,
        setDarkMode,
        buscaHistoricoText,
        setBuscaHistoricoText,
        paginaProducao,
        setPaginaProducao,
        paginaHistorico,
        setPaginaHistorico,
        pedidosHistorico,
        setPedidosHistorico,
        totalPedidosHistorico,
        setTotalPedidosHistorico,
        triggerRealtime,
        setTriggerRealtime,
        paginaFinanceiro,
        setPaginaFinanceiro,
        dataFiltroInicio,
        setDataFiltroInicio,
        dataFiltroFim,
        setDataFiltroFim,
        buscaProducaoText,
        setBuscaProducaoText,
        dataFiltroFinInicio,
        setDataFiltroFinInicio,
        dataFiltroFinFim,
        setDataFiltroFinFim,
        abaFinanceiro,
        setAbaFinanceiro,
        produtosSelecionadosGrafico,
        setProdutosSelecionadosGrafico,
        contasPagar,
        setContasPagar,
        calculadoraAtiva,
        setCalculadoraAtiva,
        modalContaAberto,
        setModalContaAberto,
        novaConta,
        setNovaConta,
        empresasFaturamento,
        setEmpresasFaturamento,
        modalEmpresaFaturamentoAberto,
        setModalEmpresaFaturamentoAberto,
        novaEmpresaFaturamento,
        setNovaEmpresaFaturamento,
        alertasNaoLidos,
        setAlertasNaoLidos,
        alertasFuturaDisparados,
        alertasBoletoDisparados,
        modalAlertasAberto,
        setModalAlertasAberto,
        chatAberto,
        setChatAberto,
        abrirChat,
        chatMensagens,
        chatNaoLidas,
        enviandoChat,
        nomeDoUsuarioChat,
        enviarMensagemChat,
        excluirMensagemChat,
        modalAberto,
        setModalAberto,
        salvandoOS,
        setSalvandoOS,
        osParaImprimir,
        setOsParaImprimir,
        orcamentoParaImprimir,
        setOrcamentoParaImprimir,
        pedidoEmEdicao,
        setPedidoEmEdicao,
        idOrcamentoOrigem,
        setIdOrcamentoOrigem,
        itensPedido,
        setItensPedido,
        itemAtual,
        setItemAtual,
        buscaCliente,
        setBuscaCliente,
        clienteDropdownAberto,
        setClienteDropdownAberto,
        buscaProduto,
        setBuscaProduto,
        produtoDropdownAberto,
        setProdutoDropdownAberto,
        pagamentosPedido,
        setPagamentosPedido,
        novoPagamento,
        setNovoPagamento,
        novoPedido,
        setNovoPedido,
        modalProdutoAberto,
        setModalProdutoAberto,
        salvandoProduto,
        setSalvandoProduto,
        novoProduto,
        setNovoProduto,
        modalClienteAberto,
        setModalClienteAberto,
        salvandoCliente,
        setSalvandoCliente,
        novoCliente,
        setNovoCliente,
        modalUsuarioAberto,
        setModalUsuarioAberto,
        novoUsuario,
        setNovoUsuario,
        isClienteProblema,
        efetuarLogin,
        logout,
        toggleDarkMode,
        salvandoConta,
        setSalvandoConta,
        salvandoEmpresa,
        setSalvandoEmpresa,
        clientesFiltrados,
        vendasPorProduto,
        top5Produtos,
        produtosFiltrados,
        produtosCatalogoFiltrados,
        clientesPaginados,
        totalPaginasClientes,
        notasFiscaisAbaFiltro,
        notasFiscaisPaginadas,
        totalPaginasNotasFiscais,
        pedidosProducaoAtivos,
        opcoesStatusPermitidas,
        isModalTrancado,
        renderBarHorizontal,
        abaComunicacao, setAbaComunicacao,
        requisicoesMaterial, setRequisicoesMaterial,
        tarefasInternas, setTarefasInternas,
        linksPagamento, setLinksPagamento,
        modalRequisicaoAberto, setModalRequisicaoAberto,
        novaRequisicao, setNovaRequisicao,
        modalTarefaAberto, setModalTarefaAberto,
        novaTarefa, setNovaTarefa,
        modalLinkAberto, setModalLinkAberto,
        novoLink, setNovoLink,
        salvarRequisicao, excluirRequisicao,
        salvarTarefa, excluirTarefa,
        salvarLink, excluirLink,
        carregarDados,
        atualizarCampoInline,
        concluirBoletoContasReceber,
        fecharModalOS,
        abrirEdicao,
        abrirEdicaoProduto,
        abrirEdicaoCliente,
        abrirEdicaoUsuario,
        salvarUsuario,
        adicionarItemAoCarrinho,
        removerItemDoCarrinho,
        salvarOS,
        salvarOrcamentoPre,
        excluirOrcamentoPre,
        salvarOrcamentoFormalizado,
        baixarPDFOrcamento,
        extrairItensOrcamento,
        abrirEdicaoOrcamento,
        transformarEmOS,
        excluirOrcamentoFormalizado,
        salvarProduto,
        salvarConta,
        salvarEmpresaFaturamento,
        excluirEmpresaFaturamento,
        excluirConta,
        concluirConta,
        excluirProduto,
        handleDragStartProduto,
        handleDropProduto,
        salvarCliente,
        salvarNotaFiscal,
        concluirNotaFiscal,
        reabrirNotaFiscal,
        concluirRequisicao,
        concluirTarefa,
        reabrirTarefaFixa,
        concluirLink,
        imprimirOS
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
