"use client";
import { useNotasFiscais } from "@/context/NotasFiscaisContext";
import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import { formatarMoeda, rotuloDocumento } from '@/lib/utils/formatters';
import { InlineDropdown } from '@/components/ui/Dropdown';
import { useModal } from '@/components/modals/useModal';

export default function NotaFiscalModal() {
    const { modalNotaFiscalAberto, notaFiscalEmEdicao, setModalNotaFiscalAberto, setNotaFiscalEmEdicao, salvandoNotaFiscal, salvarNotaFiscal } = useNotasFiscais();
    const modal = useModal(!!modalNotaFiscalAberto && !!notaFiscalEmEdicao, () => setModalNotaFiscalAberto(false));

    if (!modalNotaFiscalAberto || !notaFiscalEmEdicao) return null;

    return (
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-fundo w-full max-w-none sm:max-w-2xl h-full sm:h-auto rounded-none sm:rounded shadow-2xl overflow-hidden border border-borda max-h-full sm:max-h-[90vh] flex flex-col animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t shrink-0"><h3 className="font-semibold text-lg tracking-tight">Detalhes e Edição da Nota Fiscal</h3><button onClick={modal.fechar} className="text-white/70 hover:text-white transition"><Icon name="x" /></button></div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="bg-sutil p-4 rounded border border-borda-fraca mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1 h-3.5 bg-brand rounded-full"></span>
                            <h4 className="text-micro font-bold uppercase tracking-wider text-tinta-suave">Dados do Cliente (Link)</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><label className="text-mini text-tinta-suave">Razão Social</label><div className="flex items-center gap-2"><div className="text-corpo dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.razao_social || '---'}</div>{notaFiscalEmEdicao.razao_social && <Tooltip label="Copiar"><button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.razao_social)} aria-label="Copiar" className="text-gray-400 hover:text-brand transition shrink-0"><Icon name="copy" className="w-3.5 h-3.5" /></button></Tooltip>}</div></div>
                            <div><label className="text-mini text-tinta-suave">{rotuloDocumento(notaFiscalEmEdicao.cnpj)}</label><div className="flex items-center gap-2"><div className="text-corpo dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.cnpj || '---'}</div>{notaFiscalEmEdicao.cnpj && <Tooltip label="Copiar"><button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.cnpj)} aria-label="Copiar" className="text-gray-400 hover:text-brand transition shrink-0"><Icon name="copy" className="w-3.5 h-3.5" /></button></Tooltip>}</div></div>
                            <div><label className="text-mini text-tinta-suave">Endereço</label><div className="flex items-center gap-2"><div className="text-corpo dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.endereco || '---'}</div>{notaFiscalEmEdicao.endereco && <Tooltip label="Copiar"><button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.endereco)} aria-label="Copiar" className="text-gray-400 hover:text-brand transition shrink-0"><Icon name="copy" className="w-3.5 h-3.5" /></button></Tooltip>}</div></div>
                            <div><label className="text-mini text-tinta-suave">Contato ({notaFiscalEmEdicao.forma_envio || 'Whatsapp'})</label><div className="flex items-center gap-1.5"><Icon name={notaFiscalEmEdicao.forma_envio === 'E-mail' ? 'mail' : 'phone'} className="w-3.5 h-3.5 text-gray-400 shrink-0" /><div className="text-corpo dark:text-[#EDEDED] font-medium truncate">{notaFiscalEmEdicao.contato || '---'}</div>{notaFiscalEmEdicao.contato && <Tooltip label="Copiar"><button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.contato)} aria-label="Copiar" className="text-gray-400 hover:text-brand transition shrink-0"><Icon name="copy" className="w-3.5 h-3.5" /></button></Tooltip>}</div></div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-borda-fraca">
                            <label className="text-mini text-tinta-suave">Observação do Cliente</label>
                            <div className="flex items-center gap-2"><div className="text-corpo dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.observacao_cliente || '---'}</div>{notaFiscalEmEdicao.observacao_cliente && <Tooltip label="Copiar"><button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.observacao_cliente)} aria-label="Copiar" className="text-gray-400 hover:text-brand transition shrink-0"><Icon name="copy" className="w-3.5 h-3.5" /></button></Tooltip>}</div>
                        </div>
                    </div>
                    <form id="formNota" onSubmit={salvarNotaFiscal} className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-3.5 bg-brand rounded-full"></span>
                            <h4 className="text-micro font-bold uppercase tracking-wider text-tinta-suave">Preenchimento Interno</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-mini text-tinta-suave mb-1 block">Cliente (Identificação Interna)</label>
                                <input value={notaFiscalEmEdicao.cliente || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, cliente: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Nome Fantasia / Cliente" />
                            </div>
                            <div>
                                <label className="text-mini text-tinta-suave mb-1 block">Tipo de Nota</label>
                                <InlineDropdown
                                    value={notaFiscalEmEdicao.tipo_nota}
                                    options={['DANFE', 'Serviço']}
                                    onChange={val => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, tipo_nota: val})}
                                    className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none hover:border-brand dark:text-white transition"
                                    hasIndefinido={true}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-mini text-tinta-suave mb-1 block">Serviço Feito</label>
                                <input value={notaFiscalEmEdicao.servico_feito || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, servico_feito: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Qual foi o serviço?" />
                            </div>
                            <div className={notaFiscalEmEdicao.tipo_nota === 'DANFE' ? '' : 'col-span-2'}>
                                <label className="text-mini text-tinta-suave mb-1 block">Valor Pago (R$)</label>
                                <input type="text" value={notaFiscalEmEdicao.valor_pago || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, valor_pago: formatarMoeda(e.target.value)})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="0,00" />
                            </div>
                            {notaFiscalEmEdicao.tipo_nota === 'DANFE' && (
                                <>
                                    <div>
                                        <label className="text-mini text-tinta-suave mb-1 block">Forma de Pagamento</label>
                                        <input value={notaFiscalEmEdicao.forma_pagamento || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, forma_pagamento: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Ex: PIX, Boleto, Cartão..." />
                                    </div>
                                    <div>
                                        <label className="text-mini text-tinta-suave mb-1 block">Forma de Transporte</label>
                                        <input value={notaFiscalEmEdicao.forma_transporte || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, forma_transporte: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Ex: CIF, FOB, Retirada..." />
                                    </div>
                                </>
                            )}
                            <div className="col-span-2">
                                <label className="text-mini text-tinta-suave mb-1 block">Observações</label>
                                <textarea rows="2" value={notaFiscalEmEdicao.observacoes || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, observacoes: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Anotações internas..."></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-borda-fraca shrink-0">
                    <button type="button" onClick={modal.fechar} className="px-4 py-2 rounded text-corpo font-medium text-tinta-suave hover:bg-realce transition">Cancelar</button>
                    <button type="submit" form="formNota" disabled={salvandoNotaFiscal} className="px-5 py-2 rounded text-corpo font-medium bg-brand text-white hover:bg-brandHover transition disabled:opacity-50">{salvandoNotaFiscal ? 'Salvando...' : 'Salvar Alterações'}</button>
                </div>
            </div>
        </div>
    );
}
