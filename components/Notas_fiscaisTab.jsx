"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';


export default function Notas_fiscaisTab() {
    const { setFiltroNotas, setPaginaNotasFiscais, filtroNotas, notasFiscais } = useAppContext();

    return (
        <>
            { (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => { setFiltroNotas('pendentes'); setPaginaNotasFiscais(1); }} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${filtroNotas === 'pendentes' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}>
                            <Icon name="clock" className="w-4 h-4" /> Pendentes
                            {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}
                        </button>
                        <button onClick={() => { setFiltroNotas('concluidas'); setPaginaNotasFiscais(1); }} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${filtroNotas === 'concluidas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-circle" className="w-4 h-4" /> Concluídas</button>
                    </div>
                )}

        </>
    );
}
