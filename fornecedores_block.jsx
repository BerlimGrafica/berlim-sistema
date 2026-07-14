                {abaAtual === 'cadastros' && abaCadastros === 'fornecedores' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Fornecedores e Locais</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie os locais de produção e fornecedores externos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoFornecedor({ id: null, nome: '', contato: '', observacoes: '' }); setModalFornecedorAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Fornecedor
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">ID</th>
                                        <th className="px-6 py-4">Nome do Fornecedor / Local</th>
                                        <th className="px-6 py-4">Contato</th>
                                        <th className="px-6 py-4">Observações</th>
                                        <th className="px-6 py-4 w-24 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fornecedores.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-[13px] text-gray-400 dark:text-gray-500">
                                                Nenhum fornecedor cadastrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        fornecedores.map(f => (
                                            <tr key={f.id} onClick={() => { setNovoFornecedor(f); setModalFornecedorAberto(true); }} className="border-b border-gray-100 dark:border-darkBorder/50 hover:bg-gray-50/50 dark:hover:bg-darkHover/50 transition cursor-pointer">
                                                <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300">#{f.id}</td>
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-800 dark:text-white">{f.nome}</td>
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{f.contato || '-'}</td>
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{f.observacoes || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button type="button" onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if(confirm(`Excluir o fornecedor ${f.nome}?`)) {
                                                            await supabase.from('fornecedores').delete().eq('id', f.id);
                                                            carregarDados();
                                                        }
                                                    }} className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30" title="Excluir Fornecedor">
                                                        <Icon name="trash-2" className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </main>
                )}