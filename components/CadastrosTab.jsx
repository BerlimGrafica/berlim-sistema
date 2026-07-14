"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';


export default function CadastrosTab() {
    const { usuario, setAbaCadastros, abaCadastros, isAdmin, abaAtual, buscaCadClientes, setBuscaCadClientes, setNovoCliente, setModalClienteAberto, setLetraFiltroCliente, setPaginaClientes, letraFiltroCliente, clientesPaginados, totalPaginasClientes, paginaClientes } = useAppContext();

    return (
        <>
            { (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Produção/Atendimento') && (
                            <a onClick={() => setAbaCadastros('clientes')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'clientes' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                <Icon name="users" className="w-4 h-4" /> Clientes
                            </a>
                        )}
                        {isAdmin && (
                            <>
                                <a onClick={() => setAbaCadastros('produtos')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'produtos' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="package" className="w-4 h-4" /> Catálogo
                                </a>
                                <a onClick={() => setAbaCadastros('fornecedores')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'fornecedores' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="truck" className="w-4 h-4" /> Fornecedores / Locais
                                </a>
                                <a onClick={() => setAbaCadastros('usuarios')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'usuarios' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="user" className="w-4 h-4" /> Usuários
                                </a>
                            </>
                        )}
                    </div>
                )}
{abaAtual === 'cadastros' && abaCadastros === 'produtos' && isAdmin}
{abaAtual === 'cadastros' && abaCadastros === 'produtos'}
{ abaCadastros === 'clientes' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Clientes</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Base de dados e informações de contato dos seus clientes.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaCadClientes} onChange={e => setBuscaCadClientes(e.target.value)} placeholder="Buscar cliente..." className="w-56 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                <button onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Cliente
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-darkBorder flex flex-wrap gap-1.5 items-center justify-center sm:justify-start">
                                <button onClick={() => { setLetraFiltroCliente(''); setPaginaClientes(1); }} className={`px-2 py-1 text-[11px] font-semibold rounded border ${!letraFiltroCliente ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-darkCard text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover'}`}>Todas</button>
                                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letra => (
                                    <button key={letra} onClick={() => { setLetraFiltroCliente(letra); setPaginaClientes(1); }} className={`px-2 py-1 text-[11px] font-semibold rounded border ${letraFiltroCliente === letra ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-darkCard text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover'}`}>{letra}</button>
                                ))}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand"><tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"><th className="px-6 py-4">Cliente</th><th className="px-6 py-4 w-48">WhatsApp</th><th className="px-6 py-4 w-64">E-mail</th><th className="px-6 py-4">Observações</th><th className="px-6 py-4 w-24 text-center">Ações</th></tr></thead>
                                <tbody>
                                    {clientesPaginados.length > 0 ? clientesPaginados.map(c => (
                                        <tr key={c.id} onClick={() => abrirEdicaoCliente(c)} className="border-b border-gray-100 dark:border-darkBorder/50 hover:bg-gray-50/50 dark:hover:bg-darkHover/50 transition cursor-pointer"><td className={`px-6 py-4 text-[13px] font-semibold ${c.cliente_problema ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-300'}`}>{c.nome} {c.cliente_problema && <Icon name="alert-triangle" className="w-3.5 h-3.5 inline text-red-500 ml-1" title="Cliente Problema" />}</td><td className="px-6 py-4 text-[13px] font-medium text-gray-800 dark:text-white">{c.telefone || '---'}</td><td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{c.email || '---'}</td><td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-xs">{c.observacoes || '---'}</td><td className="px-6 py-4 text-center"><button type="button" onClick={(e) => { e.stopPropagation(); if(confirm(`Excluir o cliente ${c.nome}?`)) { supabase.from('clientes').delete().eq('id', c.id).then(() => carregarDados()); } }} className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30" title="Excluir Cliente"><Icon name="trash-2" className="w-4 h-4" /></button></td></tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-[#A1A1AA]">Nenhum cliente encontrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPaginasClientes > 1 && (
                            <div className="mt-6 flex justify-between items-center p-4">
                                <button onClick={() => setPaginaClientes(Math.max(1, paginaClientes - 1))} disabled={paginaClientes === 1} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Anterior</button>
                                <span className="text-[13px] font-semibold dark:text-white">Página {paginaClientes} de {totalPaginasClientes}</span>
                                <button onClick={() => setPaginaClientes(Math.min(totalPaginasClientes, paginaClientes + 1))} disabled={paginaClientes === totalPaginasClientes} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Próxima</button>
                            </div>
                        )}
                    </main>
                )}
{abaAtual === 'cadastros' && abaCadastros === 'clientes'}
{abaAtual === 'cadastros' && abaCadastros === 'usuarios' && isAdmin}
{abaAtual === 'cadastros' && abaCadastros === 'usuarios'}
{abaAtual === 'cadastros' && abaCadastros === 'fornecedores' && isAdmin}
{abaAtual === 'cadastros' && abaCadastros === 'fornecedores'}

        </>
    );
}
