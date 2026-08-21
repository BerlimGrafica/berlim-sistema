"use client";
import { useCadastros } from "@/context/CadastrosContext";
import Icon from "@/components/Icon";
import { formatarMoeda } from '@/lib/utils/formatters';
import { useModal } from '@/components/modals/useModal';

export default function ProdutoModal() {
    const { modalProdutoAberto, setModalProdutoAberto, novoProduto, setNovoProduto, salvandoProduto, salvarProduto } = useCadastros();
    const modal = useModal(modalProdutoAberto, () => setModalProdutoAberto(false));

    if (!modalProdutoAberto) return null;

    return (
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-fundo w-full max-w-md rounded shadow-2xl overflow-hidden border border-borda animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t"><h3 className="font-semibold text-lg tracking-tight">{novoProduto.id ? 'Editar Produto' : 'Novo Produto'}</h3><button onClick={modal.fechar} className="text-white/70 hover:text-white transition"><Icon name="x" /></button></div>
                <form onSubmit={salvarProduto} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Nome do Produto</label>
                        <input required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Nome" />
                    </div>
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Descrição / Texto Padrão</label>
                        <textarea rows="2" value={novoProduto.texto_padrao} onChange={e => setNovoProduto({...novoProduto, texto_padrao: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Descrição"></textarea>
                    </div>
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Preço Base (R$)</label>
                        <input required value={novoProduto.preco_base} onChange={e => setNovoProduto({...novoProduto, preco_base: formatarMoeda(e.target.value)})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white font-medium transition" placeholder="0,00" />
                    </div>
                    <div className="flex justify-end gap-3"><button type="button" onClick={modal.fechar} className="px-4 py-2 rounded text-corpo font-medium text-tinta-suave hover:bg-realce transition">Cancelar</button><button type="submit" disabled={salvandoProduto} className="px-5 py-2 rounded text-corpo font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm disabled:opacity-50">{salvandoProduto ? 'Salvando...' : 'Salvar'}</button></div>
                </form>
            </div>
        </div>
    );
}
