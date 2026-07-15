"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { formatarDataExibicao, formatarValorFinanceiro, desconstruirTextoServico } from '@/lib/utils';
import Icon from '@/components/Icon';

function extrairItens(orc) {
    if (!orc.descricao) return [];
    const match = orc.descricao.match(/\[ITENS_JSON\]\n([\s\S]*)/);
    if (match) {
        try { return JSON.parse(match[1]); } catch(e) { console.error(e) }
    }
    return desconstruirTextoServico(orc.descricao).itens;
}

export default function PrintLayout() {
    const { osParaImprimir, orcamentoParaImprimir } = useAppContext();

    if (!osParaImprimir && !orcamentoParaImprimir) return null;

    if (orcamentoParaImprimir) {
        return <PrintOrcamento orc={orcamentoParaImprimir} />;
    }

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

function PrintOrcamento({ orc }) {
    const desc = desconstruirTextoServico(orc.descricao || '');
    const itens = extrairItens(orc);
    const telefone = orc.clienteInfo?.telefone || '';
    const date = new Date(orc.created_at).toLocaleDateString('pt-BR');
    
    // Fallback to desc.observacoes if orc.observacoes is empty
    const obsPrazo = orc.observacoes || desc.observacoes || "Prazo e condições a combinar.";
    
    return (
        <div className="print-only bg-white text-black font-sans flex flex-col w-full h-[286mm] overflow-hidden relative select-none">
            {/* Header */}
            <div className="flex justify-between items-start pt-16 px-16">
                <div className="flex items-center gap-4">
                    <svg width="210" height="100" viewBox="-10 0 500 310" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* 7 Stairs going up and to the right */}
                        {/* Top 4 (Reddish Orange) */}
                        <rect x="300" y="0" width="120" height="36" fill="#F27127" />
                        <rect x="250" y="42" width="120" height="36" fill="#F27127" />
                        <rect x="200" y="84" width="120" height="36" fill="#F27127" />
                        <rect x="150" y="126" width="120" height="36" fill="#F27127" />
                        
                        {/* Bottom 3 (Yellowish Orange) */}
                        <rect x="100" y="168" width="120" height="36" fill="#F8B133" />
                        <rect x="50" y="210" width="120" height="36" fill="#F8B133" />
                        <rect x="0" y="252" width="120" height="36" fill="#F8B133" />
                        
                        {/* Text aligned with the bottom 2 stairs */}
                        <text x="185" y="243" fontFamily="'Bebas Neue', 'Arial Narrow', sans-serif" fontWeight="bold" fontSize="48" fill="#0067B1" letterSpacing="1">BERLIM</text>
                        <text x="185" y="285" fontFamily="'Bebas Neue', 'Arial Narrow', sans-serif" fontWeight="bold" fontSize="48" fill="#0067B1" letterSpacing="1">GRÁFICA RÁPIDA</text>
                    </svg>
                </div>
                <div className="text-right flex flex-col justify-center h-[90px] pb-3 gap-0.5">
                    <p className="text-[18px] font-bold text-[#00579D] tracking-tighter">CNPJ 36.117.136/0001-23</p>
                    <p className="text-[16px] text-[#559bd6] tracking-tight">{date}</p>
                </div>
            </div>

            {/* Client Info */}
            <div className="px-16 mt-8 mb-4">
                <p className="text-[16px] text-[#00579D]">
                    <span className="font-bold">Cliente:</span> {orc.cliente}{telefone ? ` - ${telefone}` : ''}
                </p>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
                <h1 className="text-[24px] font-black text-[#00579D] uppercase tracking-wide">ORÇAMENTO:</h1>
            </div>

            {/* Items */}
            <div className="px-16 flex-1 flex flex-col gap-3 text-[14px] text-gray-800 font-medium">
                {itens.map((item, idx) => {
                    const descricao = item.descricao || item.nome;
                    const preco = `R$ ${item.valor}`;
                    return (
                        <div key={idx} className="flex items-start gap-2.5">
                            <span className="text-[#F37021] text-xl leading-none pt-0.5">•</span>
                            <p className="leading-snug">
                                {descricao} | <span className="font-bold text-[#F37021]">{preco}</span>
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Rules */}
            <div className="px-16 mb-5">
                <div className="text-[10px] text-gray-500 italic flex flex-col gap-1 font-medium">
                    <p>• Retirada na nossa loja: Rua Alencastro, 42 - Bairro Silveira - Santo André (SP);</p>
                    <p>• Forma de pagamento: 50% de sinal e 50% na retirada, podendo ser via pix, dinheiro ou cartão, ou 100% antecipado via link de pagamento;</p>
                    <p>• Não trabalhamos com fidelidade de cor, por isso as cores podem variar conforme o material;</p>
                    <p>• O corte é aproximado, pois buscamos aproveitamento do material.</p>
                </div>
            </div>

            {/* Footer Totals */}
            <div className="px-16 pb-12 flex justify-between items-end">
                <div className="flex flex-col pt-2 max-w-[50%]">
                    <p className="text-[#F37021] text-[18px] font-bold leading-tight mb-1">Prazo de Produção:</p>
                    <p className="text-[#F37021] text-[15px] italic leading-tight whitespace-pre-wrap">{obsPrazo}</p>
                </div>
                
                <div className="w-[2px] bg-[#00579D] h-16 mx-8 self-center rounded"></div>

                <div className="flex-1 flex flex-col justify-end text-left pt-2">
                    <p className="text-[#F37021] text-[18px] font-black italic uppercase leading-none mb-1">Total:</p>
                    <p className="text-[#00579D] text-[32px] font-black italic leading-none tracking-tight">R$ {formatarValorFinanceiro(Number(orc.valor))}</p>
                </div>
            </div>

            {/* Orange Footer Bar */}
            <div className="bg-[#F37021] print-color-adjust-exact h-[80px] w-full flex justify-between items-center px-16 text-white shrink-0">
                <div className="flex flex-col text-[12px] font-semibold gap-1">
                    <p className="flex items-center gap-2"><Icon name="phone" className="w-4 h-4" /> (11) 95471-6011</p>
                    <p className="flex items-center gap-2"><Icon name="phone" className="w-4 h-4" /> (11) 2677-6057</p>
                    <p className="flex items-center gap-2"><Icon name="instagram" className="w-4 h-4" /> @berlimgraficarapida</p>
                </div>
                
                {/* SVG for Stairs in white */}
                <div className="opacity-90">
                     <svg width="60" height="40" viewBox="0 0 100 80" fill="white">
                        <rect x="0" y="64" width="30" height="16" />
                        <rect x="15" y="48" width="30" height="16" />
                        <rect x="30" y="32" width="30" height="16" />
                        <rect x="45" y="16" width="30" height="16" />
                        <rect x="60" y="0" width="30" height="16" />
                     </svg>
                </div>

                <div className="flex flex-col text-[12px] font-semibold gap-1 text-right">
                    <p className="flex items-center justify-end gap-2">contato@berlimgraficarapida.com.br <Icon name="mail" className="w-4 h-4" /></p>
                    <p className="flex items-center justify-end gap-2 mt-1">Rua Alencastro, 42 - Bairro Silveira<br/>Santo André - SP <Icon name="map-pin" className="w-4 h-4" /></p>
                </div>
            </div>
            
            {/* Embedded CSS for Exact Color Printing Support */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    .print-color-adjust-exact {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}} />
        </div>
    );
}
