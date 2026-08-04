"use client";
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import { obterCorStatus } from '@/lib/utils/constants';
import { corPorNome } from '@/lib/utils/formatters';
import { ChipNome } from '@/components/ui/ChipNome';

// ==== COMPONENTE DE DROPDOWN CUSTOMIZADO ====
export function InlineDropdown({ value, options, onChange, className, hasIndefinido = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef(null);
    const getTextColor = (val) => obterCorStatus(val);

    const toggleDropdown = () => {
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calcula se há espaço para baixo. Se não, abre para cima
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
                    <span className={`truncate font-medium ${getTextColor(value)}`} title={value || 'Indefinido'}>{value || 'Indefinido'}</span>
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

// ==== COMPONENTE DE SELECT CUSTOMIZADO (substitui <select> nativo) ====
export function CustomSelect({ value, options, onChange, className, placeholder = 'Selecione', disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [popoverStyle, setPopoverStyle] = useState({});
    const containerRef = useRef(null);
    const selected = options.find(o => o.value === value);

    const toggleDropdown = () => {
        if (disabled) return;
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Se o espaço abaixo for menor que a altura da lista (max-h-60, ~240px), abre pra cima.
            const abrirParaCima = window.innerHeight - rect.bottom < 250;
            // Posição fixa calculada a partir do campo (via portal), para não ser
            // cortado por containers com overflow-hidden (ex: o card do modal).
            setPopoverStyle({
                position: 'fixed',
                left: rect.left,
                width: Math.max(rect.width, 160),
                ...(abrirParaCima
                    ? { bottom: window.innerHeight - rect.top + 4 }
                    : { top: rect.bottom + 4 }),
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={toggleDropdown}
                className={`flex items-center justify-between ${className} ${isOpen ? 'border-brand ring-1 ring-brand/20' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className="truncate" title={selected ? selected.label : ''}>{selected ? selected.label : placeholder}</span>
                <Icon name="chevron-down" className={`w-4 h-4 text-gray-400 shrink-0 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && !disabled && typeof document !== 'undefined' && createPortal(
                <>
                    <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
                    <ul style={popoverStyle} className="z-[95] max-h-60 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar text-[13px]">
                        {options.map(opt => (
                            <li
                                key={opt.value}
                                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
                                className={`px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 transition font-medium flex items-center justify-between gap-2 ${value === opt.value ? 'bg-brand/5 dark:bg-brand/10 text-brand' : 'text-gray-700 dark:text-[#EDEDED]'}`}
                            >
                                <span className="truncate" title={opt.label}>{opt.label}</span>
                                {value === opt.value && <Icon name="check" className="w-3.5 h-3.5 shrink-0" />}
                            </li>
                        ))}
                    </ul>
                </>,
                document.body
            )}
        </div>
    );
}

// ==== COMPONENTE DE DROPDOWN MULTI-SELECT ====
export function MultiSelectDropdown({ value, options, onChange, className, disabled, placeholder = "Indefinido" }) {
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
            // Calcula o espaço. Se faltar espaço em baixo, abre o pop-up para cima.
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
                <div className="flex items-center gap-1 flex-wrap min-w-0">
                    {selectedArr.length > 0 ? (
                        selectedArr.map(nome => <ChipNome key={nome} nome={nome} />)
                    ) : (
                        <span className="truncate font-medium text-gray-500 dark:text-gray-400">{placeholder}</span>
                    )}
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
                                    className={`px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 transition font-medium flex items-center justify-between gap-2 ${isSelected ? 'text-brand bg-brand/5 dark:bg-brand/10' : 'text-gray-700 dark:text-[#EDEDED]'}`}
                                >
                                    <span className="flex items-center gap-1.5 min-w-0"><span className={`w-2 h-2 rounded-full shrink-0 ${corPorNome(opt).bg}`}></span><span className="truncate">{opt}</span></span>
                                    {isSelected ? <Icon name="check-square" className="w-3.5 h-3.5 shrink-0" /> : <Icon name="square" className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
}
