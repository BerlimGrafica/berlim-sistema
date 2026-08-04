"use client";
import { useAppContext, supabase } from "@/context/AppContext";
import Icon from "@/components/Icon";
import { CustomSelect } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function FornecedorModal() {
    const { modalFornecedorAberto, setModalFornecedorAberto, novoFornecedor, setNovoFornecedor, carregarDados } = useAppContext();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalFornecedorAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalFornecedorAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div onClick={e => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg rounded shadow-2xl w-full max-w-md overflow-hidden cursor-default border border-gray-100 dark:border-darkBorder animate-modal-in">
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                    <h3 className="font-semibold text-lg tracking-tight">{novoFornecedor.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                    <button type="button" onClick={() => setModalFornecedorAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Nome / Local *</label>
                        <input type="text" required value={novoFornecedor.nome} onChange={e => setNovoFornecedor({...novoFornecedor, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Ex: Gráfica XYZ, Futura..." />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Tipo de Fornecedor</label>
                        <CustomSelect
                            value={novoFornecedor.tipo || 'Terceirização'}
                            onChange={(val) => setNovoFornecedor({...novoFornecedor, tipo: val})}
                            className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium cursor-pointer"
                            options={[
                                { value: 'Material', label: 'Material' },
                                { value: 'Terceirização', label: 'Terceirização' },
                                { value: 'Manutenção', label: 'Manutenção' },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Contato (Telefone, E-mail)</label>
                        <input type="text" value={novoFornecedor.contato} onChange={e => setNovoFornecedor({...novoFornecedor, contato: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Ex: (11) 9999-9999" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Observações</label>
                        <textarea rows="3" value={novoFornecedor.observacoes} onChange={e => setNovoFornecedor({...novoFornecedor, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium resize-none custom-scrollbar" placeholder="Dados bancários, prazo padrão..." />
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-darkHover/30 border-t border-gray-100 dark:border-darkBorder flex justify-end gap-3">
                    <button type="button" onClick={() => setModalFornecedorAberto(false)} className="px-4 py-2 text-[12px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkHover rounded transition">Cancelar</button>
                    <button type="button" onClick={async () => {
                        if(!novoFornecedor.nome) return alert('Nome é obrigatório');
                        if (novoFornecedor.id) await supabase.from('fornecedores').update({ nome: novoFornecedor.nome, contato: novoFornecedor.contato, observacoes: novoFornecedor.observacoes, tipo: novoFornecedor.tipo }).eq('id', novoFornecedor.id);
                        else await supabase.from('fornecedores').insert([{ nome: novoFornecedor.nome, contato: novoFornecedor.contato, observacoes: novoFornecedor.observacoes, tipo: novoFornecedor.tipo || 'Terceirização' }]);
                        carregarDados();
                        setModalFornecedorAberto(false);
                    }} className="bg-brand hover:bg-brandHover text-white px-5 py-2 text-[12px] font-semibold rounded shadow-sm transition">Salvar</button>
                </div>
            </div>
        </div>
    );
}
