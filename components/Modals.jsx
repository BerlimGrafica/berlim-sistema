"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppContext, supabase } from "@/context/AppContext";
import Icon from "@/components/Icon";
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, formatarCnpjCpf, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, Switch, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

export default function Modals() {
    const { modalAberto, fecharModalOS, pedidoEmEdicao, isModalTrancado, novoPedido, setNovoPedido, opcoesStatusPermitidas, buscaCliente, setBuscaCliente, setClienteDropdownAberto, clienteDropdownAberto, clientesFiltrados, setNovoCliente, setModalClienteAberto, isClienteProblema, itensPedido, buscaProduto, setBuscaProduto, setProdutoDropdownAberto, produtoDropdownAberto, produtosFiltrados, setItemAtual, itemAtual, isAdmin, setNovoProduto, setModalProdutoAberto, fornecedores, pagamentosPedido, setPagamentosPedido, novoPagamento, setNovoPagamento, salvandoOS, usuario, modalProdutoAberto, novoProduto, modalOrcamentoPreAberto, setModalOrcamentoPreAberto, novoOrcamentoPre, setNovoOrcamentoPre, modalOrcamentoFormalizadoAberto, setModalOrcamentoFormalizadoAberto, orcamentoFormalizadoEmEdicao, modalFornecedorAberto, setModalFornecedorAberto, novoFornecedor, setNovoFornecedor, modalClienteAberto, novoCliente, salvandoCliente, modalEmpresaFaturamentoAberto, novaEmpresaFaturamento, setModalEmpresaFaturamentoAberto, setNovaEmpresaFaturamento, salvandoEmpresa, modalContaAberto, setModalContaAberto, novaConta, setNovaConta, salvandoConta, modalNotaFiscalAberto, notaFiscalEmEdicao, setModalNotaFiscalAberto, setNotaFiscalEmEdicao, salvandoNotaFiscal, modalUsuarioAberto, setModalUsuarioAberto, novoUsuario, setNovoUsuario, salvarOS, removerItemDoCarrinho, adicionarItemAoCarrinho, salvarProduto, salvarOrcamentoPre, salvarOrcamentoFormalizado, carregarDados, salvarCliente, salvarEmpresaFaturamento, salvarConta, salvarNotaFiscal, salvarUsuario, modalRequisicaoAberto, setModalRequisicaoAberto, novaRequisicao, setNovaRequisicao, salvarRequisicao, modalTarefaAberto, setModalTarefaAberto, novaTarefa, setNovaTarefa, salvarTarefa, modalLinkAberto, setModalLinkAberto, novoLink, setNovoLink, salvarLink, usuariosSistema } = useAppContext();
    const nomesResponsaveis = usuariosSistema.map(u => u.nome);

    return (
        <>
            {modalAberto && (
                <div onClick={fecharModalOS} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-3xl rounded border border-gray-200 dark:border-darkBorder shadow-2xl flex flex-col max-h-[95vh] cursor-default overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-xl tracking-tight">
                                    {pedidoEmEdicao ? 'Editar Ordem de Serviço #' + pedidoEmEdicao.id : 'Nova Ordem de Serviço'}
                                </h3>
                                {isModalTrancado && <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded"><Icon name="lock" className="w-3 h-3" /> Trancado</span>}
                            </div>
                            <button type="button" onClick={fecharModalOS} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5" /></button>
                        </div>
                        
                        <form onSubmit={(e) => salvarOS(e, false)} className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            {isModalTrancado && <div className="p-3 bg-red-950/20 border border-red-900/50 rounded text-[11px] text-red-400 mb-2">Nota liquidada. Peça para um Admin ou Financeiro destravar para edições.</div>}
                            
                            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-100 dark:border-darkBorder">
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
                                    <div className="relative">
                                        <select required value={novoPedido.status} onChange={e => setNovoPedido({...novoPedido, status: e.target.value})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2.5 text-[13px] outline-none focus:border-brand transition dark:text-white font-semibold cursor-pointer appearance-none disabled:opacity-50">
                                            {opcoesStatusPermitidas.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <Icon name="chevron-down" className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
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
                                        <input required type="text" value={buscaCliente} disabled={isModalTrancado}
                                            onChange={e => { setBuscaCliente(e.target.value); setNovoPedido({...novoPedido, cliente: e.target.value}); setClienteDropdownAberto(true); }}
                                            onFocus={() => { if(!isModalTrancado) setClienteDropdownAberto(true); }} onBlur={() => setTimeout(() => setClienteDropdownAberto(false), 200)}
                                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Buscar cliente..." autoComplete="off" />
                                        <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        {clienteDropdownAberto && clientesFiltrados.length > 0 && (
                                            <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                {clientesFiltrados.map(c => (
                                                    <li key={c.id} onClick={() => { setBuscaCliente(c.nome); setNovoPedido({...novoPedido, cliente: c.nome}); setClienteDropdownAberto(false); }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex justify-between items-center transition"><span className="font-medium text-[13px] text-gray-800 dark:text-[#EDEDED]">{c.nome}</span><span className="text-[11px] text-gray-500">{c.telefone}</span></li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} disabled={isModalTrancado} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition disabled:opacity-50" title="Novo Cliente">
                                        <Icon name="plus" className="w-4 h-4 text-brand" />
                                    </button>
                                </div>
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

                            <div>
                                <label className="block text-[13px] font-medium mb-3 text-gray-700 dark:text-[#EDEDED]">Carrinho de Itens do Orçamento</label>
                                {itensPedido.length > 0 ? (
                                    <div className="mb-4 flex flex-col gap-2">
                                        {itensPedido.map((item, index) => (
                                            <div key={item.id_temp} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded shadow-sm">
                                                <div className="flex flex-col"><span className="font-semibold text-[13px] dark:text-white">{index + 1}. {item.nome || 'Serviço Personalizado'}</span><span className="text-[11px] text-gray-500 dark:text-[#A1A1AA] whitespace-pre-wrap mt-1">{item.descricao}</span>{item.local_producao && <span className="text-[10px] bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded mt-1.5 w-max">Local: {item.local_producao}</span>}</div>
                                                <div className="flex items-center gap-4"><div className="text-right"><span className="font-semibold text-[13px] dark:text-white">R$ {item.valor}</span>{item.desconto && <span className="block text-[10px] text-brand font-medium">-{item.desconto}% desc</span>}</div><button type="button" disabled={isModalTrancado} onClick={() => removerItemDoCarrinho(item.id_temp)} className="text-red-500 hover:text-red-600 transition disabled:opacity-30"><Icon name="trash-2" className="w-4 h-4" /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-gray-500 dark:text-[#666] mb-4 italic">Nenhum item adicionado de forma estruturada.</p>
                                )}

                                <div className="p-4 border border-dashed border-gray-300 dark:border-darkBorder rounded bg-transparent">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input type="text" value={buscaProduto} disabled={isModalTrancado} 
                                                    onChange={e => { setBuscaProduto(e.target.value); setProdutoDropdownAberto(true); }}
                                                    onFocus={() => { if(!isModalTrancado) setProdutoDropdownAberto(true); }} onBlur={() => setTimeout(() => setProdutoDropdownAberto(false), 200)}
                                                    className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Puxar item do catálogo (Opcional)..." autoComplete="off" />
                                                <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                {produtoDropdownAberto && produtosFiltrados.length > 0 && (
                                                    <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                        {produtosFiltrados.map(p => (
                                                            <li key={p.id} onClick={() => { 
                                                                setBuscaProduto(p.nome);
                                                                setItemAtual({ ...itemAtual, nome: p.nome, descricao: p.texto_padrao, valor: formatarMoeda((p.preco_base * 100).toFixed(0).toString()), desconto: '', id_produto: p.id }); 
                                                                setProdutoDropdownAberto(false); 
                                                            }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex flex-col transition">
                                                                <div className="flex justify-between items-center"><span className="font-medium text-[13px] dark:text-[#EDEDED]">{p.nome}</span><span className="text-[11px] font-semibold text-brand">R$ {formatarValorFinanceiro(Number(p.preco_base))}</span></div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button type="button" onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} disabled={isModalTrancado} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition disabled:opacity-50" title="Novo Produto">
                                                    <Icon name="plus" className="w-4 h-4 text-brand" />
                                                </button>
                                            )}
                                        </div>

                                        <textarea rows="2" value={itemAtual.descricao} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Especificações do item (Ex: Medida, quantidade, material...)"></textarea>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="relative col-span-2">
                                                <span className="absolute left-3 top-2.5 text-[11px] text-gray-400 font-medium">Local:</span>
                                                <select value={itemAtual.local_producao} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, local_producao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-[52px] pr-8 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium appearance-none disabled:opacity-50">
                                                    {(fornecedores.length > 0 ? fornecedores.filter(f => !f.tipo || f.tipo === 'Produção').map(f => f.nome) : ['Berlim']).map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-2.5 text-[11px] text-gray-400">R$</span>
                                                <input type="text" value={itemAtual.valor} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-7 pr-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium disabled:opacity-50" placeholder="Bruto" />
                                            </div>
                                            <div><input type="text" value={itemAtual.desconto} disabled={isModalTrancado} onChange={e => { let val = e.target.value.replace(/\D/g, ''); if (parseFloat(val) > 100) val = '100'; setItemAtual({...itemAtual, desconto: val}); }} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Desc. %" /></div>
                                        </div>
                                        <button type="button" onClick={adicionarItemAoCarrinho} disabled={!itemAtual.descricao || !itemAtual.valor || isModalTrancado} className="w-full mt-3 px-3 py-2 text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-darkHover dark:hover:bg-darkBorder text-gray-800 dark:text-white rounded border border-gray-200 dark:border-darkBorder transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5"/> Inserir Item no Orçamento</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-darkBorder">
                                <label className="block text-[13px] font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Histórico de Pagamentos</label>
                                {pagamentosPedido.length > 0 && (
                                    <div className="mb-3 flex flex-col gap-2">
                                        {pagamentosPedido.map((pag, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-darkElevated px-3 py-2 rounded border border-gray-100 dark:border-darkBorder">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-medium dark:text-white">{pag.forma} {pag.parcelas > 1 ? `(${pag.parcelas}x)` : ''}</span>
                                                    {pag.vencimento_boleto && (
                                                        <span className="text-[11px] text-orange-500 font-semibold ml-2">Vencimento: {pag.vencimento_boleto.split('-').reverse().join('/')}</span>
                                                    )}
                                                    <span className="text-[11px] text-gray-500 ml-2">{pag.data}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-[13px] text-emerald-600 dark:text-emerald-400">R$ {pag.valor}</span>
                                                    {!isModalTrancado && (
                                                        <button type="button" onClick={() => setPagamentosPedido(pagamentosPedido.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><Icon name="trash-2" className="w-4 h-4" /></button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {(() => {
                                    const totalPago = pagamentosPedido.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                    const totalOS = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                    const saldo = totalOS - totalPago;
                                    return (
                                        <>
                                            <div className="mb-4 flex justify-between items-center text-[13px]">
                                                <span className="text-gray-600 dark:text-gray-400">Total Pago: <strong className="text-emerald-600">R$ {formatarValorFinanceiro(totalPago)}</strong></span>
                                                <span className="text-gray-600 dark:text-gray-400">Saldo Devedor: <strong className={saldo > 0 ? "text-red-500" : "text-gray-400"}>R$ {formatarValorFinanceiro(saldo)}</strong></span>
                                            </div>

                                            {!isModalTrancado && saldo > 0 && (
                                                <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded mb-4">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <select value={novoPagamento.forma} onChange={e => setNovoPagamento({...novoPagamento, forma: e.target.value})} className="bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none">
                                                            <option value="PIX">PIX</option>
                                                            <option value="Boleto">Boleto</option>
                                                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                                                            <option value="Cartão de Débito">Cartão de Débito</option>
                                                            <option value="Dinheiro">Dinheiro</option>
                                                            <option value="Link de Pagamento">Link de Pagamento</option>
                                                        </select>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-[10px] text-gray-400">R$</span>
                                                            <input type="text" value={novoPagamento.valor} onChange={e => setNovoPagamento({...novoPagamento, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded pl-6 pr-2 py-1.5 text-[11px] outline-none" placeholder="Valor" />
                                                        </div>
                                                    </div>
                                                    {(novoPagamento.forma === 'PIX' || novoPagamento.forma === 'Link de Pagamento') && (
                                                        <div>
                                                            <select value={novoPagamento.instituicao} onChange={e => setNovoPagamento({...novoPagamento, instituicao: e.target.value})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none">
                                                                <option value="Itaú">Itaú</option>
                                                                <option value="Infinite Pay">Infinite Pay</option>
                                                                <option value="Pag Seguro">Pag Seguro</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {(novoPagamento.forma === 'Cartão de Crédito' || novoPagamento.forma === 'Link de Pagamento') && (
                                                        <div>
                                                            <select value={novoPagamento.parcelas} onChange={e => setNovoPagamento({...novoPagamento, parcelas: parseInt(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none">
                                                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                    <button type="button" onClick={() => {
                                                        if (!novoPagamento.valor) return;
                                                        setPagamentosPedido([...pagamentosPedido, { ...novoPagamento, data: obterDataAtual() }]);
                                                        
                                                        // Atualiza sugerindo o restante
                                                        const novoTotalPago = pagamentosPedido.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0) + parseFloat(String(novoPagamento.valor).replace(/\./g, '').replace(',', '.'));
                                                        const totalOSStr = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                                        const saldoRestante = totalOSStr - novoTotalPago;
                                                        
                                                        setNovoPagamento({ valor: saldoRestante > 0 ? formatarMoeda((saldoRestante * 100).toFixed(0).toString()) : '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú' });
                                                    }} className="w-full bg-brand hover:bg-brandHover text-white py-1.5 rounded text-[11px] font-semibold transition">Registrar Pagamento</button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Observações Gerais ou Texto Complementar</label>
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
                                                const tpago = pagamentosPedido.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                                const tos = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                                if ((tos - tpago) > 0) {
                                                    alert("Não é possível finalizar a OS: O valor total ainda não foi pago.");
                                                    return;
                                                }
                                                novoPedido.status = 'Finalizado';
                                                salvarOS(e, false);
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
            )}
{modalProdutoAberto && (
                <div onClick={() => setModalProdutoAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoProduto.id ? 'Editar Produto' : 'Novo Produto'}</h3><button onClick={() => setModalProdutoAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarProduto} className="p-6 flex flex-col gap-4">
                            <input required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome" />
                            <textarea rows="2" value={novoProduto.texto_padrao} onChange={e => setNovoProduto({...novoProduto, texto_padrao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Descrição"></textarea>
                            <input required value={novoProduto.preco_base} onChange={e => setNovoProduto({...novoProduto, preco_base: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white font-medium transition" placeholder="0,00" />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalProdutoAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-white text-black hover:bg-gray-200 transition">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}
{modalOrcamentoPreAberto && (
                <div onClick={() => setModalOrcamentoPreAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoOrcamentoPre.id ? 'Editar Modelo' : 'Novo Modelo'}</h3><button onClick={() => setModalOrcamentoPreAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarOrcamentoPre} className="p-6 flex flex-col gap-4">
                            <input required value={novoOrcamentoPre.titulo} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, titulo: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Título (Ex: Adesivos Redondos)" />
                            <div className="w-full">
                                <InlineDropdown 
                                    value={novoOrcamentoPre.empresa || 'Berlim'} 
                                    options={['Berlim', 'Futura']} 
                                    onChange={val => setNovoOrcamentoPre({...novoOrcamentoPre, empresa: val})} 
                                    className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none hover:border-brand dark:text-white transition"
                                />
                            </div>

                            <textarea rows="6" required value={novoOrcamentoPre.texto} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, texto: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition custom-scrollbar" placeholder="Cole aqui o texto do orçamento..."></textarea>
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOrcamentoPreAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}
{modalOrcamentoFormalizadoAberto && (
                <div onClick={() => setModalOrcamentoFormalizadoAberto(false)} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-3xl rounded border border-gray-200 dark:border-darkBorder shadow-2xl flex flex-col max-h-[95vh] cursor-default overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-xl tracking-tight">
                                    {orcamentoFormalizadoEmEdicao ? 'Editar Orçamento Formalizado' : 'Novo Orçamento Formalizado'}
                                </h3>
                            </div>
                            <button type="button" onClick={() => setModalOrcamentoFormalizadoAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5" /></button>
                        </div>
                        
                        <form className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Cliente / Empresa</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input required type="text" value={buscaCliente}
                                            onChange={e => { setBuscaCliente(e.target.value); setNovoPedido({...novoPedido, cliente: e.target.value}); setClienteDropdownAberto(true); }}
                                            onFocus={() => { setClienteDropdownAberto(true); }} onBlur={() => setTimeout(() => setClienteDropdownAberto(false), 200)}
                                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Buscar cliente..." autoComplete="off" />
                                        <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        {clienteDropdownAberto && clientesFiltrados.length > 0 && (
                                            <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                {clientesFiltrados.map(c => (
                                                    <li key={c.id} onClick={() => { setBuscaCliente(c.nome); setNovoPedido({...novoPedido, cliente: c.nome}); setClienteDropdownAberto(false); }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex justify-between items-center transition"><span className="font-medium text-[13px] text-gray-800 dark:text-[#EDEDED]">{c.nome}</span><span className="text-[11px] text-gray-500">{c.telefone}</span></li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition" title="Novo Cliente">
                                        <Icon name="plus" className="w-4 h-4 text-brand" />
                                    </button>
                                </div>
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

                            <div>
                                <label className="block text-[13px] font-medium mb-3 text-gray-700 dark:text-[#EDEDED]">Carrinho de Itens do Orçamento</label>
                                {itensPedido.length > 0 ? (
                                    <div className="mb-4 flex flex-col gap-2">
                                        {itensPedido.map((item, index) => (
                                            <div key={item.id_temp} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded shadow-sm">
                                                <div className="flex flex-col"><span className="font-semibold text-[13px] dark:text-white">{index + 1}. {item.nome || 'Serviço Personalizado'}</span><span className="text-[11px] text-gray-500 dark:text-[#A1A1AA] whitespace-pre-wrap mt-1">{item.descricao}</span>{item.local_producao && <span className="text-[10px] bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded mt-1.5 w-max">Local: {item.local_producao}</span>}</div>
                                                <div className="flex items-center gap-4"><div className="text-right"><span className="font-semibold text-[13px] dark:text-white">R$ {item.valor}</span>{item.desconto && <span className="block text-[10px] text-brand font-medium">-{item.desconto}% desc</span>}</div><button type="button" onClick={() => removerItemDoCarrinho(item.id_temp)} className="text-red-500 hover:text-red-600 transition"><Icon name="trash-2" className="w-4 h-4" /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-gray-500 dark:text-[#666] mb-4 italic">Nenhum item adicionado de forma estruturada.</p>
                                )}

                                <div className="p-4 border border-dashed border-gray-300 dark:border-darkBorder rounded bg-transparent">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input type="text" value={buscaProduto} 
                                                    onChange={e => { setBuscaProduto(e.target.value); setProdutoDropdownAberto(true); }}
                                                    onFocus={() => { setProdutoDropdownAberto(true); }} onBlur={() => setTimeout(() => setProdutoDropdownAberto(false), 200)}
                                                    className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Puxar item do catálogo (Opcional)..." autoComplete="off" />
                                                <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                {produtoDropdownAberto && produtosFiltrados.length > 0 && (
                                                    <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                        {produtosFiltrados.map(p => (
                                                            <li key={p.id} onClick={() => { 
                                                                setBuscaProduto(p.nome);
                                                                setItemAtual({ ...itemAtual, nome: p.nome, descricao: p.texto_padrao, valor: formatarMoeda((p.preco_base * 100).toFixed(0).toString()), desconto: '', id_produto: p.id }); 
                                                                setProdutoDropdownAberto(false); 
                                                            }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex flex-col transition">
                                                                <div className="flex justify-between items-center"><span className="font-medium text-[13px] dark:text-[#EDEDED]">{p.nome}</span><span className="text-[11px] font-semibold text-brand">R$ {formatarValorFinanceiro(Number(p.preco_base))}</span></div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button type="button" onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition" title="Novo Produto">
                                                    <Icon name="plus" className="w-4 h-4 text-brand" />
                                                </button>
                                            )}
                                        </div>

                                        <textarea rows="2" value={itemAtual.descricao} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Especificações do item (Ex: Medida, quantidade, material...)"></textarea>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="relative col-span-2">
                                                <span className="absolute left-3 top-2.5 text-[11px] text-gray-400 font-medium">Local:</span>
                                                <select value={itemAtual.local_producao} onChange={e => setItemAtual({...itemAtual, local_producao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-[52px] pr-8 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium appearance-none">
                                                    {(fornecedores.length > 0 ? fornecedores.filter(f => !f.tipo || f.tipo === 'Produção').map(f => f.nome) : ['Berlim']).map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-2.5 text-[11px] text-gray-400">R$</span>
                                                <input type="text" value={itemAtual.valor} onChange={e => setItemAtual({...itemAtual, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-7 pr-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Bruto" />
                                            </div>
                                            <div><input type="text" value={itemAtual.desconto} onChange={e => { let val = e.target.value.replace(/\D/g, ''); if (parseFloat(val) > 100) val = '100'; setItemAtual({...itemAtual, desconto: val}); }} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Desc. %" /></div>
                                        </div>
                                        <button type="button" onClick={adicionarItemAoCarrinho} disabled={!itemAtual.descricao || !itemAtual.valor} className="w-full mt-3 px-3 py-2 text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-darkHover dark:hover:bg-darkBorder text-gray-800 dark:text-white rounded border border-gray-200 dark:border-darkBorder transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5"/> Inserir Item no Orçamento</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-darkBorder">
                                <label className="block text-[13px] font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Observações Gerais ou Texto Complementar</label>
                                <textarea rows="4" value={novoPedido.servico} onChange={e => setNovoPedido({...novoPedido, servico: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] custom-scrollbar" placeholder="Detalhes adicionais, garantias, etc..."></textarea>
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-darkBorder bg-gray-50/80 dark:bg-darkCard/80 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0 rounded-b-xl z-20 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] dark:shadow-none">
                            <div className="flex items-center gap-3 bg-white dark:bg-darkElevated px-4 py-3 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm w-full lg:w-auto justify-between lg:justify-start">
                                <span className="text-[11px] font-bold text-gray-400 dark:text-[#888888] uppercase tracking-widest mt-1">Total Final</span>
                                <div className="relative flex items-center justify-end">
                                    <span className="font-bold text-[14px] text-gray-300 dark:text-gray-500 mr-1.5">R$</span>
                                    <input required type="text" value={novoPedido.valor_total} onChange={e => setNovoPedido({...novoPedido, valor_total: formatarMoeda(e.target.value)})} className="bg-transparent border-none text-right font-black text-2xl text-brand outline-none w-28 sm:w-32 placeholder-brand/30" placeholder="0,00" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
                                <button type="button" onClick={(e) => salvarOrcamentoFormalizado(e, true)} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-white dark:bg-darkCard text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap">
                                    <Icon name="file-text" className="w-4 h-4 shrink-0" />
                                    Salvar e Baixar PDF
                                </button>
                                <button type="button" onClick={(e) => salvarOrcamentoFormalizado(e, false)} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition flex items-center justify-center gap-2 whitespace-nowrap">
                                    <Icon name="save" className="w-4 h-4 shrink-0" />
                                    {orcamentoFormalizadoEmEdicao ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
{modalFornecedorAberto && (
                <div onClick={() => setModalFornecedorAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div onClick={e => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg rounded shadow-2xl w-full max-w-md overflow-hidden cursor-default border border-gray-100 dark:border-darkBorder animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-darkBorder bg-gray-50/50 dark:bg-darkHover/30 flex justify-between items-center">
                            <div>
                                <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-wide">{novoFornecedor.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Preencha os dados do local de produção</p>
                            </div>
                            <button type="button" onClick={() => setModalFornecedorAberto(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition p-1"><Icon name="x" className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide uppercase">Nome / Local *</label>
                                <input type="text" required value={novoFornecedor.nome} onChange={e => setNovoFornecedor({...novoFornecedor, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Ex: Gráfica XYZ, Futura..." />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide uppercase">Tipo de Fornecedor</label>
                                <div className="relative">
                                    <select value={novoFornecedor.tipo || 'Produção'} onChange={e => setNovoFornecedor({...novoFornecedor, tipo: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium appearance-none cursor-pointer">
                                        <option value="Material">Material</option>
                                        <option value="Produção">Produção</option>
                                        <option value="Manutenção">Manutenção</option>
                                    </select>
                                    <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide uppercase">Contato (Telefone, E-mail)</label>
                                <input type="text" value={novoFornecedor.contato} onChange={e => setNovoFornecedor({...novoFornecedor, contato: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Ex: (11) 9999-9999" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide uppercase">Observações</label>
                                <textarea rows="3" value={novoFornecedor.observacoes} onChange={e => setNovoFornecedor({...novoFornecedor, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium resize-none custom-scrollbar" placeholder="Dados bancários, prazo padrão..." />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-darkHover/30 border-t border-gray-100 dark:border-darkBorder flex justify-end gap-3">
                            <button type="button" onClick={() => setModalFornecedorAberto(false)} className="px-4 py-2 text-[12px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkHover rounded transition">Cancelar</button>
                            <button type="button" onClick={async () => {
                                if(!novoFornecedor.nome) return alert('Nome é obrigatório');
                                if (novoFornecedor.id) await supabase.from('fornecedores').update({ nome: novoFornecedor.nome, contato: novoFornecedor.contato, observacoes: novoFornecedor.observacoes, tipo: novoFornecedor.tipo }).eq('id', novoFornecedor.id);
                                else await supabase.from('fornecedores').insert([{ nome: novoFornecedor.nome, contato: novoFornecedor.contato, observacoes: novoFornecedor.observacoes, tipo: novoFornecedor.tipo || 'Produção' }]);
                                carregarDados();
                                setModalFornecedorAberto(false);
                            }} className="bg-brand hover:bg-brandHover text-white px-5 py-2 text-[12px] font-semibold rounded shadow-sm transition">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
{modalClienteAberto && (
                <div onClick={() => setModalClienteAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoCliente.id ? 'Editar Cliente' : 'Novo Cliente'}</h3><button onClick={() => setModalClienteAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarCliente} className="p-6 flex flex-col gap-4">
                            <input required value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome *" />
                            <div className="grid grid-cols-2 gap-4"><input value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: formatarTelefone(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="WhatsApp" /><input type="email" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="E-mail" /></div>
                            <textarea rows="2" value={novoCliente.observacoes} onChange={e => setNovoCliente({...novoCliente, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Observações"></textarea>
                            <label className="flex items-center justify-between gap-2 cursor-pointer mt-1 p-2 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded transition hover:bg-red-100 dark:hover:bg-red-900/30">
                                <span className="text-[13px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5"><Icon name="alert-triangle" className="w-4 h-4" /> Sinalizar como Cliente Problema</span>
                                <Switch checked={novoCliente.cliente_problema} onChange={val => setNovoCliente({...novoCliente, cliente_problema: val})} color="red" />
                            </label>
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalClienteAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" disabled={salvandoCliente} className="px-5 py-2 rounded text-[13px] font-medium bg-white text-black hover:bg-gray-200 transition disabled:opacity-50">{salvandoCliente ? 'Salvando...' : 'Salvar'}</button></div>
                        </form>
                    </div>
                </div>
            )}
{modalEmpresaFaturamentoAberto && (
                <div onClick={() => setModalEmpresaFaturamentoAberto(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-darkCard rounded-xl shadow-2xl w-full max-w-md overflow-hidden fade-in border border-gray-100 dark:border-darkBorder">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50/50 dark:bg-darkHover/50">
                            <h2 className="text-[15px] font-bold text-gray-800 dark:text-[#EDEDED] flex items-center gap-2">
                                <Icon name="check-circle" className="w-4 h-4 text-blue-500" />
                                {novaEmpresaFaturamento.id ? 'Editar Empresa' : 'Adicionar Empresa'}
                            </h2>
                            <button onClick={() => setModalEmpresaFaturamentoAberto(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"><Icon name="x" className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={salvarEmpresaFaturamento} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-[#888888] mb-1.5 uppercase tracking-wider">Nome da Empresa</label>
                                    <input type="text" required value={novaEmpresaFaturamento.nome} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, nome: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="Razão Social ou Fantasia" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-[#888888] mb-1.5 uppercase tracking-wider">CNPJ/CPF</label>
                                    <input type="text" required value={novaEmpresaFaturamento.cnpj} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, cnpj: formatarCnpjCpf(e.target.value)})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="00.000.000/0000-00" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-[#888888] mb-1.5 uppercase tracking-wider">Status</label>
                                    <select required value={novaEmpresaFaturamento.status} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, status: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow">
                                        <option value="Aprovado">Aprovado</option>
                                        <option value="Bloqueado">Bloqueado</option>
                                        <option value="Em Análise">Em Análise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-[#888888] mb-1.5 uppercase tracking-wider">Observações</label>
                                    <textarea value={novaEmpresaFaturamento.observacoes || ''} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="Observações opcionais" rows="2"></textarea>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setModalEmpresaFaturamentoAberto(false)} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 dark:text-[#888888] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                <button type="submit" disabled={salvandoEmpresa} className="px-6 py-2 rounded-lg text-[13px] font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition disabled:opacity-50">
                                    {salvandoEmpresa ? 'Salvando...' : 'Salvar Empresa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
{modalContaAberto && (
                <div onClick={() => setModalContaAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard">
                            <h3 className="font-semibold text-lg dark:text-white tracking-tight">{novaConta.id ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</h3>
                            <button onClick={() => setModalContaAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button>
                        </div>
                        <form onSubmit={salvarConta} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Descrição</label>
                                <input required value={novaConta.descricao} onChange={e => setNovaConta({...novaConta, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: Conta de Energia" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase">Valor (R$)</label>
                                    <input required value={novaConta.valor} onChange={e => setNovaConta({...novaConta, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white font-medium transition" placeholder="0,00" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase">Vencimento</label>
                                    <CustomDatePicker value={novaConta.vencimento} onChange={val => setNovaConta({...novaConta, vencimento: val})} placeholder="Selecione uma data" className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Status</label>
                                <select value={novaConta.status} onChange={e => setNovaConta({...novaConta, status: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition">
                                    <option value="Pendente">Pendente</option>
                                    <option value="Pago">Pago</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 mt-1">
                                <label className="flex items-center justify-between gap-2 cursor-pointer">
                                    <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Conta Recorrente?</span>
                                    <Switch checked={novaConta.recorrente || false} onChange={val => setNovaConta({...novaConta, recorrente: val})} />
                                </label>
                                {novaConta.recorrente && (
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6">Ao marcar esta conta como &ldquo;Pago&rdquo;, uma nova cobrança pendente é criada automaticamente com o mesmo vencimento, para você só preencher o valor na próxima vez.</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" onClick={() => setModalContaAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                <button type="submit" disabled={salvandoConta} className="px-5 py-2 rounded text-[13px] font-medium bg-white text-black hover:bg-gray-200 transition disabled:opacity-50">
                                    {salvandoConta ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
{modalNotaFiscalAberto && notaFiscalEmEdicao && (
                <div onClick={() => setModalNotaFiscalAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-2xl rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard shrink-0"><h3 className="font-semibold text-lg dark:text-white tracking-tight">Detalhes e Edição da Nota Fiscal</h3><button onClick={() => setModalNotaFiscalAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="bg-gray-50 dark:bg-darkElevated p-4 rounded border border-gray-100 dark:border-darkBorder mb-6">
                                <h4 className="font-semibold text-[13px] text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Dados do Cliente (Link)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div><label className="text-[11px] text-gray-500">Razão Social</label><div className="flex items-center gap-2"><div className="text-[13px] dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.razao_social || '---'}</div>{notaFiscalEmEdicao.razao_social && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.razao_social)} className="text-gray-400 hover:text-brand transition shrink-0" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-[11px] text-gray-500">CNPJ</label><div className="flex items-center gap-2"><div className="text-[13px] dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.cnpj || '---'}</div>{notaFiscalEmEdicao.cnpj && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.cnpj)} className="text-gray-400 hover:text-brand transition shrink-0" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-[11px] text-gray-500">Endereço</label><div className="flex items-center gap-2"><div className="text-[13px] dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.endereco || '---'}</div>{notaFiscalEmEdicao.endereco && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.endereco)} className="text-gray-400 hover:text-brand transition shrink-0" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-[11px] text-gray-500">Contato</label><div className="text-[13px] dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.contato || '---'}</div></div>
                                </div>
                            </div>
                            <form id="formNota" onSubmit={salvarNotaFiscal} className="space-y-4">
                                <h4 className="font-semibold text-[13px] text-gray-700 dark:text-gray-300 uppercase tracking-wider">Preenchimento Interno</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Cliente (Identificação Interna)</label>
                                        <input value={notaFiscalEmEdicao.cliente || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, cliente: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome Fantasia / Cliente" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-600 dark:text-[#888888] uppercase mb-1 block">Tipo de Nota</label>
                                        <InlineDropdown
                                            value={notaFiscalEmEdicao.tipo_nota}
                                            options={['DANFE', 'Serviço']}
                                            onChange={val => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, tipo_nota: val})}
                                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none hover:border-brand dark:text-white transition"
                                            hasIndefinido={true}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[11px] font-semibold text-gray-600 dark:text-[#888888] uppercase mb-1 block">Serviço Feito</label>
                                        <input value={notaFiscalEmEdicao.servico_feito || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, servico_feito: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Qual foi o serviço?" />
                                    </div>
                                    <div className={notaFiscalEmEdicao.tipo_nota === 'DANFE' ? '' : 'col-span-2'}>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Valor Pago (R$)</label>
                                        <input type="text" value={notaFiscalEmEdicao.valor_pago || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, valor_pago: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="0,00" />
                                    </div>
                                    {notaFiscalEmEdicao.tipo_nota === 'DANFE' && (
                                        <>
                                            <div>
                                                <label className="text-[11px] text-gray-500 mb-1 block">Forma de Pagamento</label>
                                                <input value={notaFiscalEmEdicao.forma_pagamento || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, forma_pagamento: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: PIX, Boleto, Cartão..." />
                                            </div>
                                            <div>
                                                <label className="text-[11px] text-gray-500 mb-1 block">Forma de Transporte</label>
                                                <input value={notaFiscalEmEdicao.forma_transporte || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, forma_transporte: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: CIF, FOB, Retirada..." />
                                            </div>
                                        </>
                                    )}
                                    <div className="col-span-2">
                                        <label className="text-[11px] text-gray-500 mb-1 block">Observações</label>
                                        <textarea rows="2" value={notaFiscalEmEdicao.observacoes || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Anotações internas..."></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-darkBorder shrink-0">
                            <button type="button" onClick={() => setModalNotaFiscalAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                            <button type="submit" form="formNota" disabled={salvandoNotaFiscal} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition disabled:opacity-50">{salvandoNotaFiscal ? 'Salvando...' : 'Salvar Alterações'}</button>
                        </div>
                    </div>
                </div>
            )}
{modalUsuarioAberto && (
                <div onClick={() => setModalUsuarioAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoUsuario.id ? 'Editar Conta' : 'Nova Conta de Acesso'}</h3><button onClick={() => setModalUsuarioAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarUsuario} className="p-6 flex flex-col gap-4">
                            <input required value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome de Acesso" />
                            <input required type="password" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Senha" />
                            
                            <div className="relative">
                                <select value={novoUsuario.nivel} onChange={e => setNovoUsuario({...novoUsuario, nivel: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                                    <option value="Atendimento">Atendimento</option>
                                    <option value="Produção">Produção</option>
                                    <option value="Financeiro">Equipe Financeira</option>
                                    <option value="Administrador">Administrador (Total)</option>
                                </select>
                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <p className="text-[10px] text-gray-500 italic mt-1">* Nota: O usuário terá acesso imediato após salvar.</p>
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalUsuarioAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar Acesso</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Requisicao */}
            {modalRequisicaoAberto && (
                <div onClick={() => setModalRequisicaoAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-lg rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-brand text-white"><h3 className="font-semibold text-lg tracking-tight">{novaRequisicao.id ? 'Editar Requisição' : 'Nova Requisição'}</h3><button onClick={() => setModalRequisicaoAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5"/></button></div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Itens (Material, quantidade, etc.)</label>
                                <textarea required rows="4" value={novaRequisicao.itens} onChange={e => setNovaRequisicao({...novaRequisicao, itens: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white placeholder-gray-400" placeholder="Ex: 2 caixas de sulfite A4..."></textarea>
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Observações (Opcional)</label>
                                <textarea rows="2" value={novaRequisicao.observacoes} onChange={e => setNovaRequisicao({...novaRequisicao, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white placeholder-gray-400"></textarea>
                            </div>
                            {novaRequisicao.id && (
                                <div>
                                    <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status</label>
                                    <div className="relative">
                                        <select value={novaRequisicao.status} onChange={e => setNovaRequisicao({...novaRequisicao, status: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                                            <option value="Pendente">Pendente</option>
                                            <option value="Comprado">Comprado</option>
                                            <option value="Recusado">Recusado</option>
                                        </select>
                                        <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalRequisicaoAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="button" onClick={salvarRequisicao} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tarefa */}
            {modalTarefaAberto && (
                <div onClick={() => setModalTarefaAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-lg rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
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
                                    <div className="relative">
                                        <select value={novaTarefa.responsavel} onChange={e => setNovaTarefa({...novaTarefa, responsavel: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                                            <option value="">(Sem responsável)</option>
                                            {nomesResponsaveis.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                {novaTarefa.id && (
                                    <div>
                                        <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status</label>
                                        <div className="relative">
                                            <select value={novaTarefa.status} onChange={e => setNovaTarefa({...novaTarefa, status: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                                                <option value="Pendente">Pendente</option>
                                                <option value="Em Andamento">Em Andamento</option>
                                                <option value="Concluída">Concluída</option>
                                            </select>
                                            <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <label className="flex items-center justify-between gap-2 cursor-pointer select-none">
                                <span className="text-[13px] font-medium text-gray-700 dark:text-[#EDEDED]">Tarefa Fixa (conclusão diária, não é removida)</span>
                                <Switch checked={!!novaTarefa.fixa} onChange={val => setNovaTarefa({...novaTarefa, fixa: val})} color="blue" />
                            </label>
                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" onClick={() => setModalTarefaAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                <button type="button" onClick={async (e) => { e.preventDefault(); await salvarTarefa(); }} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Link de Pagamento */}
            {modalLinkAberto && (
                <div onClick={() => setModalLinkAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-brand text-white"><h3 className="font-semibold text-lg tracking-tight">{novoLink.id ? 'Editar Link' : 'Novo Link de Pagamento'}</h3><button onClick={() => setModalLinkAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5"/></button></div>
                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Identificação / Título</label>
                                <textarea required rows="2" value={novoLink.titulo} onChange={e => setNovoLink({...novoLink, titulo: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="Ex: Link Cartão R$ 100,00"></textarea>
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Cliente (Para quem é?)</label>
                                <input type="text" value={novoLink.cliente} onChange={e => setNovoLink({...novoLink, cliente: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="Nome do cliente" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">URL do Link</label>
                                <input required type="url" value={novoLink.link} onChange={e => setNovoLink({...novoLink, link: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Valor (R$)</label>
                                <input type="text" value={novoLink.valor} onChange={e => setNovoLink({...novoLink, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-white" placeholder="0,00" />
                            </div>
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalLinkAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="button" onClick={salvarLink} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
