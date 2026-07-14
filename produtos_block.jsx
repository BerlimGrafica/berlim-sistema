                {abaAtual === 'cadastros' && abaCadastros === 'produtos' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Catálogo</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie os serviços, itens e preços base para orçamentos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaCadProdutos} onChange={e => setBuscaCadProdutos(e.target.value)} placeholder="Buscar produto..." className="w-56 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                <button onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Produto
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">ID</th>
                                        <th className="px-6 py-4">Nome do Produto</th>
                                        <th className="px-6 py-4">Descrição Base</th>
                                        <th className="px-6 py-4 w-36 text-right">Preço Base</th>
                                        <th className="px-6 py-4 w-24 text-center">Excluir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtosCatalogoFiltrados.map((p, index) => (
                                        <tr 
                                            key={p.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStartProduto(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleDropProduto(e, index)}
                                            onClick={() => abrirEdicaoProduto(p)} 
                                            className={`border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition cursor-pointer group ${draggedProdutoIndex === index ? 'opacity-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300 cursor-grab active:cursor-grabbing">
                                                <Icon name="list" className="w-4 h-4 inline-block mr-2 opacity-50" />
                                                #{p.id}
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-medium text-gray-800 dark:text-white">{p.nome}</td>
                                            <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-xs">{p.texto_padrao}</td>
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300 text-right">R$ {formatarValorFinanceiro(Number(p.preco_base))}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button type="button" onClick={(e) => excluirProduto(p.id, e)} className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30" title="Excluir Produto">
                                                    <Icon name="trash-2" className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                )}