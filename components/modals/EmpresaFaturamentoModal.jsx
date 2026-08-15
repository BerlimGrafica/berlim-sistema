"use client";
import { useFinanceiro } from "@/context/FinanceiroContext";
import Icon from "@/components/Icon";
import { formatarCnpjCpf } from '@/lib/utils/formatters';
import { CustomSelect } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function EmpresaFaturamentoModal() {
    const { modalEmpresaFaturamentoAberto, setModalEmpresaFaturamentoAberto, novaEmpresaFaturamento, setNovaEmpresaFaturamento, salvandoEmpresa, salvarEmpresaFaturamento } = useFinanceiro();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalEmpresaFaturamentoAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalEmpresaFaturamentoAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div onClick={(e) => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder animate-modal-in">
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                    <h3 className="font-semibold text-lg tracking-tight">{novaEmpresaFaturamento.id ? 'Editar Empresa' : 'Adicionar Empresa'}</h3>
                    <button onClick={() => setModalEmpresaFaturamentoAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" /></button>
                </div>
                <form onSubmit={salvarEmpresaFaturamento} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Nome da Empresa</label>
                            <input type="text" required value={novaEmpresaFaturamento.nome} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, nome: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="Razão Social ou Fantasia" />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">CNPJ/CPF</label>
                            <input type="text" required value={novaEmpresaFaturamento.cnpj} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, cnpj: formatarCnpjCpf(e.target.value)})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="00.000.000/0000-00" />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status</label>
                            <CustomSelect
                                value={novaEmpresaFaturamento.status}
                                onChange={(val) => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, status: val})}
                                className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow cursor-pointer"
                                options={[
                                    { value: 'Aprovado', label: 'Aprovado' },
                                    { value: 'Bloqueado', label: 'Bloqueado' },
                                    { value: 'Em Análise', label: 'Em Análise' },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Observações</label>
                            <textarea value={novaEmpresaFaturamento.observacoes || ''} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="Observações opcionais" rows="2"></textarea>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={() => setModalEmpresaFaturamentoAberto(false)} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 dark:text-[#888888] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                        <button type="submit" disabled={salvandoEmpresa} className="px-6 py-2 rounded-lg text-[13px] font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition disabled:opacity-50">
                            {salvandoEmpresa ? 'Salvando...' : 'Salvar Empresa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
