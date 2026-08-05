"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import { obterDataAtual, formatarDataExibicao } from '@/lib/utils/formatters';

// ==== COMPONENTE DE DATA CUSTOMIZADO ====
export function CustomDatePicker({ value, onChange, placeholder, disabled, className, clearable }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
    const [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0 });
    const containerRef = useRef(null);
    const POPOVER_WIDTH = 288; // w-72
    const POPOVER_HEIGHT_ESTIMATE = 320;

    // Fecha o calendário se a página ou algum container com scroll se mover,
    // já que a posição é calculada uma vez (fixed) e não acompanha o scroll.
    useEffect(() => {
        if (!isOpen) return;
        const fechar = () => setIsOpen(false);
        window.addEventListener('scroll', fechar, true);
        window.addEventListener('resize', fechar);
        return () => {
            window.removeEventListener('scroll', fechar, true);
            window.removeEventListener('resize', fechar);
        };
    }, [isOpen]);

    const changeMonth = (e, offset) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const changeYear = (e, offset) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        newDate.setFullYear(newDate.getFullYear() + offset);
        setViewDate(newDate);
    };

    const changeDecade = (e, offset) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        newDate.setFullYear(newDate.getFullYear() + offset * 12);
        setViewDate(newDate);
    };

    const selectMonth = (e, monthIndex) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        newDate.setMonth(monthIndex);
        setViewDate(newDate);
        setViewMode('days');
    };

    const selectYear = (e, year) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        newDate.setFullYear(year);
        setViewDate(newDate);
        setViewMode('months');
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
            // Se o espaço abaixo for menor que a altura do calendário (~320px), abre pra cima
            const abrirParaCima = window.innerHeight - rect.bottom < POPOVER_HEIGHT_ESTIMATE;
            // Posição fixa calculada a partir do campo, para não ser cortado por
            // containers com overflow-hidden/overflow-auto (ex: tabelas com scroll).
            const left = Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8);
            setPopoverStyle({
                position: 'fixed',
                left: Math.max(8, left),
                ...(abrirParaCima
                    ? { bottom: window.innerHeight - rect.top + 8 }
                    : { top: rect.bottom + 8 }),
            });
            if (value) {
                const [y, m, d] = value.split('-');
                setViewDate(new Date(y, m - 1, d));
            } else {
                setViewDate(new Date());
            }
            setViewMode('days');
        }
        setIsOpen(!isOpen);
    };

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const anoBaseView = viewDate.getFullYear();
    const anosDecada = Array.from({ length: 12 }, (_, i) => anoBaseView - 5 + i);

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
                {clearable && value && !disabled ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        aria-label="Limpar data"
                        className="text-gray-400 hover:text-red-500 shrink-0 ml-1 transition"
                    >
                        <Icon name="x" className="w-4 h-4" />
                    </button>
                ) : (
                    <Icon name="calendar" className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
                )}
            </div>
            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                    <div style={popoverStyle} className="z-[95] bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg shadow-2xl p-4 w-72">
                        {viewMode === 'days' && (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <button type="button" onClick={(e) => changeMonth(e, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-left" /></button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setViewMode('months'); }} className="font-semibold text-[13px] dark:text-white px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-darkElevated transition">{meses[viewDate.getMonth()]} de {viewDate.getFullYear()}</button>
                                    <button type="button" onClick={(e) => changeMonth(e, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-right" /></button>
                                </div>
                                <div className="grid grid-cols-7 mb-2">
                                    {diasSemana.map(d => <div key={d} className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold text-gray-400">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-y-1">
                                    {renderDias()}
                                </div>
                            </>
                        )}
                        {viewMode === 'months' && (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <button type="button" onClick={(e) => changeYear(e, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-left" /></button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setViewMode('years'); }} className="font-semibold text-[13px] dark:text-white px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-darkElevated transition">{viewDate.getFullYear()}</button>
                                    <button type="button" onClick={(e) => changeYear(e, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-right" /></button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {mesesAbrev.map((m, i) => (
                                        <div key={m} onClick={(e) => selectMonth(e, i)} className={`py-2.5 text-center text-[13px] rounded-md cursor-pointer transition ${i === viewDate.getMonth() ? 'bg-brand text-white font-semibold' : 'text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-darkHover'}`}>{m}</div>
                                    ))}
                                </div>
                            </>
                        )}
                        {viewMode === 'years' && (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <button type="button" onClick={(e) => changeDecade(e, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-left" /></button>
                                    <span className="font-semibold text-[13px] dark:text-white px-2 py-1">{anosDecada[0]} - {anosDecada[anosDecada.length - 1]}</span>
                                    <button type="button" onClick={(e) => changeDecade(e, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-right" /></button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {anosDecada.map(y => (
                                        <div key={y} onClick={(e) => selectYear(e, y)} className={`py-2.5 text-center text-[13px] rounded-md cursor-pointer transition ${y === viewDate.getFullYear() ? 'bg-brand text-white font-semibold' : 'text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-darkHover'}`}>{y}</div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
