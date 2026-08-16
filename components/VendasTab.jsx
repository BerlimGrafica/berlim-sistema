"use client";
import { useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { usePedidos } from '@/context/PedidosContext';
import Icon from '@/components/Icon';
import VisaoGeralPanel from '@/components/vendas/VisaoGeralPanel';
import VendasPorProdutoPanel from '@/components/vendas/VendasPorProdutoPanel';
import VendasPorClientePanel from '@/components/vendas/VendasPorClientePanel';
import SeletorPeriodo, { periodoPadrao, rotuloPeriodo } from '@/components/vendas/SeletorPeriodo';
import { useMetricasVendas } from '@/hooks/useMetricasVendas';

const ABAS = {
    geral: { titulo: 'Dashboard de Vendas', descricao: 'Análise de receitas, centros de custo e desempenho.' },
    vendas_produto: { titulo: 'Vendas por Produto', descricao: 'Vendas detalhadas por produto do catálogo.' },
    vendas_cliente: { titulo: 'Vendas por Cliente', descricao: 'Total vendido por cliente.' },
};

export default function VendasTab() {
    const { usuario } = useSessao();
    const { setAbaVendas, abaVendas, triggerRealtime } = usePedidos();
    const [periodo, setPeriodo] = useState(periodoPadrao);

    // Uma única chamada alimenta os três painéis: eles só exibem.
    const { metricas, carregando, erro } = useMetricasVendas(periodo.inicio, periodo.fim, triggerRealtime);

    const podeVer = usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro';
    const aba = ABAS[abaVendas] || ABAS.geral;

    return (
        <>
            <div className="bg-fundo border-b border-borda px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                {[
                    ['geral', 'Visão Geral', 'pie-chart'], ['vendas_produto', 'Vendas por Produto', 'tag'], ['vendas_cliente', 'Vendas por Cliente', 'users'],
                ].map(([chave, rotulo, icone]) => (
                    <button
                        key={chave}
                        onClick={() => setAbaVendas(chave)}
                        className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaVendas === chave
                            ? 'border-brand text-brand'
                            : 'border-transparent text-tinta-suave hover:text-tinta'}`}
                    >
                        <Icon name={icone} className="w-4 h-4" /> {rotulo}
                    </button>
                ))}
            </div>

            {podeVer && (
                <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-borda-fraca pb-6 shrink-0">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">{aba.titulo}</h1>
                            <p className="text-corpo text-tinta-suave mt-1">{aba.descricao}</p>
                        </div>
                        <SeletorPeriodo
                            inicio={periodo.inicio}
                            fim={periodo.fim}
                            carregando={carregando}
                            onChange={(inicio, fim) => setPeriodo({ inicio, fim })}
                        />
                    </div>

                    {erro && (
                        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-4 py-3">
                            <Icon name="alert-triangle" className="w-4 h-4 text-perigo shrink-0 mt-0.5" />
                            <div>
                                <p className="text-corpo font-semibold text-red-700 dark:text-red-300">Não foi possível somar os números do período.</p>
                                <p className="text-mini text-red-600/80 dark:text-red-400/80 mt-0.5">{erro}</p>
                            </div>
                        </div>
                    )}

                    {!metricas ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Icon name="pie-chart" className="w-8 h-8 text-gray-300 dark:text-darkBorder animate-pulse" />
                            <p className="text-corpo font-semibold text-gray-400">Somando o período no banco…</p>
                        </div>
                    ) : (
                        <div key={abaVendas} className="animate-fade-screen">
                            {abaVendas === 'geral' && (
                                <VisaoGeralPanel metricas={metricas} rotulo={rotuloPeriodo(periodo.inicio, periodo.fim)} />
                            )}
                            {abaVendas === 'vendas_produto' && <VendasPorProdutoPanel metricas={metricas} />}
                            {abaVendas === 'vendas_cliente' && <VendasPorClientePanel metricas={metricas} />}
                        </div>
                    )}
                </main>
            )}
        </>
    );
}
