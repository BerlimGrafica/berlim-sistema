"use client";
import React from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useClientes } from '@/context/ClientesContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { obterCorStatus, obterCorFundoStatus } from '@/lib/utils/constants';
import { formatarValorFinanceiro, formatarDataExibicao, mascararCliente, centavosParaReais } from '@/lib/utils/formatters';
import { CustomDateRangePicker } from '@/components/ui/DateRangePicker';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { SubAbas } from '@/components/ui/SubAbas';
import { BarraAcoes } from '@/components/ui/BarraAcoes';
import { resumoDoPedido } from '@/lib/utils/servico';


export default function BaixaTab() {
    const { isAdmin, isOperador, isDemo } = useSessao();
    const { abrirContextMenu, avisar } = useUi();
    const { setAbaOS, abaOS, buscaHistoricoText, setBuscaHistoricoText, dataFiltroInicio, setDataFiltroInicio, dataFiltroFim, setDataFiltroFim, pedidosHistorico, historicoCarregado, totalPedidosHistorico, itensPorPagina, paginaHistorico, setPaginaHistorico, ordenacaoHistoricoOS, setOrdenacaoHistoricoOS, abrirEdicao, imprimirOS, duplicarOS } = usePedidos();
    const { isClienteProblema } = useClientes();

    return (
        <>
            { (
                    <SubAbas
                        valor={abaOS}
                        aoMudar={setAbaOS}
                        abas={[
                            { id: 'abertas',     rotulo: 'Abertas',     icone: 'list' },
                            { id: 'concluidas',  rotulo: 'À dar Baixa', icone: 'check-circle' },
                            { id: 'finalizadas', rotulo: 'Baixadas',    icone: 'check-square' },
                            { id: 'canceladas',  rotulo: 'Canceladas',  icone: 'x-circle' },
                            { id: 'abandonadas', rotulo: 'Abandonadas', icone: 'alert-triangle' },
                        ]}
                    />
                )}
{ (
                    <main className="flex-1 p-4 lg:p-10 max-w-[1400px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Histórico de Notas</h1>
                                <p className="text-corpo text-tinta-suave mt-1">Busque ordens e filtre por período.</p>
                            </div>
                            <div className="hidden lg:flex flex-wrap items-end gap-3 w-full lg:w-auto">
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
                            {/* Uma definição de colunas, dois desenhos. O papel de cada
                                coluna decide onde ela cai no cartão do celular — ver
                                components/ui/TabelaCartoes.jsx. */}
                            <TabelaCartoes
                                itens={pedidosHistorico}
                                chave={p => p.id}
                                faixa={p => obterCorFundoStatus(p.status)}
                                carregando={!historicoCarregado && pedidosHistorico.length === 0}
                                classeDaLinha={p => (isOperador && p.status === 'Finalizado') ? 'opacity-30 bg-[#050505] cursor-not-allowed pointer-events-none' : ''}
                                aoClicar={p => { if (isOperador && p.status === 'Finalizado') return; abrirEdicao(p); }}
                                aoContextMenu={(p, e) => abrirContextMenu(e, [
                                    { label: 'Editar O.S.', icon: 'edit-3', desabilitado: isOperador && p.status === 'Finalizado', onClick: () => abrirEdicao(p) },
                                    { label: 'Duplicar O.S.', icon: 'layers', onClick: () => duplicarOS(p) },
                                    { label: 'Imprimir', icon: 'printer', onClick: () => imprimirOS(p) },
                                    { label: 'Copiar linha', icon: 'copy', onClick: () => {
                                        navigator.clipboard.writeText([`#${p.id}`, formatarDataExibicao(p.prazo || p.data_pedido), mascararCliente(p.cliente, isDemo), p.status, `R$ ${formatarValorFinanceiro(centavosParaReais(p.valor_total))}`].join('\t'));
                                        avisar('Linha copiada!', 'sucesso');
                                    }},
                                ])}
                                colunas={[
                                    {
                                        papel: 'titulo',
                                        rotuloCartao: 'O.S.',
                                        thClassName: 'px-6 py-4 w-24',
                                        tdClassName: 'px-6 py-4 text-corpo font-medium text-tinta-suave',
                                        titulo: (
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
                                        ),
                                        celula: p => (
                                            <span className="flex items-center gap-1.5">
                                                {isOperador && p.status === 'Finalizado' && <Icon name="lock" className="w-3 h-3 text-red-500" />}#{p.id}
                                            </span>
                                        ),
                                    },
                                    {
                                        papel: 'selo',
                                        titulo: 'Status',
                                        thClassName: 'px-6 py-4 w-48',
                                        celula: p => <span className={`whitespace-nowrap px-2.5 py-1 text-mini font-semibold rounded border bg-gray-50 border-gray-200 dark:bg-darkElevated dark:border-darkBorder ${obterCorStatus(p.status)}`}>{p.status}</span>,
                                    },
                                    {
                                        papel: 'destaque',
                                        titulo: 'Valor Final',
                                        thClassName: 'px-6 py-4 w-36 text-right',
                                        tdClassName: 'px-6 py-4 font-semibold text-corpo text-right text-tinta',
                                        celula: p => `R$ ${formatarValorFinanceiro(centavosParaReais(p.valor_total))}`,
                                    },
                                    {
                                        titulo: 'Cliente',
                                        tdClassName: 'px-6 py-4 text-corpo',
                                        celula: p => (
                                            <span className={`flex items-center gap-1.5 justify-end lg:justify-start font-semibold ${isClienteProblema(p.cliente, p.cliente_id) ? 'text-perigo' : 'text-tinta'}`}>
                                                {mascararCliente(p.cliente, isDemo)}
                                                {isClienteProblema(p.cliente, p.cliente_id) && <Icon name="alert-triangle" className="w-4 h-4 text-red-500 shrink-0" title="Cliente Problema" />}
                                            </span>
                                        ),
                                    },
                                    {
                                        titulo: 'Serviço (Resumo)',
                                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave truncate max-w-xs',
                                        celula: p => resumoDoPedido(p),
                                    },
                                    {
                                        titulo: 'Data',
                                        thClassName: 'px-6 py-4 w-32',
                                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave',
                                        celula: p => formatarDataExibicao(p.prazo || p.data_pedido),
                                    },
                                    isAdmin && {
                                        titulo: 'Criado Por',
                                        thClassName: 'px-6 py-4 w-32',
                                        celula: p => (
                                            <>
                                                <span className="text-corpo font-semibold text-tinta">{p.criado_por || '---'}</span>
                                                <span className="block text-mini text-gray-400 mt-0.5">{formatarDataExibicao(p.data_pedido)}</span>
                                            </>
                                        ),
                                    },
                                    {
                                        papel: 'acoes',
                                        titulo: 'Imprimir',
                                        thClassName: 'px-6 py-4 w-24 text-center',
                                        tdClassName: 'px-6 py-4 text-center',
                                        celula: p => (
                                            <Tooltip label="Imprimir O.S.">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); imprimirOS(p); }} aria-label="Imprimir O.S." className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition rounded inline-block">
                                                    <Icon name="printer" className="w-5 h-5 inline-block" />
                                                </button>
                                            </Tooltip>
                                        ),
                                    },
                                ].filter(Boolean)}
                            />
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
                        {/* Mesmos controles do topo, no rodapé fixo do celular. O ponto no ícone
                            avisa que a busca ou o período seguem valendo com o painel fechado —
                            senão a lista aparece filtrada sem nada na tela explicando. */}
                        <BarraAcoes
                            acoes={[
                                {
                                    id: 'buscar', icone: 'search', rotulo: 'Buscar',
                                    ativo: !!buscaHistoricoText,
                                    conteudo: (
                                        <div className="relative">
                                            <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                value={buscaHistoricoText}
                                                onChange={e => setBuscaHistoricoText(e.target.value)}
                                                placeholder="Buscar cliente ou O.S...."
                                                className="w-full bg-elevado border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]"
                                            />
                                            {buscaHistoricoText && (
                                                <button type="button" onClick={() => setBuscaHistoricoText('')} aria-label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition">
                                                    <Icon name="x" className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    id: 'periodo', icone: 'calendar', rotulo: 'Período',
                                    ativo: !!(dataFiltroInicio || dataFiltroFim),
                                    conteudo: (
                                        <CustomDateRangePicker
                                            startValue={dataFiltroInicio}
                                            endValue={dataFiltroFim}
                                            onChangeStart={setDataFiltroInicio}
                                            onChangeEnd={setDataFiltroFim}
                                            placeholder="Todo o período"
                                            className="w-full bg-elevado border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition"
                                        />
                                    ),
                                },
                            ]}
                        />
                    </main>
                )}

        </>
    );
}
