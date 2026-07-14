"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';


export default function OrcamentosTab() {
    const { setAbaOrcamentos, abaOrcamentos } = useAppContext();

    return (
        <>
            abaAtual === 'orcamentos' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <a onClick={() => setAbaOrcamentos('formalizados')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaOrcamentos === 'formalizados' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> Formalizados
                        </a>
                        <a onClick={() => setAbaOrcamentos('pre_prontos')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaOrcamentos === 'pre_prontos' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> PrÃ© Prontos
                        </a>
                    </div>
                )
abaAtual === 'orcamentos' && abaOrcamentos === 'formalizados'
abaAtual === 'orcamentos' && abaOrcamentos === 'pre_prontos'

        </>
    );
}
