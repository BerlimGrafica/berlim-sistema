"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';


export default function BaixaTab() {
    const { setAbaOS, abaOS, buscaHistoricoText, setBuscaHistoricoText, dataFiltroInicio, setDataFiltroInicio, dataFiltroFim, setDataFiltroFim, isAdmin, pedidosHistorico, isOperador, isClienteProblema, totalPedidosHistorico, itensPorPagina, paginaHistorico, setPaginaHistorico, abrirEdicao, imprimirOS } = useAppContext();

    return (
        <>
            { (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaOS('abertas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'abertas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="list" className="w-4 h-4" /> Abertas</button>
                        <button onClick={() => setAbaOS('concluidas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'concluidas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-circle" className="w-4 h-4" /> Concluídas</button>
                        <button onClick={() => setAbaOS('finalizadas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'finalizadas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-square" className="w-4 h-4" /> Finalizadas</button>
                        <button onClick={() => setAbaOS('canceladas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'canceladas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="x-circle" className="w-4 h-4" /> Canceladas</button>
                        <button onClick={() => setAbaOS('abandonadas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'abandonadas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="alert-triangle" className="w-4 h-4" /> Abandonadas</button>
                    </div>
                )}
{ (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Histórico de Notas</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Busque ordens e filtre por período.</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaHistoricoText} onChange={e => setBuscaHistoricoText(e.target.value)} placeholder="Buscar cliente ou OS..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-9 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                    {buscaHistoricoText && (
                                        <Tooltip label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                            <button type="button" onClick={() => setBuscaHistoricoText('')} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                                        </Tooltip>
                                    )}
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">De:</span>
                                    <CustomDatePicker value={dataFiltroInicio} onChange={setDataFiltroInicio} placeholder="Início" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">Até:</span>
                                    <CustomDatePicker value={dataFiltroFim} onChange={setDataFiltroFim} placeholder="Fim" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
                                </div>
                                {(dataFiltroInicio || dataFiltroFim || buscaHistoricoText) && (
                                    <Tooltip label="Limpar Filtros">
                                        <button type="button" onClick={() => { setDataFiltroInicio(''); setDataFiltroFim(''); setBuscaHistoricoText(''); }} aria-label="Limpar Filtros" className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand"><Icon name="x" className="w-4 h-4" /></button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard rounded border border-gray-200 dark:border-darkBorder overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">OS Nº</th>
                                        {isAdmin && <th className="px-6 py-4 w-32">Criado Por</th>}
                                        <th className="px-6 py-4 w-32">Data</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Serviço (Resumo)</th>
                                        <th className="px-6 py-4 w-48">Status</th>
                                        <th className="px-6 py-4 w-36 text-right">Valor Final</th>
                                        <th className="px-6 py-4 w-24 text-center">Imprimir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosHistorico.map(p => {
                                        const trancado = isOperador && p.status === 'Finalizado';
                                        return (
                                            <tr key={p.id} onClick={() => { if (trancado) return; abrirEdicao(p); }} className={`border-b border-gray-100 dark:border-darkBorder transition ${trancado ? 'opacity-30 bg-[#050505] cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-darkHover'}`}>
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-500"><span className="flex items-center gap-1.5">{trancado && <Icon name="lock" className="w-3 h-3 text-red-500" />}#{p.id}</span></td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4">
                                                        <div className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED]">{p.criado_por || '---'}</div>
                                                        <div className="text-[11px] text-gray-400 mt-0.5">{formatarDataExibicao(p.data_pedido)}</div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-[#A1A1AA]">{formatarDataExibicao(p.prazo || p.data_pedido)}</td>
                                                <td className={`px-6 py-4 font-semibold text-[13px] ${isClienteProblema(p.cliente) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-[#EDEDED]'}`}>
                                                    <div className="flex items-center gap-1.5">{p.cliente} {isClienteProblema(p.cliente) && <Icon name="alert-triangle" className="w-4 h-4 text-red-500 shrink-0" title="Cliente Problema" />}</div>
                                                </td>
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-[#A1A1AA] truncate max-w-xs">{obterResumoServicos(p.servico)}</td>
                                                <td className="px-6 py-4"><span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border bg-gray-50 border-gray-200 dark:bg-darkElevated dark:border-darkBorder ${obterCorStatus(p.status)}`}>{p.status}</span></td>
                                                <td className="px-6 py-4 font-semibold text-[13px] text-right text-gray-900 dark:text-[#EDEDED]">R$ {formatarValorFinanceiro(Number(p.valor_total))}</td>
                                                <td className="px-6 py-4 text-center"><Tooltip label="Imprimir O.S."><button type="button" onClick={(e) => { e.stopPropagation(); imprimirOS(p); }} aria-label="Imprimir O.S." className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition rounded inline-block"><Icon name="printer" className="w-5 h-5 inline-block" /></button></Tooltip></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {totalPedidosHistorico > itensPorPagina && (
                                <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard rounded-b-xl">
                                    <span className="text-[13px] text-gray-500">
                                        Mostrando {((paginaHistorico - 1) * itensPorPagina) + 1} a {Math.min(paginaHistorico * itensPorPagina, totalPedidosHistorico)} de {totalPedidosHistorico}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.max(1, p - 1))}
                                            disabled={paginaHistorico === 1}
                                            className="px-3 py-1 text-[13px] font-medium bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >Anterior</button>
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.min(Math.ceil(totalPedidosHistorico / itensPorPagina), p + 1))}
                                            disabled={paginaHistorico === Math.ceil(totalPedidosHistorico / itensPorPagina)}
                                            className="px-3 py-1 text-[13px] font-medium bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
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
