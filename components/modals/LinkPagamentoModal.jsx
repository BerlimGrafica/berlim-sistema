"use client";
import { useComunicacao } from "@/context/ComunicacaoContext";
import Icon from "@/components/Icon";
import { formatarMoeda } from '@/lib/utils/formatters';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function LinkPagamentoModal() {
    const { modalLinkAberto, setModalLinkAberto, novoLink, setNovoLink, salvarLink } = useComunicacao();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalLinkAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalLinkAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-brand text-white"><h3 className="font-semibold text-lg tracking-tight">{novoLink.id ? 'Editar Link' : 'Novo Link de Pagamento'}</h3><button onClick={() => setModalLinkAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5"/></button></div>
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Identificação / Título</label>
                        <textarea required rows="2" value={novoLink.titulo} onChange={e => setNovoLink({...novoLink, titulo: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="Ex: Link Cartão R$ 100,00"></textarea>
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Cliente (Para quem é?)</label>
                        <input type="text" value={novoLink.cliente} onChange={e => setNovoLink({...novoLink, cliente: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="Nome do cliente" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">URL do Link</label>
                        <input required type="url" value={novoLink.link} onChange={e => setNovoLink({...novoLink, link: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Valor (R$)</label>
                        <input type="text" value={novoLink.valor} onChange={e => setNovoLink({...novoLink, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="0,00" />
                    </div>
                    <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalLinkAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="button" onClick={salvarLink} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                </div>
            </div>
        </div>
    );
}
