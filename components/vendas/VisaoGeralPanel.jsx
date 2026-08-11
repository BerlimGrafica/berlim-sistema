"use client";
import { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarValorFinanceiro, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils/formatters';
import { StackedCards } from '@/components/StackedCards';
import { BarRow } from '@/components/vendas/BarRow';
import { useFinanceiroMetrics } from '@/components/vendas/useFinanceiroMetrics';

export default function VisaoGeralPanel() {
    const { pedidos, contasPagar } = useAppContext();
    const [slidePainelAtivo, setSlidePainelAtivo] = useState(0);
    const painelScrollRef = useRef(null);
    const scrollToSlidePainel = (i) => {
        const el = painelScrollRef.current;
        if (!el) return;
        el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
        setSlidePainelAtivo(i);
    };
    const handlePainelScroll = () => {
        const el = painelScrollRef.current;
        if (!el || !el.clientWidth) return;
        setSlidePainelAtivo(Math.round(el.scrollLeft / el.clientWidth));
    };

    const {
        totalAnoAtual, crescimentoPercentual, totalVendasHoje, totalAReceber, ticketMedio,
        totalDespesasMesAtual, totalRecebidoMesAtual, totalBrutoMesAtual,
        anosOrdenados, maxBrutoAno, anoAtual, mesesOrdenados, maxBrutoMes, nomeMesAtual, diasOrdenados, maxBrutoDia, diaAtual,
        renderLayer2, renderLayer3, renderLayer4,
        rankingLocal, maxLocal, totalRankingLocal, colorsLocal,
        rankingForma, maxForma, totalRankingForma, colorsForma,
        rankingInstituicao, maxInstituicao, totalRankingInstituicao, colorsInst,
        rankingCategoriaDespesa, maxCategoriaDespesa, totalCategoriaDespesa, coresCategoriaDespesa,
        totalContasPendentes, totalContasPagas, qtdContasVencidas, maxStatusDespesa, totalStatusDespesa,
        maioresContas, maxMaiorConta, parseValorConta,
    } = useFinanceiroMetrics(pedidos, contasPagar);

    // "R$" sempre em cima, número embaixo — e o número encolhe se for ficar
    // largo demais pro card, em vez de quebrar linha no meio do valor.
    const tamanhoNumero = (valorFormatado) => {
        if (valorFormatado.length > 12) return 'text-sm';
        if (valorFormatado.length > 9) return 'text-base';
        return 'text-lg';
    };

    return (
        <div className="flex flex-col gap-8">

            {/* RESUMO DO PERÍODO */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-brand rounded-full"></span>
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Resumo do Período</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-4">
                    <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Crescimento (YoY)</span>
                                <span className="block text-lg font-black text-gray-900 dark:text-white leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(totalAnoAtual))} font-black text-gray-900 dark:text-white leading-tight`}>{formatarValorFinanceiro(totalAnoAtual)}</h2>
                            </div>
                            <div className={`p-2 rounded-lg shrink-0 ${crescimentoPercentual >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                                <Icon name={crescimentoPercentual >= 0 ? 'trending-up' : 'trending-down'} className={`w-4 h-4 ${crescimentoPercentual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                            </div>
                        </div>
                        <p className={`text-[11px] font-bold mt-3 ${crescimentoPercentual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {crescimentoPercentual >= 0 ? '+' : '-'}{Math.abs(crescimentoPercentual).toFixed(1)}% vs. ano anterior
                        </p>
                    </div>

                    <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Despesas (A Pagar)</span>
                                <span className="block text-lg font-black text-red-600 dark:text-red-400 leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(totalDespesasMesAtual))} font-black text-red-600 dark:text-red-400 leading-tight`}>{formatarValorFinanceiro(totalDespesasMesAtual)}</h2>
                            </div>
                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 shrink-0"><Icon name="dollar-sign" className="w-4 h-4 text-red-600 dark:text-red-400" /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3 font-medium">{nomeMesAtual}</p>
                    </div>

                    <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Recebido</span>
                                <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(totalRecebidoMesAtual))} font-black text-emerald-600 dark:text-emerald-400 leading-tight`}>{formatarValorFinanceiro(totalRecebidoMesAtual)}</h2>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0"><Icon name="check-circle" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3 font-medium">{nomeMesAtual}</p>
                    </div>

                    <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Bruto</span>
                                <span className="block text-lg font-black text-cyan-600 dark:text-cyan-400 leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(totalBrutoMesAtual))} font-black text-cyan-600 dark:text-cyan-400 leading-tight`}>{formatarValorFinanceiro(totalBrutoMesAtual)}</h2>
                            </div>
                            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 shrink-0"><Icon name="dollar-sign" className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3 font-medium">{nomeMesAtual}</p>
                    </div>

                    <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Vendas Hoje</span>
                                <span className="block text-lg font-black text-purple-600 dark:text-purple-400 leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(totalVendasHoje))} font-black text-purple-600 dark:text-purple-400 leading-tight`}>{formatarValorFinanceiro(totalVendasHoje)}</h2>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 shrink-0"><Icon name="calendar" className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3 font-medium">{formatarDataExibicao(obterDataAtual())}</p>
                    </div>

                    <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Saldo Devedor</span>
                                <span className="block text-lg font-black text-orange-600 dark:text-orange-400 leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(totalAReceber))} font-black text-orange-600 dark:text-orange-400 leading-tight`}>{formatarValorFinanceiro(totalAReceber)}</h2>
                            </div>
                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 shrink-0"><Icon name="clock" className="w-4 h-4 text-orange-600 dark:text-orange-400" /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3 font-medium">Falta receber</p>
                    </div>

                    <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Ticket Médio</span>
                                <span className="block text-lg font-black text-blue-600 dark:text-blue-400 leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(ticketMedio))} font-black text-blue-600 dark:text-blue-400 leading-tight`}>{formatarValorFinanceiro(ticketMedio)}</h2>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0"><Icon name="tag" className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-3 font-medium">Média por pedido</p>
                    </div>
                </div>
            </div>

            {/* PAINEL COM ROLAGEM LATERAL: ANÁLISE / DISTRIBUIÇÃO / DESPESAS */}
            <div>
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="w-1 h-4 bg-brand rounded-full"></span>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {['Análise por Período', 'Distribuição no Período', 'Despesas'][slidePainelAtivo]}
                        </h2>
                        <span className="text-[10px] text-gray-400 font-medium normal-case">
                            {slidePainelAtivo === 0 ? 'clique nos cards para alternar as camadas' : slidePainelAtivo === 2 ? 'contas a pagar' : 'como o faturamento se distribuiu'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            {[0, 1, 2].map(i => (
                                <Tooltip key={i} label={['Análise por Período', 'Distribuição no Período', 'Despesas'][i]}>
                                    <button onClick={() => scrollToSlidePainel(i)} aria-label={['Análise por Período', 'Distribuição no Período', 'Despesas'][i]} className={`h-1.5 rounded-full transition-all ${slidePainelAtivo === i ? 'w-5 bg-brand' : 'w-1.5 bg-gray-300 dark:bg-darkBorder hover:bg-gray-400'}`}></button>
                                </Tooltip>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => scrollToSlidePainel(Math.max(0, slidePainelAtivo - 1))} disabled={slidePainelAtivo === 0} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 dark:border-darkBorder text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-30 disabled:cursor-not-allowed transition"><Icon name="chevron-left" className="w-4 h-4" /></button>
                            <button onClick={() => scrollToSlidePainel(Math.min(2, slidePainelAtivo + 1))} disabled={slidePainelAtivo === 2} className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 dark:border-darkBorder text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-30 disabled:cursor-not-allowed transition"><Icon name="chevron-right" className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                <div ref={painelScrollRef} onScroll={handlePainelScroll} className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar-style">

                    {/* SLIDE 1: ANÁLISE POR PERÍODO */}
                    <div className="w-full shrink-0 snap-start pr-1">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <StackedCards
                                title="Visão Anual"
                                icon="calendar"
                                description="Evolução e Análise (Anos)"
                                cards={[
                                    { title: "Faturamento Histórico", content: anosOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : <div className="flex flex-col gap-3">{anosOrdenados.map((a, index) => <BarRow key={a.ano} label={a.ano} valor={a.bruto} maxVal={maxBrutoAno} color="bg-blue-500" rank={index + 1} />)}</div> },
                                    { title: `Local de Produção (${anoAtual})`, content: renderLayer2() },
                                    { title: `Formas de Pagamento (${anoAtual})`, content: renderLayer3() },
                                    { title: `Vendas por Instituição (${anoAtual})`, content: renderLayer4() }
                                ]}
                            />
                            <StackedCards
                                title="Visão Mensal"
                                icon="layout-dashboard"
                                description="Evolução e Análise (Meses)"
                                cards={[
                                    { title: `Faturamento (${anoAtual})`, content: mesesOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : <div className="flex flex-col gap-3">{mesesOrdenados.map((m, index) => <BarRow key={m.mesAno} label={formatarMesAno(m.mesAno)} valor={m.bruto} maxVal={maxBrutoMes} color="bg-emerald-500" rank={index + 1} />)}</div> },
                                    { title: `Local de Produção (${nomeMesAtual})`, content: renderLayer2() },
                                    { title: `Formas de Pagamento (${nomeMesAtual})`, content: renderLayer3() },
                                    { title: `Vendas por Instituição (${nomeMesAtual})`, content: renderLayer4() }
                                ]}
                            />
                            <StackedCards
                                title="Visão Diária"
                                icon="list"
                                description="Evolução e Análise (Dias)"
                                cards={[
                                    { title: `Faturamento (${nomeMesAtual})`, content: diasOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : <div className="flex flex-col gap-3">{diasOrdenados.map((d, index) => <BarRow key={d.dia} label={formatarDataExibicao(d.dia).substring(0,5)} valor={d.bruto} maxVal={maxBrutoDia} color="bg-purple-500" rank={index + 1} />)}</div> },
                                    { title: `Local de Produção (${diaAtual})`, content: renderLayer2() },
                                    { title: `Formas de Pagamento (${diaAtual})`, content: renderLayer3() },
                                    { title: `Vendas por Instituição (${diaAtual})`, content: renderLayer4() }
                                ]}
                            />
                        </div>
                    </div>

                    {/* SLIDE 2: DISTRIBUIÇÃO NO PERÍODO */}
                    <div className="w-full shrink-0 snap-start px-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col">
                                <div className="rounded-t-xl px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-3 shrink-0">
                                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-500/10 shrink-0"><Icon name="map-pin" className="w-4 h-4 text-teal-600 dark:text-teal-400" /></div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[13px] text-gray-800 dark:text-white truncate">Receitas por Local</h3>
                                        <p className="text-[11px] text-gray-400 truncate">Rentabilidade por local</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-72 custom-scrollbar">
                                    {rankingLocal.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhum local registrado.</p> :
                                        rankingLocal.map((loc, index) => <BarRow key={loc[0]} label={loc[0]} valor={loc[1]} maxVal={maxLocal} color={colorsLocal[index % colorsLocal.length]} rank={index + 1} pctTotal={totalRankingLocal > 0 ? (loc[1] / totalRankingLocal) * 100 : 0} />)
                                    }
                                </div>
                            </div>

                            <div className="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col">
                                <div className="rounded-t-xl px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-3 shrink-0">
                                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 shrink-0"><Icon name="dollar-sign" className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[13px] text-gray-800 dark:text-white truncate">Formas de Pagamento</h3>
                                        <p className="text-[11px] text-gray-400 truncate">Como os clientes pagaram</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-72 custom-scrollbar">
                                    {rankingForma.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhum pagamento registrado.</p> :
                                        rankingForma.map((f, index) => <BarRow key={f[0]} label={f[0]} valor={f[1]} maxVal={maxForma} color={colorsForma[index % colorsForma.length]} rank={index + 1} pctTotal={totalRankingForma > 0 ? (f[1] / totalRankingForma) * 100 : 0} />)
                                    }
                                </div>
                            </div>

                            <div className="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col">
                                <div className="rounded-t-xl px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-3 shrink-0">
                                    <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 shrink-0"><Icon name="link" className="w-4 h-4 text-sky-600 dark:text-sky-400" /></div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[13px] text-gray-800 dark:text-white truncate">Instituições</h3>
                                        <p className="text-[11px] text-gray-400 truncate">Volume por conta (PIX, Boleto e Link)</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-72 custom-scrollbar">
                                    {rankingInstituicao.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhuma instituição registrada.</p> :
                                        rankingInstituicao.map((i, index) => <BarRow key={i[0]} label={i[0]} valor={i[1]} maxVal={maxInstituicao} color={colorsInst[index % colorsInst.length]} rank={index + 1} pctTotal={totalRankingInstituicao > 0 ? (i[1] / totalRankingInstituicao) * 100 : 0} />)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SLIDE 3: DESPESAS (CONTAS A PAGAR) */}
                    <div className="w-full shrink-0 snap-start pl-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col">
                                <div className="rounded-t-xl px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-3 shrink-0">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-500/10 shrink-0"><Icon name="tag" className="w-4 h-4 text-gray-600 dark:text-gray-400" /></div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[13px] text-gray-800 dark:text-white truncate">Despesas por Categoria</h3>
                                        <p className="text-[11px] text-gray-400 truncate">Despesa, Manutenção e Terceirização</p>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto max-h-72 custom-scrollbar">
                                    {rankingCategoriaDespesa.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhuma conta registrada.</p> :
                                        rankingCategoriaDespesa.map((cat, index) => <BarRow key={cat[0]} label={cat[0]} valor={cat[1]} maxVal={maxCategoriaDespesa} color={coresCategoriaDespesa[cat[0]] || 'bg-gray-500'} rank={index + 1} pctTotal={totalCategoriaDespesa > 0 ? (cat[1] / totalCategoriaDespesa) * 100 : 0} />)
                                    }
                                </div>
                            </div>

                            <div className="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col">
                                <div className="rounded-t-xl px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-3 shrink-0">
                                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 shrink-0"><Icon name="check-circle" className="w-4 h-4 text-rose-600 dark:text-rose-400" /></div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[13px] text-gray-800 dark:text-white truncate">Status das Contas</h3>
                                        <p className="text-[11px] text-gray-400 truncate">{qtdContasVencidas > 0 ? `${qtdContasVencidas} conta(s) vencida(s)` : 'Nenhuma conta vencida'}</p>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto max-h-72 custom-scrollbar">
                                    {totalStatusDespesa === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhuma conta registrada.</p> : <>
                                        <BarRow label="Pendente" valor={totalContasPendentes} maxVal={maxStatusDespesa} color="bg-red-500" pctTotal={totalStatusDespesa > 0 ? (totalContasPendentes / totalStatusDespesa) * 100 : 0} />
                                        <BarRow label="Pago" valor={totalContasPagas} maxVal={maxStatusDespesa} color="bg-emerald-500" pctTotal={totalStatusDespesa > 0 ? (totalContasPagas / totalStatusDespesa) * 100 : 0} />
                                    </>}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col">
                                <div className="rounded-t-xl px-5 py-4 border-b border-gray-100 dark:border-darkBorder flex items-center gap-3 shrink-0">
                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 shrink-0"><Icon name="trending-up" className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[13px] text-gray-800 dark:text-white truncate">Maiores Contas</h3>
                                        <p className="text-[11px] text-gray-400 truncate">Top despesas</p>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto max-h-72 custom-scrollbar">
                                    {maioresContas.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhuma conta registrada.</p> :
                                        maioresContas.map((c, index) => <BarRow key={c.id} label={c.descricao} valor={parseValorConta(c)} maxVal={maxMaiorConta} color={c.status === 'Pago' ? 'bg-emerald-500' : (c.vencimento && c.vencimento < obterDataAtual() ? 'bg-red-500' : 'bg-amber-500')} rank={index + 1} />)
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
