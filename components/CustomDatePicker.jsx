"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';

function CustomDatePicker({ value, onChange, placeholder, disabled, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (value && isOpen) {
            const [y, m, d] = value.split('-');
            setViewDate(new Date(y, m - 1, d));
        } else if (isOpen) {
            setViewDate(new Date());
        }
    }, [isOpen, value]);

    const changeMonth = (e, offset) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const selectDate = (day) => {
        const yyyy = viewDate.getFullYear();
        const mm = String(viewDate.getMonth() + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (disabled) return;
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Se o espaÃ§o abaixo for menor que a altura do calendÃ¡rio (~320px), abre pra cima
            setOpenUpwards(window.innerHeight - rect.bottom < 320);
        }
        setIsOpen(!isOpen);
    };

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'];
    const meses = ['Janeiro', 'Fevereiro', 'MarÃ§o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const renderDias = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        let days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dataAtualStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = value === dataAtualStr;
            const isToday = dataAtualStr === obterDataAtual();

            days.push(
                <div 
                    key={d} 
                    onClick={(e) => { e.stopPropagation(); selectDate(d); }}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-[13px] cursor-pointer transition
                        ${isSelected ? 'bg-brand text-white font-semibold' : 
                          isToday ? 'bg-gray-100 dark:bg-darkElevated text-brand font-semibold hover:bg-gray-200 dark:hover:bg-darkHover' : 
                          'text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-darkHover'}`}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="relative" ref={containerRef}>
            <div 
                onClick={toggleDropdown} 
                className={`flex justify-between items-center cursor-pointer select-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className={value ? "text-gray-900 dark:text-[#EDEDED]" : "text-gray-400 dark:text-gray-600 truncate"}>
                    {value ? formatarDataExibicao(value) : placeholder}
                </span>
                <Icon name="calendar" className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            </div>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[55]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                    <div className={`absolute left-0 z-[60] bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg shadow-2xl p-4 w-72 ${openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <button type="button" onClick={(e) => changeMonth(e, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-left" /></button>
                            <span className="font-semibold text-[13px] dark:text-white">{meses[viewDate.getMonth()]} de {viewDate.getFullYear()}</span>
                            <button type="button" onClick={(e) => changeMonth(e, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-right" /></button>
                        </div>
                        <div className="grid grid-cols-7 mb-2">
                            {diasSemana.map(d => <div key={d} className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold text-gray-400">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1">
                            {renderDias()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ==== COMPONENTE DE DROPDOWN CUSTOMIZADO ====
// ==== COMPONENTE DE DROPDOWN CUSTOMIZADO ====

export default CustomDatePicker;
