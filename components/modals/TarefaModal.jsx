"use client";
import { useAppContext } from "@/context/AppContext";
import Icon from "@/components/Icon";
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { CustomSelect } from '@/components/ui/Dropdown';
import { ToggleCard } from '@/components/ui/ToggleCard';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function TarefaModal() {
    const { modalTarefaAberto, setModalTarefaAberto, novaTarefa, setNovaTarefa, salvarTarefa, usuariosSistema } = useAppContext();
    const nomesResponsaveis = usuariosSistema.map(u => u.nome);
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalTarefaAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalTarefaAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-lg rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-brand text-white"><h3 className="font-semibold text-lg tracking-tight">{novaTarefa.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h3><button onClick={() => setModalTarefaAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5"/></button></div>
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Título</label>
                        <input required type="text" value={novaTarefa.titulo} onChange={e => setNovaTarefa({...novaTarefa, titulo: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Prazo</label>
                        <CustomDatePicker value={novaTarefa.prazo} onChange={(val) => setNovaTarefa({...novaTarefa, prazo: val})} placeholder="Selecione uma data" className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Descrição</label>
                        <textarea rows="3" value={novaTarefa.descricao} onChange={e => setNovaTarefa({...novaTarefa, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Responsável</label>
                            <CustomSelect
                                value={novaTarefa.responsavel}
                                onChange={(val) => setNovaTarefa({...novaTarefa, responsavel: val})}
                                className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                                options={[
                                    { value: '', label: '(Sem responsável)' },
                                    ...nomesResponsaveis.map(r => ({ value: r, label: r })),
                                ]}
                            />
                        </div>
                        {novaTarefa.id && (
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status</label>
                                <CustomSelect
                                    value={novaTarefa.status}
                                    onChange={(val) => setNovaTarefa({...novaTarefa, status: val})}
                                    className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                                    options={[
                                        { value: 'Pendente', label: 'Pendente' },
                                        { value: 'Em Andamento', label: 'Em Andamento' },
                                        { value: 'Concluída', label: 'Concluída' },
                                    ]}
                                />
                            </div>
                        )}
                    </div>
                    <ToggleCard
                        icon="pin"
                        title="Tarefa Fixa"
                        description="Conclusão diária — não é removida, reseta automaticamente todo dia."
                        checked={!!novaTarefa.fixa}
                        onChange={val => setNovaTarefa({...novaTarefa, fixa: val})}
                        color="blue"
                    />
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={() => setModalTarefaAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                        <button type="button" onClick={async (e) => { e.preventDefault(); await salvarTarefa(); }} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
