"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

function CalculadoraCasamento() {
    const [itens, setItens] = useState([{ id: 1, nome: 'Convite Principal', quantidade: 100, valorUnitario: '4,50' }]);

    const adicionarItem = () => {
        setItens([...itens, { id: Date.now(), nome: '', quantidade: 1, valorUnitario: '' }]);
    };

    const removerItem = (id) => {
        setItens(itens.filter(i => i.id !== id));
    };

    const atualizarItem = (id, campo, valor) => {
        setItens(itens.map(i => i.id === id ? { ...i, [campo]: valor } : i));
    };

    const calcularTotal = () => {
        return itens.reduce((acc, item) => {
            const v = parseFloat(String(item.valorUnitario).replace(',', '.'));
            const q = parseInt(item.quantidade) || 0;
            if (!isNaN(v) && q > 0) return acc + (v * q);
            return acc;
        }, 0).toFixed(2);
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Calculadora de Papelaria de Casamento</h3>
            
            <div className="space-y-4 mb-6">
                {itens.map((item, index) => (
                    <div key={item.id} className="flex gap-4 items-end bg-gray-50 dark:bg-darkElevated p-3 rounded border border-gray-100 dark:border-darkBorder">
                        <div className="flex-1">
                            <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Item {index + 1}</label>
                            <input type="text" value={item.nome} onChange={e => atualizarItem(item.id, 'nome', e.target.value)} placeholder="Ex: Menu, LÃ¡grimas de Alegria..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                        </div>
                        <div className="w-24">
                            <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Qtd</label>
                            <input type="number" min="1" value={item.quantidade} onChange={e => atualizarItem(item.id, 'quantidade', e.target.value)} className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                        </div>
                        <div className="w-32">
                            <label className="block text-[10px] uppercase font-semibold text-gray-500 mb-1">Valor Un. (R$)</label>
                            <input type="text" value={item.valorUnitario} onChange={e => atualizarItem(item.id, 'valorUnitario', e.target.value)} className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="0,00" />
                        </div>
                        <button onClick={() => removerItem(item.id)} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0" title="Remover">
                            <Icon name="trash-2" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button onClick={adicionarItem} className="text-[13px] font-semibold text-brand hover:text-brandHover flex items-center gap-1 transition">
                    <Icon name="plus" className="w-4 h-4" /> Adicionar Outro Item
                </button>
            </div>

            <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                <span className="font-semibold text-brand">Total do Pacote</span>
                <span className="text-2xl font-black text-brand">R$ {calcularTotal().replace('.', ',')}</span>
            </div>
        </div>
    );
}

export default CalculadoraCasamento;
