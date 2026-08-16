"use client";
import React from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useClientes } from '@/context/ClientesContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { obterCorStatus } from '@/lib/utils/constants';
import { formatarValorFinanceiro, formatarDataExibicao, mascararCliente, centavosParaReais } from '@/lib/utils/formatters';
import { CustomDateRangePicker } from '@/components/ui/DateRangePicker';
import { SkeletonLinhas } from '@/components/ui/SkeletonLinhas';
import { resumoDoPedido } from '@/lib/utils/servico';


export default function BaixaTab() {
    const { isAdmin, isOperador, isDemo } = useSessao();
    const { abrirContextMenu, avisar } = useUi();
    const { setAbaOS, abaOS, buscaHistoricoText, setBuscaHistoricoText, dataFiltroInicio, setDataFiltroInicio, dataFiltroFim, setDataFiltroFim, pedidosHistorico, historicoCarregado, totalPedidosHistorico, itensPorPagina, paginaHistorico, setPaginaHistorico, ordenacaoHistoricoOS, setOrdenacaoHistoricoOS, abrirEdicao, imprimirOS, duplicarOS } = usePedidos();
    const { isClienteProblema } = useClientes();

    return (
        <>
            { (
                    <div className="bg-fundo border-b border-borda px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaOS('abertas')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'abertas' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="list" className="w-4 h-4" /> Abertas</button>
                        <button onClick={() => setAbaOS('concluidas')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'concluidas' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="check-circle" className="w-4 h-4" /> À dar Baixa</button>
                        <button onClick={() => setAbaOS('finalizadas')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'finalizadas' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="check-square" className="w-4 h-4" /> Baixadas</button>
                        <button onClick={() => setAbaOS('canceladas')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'canceladas' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="x-circle" className="w-4 h-4" /> Canceladas</button>
                        <button onClick={() => setAbaOS('abandonadas')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'abandonadas' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="alert-triangle" className="w-4 h-4" /> Abandonadas</button>
                    </div>
                )}
{ (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Histórico de Notas</h1>
                                <p className="text-corpo text-tinta-suave mt-1">Busque ordens e filtre por período.</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaHistoricoText} onChange={e => setBuscaHistoricoText(e.target.value)} placeholder="Buscar cliente ou OS..." className="w-full bg-superficie border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                    {buscaHistoricoText && (
                                        <Tooltip label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                            <button type="button" onClick={() => setBuscaHistoricoText('')} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                                        </Tooltip>
                                    )}
                                </div>
                                <div className="flex flex-col w-60">
                                    <span className="text-micro font-semibold text-tinta-suave uppercase mb-1">Período:</span>
                                    <CustomDateRangePicker startValue={dataFiltroInicio} endValue={dataFiltroFim} onChangeStart={setDataFiltroInicio} onChangeEnd={setDataFiltroFim} placeholder="Todo o período" className="bg-superficie border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-superficie rounded border border-borda overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                    <tr className="border-b border-borda text-corpo font-semibold text-tinta-suave tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">
                                            <span className="inline-flex items-center">
                                                OS Nº
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setOrdenacaoHistoricoOS(prev => prev === 'asc' ? 'desc' : 'asc'); }}
                                                    className={`ml-1 p-0.5 rounded transition align-middle ${ordenacaoHistoricoOS === 'asc' ? 'text-brand' : 'text-tinta-suave hover:text-gray-700 dark:hover:text-gray-200'}`}
                                                    aria-label="Ordenar por OS Nº"
                                                >
                                                    <Icon name="chevron-down" className={`w-3.5 h-3.5 stroke-[3] transition-transform ${ordenacaoHistoricoOS === 'asc' ? 'rotate-180' : ''}`} />
                                                </button>
                                            </span>
                                        </th>
                                        {isAdmin && <th className="px-6 py-4 w-32">Criado Por</th>}
                                        <th className="px-6 py-4 w-32">Data</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Serviço (Resumo)</th>
                                        <th className="px-6 py-4 w-48">Status</th>
                                        <th className="px-6 py-4 w-36 text-right">Valor Final</th>
                                        <th className="px-6 py-4 w-24 text-center">Imprimir</th>
                                    </tr>
                                </thead>
                                <tbody key={abaOS} className="animate-fade-screen">
                                    {!historicoCarregado && pedidosHistorico.length === 0 && (
                                        <SkeletonLinhas colunas={isAdmin ? 8 : 7} />
                                    )}
                                    {pedidosHistorico.map(p => {
                                        const trancado = isOperador && p.status === 'Finalizado';
                                        return (
                                            <tr key={p.id} onClick={() => { if (trancado) return; abrirEdicao(p); }} onContextMenu={(e) => abrirContextMenu(e, [
                                                { label: 'Editar O.S.', icon: 'edit-3', desabilitado: trancado, onClick: () => abrirEdicao(p) },
                                                { label: 'Duplicar O.S.', icon: 'layers', onClick: () => duplicarOS(p) },
                                                { label: 'Imprimir', icon: 'printer', onClick: () => imprimirOS(p) },
                                                { label: 'Copiar linha', icon: 'copy', onClick: () => {
                                                    navigator.clipboard.writeText([`#${p.id}`, formatarDataExibicao(p.prazo || p.data_pedido), mascararCliente(p.cliente, isDemo), p.status, `R$ ${formatarValorFinanceiro(centavosParaReais(p.valor_total))}`].join('\t'));
                                                    avisar('Linha copiada!', 'sucesso');
                                                }},
                                            ])} className={`border-b border-gray-100 dark:border-darkBorder transition ${trancado ? 'opacity-30 bg-[#050505] cursor-not-allowed' : 'cursor-pointer hover:bg-sutil'}`}>
                                                <td className="px-6 py-4 text-corpo font-medium text-tinta-suave"><span className="flex items-center gap-1.5">{trancado && <Icon name="lock" className="w-3 h-3 text-red-500" />}#{p.id}</span></td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4">
                                                        <div className="text-corpo font-semibold text-tinta">{p.criado_por || '---'}</div>
                                                        <div className="text-mini text-gray-400 mt-0.5">{formatarDataExibicao(p.data_pedido)}</div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-corpo text-tinta-suave">{formatarDataExibicao(p.prazo || p.data_pedido)}</td>
                                                <td className={`px-6 py-4 font-semibold text-corpo ${isClienteProblema(p.cliente, p.cliente_id) ? 'text-perigo' : 'text-tinta'}`}>
                                                    <div className="flex items-center gap-1.5">{mascararCliente(p.cliente, isDemo)} {isClienteProblema(p.cliente, p.cliente_id) && <Icon name="alert-triangle" className="w-4 h-4 text-red-500 shrink-0" title="Cliente Problema" />}</div>
                                                </td>
                                                <td className="px-6 py-4 text-corpo text-tinta-suave truncate max-w-xs">{resumoDoPedido(p)}</td>
                                                <td className="px-6 py-4"><span className={`whitespace-nowrap px-2.5 py-1 text-mini font-semibold rounded border bg-gray-50 border-gray-200 dark:bg-darkElevated dark:border-darkBorder ${obterCorStatus(p.status)}`}>{p.status}</span></td>
                                                <td className="px-6 py-4 font-semibold text-corpo text-right text-tinta">R$ {formatarValorFinanceiro(centavosParaReais(p.valor_total))}</td>
                                                <td className="px-6 py-4 text-center"><Tooltip label="Imprimir O.S."><button type="button" onClick={(e) => { e.stopPropagation(); imprimirOS(p); }} aria-label="Imprimir O.S." className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition rounded inline-block"><Icon name="printer" className="w-5 h-5 inline-block" /></button></Tooltip></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {totalPedidosHistorico > itensPorPagina && (
                                <div className="flex justify-between items-center p-4 border-t border-borda bg-superficie rounded-b-xl">
                                    <span className="text-corpo text-tinta-suave">
                                        Mostrando {((paginaHistorico - 1) * itensPorPagina) + 1} a {Math.min(paginaHistorico * itensPorPagina, totalPedidosHistorico)} de {totalPedidosHistorico}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.max(1, p - 1))}
                                            disabled={paginaHistorico === 1}
                                            className="px-3 py-1 text-corpo font-medium bg-realce text-tinta-corpo rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >Anterior</button>
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.min(Math.ceil(totalPedidosHistorico / itensPorPagina), p + 1))}
                                            disabled={paginaHistorico === Math.ceil(totalPedidosHistorico / itensPorPagina)}
                                            className="px-3 py-1 text-corpo font-medium bg-realce text-tinta-corpo rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >Próxima</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                )}

        </>
    );
}
