"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

function MultiSelectDropdown({ value, options, onChange, className, disabled, placeholder = "Indefinido" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef(null);
    const selectedArr = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

    const toggleOption = (opt, e) => {
        e.stopPropagation();
        let newArr;
        if (selectedArr.includes(opt)) {
            newArr = selectedArr.filter(item => item !== opt);
        } else {
            newArr = [...selectedArr, opt];
        }
        onChange(newArr.join(', '));
    };

    const toggleDropdown = () => {
        if (disabled) return;
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calcula o espaÃ§o. Se faltar espaÃ§o em baixo, abre o pop-up para cima.
            setOpenUpwards(window.innerHeight - rect.bottom < 250);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={toggleDropdown}
                className={`flex items-center justify-between cursor-pointer transition ${className} ${isOpen ? 'border-brand ring-1 ring-brand/20' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-1.5 truncate">
                    <span className={`truncate font-medium ${selectedArr.length > 0 ? 'text-brand dark:text-brand' : 'text-gray-500 dark:text-gray-400'}`}>
                        {selectedArr.length > 0 ? selectedArr.join(', ') : placeholder}
                    </span>
                </div>
                <Icon name="chevron-down" className={`w-3 h-3 text-gray-400 shrink-0 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[55]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                    <ul className={`absolute left-0 z-[60] w-full min-w-[160px] max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar text-[11px] ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                        {options.map(opt => {
                            const isSelected = selectedArr.includes(opt);
                            return (
                                <li 
                                    key={opt}
                                    onClick={(e) => toggleOption(opt, e)}
                                    className={`px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 transition font-medium flex items-center justify-between ${isSelected ? 'text-brand bg-brand/5 dark:bg-brand/10' : 'text-gray-700 dark:text-[#EDEDED]'}`}
                                >
                                    {opt}
                                    {isSelected ? <Icon name="check-square" className="w-3.5 h-3.5" /> : <Icon name="square" className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
}

// DESTRUTURADOR E RESUMO DE SERVIÃ‡O
function desconstruirTextoServico(texto) {
    if (!texto) return { itens: [], observacoes: '', pagamentos: [] };
    
    let partesPagamento = texto.split('\n\n[PAGAMENTOS]\n');
    let textoSemPagamento = partesPagamento[0];
    let pagamentosStr = partesPagamento[1] || '[]';
    let pagamentos = [];
    try { pagamentos = JSON.parse(pagamentosStr); } catch (e) { pagamentos = []; }

    let partes = textoSemPagamento.split('\n\n[OBSERVAÃ‡Ã•ES GERAIS]\n');
    let blocoItens = partes[0];
    let obs = partes[1] || '';
    if (!blocoItens.startsWith('â€¢ ') && partes.length === 1) return { itens: [], observacoes: textoSemPagamento, pagamentos };
    
    let itensTraduzidos = [];
    let blocosIndividuais = blocoItens.split('\n\n');
    
    for (let bloco of blocosIndividuais) {
        if (!bloco.startsWith('â€¢ ')) { obs = obs ? obs + '\n' + bloco : bloco; continue; }
        let lines = bloco.split('\n');
        if (lines.length < 3) { obs = obs ? obs + '\n' + bloco : bloco; continue; }
        
        let nomeBruto = lines[0].replace('â€¢ ', '').replace('  ', '').trim();
        let id_produto = null;
        let matchId = nomeBruto.match(/^\[#(\d+)\]\s(.*)$/);
        if (matchId) {
            id_produto = parseInt(matchId[1]);
            nomeBruto = matchId[2];
        }
        let nome = nomeBruto;
        let AppValor = '0,00';
        let local_producao = 'Berlim'; // fallback/default
        let descLines = [];
        let concluido = false;
        
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('Valor: R$ ')) {
                AppValor = line.replace('Valor: R$ ', '');
            } else if (line.startsWith('Local: ')) {
                local_producao = line.replace('Local: ', '');
            } else if (line === '[âœ“] ConcluÃ­do') {
                concluido = true;
            } else {
                descLines.push(lines[i].replace(/^  /, ''));
            }
        }
        
        let descricao = descLines.join('\n').trim();
        
        let valor = AppValor; let desconto = '';
        let matchDesconto = AppValor.match(/\s\(-(\d+)%\)$/);
        if (matchDesconto) { desconto = matchDesconto[1]; valor = AppValor.replace(matchDesconto[0], '').trim(); }
        
        itensTraduzidos.push({ id_produto, nome, descricao, valor, desconto, local_producao, concluido, id_temp: Math.random() + Date.now() });
    }
    return { itens: itensTraduzidos, observacoes: obs, pagamentos };
}

function obterResumoServicos(texto) {
    const desc = desconstruirTextoServico(texto);
    if (desc.itens.length > 0) {
        return desc.itens.map(i => i.nome).join(' + ');
    }
    return texto ? texto.substring(0, 40) + '...' : '---';
}

export default MultiSelectDropdown;
