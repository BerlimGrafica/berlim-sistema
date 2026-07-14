"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';


export default function DashboardTab() {
    const { usuario, pedidos, alertasNaoLidos, setAbaAtual, setBuscaProducaoText } = useAppContext();

    return (
        <>
            { (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in flex flex-col gap-8">
                        
                        {/* HERO SECTION */}
                        <div className="relative rounded-md overflow-hidden bg-gradient-to-r from-brand to-brandHover text-white p-8 lg:p-10 shadow-lg shadow-brand/20 border border-white/10 shrink-0">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaDJWMzRoLTI2djIwaDJWMzRoMjB2MjBoMnYtMjBoLTI2di0yaDI2di0yMGgydjIwaC0yNlYxMGgydjIwaDIwVjEwaDJ2MjBoLTI2em0tMjYtMnYtMmgyNnYyaC0yNnptMC00VjEwaDJ2MThoLTI2em0yNiAwaC0yNnYtMmg4YTIgMiAwIDAgMSA0IDBoMTR2MnptLTI2IDEydjIwaDJ2LTIwaC0yNnptMjYgMHYyMGgydi0yMGgtMjZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 drop-shadow-sm">Olá, {usuario?.nome?.split(' ')[0]}!</h1>
                                    <p className="text-white/80 font-medium text-[15px]">Aqui está o seu resumo de tarefas e atividades do dia.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-md px-5 py-3 flex items-center gap-3 shadow-inner">
                                    <Icon name="calendar" className="w-5 h-5 text-white/90" />
                                    <div className="flex flex-col">
                                        <span className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Hoje</span>
                                        <span className="text-[14px] font-bold text-white leading-tight">
                                            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* METRICS & ALERTS ROW */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                            
                            {/* KPIs */}
                            {(() => {
                                const statusIgnorados = ['Concluída', 'Finalizada', 'Cancelada', 'Abandonada'];
                                const minhasTarefas = pedidos.filter(p => p.responsavel && p.responsavel.toLowerCase().includes(usuario?.nome?.toLowerCase()) && !statusIgnorados.includes(p.status));
                                const tarefasAtrasadas = minhasTarefas.filter(p => {
                                    if(!p.prazo) return false;
                                    const prazo = new Date(p.prazo + 'T23:59:59');
                                    return prazo < new Date();
                                });

                                return (
                                    <>
                                        <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between hover:shadow-lg transition hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-gray-500 dark:text-[#888888] font-bold text-[11px] uppercase tracking-wider mb-1">Minhas Tarefas</h3>
                                                    <p className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight">{minhasTarefas.length}</p>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-md border border-blue-100 dark:border-blue-500/20">
                                                    <Icon name="layout-dashboard" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Tarefas em andamento designadas a você.</p>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between hover:shadow-lg transition hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-gray-500 dark:text-[#888888] font-bold text-[11px] uppercase tracking-wider mb-1">Atrasadas</h3>
                                                    <p className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{tarefasAtrasadas.length}</p>
                                                </div>
                                                <div className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-md border border-rose-100 dark:border-rose-500/20">
                                                    <Icon name="clock" className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                                </div>
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Ordens de serviço com prazo vencido.</p>
                                        </div>
                                    </>
                                );
                            })()}

                            {/* ALERTS WALL */}
                            <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md p-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none flex flex-col overflow-hidden hover:shadow-lg transition lg:col-span-1 row-span-2 relative">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder bg-gray-50/50 dark:bg-darkHover/30 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-[13px] uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Icon name="bell" className="w-4 h-4 text-brand" /> Mural de Avisos
                                    </h3>
                                    {alertasNaoLidos.length > 0 && (
                                        <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">{alertasNaoLidos.length}</span>
                                    )}
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-[250px]">
                                    {alertasNaoLidos.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                            <Icon name="check-circle" className="w-10 h-10 mb-2 text-emerald-500" />
                                            <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">Nenhum aviso pendente.</p>
                                        </div>
                                    ) : (
                                        alertasNaoLidos.map((alerta, idx) => (
                                            <div key={idx} className="bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 flex gap-3 items-start shadow-sm hover:shadow-md hover:bg-rose-50 dark:hover:bg-rose-500/20 transition cursor-pointer backdrop-blur-sm" onClick={() => {
                                                setAbaAtual('producao');
                                                if (alerta.os_id) {
                                                    setBuscaProducaoText(alerta.os_id.toString());
                                                }
                                            }}>
                                                <div className="bg-rose-500/20 p-2 rounded-lg shrink-0 mt-0.5">
                                                    <Icon name="alert-triangle" className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-snug">{alerta.msg}</p>
                                                    <span className="text-[10px] font-bold text-rose-500 mt-1.5 inline-block uppercase tracking-wider hover:underline">Ver Detalhes &rarr;</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* MINHAS TAREFAS LIST */}
                            <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none lg:col-span-2 overflow-hidden flex flex-col hover:shadow-lg transition">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder bg-gray-50/50 dark:bg-darkHover/30 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-[13px] uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Icon name="list" className="w-4 h-4 text-brand" /> Fila de Produção
                                    </h3>
                                    <button onClick={() => setAbaAtual('producao')} className="text-[11px] font-bold text-brand hover:text-brandHover uppercase tracking-wider transition">
                                        Ver Todas &rarr;
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                            <tr className="border-b border-gray-100 dark:border-darkBorder text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                <th className="px-6 py-4">O.S.</th>
                                                <th className="px-6 py-4">Cliente</th>
                                                <th className="px-6 py-4">Serviço</th>
                                                <th className="px-6 py-4">Prazo</th>
                                                <th className="px-6 py-4 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const statusIgnorados = ['Concluída', 'Finalizada', 'Cancelada', 'Abandonada'];
                                                const minhasTarefas = pedidos.filter(p => p.responsavel && p.responsavel.toLowerCase().includes(usuario?.nome?.toLowerCase()) && !statusIgnorados.includes(p.status)).slice(0, 5);

                                                if (minhasTarefas.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                                <div className="flex flex-col items-center justify-center opacity-70">
                                                                    <Icon name="package" className="w-10 h-10 mb-3 text-gray-400" />
                                                                    <p className="text-gray-500 dark:text-gray-400 text-[14px] font-semibold">Oba! Você não tem tarefas pendentes.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return minhasTarefas.map(t => (
                                                    <tr key={t.id} className="border-b border-gray-50 dark:border-darkBorder/50 hover:bg-gray-50/80 dark:hover:bg-darkHover/80 transition group">
                                                        <td className="px-6 py-4 text-[13px] font-bold text-gray-900 dark:text-gray-200">#{t.id}</td>
                                                        <td className="px-6 py-4 text-[13px] font-semibold text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{t.cliente}</td>
                                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-600 dark:text-gray-400 max-w-[250px] truncate">{obterResumoServicos(t.servico)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[11px] font-bold px-2.5 py-1.5 bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-darkBorder shadow-sm">
                                                                {t.prazo ? t.prazo.split('-').reverse().join('/') : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => abrirModalOS(t)} className="opacity-0 group-hover:opacity-100 transition p-2 bg-brand hover:bg-brandHover text-white rounded-md shadow-sm" title="Abrir OS">
                                                                <Icon name="edit-3" className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </main>
                )}

        </>
    );
}
