"use client";
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';

export default function EmpresasAprovadasPanel() {
    const { empresasFaturamento, setNovaEmpresaFaturamento, setModalEmpresaFaturamentoAberto, excluirEmpresaFaturamento } = useAppContext();

    return (
        <div>


            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                <th className="px-6 py-4">Empresa</th>
                                <th className="px-6 py-4">CNPJ/CPF</th>
                                <th className="px-6 py-4">Observações</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                            {empresasFaturamento.length === 0 ? (
                                <tr><td colSpan="4" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhuma empresa cadastrada.</td></tr>
                            ) : (
                                empresasFaturamento.map(emp => (
                                    <tr key={emp.id} onClick={() => { setNovaEmpresaFaturamento(emp); setModalEmpresaFaturamentoAberto(true); }} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-white">{emp.nome}</td>
                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{emp.cnpj}</td>
                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={emp.observacoes}>{emp.observacoes || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${emp.status === 'Aprovado' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                            <Tooltip label="Excluir">
                                            <button onClick={(e) => { e.stopPropagation(); excluirEmpresaFaturamento(emp.id); }} aria-label="Excluir" className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
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
