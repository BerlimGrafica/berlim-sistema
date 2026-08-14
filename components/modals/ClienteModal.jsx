"use client";
import { useAppContext } from "@/context/AppContext";
import Icon from "@/components/Icon";
import { formatarTelefone } from '@/lib/utils/formatters';
import { ToggleCard } from '@/components/ui/ToggleCard';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function ClienteModal() {
    const { modalClienteAberto, setModalClienteAberto, novoCliente, setNovoCliente, salvandoCliente, salvarCliente } = useAppContext();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalClienteAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalClienteAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t"><h3 className="font-semibold text-lg tracking-tight">{novoCliente.id ? 'Editar Cliente' : 'Novo Cliente'}</h3><button onClick={() => setModalClienteAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" /></button></div>
                <form onSubmit={salvarCliente} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Nome</label>
                        <input required autoFocus value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome *" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">WhatsApp</label>
                            <input value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: formatarTelefone(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">E-mail</label>
                            <input type="email" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="E-mail" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Observações</label>
                        <textarea rows="2" value={novoCliente.observacoes} onChange={e => setNovoCliente({...novoCliente, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Observações"></textarea>
                    </div>
                    <ToggleCard
                        icon="alert-triangle"
                        title="Cliente Problema"
                        description="Sinaliza este cliente com destaque de atenção nas listagens."
                        checked={novoCliente.cliente_problema}
                        onChange={val => setNovoCliente({...novoCliente, cliente_problema: val})}
                        color="red"
                    />
                    <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalClienteAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" disabled={salvandoCliente} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm disabled:opacity-50">{salvandoCliente ? 'Salvando...' : 'Salvar'}</button></div>
                </form>
            </div>
        </div>
    );
}
