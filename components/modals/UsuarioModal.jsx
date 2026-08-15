"use client";
import { useCadastros } from "@/context/CadastrosContext";
import Icon from "@/components/Icon";
import { CustomSelect } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function UsuarioModal() {
    const { modalUsuarioAberto, setModalUsuarioAberto, novoUsuario, setNovoUsuario, salvarUsuario } = useCadastros();
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalUsuarioAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalUsuarioAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl border border-gray-200 dark:border-darkBorder animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t"><h3 className="font-semibold text-lg tracking-tight">{novoUsuario.id ? 'Editar Conta' : 'Nova Conta de Acesso'}</h3><button onClick={() => setModalUsuarioAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" /></button></div>
                <form onSubmit={salvarUsuario} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Nome de Exibição</label>
                        <input required value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: Giovana" />
                    </div>
                    {!novoUsuario.id && (
                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">E-mail de acesso</label>
                            <input required type="email" value={novoUsuario.email} onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="nome@empresa.com" />
                        </div>
                    )}
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">{novoUsuario.id ? 'Nova Senha' : 'Senha'}</label>
                        <input required={!novoUsuario.id} type="password" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder={novoUsuario.id ? 'Deixe em branco para manter a atual' : 'Mínimo 8 caracteres'} minLength={8} />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Nível de Acesso</label>
                        <CustomSelect
                            value={novoUsuario.nivel}
                            onChange={(val) => setNovoUsuario({...novoUsuario, nivel: val})}
                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                            options={[
                                { value: 'Atendimento', label: 'Atendimento' },
                                { value: 'Produção', label: 'Produção' },
                                { value: 'Financeiro', label: 'Equipe Financeira' },
                                { value: 'Administrador', label: 'Administrador (Total)' },
                                { value: 'demo', label: 'Demonstração (somente leitura)' },
                            ]}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 italic mt-1">* Nota: O usuário terá acesso imediato após salvar.</p>
                    <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalUsuarioAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar Acesso</button></div>
                </form>
            </div>
        </div>
    );
}
