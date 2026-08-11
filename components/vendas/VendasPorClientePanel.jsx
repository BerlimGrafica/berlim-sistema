"use client";
import { useAppContext } from '@/context/AppContext';
import { formatarValorFinanceiro, mascararCliente } from '@/lib/utils/formatters';
import { useFinanceiroMetrics } from '@/components/vendas/useFinanceiroMetrics';

export default function VendasPorClientePanel() {
    const { pedidos, contasPagar, isDemo } = useAppContext();
    const { pedidosFin, valorTotalPedido } = useFinanceiroMetrics(pedidos, contasPagar);

    const agrupadoPorCliente = pedidosFin.reduce((acc, p) => {
        const nome = p.cliente || '---';
        if (!acc[nome]) acc[nome] = { cliente: nome, total: 0, qtd: 0 };
        acc[nome].total += valorTotalPedido(p);
        acc[nome].qtd += 1;
        return acc;
    }, {});
    const rankingCliente = Object.values(agrupadoPorCliente).sort((a, b) => b.total - a.total);

    return (
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                        <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                            <th className="px-6 py-4 w-12">#</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4 text-center">Qtd. OS</th>
                            <th className="px-6 py-4 text-right">Ticket Médio</th>
                            <th className="px-6 py-4 text-right">Total Vendido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                        {rankingCliente.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhuma venda no período.</td></tr>
                        ) : rankingCliente.map((c, index) => (
                            <tr key={c.cliente} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors">
                                <td className="px-6 py-4 text-[12px] font-bold text-gray-400 dark:text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED] truncate max-w-[240px]" title={mascararCliente(c.cliente, isDemo)}>{mascararCliente(c.cliente, isDemo)}</td>
                                <td className="px-6 py-4 text-[13px] text-center text-gray-500 dark:text-[#A1A1AA]">{c.qtd}</td>
                                <td className="px-6 py-4 text-[13px] text-gray-500 dark:text-[#A1A1AA] text-right whitespace-nowrap">R$ {formatarValorFinanceiro(c.total / c.qtd)}</td>
                                <td className="px-6 py-4 text-[13px] font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">R$ {formatarValorFinanceiro(c.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
