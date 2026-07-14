"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import Icon from '@/components/Icon';

const supabase = createClient(
    'https://xbanoipgoleuahwbqksy.supabase.co',
    'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh'
);




// ==== LISTAS GLOBAIS DE ESTADOS ====
export const STATUSES_PRODUCAO = [
    'Aguardando Pagamento', 'Aguardando Retorno', 'Desenvolvimento de Arte', 
    'Etiqueta Escolar', 'Produzir', 'Produção', 'Avisar Cliente', 'Retirada'
];
export const STATUSES_FINALIZADOS = ['Abandonado', 'Cancelado', 'Concluído', 'Finalizado'];
export const RESPONSAVEIS = ['Giovana', 'Murilo', 'Bruno', 'Nicole', 'Hellen', 'Jessica', 'Vini'];


// ==== MAPEAMENTO DE CORES DOS STATUS ====
export const obterCorStatus = (status) => {
    switch (status) {
        case 'Aguardando Pagamento': return 'text-emerald-500 dark:text-emerald-400';
        case 'Aguardando Retorno': return 'text-lime-500 dark:text-lime-400';
        case 'Desenvolvimento de Arte': return 'text-cyan-500 dark:text-cyan-400';
        case 'Etiqueta Escolar': return 'text-blue-600 dark:text-blue-500';
        case 'Produzir': return 'text-purple-500 dark:text-purple-400';
        case 'Produção': return 'text-gray-500 dark:text-gray-400';
        case 'Avisar Cliente': return 'text-pink-500 dark:text-pink-400';
        case 'Retirada': return 'text-sky-500 dark:text-sky-400';
        case 'Abandonado': return 'text-yellow-600 dark:text-yellow-400';
        case 'Cancelado': return 'text-red-500 dark:text-red-400';
        case 'Concluído': return 'text-orange-500 dark:text-orange-400';
        case 'Finalizado': return 'text-indigo-500 dark:text-indigo-400';
        default: return 'text-gray-700 dark:text-[#EDEDED]';
    }
};

// ==== FORMATADORES ====
export const formatarValorFinanceiro = (valor) => {
    if (valor == null || isNaN(valor)) return '0,00';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
};

export const formatarMoeda = (valor) => {
    if (!valor) return '';
    const numeroLimpo = valor.toString().replace(/\D/g, ''); 
    if (numeroLimpo === '') return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(numeroLimpo) / 100);
};

export const formatarTelefone = (valor) => {
    if (!valor) return '';
    let v = valor.replace(/\D/g, ''); 
    if (v.length > 11) v = v.substring(0, 11); 
    if (v.length > 2) v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length > 10) v = `${v.substring(0, 10)}-${v.substring(10)}`;
    return v;
};

export const obterDataAtual = () => new Date().toISOString().split('T')[0];

export const formatarDataExibicao = (dataISO) => {
    if (!dataISO) return '---';
    const partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

export const formatarMesAno = (str) => {
    if(!str) return '';
    const [y, m] = str.split('-');
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${mesesNomes[parseInt(m)-1]}/${y}`;
};

// ==== COMPONENTE DE DATA CUSTOMIZADO ====
export function CustomDatePicker({ value, onChange, placeholder, disabled, className }) {
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
            // Se o espaço abaixo for menor que a altura do calendário (~320px), abre pra cima
            setOpenUpwards(window.innerHeight - rect.bottom < 320);
        }
        setIsOpen(!isOpen);
    };

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

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
                <div className="flex items-center gap-1.5 truncate">
                    <span className={`truncate font-medium ${selectedArr.length > 0 ? 'text-brand dark:text-brand' : 'text-gray-500 dark:text-gray-400'}`}>
                        {selectedArr.length > 0 ? selectedArr.join(', ') : placeholder}
                    </span>
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
                                    className={`px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 transition font-medium flex items-center justify-between ${isSelected ? 'text-brand bg-brand/5 dark:bg-brand/10' : 'text-gray-700 dark:text-[#EDEDED]'}`}
                                >
                                    {opt}
                                    {isSelected ? <Icon name="check-square" className="w-3.5 h-3.5" /> : <Icon name="square" className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
}

// DESTRUTURADOR E RESUMO DE SERVIÇO
export function desconstruirTextoServico(texto) {
    if (!texto) return { itens: [], observacoes: '', pagamentos: [] };
    
    let partesPagamento = texto.split('\n\n[PAGAMENTOS]\n');
    let textoSemPagamento = partesPagamento[0];
    let pagamentosStr = partesPagamento[1] || '[]';
    let pagamentos = [];
    try { pagamentos = JSON.parse(pagamentosStr); } catch (e) { pagamentos = []; }

    let partes = textoSemPagamento.split('\n\n[OBSERVAÇÕES GERAIS]\n');
    let blocoItens = partes[0];
    let obs = partes[1] || '';
    if (!blocoItens.startsWith('• ') && partes.length === 1) return { itens: [], observacoes: textoSemPagamento, pagamentos };
    
    let itensTraduzidos = [];
    let blocosIndividuais = blocoItens.split('\n\n');
    
    for (let bloco of blocosIndividuais) {
        if (!bloco.startsWith('• ')) { obs = obs ? obs + '\n' + bloco : bloco; continue; }
        let lines = bloco.split('\n');
        if (lines.length < 3) { obs = obs ? obs + '\n' + bloco : bloco; continue; }
        
        let nomeBruto = lines[0].replace('• ', '').replace('  ', '').trim();
        let id_produto = null;
        let matchId = nomeBruto.match(/^\[#(\d+)\]\s(.*)$/);
        if (matchId) {
            id_produto = parseInt(matchId[1]);
            nomeBruto = matchId[2];
        }
        let nome = nomeBruto;
        let AppValor = '0,00';
        let local_producao = 'Berlim'; // fallback/default
        let descLines = [];
        let concluido = false;
        
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('Valor: R$ ')) {
                AppValor = line.replace('Valor: R$ ', '');
            } else if (line.startsWith('Local: ')) {
                local_producao = line.replace('Local: ', '');
            } else if (line === '[✓] Concluído') {
                concluido = true;
            } else {
                descLines.push(lines[i].replace(/^  /, ''));
            }
        }
        
        let descricao = descLines.join('\n').trim();
        
        let valor = AppValor; let desconto = '';
        let matchDesconto = AppValor.match(/\s\(-(\d+)%\)$/);
        if (matchDesconto) { desconto = matchDesconto[1]; valor = AppValor.replace(matchDesconto[0], '').trim(); }
        
        itensTraduzidos.push({ id_produto, nome, descricao, valor, desconto, local_producao, concluido, id_temp: Math.random() + Date.now() });
    }
    return { itens: itensTraduzidos, observacoes: obs, pagamentos };
}

export function obterResumoServicos(texto) {
    const desc = desconstruirTextoServico(texto);
    if (desc.itens.length > 0) {
        return desc.itens.map(i => i.nome).join(' + ');
    }
    return texto ? texto.substring(0, 40) + '...' : '---';
}

export function ItensChecklist({ pedido, atualizarCampoInline }) {
    const { itens, observacoes, pagamentos } = desconstruirTextoServico(pedido.servico);
    
    if (itens.length === 0) {
        return <span className="truncate max-w-[18rem] block">{pedido.servico ? pedido.servico.substring(0, 40) + '...' : '---'}</span>;
    }

    const toggleItem = (idx) => {
        const novosItens = [...itens];
        novosItens[idx].concluido = !novosItens[idx].concluido;
        
        let textoFinal = '';
        const itensTextoArray = novosItens.map(i => {
            const strDesconto = i.desconto ? ' (-' + i.desconto + '%)' : '';
            const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
            const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
            const strConcluido = i.concluido ? '\n  [✓] Concluído' : '';
            return strNome + '\n  ' + i.descricao + '\n  Valor: R$ ' + i.valor + strDesconto + strLocal + strConcluido;
        });
        textoFinal += itensTextoArray.join('\n\n') + '\n\n';
        if (observacoes) textoFinal += '[OBSERVAÇÕES GERAIS]\n' + observacoes;
        if (pagamentos.length > 0) textoFinal += '\n\n[PAGAMENTOS]\n' + JSON.stringify(pagamentos);
        
        atualizarCampoInline(pedido.id, 'servico', textoFinal);
    };

    return (
        <div className="flex flex-wrap gap-1.5 items-center w-full min-w-[300px]">
            {itens.map((item, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleItem(idx); }}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-semibold rounded shadow-sm transition transform hover:scale-105 ${
                        item.concluido
                            ? 'bg-emerald-500 text-white border border-emerald-600'
                            : 'bg-gray-100 dark:bg-darkElevated text-gray-500 dark:text-[#A1A1AA] border border-gray-200 dark:border-darkBorder hover:bg-gray-200 dark:hover:bg-darkHover'
                    }`}
                    title={item.concluido ? 'Marcar como pendente' : 'Marcar como concluído'}
                >
                    {item.concluido && <Icon name="check" className="w-3 h-3" />}
                    <span className="truncate max-w-[100px]">{item.nome}</span>
                </button>
            ))}
        </div>
    );
}

export function StackedCards({ title, description, icon, cards }) {
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
                            {/* CABEÇALHO INTEGRADO */}
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
export function CalculadoraBanner() {
    const [largura, setLargura] = useState('');
    const [altura, setAltura] = useState('');
    const [tipo, setTipo] = useState('simples');
    const [acabamento, setAcabamento] = useState('bastao_corda');
    const [prazo, setPrazo] = useState('padrao');
    const [quantidade, setQuantidade] = useState(1);

    const calcular = () => {
        const l = parseFloat(largura.replace(',', '.'));
        const a = parseFloat(altura.replace(',', '.'));
        if (isNaN(l) || isNaN(a) || l <= 0 || a <= 0) return '0,00';
        
        let valorM2 = tipo === 'simples' ? 90.0 : 130.0;
        
        if (acabamento === 'sem_acabamento') {
            valorM2 -= 10.0;
        }

        let precoUnitario = 0;
        
        if (l <= 1 && a <= 1) { // none is > 1
            const areaFisica = l * a;
            if (areaFisica <= 0.5) precoUnitario = 65.0;
            else precoUnitario = valorM2;
        } else {
            const areaCobrada = Math.max(l, 1) * Math.max(a, 1);
            precoUnitario = areaCobrada * valorM2;
        }
        
        // Multiplicador de prazo
        let multiplicadorPrazo = 1.0;
        if (prazo === 'outro_dia') multiplicadorPrazo = 1.3; // +30%
        if (prazo === 'mesmo_dia') multiplicadorPrazo = 1.6; // +60%
        
        return ((precoUnitario * multiplicadorPrazo) * quantidade).toFixed(2);
    };

    const gerarTextoCopia = () => {
        const l = parseFloat(largura.replace(',', '.'));
        const a = parseFloat(altura.replace(',', '.'));
        if (isNaN(l) || isNaN(a) || l <= 0 || a <= 0) return '';
        
        const textTipo = tipo === 'simples' ? 'Lona 440g Brilho | Sem Laminação (Película de proteção)' : 'Lona 440g Brilho | Laminado Brilho ou Fosco';
        const textAcab = acabamento === 'bastao_corda' ? 'Acabamento em Bastão e Corda' : acabamento === 'ilhos' ? 'Acabamento em Ilhós (Argolas de Ferro)' : 'Sem Acabamento';
        const val = calcular().replace('.', ',');
        const dim = `${Math.round(l * 100)}x${Math.round(a * 100)}cm`;
        
        const plural = quantidade > 1 ? 'Banners' : 'Banner';
        return `${quantidade} ${plural} | ${dim} | ${textTipo} | ${textAcab} - R$ ${val}`;
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Calculadora de Banner / Lona</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Largura (m)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 1,50" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Altura (m)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 2,00" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tipo de Lona</label>
                    <div className="relative">
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="simples">Lona 440g Brilho (R$ 90/m²)</option>
                            <option value="laminado">Lona 440g Brilho Laminada (R$ 130/m²)</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Acabamento</label>
                    <div className="relative">
                        <select value={acabamento} onChange={e => setAcabamento(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="bastao_corda">Bastão e Corda</option>
                            <option value="ilhos">Ilhós (Argolas de ferro)</option>
                            <option value="sem_acabamento">Sem Acabamento (- R$ 10/m²)</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Prazo de Entrega</label>
                    <div className="relative">
                        <select value={prazo} onChange={e => setPrazo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="padrao">Padrão</option>
                            <option value="outro_dia">Para outro dia (+30%)</option>
                            <option value="mesmo_dia">Para o mesmo dia (+60%)</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(parseInt(e.target.value) || 1)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-gray-50 dark:bg-darkElevated p-3 rounded border border-gray-100 dark:border-darkBorder flex items-center gap-3 shadow-sm">
                    <div className="text-[11px] text-gray-600 dark:text-[#A1A1AA] flex-1 font-mono break-all line-clamp-2">
                        {gerarTextoCopia() || 'Preencha as medidas para gerar o texto da proposta...'}
                    </div>
                    <button onClick={() => { if(gerarTextoCopia()) navigator.clipboard.writeText(gerarTextoCopia()) }} className="w-8 h-8 flex items-center justify-center shrink-0 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded hover:text-brand transition shadow-sm" title="Copiar Texto">
                        <Icon name="copy" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                <span className="font-semibold text-brand">Total Estimado</span>
                <span className="text-2xl font-black text-brand">R$ {calcular().replace('.', ',')}</span>
            </div>
        </div>
    );
}

export function CalculadoraAdesivo({ produtos }) {
    const [largura, setLargura] = useState('');
    const [altura, setAltura] = useState('');
    const [tipo, setTipo] = useState('17');
    const [quantidade, setQuantidade] = useState('');

    const item15 = produtos?.find(p => Number(p.id) === 15);
    const item16 = produtos?.find(p => Number(p.id) === 16);
    const item17 = produtos?.find(p => Number(p.id) === 17);
    const item18 = produtos?.find(p => Number(p.id) === 18);
    const item19 = produtos?.find(p => Number(p.id) === 19);
    const item21 = produtos?.find(p => Number(p.id) === 21);

    const preco15 = item15 ? parseFloat(item15.preco_base) : 33.0;
    const preco16 = item16 ? parseFloat(item16.preco_base) : 33.0;
    const preco17 = item17 ? parseFloat(item17.preco_base) : 90.0;
    const preco18 = item18 ? parseFloat(item18.preco_base) : 130.0;
    const preco19 = item19 ? parseFloat(item19.preco_base) : 115.0;
    const preco21 = item21 ? parseFloat(item21.preco_base) : 55.0;

    const calculaCabem = (areaW, areaH, adW, adH) => {
        return Math.floor(areaW / adW) * Math.floor(areaH / adH);
    };

    const lRawNum = parseFloat(String(largura).replace(',', '.'));
    const aRawNum = parseFloat(String(altura).replace(',', '.'));
    const isTamanhoInvalido = (lRawNum > 0 && lRawNum < 3) || (aRawNum > 0 && aRawNum < 3);

    const copiarMaximos = () => {
        if (isNaN(lRawNum) || isNaN(aRawNum) || lRawNum <= 0 || aRawNum <= 0) {
            alert('Preencha largura e altura para calcular.');
            return;
        }
        if (isTamanhoInvalido) {
            alert('O tamanho mínimo permitido é 3x3cm.');
            return;
        }

        const l = lRawNum + 0.2;
        const a = aRawNum + 0.2;
        const qSRA3 = calculaCabem(26, 39, l, a);
        const qMeio = calculaCabem(44, 94, l, a);
        const qMetro = calculaCabem(94, 94, l, a);

        let texto = '';

        if (tipo === '17') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Sem Laminação | 1/2 corte | Entregue em folha A3 - R$ ${preco15.toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Sem Laminação | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${(preco17 * 0.7333).toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Látex | Sem Laminação | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${preco17.toFixed(2).replace('.', ',')}\n\n`;
            }
            texto = texto.trim();
        } else if (tipo === '18') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha A3 - R$ ${preco21.toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${(preco18 * 0.7333).toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Látex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${preco18.toFixed(2).replace('.', ',')}\n\n`;
            }
            texto = texto.trim();
        } else if (tipo === '19') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | Impressão Laser ou Látex | 1/2 corte | Entregue em folha A3 - R$ ${preco16.toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | Impressão Laser ou Látex | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${(preco19 * 0.7333).toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | Impressão Látex | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${preco19.toFixed(2).replace('.', ',')}\n\n`;
            }
            texto = texto.trim();
        }

        navigator.clipboard.writeText(texto);
        alert('Orçamentos de quantidades máximas copiados!');
    };

    const calcular = () => {
        if (isTamanhoInvalido) return '0,00';
        
        const lRaw = parseFloat(largura.replace(',', '.'));
        const aRaw = parseFloat(altura.replace(',', '.'));
        const qty = parseInt(quantidade) || 0;
        if (isNaN(lRaw) || isNaN(aRaw) || lRaw <= 0 || aRaw <= 0 || qty <= 0) return '0,00';
        
        // Sangria de 0,2cm
        const l = lRaw + 0.2;
        const a = aRaw + 0.2;
        
        const qSRA3 = calculaCabem(26, 39, l, a);
        const qMeio = calculaCabem(44, 94, l, a);
        const qMetro = calculaCabem(94, 94, l, a);

        let sra3Price = preco15;
        let basePrice = preco17;

        if (tipo === '17') {
            sra3Price = preco15;
            basePrice = preco17;
        } else if (tipo === '18') {
            sra3Price = preco21;
            basePrice = preco18;
        } else if (tipo === '19') {
            sra3Price = preco16;
            basePrice = preco19;
        }

        let total = 0;

        if (qSRA3 > 0 && qty <= qSRA3) {
            total = sra3Price;
        } else if (qMeio > 0 && qty <= qMeio) {
            total = basePrice * 0.7333;
        } else if (qMetro > 0 && qty <= qMetro) {
            total = basePrice;
        } else {
            if (qMetro > 0) {
                const metrosNecessarios = qty / qMetro;
                total = metrosNecessarios * basePrice;
            } else {
                const areaFisica = (l * a) / 10000;
                total = (areaFisica * qty) * basePrice;
            }
        }

        return total.toFixed(2);
    };

    const gerarTextoCopia = () => {
        if (isTamanhoInvalido) return '';
        
        const lRaw = parseFloat(largura.replace(',', '.'));
        const aRaw = parseFloat(altura.replace(',', '.'));
        const qty = parseInt(quantidade) || 0;
        if (isNaN(lRaw) || isNaN(aRaw) || lRaw <= 0 || aRaw <= 0 || qty <= 0) return '';
        
        let nomeTipo = 'Vinil';
        let lam = '';
        
        if (tipo === '17') {
            nomeTipo = item17 ? item17.nome : 'Adesivo Vinil Branco';
            lam = ' | Sem Laminação';
        } else if (tipo === '18') {
            nomeTipo = item18 ? item18.nome : 'Adesivo Vinil Branco';
            lam = ' | Laminado Brilho/Fosco';
        } else if (tipo === '19') {
            nomeTipo = item19 ? item19.nome : 'Adesivo Vinil Transparente';
        }
        
        const val = calcular().replace('.', ',');
        
        // Calcular onde coube para gerar o texto de entrega
        const l = lRaw + 0.2;
        const a = aRaw + 0.2;
        const qSRA3 = Math.floor(26 / l) * Math.floor(39 / a);
        
        let entregaStr = '';
        if (qSRA3 > 0 && qty <= qSRA3) {
            entregaStr = ' | Entregue em folha A3';
        } else {
            entregaStr = ' | Entregue em folha de 1/2 metro';
        }
        
        const plural = qty > 1 ? 'Adesivos' : 'Adesivo';
        return `${qty} ${plural} | ${lRaw}x${aRaw}cm | ${nomeTipo}${lam} | 1/2 corte${entregaStr} - R$ ${val}`;
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder relative">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Calculadora de Adesivos (Vinil)</h3>
            
            {isTamanhoInvalido && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[12px] rounded border border-red-200 dark:border-red-900/50 flex items-center gap-2 font-medium">
                    <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
                    O tamanho mínimo permitido para adesivos é de 3x3cm.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Largura Unitária (cm)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Altura Unitária (cm)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tipo de Adesivo</label>
                    <div className="relative">
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="17">{item17 ? item17.nome : 'Item 17'}</option>
                            <option value="18">{item18 ? item18.nome : 'Item 18'} (Laminado Brilho/Fosco)</option>
                            <option value="19">{item19 ? item19.nome : 'Item 19'}</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Quantidade</label>
                    <div className="flex gap-2">
                        <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                        <button onClick={copiarMaximos} className="bg-brand text-white px-3 rounded flex items-center justify-center hover:bg-brand/90 transition shadow-sm" title="Copiar orçamentos de quantidades máximas">
                            <Icon name="copy" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-gray-50 dark:bg-darkElevated p-3 rounded border border-gray-100 dark:border-darkBorder flex items-center gap-3 shadow-sm">
                    <div className="text-[11px] text-gray-600 dark:text-[#A1A1AA] flex-1 font-mono break-all line-clamp-2">
                        {gerarTextoCopia() || 'Preencha as medidas para gerar o texto da proposta...'}
                    </div>
                    <button onClick={() => { if(gerarTextoCopia()) navigator.clipboard.writeText(gerarTextoCopia()) }} className="w-8 h-8 flex items-center justify-center shrink-0 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded hover:text-brand transition shadow-sm" title="Copiar Texto">
                        <Icon name="copy" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                <span className="font-semibold text-brand">Total Estimado</span>
                <span className="text-2xl font-black text-brand">R$ {calcular().replace('.', ',')}</span>
            </div>
        </div>
    );
}

export function CalculadoraCasamento() {
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
                            <input type="text" value={item.nome} onChange={e => atualizarItem(item.id, 'nome', e.target.value)} placeholder="Ex: Menu, Lágrimas de Alegria..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
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

export function CalculadorasAba({ calculadoraAtiva, produtos }) {
    return (
        <div className="flex-1 p-6 lg:p-10 mx-auto w-full max-w-3xl fade-in flex flex-col h-[calc(100vh-112px)] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Calculadoras</h1>
                    <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Ferramentas para auxiliar em orçamentos rápidos.</p>
                </div>
            </div>

            <div className="w-full">
                {calculadoraAtiva === 'banner' && <CalculadoraBanner />}
                {calculadoraAtiva === 'adesivo' && <CalculadoraAdesivo produtos={produtos} />}
                {calculadoraAtiva === 'casamento' && <CalculadoraCasamento />}
            </div>
        </div>
    );
}

// ================= APLICAÇÃO PRINCIPAL =================
