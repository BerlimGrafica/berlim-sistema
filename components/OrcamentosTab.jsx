"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';


export default function OrcamentosTab() {
    const { setAbaOrcamentos, abaOrcamentos, setOrcamentoFormalizadoEmEdicao, setBuscaCliente, setItensPedido, setNovoPedido, setModalOrcamentoFormalizadoAberto, orcamentosFormalizados, abaAtual, isAdmin, setNovoOrcamentoPre, setModalOrcamentoPreAberto, orcamentosPreProntos, abrirEdicaoOrcamento, transformarEmOS, baixarPDFOrcamento, excluirOrcamentoFormalizado, excluirOrcamentoPre } = useAppContext();

    return (
        <>
            { (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <a onClick={() => setAbaOrcamentos('formalizados')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaOrcamentos === 'formalizados' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> Formalizados
                        </a>
                        <a onClick={() => setAbaOrcamentos('pre_prontos')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaOrcamentos === 'pre_prontos' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> Pré Prontos
                        </a>
                    </div>
                )}
{ abaOrcamentos === 'formalizados' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Orçamentos Formalizados</h1>
                                <p className="text-[13px] text-gray-500 mt-1.5 font-medium max-w-xl">
                                    Crie e gerencie orçamentos. Transforme orçamentos aprovados em Ordens de Serviço.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setOrcamentoFormalizadoEmEdicao(null);
                                    setBuscaCliente('');
                                    setItensPedido([]);
                                    setNovoPedido({
                                        cliente: '',
                                        servico: '',
                                        valor_total: '',
                                        status: 'Orçamento',
                                        data_pedido: obterDataAtual(),
                                        prazo: '',
                                        responsavel: '',
                                        entrega: false,
                                        urgente: false
                                    });
                                    setModalOrcamentoFormalizadoAberto(true);
                                }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" /> Novo Orçamento
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="overflow-x-auto min-h-[300px]">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Criado por</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Valor</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                        {orcamentosFormalizados.map(orc => (
                                            <tr key={orc.id} onClick={() => abrirEdicaoOrcamento(orc)} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-gray-300">#{orc.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED]">{orc.criado_por || '---'}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">{new Date(orc.created_at).toLocaleDateString('pt-BR')}</div>
                                                </td>
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-gray-300">{orc.cliente}</td>
                                                <td className="px-6 py-4 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">R$ {formatarMoeda((orc.valor * 100).toFixed(0).toString())}</td>
                                                <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); transformarEmOS(orc); }} className="px-3 py-1.5 text-[11px] font-bold bg-orange-500 hover:bg-orange-600 text-white rounded transition flex items-center gap-1.5 shadow-sm" title="Transformar em O.S.">
                                                        <Icon name="arrow-right-circle" className="w-3.5 h-3.5" />
                                                        Transformar em O.S.
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); baixarPDFOrcamento(orc); }} className="p-2 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded transition inline-block" title="Imprimir Orçamento">
                                                        <Icon name="printer" className="w-5 h-5 inline-block" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); abrirEdicaoOrcamento(orc); }} className="p-2 text-gray-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-darkHover rounded transition opacity-0 group-hover:opacity-100" title="Editar">
                                                        <Icon name="edit-2" className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); excluirOrcamentoFormalizado(orc.id); }} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition inline-block" title="Excluir">
                                                        <Icon name="trash-2" className="w-5 h-5 inline-block" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {orcamentosFormalizados.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhum orçamento formalizado encontrado.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                )}
{abaAtual === 'orcamentos' && abaOrcamentos === 'formalizados'}
{ abaOrcamentos === 'pre_prontos' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Textos Pré Prontos</h1>
                                <p className="text-[13px] text-gray-500 mt-1.5 font-medium max-w-xl">
                                    Modelos de texto para orçamentos rápidos (Visíveis para a produção, editáveis apenas por Admin).
                                </p>
                            </div>
                            {isAdmin && (
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        setNovoOrcamentoPre({ id: null, titulo: '', texto: '' });
                                        setModalOrcamentoPreAberto(true);
                                    }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                        <Icon name="plus" /> Novo Texto
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orcamentosPreProntos.map(orc => (
                                <div key={orc.id} className="bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-5 flex flex-col gap-3 group">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{orc.titulo}</h3>
                                        {isAdmin && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setNovoOrcamentoPre(orc); setModalOrcamentoPreAberto(true); }} className="p-1 text-gray-400 hover:text-brand"><Icon name="edit-2" className="w-4 h-4" /></button>
                                                <button onClick={() => excluirOrcamentoPre(orc.id)} className="p-1 text-gray-400 hover:text-red-500"><Icon name="trash-2" className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                    <pre className="text-[13px] text-gray-600 dark:text-[#A1A1AA] whitespace-pre-wrap font-sans bg-gray-50 dark:bg-darkElevated p-3 rounded-lg flex-1">
                                        {orc.texto}
                                    </pre>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(orc.texto);
                                        alert('Texto copiado!');
                                    }} className="mt-2 text-[11px] font-semibold text-brand hover:underline flex items-center gap-1 self-start">
                                        <Icon name="copy" className="w-3 h-3" /> Copiar Texto
                                    </button>
                                </div>
                            ))}
                        </div>
                    </main>
                )}
{abaAtual === 'orcamentos' && abaOrcamentos === 'pre_prontos'}

        </>
    );
}
