"use client";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import { formatarValorFinanceiro, formatarMoeda, parseValorMoeda, centavosParaReais, obterDataAtual, mascararCliente } from '@/lib/utils/formatters';
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { CustomSelect, MultiSelectDropdown } from '@/components/ui/Dropdown';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

export default function OSModal() {
    const { modalAberto, fecharModalOS, pedidoEmEdicao, isModalTrancado, novoPedido, setNovoPedido, opcoesStatusPermitidas, buscaCliente, setBuscaCliente, isDemo, setClienteDropdownAberto, clienteDropdownAberto, clientesFiltrados, setNovoCliente, setModalClienteAberto, isClienteProblema, itensPedido, buscaProduto, setBuscaProduto, setProdutoDropdownAberto, produtoDropdownAberto, produtosFiltrados, setItemAtual, itemAtual, isAdmin, setNovoProduto, setModalProdutoAberto, fornecedores, pagamentosPedido, setPagamentosPedido, novoPagamento, setNovoPagamento, salvandoOS, usuario, salvarOS, removerItemDoCarrinho, adicionarItemAoCarrinho, salvarEdicaoItemCarrinho, usuariosSistema, atualizarCatalogoProdutos } = useAppContext();
    const nomesResponsaveis = usuariosSistema.map(u => u.nome);

    const [pagamentoEditandoIdx, setPagamentoEditandoIdx] = useState(null);
    const [pagamentoEditando, setPagamentoEditando] = useState(null);
    const [itemEditandoId, setItemEditandoId] = useState(null);

    // Limpa a edição de pagamento/item ao fechar o modal, ajustado durante a
    // renderização (em vez de num useEffect) para não disparar um commit extra.
    const [modalAbertoAnterior, setModalAbertoAnterior] = useState(modalAberto);
    if (modalAbertoAnterior !== modalAberto) {
        setModalAbertoAnterior(modalAberto);
        if (!modalAberto) {
            setPagamentoEditandoIdx(null);
            setPagamentoEditando(null);
            setItemEditandoId(null);
        }
    }

    const camposExtrasPagamento = (forma) => {
        const mostrarInstituicao = forma === 'PIX' || forma === 'Link de Pagamento';
        const mostrarParcelas = forma === 'Cartão de Crédito' || forma === 'Link de Pagamento';
        const total = 1 + (mostrarInstituicao ? 1 : 0) + (mostrarParcelas ? 1 : 0);
        return { mostrarInstituicao, mostrarParcelas, gridClass: total === 3 ? 'grid-cols-3' : total === 2 ? 'grid-cols-2' : 'grid-cols-1' };
    };

    const fecharAoClicarFora = useFecharAoClicarFora();

    if (!modalAberto) return null;

    return (
        <div {...fecharAoClicarFora(fecharModalOS)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div onClick={(e) => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-6xl rounded border border-gray-200 dark:border-darkBorder shadow-2xl flex flex-col max-h-[95vh] cursor-default overflow-hidden animate-modal-in">
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-xl tracking-tight">
                            {pedidoEmEdicao ? 'Editar Ordem de Serviço #' + pedidoEmEdicao.id : 'Nova Ordem de Serviço'}
                        </h3>
                        {isModalTrancado && <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded"><Icon name="lock" className="w-3 h-3" /> Trancado</span>}
                    </div>
                    <button type="button" onClick={fecharModalOS} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5" /></button>
                </div>

                <form onSubmit={(e) => salvarOS(e, false)} className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-7">
                    {isModalTrancado && <div className="p-3 bg-red-950/20 border border-red-900/50 rounded text-[11px] text-red-400">Nota liquidada. Peça para um Admin ou Financeiro destravar para edições.</div>}

                    <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 dark:border-darkBorder">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-brand rounded-full"></span>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Dados da O.S.</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Data da Venda</label>
                                <CustomDatePicker value={novoPedido.data_pedido} onChange={val => setNovoPedido({...novoPedido, data_pedido: val})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Prazo</label>
                                <CustomDatePicker value={novoPedido.prazo} onChange={val => setNovoPedido({...novoPedido, prazo: val})} disabled={isModalTrancado} placeholder="Data final..." className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status Inicial</label>
                                <CustomSelect
                                    value={novoPedido.status}
                                    onChange={(val) => setNovoPedido({...novoPedido, status: val})}
                                    disabled={isModalTrancado}
                                    className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2.5 text-[13px] outline-none focus:border-brand transition dark:text-white font-semibold cursor-pointer"
                                    options={opcoesStatusPermitidas.map(s => ({ value: s, label: s }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Resp.</label>
                                <MultiSelectDropdown
                                    value={novoPedido.responsavel}
                                    options={nomesResponsaveis}
                                    onChange={val => setNovoPedido({...novoPedido, responsavel: val})}
                                    disabled={isModalTrancado}
                                    className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Tags Especiais</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <button type="button" onClick={() => setNovoPedido({...novoPedido, entrega: !novoPedido.entrega})} disabled={isModalTrancado} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-[11px] font-semibold transition disabled:opacity-50 ${novoPedido.entrega ? 'text-white bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700' : 'bg-gray-100 text-gray-500 dark:bg-darkElevated dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkHover'}`}><Icon name="package" className="w-4 h-4"/> Entrega</button>
                                    <button type="button" onClick={() => setNovoPedido({...novoPedido, urgente: !novoPedido.urgente})} disabled={isModalTrancado} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-[11px] font-semibold transition disabled:opacity-50 ${novoPedido.urgente ? 'text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700' : 'bg-gray-100 text-gray-500 dark:bg-darkElevated dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkHover'}`}><Icon name="alert-triangle" className="w-3.5 h-3.5"/> Urgente</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Cliente / Empresa</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input required type="text" value={mascararCliente(buscaCliente, isDemo)} disabled={isModalTrancado}
                                        onChange={e => { setBuscaCliente(e.target.value); setNovoPedido({...novoPedido, cliente: e.target.value}); setClienteDropdownAberto(true); }}
                                        onFocus={() => { if(!isModalTrancado) setClienteDropdownAberto(true); }} onBlur={() => setTimeout(() => setClienteDropdownAberto(false), 200)}
                                        className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Buscar cliente..." autoComplete="off" />
                                    <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    {clienteDropdownAberto && clientesFiltrados.length > 0 && (
                                        <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                            {clientesFiltrados.map(c => (
                                                <li key={c.id} onClick={() => { setBuscaCliente(c.nome); setNovoPedido({...novoPedido, cliente: c.nome}); setClienteDropdownAberto(false); }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex justify-between items-center transition"><span className="font-medium text-[13px] text-gray-800 dark:text-[#EDEDED]">{c.nome}</span><span className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">{c.telefone}</span></li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <Tooltip label="Novo Cliente">
                                    <button type="button" onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} disabled={isModalTrancado} aria-label="Novo Cliente" className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition disabled:opacity-50">
                                        <Icon name="plus" className="w-4 h-4 text-brand" />
                                    </button>
                                </Tooltip>
                            </div>
                            {!clienteDropdownAberto && buscaCliente && !isDemo && (() => {
                                const clienteSelecionado = clientesFiltrados.find(c => c.nome === buscaCliente);
                                return clienteSelecionado?.telefone ? (
                                    <p className="mt-1.5 text-[11px] text-gray-500 dark:text-[#A1A1AA] flex items-center gap-1">
                                        <Icon name="phone" className="w-3 h-3" /> {clienteSelecionado.telefone}
                                    </p>
                                ) : null;
                            })()}
                            {isClienteProblema(novoPedido.cliente) && (
                                <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded flex items-start gap-2.5 text-red-600 dark:text-red-400">
                                    <Icon name="alert-triangle" className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="text-[13px] font-semibold block">Atenção: Cliente Problemático</span>
                                        <span className="text-[11px]">Este cliente possui restrições ou histórico negativo na empresa. Fique atento.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* CARRINHO DE ITENS — destacado */}
                    <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-500/5">
                        <div className="rounded-t-xl px-5 py-3.5 bg-blue-100/60 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/20 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-white dark:bg-darkCard shadow-sm shrink-0"><Icon name="shopping-bag" className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                <h4 className="font-bold text-[13px] text-gray-800 dark:text-white">Carrinho de Itens do Orçamento</h4>
                            </div>
                            {itensPedido.length > 0 && (
                                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-darkCard px-2.5 py-1 rounded-full shadow-sm shrink-0">{itensPedido.length} {itensPedido.length === 1 ? 'item' : 'itens'}</span>
                            )}
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            {itensPedido.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {itensPedido.map((item, index) => (
                                        <div key={item.id_temp} onClick={() => {
                                            if (isModalTrancado) return;
                                            setItemAtual({ nome: item.nome || '', descricao: item.descricao || '', valor: item.valor_original || item.valor, desconto: item.desconto || '', local_producao: item.local_producao || 'Berlim', id_produto: item.id_produto || null });
                                            setBuscaProduto(item.nome || '');
                                            setItemEditandoId(item.id_temp);
                                        }} className={`flex justify-between items-start gap-3 p-3 bg-white dark:bg-darkElevated border rounded-lg shadow-sm transition ${itemEditandoId === item.id_temp ? 'border-brand ring-1 ring-brand' : 'border-gray-200 dark:border-darkBorder'} ${!isModalTrancado ? 'cursor-pointer hover:border-brand/60' : ''}`}>
                                            <div className="flex items-start gap-3 min-w-0">
                                                <span className="w-6 h-6 shrink-0 rounded-full bg-blue-100 dark:bg-blue-500/20 text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center justify-center mt-0.5">{index + 1}</span>
                                                <div className="flex flex-col min-w-0"><span className="font-semibold text-[13px] dark:text-white">{item.nome || 'Serviço Personalizado'}</span><span className="text-[11px] text-gray-500 dark:text-[#A1A1AA] whitespace-pre-wrap mt-1">{item.descricao}</span>{item.local_producao && <span className="text-[10px] bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded mt-1.5 w-max">Local: {item.local_producao}</span>}</div>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0"><div className="text-right"><span className="font-bold text-[13px] dark:text-white">R$ {item.valor}</span>{item.desconto && <span className="block text-[10px] text-brand font-medium">-{item.desconto}% desc</span>}</div><button type="button" disabled={isModalTrancado} onClick={(e) => { e.stopPropagation(); if (itemEditandoId === item.id_temp) { setItemEditandoId(null); setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null }); setBuscaProduto(''); } removerItemDoCarrinho(item.id_temp); }} className="text-red-400 hover:text-red-600 transition disabled:opacity-30"><Icon name="trash-2" className="w-4 h-4" /></button></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center opacity-70">
                                    <Icon name="shopping-bag" className="w-7 h-7 text-gray-300 dark:text-gray-600 mb-1.5" />
                                    <p className="text-[12px] text-gray-400 italic">Nenhum item adicionado ainda.</p>
                                </div>
                            )}

                            <div className="p-4 border-2 border-dashed border-blue-200 dark:border-blue-500/30 rounded-lg bg-white/60 dark:bg-darkElevated/40">
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input type="text" value={buscaProduto} disabled={isModalTrancado}
                                                onChange={e => { setBuscaProduto(e.target.value); setProdutoDropdownAberto(true); }}
                                                onFocus={() => { if(!isModalTrancado) { setProdutoDropdownAberto(true); atualizarCatalogoProdutos(); } }} onBlur={() => setTimeout(() => setProdutoDropdownAberto(false), 200)}
                                                className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Puxar item do catálogo (Opcional)..." autoComplete="off" />
                                            <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                            {produtoDropdownAberto && produtosFiltrados.length > 0 && (
                                                <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                    {produtosFiltrados.map(p => (
                                                        <li key={p.id} onClick={() => {
                                                            setBuscaProduto(p.nome);
                                                            setItemAtual({ ...itemAtual, nome: p.nome, descricao: p.texto_padrao, valor: formatarMoeda(Math.round(p.preco_base).toString()), desconto: '', id_produto: p.id });
                                                            setProdutoDropdownAberto(false);
                                                        }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex flex-col transition">
                                                            <div className="flex justify-between items-center"><span className="font-medium text-[13px] dark:text-[#EDEDED]">{p.nome}</span><span className="text-[11px] font-semibold text-brand">R$ {formatarValorFinanceiro(centavosParaReais(p.preco_base))}</span></div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {isAdmin && (
                                            <Tooltip label="Novo Produto">
                                                <button type="button" onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} disabled={isModalTrancado} aria-label="Novo Produto" className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition disabled:opacity-50">
                                                    <Icon name="plus" className="w-4 h-4 text-brand" />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>

                                    <textarea rows="2" value={itemAtual.descricao} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Especificações do item (Ex: Medida, quantidade, material...)"></textarea>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="relative col-span-2">
                                            <span className="absolute left-3 top-2.5 text-[11px] text-gray-400 font-medium z-[1]">Local:</span>
                                            <CustomSelect
                                                value={itemAtual.local_producao}
                                                onChange={(val) => setItemAtual({...itemAtual, local_producao: val})}
                                                disabled={isModalTrancado}
                                                className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-[52px] pr-3 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium"
                                                options={(fornecedores.length > 0 ? fornecedores.filter(f => !f.tipo || f.tipo === 'Produção').map(f => f.nome) : ['Berlim']).map(l => ({ value: l, label: l }))}
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-2.5 top-2.5 text-[11px] text-gray-400">R$</span>
                                            <input type="text" value={itemAtual.valor} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-7 pr-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium disabled:opacity-50" placeholder="Bruto" />
                                        </div>
                                        <div><input type="text" value={itemAtual.desconto} disabled={isModalTrancado} onChange={e => { let val = e.target.value.replace(/\D/g, ''); if (parseFloat(val) > 100) val = '100'; setItemAtual({...itemAtual, desconto: val}); }} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Desc. %" /></div>
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {itemEditandoId !== null && (
                                            <button type="button" onClick={() => { setItemEditandoId(null); setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null }); setBuscaProduto(''); }} className="px-3 py-2 text-[11px] font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-darkHover rounded transition">Cancelar</button>
                                        )}
                                        {itemEditandoId !== null ? (
                                            <button type="button" onClick={() => { salvarEdicaoItemCarrinho(itemEditandoId); setItemEditandoId(null); }} disabled={!itemAtual.descricao || !itemAtual.valor || isModalTrancado} className="flex-1 px-3 py-2 text-[11px] font-semibold bg-brand hover:bg-brandHover text-white rounded transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="check" className="w-3.5 h-3.5"/> Salvar Alterações</button>
                                        ) : (
                                            <button type="button" onClick={adicionarItemAoCarrinho} disabled={!itemAtual.descricao || !itemAtual.valor || isModalTrancado} className="flex-1 px-3 py-2 text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-darkHover dark:hover:bg-darkBorder text-gray-800 dark:text-white rounded border border-gray-200 dark:border-darkBorder transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5"/> Inserir Item no Orçamento</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PAGAMENTOS — destacado */}
                    {(() => {
                        const totalPago = pagamentosPedido.reduce((acc, p) => acc + parseValorMoeda(p.valor), 0);
                        const totalOS = parseValorMoeda(novoPedido.valor_total);
                        const saldo = totalOS - totalPago;
                        const coresFormaPagamento = { 'PIX': 'bg-teal-500', 'Boleto': 'bg-orange-500', 'Cartão de Crédito': 'bg-purple-500', 'Cartão de Débito': 'bg-blue-500', 'Dinheiro': 'bg-emerald-500', 'Link de Pagamento': 'bg-sky-500' };
                        return (
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/5">
                                <div className="rounded-t-xl px-5 py-3.5 bg-emerald-100/60 dark:bg-emerald-500/10 border-b border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-white dark:bg-darkCard shadow-sm shrink-0"><Icon name="dollar-sign" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
                                        <h4 className="font-bold text-[13px] text-gray-800 dark:text-white">Pagamentos</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-darkCard px-2.5 py-1 rounded-full shadow-sm">Pago: R$ {formatarValorFinanceiro(totalPago)}</span>
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm bg-white dark:bg-darkCard ${saldo > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>Saldo: R$ {formatarValorFinanceiro(saldo)}</span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col gap-4">
                                    {pagamentosPedido.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {pagamentosPedido.map((pag, idx) => (
                                                pagamentoEditandoIdx === idx ? (
                                                    <div key={idx} className="flex flex-col gap-2 bg-white dark:bg-darkElevated p-3.5 rounded-lg border border-brand shadow-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <CustomSelect
                                                                value={pagamentoEditando.forma}
                                                                onChange={(val) => setPagamentoEditando({...pagamentoEditando, forma: val})}
                                                                className="bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                                options={[
                                                                    { value: 'PIX', label: 'PIX' },
                                                                    { value: 'Boleto', label: 'Boleto' },
                                                                    { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
                                                                    { value: 'Cartão de Débito', label: 'Cartão de Débito' },
                                                                    { value: 'Dinheiro', label: 'Dinheiro' },
                                                                    { value: 'Link de Pagamento', label: 'Link de Pagamento' },
                                                                ]}
                                                            />
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-2 text-[10px] text-gray-400">R$</span>
                                                                <input type="text" value={pagamentoEditando.valor} onChange={e => setPagamentoEditando({...pagamentoEditando, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded pl-6 pr-2 py-1.5 text-[11px] outline-none" placeholder="Valor" />
                                                            </div>
                                                        </div>
                                                        {(() => {
                                                            const { mostrarInstituicao, mostrarParcelas, gridClass } = camposExtrasPagamento(pagamentoEditando.forma);
                                                            return (
                                                                <div className={`grid ${gridClass} gap-2`}>
                                                                    <CustomDatePicker
                                                                        value={pagamentoEditando.data}
                                                                        onChange={val => setPagamentoEditando({...pagamentoEditando, data: val})}
                                                                        placeholder="Data do pagamento"
                                                                        className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                                    />
                                                                    {mostrarInstituicao && (
                                                                        <CustomSelect
                                                                            value={pagamentoEditando.instituicao}
                                                                            onChange={(val) => setPagamentoEditando({...pagamentoEditando, instituicao: val})}
                                                                            className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                                            options={[
                                                                                { value: 'Itaú', label: 'Itaú' },
                                                                                { value: 'Infinite Pay', label: 'Infinite Pay' },
                                                                                { value: 'Pag Seguro', label: 'Pag Seguro' },
                                                                            ]}
                                                                        />
                                                                    )}
                                                                    {mostrarParcelas && (
                                                                        <CustomSelect
                                                                            value={pagamentoEditando.parcelas}
                                                                            onChange={(val) => setPagamentoEditando({...pagamentoEditando, parcelas: parseInt(val)})}
                                                                            className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                                            options={[1,2,3,4,5,6,7,8,9,10,11,12].map(n => ({ value: n, label: `${n}x` }))}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="flex gap-2 justify-end pt-1">
                                                            <button type="button" onClick={() => { setPagamentoEditandoIdx(null); setPagamentoEditando(null); }} className="text-[11px] font-semibold px-3 py-1.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                                            <button type="button" onClick={() => {
                                                                if (!pagamentoEditando.valor) return;
                                                                setPagamentosPedido(pagamentosPedido.map((p, i) => i === idx ? { ...p, ...pagamentoEditando } : p));
                                                                setPagamentoEditandoIdx(null);
                                                                setPagamentoEditando(null);
                                                            }} className="bg-brand hover:bg-brandHover text-white text-[11px] font-semibold px-3 py-1.5 rounded transition">Salvar</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                <div key={idx} onClick={() => { if (isModalTrancado) return; setPagamentoEditandoIdx(idx); setPagamentoEditando({ forma: 'PIX', parcelas: 1, instituicao: 'Itaú', data: obterDataAtual(), ...pag }); }} className={`flex justify-between items-center gap-3 bg-white dark:bg-darkElevated px-3.5 py-3 rounded-lg border border-gray-200 dark:border-darkBorder shadow-sm transition ${!isModalTrancado ? 'cursor-pointer hover:border-brand/60' : ''}`}>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${coresFormaPagamento[pag.forma] || 'bg-gray-400'}`}></span>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[13px] font-semibold dark:text-white truncate">{pag.forma} {pag.parcelas > 1 ? `(${pag.parcelas}x)` : ''}</span>
                                                            {pag.vencimento_boleto && (
                                                                <span className="text-[11px] text-orange-500 font-semibold">Vencimento: {pag.vencimento_boleto.split('-').reverse().join('/')}</span>
                                                            )}
                                                            <span className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">{pag.data}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-bold text-[13px] text-emerald-600 dark:text-emerald-400">R$ {pag.valor}</span>
                                                            {pag.instituicao && <span className="text-[10px] bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded mt-1.5 w-max">{pag.instituicao}</span>}
                                                        </div>
                                                        {!isModalTrancado && (
                                                            <button type="button" onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPagamentosPedido(pagamentosPedido.filter((_, i) => i !== idx));
                                                                if (pagamentoEditandoIdx === idx) { setPagamentoEditandoIdx(null); setPagamentoEditando(null); }
                                                                else if (pagamentoEditandoIdx > idx) { setPagamentoEditandoIdx(pagamentoEditandoIdx - 1); }
                                                            }} className="text-red-400 hover:text-red-600 transition"><Icon name="trash-2" className="w-4 h-4" /></button>
                                                        )}
                                                    </div>
                                                </div>
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center opacity-70">
                                            <Icon name="dollar-sign" className="w-7 h-7 text-gray-300 dark:text-gray-600 mb-1.5" />
                                            <p className="text-[12px] text-gray-400 italic">Nenhum pagamento registrado ainda.</p>
                                        </div>
                                    )}

                                    {!isModalTrancado && saldo > 0 && (
                                        <div className="flex flex-col gap-2 p-4 border-2 border-dashed border-emerald-200 dark:border-emerald-500/30 rounded-lg bg-white/60 dark:bg-darkElevated/40">
                                            <div className="grid grid-cols-2 gap-2">
                                                <CustomSelect
                                                    value={novoPagamento.forma}
                                                    onChange={(val) => setNovoPagamento({...novoPagamento, forma: val})}
                                                    className="bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                    options={[
                                                        { value: 'PIX', label: 'PIX' },
                                                        { value: 'Boleto', label: 'Boleto' },
                                                        { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
                                                        { value: 'Cartão de Débito', label: 'Cartão de Débito' },
                                                        { value: 'Dinheiro', label: 'Dinheiro' },
                                                        { value: 'Link de Pagamento', label: 'Link de Pagamento' },
                                                    ]}
                                                />
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2 text-[10px] text-gray-400">R$</span>
                                                    <input type="text" value={novoPagamento.valor} onChange={e => setNovoPagamento({...novoPagamento, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded pl-6 pr-2 py-1.5 text-[11px] outline-none" placeholder="Valor" />
                                                </div>
                                            </div>
                                            {(() => {
                                                const { mostrarInstituicao, mostrarParcelas, gridClass } = camposExtrasPagamento(novoPagamento.forma);
                                                return (
                                                    <div className={`grid ${gridClass} gap-2`}>
                                                        <CustomDatePicker
                                                            value={novoPagamento.data}
                                                            onChange={val => setNovoPagamento({...novoPagamento, data: val})}
                                                            placeholder="Data do pagamento"
                                                            className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                        />
                                                        {mostrarInstituicao && (
                                                            <CustomSelect
                                                                value={novoPagamento.instituicao}
                                                                onChange={(val) => setNovoPagamento({...novoPagamento, instituicao: val})}
                                                                className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                                options={[
                                                                    { value: 'Itaú', label: 'Itaú' },
                                                                    { value: 'Infinite Pay', label: 'Infinite Pay' },
                                                                    { value: 'Pag Seguro', label: 'Pag Seguro' },
                                                                ]}
                                                            />
                                                        )}
                                                        {mostrarParcelas && (
                                                            <CustomSelect
                                                                value={novoPagamento.parcelas}
                                                                onChange={(val) => setNovoPagamento({...novoPagamento, parcelas: parseInt(val)})}
                                                                className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none"
                                                                options={[1,2,3,4,5,6,7,8,9,10,11,12].map(n => ({ value: n, label: `${n}x` }))}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            <button type="button" onClick={() => {
                                                if (!novoPagamento.valor) return;
                                                setPagamentosPedido([...pagamentosPedido, { ...novoPagamento, data: novoPagamento.data || obterDataAtual() }]);

                                                // Atualiza sugerindo o restante
                                                const novoTotalPago = pagamentosPedido.reduce((acc, p) => acc + parseValorMoeda(p.valor), 0) + parseValorMoeda(novoPagamento.valor);
                                                const totalOSStr = parseValorMoeda(novoPedido.valor_total);
                                                const saldoRestante = totalOSStr - novoTotalPago;

                                                setNovoPagamento({ valor: saldoRestante > 0 ? formatarMoeda((saldoRestante * 100).toFixed(0).toString()) : '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', data: obterDataAtual() });
                                            }} className="w-full bg-brand hover:bg-brandHover text-white py-1.5 rounded text-[11px] font-semibold transition">Registrar Pagamento</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-3.5 bg-brand rounded-full"></span>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Observações Gerais ou Texto Complementar</h4>
                        </div>
                        <textarea rows="4" value={novoPedido.servico} onChange={e => setNovoPedido({...novoPedido, servico: e.target.value})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] custom-scrollbar disabled:opacity-50" placeholder="Prazos de entrega, observações do financeiro ou complementos da O.S..."></textarea>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-200 dark:border-darkBorder bg-gray-50/80 dark:bg-darkCard/80 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0 rounded-b-xl z-20 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] dark:shadow-none">

                    <div className="flex items-center gap-3 bg-white dark:bg-darkElevated px-4 py-3 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm w-full lg:w-auto justify-between lg:justify-start">
                        <span className="text-[11px] font-bold text-gray-400 dark:text-[#888888] uppercase tracking-widest mt-1">Total Final</span>
                        <div className="relative flex items-center justify-end">
                            <span className="font-bold text-[14px] text-gray-300 dark:text-gray-500 mr-1.5">R$</span>
                            <input required type="text" value={novoPedido.valor_total} onChange={e => setNovoPedido({...novoPedido, valor_total: formatarMoeda(e.target.value)})} disabled={isModalTrancado} className="bg-transparent border-none text-right font-black text-2xl text-brand outline-none disabled:opacity-50 w-28 sm:w-32 placeholder-brand/30" placeholder="0,00" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
                        {!isModalTrancado && (
                            <>
                                <button type="button" onClick={(e) => salvarOS(e, true)} disabled={salvandoOS} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-white dark:bg-darkCard text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                                    <Icon name="printer" className="w-4 h-4 shrink-0" />
                                    {salvandoOS ? 'Salvando...' : 'Salvar e Imprimir'}
                                </button>

                                <button type="button" onClick={(e) => salvarOS(e, false)} disabled={salvandoOS} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                                    <Icon name="save" className="w-4 h-4 shrink-0" />
                                    {salvandoOS ? 'Salvando...' : pedidoEmEdicao ? 'Atualizar' : 'Salvar OS'}
                                </button>

                                {novoPedido.status !== 'Finalizado' && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                                    <button type="button" onClick={(e) => {
                                        const tpago = pagamentosPedido.reduce((acc, p) => acc + parseValorMoeda(p.valor), 0);
                                        const tos = parseValorMoeda(novoPedido.valor_total);
                                        if ((tos - tpago) > 0) {
                                            alert("Não é possível finalizar a OS: O valor total ainda não foi pago.");
                                            return;
                                        }
                                        if (!window.confirm("Tem certeza que deseja finalizar esta OS?")) {
                                            return;
                                        }
                                        salvarOS(e, false, 'Finalizado');
                                    }} disabled={salvandoOS} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-600/50 whitespace-nowrap">
                                        <Icon name="check-circle" className="w-4 h-4 shrink-0" />
                                        Finalizar OS
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
