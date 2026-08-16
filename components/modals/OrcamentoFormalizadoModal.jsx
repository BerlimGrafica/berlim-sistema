"use client";
import { useState } from "react";
import { useSessao } from "@/context/SessaoContext";
import { useOsModal } from "@/context/OsModalContext";
import { useOrcamentos } from "@/context/OrcamentosContext";
import { useClientes } from "@/context/ClientesContext";
import { useCadastros } from "@/context/CadastrosContext";
import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import { formatarValorFinanceiro, formatarMoeda, centavosParaReais, mascararCliente } from '@/lib/utils/formatters';
import { CustomSelect } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function OrcamentoFormalizadoModal() {
    const { isDemo, isAdmin } = useSessao();
    const { buscaCliente, setBuscaCliente, clienteSelecionadoInfo, setClienteSelecionadoInfo, setClienteDropdownAberto, clienteDropdownAberto, novoPedido, setNovoPedido, itensPedido, buscaProduto, setBuscaProduto, setProdutoDropdownAberto, produtoDropdownAberto, produtosFiltrados, setItemAtual, itemAtual, removerItemDoCarrinho, adicionarItemAoCarrinho, salvarEdicaoItemCarrinho } = useOsModal();
    const { modalOrcamentoFormalizadoAberto, setModalOrcamentoFormalizadoAberto, orcamentoFormalizadoEmEdicao, salvarOrcamentoFormalizado } = useOrcamentos();
    const { clientesFiltrados, setNovoCliente, setModalClienteAberto, isClienteProblema } = useClientes();
    const { setNovoProduto, setModalProdutoAberto, fornecedoresTerceirizacaoNomes, atualizarCatalogoProdutos } = useCadastros();
    const [itemEditandoId, setItemEditandoId] = useState(null);
    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalOrcamentoFormalizadoAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalOrcamentoFormalizadoAberto(false))} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div onClick={(e) => e.stopPropagation()} className="bg-fundo w-full max-w-4xl rounded border border-borda shadow-2xl flex flex-col max-h-[95vh] cursor-default overflow-hidden animate-modal-in">
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-xl tracking-tight">
                            {orcamentoFormalizadoEmEdicao ? 'Editar Orçamento Formalizado' : 'Novo Orçamento Formalizado'}
                        </h3>
                    </div>
                    <button type="button" onClick={() => setModalOrcamentoFormalizadoAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5" /></button>
                </div>

                <form className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-7">
                    <div className="flex flex-col gap-4 pb-6 border-b border-borda">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-brand rounded-full"></span>
                            <h4 className="text-micro font-bold uppercase tracking-wider text-tinta-suave">Dados do Orçamento</h4>
                        </div>
                        <div>
                            <label className="block text-corpo font-medium mb-1.5 text-tinta-corpo">Cliente / Empresa</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input required type="text" value={mascararCliente(buscaCliente, isDemo)}
                                        onChange={e => { setBuscaCliente(e.target.value); setClienteSelecionadoInfo(null); setNovoPedido({...novoPedido, cliente: e.target.value, cliente_id: null}); setClienteDropdownAberto(true); }}
                                        onFocus={() => { setClienteDropdownAberto(true); }} onBlur={() => setTimeout(() => setClienteDropdownAberto(false), 200)}
                                        className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Buscar cliente..." autoComplete="off" />
                                    <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    {clienteDropdownAberto && clientesFiltrados.length > 0 && (
                                        <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-superficie border border-borda rounded shadow-xl custom-scrollbar">
                                            {clientesFiltrados.map(c => (
                                                <li key={c.id} onClick={() => { setBuscaCliente(c.nome); setClienteSelecionadoInfo({ id: c.id, telefone: c.telefone }); setNovoPedido({...novoPedido, cliente: c.nome, cliente_id: c.id}); setClienteDropdownAberto(false); }} className="px-3 py-2.5 hover:bg-sutil cursor-pointer border-b border-borda-fraca last:border-0 flex justify-between items-center transition"><span className="font-medium text-corpo text-tinta">{c.nome}</span><span className="text-mini text-tinta-suave">{c.telefone}</span></li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <Tooltip label="Novo Cliente">
                                    <button type="button" onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} aria-label="Novo Cliente" className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-elevado border border-borda-forte rounded hover:bg-darkHover transition">
                                        <Icon name="plus" className="w-4 h-4 text-brand" />
                                    </button>
                                </Tooltip>
                            </div>
                            {!clienteDropdownAberto && buscaCliente && !isDemo && (() => {
                                // Só o cliente clicado agora, ou o cliente_id gravado no orçamento
                                // (é o que vale ao reabrir pra editar). Sem vínculo não mostra
                                // telefone: buscar por nome exibia o contato de um homônimo.
                                const telefone = clienteSelecionadoInfo?.telefone
                                    ?? (novoPedido.cliente_id ? clientesFiltrados.find(c => c.id === novoPedido.cliente_id)?.telefone : undefined);
                                return telefone ? (
                                    <p className="mt-1.5 text-mini text-tinta-suave flex items-center gap-1">
                                        <Icon name="phone" className="w-3 h-3" /> {telefone}
                                    </p>
                                ) : null;
                            })()}
                            {isClienteProblema(novoPedido.cliente, novoPedido.cliente_id) && (
                                <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded flex items-start gap-2.5 text-red-600 dark:text-red-400">
                                    <Icon name="alert-triangle" className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-corpo font-semibold block">Atenção: Cliente Problemático</span>
                                        <span className="text-mini">Este cliente possui restrições ou histórico negativo na empresa. Fique atento.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARRINHO DE ITENS — destacado */}
                    <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-500/5">
                        <div className="rounded-t-xl px-5 py-3.5 bg-blue-100/60 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-superficie shadow-sm shrink-0"><Icon name="shopping-bag" className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                <h4 className="font-bold text-corpo text-tinta">Carrinho de Itens do Orçamento</h4>
                            </div>
                            {itensPedido.length > 0 && (
                                <span className="text-mini font-bold text-blue-700 dark:text-blue-400 bg-superficie px-2.5 py-1 rounded-full shadow-sm shrink-0">{itensPedido.length} {itensPedido.length === 1 ? 'item' : 'itens'}</span>
                            )}
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            {itensPedido.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {itensPedido.map((item, index) => (
                                        <div key={item.id_temp} onClick={() => {
                                            setItemAtual({ nome: item.nome || '', descricao: item.descricao || '', valor: item.valor_original || item.valor, desconto: item.desconto || '', local_producao: item.local_producao || 'Berlim', id_produto: item.id_produto || null });
                                            setBuscaProduto(item.nome || '');
                                            setItemEditandoId(item.id_temp);
                                        }} className={`flex justify-between items-start gap-3 p-3 bg-white dark:bg-darkElevated border rounded-lg shadow-sm transition cursor-pointer hover:border-brand/60 ${itemEditandoId === item.id_temp ? 'border-brand ring-1 ring-brand' : 'border-borda'}`}>
                                            <div className="flex items-start gap-3 min-w-0">
                                                <span className="w-6 h-6 shrink-0 rounded-full bg-blue-100 dark:bg-blue-500/20 text-mini font-bold text-blue-700 dark:text-blue-400 flex items-center justify-center mt-0.5">{index + 1}</span>
                                                <div className="flex flex-col min-w-0"><span className="font-semibold text-corpo dark:text-white">{item.nome || 'Serviço Personalizado'}</span><span className="text-mini text-tinta-suave whitespace-pre-wrap mt-1">{item.descricao}</span>{item.local_producao && <span className="text-micro bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded mt-1.5 w-max">Local: {item.local_producao}</span>}</div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0"><div className="text-right"><span className="font-bold text-corpo dark:text-white">R$ {item.valor}</span>{item.desconto && <span className="block text-micro text-brand font-medium">-{item.desconto}% desc</span>}</div><button type="button" onClick={(e) => { e.stopPropagation(); if (itemEditandoId === item.id_temp) { setItemEditandoId(null); setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null }); setBuscaProduto(''); } removerItemDoCarrinho(item.id_temp); }} className="text-red-400 hover:text-red-600 transition"><Icon name="trash-2" className="w-4 h-4" /></button></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center opacity-70">
                                    <Icon name="shopping-bag" className="w-7 h-7 text-gray-300 dark:text-gray-600 mb-1.5" />
                                    <p className="text-compacto text-gray-400 italic">Nenhum item adicionado ainda.</p>
                                </div>
                            )}

                            <div className="p-4 border-2 border-dashed border-blue-200 dark:border-blue-500/30 rounded-lg bg-white/60 dark:bg-darkElevated/40">
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input type="text" value={buscaProduto}
                                                onChange={e => { setBuscaProduto(e.target.value); setProdutoDropdownAberto(true); }}
                                                onFocus={() => { setProdutoDropdownAberto(true); atualizarCatalogoProdutos(); }} onBlur={() => setTimeout(() => setProdutoDropdownAberto(false), 200)}
                                                className="w-full bg-elevado border border-borda rounded px-3 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Puxar item do catálogo (Opcional)..." autoComplete="off" />
                                            <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                            {produtoDropdownAberto && produtosFiltrados.length > 0 && (
                                                <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-superficie border border-borda rounded shadow-xl custom-scrollbar">
                                                    {produtosFiltrados.map(p => (
                                                        <li key={p.id} onClick={() => {
                                                            setBuscaProduto(p.nome);
                                                            setItemAtual({ ...itemAtual, nome: p.nome, descricao: p.texto_padrao || '', valor: formatarMoeda(Math.round(p.preco_base).toString()), desconto: '', id_produto: p.id });
                                                            setProdutoDropdownAberto(false);
                                                        }} className="px-3 py-2.5 hover:bg-sutil cursor-pointer border-b border-borda-fraca last:border-0 flex flex-col transition">
                                                            <div className="flex justify-between items-center"><span className="font-medium text-corpo dark:text-[#EDEDED]">{p.nome}</span><span className="text-mini font-semibold text-brand">R$ {formatarValorFinanceiro(centavosParaReais(p.preco_base))}</span></div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {isAdmin && (
                                            <Tooltip label="Novo Produto">
                                                <button type="button" onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} aria-label="Novo Produto" className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-elevado border border-borda-forte rounded hover:bg-darkHover transition">
                                                    <Icon name="plus" className="w-4 h-4 text-brand" />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>

                                    <textarea rows="2" value={itemAtual.descricao} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} className="w-full bg-elevado border border-borda rounded px-3 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Especificações do item (Ex: Medida, quantidade, material...)"></textarea>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="relative col-span-2">
                                            <span className="absolute left-3 top-2.5 text-mini text-gray-400 font-medium z-[1]">Local:</span>
                                            <CustomSelect
                                                value={itemAtual.local_producao}
                                                onChange={(val) => setItemAtual({...itemAtual, local_producao: val})}
                                                className="w-full bg-elevado border border-borda rounded pl-[52px] pr-3 py-2 text-mini outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium"
                                                options={(fornecedoresTerceirizacaoNomes.length > 0 ? fornecedoresTerceirizacaoNomes.map(f => f.nome) : ['Berlim']).map(l => ({ value: l, label: l }))}
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-2.5 top-2.5 text-mini text-gray-400">R$</span>
                                            <input type="text" value={itemAtual.valor} onChange={e => setItemAtual({...itemAtual, valor: formatarMoeda(e.target.value)})} className="w-full bg-elevado border border-borda rounded pl-7 pr-2 py-2 text-mini outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Bruto" />
                                        </div>
                                        <div><input type="text" value={itemAtual.desconto} onChange={e => { let val = e.target.value.replace(/\D/g, ''); if (parseFloat(val) > 100) val = '100'; setItemAtual({...itemAtual, desconto: val}); }} className="w-full bg-elevado border border-borda rounded px-2 py-2 text-mini outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Desc. %" /></div>
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {itemEditandoId !== null && (
                                            <button type="button" onClick={() => { setItemEditandoId(null); setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null }); setBuscaProduto(''); }} className="px-3 py-2 text-mini font-semibold text-gray-500 hover:bg-realce rounded transition">Cancelar</button>
                                        )}
                                        {itemEditandoId !== null ? (
                                            <button type="button" onClick={() => { salvarEdicaoItemCarrinho(itemEditandoId); setItemEditandoId(null); }} disabled={!itemAtual.descricao || !itemAtual.valor} className="flex-1 px-3 py-2 text-mini font-semibold bg-brand hover:bg-brandHover text-white rounded transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5"/> Salvar Alterações</button>
                                        ) : (
                                            <button type="button" onClick={adicionarItemAoCarrinho} disabled={!itemAtual.descricao || !itemAtual.valor} className="flex-1 px-3 py-2 text-mini font-semibold bg-brand hover:bg-brandHover text-white rounded transition shadow-sm disabled:opacity-40 disabled:bg-gray-300 dark:disabled:bg-darkElevated disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5"/> Inserir Item no Orçamento</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-3.5 bg-brand rounded-full"></span>
                            <h4 className="text-micro font-bold uppercase tracking-wider text-tinta-suave">Observações Gerais ou Texto Complementar</h4>
                        </div>
                        <textarea rows="4" value={novoPedido.servico} onChange={e => setNovoPedido({...novoPedido, servico: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED] custom-scrollbar" placeholder="Detalhes adicionais, garantias, etc..."></textarea>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-borda bg-gray-50/80 dark:bg-darkCard/80 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0 rounded-b-xl z-20 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] dark:shadow-none">
                    <div className="flex items-center gap-3 bg-elevado px-4 py-3 rounded-xl border border-borda shadow-sm w-full lg:w-auto justify-between lg:justify-start">
                        <span className="text-mini font-bold text-tinta-fraca uppercase tracking-widest mt-1">Total Final</span>
                        <div className="relative flex items-center justify-end">
                            <span className="font-bold text-[14px] text-gray-300 dark:text-gray-500 mr-1.5">R$</span>
                            <input required type="text" value={novoPedido.valor_total} onChange={e => setNovoPedido({...novoPedido, valor_total: formatarMoeda(e.target.value)})} className="bg-transparent border-none text-right font-black text-2xl text-brand outline-none w-28 sm:w-32 placeholder-brand/30" placeholder="0,00" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
                        <button type="button" onClick={(e) => salvarOrcamentoFormalizado(e, true)} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-corpo font-bold bg-superficie text-tinta-corpo border border-borda hover:bg-sutil hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap">
                            <Icon name="file-text" className="w-4 h-4 shrink-0" />
                            Salvar e Baixar PDF
                        </button>
                        <button type="button" onClick={(e) => salvarOrcamentoFormalizado(e, false)} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-corpo font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition flex items-center justify-center gap-2 whitespace-nowrap">
                            <Icon name="save" className="w-4 h-4 shrink-0" />
                            {orcamentoFormalizadoEmEdicao ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
