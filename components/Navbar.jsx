"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import Icon from "@/components/Icon";
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

export default function Navbar() {
    const { setModalAlertasAberto, modalAlertasAberto, alertasNaoLidos, setAlertasNaoLidos, setAbaAtual, pedidos, abrirEdicao, toggleDarkMode, darkMode, usuario, setUsuario, abaAtual } = useAppContext();

    return (
        <>
            <header className="sticky top-0 z-40 bg-white dark:bg-darkBg px-6 h-[64px] flex justify-between items-center">
                    <div className="flex items-center">
                        <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-8 object-contain" />
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <button onClick={() => setModalAlertasAberto(!modalAlertasAberto)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition text-gray-600 dark:text-[#888888] relative">
                                <Icon name="bell" className="w-5 h-5" />
                                {alertasNaoLidos.length > 0 && (
                                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                                        {alertasNaoLidos.length}
                                    </span>
                                )}
                            </button>
                            {modalAlertasAberto && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded-lg shadow-lg py-2 z-50 fade-in">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center">
                                        <h3 className="font-semibold text-[13px] dark:text-white">Notificações</h3>
                                        {alertasNaoLidos.length > 0 && (
                                            <button onClick={() => setAlertasNaoLidos([])} className="text-[11px] text-brand hover:underline">Limpar</button>
                                        )}
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {alertasNaoLidos.length === 0 ? (
                                            <p className="px-4 py-4 text-[11px] text-gray-500 text-center">Nenhuma nova notificação.</p>
                                        ) : (
                                            alertasNaoLidos.slice().reverse().map(alerta => (
                                                <div key={alerta.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-darkHover border-b border-gray-50 dark:border-darkBorder/50 last:border-0 cursor-pointer flex justify-between items-start group" onClick={() => {
                                                    setModalAlertasAberto(false);
                                                    setAbaAtual('producao');
                                                    if (alerta.os_id) {
                                                        const p = pedidos.find(x => x.id === alerta.os_id);
                                                        if (p) abrirEdicao(p);
                                                    }
                                                }}>
                                                    <div className="flex-1 pr-2">
                                                        <p className="text-[11px] text-gray-800 dark:text-[#EDEDED]">{alerta.msg}</p>
                                                        <span className="text-[10px] text-gray-400 mt-1 block">Agora</span>
                                                    </div>
                                                    <button type="button" onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setAlertasNaoLidos(prev => prev.filter(a => a.id !== alerta.id)); 
                                                    }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition p-1">
                                                        <Icon name="x" className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition text-gray-600 dark:text-[#888888]">
                            <Icon name={darkMode ? "sun" : "moon"} className="w-5 h-5" />
                        </button>
                        
                        {/* SEPARADOR ATALHOS */}
                        <div className="hidden sm:block w-[1px] h-8 bg-gray-200 dark:border-darkBorder"></div>

                        <div className="flex items-center gap-1.5">
                            {/* LINK FUTURA IM */}
                            <a href="https://www.futuraim.com.br/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition flex items-center justify-center" title="Acessar Futura IM">
                                <img src="https://www.google.com/s2/favicons?domain=futuraim.com.br&sz=64" alt="Futura IM" className="w-5 h-5 object-contain rounded-sm" />
                            </a>
                            
                            {/* LINK ATUAL CARD */}
                            <a href="https://oferta.atualcard.com.br/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition flex items-center justify-center" title="Acessar Atual Card">
                                <img src="https://www.google.com/s2/favicons?domain=atualcard.com.br&sz=64" alt="Atual Card" className="w-5 h-5 object-contain rounded-sm" />
                            </a>
                            
                            {/* LINK ALVO PRINT */}
                            <a href="https://www.alvoprint.com.br/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition flex items-center justify-center" title="Acessar Alvo Print">
                                <img src="https://www.google.com/s2/favicons?domain=alvoprint.com.br&sz=64" alt="Alvo Print" className="w-5 h-5 object-contain rounded-sm" />
                            </a>
                        </div>

                        {/* SEPARADOR VERTICAL DE ELEGÂNCIA */}
                        <div className="hidden sm:block w-[1px] h-8 bg-gray-200 dark:border-darkBorder"></div>

                        {/* BLOCO DO USUÁRIO ATUALIZADO */}
                        <div className="flex items-center gap-4 select-none">
                            <div className="flex flex-col text-right">
                                <span className="text-[13px] font-extrabold text-gray-900 dark:text-white leading-none">
                                    {usuario?.nome}
                                </span>
                                <span className="text-[11px] font-medium text-brand italic mt-1 tracking-wide">
                                    {usuario?.nivel}
                                </span>
                            </div>
                            <button type="button" onClick={() => setUsuario(null)} className="text-gray-400 hover:text-red-500 transition p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30" title="Sair do Sistema">
                                <Icon name="log-out" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>
            <nav className="bg-brand text-white px-6 shadow-sm z-30 sticky top-[64px] h-[48px]">
                    <div className="flex gap-1 overflow-x-auto custom-scrollbar no-scrollbar-style items-end pt-2 h-full">
                        <a onClick={() => setAbaAtual('dashboard')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'dashboard' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                            Início
                        </a>
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Produção/Atendimento') && (
                            <a onClick={() => setAbaAtual('producao')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'producao' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Produção
                            </a>
                        )}
                        <a onClick={() => setAbaAtual('baixa')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'baixa' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                            O.S.
                        </a>
                        {usuario?.nivel !== 'Financeiro' && (
                            <a onClick={() => setAbaAtual('calculadoras')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'calculadoras' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Calculadoras
                            </a>
                        )}
                        
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                            <a onClick={() => setAbaAtual('financeiro')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'financeiro' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Financeiro
                            </a>
                        )}
                        


                        {usuario?.nivel !== 'Financeiro' && (
                            <a onClick={() => setAbaAtual('orcamentos')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'orcamentos' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Orçamentos
                            </a>
                        )}
                        
                        {usuario?.nivel !== 'Financeiro' && (
                            <a onClick={() => setAbaAtual('cadastros')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'cadastros' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Cadastros
                            </a>
                        )}
                        <a onClick={() => setAbaAtual('comunicacao')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'comunicacao' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                            Comunicação
                        </a>
                    </div>
                </nav>
        </>
    );
}
