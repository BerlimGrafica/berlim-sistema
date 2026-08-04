"use client";
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { obterCorStatus } from '@/lib/utils/constants';
import { formatarValorFinanceiro, formatarDataExibicao, centavosParaReais, obterDataAtual, mascararCliente } from '@/lib/utils/formatters';
import { obterResumoServicos } from '@/lib/utils/servico';
import { CustomDatePicker } from '@/components/ui/DatePicker';

export default function ContasAReceberPanel({ dataInicio, dataFim }) {
    const { pedidos, isDemo, atualizarCampoInline, concluirBoletoContasReceber, abrirEdicao } = useAppContext();

    return (
        <div>


            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                <th className="px-6 py-4">O.S. / Cliente</th>
                                <th className="px-6 py-4">Serviço</th>
                                <th className="px-6 py-4 text-center">Data Pedido</th>
                                <th className="px-6 py-4 text-center">Prazo</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Status Pagamento</th>
                                <th className="px-6 py-4 text-right">Valor Total</th>
                                <th className="px-6 py-4 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                            {(() => {
                                const hojeStr = obterDataAtual();
                                const amanha = new Date();
                                amanha.setDate(amanha.getDate() + 1);
                                const amanhaStr = amanha.getFullYear() + '-' + String(amanha.getMonth() + 1).padStart(2, '0') + '-' + String(amanha.getDate()).padStart(2, '0');

                                const pedidosBoleto = pedidos.map(p => {
                                    const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                    let pagamentos = [];
                                    if (pagamentosStr) {
                                        try { pagamentos = JSON.parse(pagamentosStr); } catch(e) {}
                                    }
                                    return { ...p, pagamentos };
                                }).filter(p => p.pagamentos.some(pag => pag.forma === 'Boleto' && !pag.boleto_concluido))
                                  .filter(p => {
                                    if (dataInicio && (!p.prazo_pagamento || p.prazo_pagamento < dataInicio)) return false;
                                    if (dataFim && (!p.prazo_pagamento || p.prazo_pagamento > dataFim)) return false;
                                    return true;
                                  });
                                if (pedidosBoleto.length === 0) return (
                                    <tr><td colSpan="8" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhum pedido com boleto encontrado.</td></tr>
                                );
                                return pedidosBoleto.map(p => {
                                    let statusPagamento = 'Aberto';
                                    let statusPagamentoCor = 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-darkElevated dark:text-gray-300 dark:border-darkBorder';
                                    if (p.prazo_pagamento === hojeStr || p.prazo_pagamento < hojeStr) {
                                        statusPagamento = 'Vencido';
                                        statusPagamentoCor = 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
                                    } else if (p.prazo_pagamento === amanhaStr) {
                                        statusPagamento = 'Vence amanhã';
                                        statusPagamentoCor = 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
                                    }
                                    return (
                                        <tr key={p.id} onClick={() => abrirEdicao(p)} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 w-8">#{p.id}</span>
                                                    <span className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED] truncate max-w-[200px]" title={mascararCliente(p.cliente, isDemo)}>{mascararCliente(p.cliente, isDemo)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-[250px]" title={obterResumoServicos(p.servico)}>{obterResumoServicos(p.servico)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-center text-gray-500 dark:text-[#A1A1AA]">{formatarDataExibicao(p.data_pedido)}</td>
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <CustomDatePicker value={p.prazo_pagamento || ''} onChange={val => atualizarCampoInline(p.id, 'prazo_pagamento', val)} placeholder="Definir prazo..." className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-[11px] outline-none hover:border-brand transition text-gray-700 dark:text-[#EDEDED]" />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${obterCorStatus(p.status)}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${statusPagamentoCor}`}>
                                                    {statusPagamento}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">R$ {formatarValorFinanceiro(centavosParaReais(p.valor_total))}</td>
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <Tooltip label="Concluir Boleto">
                                                    <button
                                                        type="button"
                                                        aria-label="Concluir Boleto"
                                                        onClick={() => {
                                                            if (window.confirm(`Marcar o boleto da O.S. #${p.id} como concluído? Ele sairá desta lista.`)) {
                                                                concluirBoletoContasReceber(p.id);
                                                            }
                                                        }}
                                                        className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition"
                                                    >
                                                        <Icon name="check-circle" className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
