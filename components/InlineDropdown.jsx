"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';

function InlineDropdown({ value, options, onChange, className, hasIndefinido = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef(null);
    const getTextColor = (val) => obterCorStatus(val);

    const toggleDropdown = () => {
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calcula se hÃ¡ espaÃ§o para baixo. Se nÃ£o, abre para cima
            setOpenUpwards(window.innerHeight - rect.bottom < 250);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div 
                onClick={toggleDropdown}
                className={`flex items-center justify-between cursor-pointer transition ${className} ${isOpen ? 'border-brand ring-1 ring-brand/20' : ''}`}
            >
                <div className="flex items-center gap-1.5 truncate">
                    <span className={`truncate font-medium ${getTextColor(value)}`}>{value || 'Indefinido'}</span>
                </div>
                <Icon name="chevron-down" className={`w-3 h-3 text-gray-400 shrink-0 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[55]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                    <ul className={`absolute left-0 z-[60] w-full min-w-[160px] max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar text-[11px] ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                        {hasIndefinido && (
                            <li 
                                onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
                                className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder text-gray-500 dark:text-gray-400 transition"
                            >
                                Indefinido
                            </li>
                        )}
                        {options.map(opt => (
                            <li 
                                key={opt}
                                onClick={(e) => { e.stopPropagation(); onChange(opt); setIsOpen(false); }}
                                className={`px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 transition font-medium flex items-center justify-between ${getTextColor(opt)}`}
                            >
                                {opt}
                                {value === opt && <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

// ==== COMPONENTE DE DROPDOWN MULTI-SELECT ====

export default InlineDropdown;
