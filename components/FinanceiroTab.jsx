"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';


export default function FinanceiroTab() {
    const { setAbaFinanceiro, abaFinanceiro, notasFiscais, usuario, filtroNotas, dataFiltroFinInicio, setDataFiltroFinInicio, dataFiltroFinFim, setDataFiltroFinFim, pedidos, setNovaConta, setModalContaAberto, setModalEmpresaFaturamentoAberto, buscaNotaFiscal, setBuscaNotaFiscal, setPaginaNotasFiscais, setFiltroNotas, renderBarHorizontal, produtos, produtosSelecionadosGrafico, setProdutosSelecionadosGrafico, contasPagar, empresasFaturamento, setNovaEmpresaFaturamento, notasFiscaisPaginadas, setNotaFiscalEmEdicao, setModalNotaFiscalAberto, totalPaginasNotasFiscais, paginaNotasFiscais, excluirConta, abrirEdicao, excluirEmpresaFaturamento, concluirNotaFiscal } = useAppContext();
    const [mostrarContasPagas, setMostrarContasPagas] = useState(false);

    return (
        <>
            { (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaFinanceiro('geral')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'geral' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="pie-chart" className="w-4 h-4" /> Visão Geral</button>
                        <button onClick={() => setAbaFinanceiro('vendas_produto')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'vendas_produto' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="tag" className="w-4 h-4" /> Vendas por Produto</button>
                        <button onClick={() => setAbaFinanceiro('contas_pagar')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_pagar' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="file-text" className="w-4 h-4" /> Contas a Pagar</button>
                        <button onClick={() => setAbaFinanceiro('contas_receber')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_receber' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="dollar-sign" className="w-4 h-4" /> Contas a Receber</button>
                        <button onClick={() => setAbaFinanceiro('empresas_aprovadas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'empresas_aprovadas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-circle" className="w-4 h-4" /> Faturamento</button>
                        <button onClick={() => setAbaFinanceiro('notas_fiscais')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'notas_fiscais' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> Notas Fiscais
                            {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}
                        </button>
                    </div>
                )}
{ (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {abaFinanceiro === 'geral' || abaFinanceiro === 'vendas_produto' ? 'Dashboard Financeiro' :
                                     abaFinanceiro === 'contas_pagar' ? 'Contas a Pagar' :
                                     abaFinanceiro === 'contas_receber' ? 'Contas a Receber' :
                                     abaFinanceiro === 'empresas_aprovadas' ? 'Faturamento' :
                                     abaFinanceiro === 'notas_fiscais' ? `Notas Fiscais ${filtroNotas === 'pendentes' ? 'Pendentes' : 'Concluídas'}` : ''}
                                </h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">
                                    {abaFinanceiro === 'geral' || abaFinanceiro === 'vendas_produto' ? 'Análise de Receitas, Centros de Custo e Performance.' :
                                     abaFinanceiro === 'contas_pagar' ? 'Gerencie as despesas da empresa.' :
                                     abaFinanceiro === 'contas_receber' ? 'Pedidos com pagamento via Boleto.' :
                                     abaFinanceiro === 'empresas_aprovadas' ? 'Gerencie as empresas com faturamento.' :
                                     abaFinanceiro === 'notas_fiscais' ? (filtroNotas === 'pendentes' ? 'Notas enviadas pelos clientes aguardando processamento.' : 'Histórico de notas já emitidas e processadas.') : ''}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                {(abaFinanceiro === 'geral' || abaFinanceiro === 'vendas_produto') && (
                                    <>
                                        <div className="flex flex-col w-36">
                                            <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">Período De:</span>
                                            <CustomDatePicker value={dataFiltroFinInicio} onChange={setDataFiltroFinInicio} placeholder="Início" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
                                        </div>
                                        <div className="flex flex-col w-36">
                                            <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">Período Até:</span>
                                            <CustomDatePicker value={dataFiltroFinFim} onChange={setDataFiltroFinFim} placeholder="Fim" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
                                        </div>
                                        {(dataFiltroFinInicio || dataFiltroFinFim) && (
                                            <button type="button" onClick={() => { setDataFiltroFinInicio(''); setDataFiltroFinFim(''); }} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand" title="Limpar Filtros"><Icon name="x" className="w-4 h-4" /></button>
                                        )}
                                        <button type="button" onClick={() => {
                                                const pedidosExport = pedidos.filter(p => {
                                                    let match = true;
                                                    if (dataFiltroFinInicio && (!p.data_pedido || p.data_pedido < dataFiltroFinInicio)) match = false;
                                                    if (dataFiltroFinFim && (!p.data_pedido || p.data_pedido > dataFiltroFinFim)) match = false;
                                                    return match;
                                                });
                                                const cabecalho = "ID;Data;Cliente;Responsavel;Local;Status;Valor\n";
                                                const linhas = pedidosExport.map(p => `${p.id};${p.data_pedido};${p.cliente};${p.responsavel};${p.local_producao};${p.status};${p.valor_total}`).join("\n");
                                                const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement("a");
                                                link.setAttribute("href", url);
                                                link.setAttribute("download", `relatorio_financeiro_${obterDataAtual()}.csv`);
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2"
                                        >
                                            <Icon name="printer" className="w-4 h-4" /> Exportar CSV
                                        </button>
                                    </>
                                )}
                                
                                {abaFinanceiro === 'contas_pagar' && (
                                    <>
                                        <button onClick={() => setMostrarContasPagas(!mostrarContasPagas)} className={`h-[38px] px-4 text-[13px] rounded-md font-semibold border transition flex items-center justify-center ${mostrarContasPagas ? 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-darkElevated dark:border-darkBorder dark:text-gray-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-darkCard dark:border-darkBorder dark:text-gray-400 hover:bg-gray-50'}`}>
                                            {mostrarContasPagas ? 'Ocultar Pagas' : 'Mostrar Histórico'}
                                        </button>
                                        <button onClick={() => { setNovaConta({ id: null, descricao: '', valor: '', vencimento: '', status: 'Pendente', recorrente: false }); setModalContaAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                            <Icon name="plus" className="w-4 h-4" /> Nova Conta
                                        </button>
                                    </>
                                )}
                                
                                {abaFinanceiro === 'empresas_aprovadas' && (
                                    <button onClick={() => setModalEmpresaFaturamentoAberto(true)} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                        <Icon name="plus" className="w-4 h-4" /> Adicionar Empresa
                                    </button>
                                )}
                                
                                {abaFinanceiro === 'notas_fiscais' && (
                                    <>
                                        <div className="relative w-full lg:w-64">
                                            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar por nome, razão ou CNPJ..." 
                                                value={buscaNotaFiscal} 
                                                onChange={(e) => { setBuscaNotaFiscal(e.target.value); setPaginaNotasFiscais(1); }}
                                                className="w-full pl-9 pr-4 py-1.5 h-[38px] text-[13px] border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard rounded-md focus:outline-none focus:ring-2 focus:ring-brand dark:text-white transition"
                                            />
                                        </div>
                                        <div className="flex bg-gray-100/50 dark:bg-darkHover/50 p-1 rounded-lg border border-gray-200 dark:border-darkBorder w-full lg:w-auto mt-3 lg:mt-0">
                                            <button onClick={() => { setFiltroNotas('pendentes'); setPaginaNotasFiscais(1); }} className={`px-4 py-1.5 text-[12px] font-semibold rounded-md transition flex items-center gap-2 ${filtroNotas === 'pendentes' ? 'bg-white dark:bg-darkCard text-brand shadow-sm border border-gray-200 dark:border-darkBorder' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}>Pendentes {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}</button>
                                            <button onClick={() => { setFiltroNotas('concluidas'); setPaginaNotasFiscais(1); }} className={`px-4 py-1.5 text-[12px] font-semibold rounded-md transition flex items-center gap-2 ${filtroNotas === 'concluidas' ? 'bg-white dark:bg-darkCard text-brand shadow-sm border border-gray-200 dark:border-darkBorder' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'}`}>Concluídas</button>
                                        </div>
                                        <div className="flex rounded-md shadow-sm">
                                            <button onClick={() => window.open('/solicitar-nota', '_blank')} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-l-md font-semibold transition flex items-center gap-2 border border-brand border-r-0">
                                                <Icon name="external-link" className="w-4 h-4" /> Formulário
                                            </button>
                                            <button onClick={() => {
                                                const link = window.location.origin + '/solicitar-nota';
                                                navigator.clipboard.writeText(link);
                                                alert('Link copiado!');
                                            }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-3 rounded-r-md border-l border-white/20 transition flex items-center justify-center" title="Copiar Link">
                                                <Icon name="copy" className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SUB-MENU FOI MOVIDO PARA O TOPNAV */}
                        {(() => {
                            const pedidosFin = pedidos.filter(p => {
                                if (p.status === 'Cancelado' || p.status === 'Cancelada') return false;
                                let match = true;
                                if (dataFiltroFinInicio && (!p.data_pedido || p.data_pedido < dataFiltroFinInicio)) match = false;
                                if (dataFiltroFinFim && (!p.data_pedido || p.data_pedido > dataFiltroFinFim)) match = false;
                                return match;
                            });

                            // Helper para extrair pagamentos de um pedido
                            const obterTotalPagoPedido = (pedido) => {
                                const pagamentosStr = pedido.servico && pedido.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (!pagamentosStr) return 0;
                                try {
                                    const pagamentos = JSON.parse(pagamentosStr);
                                    return pagamentos.reduce((a, p) => a + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                } catch (e) { return 0; }
                            };

                            const totalBruto = pedidosFin.reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0);
                            
                            const totalRecebido = pedidosFin.reduce((acc, p) => {
                                const pagoStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (pagoStr) return acc + obterTotalPagoPedido(p);
                                // Compatibilidade com OS antigas:
                                if (p.status === 'Concluído' || p.status === 'Finalizado') return acc + (Number(p.valor_total) || 0);
                                return acc;
                            }, 0);
                            
                            const totalAReceber = totalBruto - totalRecebido;
                            const ticketMedio = pedidosFin.length > 0 ? (totalBruto / pedidosFin.length) : 0;

                            const totalVendasHoje = pedidos.filter(p => p.data_pedido === obterDataAtual() && p.status !== 'Cancelado' && p.status !== 'Cancelada').reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0);

                            const contasFiltradas = contasPagar.filter(c => {
                                let match = true;
                                if (dataFiltroFinInicio && (!c.vencimento || c.vencimento < dataFiltroFinInicio)) match = false;
                                if (dataFiltroFinFim && (!c.vencimento || c.vencimento > dataFiltroFinFim)) match = false;
                                return match;
                            });
                            const totalDespesas = contasFiltradas.reduce((acc, c) => acc + (parseFloat(String(c.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);

                            const anoAtualStr = new Date().getFullYear().toString();
                            const anoAnteriorStr = (new Date().getFullYear() - 1).toString();
                            
                            const totalAnoAtual = pedidos.filter(p => p.data_pedido && p.data_pedido.startsWith(anoAtualStr) && p.status !== 'Cancelado' && p.status !== 'Cancelada').reduce((a, b) => a + (Number(b.valor_total)||0), 0);
                            const totalAnoAnterior = pedidos.filter(p => p.data_pedido && p.data_pedido.startsWith(anoAnteriorStr) && p.status !== 'Cancelado' && p.status !== 'Cancelada').reduce((a, b) => a + (Number(b.valor_total)||0), 0);
                            const crescimentoPercentual = totalAnoAnterior > 0 ? ((totalAnoAtual - totalAnoAnterior) / totalAnoAnterior) * 100 : (totalAnoAtual > 0 ? 100 : 0);

                            const agrupadoPorDia = pedidosFin.reduce((acc, p) => {
                                if (!p.data_pedido) return acc;
                                const dia = p.data_pedido;
                                if (!acc[dia]) acc[dia] = { dia, bruto: 0 };
                                acc[dia].bruto += (Number(p.valor_total) || 0);
                                return acc;
                            }, {});
                            const diasOrdenados = Object.values(agrupadoPorDia).sort((a, b) => b.dia.localeCompare(a.dia)).slice(0, 15);
                            const maxBrutoDia = Math.max(...diasOrdenados.map(d => d.bruto), 1);

                            const agrupadoPorMesAno = pedidosFin.reduce((acc, p) => {
                                if (!p.data_pedido) return acc;
                                const mesAno = p.data_pedido.substring(0, 7);
                                if (!acc[mesAno]) acc[mesAno] = { mesAno, bruto: 0, recebido: 0 };
                                const val = Number(p.valor_total) || 0;
                                acc[mesAno].bruto += val;
                                if (p.status === 'Concluído' || p.status === 'Finalizado') acc[mesAno].recebido += val;
                                return acc;
                            }, {});
                            const mesesOrdenados = Object.values(agrupadoPorMesAno).sort((a, b) => b.mesAno.localeCompare(a.mesAno)).slice(0, 15);
                            const maxBrutoMes = Math.max(...mesesOrdenados.map(m => m.bruto), 1);

                            const agrupadoResp = pedidosFin.reduce((acc, p) => {
                                if(!p.responsavel) return acc;
                                const resps = p.responsavel.split(',').map(s=>s.trim()).filter(Boolean);
                                resps.forEach(r => {
                                    if(!acc[r]) acc[r] = 0;
                                    acc[r] += (Number(p.valor_total) || 0) / resps.length; 
                                });
                                return acc;
                            }, {});
                            const rankingResp = Object.entries(agrupadoResp).sort((a,b) => b[1] - a[1]);
                            const maxResp = Math.max(...rankingResp.map(r => r[1]), 1);

                            const agrupadoLocal = pedidosFin.reduce((acc, p) => {
                                if(!p.local_producao) return acc;
                                const locais = p.local_producao.split(',').map(s=>s.trim()).filter(Boolean);
                                locais.forEach(l => {
                                    if(!acc[l]) acc[l] = 0;
                                    acc[l] += (Number(p.valor_total) || 0) / locais.length;
                                });
                                return acc;
                            }, {});
                            const rankingLocal = Object.entries(agrupadoLocal).sort((a,b) => b[1] - a[1]);
                            const maxLocal = Math.max(...rankingLocal.map(l => l[1]), 1);

                            const colorsRank = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-red-500'];
                            const colorsLocal = ['bg-teal-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'];
                            const colorsForma = ['bg-amber-500', 'bg-yellow-500', 'bg-orange-500', 'bg-lime-500'];
                            const colorsInst = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500'];

                            const pagamentosExtraidos = pedidosFin.flatMap(p => {
                                const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (!pagamentosStr) return [];
                                try {
                                    return JSON.parse(pagamentosStr).map(pag => ({
                                        valor: parseFloat(String(pag.valor).replace(/\./g, '').replace(',', '.')) || 0,
                                        forma: pag.forma || 'Indefinido',
                                        instituicao: pag.instituicao || 'Indefinido'
                                    }));
                                } catch (e) { return []; }
                            });

                            const agrupadoForma = pagamentosExtraidos.reduce((acc, p) => {
                                if (!acc[p.forma]) acc[p.forma] = 0;
                                acc[p.forma] += p.valor;
                                return acc;
                            }, {});
                            const rankingForma = Object.entries(agrupadoForma).sort((a,b) => b[1] - a[1]);
                            const maxForma = Math.max(...rankingForma.map(f => f[1]), 1);

                            const agrupadoInstituicao = pagamentosExtraidos.reduce((acc, p) => {
                                if (p.forma === 'PIX' || p.forma === 'Link de Pagamento' || p.forma === 'Boleto') {
                                    const inst = p.instituicao;
                                    if (!acc[inst]) acc[inst] = 0;
                                    acc[inst] += p.valor;
                                }
                                return acc;
                            }, {});
                            const rankingInstituicao = Object.entries(agrupadoInstituicao).sort((a,b) => b[1] - a[1]);
                            const maxInstituicao = Math.max(...rankingInstituicao.map(i => i[1]), 1);

                            // --- CONTEXTUAL DATE NAMES ---
                            const anoAtual = new Date().getFullYear();
                            const objData = new Date();
                            const nomeMesAtualRaw = objData.toLocaleString('pt-BR', { month: 'long' });
                            const nomeMesAtual = nomeMesAtualRaw.charAt(0).toUpperCase() + nomeMesAtualRaw.slice(1);
                            const diaAtual = formatarDataExibicao(obterDataAtual()).substring(0, 5);

                            // --- MÊS ATUAL METRICS (for layers 2, 3, 4) ---
                            const mesAtualString = obterDataAtual().substring(0, 7); // yyyy-mm
                            const pedidosMesAtual = pedidosFin.filter(p => p.data_pedido && p.data_pedido.startsWith(mesAtualString));

                            const agrupadoLocalMesAtual = pedidosMesAtual.reduce((acc, p) => {
                                if(!p.local_producao) return acc;
                                const locais = p.local_producao.split(',').map(s=>s.trim()).filter(Boolean);
                                locais.forEach(l => {
                                    if(!acc[l]) acc[l] = 0;
                                    acc[l] += (Number(p.valor_total) || 0) / locais.length;
                                });
                                return acc;
                            }, {});
                            const rankingLocalMesAtual = Object.entries(agrupadoLocalMesAtual).sort((a,b) => b[1] - a[1]);
                            const maxLocalMesAtual = Math.max(...rankingLocalMesAtual.map(l => l[1]), 1);

                            const pagamentosExtraidosMesAtual = pedidosMesAtual.flatMap(p => {
                                const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (!pagamentosStr) return [];
                                try {
                                    return JSON.parse(pagamentosStr).map(pag => ({
                                        valor: parseFloat(String(pag.valor).replace(/\./g, '').replace(',', '.')) || 0,
                                        forma: pag.forma || 'Indefinido',
                                        instituicao: pag.instituicao || 'Indefinido'
                                    }));
                                } catch (e) { return []; }
                            });

                            const agrupadoFormaMesAtual = pagamentosExtraidosMesAtual.reduce((acc, p) => {
                                if (!acc[p.forma]) acc[p.forma] = 0;
                                acc[p.forma] += p.valor;
                                return acc;
                            }, {});
                            const rankingFormaMesAtual = Object.entries(agrupadoFormaMesAtual).sort((a,b) => b[1] - a[1]);
                            const maxFormaMesAtual = Math.max(...rankingFormaMesAtual.map(f => f[1]), 1);

                            const agrupadoInstituicaoMesAtual = pagamentosExtraidosMesAtual.reduce((acc, p) => {
                                if (p.forma === 'PIX' || p.forma === 'Link de Pagamento' || p.forma === 'Boleto') {
                                    const inst = p.instituicao;
                                    if (!acc[inst]) acc[inst] = 0;
                                    acc[inst] += p.valor;
                                }
                                return acc;
                            }, {});
                            const rankingInstituicaoMesAtual = Object.entries(agrupadoInstituicaoMesAtual).sort((a,b) => b[1] - a[1]);
                            const maxInstituicaoMesAtual = Math.max(...rankingInstituicaoMesAtual.map(i => i[1]), 1);

                            const renderLayer2 = () => {
                                if (rankingLocalMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum local registrado no mês.</p>;
                                return rankingLocalMesAtual.map((loc, index) => renderBarHorizontal(loc[0], loc[1], maxLocalMesAtual, false, colorsLocal[index % colorsLocal.length]));
                            };
                            const renderLayer3 = () => {
                                if (rankingFormaMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum pagamento registrado no mês.</p>;
                                return rankingFormaMesAtual.map((f, index) => renderBarHorizontal(f[0], f[1], maxFormaMesAtual, false, colorsForma[index % colorsForma.length]));
                            };
                            const renderLayer4 = () => {
                                if (rankingInstituicaoMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhuma instituição no mês.</p>;
                                return rankingInstituicaoMesAtual.map((i, index) => renderBarHorizontal(i[0], i[1], maxInstituicaoMesAtual, false, colorsInst[index % colorsInst.length]));
                            };

                            // --- ANUAL METRICS ---
                            const agrupadoPorAno = pedidosFin.reduce((acc, p) => {
                                if (!p.data_pedido) return acc;
                                const ano = p.data_pedido.substring(0, 4);
                                if (!acc[ano]) acc[ano] = { ano, bruto: 0 };
                                acc[ano].bruto += (Number(p.valor_total) || 0);
                                return acc;
                            }, {});
                            const anosOrdenados = Object.values(agrupadoPorAno).sort((a, b) => b.ano.localeCompare(a.ano)).slice(0, 15);
                            const maxBrutoAno = Math.max(...anosOrdenados.map(a => a.bruto), 1);

                            return (
                                <>
                                    {abaFinanceiro === 'geral' && (
                                        <div className="flex flex-col gap-6 fade-in">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
                                        <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm relative overflow-hidden flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Crescimento (YoY)</span>
                                                <h2 className="text-xl font-black text-gray-900 dark:text-white">R$ {formatarValorFinanceiro(totalAnoAtual)}</h2>
                                            </div>
                                            <div className="mt-2">
                                                <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${crescimentoPercentual >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    <Icon name={crescimentoPercentual >= 0 ? 'trending-up' : 'trending-down'} className="w-3 h-3" />
                                                    {Math.abs(crescimentoPercentual).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-200 dark:border-red-900/30 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">Despesas (A Pagar)</span>
                                                <h2 className="text-2xl font-black text-red-600 dark:text-red-400">R$ {formatarValorFinanceiro(totalDespesas)}</h2>
                                            </div>
                                            <p className="text-[10px] text-red-500/70 dark:text-red-400/70 mt-2 font-medium">Gastos no período</p>
                                        </div>

                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-200 dark:border-purple-900/30 shadow-sm relative overflow-hidden flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">Vendas Hoje</span>
                                                <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400">R$ {formatarValorFinanceiro(totalVendasHoje)}</h2>
                                            </div>
                                            <p className="text-[10px] text-purple-500/70 dark:text-purple-400/70 mt-2 font-medium">Pedidos lançados hoje</p>
                                        </div>

                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Total Pago (Recebido)</span>
                                                <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {formatarValorFinanceiro(totalRecebido)}</h2>
                                            </div>
                                            <p className="text-[10px] text-emerald-500/70 dark:text-emerald-400/70 mt-2 font-medium">Já entrou no caixa</p>
                                        </div>
                                        
                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-200 dark:border-orange-900/30 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">Saldo Devedor (A Receber)</span>
                                                <h2 className="text-2xl font-black text-orange-600 dark:text-orange-400">R$ {formatarValorFinanceiro(totalAReceber)}</h2>
                                            </div>
                                            <p className="text-[10px] text-orange-500/70 dark:text-orange-400/70 mt-2 font-medium">Falta receber</p>
                                        </div>
                                        
                                        <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider block mb-1">Ticket Médio</span>
                                                <h2 className="text-2xl font-black text-blue-500">R$ {formatarValorFinanceiro(ticketMedio)}</h2>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Média por pedido</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <StackedCards 
                                            title="Visão Anual" 
                                            icon="calendar"
                                            description="Evolução e Análise (Anos)"
                                            cards={[
                                                { title: "Faturamento Histórico", content: anosOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : anosOrdenados.map(a => renderBarHorizontal(a.ano, a.bruto, maxBrutoAno, false, 'bg-blue-500')) },
                                                { title: `Local de Produção (${anoAtual})`, content: renderLayer2() },
                                                { title: `Formas de Pagamento (${anoAtual})`, content: renderLayer3() },
                                                { title: `Vendas por Instituição (${anoAtual})`, content: renderLayer4() }
                                            ]}
                                        />
                                        <StackedCards 
                                            title="Visão Mensal" 
                                            icon="layout-dashboard"
                                            description="Evolução e Análise (Meses)"
                                            cards={[
                                                { title: `Faturamento (${anoAtual})`, content: mesesOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : mesesOrdenados.map(m => renderBarHorizontal(formatarMesAno(m.mesAno), m.bruto, maxBrutoMes, false, 'bg-emerald-500')) },
                                                { title: `Local de Produção (${nomeMesAtual})`, content: renderLayer2() },
                                                { title: `Formas de Pagamento (${nomeMesAtual})`, content: renderLayer3() },
                                                { title: `Vendas por Instituição (${nomeMesAtual})`, content: renderLayer4() }
                                            ]}
                                        />
                                        <StackedCards 
                                            title="Visão Diária" 
                                            icon="list"
                                            description="Evolução e Análise (Dias)"
                                            cards={[
                                                { title: `Faturamento (${nomeMesAtual})`, content: diasOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : diasOrdenados.map(d => renderBarHorizontal(formatarDataExibicao(d.dia).substring(0,5), d.bruto, maxBrutoDia, false, 'bg-purple-500')) },
                                                { title: `Local de Produção (${diaAtual})`, content: renderLayer2() },
                                                { title: `Formas de Pagamento (${diaAtual})`, content: renderLayer3() },
                                                { title: `Vendas por Instituição (${diaAtual})`, content: renderLayer4() }
                                            ]}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Receitas por Local (Geral)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Rentabilidade total no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingLocal.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhum local registrado.</p> :
                                                    rankingLocal.map((loc, index) => renderBarHorizontal(loc[0], loc[1], maxLocal, false, colorsLocal[index % colorsLocal.length]))
                                                }
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Formas de Pagamento (Geral)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Como os clientes pagaram no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingForma.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhum pagamento registrado.</p> :
                                                    rankingForma.map((f, index) => renderBarHorizontal(f[0], f[1], maxForma, false, colorsForma[index % colorsForma.length]))
                                                }
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Instituições (Geral)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Volume por conta no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingInstituicao.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhuma instituição registrada.</p> :
                                                    rankingInstituicao.map((i, index) => renderBarHorizontal(i[0], i[1], maxInstituicao, false, colorsInst[index % colorsInst.length]))
                                                }
                                            </div>
                                        </div>

                                        </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'vendas_produto' && (
                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4 fade-in">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Vendas por Produto (Catálogo)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Visão expandida de vendas baseadas nos produtos do sistema referentes ao período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-4">
                                                {(() => {
                                                    const agrupadoPorProduto = pedidosFin.reduce((acc, p) => {
                                                        if (!p.servico) return acc;
                                                        const { itens } = desconstruirTextoServico(p.servico);
                                                        
                                                        itens.forEach(item => {
                                                            const id_produto_match = item.id_produto;
                                                            const nomeLimpo = item.nome.trim();
                                                            const valorNum = parseFloat(item.valor.replace(/\./g, '').replace(',', '.')) || 0;
                                                            
                                                            const prod = id_produto_match 
                                                                ? produtos.find(p => String(p.id) === String(id_produto_match)) 
                                                                : produtos.find(prod => prod.nome.toLowerCase() === nomeLimpo.toLowerCase());
                                                            
                                                            const finalName = prod ? prod.nome : nomeLimpo;
                                                            if (!acc[finalName]) acc[finalName] = 0;
                                                            acc[finalName] += valorNum;
                                                        });
                                                        return acc;
                                                    }, {});
                                                    
                                                    const rankingProduto = Object.entries(agrupadoPorProduto).sort((a,b) => b[1] - a[1]);
                                                    const maxProduto = Math.max(...rankingProduto.map(r => r[1]), 1);
                                                    
                                                    if (rankingProduto.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum produto do catálogo faturado no período.</p>;
                                                    
                                                    const top5Nomes = rankingProduto.slice(0, 5).map(r => r[0]);
                                                    const selecionadosAtuais = produtosSelecionadosGrafico || top5Nomes;

                                                    const mesesGrafico = [];
                                                    const dataAtualGrafico = new Date();
                                                    for (let i = 11; i >= 0; i--) {
                                                        const d = new Date(dataAtualGrafico.getFullYear(), dataAtualGrafico.getMonth() - i, 1);
                                                        const m = String(d.getMonth() + 1).padStart(2, '0');
                                                        const y = d.getFullYear();
                                                        mesesGrafico.push(`${y}-${m}`);
                                                    }

                                                    const limiteData = mesesGrafico[0] + '-01';
                                                    const dadosMesProduto = {}; 
                                                    selecionadosAtuais.forEach(prod => {
                                                        dadosMesProduto[prod] = {};
                                                        mesesGrafico.forEach(m => dadosMesProduto[prod][m] = 0);
                                                    });

                                                    pedidos.forEach(p => {
                                                        if (!p.data_pedido || p.data_pedido < limiteData) return;
                                                        if (p.status === 'Cancelado') return;
                                                        if (!p.servico) return;

                                                        const mesAno = p.data_pedido.substring(0, 7);
                                                        if (!mesesGrafico.includes(mesAno)) return;

                                                        const { itens } = desconstruirTextoServico(p.servico);
                                                        itens.forEach(item => {
                                                            const nomeLimpo = item.nome.trim();
                                                            const id_match = item.id_produto;
                                                            const prod = id_match ? produtos.find(pr => String(pr.id) === String(id_match)) : produtos.find(pr => pr.nome.toLowerCase() === nomeLimpo.toLowerCase());
                                                            const finalName = prod ? prod.nome : nomeLimpo;

                                                            if (selecionadosAtuais.includes(finalName)) {
                                                                const valorNum = parseFloat(item.valor.replace(/\./g, '').replace(',', '.')) || 0;
                                                                dadosMesProduto[finalName][mesAno] += valorNum;
                                                            }
                                                        });
                                                    });

                                                    let maxYGrafico = 1;
                                                    selecionadosAtuais.forEach(prod => {
                                                        mesesGrafico.forEach(m => {
                                                            if (dadosMesProduto[prod][m] > maxYGrafico) maxYGrafico = dadosMesProduto[prod][m];
                                                        });
                                                    });
                                                    maxYGrafico = maxYGrafico * 1.1;

                                                    const svgWidth = 1000;
                                                    const svgHeight = 250;
                                                    const padX = 70;
                                                    const padY = 20;
                                                    const stepX = (svgWidth - padX * 2) / (mesesGrafico.length - 1 || 1);
                                                    const hexColors = ["#2D3349", "#76AB3C", "#3b82f6", "#F37020", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#f43f5e", "#84cc16"];
                                                    
                                                    const renderSVG = () => (
                                                        <div className="w-full overflow-x-auto bg-white dark:bg-darkCard rounded-xl p-4 border border-gray-100 dark:border-darkBorder mb-6 relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                            {selecionadosAtuais.length > 0 ? (
                                                                <>
                                                                    <div className="flex flex-wrap gap-2 mb-6 justify-center px-4">
                                                                        {selecionadosAtuais.map((prod, i) => (
                                                                            <span key={prod} className="text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 bg-gray-50 dark:bg-darkElevated border border-gray-100 dark:border-darkBorder dark:text-gray-200">
                                                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hexColors[i % hexColors.length] }}></span>
                                                                                {prod}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[700px] overflow-visible">
                                                                        {[0, 0.25, 0.5, 0.75, 1].map(f => {
                                                                            const y = svgHeight - padY - f * (svgHeight - padY * 2);
                                                                            return (
                                                                                <g key={f}>
                                                                                    <line x1={padX} y1={y} x2={svgWidth - padX} y2={y} stroke="currentColor" className="text-gray-200/70 dark:text-gray-800/70" strokeDasharray="3 3" />
                                                                                    <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                                                                        R$ {formatarValorFinanceiro(f * (maxYGrafico / 1.1))}
                                                                                    </text>
                                                                                </g>
                                                                            )
                                                                        })}
                                                                        {mesesGrafico.map((m, i) => {
                                                                            const x = padX + i * stepX;
                                                                            const [ano, mes] = m.split('-');
                                                                            return (
                                                                                <g key={m}>
                                                                                    {i > 0 && i < mesesGrafico.length - 1 && (
                                                                                        <line x1={x} y1={padY} x2={x} y2={svgHeight - padY} stroke="currentColor" className="text-gray-200/50 dark:text-gray-800/50" strokeDasharray="2 4" />
                                                                                    )}
                                                                                    <text x={x} y={svgHeight} textAnchor="middle" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                                                                        {mes}/{ano.substring(2)}
                                                                                    </text>
                                                                                </g>
                                                                            );
                                                                        })}
                                                                        {selecionadosAtuais.map((prod, i) => {
                                                                            const color = hexColors[i % hexColors.length];
                                                                            const points = mesesGrafico.map((m, mi) => {
                                                                                const x = padX + mi * stepX;
                                                                                const val = dadosMesProduto[prod][m] || 0;
                                                                                const y = svgHeight - padY - (val / maxYGrafico) * (svgHeight - padY * 2);
                                                                                return `${x},${y}`;
                                                                            }).join(" ");
                                                                            return (
                                                                                <g key={prod}>
                                                                                    <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" className="drop-shadow-sm transition-all duration-500 ease-out" />
                                                                                    {mesesGrafico.map((m, mi) => {
                                                                                        const x = padX + mi * stepX;
                                                                                        const val = dadosMesProduto[prod][m] || 0;
                                                                                        const y = svgHeight - padY - (val / maxYGrafico) * (svgHeight - padY * 2);
                                                                                        return <circle key={m} cx={x} cy={y} r="3.5" fill="white" stroke={color} strokeWidth="2" className="transition-all duration-500 ease-out" />;
                                                                                    })}
                                                                                </g>
                                                                            );
                                                                        })}
                                                                    </svg>
                                                                </>
                                                            ) : (
                                                                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-[13px] italic font-medium">Nenhum produto selecionado para gerar o gráfico.</div>
                                                            )}
                                                        </div>
                                                    );

                                                    const toggleProduto = (nome) => {
                                                        let list = [...selecionadosAtuais];
                                                        if (list.includes(nome)) {
                                                            list = list.filter(n => n !== nome);
                                                        } else {
                                                            list.push(nome);
                                                        }
                                                        setProdutosSelecionadosGrafico(list);
                                                    };

                                                    return (
                                                        <>
                                                            {renderSVG()}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-3">
                                                                {rankingProduto.map((r, index) => {
                                                                    const isSelected = selecionadosAtuais.includes(r[0]);
                                                                    const selectedIndex = selecionadosAtuais.indexOf(r[0]);
                                                                    const colorIndicator = isSelected ? hexColors[selectedIndex % hexColors.length] : 'transparent';
                                                                    
                                                                    return (
                                                                        <div key={index} onClick={() => toggleProduto(r[0])} className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer transition border ${isSelected ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-darkHover shadow-sm' : 'border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkElevated'}`}>
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <div className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded border border-gray-300 dark:border-gray-600 transition-colors" style={{ backgroundColor: colorIndicator, borderColor: isSelected ? colorIndicator : '' }}>
                                                                                        {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
                                                                                    </div>
                                                                                    <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate" title={r[0]}>{r[0]}</div>
                                                                                </div>
                                                                                <div className="text-right text-[11px] font-black text-gray-900 dark:text-white whitespace-nowrap">R$ {formatarValorFinanceiro(r[1])}</div>
                                                                            </div>
                                                                            <div className="w-full bg-gray-200 dark:bg-darkBg rounded-full h-1.5 overflow-hidden relative">
                                                                                <div className={`h-full transition-all duration-1000 ease-out opacity-90`} style={{ width: `${(r[1] / maxProduto) * 100}%`, backgroundColor: isSelected ? colorIndicator : '#9ca3af' }}></div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'contas_pagar' && (
                                        <div className="fade-in">
                                            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                                                <div className="overflow-x-auto min-h-[300px]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                                <th className="px-6 py-4">Vencimento</th>
                                                                <th className="px-6 py-4">Descrição</th>
                                                                <th className="px-6 py-4">Valor</th>
                                                                <th className="px-6 py-4">Status</th>
                                                                <th className="px-6 py-4 text-right">Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                                            {contasPagar.filter(c => mostrarContasPagas ? true : c.status !== 'Pago').length === 0 ? (
                                                                <tr><td colSpan="5" className="text-center py-8 text-gray-400">Nenhuma conta a pagar registrada.</td></tr>
                                                            ) : (
                                                                contasPagar.filter(c => mostrarContasPagas ? true : c.status !== 'Pago').map(conta => (
                                                                    <tr key={conta.id} onClick={() => { setNovaConta(conta); setModalContaAberto(true); }} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors group cursor-pointer">
                                                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-[#A1A1AA]">{formatarDataExibicao(conta.vencimento)}</td>
                                                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-gray-300">
                                                                            {conta.descricao}
                                                                            {conta.recorrente && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Recorrente</span>}
                                                                        </td>
                                                                        <td className="px-6 py-4 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">R$ {formatarValorFinanceiro(conta.valor)}</td>
                                                                        <td className="px-6 py-4 text-[13px]">
                                                                            <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${conta.status === 'Pago' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
                                                                                {conta.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                                                            <button onClick={(e) => { e.stopPropagation(); excluirConta(conta.id); }} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Excluir Conta">
                                                                                <Icon name="trash-2" className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'contas_receber' && (
                                        <div className="fade-in">


                                            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                                                <div className="overflow-x-auto min-h-[300px]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                                <th className="px-6 py-4">O.S. / Cliente</th>
                                                                <th className="px-6 py-4">Serviço</th>
                                                                <th className="px-6 py-4 text-center">Data Pedido</th>
                                                                <th className="px-6 py-4 text-center">Status</th>
                                                                <th className="px-6 py-4">Status Pagamento</th>
                                                                <th className="px-6 py-4 text-right">Valor Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                                            {(() => {
                                                                const pedidosBoleto = pedidos.map(p => {
                                                                    const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                                                    let pagamentos = [];
                                                                    if (pagamentosStr) {
                                                                        try { pagamentos = JSON.parse(pagamentosStr); } catch(e) {}
                                                                    }
                                                                    return { ...p, pagamentos };
                                                                }).filter(p => p.pagamentos.some(pag => pag.forma === 'Boleto'));
                                                                if (pedidosBoleto.length === 0) return (
                                                                    <tr><td colSpan="6" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhum pedido com boleto encontrado.</td></tr>
                                                                );
                                                                return pedidosBoleto.map(p => {
                                                                    const totalPago = p.pagamentos.reduce((acc, pg) => acc + (parseFloat(String(pg.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                                                    const totalGeral = parseFloat(String(p.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                                                    const pagoPercent = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;
                                                                    return (
                                                                        <tr key={p.id} onClick={() => abrirEdicao(p)} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors cursor-pointer group">
                                                                            <td className="px-6 py-4">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 w-8">#{p.id}</span>
                                                                                    <span className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED] truncate max-w-[200px]" title={p.cliente}>{p.cliente}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4">
                                                                                <div className="text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-[250px]" title={p.servico}>{p.servico}</div>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-[13px] text-center text-gray-500">{formatarDataExibicao(p.data_pedido)}</td>
                                                                            <td className="px-6 py-4 text-center">
                                                                                <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${obterCorStatus(p.status)}`}>
                                                                                    {p.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-[13px]">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shrink-0"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, pagoPercent)}%` }}></div></div>
                                                                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{totalPago >= totalGeral ? 'Pago' : `${Math.floor(pagoPercent)}%`}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-[13px] font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">R$ {p.valor_total}</td>
                                                                        </tr>
                                                                    );
                                                                });
                                                            })()}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'empresas_aprovadas' && (
                                        <div className="fade-in">


                                            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                                                <div className="overflow-x-auto min-h-[300px]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                                <th className="px-6 py-4">Empresa</th>
                                                                <th className="px-6 py-4">CNPJ/CPF</th>
                                                                <th className="px-6 py-4">Observações</th>
                                                                <th className="px-6 py-4 text-center">Status</th>
                                                                <th className="px-6 py-4 text-right">Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                                            {empresasFaturamento.length === 0 ? (
                                                                <tr><td colSpan="4" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhuma empresa cadastrada.</td></tr>
                                                            ) : (
                                                                empresasFaturamento.map(emp => (
                                                                    <tr key={emp.id} onClick={() => { setNovaEmpresaFaturamento(emp); setModalEmpresaFaturamentoAberto(true); }} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors group cursor-pointer">
                                                                        <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-white">{emp.nome}</td>
                                                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{emp.cnpj}</td>
                                                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={emp.observacoes}>{emp.observacoes || '-'}</td>
                                                                        <td className="px-6 py-4 text-center">
                                                                            <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${emp.status === 'Aprovado' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
                                                                                {emp.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                                                            <button onClick={(e) => { e.stopPropagation(); excluirEmpresaFaturamento(emp.id); }} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Excluir">
                                                                                <Icon name="trash-2" className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {abaFinanceiro === 'notas_fiscais' && (
                                        <div className="fade-in">
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                            <th className="px-6 py-4 w-28">Data</th>
                                            <th className="px-6 py-4 w-48">Cliente / Razão Social</th>
                                            <th className="px-6 py-4 w-36">CPF / CNPJ</th>
                                            <th className="px-6 py-4 w-32">Tipo Nota</th>
                                            <th className="px-6 py-4 min-w-[300px]">Serviço / Valor</th>
                                            <th className="px-6 py-4 w-24 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notasFiscaisPaginadas.map(n => (
                                            <tr key={n.id} onClick={() => { 
                                                setNotaFiscalEmEdicao({
                                                    ...n,
                                                    valor_pago: n.valor_pago ? formatarMoeda((n.valor_pago * 100).toFixed(0).toString()) : ''
                                                }); 
                                                setModalNotaFiscalAberto(true); 
                                            }} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition cursor-pointer">
                                                <td className="px-4 py-3 text-[13px] dark:text-[#EDEDED] whitespace-nowrap">{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-[13px] font-semibold dark:text-[#EDEDED]">{n.cliente || 'Sem Identificação'}</div>
                                                    <div className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">{n.razao_social}</div>
                                                </td>
                                                <td className="px-4 py-3 text-[13px] dark:text-[#EDEDED] whitespace-nowrap">{n.cnpj}</td>
                                                <td className="px-4 py-3 text-[13px] font-medium text-gray-600 dark:text-gray-400">
                                                    <span className={`px-2 py-1 rounded text-[11px] font-bold ${n.tipo_nota === 'DANFE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : (n.tipo_nota === 'Serviço' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400')}`}>
                                                        {n.tipo_nota || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-[13px] dark:text-[#EDEDED]">{n.servico_feito || <span className="text-gray-400 italic">Pendente</span>}</div>
                                                    <div className="text-[11px] font-semibold text-orange-500 dark:text-orange-400">{n.valor_pago ? `R$ ${parseFloat(n.valor_pago).toFixed(2).replace('.', ',')}` : ''}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">

                                                        {!n.concluido && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                                                            <button onClick={(e) => { e.stopPropagation(); concluirNotaFiscal(n.id); }} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition" title="Concluir Nota">
                                                                <Icon name="check-circle" className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {notasFiscaisPaginadas.length === 0 && (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-[#A1A1AA]">Nenhuma nota fiscal encontrada.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {totalPaginasNotasFiscais > 1 && (
                                <div className="mt-6 flex justify-between items-center p-4 border-t border-gray-200 dark:border-darkBorder">
                                    <button onClick={() => setPaginaNotasFiscais(Math.max(1, paginaNotasFiscais - 1))} disabled={paginaNotasFiscais === 1} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Anterior</button>
                                    <span className="text-[13px] font-semibold dark:text-white">Página {paginaNotasFiscais} de {totalPaginasNotasFiscais}</span>
                                    <button onClick={() => setPaginaNotasFiscais(Math.min(totalPaginasNotasFiscais, paginaNotasFiscais + 1))} disabled={paginaNotasFiscais === totalPaginasNotasFiscais} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Próxima</button>
                                </div>
                            )}
                        </div>
                                        </div>
                )}
                                </>
                            );
                        })()}
                    </main>
                )}
{ (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro')}

        </>
    );
}
