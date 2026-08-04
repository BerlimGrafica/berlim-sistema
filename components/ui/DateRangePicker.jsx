"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import { obterDataAtual, formatarDataExibicao } from '@/lib/utils/formatters';

// ==== COMPONENTE DE FILTRO DE PERÍODO (SELEÇÃO DE INTERVALO ESTILO "BOOKING") ====
export function CustomDateRangePicker({ startValue, endValue, onChangeStart, onChangeEnd, placeholder = 'Selecionar período', disabled, className }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
    const [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0 });
    const [hoverDate, setHoverDate] = useState(null);
    const containerRef = useRef(null);
    const POPOVER_WIDTH = 288; // w-72
    const POPOVER_HEIGHT_ESTIMATE = 360;

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
        const dataStr = `${yyyy}-${mm}-${dd}`;

        if (!startValue || (startValue && endValue)) {
            onChangeStart(dataStr);
            onChangeEnd('');
        } else if (dataStr < startValue) {
            onChangeStart(dataStr);
            onChangeEnd('');
        } else {
            onChangeEnd(dataStr);
            setIsOpen(false);
        }
    };

    const limparPeriodo = (e) => {
        e.stopPropagation();
        onChangeStart('');
        onChangeEnd('');
    };

    const toggleDropdown = () => {
        if (disabled) return;
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const abrirParaCima = window.innerHeight - rect.bottom < POPOVER_HEIGHT_ESTIMATE;
            const left = Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8);
            setPopoverStyle({
                position: 'fixed',
                left: Math.max(8, left),
                ...(abrirParaCima
                    ? { bottom: window.innerHeight - rect.top + 8 }
                    : { top: rect.bottom + 8 }),
            });
            const base = startValue || endValue;
            if (base) {
                const [y, m, d] = base.split('-');
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
        const previewEnd = !endValue && startValue && hoverDate && hoverDate > startValue ? hoverDate : null;
        const rangeEnd = endValue || previewEnd;

        let days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dataStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isStart = dataStr === startValue;
            const isEnd = dataStr === endValue || dataStr === previewEnd;
            const isEdge = isStart || isEnd;
            const isInRange = startValue && rangeEnd && dataStr > startValue && dataStr < rangeEnd;
            const isToday = dataStr === obterDataAtual();

            days.push(
                <div
                    key={d}
                    onClick={(e) => { e.stopPropagation(); selectDate(d); }}
                    onMouseEnter={() => setHoverDate(dataStr)}
                    className={`w-8 h-8 flex items-center justify-center text-[13px] cursor-pointer transition
                        ${isEdge ? 'bg-brand text-white font-semibold rounded-md' :
                          isInRange ? 'bg-brand/10 text-brand dark:bg-brand/20' :
                          isToday ? 'bg-gray-100 dark:bg-darkElevated text-brand font-semibold hover:bg-gray-200 dark:hover:bg-darkHover rounded-md' :
                          'text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-darkHover rounded-md'}`}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    let label = placeholder;
    if (startValue && endValue) label = `${formatarDataExibicao(startValue)} - ${formatarDataExibicao(endValue)}`;
    else if (startValue) label = `${formatarDataExibicao(startValue)} - ...`;

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={toggleDropdown}
                className={`flex items-center gap-2 cursor-pointer select-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Icon name="calendar" className="w-4 h-4 text-gray-400 shrink-0" />
                <span className={`flex-1 truncate ${(startValue || endValue) ? "text-gray-900 dark:text-[#EDEDED]" : "text-gray-400 dark:text-gray-600"}`}>
                    {label}
                </span>
                {(startValue || endValue) && (
                    <button type="button" onClick={limparPeriodo} aria-label="Limpar período" className="text-gray-400 hover:text-brand transition shrink-0">
                        <Icon name="x" className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                    <div style={popoverStyle} className="z-[95] bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg shadow-2xl p-4 w-72">
                        {viewMode === 'days' && (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <button type="button" onClick={(e) => changeMonth(e, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-left" /></button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setViewMode('months'); }} className="font-semibold text-[13px] dark:text-white px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-darkElevated transition">{meses[viewDate.getMonth()]} de {viewDate.getFullYear()}</button>
                                    <button type="button" onClick={(e) => changeMonth(e, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-right" /></button>
                                </div>
                                <div className="text-[11px] text-center text-gray-500 dark:text-gray-400 mb-3">
                                    {!startValue ? 'Selecione a data inicial' : !endValue ? 'Selecione a data final' : 'Clique para selecionar um novo período'}
                                </div>
                                <div className="grid grid-cols-7 mb-2">
                                    {diasSemana.map(d => <div key={d} className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold text-gray-400">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHoverDate(null)}>
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
