"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';


export default function ProducaoTab() {
    const { buscaProducaoText, setBuscaProducaoText, setPedidoEmEdicao, setModalAberto, pedidosProducaoAtivos, isClienteProblema, opcoesStatusPermitidas } = useAppContext();

    return (
        <>
            { (
                    <main className="flex-1 p-6 lg:p-10 mx-auto w-full fade-in flex flex-col h-[calc(100vh-60px)]">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Produção</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie a esteira de pedidos ativos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaProducaoText} onChange={e => setBuscaProducaoText(e.target.value)} placeholder="Pesquisar por cliente, OS ou responsável..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                {buscaProducaoText && (
                                    <button type="button" onClick={() => setBuscaProducaoText('')} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand" title="Limpar Busca"><Icon name="x" className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => { setPedidoEmEdicao(null); setModalAberto(true); }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2"><Icon name="plus" /> Nova O.S.</button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white dark:bg-darkCard rounded border border-gray-200 dark:border-darkBorder overflow-hidden flex flex-col">
                            <div className="overflow-auto custom-scrollbar flex-1">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead className="sticky top-0 z-10 bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase text-center">
                                            <th className="px-6 py-4 w-24">ID</th>
                                            <th className="px-6 py-4 w-32">Prazo</th>
                                            <th className="px-6 py-4 w-32">Resp.</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4 w-full min-w-[300px] text-left">Serviço</th>
                                            <th className="px-6 py-4 w-32">Ações</th>
                                            <th className="px-6 py-4 w-40">Status</th>
                                            <th className="px-6 py-4 w-32">Local</th>
                                            <th className="px-6 py-4 w-24 text-right">Concluir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidosProducaoAtivos.length === 0 ? (
                                            <tr><td colSpan="9" className="p-8 text-center text-gray-500 italic">Nenhuma OS encontrada.</td></tr>
                                        ) : (
                                            STATUSES_PRODUCAO.map(status => {
                                                const pedidosDoStatus = pedidosProducaoAtivos
                                                    .filter(p => p.status === status)
                                                    .sort((a, b) => {
                                                        if (!a.prazo) return 1;
                                                        if (!b.prazo) return -1;
                                                        return a.prazo.localeCompare(b.prazo);
                                                    });

                                                if (pedidosDoStatus.length === 0) return null;

                                                return (
                                                    <React.Fragment key={status}>
                                                        <tr className="bg-gray-50/50 dark:bg-darkElevated/40 select-none">
                                                            <td colSpan="9" className={`px-4 py-2 border-y border-gray-200 dark:border-darkBorder font-semibold tracking-wide uppercase text-[10px] bg-gray-100/50 dark:bg-darkHover/40 ${obterCorStatus(status)}`}>
                                                                {status} — <span className="text-gray-400 dark:text-gray-500">{pedidosDoStatus.length} {pedidosDoStatus.length === 1 ? 'pedido' : 'pedidos'}</span>
                                                            </td>
                                                        </tr>
                                                        {pedidosDoStatus.map(p => (
                                                            <tr key={p.id} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition group text-[13px]">
                                                                <td className="px-4 py-3 font-medium text-gray-400 dark:text-gray-600 text-center"><button type="button" onClick={() => abrirEdicao(p)} className="hover:text-brand transition">#{p.id}</button></td>
                                                                <td className="px-4 py-3"><CustomDatePicker value={p.prazo || ''} onChange={val => atualizarCampoInline(p.id, 'prazo', val)} placeholder="Definir prazo..." className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-[11px] outline-none hover:border-brand transition text-gray-700 dark:text-[#EDEDED]" /></td>
                                                                <td className="px-4 py-3"><MultiSelectDropdown value={p.responsavel} options={RESPONSAVEIS} onChange={(val) => atualizarCampoInline(p.id, 'responsavel', val)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-[11px] outline-none hover:border-brand" /></td>
                                                                <td className={`px-4 py-3 font-semibold truncate max-w-[12rem] ${isClienteProblema(p.cliente) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                                    <div className="flex items-center gap-1.5">{p.cliente} {isClienteProblema(p.cliente) && <Icon name="alert-triangle" className="w-3.5 h-3.5 text-red-500 shrink-0" title="Cliente Problema" />}</div>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-800 dark:text-white font-medium"><ItensChecklist pedido={p} atualizarCampoInline={atualizarCampoInline} /></td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button type="button" onClick={() => atualizarCampoInline(p.id, 'aprovado', !p.aprovado)} className={`p-2 rounded transition ${p.aprovado ? 'text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700' : 'text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`} title="Arte Aprovada">
                                                                            <Icon name="thumbs-up" className="w-4 h-4" />
                                                                        </button>
                                                                        <button type="button" onClick={() => atualizarCampoInline(p.id, 'entrega', !p.entrega)} className={`p-2 rounded transition ${p.entrega ? 'text-white bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700' : 'text-gray-300 dark:text-gray-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30'}`} title="Pronto para Entrega">
                                                                            <Icon name="package" className="w-4 h-4" />
                                                                        </button>
                                                                        <button type="button" onClick={() => atualizarCampoInline(p.id, 'urgente', !p.urgente)} className={`p-2 rounded transition ${p.urgente ? 'text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700' : 'text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`} title="Urgente">
                                                                            <Icon name="alert-triangle" className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3"><InlineDropdown value={p.status} options={opcoesStatusPermitidas} onChange={(val) => atualizarCampoInline(p.id, 'status', val)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-[11px] outline-none hover:border-brand" /></td>
                                                                <td className="px-4 py-3 align-middle">
                                                                    <div className="flex items-center justify-center min-h-[32px]">
                                                                        <span className="text-[11px] font-semibold px-2 py-1 bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-[#EDEDED] rounded border border-gray-200 dark:border-darkBorder truncate max-w-[150px] inline-block" title={p.local_producao || 'Berlim'}>{p.local_producao || 'Berlim'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <button type="button" onClick={() => atualizarCampoInline(p.id, 'status', 'Concluído')} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition rounded inline-block" title="Marcar como Concluído">
                                                                        <Icon name="check-circle" className="w-5 h-5 inline-block" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                )}

        </>
    );
}
