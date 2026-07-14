"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { formatarDataExibicao, formatarValorFinanceiro, desconstruirTextoServico } from '@/lib/utils';

export default function PrintLayout() {
    const { osParaImprimir } = useAppContext();

    if (!osParaImprimir) return null;

    return (
        <div className="print-only bg-white text-black font-sans flex flex-col w-full h-[286mm] overflow-hidden justify-between select-none">
            {[1, 2].map((via, index) => {
                const cInfo = osParaImprimir.clienteInfo;
                const desc = desconstruirTextoServico(osParaImprimir.servico);
                
                return (
                    <div key={via} className={`h-[143mm] flex flex-col p-6 overflow-hidden relative justify-between ${index === 0 ? 'border-b-[2px] border-dashed border-gray-400' : ''}`}>
                        
                        <div className="shrink-0 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                    <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain object-left mb-2" />
                                    
                                    <h2 className="text-xl font-semibold uppercase text-gray-800">O.S. #{osParaImprimir.id}</h2>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <p className="text-[11px] text-gray-500 font-medium">Entrada: {formatarDataExibicao(osParaImprimir.data_pedido)}</p>
                                        <span className="border border-gray-300 text-gray-400 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded">
                                            {index === 0 ? 'Via da Gráfica' : 'Via do Cliente'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-right text-[11px] text-gray-600 flex flex-col justify-end mt-1">
                                    <p>CNPJ: 36.117.136/0001-23</p>
                                    <p>R. Alencastro, 42 - Silveira</p>
                                    <p>Santo André - SP, 09110-050</p>
                                    <p className="font-semibold text-gray-800 mt-0.5">(11) 2677-6057 | (11) 95471-6011</p>
                                </div>
                            </div>

                            <hr className="border-t-2 border-black mb-3" />

                            <div className="mb-2">
                                <div className="flex justify-between items-end mb-1">
                                    <div>
                                        <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-0.5 tracking-wider">Cliente</h3>
                                        <p className="font-semibold text-base uppercase text-gray-900">{osParaImprimir.cliente}</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-0.5 tracking-wider">Contato</h3>
                                        <p className="font-semibold text-[13px] text-gray-800">{cInfo?.telefone || 'Não informado'}</p>
                                    </div>
                                </div>
                                {cInfo?.observacoes && (
                                    <div className="mt-1">
                                        <p className="text-[11px] text-gray-600 italic">" {cInfo.observacoes} "</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col mt-2">
                            <table className="w-full text-left text-[13px] border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-gray-800">
                                        <th className="pb-1 uppercase text-[10px] font-extrabold tracking-wider w-full">Serviços Contratados</th>
                                        <th className="pb-1 uppercase text-[10px] font-extrabold tracking-wider text-right w-32 whitespace-nowrap pl-4">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {desc.itens.length > 0 ? desc.itens.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                                            <td className="py-0.5 text-gray-900 whitespace-pre-wrap pr-4 align-middle text-[11px] font-medium leading-tight">
                                                {item.descricao || item.nome}
                                            </td>
                                            <td className="py-0.5 text-right whitespace-nowrap align-middle font-semibold text-[13px]">
                                                R$ {item.valor}
                                                {item.desconto && <span className="block text-[9px] text-gray-400 font-normal mt-0.5">(-{item.desconto}%)</span>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td className="py-2 text-gray-500 whitespace-pre-wrap pr-4 align-middle text-[11px] italic">
                                                Serviço formatado manualmente (Verifique as observações gerais abaixo).
                                            </td>
                                            <td className="py-2 text-right whitespace-nowrap align-middle font-semibold text-[13px]">
                                                R$ {formatarValorFinanceiro(Number(osParaImprimir.valor_total))}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="shrink-0 flex flex-col mt-auto pt-2">
                            <hr className="border-t-2 border-black mb-3" />

                            <div className="flex justify-between items-start gap-6 mb-2">
                                <div className="flex-1 max-w-[60%] flex flex-col gap-3">
                                    {desc.pagamentos && desc.pagamentos.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-1 tracking-wider">Histórico de Pagamentos</h3>
                                            <div className="text-[11px] text-gray-800">
                                                {desc.pagamentos.map((pag, idx) => (
                                                    <div key={idx} className="flex justify-between items-center border-b border-dashed border-gray-200 py-0.5 last:border-0">
                                                        <span>{pag.forma} {pag.parcelas > 1 ? `(${pag.parcelas}x)` : ''} {pag.instituicao ? `(${pag.instituicao})` : ''} <span className="text-[10px] text-gray-500">({pag.data})</span></span>
                                                        <span className="font-semibold text-gray-900">R$ {pag.valor}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-1.5 tracking-wider">Observações Gerais do Pedido</h3>
                                        <p className="text-[11px] text-gray-800 whitespace-pre-wrap leading-snug">
                                            {desc.observacoes || <span className="italic text-gray-400">Nenhuma observação extra registrada.</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-[10px] uppercase font-semibold tracking-widest text-gray-500 block mb-0.5">Total do Pedido</span>
                                    <h2 className="text-4xl font-black tracking-tight text-gray-900">R$ {formatarValorFinanceiro(Number(osParaImprimir.valor_total))}</h2>
                                </div>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}
