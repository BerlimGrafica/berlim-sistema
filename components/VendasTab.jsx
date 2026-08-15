"use client";
import { useSessao } from '@/context/SessaoContext';
import { usePedidos } from '@/context/PedidosContext';
import Icon from '@/components/Icon';
import VisaoGeralPanel from '@/components/vendas/VisaoGeralPanel';
import VendasPorProdutoPanel from '@/components/vendas/VendasPorProdutoPanel';
import VendasPorClientePanel from '@/components/vendas/VendasPorClientePanel';

export default function VendasTab() {
    const { usuario } = useSessao();
    const { setAbaVendas, abaVendas } = usePedidos();

    return (
        <>
            { (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaVendas('geral')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaVendas === 'geral' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="pie-chart" className="w-4 h-4" /> Visão Geral</button>
                        <button onClick={() => setAbaVendas('vendas_produto')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaVendas === 'vendas_produto' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="tag" className="w-4 h-4" /> Vendas por Produto</button>
                        <button onClick={() => setAbaVendas('vendas_cliente')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaVendas === 'vendas_cliente' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="users" className="w-4 h-4" /> Vendas por Cliente</button>
                    </div>
                )}
{ (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {abaVendas === 'geral' ? 'Dashboard de Vendas' :
                                     abaVendas === 'vendas_produto' ? 'Vendas por Produto' :
                                     abaVendas === 'vendas_cliente' ? 'Vendas por Cliente' : ''}
                                </h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">
                                    {abaVendas === 'geral' ? 'Análise de Receitas, Centros de Custo e Performance.' :
                                     abaVendas === 'vendas_produto' ? 'Vendas detalhadas por produto do catálogo.' :
                                     abaVendas === 'vendas_cliente' ? 'Total vendido por cliente.' : ''}
                                </p>
                            </div>
                        </div>

                        <div key={abaVendas} className="animate-fade-screen">
                            {abaVendas === 'geral' && <VisaoGeralPanel />}
                            {abaVendas === 'vendas_produto' && <VendasPorProdutoPanel />}
                            {abaVendas === 'vendas_cliente' && <VendasPorClientePanel />}
                        </div>
                    </main>
                )}

        </>
    );
}
