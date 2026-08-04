"use client";
import { useAppContext } from "@/context/AppContext";
import Icon from "@/components/Icon";
import { CustomSelect } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function RequisicaoModal() {
    const { modalRequisicaoAberto, setModalRequisicaoAberto, novaRequisicao, setNovaRequisicao, salvarRequisicao } = useAppContext();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalRequisicaoAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalRequisicaoAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-lg rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-brand text-white"><h3 className="font-semibold text-lg tracking-tight">{novaRequisicao.id ? 'Editar Requisição' : 'Nova Requisição'}</h3><button onClick={() => setModalRequisicaoAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5"/></button></div>
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Itens (Material, quantidade, etc.)</label>
                        <textarea required rows="4" value={novaRequisicao.itens} onChange={e => setNovaRequisicao({...novaRequisicao, itens: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white placeholder-gray-400" placeholder="Ex: 2 caixas de sulfite A4..."></textarea>
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Observações (Opcional)</label>
                        <textarea rows="2" value={novaRequisicao.observacoes} onChange={e => setNovaRequisicao({...novaRequisicao, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white placeholder-gray-400"></textarea>
                    </div>
                    {novaRequisicao.id && (
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status</label>
                            <CustomSelect
                                value={novaRequisicao.status}
                                onChange={(val) => setNovaRequisicao({...novaRequisicao, status: val})}
                                className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                                options={[
                                    { value: 'Pendente', label: 'Pendente' },
                                    { value: 'Comprado', label: 'Comprado' },
                                    { value: 'Recusado', label: 'Recusado' },
                                ]}
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalRequisicaoAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="button" onClick={salvarRequisicao} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                </div>
            </div>
        </div>
    );
}
