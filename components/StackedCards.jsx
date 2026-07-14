"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

function StackedCards({ title, description, icon, cards }) {
    const [ativo, setAtivo] = useState(0);
    const nextCard = () => setAtivo((prev) => (prev + 1) % cards.length);

    return (
        <div className="flex flex-col relative" style={{ minHeight: '420px' }}>
            <div className="relative flex-1 mt-2">
                {cards.map((card, i) => {
                    const isFront = i === ativo;
                    const pos = (i - ativo + cards.length) % cards.length;
                    
                    let translate = 0;
                    let scale = 1;
                    let zIndex = 0;
                    let opacity = 1;

                    if (isFront) {
                        translate = 0;
                        scale = 1;
                        zIndex = 30;
                    } else if (pos === 1) {
                        translate = 12;
                        scale = 0.95;
                        zIndex = 20;
                        opacity = 0.8;
                    } else if (pos === 2) {
                        translate = 24;
                        scale = 0.90;
                        zIndex = 10;
                        opacity = 0.6;
                    } else {
                        opacity = 0;
                        zIndex = 0;
                    }

                    const isFirstCard = i === 0;
                    const cardBgClass = isFirstCard 
                        ? "bg-white dark:bg-darkCard bg-gradient-to-br from-brand/5 to-transparent dark:from-brand/10 border-brand/20 dark:border-brand/30" 
                        : "bg-white dark:bg-darkCard border-gray-100 dark:border-darkBorder";
                        
                    const titleClass = isFirstCard
                        ? "text-brand dark:text-brand"
                        : "text-gray-600 dark:text-gray-300";

                    return (
                        <div 
                            key={i}
                            className={`absolute top-0 left-0 w-full h-full shadow-md rounded-2xl transition-all duration-300 ease-in-out flex flex-col p-5 cursor-pointer hover:border-brand/40 border ${cardBgClass}`}
                            style={{
                                transform: `translateY(${translate}px) scale(${scale})`,
                                zIndex,
                                opacity,
                                pointerEvents: isFront ? 'auto' : 'none'
                            }}
                            onClick={nextCard}
                        >
                            {/* CABEÃ‡ALHO INTEGRADO */}
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-darkBorder/50">
                                <div className="flex items-center gap-3">
                                    {icon && (
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-darkCard flex items-center justify-center shadow-sm text-brand border border-gray-100 dark:border-darkBorder/50">
                                            <Icon name={icon} className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-extrabold text-[13px] text-gray-900 dark:text-white capitalize leading-tight">{title}</h3>
                                    </div>
                                </div>
                                {cards.length > 1 && (
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-darkBorder/30 border border-gray-200 dark:border-darkBorder px-2 py-1 rounded-full">
                                        {i + 1}/{cards.length}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-3">
                                <h4 className={`text-[11px] font-semibold flex items-center ${titleClass}`}>
                                    {isFirstCard && <i className="fas fa-crown mr-1.5 opacity-70"></i>}
                                    {card.title}
                                </h4>
                            </div>
                            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                                {card.content}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
// ==== CALCULADORAS ====

export default StackedCards;
