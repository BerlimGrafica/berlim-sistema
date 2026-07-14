                {abaAtual === 'cadastros' && abaCadastros === 'usuarios' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Usuários do Sistema</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie os acessos da equipe (Administrador, Produção/Atendimento, Financeiro).</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoUsuario({ id: null, nome: '', senha: '', nivel: 'Produção/Atendimento' }); setModalUsuarioAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Usuário
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand"><tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"><th className="px-6 py-4">Nome do Usuário</th><th className="px-6 py-4 w-48 text-right">Nível de Acesso</th></tr></thead>
                                <tbody>
                                    {usuariosSistema.map(u => (
                                        <tr key={u.id} onClick={() => abrirEdicaoUsuario(u)} className="border-b border-gray-100 dark:border-darkBorder/50 hover:bg-gray-50/50 dark:hover:bg-darkHover/50 transition cursor-pointer">
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300">{u.nome}</td>
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${u.nivel === 'Administrador' ? 'bg-red-50 text-red-600 border-red-200' : u.nivel === 'Financeiro' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    {u.nivel}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                )}