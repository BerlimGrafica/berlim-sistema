"use client";
import { useCadastros } from "@/context/CadastrosContext";
import Icon from "@/components/Icon";
import { CustomSelect } from '@/components/ui/Dropdown';
import { useModal } from '@/components/modals/useModal';

export default function UsuarioModal() {
    const { modalUsuarioAberto, setModalUsuarioAberto, novoUsuario, setNovoUsuario, salvarUsuario } = useCadastros();
    const modal = useModal(modalUsuarioAberto, () => setModalUsuarioAberto(false));

    if (!modalUsuarioAberto) return null;

    return (
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-fundo w-full max-w-none sm:max-w-md h-full sm:h-auto rounded-none sm:rounded shadow-2xl border border-borda animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t"><h3 className="font-semibold text-lg tracking-tight">{novoUsuario.id ? 'Editar Conta' : 'Nova Conta de Acesso'}</h3><button onClick={modal.fechar} className="text-white/70 hover:text-white transition"><Icon name="x" /></button></div>
                <form onSubmit={salvarUsuario} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Nome de Exibição</label>
                        <input required value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Ex: Giovana" />
                    </div>
                    {!novoUsuario.id && (
                        <div>
                            <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">E-mail de acesso</label>
                            <input required type="email" value={novoUsuario.email} onChange={e => setNovoUsuario({...novoUsuario, email: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="nome@empresa.com" />
                        </div>
                    )}
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">{novoUsuario.id ? 'Nova Senha' : 'Senha'}</label>
                        <input required={!novoUsuario.id} type="password" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder={novoUsuario.id ? 'Deixe em branco para manter a atual' : 'Mínimo 8 caracteres'} minLength={8} />
                    </div>
                    <div>
                        <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Nível de Acesso</label>
                        <CustomSelect
                            value={novoUsuario.nivel}
                            onChange={(val) => setNovoUsuario({...novoUsuario, nivel: val})}
                            className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition cursor-pointer"
                            options={[
                                { value: 'Atendimento', label: 'Atendimento' },
                                { value: 'Produção', label: 'Produção' },
                                { value: 'Financeiro', label: 'Equipe Financeira' },
                                { value: 'Administrador', label: 'Administrador (Total)' },
                                { value: 'demo', label: 'Demonstração (somente leitura)' },
                            ]}
                        />
                    </div>
                    <p className="text-micro text-gray-500 italic mt-1">* Nota: O usuário terá acesso imediato após salvar.</p>
                    <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={modal.fechar} className="px-4 py-2 rounded text-corpo font-medium text-tinta-suave hover:bg-realce transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-corpo font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar Acesso</button></div>
                </form>
            </div>
        </div>
    );
}
