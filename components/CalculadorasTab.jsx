"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';


export default function CalculadorasTab() {
    const { setCalculadoraAtiva, calculadoraAtiva, abaAtual, produtos } = useAppContext();

    return (
        <>
            { (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setCalculadoraAtiva('banner')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'banner' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="image" className="w-4 h-4" /> Banner / Lona</button>
                        <button onClick={() => setCalculadoraAtiva('adesivo')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'adesivo' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="grid" className="w-4 h-4" /> Adesivos (Vinil)</button>
                        <button onClick={() => setCalculadoraAtiva('casamento')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'casamento' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="heart" className="w-4 h-4" /> Papelaria Casamento</button>
                        {/* Se tiver mais calculadoras, elas aparecem aqui */}
                    </div>
                )}
{abaAtual === 'calculadoras' && <CalculadorasAba calculadoraAtiva={calculadoraAtiva} produtos={produtos} />}

        </>
    );
}
