"use client";
import React from 'react';
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import Icon from '@/components/Icon';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { useColunasNotaFiscal } from '@/components/notas/colunasNotaFiscal';
import Tooltip from '@/components/Tooltip';


export default function Notas_fiscaisTab() {
    const { notasFiscais, dadosCarregados, filtroNotas, setFiltroNotas, buscaNotaFiscal, setBuscaNotaFiscal, setPaginaNotasFiscais, notasFiscaisPaginadas, setNotaFiscalEmEdicao, setModalNotaFiscalAberto, totalPaginasNotasFiscais, paginaNotasFiscais, concluirNotaFiscal, duplicarNotaFiscal, reabrirNotaFiscal, excluirNotaFiscal } = useNotasFiscais();

    const { colunas, aoClicar, aoContextMenu } = useColunasNotaFiscal();

    // <main> sem max-w, igual à Produção: a tabela de notas tem 8 colunas e o teto
    // de 1400px deixava menos espaço que a soma das larguras mínimas delas.
    return (
        <main className="flex-1 p-6 lg:p-10 mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-borda-fraca pb-6 shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">
                        Notas Fiscais {filtroNotas === 'pendentes' ? 'Pendentes' : 'Concluídas'}
                    </h1>
                    <p className="text-corpo text-tinta-suave mt-1">
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
                            className="w-full pl-9 pr-9 py-1.5 h-[38px] text-corpo border border-borda bg-superficie rounded-md focus:outline-none focus:ring-2 focus:ring-brand dark:text-white transition"
                        />
                        {buscaNotaFiscal && (
                            <Tooltip label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <button type="button" onClick={() => { setBuscaNotaFiscal(''); setPaginaNotasFiscais(1); }} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                            </Tooltip>
                        )}
                    </div>
                    <div className="flex bg-gray-100/50 dark:bg-darkHover/50 p-1 rounded-lg border border-borda w-full lg:w-auto">
                        <button onClick={() => { setFiltroNotas('pendentes'); setPaginaNotasFiscais(1); }} className={`px-4 py-1.5 text-compacto font-semibold rounded-md transition flex items-center gap-2 ${filtroNotas === 'pendentes' ? 'bg-superficie text-brand shadow-sm border border-borda' : 'text-tinta-suave hover:text-tinta'}`}>Pendentes {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}</button>
                        <button onClick={() => { setFiltroNotas('concluidas'); setPaginaNotasFiscais(1); }} className={`px-4 py-1.5 text-compacto font-semibold rounded-md transition flex items-center gap-2 ${filtroNotas === 'concluidas' ? 'bg-superficie text-brand shadow-sm border border-borda' : 'text-tinta-suave hover:text-tinta'}`}>Concluídas</button>
                    </div>
                    <div className="flex rounded-md shadow-sm">
                        <button onClick={() => window.open('/solicitar-nota', '_blank')} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-l-md font-semibold transition flex items-center gap-2 border border-brand border-r-0">
                            <Icon name="external-link" className="w-4 h-4" /> Formulário
                        </button>
                        <Tooltip label="Copiar Link">
                            <button onClick={() => {
                                const link = window.location.origin + '/solicitar-nota';
                                navigator.clipboard.writeText(link);
                            }} aria-label="Copiar Link" className="bg-brand hover:bg-brandHover text-white h-[38px] px-3 rounded-r-md border-l border-white/20 transition flex items-center justify-center">
                                <Icon name="copy" className="w-3.5 h-3.5" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div>
                <div className="bg-superficie border border-borda rounded overflow-hidden">
                    {/* As colunas vivem em components/notas/colunasNotaFiscal.jsx: esta tela e
                        a sub-aba do Financeiro mostram exatamente a mesma listagem. */}
                    <TabelaCartoes
                        itens={notasFiscaisPaginadas}
                        chave={n => n.id}
                        colunas={colunas}
                        aoClicar={aoClicar}
                        aoContextMenu={aoContextMenu}
                        carregando={!dadosCarregados && notasFiscaisPaginadas.length === 0}
                        vazio={<span className="text-corpo text-tinta-suave">Nenhuma nota fiscal encontrada.</span>}
                    />
                    {totalPaginasNotasFiscais > 1 && (
                        <div className="mt-6 flex justify-between items-center p-4 border-t border-borda">
                            <button onClick={() => setPaginaNotasFiscais(Math.max(1, paginaNotasFiscais - 1))} disabled={paginaNotasFiscais === 1} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Anterior</button>
                            <span className="text-corpo font-semibold dark:text-white">Página {paginaNotasFiscais} de {totalPaginasNotasFiscais}</span>
                            <button onClick={() => setPaginaNotasFiscais(Math.min(totalPaginasNotasFiscais, paginaNotasFiscais + 1))} disabled={paginaNotasFiscais === totalPaginasNotasFiscais} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Próxima</button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
