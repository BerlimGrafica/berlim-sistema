"use client";
import { useOrcamentos } from "@/context/OrcamentosContext";
import Icon from "@/components/Icon";
import { InlineDropdown } from '@/components/ui/Dropdown';
import { useModal } from '@/components/modals/useModal';

export default function OrcamentoPreModal() {
    const { modalOrcamentoPreAberto, setModalOrcamentoPreAberto, novoOrcamentoPre, setNovoOrcamentoPre, salvarOrcamentoPre } = useOrcamentos();
    const modal = useModal(modalOrcamentoPreAberto, () => setModalOrcamentoPreAberto(false));

    if (!modalOrcamentoPreAberto) return null;

    return (
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-fundo w-full max-w-none sm:max-w-md h-full sm:h-auto rounded-none sm:rounded shadow-2xl overflow-hidden border border-borda animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t"><h3 className="font-semibold text-lg tracking-tight">{novoOrcamentoPre.id ? 'Editar Modelo' : 'Novo Modelo'}</h3><button onClick={modal.fechar} className="text-white/70 hover:text-white transition"><Icon name="x" /></button></div>
                <form onSubmit={salvarOrcamentoPre} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Título</label>
                        <input required value={novoOrcamentoPre.titulo} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, titulo: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Título (Ex: Adesivos Redondos)" />
                    </div>
                    <div className="w-full">
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Empresa</label>
                        <InlineDropdown
                            value={novoOrcamentoPre.empresa || 'Berlim'}
                            options={['Berlim', 'Futura']}
                            onChange={val => setNovoOrcamentoPre({...novoOrcamentoPre, empresa: val})}
                            className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none hover:border-brand dark:text-white transition"
                        />
                    </div>

                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Texto do Orçamento</label>
                        <textarea rows="6" required value={novoOrcamentoPre.texto} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, texto: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition custom-scrollbar" placeholder="Cole aqui o texto do orçamento..."></textarea>
                    </div>
                    <div className="flex justify-end gap-3"><button type="button" onClick={modal.fechar} className="px-4 py-2 rounded text-corpo font-medium text-tinta-suave hover:bg-realce transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-corpo font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                </form>
            </div>
        </div>
    );
}
