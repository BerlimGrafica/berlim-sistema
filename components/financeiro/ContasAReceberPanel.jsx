"use client";
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { SkeletonLinhas } from '@/components/ui/SkeletonLinhas';
import { obterCorStatus } from '@/lib/utils/constants';
import { formatarValorFinanceiro, formatarDataExibicao, mascararCliente } from '@/lib/utils/formatters';
import { resumoDoPedido } from '@/lib/utils/servico';

export default function ContasAReceberPanel({ dataInicio, dataFim }) {
    const { isDemo } = useSessao();
    const { abrirContextMenu, avisar } = useUi();
    const { abrirEdicao, duplicarOS, imprimirOS } = usePedidos();
    const { pedidosSaldoDevedor, carregandoContasReceber } = useFinanceiro();

    const pedidosFiltrados = pedidosSaldoDevedor.filter(p => {
        if (dataInicio && (!p.data_pedido || p.data_pedido < dataInicio)) return false;
        if (dataFim && (!p.data_pedido || p.data_pedido > dataFim)) return false;
        return true;
    });

    return (
        <div>
            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                <th className="px-6 py-4">O.S.</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Serviço</th>
                                <th className="px-6 py-4 text-center">Data Pedido</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Valor Total</th>
                                <th className="px-6 py-4 text-right">Valor Pago</th>
                                <th className="px-6 py-4 text-right">Saldo Devedor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                            {carregandoContasReceber && pedidosFiltrados.length === 0 ? (
                                <SkeletonLinhas colunas={8} />
                            ) : pedidosFiltrados.length === 0 ? (
                                <tr><td colSpan="8" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhuma OS com saldo devedor encontrada.</td></tr>
                            ) : pedidosFiltrados.map(p => {
                                const itensContexto = [
                                    { label: 'Editar', icon: 'edit-3', onClick: () => abrirEdicao(p) },
                                    { label: 'Duplicar', icon: 'layers', onClick: () => duplicarOS(p) },
                                    { label: 'Imprimir', icon: 'printer', onClick: () => imprimirOS(p) },
                                    { label: 'Copiar linha', icon: 'copy', onClick: () => {
                                        const linha = [`#${p.id}`, mascararCliente(p.cliente, isDemo), formatarDataExibicao(p.data_pedido), `R$ ${formatarValorFinanceiro(p.saldo)}`].join('\t');
                                        navigator.clipboard.writeText(linha);
                                        avisar('Linha copiada!', 'sucesso');
                                    }},
                                ];
                                return (
                                    <tr key={p.id} onClick={() => abrirEdicao(p)} onContextMenu={(e) => abrirContextMenu(e, itensContexto)} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500">#{p.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED] truncate max-w-[200px] block" title={mascararCliente(p.cliente, isDemo)}>{mascararCliente(p.cliente, isDemo)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-[250px]" title={resumoDoPedido(p)}>{resumoDoPedido(p)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-center text-gray-500 dark:text-[#A1A1AA]">{formatarDataExibicao(p.data_pedido)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${obterCorStatus(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400 text-right whitespace-nowrap">R$ {formatarValorFinanceiro(p.totalReais)}</td>
                                        <td className="px-6 py-4 text-[13px] text-emerald-600 dark:text-emerald-400 text-right whitespace-nowrap">R$ {formatarValorFinanceiro(p.totalPago)}</td>
                                        <td className="px-6 py-4 text-[13px] font-bold text-red-600 dark:text-red-400 text-right whitespace-nowrap">R$ {formatarValorFinanceiro(p.saldo)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
