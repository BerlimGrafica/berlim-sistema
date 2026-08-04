"use client";
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarMoeda, formatarValorFinanceiro, formatarDataExibicao, centavosParaReais } from '@/lib/utils/formatters';

export default function ContasAPagarPanel({ mostrarContasPagas }) {
    const { contasPagar, setNovaConta, setModalContaAberto, concluirConta, excluirConta } = useAppContext();

    return (
        <div>
            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                            {contasPagar.filter(c => mostrarContasPagas ? true : c.status !== 'Pago').length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-400">Nenhuma conta a pagar registrada.</td></tr>
                            ) : (
                                contasPagar.filter(c => mostrarContasPagas ? true : c.status !== 'Pago').map(conta => (
                                    <tr key={conta.id} onClick={() => { setNovaConta({...conta, valor: conta.valor ? formatarMoeda(Math.round(conta.valor).toString()) : ''}); setModalContaAberto(true); }} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-[#A1A1AA]">{formatarDataExibicao(conta.vencimento)}</td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-gray-300">
                                            {conta.descricao}
                                            {conta.recorrente && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Recorrente</span>}
                                        </td>
                                        <td className="px-6 py-4 text-[13px]">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${
                                                conta.categoria === 'Manutenção' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                conta.categoria === 'Terceirização' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                conta.categoria === 'Material' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                                                'bg-gray-100 text-gray-600 dark:bg-darkElevated dark:text-gray-300'
                                            }`}>
                                                <Icon name={conta.categoria === 'Manutenção' ? 'wrench' : conta.categoria === 'Terceirização' ? 'package' : conta.categoria === 'Material' ? 'shopping-bag' : 'dollar-sign'} className="w-3 h-3" />
                                                {conta.categoria || 'Despesa'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">R$ {formatarValorFinanceiro(centavosParaReais(conta.valor))}</td>
                                        <td className="px-6 py-4 text-[13px]">
                                            <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${conta.status === 'Pago' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
                                                {conta.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                            {conta.status !== 'Pago' && (
                                                <Tooltip label="Marcar como Pago">
                                                <button onClick={(e) => { e.stopPropagation(); concluirConta(conta.id); }} aria-label="Marcar como Pago" className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded">
                                                    <Icon name="check-circle" className="w-4 h-4" />
                                                </button>
                                                </Tooltip>
                                            )}
                                            <Tooltip label="Excluir Conta">
                                                <button onClick={(e) => { e.stopPropagation(); excluirConta(conta.id); }} aria-label="Excluir Conta" className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                                    <Icon name="trash-2" className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
