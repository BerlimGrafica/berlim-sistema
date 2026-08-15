"use client";
import { useOrcamentos } from "@/context/OrcamentosContext";
import Icon from "@/components/Icon";
import { InlineDropdown } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function OrcamentoPreModal() {
    const { modalOrcamentoPreAberto, setModalOrcamentoPreAberto, novoOrcamentoPre, setNovoOrcamentoPre, salvarOrcamentoPre } = useOrcamentos();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalOrcamentoPreAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalOrcamentoPreAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t"><h3 className="font-semibold text-lg tracking-tight">{novoOrcamentoPre.id ? 'Editar Modelo' : 'Novo Modelo'}</h3><button onClick={() => setModalOrcamentoPreAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" /></button></div>
                <form onSubmit={salvarOrcamentoPre} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Título</label>
                        <input required value={novoOrcamentoPre.titulo} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, titulo: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Título (Ex: Adesivos Redondos)" />
                    </div>
                    <div className="w-full">
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Empresa</label>
                        <InlineDropdown
                            value={novoOrcamentoPre.empresa || 'Berlim'}
                            options={['Berlim', 'Futura']}
                            onChange={val => setNovoOrcamentoPre({...novoOrcamentoPre, empresa: val})}
                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none hover:border-brand dark:text-white transition"
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Texto do Orçamento</label>
                        <textarea rows="6" required value={novoOrcamentoPre.texto} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, texto: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition custom-scrollbar" placeholder="Cole aqui o texto do orçamento..."></textarea>
                    </div>
                    <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOrcamentoPreAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                </form>
            </div>
        </div>
    );
}
