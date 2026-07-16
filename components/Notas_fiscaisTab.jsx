"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { formatarMoeda } from '@/lib/utils';


export default function Notas_fiscaisTab() {
    const { notasFiscais, usuario, filtroNotas, setFiltroNotas, buscaNotaFiscal, setBuscaNotaFiscal, setPaginaNotasFiscais, notasFiscaisPaginadas, setNotaFiscalEmEdicao, setModalNotaFiscalAberto, totalPaginasNotasFiscais, paginaNotasFiscais, concluirNotaFiscal, reabrirNotaFiscal } = useAppContext();

    return (
        <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Notas Fiscais {filtroNotas === 'pendentes' ? 'Pendentes' : 'Concluídas'}
                    </h1>
                    <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">
                        {filtroNotas === 'pendentes' ? 'Notas enviadas pelos clientes aguardando processamento.' : 'Histórico de notas já emitidas e processadas.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
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
                    <div className="flex bg-gray-100/50 dark:bg-darkHover/50 p-1 rounded-lg border border-gray-200 dark:border-darkBorder w-full lg:w-auto">
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
                </div>
            </div>

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
                                                {n.concluido && (
                                                    <button onClick={(e) => { e.stopPropagation(); reabrirNotaFiscal(n); }} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition" title="Gerar Nova Nota (Duplicar)">
                                                        <Icon name="rotate-ccw" className="w-4 h-4" />
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
        </main>
    );
}
