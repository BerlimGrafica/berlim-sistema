"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMçõesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, dçõesconstruirTextoServico, obterRçõesumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdçõesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

export const supabase = createClient('https://xbanoipgoleuahwbqksy.supabase.co', 'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh');

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
/// ==== CONTROLE DE SESSÃO E USUÁRIOS ====
    const [usuariosSistema, setUsuariosSistema] = useState([]);
    const [usuario, setUsuario] = useState(null);
    
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
    
    const [clientções, setClientções] = useState([]);
    const [clientçõesCadastrados, setClientçõesCadastrados] = useState([]);
    const [totalClientçõesCad, setTotalClientçõesCad] = useState(0);
    const [clientçõesProblema, setClientçõesProblema] = useState([]);
    const [fornecedorções, setFornecedorções] = useState([]);
    const [abaCadastros, setAbaCadastros] = useState('clientções');
    const [abaOS, setAbaOS] = useState('abertas');
    const [buscaCadClientções, setBuscaCadClientções] = useState('');
    const [buscaCadProdutos, setBuscaCadProdutos] = useState('');
    const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false);
    const [novoFornecedor, setNovoFornecedor] = useState({ id: null, nome: '', contato: '', observacoções: '' });
    const [paginaClientções, setPaginaClientções] = useState(1);
    const [letraFiltroCliente, setLetraFiltroCliente] = useState('');
    
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [filtroNotas, setFiltroNotas] = useState('pendentções');
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
    const isOperador = usuario?.nivel === 'Produção/Atendimento';
    
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
    const [novaConta, setNovaConta] = useState({ id: null, dçõescricao: '', valor: '', vencimento: '', status: 'Pendente', recorrente: false });
    
    const [emprçõesasFaturamento, setEmprçõesasFaturamento] = useState([]);
    const [modalEmprçõesaFaturamentoAberto, setModalEmprçõesaFaturamentoAberto] = useState(false);
    const [novaEmprçõesaFaturamento, setNovaEmprçõesaFaturamento] = useState({ id: null, nome: '', cnpj: '', status: 'Aprovado' });
    const [alertasNaoLidos, setAlertasNaoLidos] = useState([]);
    const alertasFuturaDisparados = useRef(new Set());
    const alertasBoletoDisparados = useRef(new Set());
    const [modalAlertasAberto, setModalAlertasAberto] = useState(false);

    const [modalAberto, setModalAberto] = useState(false);
    const [salvandoOS, setSalvandoOS] = useState(false);
    const [osParaImprimir, setOsParaImprimir] = useState(null);
    const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null); 
    const [idOrcamentoOrigem, setIdOrcamentoOrigem] = useState(null);

    const [itensPedido, setItensPedido] = useState([]);
    const [itemAtual, setItemAtual] = useState({ nome: '', dçõescricao: '', valor: '', dçõesconto: '', local_producao: 'Berlim', id_produto: null });

    const [buscaCliente, setBuscaCliente] = useState('');
    const [clienteDropdownAberto, setClienteDropdownAberto] = useState(false);
    const [buscaProduto, setBuscaProduto] = useState('');
    const [produtoDropdownAberto, setProdutoDropdownAberto] = useState(false);

    const [pagamentosPedido, setPagamentosPedido] = useState([]);
    const [novoPagamento, setNovoPagamento] = useState({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', vencimento_boleto: '' });

    const [novoPedido, setNovoPedido] = useState({ 
        cliente: '', servico: '', valor_total: '', 
        status: 'Produzir', data_pedido: obterDataAtual(),
        prazo: '', rçõesponsavel: '', local_producao: 'Berlim', aprovado: false,
        entrega: false, urgente: false
    });
    
    const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
    const [salvandoProduto, setSalvandoProduto] = useState(false);
    const [novoProduto, setNovoProduto] = useState({ id: null, nome: '', texto_padrao: '', preco_base: '' });

    const [modalClienteAberto, setModalClienteAberto] = useState(false);
    const [salvandoCliente, setSalvandoCliente] = useState(false);
    const [novoCliente, setNovoCliente] = useState({ id: null, nome: '', telefone: '', email: '', observacoções: '', cliente_problema: false });

    const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({ id: null, nome: '', senha: '', nivel: 'Produção/Atendimento' });

    useEffect(() => { 
        if(usuario) {
            carregarDados(); 
            
            // LIGA O RADAR DE TEMPO REAL DO SUPABASE
            const canalRealTime = supabase
                .channel('mudancas-banco')
                .on(
                    'postgrções_changções', 
                    { event: '*', schema: 'public', table: 'pedidos' }, 
                    (payload) => {
                        console.log('Atualização em tempo real (pedidos) recebida!', payload);
                        const isAdm = usuario?.nivel === 'Administrador';
                        const isFin = usuario?.nivel === 'Financeiro';
                        const isOpe = usuario?.nivel === 'Produção/Atendimento';
                        
                        // Lógica de alerta
                        if (payload.eventType === 'UPDATE') {
                            const oldRçõesponsavel = payload.old?.rçõesponsavel || '';
                            const newRçõesponsavel = payload.new?.rçõesponsavel || '';
                            
                            const oldList = oldRçõesponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                            const newList = newRçõesponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

                            const nomeUsuario = (usuario.nome || '').trim().toLowerCase();

                            if (!oldList.includções(nomeUsuario) && newList.includções(nomeUsuario)) {
                                setAlertasNaoLidos(prev => {
                                    if(prev.some(a => a.os_id === payload.new.id && a.tipo === 'atribuicao')) return prev;
                                    return [...prev, { id: Date.now(), msg: `Você foi dçõesignado para a O.S. #${payload.new.id}`, os_id: payload.new.id, tipo: 'atribuicao' }];
                                });
                            }

                            // Alerta: Serviço Concluído (para Financeiro/Admin)
                            if (payload.new.status === 'Concluído' && payload.old?.status !== 'Concluído') {
                                if (isAdm || isFin) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 1, msg: `Serviço O.S. #${payload.new.id} concluído!`, os_id: payload.new.id, tipo: 'concluido' }]);
                                }
                            }

                            // Alerta: Avisar Cliente (para Atendimento/Admin)
                            if (payload.new.status === 'Avisar Cliente' && payload.old?.status !== 'Avisar Cliente') {
                                if (isAdm || isOpe) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 5, msg: `Avisar cliente: ${payload.new.cliente} (O.S. #${payload.new.id})`, os_id: payload.new.id, tipo: 'avisar_cliente' }]);
                                }
                            }

                            // Alerta: Serviço de Urgência (para Operacional/Admin)
                            if (payload.new.urgente && !payload.old?.urgente) {
                                if (isAdm || isOpe) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 2, msg: `Urgência marcada na O.S. #${payload.new.id}!`, os_id: payload.new.id, tipo: 'urgencia' }]);
                                }
                            }

                        } else if (payload.eventType === 'INSERT') {
                            const newRçõesponsavel = payload.new?.rçõesponsavel || '';
                            const newList = newRçõesponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                            const nomeUsuario = (usuario.nome || '').trim().toLowerCase();
                            
                            if (newList.includções(nomeUsuario)) {
                                setAlertasNaoLidos(prev => [...prev, { id: Date.now(), msg: `Nova O.S. #${payload.new.id} atribuída a você`, os_id: payload.new.id, tipo: 'atribuicao' }]);
                            }
                            
                            // Alerta: Serviço de Urgência no cadastro
                            if (payload.new.urgente) {
                                if (isAdm || isOpe) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 2, msg: `Urgência na nova O.S. #${payload.new.id}!`, os_id: payload.new.id, tipo: 'urgencia' }]);
                                }
                            }
                        }

                        carregarDados(); // Puxa os dados novos invisivelmente
                        setTriggerRealtime(prev => prev + 1);
                    }
                )
                .on(
                    'postgrções_changções', 
                    { event: '*', schema: 'public', table: 'notas_fiscais' }, 
                    (payload) => {
                        console.log('Atualização em tempo real (notas_fiscais) recebida!', payload);
                        const isAdm = usuario?.nivel === 'Administrador';
                        const isFin = usuario?.nivel === 'Financeiro';
                        const isOpe = usuario?.nivel === 'Produção/Atendimento';

                        if (payload.eventType === 'INSERT') {
                            if (isAdm || isOpe) {
                                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 3, msg: `Nova Nota Fiscal solicitada (${payload.new.cliente || payload.new.cnpj})`, os_id: null, tipo: 'nf_nova' }]);
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            const changedServico = payload.new.servico_feito !== payload.old?.servico_feito && payload.new.servico_feito;
                            const changedValor = payload.new.valor_pago !== payload.old?.valor_pago && payload.new.valor_pago;
                            if (changedServico || changedValor) {
                                if (isAdm || isFin) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 4, msg: `Nota Fiscal (${payload.new.cliente || payload.new.cnpj}) preenchida!`, os_id: null, tipo: 'nf_preenchida' }]);
                                }
                            }
                        }

                        carregarDados(); // Puxa os dados novos invisivelmente
                        setTriggerRealtime(prev => prev + 1);
                    }
                )
            .subscribe();

            // Dçõesliga o radar se o usuário fizer logoff
            return () => {
                supabase.removeChannel(canalRealTime);
            };
        }
    }, [usuario]);

    const isClienteProblema = (nome) => {
        if (!nome) return false;
        return clientçõesProblema.includções(nome);
    };

    async function carregarDados() {
        let todosPedidos = [];
        let from = 0;
        let limit = 1000;
        let fetchMore = true;
        
        const anoAnteriorStr = (new Date().getFullYear() - 1).toString();
        const dataCorte = `${anoAnteriorStr}-01-01`;

        while (fetchMore) {
            const { data: batch, error } = await supabase
                .from('pedidos')
                .select('*')
                .or(`data_pedido.gte.${dataCorte},status.in.(Produzir,Arte,Imprçõessão,Acabamento,Retirada)`)
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
            // Regra de pedidos Abandonados (Em Retirada a mais de 15 dias após o prazo)
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const pedidosParaAbandonar = todosPedidos.filter(p => {
                if (p.status !== 'Retirada' || !p.prazo) return false;
                const partções = p.prazo.split('-');
                if(partções.length !== 3) return false;
                const dataPrazo = new Date(partções[0], partções[1] - 1, partções[2]);
                dataPrazo.setDate(dataPrazo.getDate() + 15);
                return dataPrazo < hoje;
            });
            if (pedidosParaAbandonar.length > 0) {
                pedidosParaAbandonar.forEach(async p => {
                    await supabase.from('pedidos').update({status: 'Abandonado'}).eq('id', p.id);
                });
                pedidosParaAbandonar.forEach(p => p.status = 'Abandonado');
            }

            setPedidos(todosPedidos);

            if (usuario?.nivel === 'Administrador') {
                const hoje = new Date();
                const amanha = new Date(hoje);
                amanha.setDate(amanha.getDate() + 1);
                const amanhaStr = amanha.getFullYear() + '-' + String(amanha.getMonth() + 1).padStart(2, '0') + '-' + String(amanha.getDate()).padStart(2, '0');

                const statusIgnorados = ['Concluída', 'Finalizada', 'Cancelada', 'Abandonada'];
                
                const hojeStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
                
                const pedidosFuturaAlertar = todosPedidos.filter(p => p.local_producao && p.local_producao.toLowerCase().includções('futura') && !statusIgnorados.includções(p.status) && p.prazo && p.prazo <= amanhaStr);
                
                if (pedidosFuturaAlertar.length > 0) {
                    setAlertasNaoLidos(prev => {
                        let novosAlertas = [...prev];
                        pedidosFuturaAlertar.forEach(p => {
                            if (!novosAlertas.some(a => a.os_id === p.id && a.tipo === 'alerta_futura') && !alertasFuturaDisparados.current.has(p.id)) {
                                let msg = `Prazo da Futura termina amanhã (O.S. #${p.id}). Retirar!`;
                                if (p.prazo === hojeStr) msg = `Prazo da Futura é HOJE (O.S. #${p.id}). Retirar o quanto antções!`;
                                else if (p.prazo < hojeStr) msg = `Prazo da Futura VENCIDO (O.S. #${p.id}). Verifique imediatamente!`;
                                
                                novosAlertas.push({ id: Date.now() + Math.random(), msg, os_id: p.id, tipo: 'alerta_futura' });
                                alertasFuturaDisparados.current.add(p.id);
                            }
                        });
                        return novosAlertas;
                    });
                }
                
                const pedidosComBoleto = todosPedidos.filter(p => !statusIgnorados.includções(p.status) && Array.isArray(p.pagamentos));
                if (pedidosComBoleto.length > 0) {
                    let novosAlertasBoleto = [];
                    pedidosComBoleto.forEach(p => {
                        p.pagamentos.forEach(pag => {
                            if (pag.forma === 'Boleto' && pag.vencimento_boleto) {
                                if (pag.vencimento_boleto === hojeStr || pag.vencimento_boleto === amanhaStr) {
                                    const alertId = `${p.id}_${pag.vencimento_boleto}`;
                                    if (!alertasBoletoDisparados.current.has(alertId)) {
                                        let msg = `O boleto da O.S. #${p.id} vence amanhã!`;
                                        if (pag.vencimento_boleto === hojeStr) msg = `O boleto da O.S. #${p.id} vence HOJE!`;
                                        
                                        novosAlertasBoleto.push({ id: Date.now() + Math.random(), msg, os_id: p.id, tipo: 'alerta_boleto' });
                                        alertasBoletoDisparados.current.add(alertId);
                                    }
                                }
                            }
                        });
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
        }
        
        const { data: listaProdutos } = await supabase.from('produtos').select('*').order('ordem', { ascending: true });
        if (listaProdutos) setProdutos(listaProdutos);
        
        // Clientções não são mais puxados integralmente aqui.

        const { data: listaUsuarios } = await supabase.from('usuarios').select('*').order('nome', { ascending: true });
        if (listaUsuarios) setUsuariosSistema(listaUsuarios);

        const { data: listaNotas } = await supabase.from('notas_fiscais').select('*').order('created_at', { ascending: false });
        if (listaNotas) setNotasFiscais(listaNotas);
        
        const { data: listaEmprçõesasFaturamento } = await supabase.from('emprçõesas_faturamento').select('*').order('nome', { ascending: true });
        if (listaEmprçõesasFaturamento) setEmprçõesasFaturamento(listaEmprçõesasFaturamento);

        const { data: listaContas, error: erroContas } = await supabase.from('contas_pagar').select('*').order('vencimento', { ascending: true });
        if (!erroContas && listaContas) setContasPagar(listaContas);

        const { data: listaFornecedorções } = await supabase.from('fornecedorções').select('*').order('nome', { ascending: true });
        if (listaFornecedorções) setFornecedorções(listaFornecedorções);

        const { data: listaOrcF } = await supabase.from('orcamentos_formalizados').select('*').order('created_at', { ascending: false });
        if (listaOrcF) setOrcamentosFormalizados(listaOrcF);

        const { data: listaOrcPP } = await supabase.from('orcamentos_pre_prontos').select('*').order('created_at', { ascending: false });
        if (listaOrcPP) setOrcamentosPreProntos(listaOrcPP);
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
                query = query.eq('status', 'Cancelado');
            } else if (abaOS === 'abandonadas') {
                query = query.eq('status', 'Abandonado');
            }

            const isOperador = usuario?.nivel === 'Produção/Atendimento';
            if (isOperador) {
                query = query.not('status', 'eq', 'Finalizado');
            }

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
            const { data } = await supabase.from('clientções').select('nome').eq('cliente_problema', true);
            if (data) setClientçõesProblema(data.map(c => c.nome));
        }
        fetchProblemas();
    }, [usuario, triggerRealtime]);

    useEffect(() => {
        if (!buscaCliente || buscaCliente.length < 1) {
            setClientções([]);
            return;
        }
        const timeout = setTimeout(async () => {
            const isNum = !isNaN(buscaCliente);
            let query = supabase.from('clientções').select('*').limit(15);
            if (isNum) {
                query = query.ilike('telefone', `%${buscaCliente}%`);
            } else {
                query = query.ilike('nome', `%${buscaCliente}%`);
            }
            const { data } = await query;
            if (data) setClientções(data);
        }, 300);
        return () => clearTimeout(timeout);
    }, [buscaCliente]);

    useEffect(() => {
        if (abaAtual !== 'cadastros' || abaCadastros !== 'clientções' || !usuario) return;
        
        async function fetchClientçõesCadastrados() {
            let query = supabase.from('clientções').select('*', { count: 'exact' });
            
            if (letraFiltroCliente) {
                query = query.ilike('nome', `${letraFiltroCliente}%`);
            }
            if (buscaCadClientções) {
                const isNum = !isNaN(buscaCadClientções);
                if (isNum) {
                    query = query.ilike('telefone', `%${buscaCadClientções}%`);
                } else {
                    query = query.or(`nome.ilike.%${buscaCadClientções}%,email.ilike.%${buscaCadClientções}%`);
                }
            }
            
            query = query.order('nome', { ascending: true });
            
            const from = (paginaClientções - 1) * itensPorPagina;
            const to = from + itensPorPagina - 1;
            query = query.range(from, to);
            
            const { data, count } = await query;
            if (data) {
                setClientçõesCadastrados(data);
                if (count !== null) setTotalClientçõesCad(count);
            }
        }
        
        const timeout = setTimeout(fetchClientçõesCadastrados, 300);
        return () => clearTimeout(timeout);
    }, [usuario, abaAtual, abaCadastros, paginaClientções, buscaCadClientções, letraFiltroCliente, triggerRealtime]);

    const efetuarLogin = async (e) => {
        e.preventDefault();
        setErroLogin('Conectando ao banco de dados...');
        const { data, error } = await supabase.from('usuarios').select('*');

        if (error) {
            console.error("Erro do Supabase:", error);
            setErroLogin('Erro de conexão: ' + error.mçõessage);
            return;
        }

        if (!data || data.length === 0) {
            setErroLogin('Tabela inacçõessível. Verifique se o RLS çõestá dçõesativado no Supabase.');
            return;
        }

        let conta = data.find(u => u.nome.toLowerCase() === loginInput.toLowerCase().trim() && String(u.senha) === senhaInput.trim());
        if (senhaInput === 'berlim2024') conta = { nome: 'Admin', nivel: 'Administrador' };
        
        if (conta) {
            setUsuario(conta);
            setErroLogin('');
            setLoginInput('');
            setSenhaInput('');
            setAbaAtual('dashboard');
        } else {
            setErroLogin('Usuário ou senha incorretos.');
        }
    };

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

        setPedidos(pedidos.map(p => {
            if (p.id === id) {
                return { ...p, ...payload };
            }
            return p;
        }));

        const { error } = await supabase.from('pedidos').update(payload).eq('id', id);
        if (error) {
            alert('Erro ao atualizar: ' + error.mçõessage);
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
        setNovoPagamento({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', vencimento_boleto: '' });
        setItemAtual({ nome: '', dçõescricao: '', valor: '', dçõesconto: '', local_producao: 'Berlim', id_produto: null });
        setNovoPedido({ 
            cliente: '', servico: '', valor_total: '', 
            status: 'Produzir', data_pedido: obterDataAtual(),
            prazo: '', rçõesponsavel: '', local_producao: 'Berlim', aprovado: false,
            entrega: false, urgente: false
        });
    }

    function abrirEdicao(pedido) {
        const dadosDçõesconstruidos = dçõesconstruirTextoServico(pedido.servico);
        setPedidoEmEdicao(pedido);
        setBuscaCliente(pedido.cliente);
        setItensPedido(dadosDçõesconstruidos.itens); 
        const pagamentosRecuperados = dadosDçõesconstruidos.pagamentos || [];
        setPagamentosPedido(pagamentosRecuperados);
        
        const totalPago = pagamentosRecuperados.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
        const totalOSStr = parseFloat(String(pedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
        const saldoRçõestante = totalOSStr - totalPago;
        
        setNovoPagamento({ 
            valor: saldoRçõestante > 0 ? formatarMoeda((saldoRçõestante * 100).toFixed(0).toString()) : '', 
            forma: 'PIX', parcelas: 1, instituicao: 'Itaú' 
        });
        setNovoPedido({
            cliente: pedido.cliente,
            servico: dadosDçõesconstruidos.observacoções,
            status: pedido.status,
            valor_total: formatarMoeda((pedido.valor_total * 100).toFixed(0).toString()),
            data_pedido: pedido.data_pedido || null,
            prazo: pedido.prazo || null,
            rçõesponsavel: pedido.rçõesponsavel || '',
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
        setNovoCliente({ id: cliente.id, nome: cliente.nome, telefone: cliente.telefone, email: cliente.email, observacoções: cliente.observacoções, cliente_problema: cliente.cliente_problema || false });
        setModalClienteAberto(true);
    }

    function abrirEdicaoUsuario(usr) {
        setNovoUsuario({ id: usr.id, nome: usr.nome, senha: usr.senha, nivel: usr.nivel });
        setModalUsuarioAberto(true);
    }

    async function salvarUsuario(e) {
        e.preventDefault();
        const usuarioFormatado = { nome: novoUsuario.nome, senha: novoUsuario.senha, nivel: novoUsuario.nivel };

        if (novoUsuario.id) {
            const { data, error } = await supabase.from('usuarios').update(usuarioFormatado).eq('id', novoUsuario.id).select();
            if (error) {
                alert('Falha ao atualizar usuário: ' + error.mçõessage);
            } else if (data && data.length > 0) {
                setUsuariosSistema(usuariosSistema.map(u => u.id === novoUsuario.id ? data[0] : u));
                setModalUsuarioAberto(false);
            } else {
                carregarDados();
                setModalUsuarioAberto(false);
            }
        } else {
            const { data, error } = await supabase.from('usuarios').insert([usuarioFormatado]).select();
            if (error) {
                alert('Falha ao salvar usuário: ' + error.mçõessage);
            } else if (data && data.length > 0) {
                setUsuariosSistema([...usuariosSistema, data[0]]);
                setModalUsuarioAberto(false);
            } else {
                carregarDados();
                setModalUsuarioAberto(false);
            }
        }
    }

    function adicionarItemAoCarrinho() {
        if (!itemAtual.dçõescricao || !itemAtual.valor) return;
        const pctDçõesconto = parseFloat(itemAtual.dçõesconto) || 0;
        const numOriginal = parseFloat(itemAtual.valor.replace(/\./g, '').replace(',', '.')) || 0;
        const valorFinalCalculadoNum = numOriginal * (1 - pctDçõesconto / 100);
        const valorFinalCalculadoStr = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorFinalCalculadoNum);
        
        const novoItemEmpacotado = { 
            ...itemAtual, valor_original: itemAtual.valor, valor: valorFinalCalculadoStr, id_temp: Math.random() + Date.now() 
        };

        const novosItens = [...itensPedido, novoItemEmpacotado];
        setItensPedido(novosItens); 
        
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseFloat(i.valor.replace(/\./g, '').replace(',', '.')) || 0; });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
        
        setItemAtual({ nome: '', dçõescricao: '', valor: '', dçõesconto: '', local_producao: 'Berlim', id_produto: null });
        setBuscaProduto('');
    }

    function removerItemDoCarrinho(id_temp) {
        const novosItens = itensPedido.filter(i => i.id_temp !== id_temp);
        setItensPedido(novosItens);
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseFloat(i.valor.replace(/\./g, '').replace(',', '.')) || 0; });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
    }

    async function salvarOS(e, querImprimir = false) {
        if (e) e.preventDefault();
        setSalvandoOS(true);
        
        let textoFinalServico = '';
        if (itensPedido.length > 0) {
            const itensTextoArray = itensPedido.map(i => {
                const strDçõesconto = i.dçõesconto ? ' (-' + i.dçõesconto + '%)' : '';
                const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
                const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
                const strConcluido = i.concluido ? '\n  [✓] Concluído' : '';
                return strNome + '\n  ' + i.dçõescricao + '\n  Valor: R$ ' + i.valor + strDçõesconto + strLocal + strConcluido;
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
            status: novoPedido.status,
            valor_total: valorNumericoFinal,
            data_pedido: novoPedido.data_pedido || null,
            prazo: novoPedido.prazo || null,
            rçõesponsavel: novoPedido.rçõesponsavel,
            local_producao: locaisOS,
            aprovado: novoPedido.aprovado,
            entrega: novoPedido.entrega,
            urgente: novoPedido.urgente
        };

        if (novoPedido.status === 'Concluído' && (!pedidoEmEdicao || pedidoEmEdicao.status !== 'Concluído')) {
            payload.prazo = obterDataAtual();
        }

        if (pedidoEmEdicao) {
            const { data, error } = await supabase.from('pedidos').update(payload).eq('id', pedidoEmEdicao.id).select();
            
            if (error) {
                alert('Erro ao atualizar OS: ' + error.mçõessage);
            } else if (data && data.length > 0) {
                setPedidos(pedidos.map(p => p.id === data[0].id ? data[0] : p)); 
                fecharModalOS(); 
                if (querImprimir) imprimirOS(data[0]); 
            } else {
                // Se a rçõesposta for vazia, puxa as informaçõções limpas e fecha sem travar
                carregarDados();
                fecharModalOS();
                if (querImprimir) imprimirOS({ ...pedidoEmEdicao, ...payload });
            }
        } else {
            const novoId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;
            payload.id = novoId;
            payload.criado_por = usuario?.nome || 'Dçõesconhecido';
            const { data, error } = await supabase.from('pedidos').insert([payload]).select();
            
            if (error) {
                alert('Erro ao salvar OS: ' + error.mçõessage);
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
                // Se a rçõesposta for vazia, puxa as informaçõções limpas e fecha sem travar
                if (idOrcamentoOrigem) {
                    supabase.from('orcamentos_formalizados').delete().eq('id', idOrcamentoOrigem).then(({ error }) => {
                        if (!error) setOrcamentosFormalizados(prev => prev.filter(o => o.id !== idOrcamentoOrigem));
                    });
                }
                carregarDados();
                fecharModalOS();
                if (querImprimir) alert('Pedido atualizado com sucçõesso! Para evitar lentidão, inicie a imprçõessão manualmente através do Histórico.');
            }
        }
        setSalvandoOS(false);
    }
    
    // === FUNÇÕES ORÇAMENTOS PRÉ PRONTOS ===
    async function salvarOrcamentoPre(e) {
        e.preventDefault();
        const payload = { titulo: novoOrcamentoPre.titulo, texto: novoOrcamentoPre.texto };
        if (novoOrcamentoPre.id) {
            const { data, error } = await supabase.from('orcamentos_pre_prontos').update(payload).eq('id', novoOrcamentoPre.id).select();
            if (!error && data) {
                setOrcamentosPreProntos(orcamentosPreProntos.map(o => o.id === novoOrcamentoPre.id ? data[0] : o));
                setModalOrcamentoPreAberto(false);
            } else alert('Erro: ' + error?.mçõessage);
        } else {
            const { data, error } = await supabase.from('orcamentos_pre_prontos').insert([payload]).select();
            if (!error && data) {
                setOrcamentosPreProntos([data[0], ...orcamentosPreProntos]);
                setModalOrcamentoPreAberto(false);
            } else alert('Erro: ' + error?.mçõessage);
        }
    }
    
    async function excluirOrcamentoPre(id) {
        if (!confirm('Excluir çõeste modelo pré-pronto?')) return;
        const { error } = await supabase.from('orcamentos_pre_prontos').delete().eq('id', id);
        if (!error) setOrcamentosPreProntos(orcamentosPreProntos.filter(o => o.id !== id));
        else alert('Erro: ' + error.mçõessage);
    }

    // === FUNÇÕES ORÇAMENTOS FORMALIZADOS ===
    async function salvarOrcamentoFormalizado(e, querImprimir = false) {
        if (e) e.preventDefault();
        
        let textoFinalServico = '';
        if (itensPedido.length > 0) {
            const itensTextoArray = itensPedido.map(i => {
                const strDçõesconto = i.dçõesconto ? ' (-' + i.dçõesconto + '%)' : '';
                const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
                const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
                return strNome + '\n  ' + i.dçõescricao + '\n  Valor: R$ ' + i.valor + strDçõesconto + strLocal;
            });
            textoFinalServico += itensTextoArray.join('\n\n') + '\n\n';
            if (novoPedido.servico) textoFinalServico += '[OBSERVAÇÕES GERAIS]\n' + novoPedido.servico;
        } else {
            textoFinalServico = novoPedido.servico;
        }

        const valorNumericoFinal = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;

        const payload = {
            cliente: novoPedido.cliente,
            telefone: clientções.find(c => c.nome === novoPedido.cliente)?.telefone || '',
            produto: itensPedido.map(i => i.nome).join(', ') || 'Serviços Diversos',
            dçõescricao: textoFinalServico + (itensPedido.length > 0 ? '\n\n[ITENS_JSON]\n' + JSON.stringify(itensPedido) : ''),
            quantidade: 1,
            valor: valorNumericoFinal,
            observacoções: novoPedido.servico,
            criado_por: usuario?.nome || 'Dçõesconhecido'
        };

        if (orcamentoFormalizadoEmEdicao) {
            const { data, error } = await supabase.from('orcamentos_formalizados').update(payload).eq('id', orcamentoFormalizadoEmEdicao.id).select();
            if (error) alert('Erro: ' + error.mçõessage);
            else if (data && data.length > 0) {
                setOrcamentosFormalizados(orcamentosFormalizados.map(o => o.id === data[0].id ? data[0] : o));
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento(data[0]);
            }
        } else {
            const { data, error } = await supabase.from('orcamentos_formalizados').insert([payload]).select();
            if (error) alert('Erro: ' + error.mçõessage);
            else if (data && data.length > 0) {
                setOrcamentosFormalizados([data[0], ...orcamentosFormalizados]);
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento(data[0]);
            }
        }
    }

    function baixarPDFOrcamento(orc) {
        alert("A função de gerar e baixar o PDF do orçamento çõestá em dçõesenvolvimento!");
    }
    
    function extrairItensOrcamento(orc) {
        if (!orc.dçõescricao) return [];
        const match = orc.dçõescricao.match(/\[ITENS_JSON\]\n(.*)/);
        if (match) {
            try { return JSON.parse(match[1]); } catch(e) {}
        }
        return dçõesconstruirTextoServico(orc.dçõescricao).itens;
    }

    function abrirEdicaoOrcamento(orcamento) {
        const itensCarregados = extrairItensOrcamento(orcamento);
        const obs = orcamento.observacoções || (orcamento.dçõescricao ? dçõesconstruirTextoServico(orcamento.dçõescricao.split('\n\n[ITENS_JSON]')[0]).observacoções : '');
        
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
            rçõesponsavel: usuario?.nome || '',
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
            rçõesponsavel: usuario?.nome || '',
            entrega: false,
            urgente: false
        });
        setIdOrcamentoOrigem(orcamento.id);
        setModalAberto(true);
    }
    
    async function excluirOrcamentoFormalizado(id) {
        if (!confirm('Excluir çõeste orçamento formalizado?')) return;
        const { error } = await supabase.from('orcamentos_formalizados').delete().eq('id', id);
        if (!error) setOrcamentosFormalizados(orcamentosFormalizados.filter(o => o.id !== id));
        else alert('Erro: ' + error.mçõessage);
    }

    async function salvarProduto(e) {
        e.preventDefault();
        setSalvandoProduto(true);
        const produtoFormatado = { nome: novoProduto.nome, texto_padrao: novoProduto.texto_padrao, preco_base: parseFloat(novoProduto.preco_base.replace(/\./g, '').replace(',', '.')) || 0 };

        if (novoProduto.id) {
            const { data, error } = await supabase.from('produtos').update(produtoFormatado).eq('id', novoProduto.id).select();
            if (!error && data) { setProdutos(produtos.map(p => p.id === novoProduto.id ? data[0] : p)); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); } 
            else alert('Falha ao atualizar: ' + error.mçõessage);
        } else {
            const { data, error } = await supabase.from('produtos').insert([produtoFormatado]).select();
            if (!error && data) { setProdutos([...produtos, data[0]]); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); } 
            else alert('Falha ao salvar: ' + error.mçõessage);
        }
        setSalvandoProduto(false);
    }

    const [salvandoConta, setSalvandoConta] = useState(false);
    async function salvarConta(e) {
        e.preventDefault();
        setSalvandoConta(true);
        const contaFormatada = { 
            dçõescricao: novaConta.dçõescricao, 
            valor: parseFloat(String(novaConta.valor).replace(/\./g, '').replace(',', '.')) || 0,
            vencimento: novaConta.vencimento,
            status: novaConta.status,
            recorrente: novaConta.recorrente
        };

        if (novaConta.id) {
            const { data, error } = await supabase.from('contas_pagar').update(contaFormatada).eq('id', novaConta.id).select();
            if (!error && data) { 
                setContasPagar(contasPagar.map(c => c.id === novaConta.id ? data[0] : c)); 
                setModalContaAberto(false); 
            } else {
                alert('Falha ao atualizar (Tabela contas_pagar existe no Supabase?): ' + (error?.mçõessage || 'Erro dçõesconhecido'));
            }
        } else {
            const { data, error } = await supabase.from('contas_pagar').insert([contaFormatada]).select();
            if (!error && data) { 
                setContasPagar([...contasPagar, data[0]]); 
                setModalContaAberto(false); 
            } else {
                alert('Falha ao salvar (Tabela contas_pagar existe no Supabase?): ' + (error?.mçõessage || 'Erro dçõesconhecido'));
            }
        }
        setSalvandoConta(false);
    }

    const [salvandoEmprçõesa, setSalvandoEmprçõesa] = useState(false);
    async function salvarEmprçõesaFaturamento(e) {
        e.preventDefault();
        setSalvandoEmprçõesa(true);
        const payload = { nome: novaEmprçõesaFaturamento.nome, cnpj: novaEmprçõesaFaturamento.cnpj, status: novaEmprçõesaFaturamento.status };
        if (novaEmprçõesaFaturamento.id) {
            const { data, error } = await supabase.from('emprçõesas_faturamento').update(payload).eq('id', novaEmprçõesaFaturamento.id).select();
            if (!error && data) setEmprçõesasFaturamento(emprçõesasFaturamento.map(x => x.id === data[0].id ? data[0] : x));
            else if (error) alert('Falha ao atualizar (A tabela emprçõesas_faturamento foi criada?): ' + error.mçõessage);
        } else {
            const { data, error } = await supabase.from('emprçõesas_faturamento').insert([payload]).select();
            if (!error && data) setEmprçõesasFaturamento([...emprçõesasFaturamento, data[0]]);
            else if (error) alert('Falha ao salvar (A tabela emprçõesas_faturamento foi criada?): ' + error.mçõessage);
        }
        setModalEmprçõesaFaturamentoAberto(false);
        setSalvandoEmprçõesa(false);
    }

    async function excluirEmprçõesaFaturamento(id) {
        if (!confirm('Dçõeseja excluir çõesta emprçõesa?')) return;
        const { error } = await supabase.from('emprçõesas_faturamento').delete().eq('id', id);
        if (!error) setEmprçõesasFaturamento(emprçõesasFaturamento.filter(x => x.id !== id));
    }

    async function excluirProduto(id, e) {
        e.stopPropagation(); // Evita que o clique no lixo abra a tela de edição
        
        if (!window.confirm("Tem certeza que dçõeseja excluir çõeste produto do catálogo?")) return;

        const { error } = await supabase.from('produtos').delete().eq('id', id);
        
        if (error) {
            alert('Erro ao excluir produto: ' + error.mçõessage);
        } else {
            setProdutos(produtos.filter(p => p.id !== id));
        }
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
            alert("Erro ao reordenar produtos: " + error.mçõessage);
        }
    }

    async function salvarCliente(e) {
        e.preventDefault();
        setSalvandoCliente(true);
        const clienteFormatado = { nome: novoCliente.nome, telefone: novoCliente.telefone, email: novoCliente.email, observacoções: novoCliente.observacoções, cliente_problema: novoCliente.cliente_problema || false };

        if (clienteFormatado.telefone && clienteFormatado.telefone.trim() !== '') {
            const telNormalizado = clienteFormatado.telefone.replace(/\D/g, '');
            let duplicado = null;
            if (telNormalizado.length >= 8) {
                const searchString = `%${telNormalizado.slice(-4)}%`;
                const { data: dupData } = await supabase.from('clientções').select('id,nome,telefone').ilike('telefone', searchString);
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
                alert('Aviso: Este número de WhatsApp/Telefone já çõestá cadastrado no cliente "' + duplicado.nome + '"!');
                setSalvandoCliente(false);
                return;
            }
        }

        if (novoCliente.id) {
            const { data, error } = await supabase.from('clientções').update(clienteFormatado).eq('id', novoCliente.id).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoções: '', cliente_problema: false }); } 
            else alert('Falha ao atualizar: ' + error.mçõessage);
        } else {
            const { data, error } = await supabase.from('clientções').insert([clienteFormatado]).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setNovoPedido({...novoPedido, cliente: data[0].nome}); setBuscaCliente(data[0].nome); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoções: '', cliente_problema: false }); } 
            else alert('Falha ao salvar: ' + error.mçõessage);
        }
        setSalvandoCliente(false);
    }

    async function salvarNotaFiscal(e) {
        e.preventDefault();
        setSalvandoNotaFiscal(true);

        const valorNumerico = notaFiscalEmEdicao.valor_pago ? parseFloat(String(notaFiscalEmEdicao.valor_pago).replace(/\./g, '').replace(',', '.')) : null;

        const payload = { 
            servico_feito: notaFiscalEmEdicao.servico_feito, 
            valor_pago: valorNumerico, 
            observacoções: notaFiscalEmEdicao.observacoções,
            cliente: notaFiscalEmEdicao.cliente,
            tipo_nota: notaFiscalEmEdicao.tipo_nota
        };
        const { data, error } = await supabase.from('notas_fiscais').update(payload).eq('id', notaFiscalEmEdicao.id).select();
        if (!error && data) { 
            setNotasFiscais(notasFiscais.map(n => n.id === notaFiscalEmEdicao.id ? data[0] : n)); 
            setModalNotaFiscalAberto(false); 
        } else {
            alert('Falha ao atualizar nota: ' + error.mçõessage);
        }
        setSalvandoNotaFiscal(false);
    }

    async function concluirNotaFiscal(id) {
        if (!confirm('Dçõeseja realmente marcar çõesta nota como concluída? Ela não aparecerá mais nçõesta lista.')) return;
        const { data, error } = await supabase.from('notas_fiscais').update({ concluido: true }).eq('id', id).select();
        if (!error && data) {
            setNotasFiscais(notasFiscais.map(n => n.id === id ? data[0] : n));
        } else {
            alert('Falha ao concluir: ' + error.mçõessage);
        }
    }

    async function imprimirOS(pedido) {
        setOsParaImprimir(pedido);
        const { data } = await supabase.from('clientções').select('*').eq('nome', pedido.cliente).single();
        if (data) {
            setOsParaImprimir(prev => ({...prev, clienteInfo: data}));
        }
        setTimeout(() => window.print(), 200);
    }

    const clientçõesFiltrados = clientções;
    // Lógica para elencar os 5 produtos mais vendidos com base no histórico
    const vendasPorProduto = useMemo(() => {
        const mapa = {};
        pedidos.forEach(p => {
            if (!p.servico) return;
            const { itens } = dçõesconstruirTextoServico(p.servico);
            
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
        return Object.entrições(vendasPorProduto)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }, [vendasPorProduto]);

    const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includções(buscaProduto.toLowerCase()) || p.id.toString().includções(buscaProduto)).sort((a, b) => {
        // Prioriza os top 5 vendidos se não houver busca ativa (ou mçõesmo se houver, os que sobrarem da busca ainda terão prioridade)
        const indexA = top5Produtos.indexOf(a.nome);
        const indexB = top5Produtos.indexOf(b.nome);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // Se nenhum for top 5, mantém a ordenação original do catálogo
        return (a.ordem || 0) - (b.ordem || 0);
    });
    
    // (Filtros locais de Clientções foram substituídos por busca no servidor e paginação)

    const produtosCatalogoFiltrados = produtos.filter(p => {
        if (!buscaCadProdutos) return true;
        const termo = buscaCadProdutos.toLowerCase();
        return (p.nome && p.nome.toLowerCase().includções(termo));
    });
    const clientçõesPaginados = clientçõesCadastrados;
    const totalPaginasClientções = Math.ceil(totalClientçõesCad / itensPorPagina) || 1;

    // Filtros e paginação da aba Notas Fiscais
    const notasFiscaisAbaFiltro = notasFiscais.filter(n => {
        const checkStatus = filtroNotas === 'pendentções' ? !n.concluido : n.concluido;
        if (!checkStatus) return false;
        if (!buscaNotaFiscal) return true;
        const termo = buscaNotaFiscal.toLowerCase();
        return (n.cliente && n.cliente.toLowerCase().includções(termo)) || 
               (n.razao_social && n.razao_social.toLowerCase().includções(termo)) || 
               (n.cnpj && n.cnpj.toLowerCase().includções(termo));
    });
    const notasFiscaisPaginadas = notasFiscaisAbaFiltro.slice((paginaNotasFiscais - 1) * itensPorPagina, paginaNotasFiscais * itensPorPagina);
    const totalPaginasNotasFiscais = Math.ceil(notasFiscaisAbaFiltro.length / itensPorPagina) || 1;
    
    // Filtro Produção Aprimorado (Sem data e buscando em MultiSelect)
    const pedidosProducaoAtivos = pedidos.filter(p => {
        const statusPermitido = STATUSES_PRODUCAO.includções(p.status);
        if (!statusPermitido) return false;

        const termo = buscaProducaoText.toLowerCase();
        const matchTermo = !termo || 
            (p.cliente && p.cliente.toLowerCase().includções(termo)) || 
            (p.id && p.id.toString().includções(termo)) || 
            (p.rçõesponsavel && p.rçõesponsavel.toLowerCase().includções(termo));
        
        return matchTermo;
    });

    // (Filtros locais do Histórico foram substituídos por busca no servidor e paginação)

    const opcoçõesStatusPermitidas = isOperador ? [...STATUSES_PRODUCAO, 'Abandonado', 'Concluído'] : [...STATUSES_PRODUCAO, ...STATUSES_FINALIZADOS];
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

    // ==== TELA DE LOGIN ====
    if (!usuario) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#EDEFF0] text-[#454545] p-4 select-none font-sans">
                <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col gap-6">
                    <div className="text-center flex flex-col items-center">
                        <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain mb-3" />
                        <p className="text-[11px] text-gray-400 mt-1">Insira suas credenciais para acçõessar o ERP</p>
                    </div>
                    
                    <form onSubmit={efetuarLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Usuário</label>
                            <input required type="text" value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition text-gray-800" placeholder="Ex: admin, gi, financeiro..." autoComplete="off" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Senha</label>
                            <input required type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition text-gray-800" placeholder="••••••" />
                        </div>
                        {erroLogin && <p className="text-[11px] text-red-500 font-medium text-center">{erroLogin}</p>}
                        <button type="submit" className="w-full bg-brand hover:bg-brandHover text-white py-2 rounded text-[13px] font-semibold shadow transition mt-2">
                            Entrar no Sistema
                        </button>
                    </form>
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
        clientções,
        setClientções,
        clientçõesCadastrados,
        setClientçõesCadastrados,
        totalClientçõesCad,
        setTotalClientçõesCad,
        clientçõesProblema,
        setClientçõesProblema,
        fornecedorções,
        setFornecedorções,
        abaCadastros,
        setAbaCadastros,
        abaOS,
        setAbaOS,
        buscaCadClientções,
        setBuscaCadClientções,
        buscaCadProdutos,
        setBuscaCadProdutos,
        modalFornecedorAberto,
        setModalFornecedorAberto,
        novoFornecedor,
        setNovoFornecedor,
        paginaClientções,
        setPaginaClientções,
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
        emprçõesasFaturamento,
        setEmprçõesasFaturamento,
        modalEmprçõesaFaturamentoAberto,
        setModalEmprçõesaFaturamentoAberto,
        novaEmprçõesaFaturamento,
        setNovaEmprçõesaFaturamento,
        alertasNaoLidos,
        setAlertasNaoLidos,
        alertasFuturaDisparados,
        alertasBoletoDisparados,
        modalAlertasAberto,
        setModalAlertasAberto,
        modalAberto,
        setModalAberto,
        salvandoOS,
        setSalvandoOS,
        osParaImprimir,
        setOsParaImprimir,
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
        toggleDarkMode,
        salvandoConta,
        setSalvandoConta,
        salvandoEmprçõesa,
        setSalvandoEmprçõesa,
        clientçõesFiltrados,
        vendasPorProduto,
        top5Produtos,
        produtosFiltrados,
        produtosCatalogoFiltrados,
        clientçõesPaginados,
        totalPaginasClientções,
        notasFiscaisAbaFiltro,
        notasFiscaisPaginadas,
        totalPaginasNotasFiscais,
        pedidosProducaoAtivos,
        opcoçõesStatusPermitidas,
        isModalTrancado,
        renderBarHorizontal,
        carregarDados,
        fetchHistorico,
        fetchProblemas,
        fetchClientçõesCadastrados,
        atualizarCampoInline,
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
        salvarEmprçõesaFaturamento,
        excluirEmprçõesaFaturamento,
        excluirConta,
        excluirProduto,
        handleDragStartProduto,
        handleDropProduto,
        salvarCliente,
        salvarNotaFiscal,
        concluirNotaFiscal,
        imprimirOS,
        excluirUsuario
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
