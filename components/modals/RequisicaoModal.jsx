"use client";
import { useComunicacao } from "@/context/ComunicacaoContext";
import Icon from "@/components/Icon";
import { CustomSelect } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function RequisicaoModal() {
    const { modalRequisicaoAberto, setModalRequisicaoAberto, novaRequisicao, setNovaRequisicao, salvarRequisicao } = useComunicacao();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalRequisicaoAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalRequisicaoAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-fundo w-full max-w-lg rounded shadow-2xl overflow-hidden border border-borda animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-borda-fraca flex justify-between items-center bg-brand text-white"><h3 className="font-semibold text-lg tracking-tight">{novaRequisicao.id ? 'Editar Requisição' : 'Nova Requisição'}</h3><button onClick={() => setModalRequisicaoAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5"/></button></div>
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Itens (Material, quantidade, etc.)</label>
                        <textarea required rows="4" value={novaRequisicao.itens} onChange={e => setNovaRequisicao({...novaRequisicao, itens: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand transition dark:text-white placeholder-gray-400" placeholder="Ex: 2 caixas de sulfite A4..."></textarea>
                    </div>
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Observações (Opcional)</label>
                        <textarea rows="2" value={novaRequisicao.observacoes} onChange={e => setNovaRequisicao({...novaRequisicao, observacoes: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand transition dark:text-white placeholder-gray-400"></textarea>
                    </div>
                    {novaRequisicao.id && (
                        <div>
                            <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Status</label>
                            <CustomSelect
                                value={novaRequisicao.status}
                                onChange={(val) => setNovaRequisicao({...novaRequisicao, status: val})}
                                className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition cursor-pointer"
                                options={[
                                    { value: 'Pendente', label: 'Pendente' },
                                    { value: 'Comprado', label: 'Comprado' },
                                    { value: 'Recusado', label: 'Recusado' },
                                ]}
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalRequisicaoAberto(false)} className="px-4 py-2 rounded text-corpo font-medium text-tinta-suave hover:bg-realce transition">Cancelar</button><button type="button" onClick={salvarRequisicao} className="px-5 py-2 rounded text-corpo font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                </div>
            </div>
        </div>
    );
}
