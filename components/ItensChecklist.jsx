"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';

function ItensChecklist({ pedido, atualizarCampoInline }) {
    const { itens, observacoes, pagamentos } = desconstruirTextoServico(pedido.servico);
    
    if (itens.length === 0) {
        return <span className="truncate max-w-[18rem] block">{pedido.servico ? pedido.servico.substring(0, 40) + '...' : '---'}</span>;
    }

    const toggleItem = (idx) => {
        const novosItens = [...itens];
        novosItens[idx].concluido = !novosItens[idx].concluido;
        
        let textoFinal = '';
        const itensTextoArray = novosItens.map(i => {
            const strDesconto = i.desconto ? ' (-' + i.desconto + '%)' : '';
            const strNome = i.nome ? 'â€¢ ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : 'â€¢ ServiÃ§o Personalizado';
            const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
            const strConcluido = i.concluido ? '\n  [âœ“] ConcluÃ­do' : '';
            return strNome + '\n  ' + i.descricao + '\n  Valor: R$ ' + i.valor + strDesconto + strLocal + strConcluido;
        });
        textoFinal += itensTextoArray.join('\n\n') + '\n\n';
        if (observacoes) textoFinal += '[OBSERVAÃ‡Ã•ES GERAIS]\n' + observacoes;
        if (pagamentos.length > 0) textoFinal += '\n\n[PAGAMENTOS]\n' + JSON.stringify(pagamentos);
        
        atualizarCampoInline(pedido.id, 'servico', textoFinal);
    };

    return (
        <div className="flex flex-wrap gap-1.5 items-center w-full min-w-[300px]">
            {itens.map((item, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleItem(idx); }}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-semibold rounded shadow-sm transition transform hover:scale-105 ${
                        item.concluido
                            ? 'bg-emerald-500 text-white border border-emerald-600'
                            : 'bg-gray-100 dark:bg-darkElevated text-gray-500 dark:text-[#A1A1AA] border border-gray-200 dark:border-darkBorder hover:bg-gray-200 dark:hover:bg-darkHover'
                    }`}
                    title={item.concluido ? 'Marcar como pendente' : 'Marcar como concluÃ­do'}
                >
                    {item.concluido && <Icon name="check" className="w-3 h-3" />}
                    <span className="truncate max-w-[100px]">{item.nome}</span>
                </button>
            ))}
        </div>
    );
}

export default ItensChecklist;
