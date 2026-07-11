const { useState, useEffect, useRef, useMemo } = React;

const supabase = window.supabase.createClient(
    'https://xbanoipgoleuahwbqksy.supabase.co',
    'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh'
);

// ==== ÍCONES NATIVOS ====
function Icon({ name, className = "w-4 h-4" }) {
    if (name === 'printer') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>;
    if (name === 'copy') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
    if (name === 'calculator') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
    if (name === 'sun') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>;
    if (name === 'moon') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>;
    if (name === 'plus') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>;
    if (name === 'x') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>;
    if (name === 'chevron-down') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"></path></svg>;
    if (name === 'chevron-left') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"></path></svg>;
    if (name === 'chevron-right') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"></path></svg>;
    if (name === 'trash-2') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>;
    if (name === 'log-out') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
    if (name === 'lock') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
    if (name === 'search') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
    if (name === 'calendar') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>;
    if (name === 'thumbs-up') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
    if (name === 'package') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
    if (name === 'layout-dashboard') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
    if (name === 'list') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
    if (name === 'square') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>;
    if (name === 'check-square') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    if (name === 'save') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
    if (name === 'check') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>;
    if (name === 'alert-triangle') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;
    if (name === 'users') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
    if (name === 'trending-up') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>;
    if (name === 'trending-down') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>;
    if (name === 'edit-3') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
    if (name === 'check-circle') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
    return null;
}

// ==== LISTAS GLOBAIS DE ESTADOS ====
const STATUSES_PRODUCAO = [
    'Aguardando Pagamento', 'Aguardando Retorno', 'Desenvolvimento de Arte', 
    'Etiqueta Escolar', 'Produzir', 'Produção', 'Avisar Cliente', 'Retirada'
];
const STATUSES_FINALIZADOS = ['Abandonado', 'Cancelado', 'Concluído', 'Finalizado'];
const RESPONSAVEIS = ['Gi', 'Murilo', 'Bruno', 'Nicole', 'Hellen', 'Jessica', 'Vini'];
const LOCAIS = ['Berlim', 'Futura', 'Atual Card', 'Alvo', 'Xexe', 'StampMix'];

// ==== MAPEAMENTO DE CORES DOS STATUS ====
const obterCorStatus = (status) => {
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
const formatarValorFinanceiro = (valor) => {
    if (valor == null || isNaN(valor)) return '0,00';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
};

const formatarMoeda = (valor) => {
    if (!valor) return '';
    const numeroLimpo = valor.toString().replace(/\D/g, ''); 
    if (numeroLimpo === '') return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(numeroLimpo) / 100);
};

const formatarTelefone = (valor) => {
    if (!valor) return '';
    let v = valor.replace(/\D/g, ''); 
    if (v.length > 11) v = v.substring(0, 11); 
    if (v.length > 2) v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length > 10) v = `${v.substring(0, 10)}-${v.substring(10)}`;
    return v;
};

const obterDataAtual = () => new Date().toISOString().split('T')[0];

const formatarDataExibicao = (dataISO) => {
    if (!dataISO) return '---';
    const partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const formatarMesAno = (str) => {
    if(!str) return '';
    const [y, m] = str.split('-');
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${mesesNomes[parseInt(m)-1]}/${y}`;
};

// ==== COMPONENTE DE DATA CUSTOMIZADO ====
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
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm cursor-pointer transition
                        ${isSelected ? 'bg-brand text-white font-bold' : 
                          isToday ? 'bg-gray-100 dark:bg-darkElevated text-brand font-bold hover:bg-gray-200 dark:hover:bg-darkHover' : 
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
                            <span className="font-semibold text-sm dark:text-white">{meses[viewDate.getMonth()]} de {viewDate.getFullYear()}</span>
                            <button type="button" onClick={(e) => changeMonth(e, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-darkElevated rounded text-gray-500 dark:text-gray-400"><Icon name="chevron-right" /></button>
                        </div>
                        <div className="grid grid-cols-7 mb-2">
                            {diasSemana.map(d => <div key={d} className="w-8 h-8 flex items-center justify-center text-[10px] font-bold text-gray-400">{d}</div>)}
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
function InlineDropdown({ value, options, onChange, className, hasIndefinido = false }) {
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
                    <ul className={`absolute left-0 z-[60] w-full min-w-[160px] max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar text-xs ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
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
function MultiSelectDropdown({ value, options, onChange, className, disabled, placeholder = "Indefinido" }) {
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
                    <ul className={`absolute left-0 z-[60] w-full min-w-[160px] max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar text-xs ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
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
function desconstruirTextoServico(texto) {
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
        
        let nome = lines[0].replace('• ', '').trim();
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
        
        itensTraduzidos.push({ nome, descricao, valor, desconto, local_producao, concluido, id_temp: Math.random() + Date.now() });
    }
    return { itens: itensTraduzidos, observacoes: obs, pagamentos };
}

function obterResumoServicos(texto) {
    const desc = desconstruirTextoServico(texto);
    if (desc.itens.length > 0) {
        return desc.itens.map(i => i.nome).join(' + ');
    }
    return texto ? texto.substring(0, 40) + '...' : '---';
}

function ItensChecklist({ pedido, atualizarCampoInline }) {
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
            const strNome = i.nome ? '• ' + i.nome : '• Serviço Personalizado';
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
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold rounded shadow-sm transition transform hover:scale-105 ${
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
                            {/* CABEÇALHO INTEGRADO */}
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-darkBorder/50">
                                <div className="flex items-center gap-3">
                                    {icon && (
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-darkCard flex items-center justify-center shadow-sm text-brand border border-gray-100 dark:border-darkBorder/50">
                                            <Icon name={icon} className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white capitalize leading-tight">{title}</h3>
                                    </div>
                                </div>
                                {cards.length > 1 && (
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-darkBorder/30 border border-gray-200 dark:border-darkBorder px-2 py-1 rounded-full">
                                        {i + 1}/{cards.length}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-3">
                                <h4 className={`text-xs font-bold flex items-center ${titleClass}`}>
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
function CalculadoraBanner() {
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
        
        const area = l * a;
        
        let valorM2 = tipo === 'simples' ? 90.0 : 130.0;
        
        if (acabamento === 'sem_acabamento') {
            valorM2 -= 10.0;
        }

        let precoUnitario = 0;
        
        if (area <= 0.5) {
            precoUnitario = 65.0; // Até 50x100cm (0.5m²)
        } else if (area <= 1.0) {
            precoUnitario = valorM2; // Entre 50x100cm e 100x100cm (1m²)
        } else {
            precoUnitario = area * valorM2; // Acima de 1m²
        }
        
        // Multiplicador de prazo
        let multiplicadorPrazo = 1.0;
        if (prazo === 'outro_dia') multiplicadorPrazo = 1.3; // +30%
        if (prazo === 'mesmo_dia') multiplicadorPrazo = 1.6; // +60%
        
        return ((precoUnitario * multiplicadorPrazo) * quantidade).toFixed(2);
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder">
            <h3 className="text-lg font-bold dark:text-white mb-4">Calculadora de Banner / Lona</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Largura (m)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 1,50" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Altura (m)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 2,00" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Lona</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition">
                        <option value="simples">Lona Simples (R$ 90/m²)</option>
                        <option value="laminado">Lona Laminada Brilho/Fosco (R$ 130/m²)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Acabamento</label>
                    <select value={acabamento} onChange={e => setAcabamento(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition">
                        <option value="bastao_corda">Bastão e Corda</option>
                        <option value="ilhos">Ilhós (Argolas de ferro)</option>
                        <option value="sem_acabamento">Sem Acabamento (- R$ 10/m²)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Prazo de Entrega</label>
                    <select value={prazo} onChange={e => setPrazo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition">
                        <option value="padrao">Padrão</option>
                        <option value="outro_dia">Para outro dia (+30%)</option>
                        <option value="mesmo_dia">Para o mesmo dia (+60%)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(parseInt(e.target.value) || 1)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" />
                </div>
            </div>
            <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                <span className="font-semibold text-brand">Total Estimado</span>
                <span className="text-2xl font-black text-brand">R$ {calcular().replace('.', ',')}</span>
            </div>
        </div>
    );
}

function CalculadoraAdesivo() {
    const [largura, setLargura] = useState('');
    const [altura, setAltura] = useState('');
    const [tipo, setTipo] = useState('vinil_branco');
    const [recorte, setRecorte] = useState('reto');
    const [quantidade, setQuantidade] = useState(100);

    const precosVinil = {
        'vinil_branco': 45.0,
        'vinil_transparente': 45.0,
        'vinil_fosco': 45.0,
        'perfurado': 65.0
    };

    const calcular = () => {
        const l = parseFloat(largura.replace(',', '.')) / 100; // cm para m
        const a = parseFloat(altura.replace(',', '.')) / 100;
        if (isNaN(l) || isNaN(a) || l <= 0 || a <= 0) return '0,00';
        
        const areaTotal = (l * a) * quantidade;
        let precoM2 = precosVinil[tipo];
        
        if (recorte === 'contorno') precoM2 += 25.0; // Adicional de recorte

        let total = areaTotal * precoM2;
        if (total > 0 && total < 15) total = 15.0; // Preço mínimo

        return total.toFixed(2);
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder">
            <h3 className="text-lg font-bold dark:text-white mb-4">Calculadora de Adesivos (Vinil)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Largura Unitária (cm)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Altura Unitária (cm)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Adesivo</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition">
                        <option value="vinil_branco">Vinil Branco Brilho</option>
                        <option value="vinil_fosco">Vinil Branco Fosco</option>
                        <option value="vinil_transparente">Vinil Transparente</option>
                        <option value="perfurado">Vinil Perfurado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Corte / Acabamento</label>
                    <select value={recorte} onChange={e => setRecorte(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition">
                        <option value="reto">Corte Reto (Refile)</option>
                        <option value="contorno">Meio Corte / Contorno</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(parseInt(e.target.value) || 1)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" />
                </div>
            </div>
            <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                <span className="font-semibold text-brand">Total Estimado</span>
                <span className="text-2xl font-black text-brand">R$ {calcular().replace('.', ',')}</span>
            </div>
        </div>
    );
}

function CalculadoraCasamento() {
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
            <h3 className="text-lg font-bold dark:text-white mb-4">Calculadora de Papelaria de Casamento</h3>
            
            <div className="space-y-4 mb-6">
                {itens.map((item, index) => (
                    <div key={item.id} className="flex gap-4 items-end bg-gray-50 dark:bg-darkElevated p-3 rounded border border-gray-100 dark:border-darkBorder">
                        <div className="flex-1">
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Item {index + 1}</label>
                            <input type="text" value={item.nome} onChange={e => atualizarItem(item.id, 'nome', e.target.value)} placeholder="Ex: Menu, Lágrimas de Alegria..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" />
                        </div>
                        <div className="w-24">
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Qtd</label>
                            <input type="number" min="1" value={item.quantidade} onChange={e => atualizarItem(item.id, 'quantidade', e.target.value)} className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" />
                        </div>
                        <div className="w-32">
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Valor Un. (R$)</label>
                            <input type="text" value={item.valorUnitario} onChange={e => atualizarItem(item.id, 'valorUnitario', e.target.value)} className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="0,00" />
                        </div>
                        <button onClick={() => removerItem(item.id)} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition shrink-0" title="Remover">
                            <Icon name="trash-2" className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button onClick={adicionarItem} className="text-sm font-semibold text-brand hover:text-brandHover flex items-center gap-1 transition">
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

function CalculadorasAba() {
    const [calculadoraAtiva, setCalculadoraAtiva] = useState('banner');

    return (
        <div className="flex-1 p-6 lg:p-10 mx-auto w-full max-w-3xl fade-in flex flex-col h-[calc(100vh-60px)] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Calculadoras</h1>
                    <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">Ferramentas para auxiliar em orçamentos rápidos.</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-darkElevated p-1 rounded-lg self-start">
                <button onClick={() => setCalculadoraAtiva('banner')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${calculadoraAtiva === 'banner' ? 'bg-white dark:bg-darkCard shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Banner / Lona</button>
                <button onClick={() => setCalculadoraAtiva('adesivo')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${calculadoraAtiva === 'adesivo' ? 'bg-white dark:bg-darkCard shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Adesivos (Vinil)</button>
                <button onClick={() => setCalculadoraAtiva('casamento')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${calculadoraAtiva === 'casamento' ? 'bg-white dark:bg-darkCard shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Papelaria Casamento</button>
            </div>

            <div className="w-full">
                {calculadoraAtiva === 'banner' && <CalculadoraBanner />}
                {calculadoraAtiva === 'adesivo' && <CalculadoraAdesivo />}
                {calculadoraAtiva === 'casamento' && <CalculadoraCasamento />}
            </div>
        </div>
    );
}

// ================= APLICAÇÃO PRINCIPAL =================
function App() {
    /// ==== CONTROLE DE SESSÃO E USUÁRIOS ====
    const [usuariosSistema, setUsuariosSistema] = useState([]);
    const [usuario, setUsuario] = useState(null);
    
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [erroLogin, setErroLogin] = useState('');

    const [abaAtual, setAbaAtual] = useState('producao');
    const [pedidos, setPedidos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [draggedProdutoIndex, setDraggedProdutoIndex] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [paginaClientes, setPaginaClientes] = useState(1);
    const [letraFiltroCliente, setLetraFiltroCliente] = useState('');
    
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [filtroNotas, setFiltroNotas] = useState('pendentes');
    const [buscaNotaFiscal, setBuscaNotaFiscal] = useState('');
    const [paginaNotasFiscais, setPaginaNotasFiscais] = useState(1);
    const [modalNotaFiscalAberto, setModalNotaFiscalAberto] = useState(false);
    const [notaFiscalEmEdicao, setNotaFiscalEmEdicao] = useState(null);
    const [salvandoNotaFiscal, setSalvandoNotaFiscal] = useState(false);

    const [darkMode, setDarkMode] = useState(true); 
    
    const isAdmin = usuario?.nivel === 'Administrador';
    const isOperador = usuario?.nivel === 'Produção/Atendimento';
    
    // Filtros
    const [buscaHistoricoText, setBuscaHistoricoText] = useState('');
    
    // Paginação
    const [paginaProducao, setPaginaProducao] = useState(1);
    const [paginaHistorico, setPaginaHistorico] = useState(1);
    const [paginaFinanceiro, setPaginaFinanceiro] = useState(1);
    const itensPorPagina = 50;
    const [dataFiltroInicio, setDataFiltroInicio] = useState('');
    const [dataFiltroFim, setDataFiltroFim] = useState('');

    const [buscaProducaoText, setBuscaProducaoText] = useState('');

    const [dataFiltroFinInicio, setDataFiltroFinInicio] = useState('');
    const [dataFiltroFinFim, setDataFiltroFinFim] = useState('');

    const [modalAberto, setModalAberto] = useState(false);
    const [salvandoOS, setSalvandoOS] = useState(false);
    const [osParaImprimir, setOsParaImprimir] = useState(null);
    const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null); 

    const [itensPedido, setItensPedido] = useState([]);
    const [itemAtual, setItemAtual] = useState({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim' });

    const [buscaCliente, setBuscaCliente] = useState('');
    const [clienteDropdownAberto, setClienteDropdownAberto] = useState(false);
    const [buscaProduto, setBuscaProduto] = useState('');
    const [produtoDropdownAberto, setProdutoDropdownAberto] = useState(false);

    const [pagamentosPedido, setPagamentosPedido] = useState([]);
    const [novoPagamento, setNovoPagamento] = useState({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú' });

    const [novoPedido, setNovoPedido] = useState({ 
        cliente: '', servico: '', valor_total: '', 
        status: 'Produzir', data_pedido: obterDataAtual(),
        prazo: '', responsavel: '', local_producao: 'Berlim', aprovado: false,
        entrega: false, urgente: false
    });
    
    const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
    const [salvandoProduto, setSalvandoProduto] = useState(false);
    const [novoProduto, setNovoProduto] = useState({ id: null, nome: '', texto_padrao: '', preco_base: '' });

    const [modalClienteAberto, setModalClienteAberto] = useState(false);
    const [salvandoCliente, setSalvandoCliente] = useState(false);
    const [novoCliente, setNovoCliente] = useState({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false });

    const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({ id: null, nome: '', senha: '', nivel: 'Produção/Atendimento' });

    useEffect(() => { 
        if(usuario) {
            carregarDados(); 
            
            // LIGA O RADAR DE TEMPO REAL DO SUPABASE
            const canalRealTime = supabase
                .channel('mudancas-banco')
                .on(
                    'postgres_changes', 
                    { event: '*', schema: 'public', table: 'pedidos' }, 
                    (payload) => {
                        console.log('Atualização em tempo real (pedidos) recebida!', payload);
                        carregarDados(); // Puxa os dados novos invisivelmente
                    }
                )
                .on(
                    'postgres_changes', 
                    { event: '*', schema: 'public', table: 'notas_fiscais' }, 
                    (payload) => {
                        console.log('Atualização em tempo real (notas_fiscais) recebida!', payload);
                        carregarDados(); // Puxa os dados novos invisivelmente
                    }
                )
            .subscribe();

            // Desliga o radar se o usuário fizer logoff
            return () => {
                supabase.removeChannel(canalRealTime);
            };
        }
    }, [usuario]);

    const isClienteProblema = (nome) => {
        if (!nome) return false;
        const c = clientes.find(cliente => cliente.nome === nome);
        return c ? c.cliente_problema : false;
    };

    async function carregarDados() {
        let todosPedidos = [];
        let from = 0;
        let limit = 1000;
        let fetchMore = true;
        
        while (fetchMore) {
            const { data: batch, error } = await supabase
                .from('pedidos')
                .select('*')
                .order('id', { ascending: false })
                .range(from, from + limit - 1);
                
            if (error) {
                console.error('Erro ao buscar pedidos:', error);
                break;
            }
            if (batch && batch.length > 0) {
                todosPedidos = [...todosPedidos, ...batch];
                if (batch.length < limit) {
                    fetchMore = false;
                } else {
                    from += limit;
                }
            } else {
                fetchMore = false;
            }
        }
        if (todosPedidos.length > 0) setPedidos(todosPedidos);
        
        const { data: listaProdutos } = await supabase.from('produtos').select('*').order('ordem', { ascending: true });
        if (listaProdutos) setProdutos(listaProdutos);
        
        let todosClientes = [];
        let fetchMoreClientes = true;
        let fromClientes = 0;
        const limitClientes = 1000;
        while (fetchMoreClientes) {
            const { data: batchClientes, error: errClientes } = await supabase.from('clientes').select('*').order('nome', { ascending: true }).range(fromClientes, fromClientes + limitClientes - 1);
            if (errClientes) break;
            if (batchClientes && batchClientes.length > 0) {
                todosClientes = [...todosClientes, ...batchClientes];
                if (batchClientes.length < limitClientes) fetchMoreClientes = false;
                else fromClientes += limitClientes;
            } else {
                fetchMoreClientes = false;
            }
        }
        if (todosClientes.length > 0) setClientes(todosClientes);

        const { data: listaUsuarios } = await supabase.from('usuarios').select('*').order('nome', { ascending: true });
        if (listaUsuarios) setUsuariosSistema(listaUsuarios);

        const { data: listaNotas } = await supabase.from('notas_fiscais').select('*').order('created_at', { ascending: false });
        if (listaNotas) setNotasFiscais(listaNotas);
    }
    
    useEffect(() => {
        setPaginaHistorico(1);
    }, [buscaHistoricoText, dataFiltroInicio, dataFiltroFim]);

    const efetuarLogin = async (e) => {
        e.preventDefault();
        setErroLogin('Conectando ao banco de dados...');
        const { data, error } = await supabase.from('usuarios').select('*');

        if (error) {
            console.error("Erro do Supabase:", error);
            setErroLogin('Erro de conexão: ' + error.message);
            return;
        }

        if (!data || data.length === 0) {
            setErroLogin('Tabela inacessível. Verifique se o RLS está desativado no Supabase.');
            return;
        }

        const conta = data.find(u => u.nome.toLowerCase() === loginInput.toLowerCase().trim() && String(u.senha) === senhaInput.trim());
        
        if (conta) {
            setUsuario(conta);
            setErroLogin('');
            setLoginInput('');
            setSenhaInput('');
            if (conta.nivel === 'Financeiro') setAbaAtual('financeiro');
            else setAbaAtual('producao');
        } else {
            setErroLogin('Usuário ou senha incorretos.');
        }
    };

    const toggleDarkMode = () => {
        if (darkMode) { document.documentElement.classList.remove('dark'); } 
        else { document.documentElement.classList.add('dark'); }
        setDarkMode(!darkMode);
    };

    async function atualizarCampoInline(id, campo, valor) {
        let payload = { [campo]: valor };
        if (campo === 'status' && valor === 'Concluído') {
            payload.prazo = obterDataAtual();
        }

        setPedidos(pedidos.map(p => {
            if (p.id === id) {
                return { ...p, ...payload };
            }
            return p;
        }));

        const { error } = await supabase.from('pedidos').update(payload).eq('id', id);
        if (error) {
            alert('Erro ao atualizar: ' + error.message);
            carregarDados(); 
        }
    }

    function fecharModalOS() {
        setModalAberto(false);
        setPedidoEmEdicao(null);
        setBuscaCliente('');
        setBuscaProduto('');
        setItensPedido([]); 
        setPagamentosPedido([]);
        setNovoPagamento({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú' });
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim' });
        setNovoPedido({ 
            cliente: '', servico: '', valor_total: '', 
            status: 'Produzir', data_pedido: obterDataAtual(),
            prazo: '', responsavel: '', local_producao: 'Berlim', aprovado: false,
            entrega: false, urgente: false
        });
    }

    function abrirEdicao(pedido) {
        const dadosDesconstruidos = desconstruirTextoServico(pedido.servico);
        setPedidoEmEdicao(pedido);
        setBuscaCliente(pedido.cliente);
        setItensPedido(dadosDesconstruidos.itens); 
        const pagamentosRecuperados = dadosDesconstruidos.pagamentos || [];
        setPagamentosPedido(pagamentosRecuperados);
        
        const totalPago = pagamentosRecuperados.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
        const totalOSStr = parseFloat(String(pedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
        const saldoRestante = totalOSStr - totalPago;
        
        setNovoPagamento({ 
            valor: saldoRestante > 0 ? formatarMoeda((saldoRestante * 100).toFixed(0).toString()) : '', 
            forma: 'PIX', parcelas: 1, instituicao: 'Itaú' 
        });
        setNovoPedido({
            cliente: pedido.cliente,
            servico: dadosDesconstruidos.observacoes,
            status: pedido.status,
            valor_total: formatarMoeda((pedido.valor_total * 100).toFixed(0).toString()),
            data_pedido: pedido.data_pedido || null,
            prazo: pedido.prazo || null,
            responsavel: pedido.responsavel || '',
            local_producao: pedido.local_producao || 'Berlim',
            aprovado: pedido.aprovado || false,
            entrega: pedido.entrega || false,
            urgente: pedido.urgente || false
        });
        setModalAberto(true);
    }

    function abrirEdicaoProduto(produto) {
        setNovoProduto({ id: produto.id, nome: produto.nome, texto_padrao: produto.texto_padrao, preco_base: formatarMoeda((produto.preco_base * 100).toFixed(0).toString()) });
        setModalProdutoAberto(true);
    }

    function abrirEdicaoCliente(cliente) {
        setNovoCliente({ id: cliente.id, nome: cliente.nome, telefone: cliente.telefone, email: cliente.email, observacoes: cliente.observacoes, cliente_problema: cliente.cliente_problema || false });
        setModalClienteAberto(true);
    }

    function abrirEdicaoUsuario(usr) {
        setNovoUsuario({ id: usr.id, nome: usr.nome, senha: usr.senha, nivel: usr.nivel });
        setModalUsuarioAberto(true);
    }

    async function salvarUsuario(e) {
        e.preventDefault();
        const usuarioFormatado = { nome: novoUsuario.nome, senha: novoUsuario.senha, nivel: novoUsuario.nivel };

        if (novoUsuario.id) {
            const { data, error } = await supabase.from('usuarios').update(usuarioFormatado).eq('id', novoUsuario.id).select();
            if (error) {
                alert('Falha ao atualizar usuário: ' + error.message);
            } else if (data && data.length > 0) {
                setUsuariosSistema(usuariosSistema.map(u => u.id === novoUsuario.id ? data[0] : u));
                setModalUsuarioAberto(false);
            } else {
                carregarDados();
                setModalUsuarioAberto(false);
            }
        } else {
            const { data, error } = await supabase.from('usuarios').insert([usuarioFormatado]).select();
            if (error) {
                alert('Falha ao salvar usuário: ' + error.message);
            } else if (data && data.length > 0) {
                setUsuariosSistema([...usuariosSistema, data[0]]);
                setModalUsuarioAberto(false);
            } else {
                carregarDados();
                setModalUsuarioAberto(false);
            }
        }
    }

    function adicionarItemAoCarrinho() {
        if (!itemAtual.descricao || !itemAtual.valor) return;
        const pctDesconto = parseFloat(itemAtual.desconto) || 0;
        const numOriginal = parseFloat(itemAtual.valor.replace(/\./g, '').replace(',', '.')) || 0;
        const valorFinalCalculadoNum = numOriginal * (1 - pctDesconto / 100);
        const valorFinalCalculadoStr = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorFinalCalculadoNum);
        
        const novoItemEmpacotado = { 
            ...itemAtual, valor_original: itemAtual.valor, valor: valorFinalCalculadoStr, id_temp: Math.random() + Date.now() 
        };

        const novosItens = [...itensPedido, novoItemEmpacotado];
        setItensPedido(novosItens); 
        
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseFloat(i.valor.replace(/\./g, '').replace(',', '.')) || 0; });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
        
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim' });
        setBuscaProduto('');
    }

    function removerItemDoCarrinho(id_temp) {
        const novosItens = itensPedido.filter(i => i.id_temp !== id_temp);
        setItensPedido(novosItens);
        let totalGeralOS = 0;
        novosItens.forEach(i => { totalGeralOS += parseFloat(i.valor.replace(/\./g, '').replace(',', '.')) || 0; });
        setNovoPedido({...novoPedido, valor_total: formatarMoeda((totalGeralOS * 100).toFixed(0).toString())});
    }

    async function salvarOS(e, querImprimir = false) {
        if (e) e.preventDefault();
        setSalvandoOS(true);
        
        let textoFinalServico = '';
        if (itensPedido.length > 0) {
            const itensTextoArray = itensPedido.map(i => {
                const strDesconto = i.desconto ? ' (-' + i.desconto + '%)' : '';
                const strNome = i.nome ? '• ' + i.nome : '• Serviço Personalizado';
                const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
                const strConcluido = i.concluido ? '\n  [✓] Concluído' : '';
                return strNome + '\n  ' + i.descricao + '\n  Valor: R$ ' + i.valor + strDesconto + strLocal + strConcluido;
            });
            textoFinalServico += itensTextoArray.join('\n\n') + '\n\n';
            if (novoPedido.servico) textoFinalServico += '[OBSERVAÇÕES GERAIS]\n' + novoPedido.servico;
        } else {
            textoFinalServico = novoPedido.servico;
        }

        if (pagamentosPedido.length > 0) {
            textoFinalServico += '\n\n[PAGAMENTOS]\n' + JSON.stringify(pagamentosPedido);
        }

        const valorNumericoFinal = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;

        // Calcular locais unicos da OS a partir dos itens
        const locaisOS = [...new Set(itensPedido.map(i => i.local_producao || 'Berlim'))].join(', ');

        const payload = {
            cliente: novoPedido.cliente,
            servico: textoFinalServico,
            status: novoPedido.status,
            valor_total: valorNumericoFinal,
            data_pedido: novoPedido.data_pedido || null,
            prazo: novoPedido.prazo || null,
            responsavel: novoPedido.responsavel,
            local_producao: locaisOS,
            aprovado: novoPedido.aprovado,
            entrega: novoPedido.entrega,
            urgente: novoPedido.urgente
        };

        if (novoPedido.status === 'Concluído' && (!pedidoEmEdicao || pedidoEmEdicao.status !== 'Concluído')) {
            payload.prazo = obterDataAtual();
        }

        if (pedidoEmEdicao) {
            const { data, error } = await supabase.from('pedidos').update(payload).eq('id', pedidoEmEdicao.id).select();
            
            if (error) {
                alert('Erro ao atualizar OS: ' + error.message);
            } else if (data && data.length > 0) {
                setPedidos(pedidos.map(p => p.id === data[0].id ? data[0] : p)); 
                fecharModalOS(); 
                if (querImprimir) imprimirOS(data[0]); 
            } else {
                // Se a resposta for vazia, puxa as informações limpas e fecha sem travar
                carregarDados();
                fecharModalOS();
                if (querImprimir) imprimirOS({ ...pedidoEmEdicao, ...payload });
            }
        } else {
            const novoId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1;
            payload.id = novoId;
            payload.criado_por = usuario?.nome || 'Desconhecido';
            const { data, error } = await supabase.from('pedidos').insert([payload]).select();
            
            if (error) {
                alert('Erro ao salvar OS: ' + error.message);
            } else if (data && data.length > 0) {
                setPedidos([data[0], ...pedidos]); 
                fecharModalOS(); 
                if (querImprimir) imprimirOS(data[0]); 
            } else {
                // Se a resposta for vazia, puxa as informações limpas e fecha sem travar
                carregarDados();
                fecharModalOS();
                if (querImprimir) alert('Pedido atualizado com sucesso! Para evitar lentidão, inicie a impressão manualmente através do Histórico.');
            }
        }
        setSalvandoOS(false);
    }

    async function salvarProduto(e) {
        e.preventDefault();
        setSalvandoProduto(true);
        const produtoFormatado = { nome: novoProduto.nome, texto_padrao: novoProduto.texto_padrao, preco_base: parseFloat(novoProduto.preco_base.replace(/\./g, '').replace(',', '.')) || 0 };

        if (novoProduto.id) {
            const { data, error } = await supabase.from('produtos').update(produtoFormatado).eq('id', novoProduto.id).select();
            if (!error && data) { setProdutos(produtos.map(p => p.id === novoProduto.id ? data[0] : p)); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); } 
            else alert('Falha ao atualizar: ' + error.message);
        } else {
            const { data, error } = await supabase.from('produtos').insert([produtoFormatado]).select();
            if (!error && data) { setProdutos([...produtos, data[0]]); setModalProdutoAberto(false); setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); } 
            else alert('Falha ao salvar: ' + error.message);
        }
        setSalvandoProduto(false);
    }

    async function excluirProduto(id, e) {
        e.stopPropagation(); // Evita que o clique no lixo abra a tela de edição
        
        if (!window.confirm("Tem certeza que deseja excluir este produto do catálogo?")) return;

        const { error } = await supabase.from('produtos').delete().eq('id', id);
        
        if (error) {
            alert('Erro ao excluir produto: ' + error.message);
        } else {
            setProdutos(produtos.filter(p => p.id !== id));
        }
    }

    async function handleDragStartProduto(e, index) {
        setDraggedProdutoIndex(index);
        e.dataTransfer.effectAllowed = "move";
    }

    async function handleDropProduto(e, targetIndex) {
        e.preventDefault();
        if (draggedProdutoIndex === null || draggedProdutoIndex === targetIndex) return;

        const novaLista = [...produtos];
        const [itemArrastado] = novaLista.splice(draggedProdutoIndex, 1);
        novaLista.splice(targetIndex, 0, itemArrastado);

        const listaComOrdem = novaLista.map((prod, idx) => ({ ...prod, ordem: idx }));
        setProdutos(listaComOrdem);
        setDraggedProdutoIndex(null);

        const payloadSupabase = listaComOrdem.map(p => ({
            id: p.id,
            nome: p.nome,
            texto_padrao: p.texto_padrao,
            preco_base: p.preco_base,
            ordem: p.ordem
        }));
        
        const { error } = await supabase.from('produtos').upsert(payloadSupabase);
        if (error) {
            console.error("Erro ao reordenar produtos:", error);
            alert("Erro ao reordenar produtos: " + error.message);
        }
    }

    async function salvarCliente(e) {
        e.preventDefault();
        setSalvandoCliente(true);
        const clienteFormatado = { nome: novoCliente.nome, telefone: novoCliente.telefone, email: novoCliente.email, observacoes: novoCliente.observacoes, cliente_problema: novoCliente.cliente_problema || false };

        if (clienteFormatado.telefone && clienteFormatado.telefone.trim() !== '') {
            const telNormalizado = clienteFormatado.telefone.replace(/\D/g, '');
            const duplicado = clientes.find(c => {
                if (novoCliente.id && c.id === novoCliente.id) return false;
                if (!c.telefone) return false;
                return c.telefone.replace(/\D/g, '') === telNormalizado;
            });
            
            if (duplicado) {
                alert('Aviso: Este número de WhatsApp/Telefone já está cadastrado no cliente "' + duplicado.nome + '"!');
                setSalvandoCliente(false);
                return;
            }
        }

        if (novoCliente.id) {
            const { data, error } = await supabase.from('clientes').update(clienteFormatado).eq('id', novoCliente.id).select();
            if (!error && data) { setClientes(clientes.map(c => c.id === novoCliente.id ? data[0] : c)); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); } 
            else alert('Falha ao atualizar: ' + error.message);
        } else {
            const { data, error } = await supabase.from('clientes').insert([clienteFormatado]).select();
            if (!error && data) { setClientes([...clientes, data[0]]); setNovoPedido({...novoPedido, cliente: data[0].nome}); setBuscaCliente(data[0].nome); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); } 
            else alert('Falha ao salvar: ' + error.message);
        }
        setSalvandoCliente(false);
    }

    async function salvarNotaFiscal(e) {
        e.preventDefault();
        setSalvandoNotaFiscal(true);

        const valorNumerico = notaFiscalEmEdicao.valor_pago ? parseFloat(String(notaFiscalEmEdicao.valor_pago).replace(/\./g, '').replace(',', '.')) : null;

        const payload = { 
            servico_feito: notaFiscalEmEdicao.servico_feito, 
            valor_pago: valorNumerico, 
            observacoes: notaFiscalEmEdicao.observacoes,
            cliente: notaFiscalEmEdicao.cliente
        };
        const { data, error } = await supabase.from('notas_fiscais').update(payload).eq('id', notaFiscalEmEdicao.id).select();
        if (!error && data) { 
            setNotasFiscais(notasFiscais.map(n => n.id === notaFiscalEmEdicao.id ? data[0] : n)); 
            setModalNotaFiscalAberto(false); 
        } else {
            alert('Falha ao atualizar nota: ' + error.message);
        }
        setSalvandoNotaFiscal(false);
    }

    async function concluirNotaFiscal(id) {
        if (!confirm('Deseja realmente marcar esta nota como concluída? Ela não aparecerá mais nesta lista.')) return;
        const { data, error } = await supabase.from('notas_fiscais').update({ concluido: true }).eq('id', id).select();
        if (!error && data) {
            setNotasFiscais(notasFiscais.map(n => n.id === id ? data[0] : n));
        } else {
            alert('Falha ao concluir: ' + error.message);
        }
    }

    function imprimirOS(pedido) {
        setOsParaImprimir(pedido);
        setTimeout(() => window.print(), 100);
    }

    const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) || (c.telefone && c.telefone.includes(buscaCliente)));
    // Lógica para elencar os 5 produtos mais vendidos com base no histórico
    const vendasPorProduto = useMemo(() => {
        const mapa = {};
        pedidos.forEach(p => {
            if (!p.servico) return;
            // Busca o padrão estruturado salvo no campo "servico"
            const regex = /• ([^\n]+)\n(?:[^•]*?)Valor: R\$ ([\d.,]+)/g;
            let match;
            while ((match = regex.exec(p.servico)) !== null) {
                const nome = match[1].trim();
                const valorStr = match[2].replace(/\./g, '').replace(',', '.');
                const valorNum = parseFloat(valorStr) || 0;
                if (mapa[nome]) mapa[nome] += valorNum;
                else mapa[nome] = valorNum;
            }
        });
        return mapa;
    }, [pedidos]);

    const top5Produtos = useMemo(() => {
        return Object.entries(vendasPorProduto)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
    }, [vendasPorProduto]);

    const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) || p.id.toString().includes(buscaProduto)).sort((a, b) => {
        // Prioriza os top 5 vendidos se não houver busca ativa (ou mesmo se houver, os que sobrarem da busca ainda terão prioridade)
        const indexA = top5Produtos.indexOf(a.nome);
        const indexB = top5Produtos.indexOf(b.nome);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // Se nenhum for top 5, mantém a ordenação original do catálogo
        return (a.ordem || 0) - (b.ordem || 0);
    });
    
    const clientesAbaFiltro = clientes.filter(c => {
        if (!letraFiltroCliente) return true;
        return c.nome.toUpperCase().startsWith(letraFiltroCliente.toUpperCase());
    });
    const clientesPaginados = clientesAbaFiltro.slice((paginaClientes - 1) * itensPorPagina, paginaClientes * itensPorPagina);
    const totalPaginasClientes = Math.ceil(clientesAbaFiltro.length / itensPorPagina) || 1;

    // Filtros e paginação da aba Notas Fiscais
    const notasFiscaisAbaFiltro = notasFiscais.filter(n => {
        const checkStatus = filtroNotas === 'pendentes' ? !n.concluido : n.concluido;
        if (!checkStatus) return false;
        if (!buscaNotaFiscal) return true;
        const termo = buscaNotaFiscal.toLowerCase();
        return (n.cliente && n.cliente.toLowerCase().includes(termo)) || 
               (n.razao_social && n.razao_social.toLowerCase().includes(termo)) || 
               (n.cnpj && n.cnpj.toLowerCase().includes(termo));
    });
    const notasFiscaisPaginadas = notasFiscaisAbaFiltro.slice((paginaNotasFiscais - 1) * itensPorPagina, paginaNotasFiscais * itensPorPagina);
    const totalPaginasNotasFiscais = Math.ceil(notasFiscaisAbaFiltro.length / itensPorPagina) || 1;
    
    // Filtro Produção Aprimorado (Sem data e buscando em MultiSelect)
    const pedidosProducaoAtivos = pedidos.filter(p => {
        const statusPermitido = STATUSES_PRODUCAO.includes(p.status);
        if (!statusPermitido) return false;

        const termo = buscaProducaoText.toLowerCase();
        const matchTermo = !termo || 
            (p.cliente && p.cliente.toLowerCase().includes(termo)) || 
            (p.id && p.id.toString().includes(termo)) || 
            (p.responsavel && p.responsavel.toLowerCase().includes(termo));
        
        return matchTermo;
    });

    // Filtros aba de Histórico/Baixas
    const pedidosHistoricoFiltrados = pedidos.filter(p => {
        if (isOperador && p.status === 'Finalizado') return false;
        const termo = buscaHistoricoText.toLowerCase();
        const matchTermo = !termo || (p.cliente && p.cliente.toLowerCase().includes(termo)) || (p.id && p.id.toString().includes(termo));
        let matchData = true;
        if (dataFiltroInicio && (!p.data_pedido || p.data_pedido < dataFiltroInicio)) matchData = false;
        if (dataFiltroFim && (!p.data_pedido || p.data_pedido > dataFiltroFim)) matchData = false;
        return matchTermo && matchData;
    });

    const opcoesStatusPermitidas = isOperador ? [...STATUSES_PRODUCAO, 'Abandonado', 'Concluído'] : [...STATUSES_PRODUCAO, ...STATUSES_FINALIZADOS];
    const isModalTrancado = (pedidoEmEdicao && pedidoEmEdicao.status === 'Finalizado' && isOperador) ? true : false;

    // Render de barras para o Financeiro
    const renderBarHorizontal = (label, valor, maxVal, isCaixa = false, customColor = null) => {
        const pct = maxVal > 0 ? (valor / maxVal) * 100 : 0;
        const barColor = customColor || (isCaixa ? 'bg-emerald-500' : 'bg-brand');
        return (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs group">
                <span className="w-24 sm:w-32 font-medium truncate text-gray-700 dark:text-gray-300">{label}</span>
                <div className="flex-1 bg-gray-100 dark:bg-darkElevated h-6 rounded overflow-hidden relative border dark:border-darkBorder">
                    <div className={`${barColor} h-full transition-all duration-500 opacity-80 group-hover:opacity-100`} style={{ width: `${Math.max(pct, 1)}%` }}></div>
                </div>
                <span className="w-24 text-right font-bold text-gray-900 dark:text-[#EDEDED]">
                    R$ {formatarValorFinanceiro(valor)}
                </span>
            </div>
        )
    };

    // ==== TELA DE LOGIN ====
    if (!usuario) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black text-white p-4 select-none font-sans">
                <div className="w-full max-w-sm bg-darkCard border border-darkBorder rounded-xl p-8 shadow-2xl flex flex-col gap-6">
                    <div className="text-center flex flex-col items-center">
                        <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain mb-3" />
                        <p className="text-xs text-gray-400 mt-1">Insira suas credenciais para acessar o ERP</p>
                    </div>
                    
                    <form onSubmit={efetuarLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Usuário</label>
                            <input required type="text" value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full bg-black border border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition text-white" placeholder="Ex: admin, gi, financeiro..." autoComplete="off" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Senha</label>
                            <input required type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} className="w-full bg-black border border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition text-white" placeholder="••••••" />
                        </div>
                        {erroLogin && <p className="text-xs text-red-500 font-medium text-center">{erroLogin}</p>}
                        <button type="submit" className="w-full bg-brand hover:bg-brandHover text-white py-2 rounded text-sm font-bold shadow transition mt-2">
                            Entrar no Sistema
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col min-h-screen no-print">
                <header className="sticky top-0 z-40 bg-white dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center">
                            <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-8 object-contain" />
                        </div>
                        <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-500 dark:text-[#888888] cursor-pointer">
                            {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Produção/Atendimento') && (
                                <a onClick={() => setAbaAtual('producao')} className={`transition ${abaAtual === 'producao' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'}`}>Produção</a>
                            )}
                            <a onClick={() => setAbaAtual('baixa')} className={`transition ${abaAtual === 'baixa' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'}`}>Baixa de Notas</a>
                            <a onClick={() => setAbaAtual('calculadoras')} className={`transition ${abaAtual === 'calculadoras' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'} flex items-center gap-1.5`}><Icon name="calculator" /> Calculadoras</a>
                            {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                                <>
                                    <a onClick={() => setAbaAtual('financeiro')} className={`transition ${abaAtual === 'financeiro' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'}`}>Financeiro</a>
                                    <a onClick={() => setAbaAtual('notas_fiscais')} className={`transition ${abaAtual === 'notas_fiscais' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'} flex items-center gap-1.5`}>
                                        Notas Fiscais
                                        {notasFiscais.some(n => !n.concluido) && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/50"></span>}
                                    </a>
                                </>
                            )}
                            {isAdmin && (
                                <a onClick={() => setAbaAtual('produtos')} className={`transition ${abaAtual === 'produtos' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'}`}>Catálogo</a>
                            )}
                            {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Produção/Atendimento') && (
                                <a onClick={() => setAbaAtual('clientes')} className={`transition ${abaAtual === 'clientes' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'}`}>Clientes</a>
                            )}
                            {isAdmin && (
                                <a onClick={() => setAbaAtual('usuarios')} className={`transition ${abaAtual === 'usuarios' ? 'text-gray-900 dark:text-white font-semibold' : 'hover:text-gray-900 dark:hover:text-white'}`}>Usuários</a>
                            )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-5">
                        <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition text-gray-600 dark:text-[#888888]">
                            <Icon name={darkMode ? "sun" : "moon"} className="w-5 h-5" />
                        </button>
                        
                        {/* SEPARADOR VERTICAL DE ELEGÂNCIA */}
                        <div className="hidden sm:block w-[1px] h-8 bg-gray-200 dark:bg-darkBorder"></div>

                        {/* BLOCO DO USUÁRIO ATUALIZADO */}
                        <div className="flex items-center gap-4 select-none">
                            <div className="flex flex-col text-right">
                                <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">
                                    {usuario?.nome}
                                </span>
                                <span className="text-[11px] font-medium text-brand italic mt-1 tracking-wide">
                                    {usuario?.nivel}
                                </span>
                            </div>
                            <button type="button" onClick={() => setUsuario(null)} className="text-gray-400 hover:text-red-500 transition p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30" title="Sair do Sistema">
                                <Icon name="log-out" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {abaAtual === 'producao' && (
                    <main className="flex-1 p-6 lg:p-10 mx-auto w-full fade-in flex flex-col h-[calc(100vh-60px)]">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Produção</h1>
                                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">Gerencie a esteira de pedidos ativos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaProducaoText} onChange={e => setBuscaProducaoText(e.target.value)} placeholder="Pesquisar por cliente, OS ou responsável..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                {buscaProducaoText && (
                                    <button type="button" onClick={() => setBuscaProducaoText('')} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand" title="Limpar Busca"><Icon name="x" className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => { setPedidoEmEdicao(null); setModalAberto(true); }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-sm rounded-md font-bold shadow-sm transition flex items-center gap-2"><Icon name="plus" /> Nova O.S.</button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white dark:bg-darkCard rounded border border-gray-200 dark:border-darkBorder overflow-hidden flex flex-col">
                            <div className="overflow-auto custom-scrollbar flex-1">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead className="sticky top-0 z-10 bg-gray-50/50 dark:bg-darkHover/50">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase text-center">
                                            <th className="px-6 py-4 w-24">ID</th>
                                            <th className="px-6 py-4 w-32">Prazo</th>
                                            <th className="px-6 py-4 w-32">Resp.</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4 w-full min-w-[300px] text-left">Serviço</th>
                                            <th className="px-6 py-4 w-32">Ações</th>
                                            <th className="px-6 py-4 w-40">Status</th>
                                            <th className="px-6 py-4 w-32">Local</th>
                                            <th className="px-6 py-4 w-24 text-right">Concluir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidosProducaoAtivos.length === 0 ? (
                                            <tr><td colSpan="9" className="p-8 text-center text-gray-500 italic">Nenhuma OS encontrada.</td></tr>
                                        ) : (
                                            STATUSES_PRODUCAO.map(status => {
                                                const pedidosDoStatus = pedidosProducaoAtivos
                                                    .filter(p => p.status === status)
                                                    .sort((a, b) => {
                                                        if (!a.prazo) return 1;
                                                        if (!b.prazo) return -1;
                                                        return a.prazo.localeCompare(b.prazo);
                                                    });

                                                if (pedidosDoStatus.length === 0) return null;

                                                return (
                                                    <React.Fragment key={status}>
                                                        <tr className="bg-gray-50/50 dark:bg-darkElevated/40 select-none">
                                                            <td colSpan="9" className={`px-4 py-2 border-y border-gray-200 dark:border-darkBorder font-bold tracking-wide uppercase text-[10px] bg-gray-100/50 dark:bg-darkHover/40 ${obterCorStatus(status)}`}>
                                                                {status} — <span className="text-gray-400 dark:text-gray-500">{pedidosDoStatus.length} {pedidosDoStatus.length === 1 ? 'pedido' : 'pedidos'}</span>
                                                            </td>
                                                        </tr>
                                                        {pedidosDoStatus.map(p => (
                                                            <tr key={p.id} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition group text-sm">
                                                                <td className="px-4 py-3 font-medium text-gray-400 dark:text-gray-600 text-center"><button type="button" onClick={() => abrirEdicao(p)} className="hover:text-brand transition">#{p.id}</button></td>
                                                                <td className="px-4 py-3"><CustomDatePicker value={p.prazo || ''} onChange={val => atualizarCampoInline(p.id, 'prazo', val)} placeholder="Definir prazo..." className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-xs outline-none hover:border-brand transition text-gray-700 dark:text-[#EDEDED]" /></td>
                                                                <td className="px-4 py-3"><MultiSelectDropdown value={p.responsavel} options={RESPONSAVEIS} onChange={(val) => atualizarCampoInline(p.id, 'responsavel', val)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-xs outline-none hover:border-brand" /></td>
                                                                <td className={`px-4 py-3 font-semibold truncate max-w-[12rem] ${isClienteProblema(p.cliente) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                                    <div className="flex items-center gap-1.5">{p.cliente} {isClienteProblema(p.cliente) && <Icon name="alert-triangle" className="w-3.5 h-3.5 text-red-500 shrink-0" title="Cliente Problema" />}</div>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-800 dark:text-white font-medium"><ItensChecklist pedido={p} atualizarCampoInline={atualizarCampoInline} /></td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button type="button" onClick={() => atualizarCampoInline(p.id, 'aprovado', !p.aprovado)} className={`p-2 rounded transition ${p.aprovado ? 'text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700' : 'text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`} title="Arte Aprovada">
                                                                            <Icon name="thumbs-up" className="w-4 h-4" />
                                                                        </button>
                                                                        <button type="button" onClick={() => atualizarCampoInline(p.id, 'entrega', !p.entrega)} className={`p-2 rounded transition ${p.entrega ? 'text-white bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700' : 'text-gray-300 dark:text-gray-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30'}`} title="Pronto para Entrega">
                                                                            <Icon name="package" className="w-4 h-4" />
                                                                        </button>
                                                                        <button type="button" onClick={() => atualizarCampoInline(p.id, 'urgente', !p.urgente)} className={`p-2 rounded transition ${p.urgente ? 'text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700' : 'text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`} title="Urgente">
                                                                            <Icon name="alert-triangle" className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3"><InlineDropdown value={p.status} options={opcoesStatusPermitidas} onChange={(val) => atualizarCampoInline(p.id, 'status', val)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-xs outline-none hover:border-brand" /></td>
                                                                <td className="px-4 py-3 align-middle">
                                                                    <div className="flex items-center justify-center min-h-[32px]">
                                                                        <span className="text-[11px] font-bold px-2 py-1 bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-[#EDEDED] rounded border border-gray-200 dark:border-darkBorder truncate max-w-[150px] inline-block" title={p.local_producao || 'Berlim'}>{p.local_producao || 'Berlim'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <button type="button" onClick={() => atualizarCampoInline(p.id, 'status', 'Concluído')} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition rounded inline-block" title="Marcar como Concluído">
                                                                        <Icon name="check-circle" className="w-5 h-5 inline-block" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                )}

                {abaAtual === 'baixa' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Histórico de Notas</h1>
                                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">Busque ordens e filtre por período.</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaHistoricoText} onChange={e => setBuscaHistoricoText(e.target.value)} placeholder="Buscar cliente ou OS..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-[#888888] uppercase mb-1">De:</span>
                                    <CustomDatePicker value={dataFiltroInicio} onChange={setDataFiltroInicio} placeholder="Início" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-sm outline-none hover:border-brand transition" />
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-[#888888] uppercase mb-1">Até:</span>
                                    <CustomDatePicker value={dataFiltroFim} onChange={setDataFiltroFim} placeholder="Fim" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-sm outline-none hover:border-brand transition" />
                                </div>
                                {(dataFiltroInicio || dataFiltroFim || buscaHistoricoText) && (
                                    <button type="button" onClick={() => { setDataFiltroInicio(''); setDataFiltroFim(''); setBuscaHistoricoText(''); }} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand" title="Limpar Filtros"><Icon name="x" className="w-4 h-4" /></button>
                                )}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard rounded border border-gray-200 dark:border-darkBorder overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">OS Nº</th>
                                        {isAdmin && <th className="px-6 py-4 w-48">Criado Por</th>}
                                        <th className="px-6 py-4 w-32">Data</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Serviço (Resumo)</th>
                                        <th className="px-6 py-4 w-48">Status</th>
                                        <th className="px-6 py-4 w-36 text-right">Valor Final</th>
                                        <th className="px-6 py-4 w-24 text-center">Imprimir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosHistoricoFiltrados
                                        .slice((paginaHistorico - 1) * itensPorPagina, paginaHistorico * itensPorPagina)
                                        .map(p => {
                                        const trancado = isOperador && p.status === 'Finalizado';
                                        return (
                                            <tr key={p.id} onClick={() => { if (trancado) return; abrirEdicao(p); }} className={`border-b border-gray-100 dark:border-darkBorder transition ${trancado ? 'opacity-30 bg-[#050505] cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-darkHover'}`}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-500"><span className="flex items-center gap-1.5">{trancado && <Icon name="lock" className="w-3 h-3 text-red-500" />}#{p.id}</span></td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-semibold text-gray-800 dark:text-[#EDEDED]">{p.criado_por || '---'}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{formatarDataExibicao(p.data_pedido)}</div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#A1A1AA]">{formatarDataExibicao(p.prazo || p.data_pedido)}</td>
                                                <td className={`px-6 py-4 font-semibold text-sm ${isClienteProblema(p.cliente) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-[#EDEDED]'}`}>
                                                    <div className="flex items-center gap-1.5">{p.cliente} {isClienteProblema(p.cliente) && <Icon name="alert-triangle" className="w-4 h-4 text-red-500 shrink-0" title="Cliente Problema" />}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#A1A1AA] truncate max-w-xs">{obterResumoServicos(p.servico)}</td>
                                                <td className="px-6 py-4"><span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-bold rounded border bg-gray-50 border-gray-200 dark:bg-darkElevated dark:border-darkBorder ${obterCorStatus(p.status)}`}>{p.status}</span></td>
                                                <td className="px-6 py-4 font-bold text-sm text-right text-gray-900 dark:text-[#EDEDED]">R$ {formatarValorFinanceiro(Number(p.valor_total))}</td>
                                                <td className="px-6 py-4 text-center"><button type="button" onClick={(e) => { e.stopPropagation(); imprimirOS(p); }} className="p-2 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition rounded inline-block" title="Imprimir O.S."><Icon name="printer" className="w-5 h-5 inline-block" /></button></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {pedidosHistoricoFiltrados.length > itensPorPagina && (
                                <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard rounded-b-xl">
                                    <span className="text-sm text-gray-500">
                                        Mostrando {((paginaHistorico - 1) * itensPorPagina) + 1} a {Math.min(paginaHistorico * itensPorPagina, pedidosHistoricoFiltrados.length)} de {pedidosHistoricoFiltrados.length}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.max(1, p - 1))}
                                            disabled={paginaHistorico === 1}
                                            className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >Anterior</button>
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.min(Math.ceil(pedidosHistoricoFiltrados.length / itensPorPagina), p + 1))}
                                            disabled={paginaHistorico === Math.ceil(pedidosHistoricoFiltrados.length / itensPorPagina)}
                                            className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >Próxima</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                )}

                {abaAtual === 'financeiro' && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Dashboard Financeiro</h1>
                                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">Análise de Receitas, Centros de Custo e Performance.</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-[#888888] uppercase mb-1">Período De:</span>
                                    <CustomDatePicker value={dataFiltroFinInicio} onChange={setDataFiltroFinInicio} placeholder="Início" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-sm outline-none hover:border-brand transition" />
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-[#888888] uppercase mb-1">Período Até:</span>
                                    <CustomDatePicker value={dataFiltroFinFim} onChange={setDataFiltroFinFim} placeholder="Fim" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-sm outline-none hover:border-brand transition" />
                                </div>
                                {(dataFiltroFinInicio || dataFiltroFinFim) && (
                                    <button type="button" onClick={() => { setDataFiltroFinInicio(''); setDataFiltroFinFim(''); }} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand" title="Limpar Filtros"><Icon name="x" className="w-4 h-4" /></button>
                                )}
                                <button type="button" onClick={() => {
                                        const pedidosExport = pedidos.filter(p => {
                                            let match = true;
                                            if (dataFiltroFinInicio && (!p.data_pedido || p.data_pedido < dataFiltroFinInicio)) match = false;
                                            if (dataFiltroFinFim && (!p.data_pedido || p.data_pedido > dataFiltroFinFim)) match = false;
                                            return match;
                                        });
                                        const cabecalho = "ID;Data;Cliente;Responsavel;Local;Status;Valor\n";
                                        const linhas = pedidosExport.map(p => `${p.id};${p.data_pedido};${p.cliente};${p.responsavel};${p.local_producao};${p.status};${p.valor_total}`).join("\n");
                                        const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
                                        const url = URL.createObjectURL(blob);
                                        const link = document.createElement("a");
                                        link.setAttribute("href", url);
                                        link.setAttribute("download", `relatorio_financeiro_${obterDataAtual()}.csv`);
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-sm rounded-md font-bold shadow-sm transition flex items-center gap-2"
                                >
                                    <Icon name="printer" className="w-4 h-4" /> Exportar CSV
                                </button>
                            </div>
                        </div>

                        {(() => {
                            const pedidosFin = pedidos.filter(p => {
                                let match = true;
                                if (dataFiltroFinInicio && (!p.data_pedido || p.data_pedido < dataFiltroFinInicio)) match = false;
                                if (dataFiltroFinFim && (!p.data_pedido || p.data_pedido > dataFiltroFinFim)) match = false;
                                return match;
                            });

                            // Helper para extrair pagamentos de um pedido
                            const obterTotalPagoPedido = (pedido) => {
                                const pagamentosStr = pedido.servico && pedido.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (!pagamentosStr) return 0;
                                try {
                                    const pagamentos = JSON.parse(pagamentosStr);
                                    return pagamentos.reduce((a, p) => a + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                } catch (e) { return 0; }
                            };

                            const totalBruto = pedidosFin.reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0);
                            
                            const totalRecebido = pedidosFin.reduce((acc, p) => {
                                const pagoStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (pagoStr) return acc + obterTotalPagoPedido(p);
                                // Compatibilidade com OS antigas:
                                if (p.status === 'Concluído' || p.status === 'Finalizado') return acc + (Number(p.valor_total) || 0);
                                return acc;
                            }, 0);
                            
                            const totalAReceber = totalBruto - totalRecebido;
                            const ticketMedio = pedidosFin.length > 0 ? (totalBruto / pedidosFin.length) : 0;

                            const totalVendasHoje = pedidos.filter(p => p.data_pedido === obterDataAtual()).reduce((acc, p) => acc + (Number(p.valor_total) || 0), 0);

                            const anoAtualStr = new Date().getFullYear().toString();
                            const anoAnteriorStr = (new Date().getFullYear() - 1).toString();
                            
                            const totalAnoAtual = pedidos.filter(p => p.data_pedido && p.data_pedido.startsWith(anoAtualStr)).reduce((a, b) => a + (Number(b.valor_total)||0), 0);
                            const totalAnoAnterior = pedidos.filter(p => p.data_pedido && p.data_pedido.startsWith(anoAnteriorStr)).reduce((a, b) => a + (Number(b.valor_total)||0), 0);
                            const crescimentoPercentual = totalAnoAnterior > 0 ? ((totalAnoAtual - totalAnoAnterior) / totalAnoAnterior) * 100 : (totalAnoAtual > 0 ? 100 : 0);

                            const agrupadoPorDia = pedidosFin.reduce((acc, p) => {
                                if (!p.data_pedido) return acc;
                                const dia = p.data_pedido;
                                if (!acc[dia]) acc[dia] = { dia, bruto: 0 };
                                acc[dia].bruto += (Number(p.valor_total) || 0);
                                return acc;
                            }, {});
                            const diasOrdenados = Object.values(agrupadoPorDia).sort((a, b) => b.dia.localeCompare(a.dia)).slice(0, 15);
                            const maxBrutoDia = Math.max(...diasOrdenados.map(d => d.bruto), 1);

                            const agrupadoPorMesAno = pedidosFin.reduce((acc, p) => {
                                if (!p.data_pedido) return acc;
                                const mesAno = p.data_pedido.substring(0, 7);
                                if (!acc[mesAno]) acc[mesAno] = { mesAno, bruto: 0, recebido: 0 };
                                const val = Number(p.valor_total) || 0;
                                acc[mesAno].bruto += val;
                                if (p.status === 'Concluído' || p.status === 'Finalizado') acc[mesAno].recebido += val;
                                return acc;
                            }, {});
                            const mesesOrdenados = Object.values(agrupadoPorMesAno).sort((a, b) => b.mesAno.localeCompare(a.mesAno)).slice(0, 15);
                            const maxBrutoMes = Math.max(...mesesOrdenados.map(m => m.bruto), 1);

                            const agrupadoResp = pedidosFin.reduce((acc, p) => {
                                if(!p.responsavel) return acc;
                                const resps = p.responsavel.split(',').map(s=>s.trim()).filter(Boolean);
                                resps.forEach(r => {
                                    if(!acc[r]) acc[r] = 0;
                                    acc[r] += (Number(p.valor_total) || 0) / resps.length; 
                                });
                                return acc;
                            }, {});
                            const rankingResp = Object.entries(agrupadoResp).sort((a,b) => b[1] - a[1]);
                            const maxResp = Math.max(...rankingResp.map(r => r[1]), 1);

                            const agrupadoLocal = pedidosFin.reduce((acc, p) => {
                                if(!p.local_producao) return acc;
                                const locais = p.local_producao.split(',').map(s=>s.trim()).filter(Boolean);
                                locais.forEach(l => {
                                    if(!acc[l]) acc[l] = 0;
                                    acc[l] += (Number(p.valor_total) || 0) / locais.length;
                                });
                                return acc;
                            }, {});
                            const rankingLocal = Object.entries(agrupadoLocal).sort((a,b) => b[1] - a[1]);
                            const maxLocal = Math.max(...rankingLocal.map(l => l[1]), 1);

                            const colorsRank = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-red-500'];
                            const colorsLocal = ['bg-teal-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'];
                            const colorsForma = ['bg-amber-500', 'bg-yellow-500', 'bg-orange-500', 'bg-lime-500'];
                            const colorsInst = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500'];

                            const pagamentosExtraidos = pedidosFin.flatMap(p => {
                                const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (!pagamentosStr) return [];
                                try {
                                    return JSON.parse(pagamentosStr).map(pag => ({
                                        valor: parseFloat(String(pag.valor).replace(/\./g, '').replace(',', '.')) || 0,
                                        forma: pag.forma || 'Indefinido',
                                        instituicao: pag.instituicao || 'Indefinido'
                                    }));
                                } catch (e) { return []; }
                            });

                            const agrupadoForma = pagamentosExtraidos.reduce((acc, p) => {
                                if (!acc[p.forma]) acc[p.forma] = 0;
                                acc[p.forma] += p.valor;
                                return acc;
                            }, {});
                            const rankingForma = Object.entries(agrupadoForma).sort((a,b) => b[1] - a[1]);
                            const maxForma = Math.max(...rankingForma.map(f => f[1]), 1);

                            const agrupadoInstituicao = pagamentosExtraidos.reduce((acc, p) => {
                                if (p.forma === 'PIX' || p.forma === 'Link de Pagamento') {
                                    const inst = p.instituicao;
                                    if (!acc[inst]) acc[inst] = 0;
                                    acc[inst] += p.valor;
                                }
                                return acc;
                            }, {});
                            const rankingInstituicao = Object.entries(agrupadoInstituicao).sort((a,b) => b[1] - a[1]);
                            const maxInstituicao = Math.max(...rankingInstituicao.map(i => i[1]), 1);

                            // --- CONTEXTUAL DATE NAMES ---
                            const anoAtual = new Date().getFullYear();
                            const objData = new Date();
                            const nomeMesAtualRaw = objData.toLocaleString('pt-BR', { month: 'long' });
                            const nomeMesAtual = nomeMesAtualRaw.charAt(0).toUpperCase() + nomeMesAtualRaw.slice(1);
                            const diaAtual = formatarDataExibicao(obterDataAtual()).substring(0, 5);

                            // --- MÊS ATUAL METRICS (for layers 2, 3, 4) ---
                            const mesAtualString = obterDataAtual().substring(0, 7); // yyyy-mm
                            const pedidosMesAtual = pedidosFin.filter(p => p.data_pedido && p.data_pedido.startsWith(mesAtualString));

                            const agrupadoLocalMesAtual = pedidosMesAtual.reduce((acc, p) => {
                                if(!p.local_producao) return acc;
                                const locais = p.local_producao.split(',').map(s=>s.trim()).filter(Boolean);
                                locais.forEach(l => {
                                    if(!acc[l]) acc[l] = 0;
                                    acc[l] += (Number(p.valor_total) || 0) / locais.length;
                                });
                                return acc;
                            }, {});
                            const rankingLocalMesAtual = Object.entries(agrupadoLocalMesAtual).sort((a,b) => b[1] - a[1]);
                            const maxLocalMesAtual = Math.max(...rankingLocalMesAtual.map(l => l[1]), 1);

                            const pagamentosExtraidosMesAtual = pedidosMesAtual.flatMap(p => {
                                const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
                                if (!pagamentosStr) return [];
                                try {
                                    return JSON.parse(pagamentosStr).map(pag => ({
                                        valor: parseFloat(String(pag.valor).replace(/\./g, '').replace(',', '.')) || 0,
                                        forma: pag.forma || 'Indefinido',
                                        instituicao: pag.instituicao || 'Indefinido'
                                    }));
                                } catch (e) { return []; }
                            });

                            const agrupadoFormaMesAtual = pagamentosExtraidosMesAtual.reduce((acc, p) => {
                                if (!acc[p.forma]) acc[p.forma] = 0;
                                acc[p.forma] += p.valor;
                                return acc;
                            }, {});
                            const rankingFormaMesAtual = Object.entries(agrupadoFormaMesAtual).sort((a,b) => b[1] - a[1]);
                            const maxFormaMesAtual = Math.max(...rankingFormaMesAtual.map(f => f[1]), 1);

                            const agrupadoInstituicaoMesAtual = pagamentosExtraidosMesAtual.reduce((acc, p) => {
                                if (p.forma === 'PIX' || p.forma === 'Link de Pagamento') {
                                    const inst = p.instituicao;
                                    if (!acc[inst]) acc[inst] = 0;
                                    acc[inst] += p.valor;
                                }
                                return acc;
                            }, {});
                            const rankingInstituicaoMesAtual = Object.entries(agrupadoInstituicaoMesAtual).sort((a,b) => b[1] - a[1]);
                            const maxInstituicaoMesAtual = Math.max(...rankingInstituicaoMesAtual.map(i => i[1]), 1);

                            const renderLayer2 = () => {
                                if (rankingLocalMesAtual.length === 0) return <p className="text-xs text-gray-500 italic">Nenhum local registrado no mês.</p>;
                                return rankingLocalMesAtual.map((loc, index) => renderBarHorizontal(loc[0], loc[1], maxLocalMesAtual, false, colorsLocal[index % colorsLocal.length]));
                            };
                            const renderLayer3 = () => {
                                if (rankingFormaMesAtual.length === 0) return <p className="text-xs text-gray-500 italic">Nenhum pagamento registrado no mês.</p>;
                                return rankingFormaMesAtual.map((f, index) => renderBarHorizontal(f[0], f[1], maxFormaMesAtual, false, colorsForma[index % colorsForma.length]));
                            };
                            const renderLayer4 = () => {
                                if (rankingInstituicaoMesAtual.length === 0) return <p className="text-xs text-gray-500 italic">Nenhuma instituição no mês.</p>;
                                return rankingInstituicaoMesAtual.map((i, index) => renderBarHorizontal(i[0], i[1], maxInstituicaoMesAtual, false, colorsInst[index % colorsInst.length]));
                            };

                            // --- ANUAL METRICS ---
                            const agrupadoPorAno = pedidosFin.reduce((acc, p) => {
                                if (!p.data_pedido) return acc;
                                const ano = p.data_pedido.substring(0, 4);
                                if (!acc[ano]) acc[ano] = { ano, bruto: 0 };
                                acc[ano].bruto += (Number(p.valor_total) || 0);
                                return acc;
                            }, {});
                            const anosOrdenados = Object.values(agrupadoPorAno).sort((a, b) => b.ano.localeCompare(a.ano)).slice(0, 15);
                            const maxBrutoAno = Math.max(...anosOrdenados.map(a => a.bruto), 1);

                            return (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm relative overflow-hidden flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Crescimento (YoY)</span>
                                                <h2 className="text-xl font-black text-gray-900 dark:text-white">R$ {formatarValorFinanceiro(totalAnoAtual)}</h2>
                                            </div>
                                            <div className="mt-2">
                                                <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${crescimentoPercentual >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    <Icon name={crescimentoPercentual >= 0 ? 'trending-up' : 'trending-down'} className="w-3 h-3" />
                                                    {Math.abs(crescimentoPercentual).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-200 dark:border-purple-900/30 shadow-sm relative overflow-hidden flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">Vendas Hoje</span>
                                                <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400">R$ {formatarValorFinanceiro(totalVendasHoje)}</h2>
                                            </div>
                                            <p className="text-[10px] text-purple-500/70 dark:text-purple-400/70 mt-2 font-medium">Pedidos lançados hoje</p>
                                        </div>

                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Total Pago (Recebido)</span>
                                                <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {formatarValorFinanceiro(totalRecebido)}</h2>
                                            </div>
                                            <p className="text-[10px] text-emerald-500/70 dark:text-emerald-400/70 mt-2 font-medium">Já entrou no caixa</p>
                                        </div>
                                        
                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-200 dark:border-orange-900/30 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">Saldo Devedor (A Receber)</span>
                                                <h2 className="text-2xl font-black text-orange-600 dark:text-orange-400">R$ {formatarValorFinanceiro(totalAReceber)}</h2>
                                            </div>
                                            <p className="text-[10px] text-orange-500/70 dark:text-orange-400/70 mt-2 font-medium">Falta receber</p>
                                        </div>
                                        
                                        <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1">Ticket Médio</span>
                                                <h2 className="text-2xl font-black text-blue-500">R$ {formatarValorFinanceiro(ticketMedio)}</h2>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium">Média por pedido</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <StackedCards 
                                            title="Visão Anual" 
                                            icon="calendar"
                                            description="Evolução e Análise (Anos)"
                                            cards={[
                                                { title: "Faturamento Histórico", content: anosOrdenados.length === 0 ? <p className="text-xs text-gray-500 italic">Sem dados.</p> : anosOrdenados.map(a => renderBarHorizontal(a.ano, a.bruto, maxBrutoAno, false, 'bg-blue-500')) },
                                                { title: `Local de Produção (${anoAtual})`, content: renderLayer2() },
                                                { title: `Formas de Pagamento (${anoAtual})`, content: renderLayer3() },
                                                { title: `Vendas por Instituição (${anoAtual})`, content: renderLayer4() }
                                            ]}
                                        />
                                        <StackedCards 
                                            title="Visão Mensal" 
                                            icon="layout-dashboard"
                                            description="Evolução e Análise (Meses)"
                                            cards={[
                                                { title: `Faturamento (${anoAtual})`, content: mesesOrdenados.length === 0 ? <p className="text-xs text-gray-500 italic">Sem dados.</p> : mesesOrdenados.map(m => renderBarHorizontal(formatarMesAno(m.mesAno), m.bruto, maxBrutoMes, false, 'bg-emerald-500')) },
                                                { title: `Local de Produção (${nomeMesAtual})`, content: renderLayer2() },
                                                { title: `Formas de Pagamento (${nomeMesAtual})`, content: renderLayer3() },
                                                { title: `Vendas por Instituição (${nomeMesAtual})`, content: renderLayer4() }
                                            ]}
                                        />
                                        <StackedCards 
                                            title="Visão Diária" 
                                            icon="list"
                                            description="Evolução e Análise (Dias)"
                                            cards={[
                                                { title: `Faturamento (${nomeMesAtual})`, content: diasOrdenados.length === 0 ? <p className="text-xs text-gray-500 italic">Sem dados.</p> : diasOrdenados.map(d => renderBarHorizontal(formatarDataExibicao(d.dia).substring(0,5), d.bruto, maxBrutoDia, false, 'bg-purple-500')) },
                                                { title: `Local de Produção (${diaAtual})`, content: renderLayer2() },
                                                { title: `Formas de Pagamento (${diaAtual})`, content: renderLayer3() },
                                                { title: `Vendas por Instituição (${diaAtual})`, content: renderLayer4() }
                                            ]}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">Receitas por Local (Geral)</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Rentabilidade total no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingLocal.length === 0 ? <p className="text-xs text-gray-500 italic">Nenhum local registrado.</p> :
                                                    rankingLocal.map((loc, index) => renderBarHorizontal(loc[0], loc[1], maxLocal, false, colorsLocal[index % colorsLocal.length]))
                                                }
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">Formas de Pagamento (Geral)</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Como os clientes pagaram no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingForma.length === 0 ? <p className="text-xs text-gray-500 italic">Nenhum pagamento registrado.</p> :
                                                    rankingForma.map((f, index) => renderBarHorizontal(f[0], f[1], maxForma, false, colorsForma[index % colorsForma.length]))
                                                }
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">Instituições (Geral)</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Volume por conta no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingInstituicao.length === 0 ? <p className="text-xs text-gray-500 italic">Nenhuma instituição registrada.</p> :
                                                    rankingInstituicao.map((i, index) => renderBarHorizontal(i[0], i[1], maxInstituicao, false, colorsInst[index % colorsInst.length]))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </main>
                )}

                {abaAtual === 'produtos' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Catálogo</h1>
                                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">Gerencie os serviços, itens e preços base para orçamentos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-sm rounded-md font-bold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Produto
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">ID</th>
                                        <th className="px-6 py-4">Nome do Produto</th>
                                        <th className="px-6 py-4">Descrição Base</th>
                                        <th className="px-6 py-4 w-36 text-right">Preço Base</th>
                                        <th className="px-6 py-4 w-24 text-center">Excluir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map((p, index) => (
                                        <tr 
                                            key={p.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStartProduto(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleDropProduto(e, index)}
                                            onClick={() => abrirEdicaoProduto(p)} 
                                            className={`border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition cursor-pointer group ${draggedProdutoIndex === index ? 'opacity-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-gray-500 cursor-grab active:cursor-grabbing">
                                                <Icon name="list" className="w-4 h-4 inline-block mr-2 opacity-50" />
                                                #{p.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold dark:text-[#EDEDED]">{p.nome}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#A1A1AA] truncate max-w-xs">{p.texto_padrao}</td>
                                            <td className="px-6 py-4 text-sm font-bold dark:text-[#EDEDED] text-right">R$ {formatarValorFinanceiro(Number(p.preco_base))}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button type="button" onClick={(e) => excluirProduto(p.id, e)} className="p-2 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-500 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30 opacity-50 group-hover:opacity-100" title="Excluir Produto">
                                                    <Icon name="trash-2" className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                )}

                {abaAtual === 'clientes' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Clientes</h1>
                                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">Base de dados e informações de contato dos seus clientes.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-sm rounded-md font-bold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Cliente
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-darkBorder flex flex-wrap gap-1.5 items-center justify-center sm:justify-start">
                                <button onClick={() => { setLetraFiltroCliente(''); setPaginaClientes(1); }} className={`px-2 py-1 text-xs font-bold rounded border ${!letraFiltroCliente ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-darkCard text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover'}`}>Todas</button>
                                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letra => (
                                    <button key={letra} onClick={() => { setLetraFiltroCliente(letra); setPaginaClientes(1); }} className={`px-2 py-1 text-xs font-bold rounded border ${letraFiltroCliente === letra ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-darkCard text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover'}`}>{letra}</button>
                                ))}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50"><tr className="border-b border-gray-200 dark:border-darkBorder text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"><th className="px-6 py-4">Cliente</th><th className="px-6 py-4 w-48">WhatsApp</th><th className="px-6 py-4 w-64">E-mail</th><th className="px-6 py-4">Observações</th></tr></thead>
                                <tbody>
                                    {clientesPaginados.length > 0 ? clientesPaginados.map(c => (
                                        <tr key={c.id} onClick={() => abrirEdicaoCliente(c)} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition cursor-pointer"><td className={`px-6 py-4 text-sm font-semibold ${c.cliente_problema ? 'text-red-600 dark:text-red-400' : 'dark:text-[#EDEDED]'}`}>{c.nome} {c.cliente_problema && <Icon name="alert-triangle" className="w-3.5 h-3.5 inline text-red-500 ml-1" title="Cliente Problema" />}</td><td className="px-6 py-4 text-sm text-gray-600 dark:text-[#A1A1AA]">{c.telefone || '---'}</td><td className="px-6 py-4 text-sm text-gray-600 dark:text-[#A1A1AA]">{c.email || '---'}</td><td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-600 truncate max-w-xs">{c.observacoes || '---'}</td></tr>
                                    )) : (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-[#A1A1AA]">Nenhum cliente encontrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPaginasClientes > 1 && (
                            <div className="mt-6 flex justify-between items-center p-4">
                                <button onClick={() => setPaginaClientes(Math.max(1, paginaClientes - 1))} disabled={paginaClientes === 1} className="px-4 py-2 text-sm font-bold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Anterior</button>
                                <span className="text-sm font-semibold dark:text-white">Página {paginaClientes} de {totalPaginasClientes}</span>
                                <button onClick={() => setPaginaClientes(Math.min(totalPaginasClientes, paginaClientes + 1))} disabled={paginaClientes === totalPaginasClientes} className="px-4 py-2 text-sm font-bold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Próxima</button>
                            </div>
                        )}
                    </main>
                )}

                {abaAtual === 'notas_fiscais' && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Notas Fiscais {filtroNotas === 'pendentes' ? 'Pendentes' : 'Concluídas'}</h1>
                                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">{filtroNotas === 'pendentes' ? 'Notas enviadas pelos clientes aguardando processamento.' : 'Histórico de notas já emitidas e processadas.'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative w-full lg:w-64">
                                    <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nome, razão ou CNPJ..." 
                                        value={buscaNotaFiscal} 
                                        onChange={(e) => { setBuscaNotaFiscal(e.target.value); setPaginaNotasFiscais(1); }}
                                        className="w-full pl-9 pr-4 py-1.5 h-[38px] text-sm border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard rounded-md focus:outline-none focus:ring-2 focus:ring-brand dark:text-white transition"
                                    />
                                </div>
                                <div className="flex bg-gray-100 dark:bg-darkHover rounded p-1">
                                    <button onClick={() => { setFiltroNotas('pendentes'); setPaginaNotasFiscais(1); }} className={`px-4 py-1.5 text-sm font-semibold rounded ${filtroNotas === 'pendentes' ? 'bg-white dark:bg-darkCard shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} transition`}>Pendentes</button>
                                    <button onClick={() => { setFiltroNotas('concluidas'); setPaginaNotasFiscais(1); }} className={`px-4 py-1.5 text-sm font-semibold rounded ${filtroNotas === 'concluidas' ? 'bg-white dark:bg-darkCard shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} transition`}>Concluídas</button>
                                </div>
                                <a href="/solicitar-nota.html" target="_blank" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover text-gray-800 dark:text-[#EDEDED] h-[38px] px-4 text-sm rounded-md font-bold shadow-sm transition flex items-center gap-2">
                                    <Icon name="external-link" className="w-4 h-4" /> Link do Formulário
                                </a>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-gray-50/50 dark:bg-darkHover/50">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                            <th className="px-6 py-4 w-32">Data</th>
                                            <th className="px-6 py-4">Cliente / Razão Social</th>
                                            <th className="px-6 py-4 w-48">CPF / CNPJ</th>
                                            <th className="px-6 py-4 w-64">Serviço / Valor</th>
                                            <th className="px-6 py-4 w-24 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notasFiscaisPaginadas.map(n => (
                                            <tr key={n.id} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition">
                                                <td className="px-4 py-3 text-sm dark:text-[#EDEDED] whitespace-nowrap">{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-semibold dark:text-[#EDEDED]">{n.cliente || 'Sem Identificação'}</div>
                                                    <div className="text-xs text-gray-500 dark:text-[#A1A1AA]">{n.razao_social}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm dark:text-[#EDEDED]">{n.cnpj}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm dark:text-[#EDEDED]">{n.servico_feito || <span className="text-gray-400 italic">Pendente</span>}</div>
                                                    <div className="text-xs font-semibold text-orange-500 dark:text-orange-400">{n.valor_pago ? `R$ ${parseFloat(n.valor_pago).toFixed(2).replace('.', ',')}` : ''}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!n.concluido && (
                                                            <button onClick={() => { 
                                                                setNotaFiscalEmEdicao({
                                                                    ...n,
                                                                    valor_pago: n.valor_pago ? formatarMoeda((n.valor_pago * 100).toFixed(0).toString()) : ''
                                                                }); 
                                                                setModalNotaFiscalAberto(true); 
                                                            }} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition" title="Editar / Ver Detalhes">
                                                                <Icon name="edit-3" className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {!n.concluido && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                                                            <button onClick={() => concluirNotaFiscal(n.id)} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition" title="Concluir Nota">
                                                                <Icon name="check-circle" className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {notasFiscaisPaginadas.length === 0 && (
                                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-[#A1A1AA]">Nenhuma nota fiscal encontrada.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {totalPaginasNotasFiscais > 1 && (
                                <div className="mt-6 flex justify-between items-center p-4 border-t border-gray-200 dark:border-darkBorder">
                                    <button onClick={() => setPaginaNotasFiscais(Math.max(1, paginaNotasFiscais - 1))} disabled={paginaNotasFiscais === 1} className="px-4 py-2 text-sm font-bold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Anterior</button>
                                    <span className="text-sm font-semibold dark:text-white">Página {paginaNotasFiscais} de {totalPaginasNotasFiscais}</span>
                                    <button onClick={() => setPaginaNotasFiscais(Math.min(totalPaginasNotasFiscais, paginaNotasFiscais + 1))} disabled={paginaNotasFiscais === totalPaginasNotasFiscais} className="px-4 py-2 text-sm font-bold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Próxima</button>
                                </div>
                            )}
                        </div>
                    </main>
                )}

                {abaAtual === 'usuarios' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Usuários do Sistema</h1>
                                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">Gerencie os acessos da equipe (Administrador, Produção/Atendimento, Financeiro).</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoUsuario({ id: null, nome: '', senha: '', nivel: 'Produção/Atendimento' }); setModalUsuarioAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-sm rounded-md font-bold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Usuário
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50"><tr className="border-b border-gray-200 dark:border-darkBorder text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"><th className="px-6 py-4">Nome do Usuário</th><th className="px-6 py-4 w-48 text-right">Nível de Acesso</th></tr></thead>
                                <tbody>
                                    {usuariosSistema.map(u => (
                                        <tr key={u.id} onClick={() => abrirEdicaoUsuario(u)} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition cursor-pointer">
                                            <td className="px-6 py-4 text-sm font-semibold dark:text-[#EDEDED]">{u.nome}</td>
                                            <td className="px-6 py-4 text-sm font-bold dark:text-[#EDEDED] text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${u.nivel === 'Administrador' ? 'bg-red-50 text-red-600 border-red-200' : u.nivel === 'Financeiro' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                    {u.nivel}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </main>
                )}
                {abaAtual === 'calculadoras' && <CalculadorasAba />}
            </div>

            {modalAberto && (
                <div onClick={fecharModalOS} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-darkCard w-full max-w-3xl rounded border border-gray-200 dark:border-darkBorder shadow-2xl flex flex-col max-h-[95vh] cursor-default">
                        <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-xl tracking-tight">
                                    {pedidoEmEdicao ? 'Editar Ordem de Serviço #' + pedidoEmEdicao.id : 'Nova Ordem de Serviço'}
                                </h3>
                                {isModalTrancado && <span className="flex items-center gap-1 text-[11px] font-bold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded"><Icon name="lock" className="w-3 h-3" /> Trancado</span>}
                            </div>
                            <button type="button" onClick={fecharModalOS} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5" /></button>
                        </div>
                        
                        <form onSubmit={(e) => salvarOS(e, false)} className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            {isModalTrancado && <div className="p-3 bg-red-950/20 border border-red-900/50 rounded text-xs text-red-400 mb-2">Nota liquidada. Peça para um Admin ou Financeiro destravar para edições.</div>}
                            
                            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-100 dark:border-darkBorder">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Data da Venda</label>
                                    <CustomDatePicker value={novoPedido.data_pedido} onChange={val => setNovoPedido({...novoPedido, data_pedido: val})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Prazo</label>
                                    <CustomDatePicker value={novoPedido.prazo} onChange={val => setNovoPedido({...novoPedido, prazo: val})} disabled={isModalTrancado} placeholder="Data final..." className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status Inicial</label>
                                    <div className="relative">
                                        <select required value={novoPedido.status} onChange={e => setNovoPedido({...novoPedido, status: e.target.value})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2.5 text-sm outline-none focus:border-brand transition dark:text-white font-semibold cursor-pointer appearance-none disabled:opacity-50">
                                            {opcoesStatusPermitidas.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <Icon name="chevron-down" className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Resp.</label>
                                    <MultiSelectDropdown 
                                        value={novoPedido.responsavel} 
                                        options={RESPONSAVEIS} 
                                        onChange={val => setNovoPedido({...novoPedido, responsavel: val})} 
                                        disabled={isModalTrancado} 
                                        className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Tags Especiais</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button type="button" onClick={() => setNovoPedido({...novoPedido, entrega: !novoPedido.entrega})} disabled={isModalTrancado} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-xs font-bold transition disabled:opacity-50 ${novoPedido.entrega ? 'text-white bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700' : 'bg-gray-100 text-gray-500 dark:bg-darkElevated dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkHover'}`}><Icon name="package" className="w-4 h-4"/> Entrega</button>
                                        <button type="button" onClick={() => setNovoPedido({...novoPedido, urgente: !novoPedido.urgente})} disabled={isModalTrancado} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-xs font-bold transition disabled:opacity-50 ${novoPedido.urgente ? 'text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700' : 'bg-gray-100 text-gray-500 dark:bg-darkElevated dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkHover'}`}><Icon name="alert-triangle" className="w-3.5 h-3.5"/> Urgente</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Cliente / Empresa</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input required type="text" value={buscaCliente} disabled={isModalTrancado}
                                            onChange={e => { setBuscaCliente(e.target.value); setNovoPedido({...novoPedido, cliente: e.target.value}); setClienteDropdownAberto(true); }}
                                            onFocus={() => { if(!isModalTrancado) setClienteDropdownAberto(true); }} onBlur={() => setTimeout(() => setClienteDropdownAberto(false), 200)}
                                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Buscar cliente..." autoComplete="off" />
                                        <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        {clienteDropdownAberto && clientesFiltrados.length > 0 && (
                                            <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                {clientesFiltrados.map(c => (
                                                    <li key={c.id} onClick={() => { setBuscaCliente(c.nome); setNovoPedido({...novoPedido, cliente: c.nome}); setClienteDropdownAberto(false); }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex justify-between items-center transition"><span className="font-medium text-sm text-gray-800 dark:text-[#EDEDED]">{c.nome}</span><span className="text-xs text-gray-500">{c.telefone}</span></li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} disabled={isModalTrancado} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition disabled:opacity-50" title="Novo Cliente">
                                        <Icon name="plus" className="w-4 h-4 text-brand" />
                                    </button>
                                </div>
                                {isClienteProblema(novoPedido.cliente) && (
                                    <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded flex items-start gap-2.5 text-red-600 dark:text-red-400">
                                        <Icon name="alert-triangle" className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-sm font-bold block">Atenção: Cliente Problemático</span>
                                            <span className="text-xs">Este cliente possui restrições ou histórico negativo na empresa. Fique atento.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-[#EDEDED]">Carrinho de Itens do Orçamento</label>
                                {itensPedido.length > 0 ? (
                                    <div className="mb-4 flex flex-col gap-2">
                                        {itensPedido.map((item, index) => (
                                            <div key={item.id_temp} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded shadow-sm">
                                                <div className="flex flex-col"><span className="font-semibold text-sm dark:text-white">{index + 1}. {item.nome || 'Serviço Personalizado'}</span><span className="text-xs text-gray-500 dark:text-[#A1A1AA] whitespace-pre-wrap mt-1">{item.descricao}</span>{item.local_producao && <span className="text-[10px] bg-brand/10 text-brand font-bold px-1.5 py-0.5 rounded mt-1.5 w-max">Local: {item.local_producao}</span>}</div>
                                                <div className="flex items-center gap-4"><div className="text-right"><span className="font-semibold text-sm dark:text-white">R$ {item.valor}</span>{item.desconto && <span className="block text-[10px] text-brand font-medium">-{item.desconto}% desc</span>}</div><button type="button" disabled={isModalTrancado} onClick={() => removerItemDoCarrinho(item.id_temp)} className="text-gray-400 hover:text-red-500 transition disabled:opacity-30"><Icon name="trash-2" className="w-4 h-4" /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-[#666] mb-4 italic">Nenhum item adicionado de forma estruturada.</p>
                                )}

                                <div className="p-4 border border-dashed border-gray-300 dark:border-darkBorder rounded bg-transparent">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input type="text" value={buscaProduto} disabled={isModalTrancado} 
                                                    onChange={e => { setBuscaProduto(e.target.value); setProdutoDropdownAberto(true); }}
                                                    onFocus={() => { if(!isModalTrancado) setProdutoDropdownAberto(true); }} onBlur={() => setTimeout(() => setProdutoDropdownAberto(false), 200)}
                                                    className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Puxar item do catálogo (Opcional)..." autoComplete="off" />
                                                <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                {produtoDropdownAberto && produtosFiltrados.length > 0 && (
                                                    <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                        {produtosFiltrados.map(p => (
                                                            <li key={p.id} onClick={() => { 
                                                                setBuscaProduto(p.nome);
                                                                setItemAtual({ ...itemAtual, nome: p.nome, descricao: p.texto_padrao, valor: formatarMoeda((p.preco_base * 100).toFixed(0).toString()), desconto: '' }); 
                                                                setProdutoDropdownAberto(false); 
                                                            }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex flex-col transition">
                                                                <div className="flex justify-between items-center"><span className="font-medium text-sm dark:text-[#EDEDED]">{p.nome}</span><span className="text-xs font-bold text-brand">R$ {formatarValorFinanceiro(Number(p.preco_base))}</span></div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button type="button" onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} disabled={isModalTrancado} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition disabled:opacity-50" title="Novo Produto">
                                                    <Icon name="plus" className="w-4 h-4 text-brand" />
                                                </button>
                                            )}
                                        </div>

                                        <textarea rows="2" value={itemAtual.descricao} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Especificações do item (Ex: Medida, quantidade, material...)"></textarea>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="relative col-span-2">
                                                <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-medium">Local:</span>
                                                <select value={itemAtual.local_producao} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, local_producao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-[52px] pr-8 py-2 text-xs outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium appearance-none disabled:opacity-50">
                                                    {LOCAIS.map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-2.5 text-xs text-gray-400">R$</span>
                                                <input type="text" value={itemAtual.valor} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-7 pr-2 py-2 text-xs outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium disabled:opacity-50" placeholder="Bruto" />
                                            </div>
                                            <div><input type="text" value={itemAtual.desconto} disabled={isModalTrancado} onChange={e => { let val = e.target.value.replace(/\D/g, ''); if (parseFloat(val) > 100) val = '100'; setItemAtual({...itemAtual, desconto: val}); }} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2 py-2 text-xs outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Desc. %" /></div>
                                        </div>
                                        <button type="button" onClick={adicionarItemAoCarrinho} disabled={!itemAtual.descricao || !itemAtual.valor || isModalTrancado} className="w-full mt-3 px-3 py-2 text-xs font-bold bg-white hover:bg-gray-100 dark:bg-darkHover dark:hover:bg-darkBorder text-gray-800 dark:text-white rounded border border-gray-200 dark:border-darkBorder transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5"/> Inserir Item no Orçamento</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-darkBorder">
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Histórico de Pagamentos</label>
                                {pagamentosPedido.length > 0 && (
                                    <div className="mb-3 flex flex-col gap-2">
                                        {pagamentosPedido.map((pag, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-darkElevated px-3 py-2 rounded border border-gray-100 dark:border-darkBorder">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium dark:text-white">{pag.forma} {pag.parcelas > 1 ? `(${pag.parcelas}x)` : ''}</span>
                                                    <span className="text-xs text-gray-500">{pag.data}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">R$ {pag.valor}</span>
                                                    {!isModalTrancado && (
                                                        <button type="button" onClick={() => setPagamentosPedido(pagamentosPedido.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><Icon name="trash-2" className="w-4 h-4" /></button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {(() => {
                                    const totalPago = pagamentosPedido.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                    const totalOS = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                    const saldo = totalOS - totalPago;
                                    return (
                                        <>
                                            <div className="mb-4 flex justify-between items-center text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Total Pago: <strong className="text-emerald-600">R$ {formatarValorFinanceiro(totalPago)}</strong></span>
                                                <span className="text-gray-600 dark:text-gray-400">Saldo Devedor: <strong className={saldo > 0 ? "text-red-500" : "text-gray-400"}>R$ {formatarValorFinanceiro(saldo)}</strong></span>
                                            </div>

                                            {!isModalTrancado && saldo > 0 && (
                                                <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded mb-4">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <select value={novoPagamento.forma} onChange={e => setNovoPagamento({...novoPagamento, forma: e.target.value})} className="bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-xs outline-none">
                                                            <option value="PIX">PIX</option>
                                                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                                                            <option value="Cartão de Débito">Cartão de Débito</option>
                                                            <option value="Dinheiro">Dinheiro</option>
                                                            <option value="Link de Pagamento">Link de Pagamento</option>
                                                        </select>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-[10px] text-gray-400">R$</span>
                                                            <input type="text" value={novoPagamento.valor} onChange={e => setNovoPagamento({...novoPagamento, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded pl-6 pr-2 py-1.5 text-xs outline-none" placeholder="Valor" />
                                                        </div>
                                                    </div>
                                                    {(novoPagamento.forma === 'PIX' || novoPagamento.forma === 'Link de Pagamento') && (
                                                        <div>
                                                            <select value={novoPagamento.instituicao} onChange={e => setNovoPagamento({...novoPagamento, instituicao: e.target.value})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-xs outline-none">
                                                                <option value="Itaú">Itaú</option>
                                                                <option value="Infinite Pay">Infinite Pay</option>
                                                                <option value="Pag Seguro">Pag Seguro</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {(novoPagamento.forma === 'Cartão de Crédito' || novoPagamento.forma === 'Link de Pagamento') && (
                                                        <div>
                                                            <select value={novoPagamento.parcelas} onChange={e => setNovoPagamento({...novoPagamento, parcelas: parseInt(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-xs outline-none">
                                                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                    <button type="button" onClick={() => {
                                                        if (!novoPagamento.valor) return;
                                                        setPagamentosPedido([...pagamentosPedido, { ...novoPagamento, data: obterDataAtual() }]);
                                                        
                                                        // Atualiza sugerindo o restante
                                                        const novoTotalPago = pagamentosPedido.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0) + parseFloat(String(novoPagamento.valor).replace(/\./g, '').replace(',', '.'));
                                                        const totalOSStr = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                                        const saldoRestante = totalOSStr - novoTotalPago;
                                                        
                                                        setNovoPagamento({ valor: saldoRestante > 0 ? formatarMoeda((saldoRestante * 100).toFixed(0).toString()) : '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú' });
                                                    }} className="w-full bg-brand hover:bg-brandHover text-white py-1.5 rounded text-xs font-bold transition">Registrar Pagamento</button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Observações Gerais ou Texto Complementar</label>
                                <textarea rows="4" value={novoPedido.servico} onChange={e => setNovoPedido({...novoPedido, servico: e.target.value})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED] custom-scrollbar disabled:opacity-50" placeholder="Prazos de entrega, observações do financeiro ou complementos da O.S..."></textarea>
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-gray-100 dark:border-darkBorder bg-gray-50 dark:bg-darkCard flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
                                <button type="button" onClick={fecharModalOS} className="flex-1 sm:flex-none px-4 py-2.5 rounded-md text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkHover transition border border-transparent hover:border-gray-300 dark:hover:border-darkBorder">
                                    Cancelar
                                </button>
                                
                                {!isModalTrancado && (
                                    <>
                                        <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-darkBorder mx-1"></div>
                                        
                                        <button type="button" onClick={(e) => salvarOS(e, false)} disabled={salvandoOS} className="flex-1 sm:flex-none px-4 py-2.5 rounded-md text-sm font-bold bg-white dark:bg-darkElevated text-gray-800 dark:text-white border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover hover:border-brand shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                                            <Icon name="save" className="w-4 h-4 text-brand" />
                                            {salvandoOS ? 'Salvando...' : pedidoEmEdicao ? 'Atualizar' : 'Salvar'}
                                        </button>
                                        
                                        <button type="button" onClick={(e) => salvarOS(e, true)} disabled={salvandoOS} className="flex-1 sm:flex-none px-4 py-2.5 rounded-md text-sm font-bold bg-gray-800 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                                            <Icon name="printer" className="w-4 h-4" />
                                            {salvandoOS ? 'Salvando...' : 'Salvar e Imprimir'}
                                        </button>

                                        {novoPedido.status !== 'Finalizado' && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                                            <button type="button" onClick={(e) => {
                                                const tpago = pagamentosPedido.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                                const tos = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                                if ((tos - tpago) > 0) {
                                                    alert("Não é possível finalizar a OS: O valor total ainda não foi pago.");
                                                    return;
                                                }
                                                novoPedido.status = 'Finalizado';
                                                salvarOS(e, false);
                                            }} disabled={salvandoOS} className="flex-1 sm:flex-none px-4 py-2.5 rounded-md text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-600">
                                                <Icon name="check" className="w-4 h-4" />
                                                Finalizar OS
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto justify-end">
                                <span className="text-xs font-bold text-gray-500 dark:text-[#888888] uppercase tracking-wider">Total Final:</span>
                                <div className="relative w-36">
                                    <span className="absolute left-0 top-[5px] font-bold text-sm dark:text-gray-400">R$</span>
                                    <input required type="text" value={novoPedido.valor_total} onChange={e => setNovoPedido({...novoPedido, valor_total: formatarMoeda(e.target.value)})} disabled={isModalTrancado} className="w-full bg-transparent border-none text-left pl-7 pr-0 py-1 font-bold text-xl text-brand outline-none disabled:opacity-50" placeholder="0,00" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalProdutoAberto && (
                <div onClick={() => setModalProdutoAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-white dark:bg-darkCard w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoProduto.id ? 'Editar Produto' : 'Novo Produto'}</h3><button onClick={() => setModalProdutoAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarProduto} className="p-6 flex flex-col gap-4">
                            <input required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Nome" />
                            <textarea rows="2" value={novoProduto.texto_padrao} onChange={e => setNovoProduto({...novoProduto, texto_padrao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Descrição"></textarea>
                            <input required value={novoProduto.preco_base} onChange={e => setNovoProduto({...novoProduto, preco_base: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white font-medium transition" placeholder="0,00" />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalProdutoAberto(false)} className="px-4 py-2 rounded text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-sm font-medium bg-white text-black hover:bg-gray-200 transition">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}
            
            {modalClienteAberto && (
                <div onClick={() => setModalClienteAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-white dark:bg-darkCard w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoCliente.id ? 'Editar Cliente' : 'Novo Cliente'}</h3><button onClick={() => setModalClienteAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarCliente} className="p-6 flex flex-col gap-4">
                            <input required value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Nome *" />
                            <div className="grid grid-cols-2 gap-4"><input value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: formatarTelefone(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="WhatsApp" /><input type="email" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="E-mail" /></div>
                            <textarea rows="2" value={novoCliente.observacoes} onChange={e => setNovoCliente({...novoCliente, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Observações"></textarea>
                            <label className="flex items-center gap-2 cursor-pointer mt-1 p-2 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded transition hover:bg-red-100 dark:hover:bg-red-900/30">
                                <input type="checkbox" checked={novoCliente.cliente_problema} onChange={e => setNovoCliente({...novoCliente, cliente_problema: e.target.checked})} className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500 cursor-pointer accent-red-600" />
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5"><Icon name="alert-triangle" className="w-4 h-4" /> Sinalizar como Cliente Problema</span>
                            </label>
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalClienteAberto(false)} className="px-4 py-2 rounded text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" disabled={salvandoCliente} className="px-5 py-2 rounded text-sm font-medium bg-white text-black hover:bg-gray-200 transition disabled:opacity-50">{salvandoCliente ? 'Salvando...' : 'Salvar'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {modalNotaFiscalAberto && notaFiscalEmEdicao && (
                <div onClick={() => setModalNotaFiscalAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-white dark:bg-darkCard w-full max-w-2xl rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">Detalhes e Edição da Nota Fiscal</h3><button onClick={() => setModalNotaFiscalAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4 bg-gray-50 dark:bg-darkElevated p-4 rounded border border-gray-100 dark:border-darkBorder">
                                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Dados do Cliente (Link)</h4>
                                    <div><label className="text-xs text-gray-500">Razão Social</label><div className="flex items-center gap-2"><div className="text-sm dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.razao_social || '---'}</div>{notaFiscalEmEdicao.razao_social && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.razao_social)} className="text-gray-400 hover:text-brand transition" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-xs text-gray-500">CNPJ</label><div className="flex items-center gap-2"><div className="text-sm dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.cnpj || '---'}</div>{notaFiscalEmEdicao.cnpj && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.cnpj)} className="text-gray-400 hover:text-brand transition" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-xs text-gray-500">Endereço</label><div className="flex items-center gap-2"><div className="text-sm dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.endereco || '---'}</div>{notaFiscalEmEdicao.endereco && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.endereco)} className="text-gray-400 hover:text-brand transition" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-xs text-gray-500">Contato</label><div className="text-sm dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.contato || '---'}</div></div>
                                </div>
                                <form id="formNota" onSubmit={salvarNotaFiscal} className="space-y-4">
                                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Preenchimento Interno</h4>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Cliente (Identificação Interna)</label>
                                        <input value={notaFiscalEmEdicao.cliente || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, cliente: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Nome Fantasia / Cliente" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Serviço Feito</label>
                                        <input value={notaFiscalEmEdicao.servico_feito || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, servico_feito: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Qual foi o serviço?" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Valor Pago (R$)</label>
                                        <input type="text" value={notaFiscalEmEdicao.valor_pago || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, valor_pago: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="0,00" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Observações</label>
                                        <textarea rows="2" value={notaFiscalEmEdicao.observacoes || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Anotações internas..."></textarea>
                                    </div>
                                </form>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-darkBorder">
                                <button type="button" onClick={() => setModalNotaFiscalAberto(false)} className="px-4 py-2 rounded text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                <button type="submit" form="formNota" disabled={salvandoNotaFiscal} className="px-5 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brandHover transition disabled:opacity-50">{salvandoNotaFiscal ? 'Salvando...' : 'Salvar Alterações'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalUsuarioAberto && (
                <div onClick={() => setModalUsuarioAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-white dark:bg-darkCard w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoUsuario.id ? 'Editar Conta' : 'Nova Conta de Acesso'}</h3><button onClick={() => setModalUsuarioAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarUsuario} className="p-6 flex flex-col gap-4">
                            <input required value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Nome de Acesso" />
                            <input required type="password" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition" placeholder="Senha" />
                            
                            <div className="relative">
                                <select value={novoUsuario.nivel} onChange={e => setNovoUsuario({...novoUsuario, nivel: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-sm outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                                    <option value="Produção/Atendimento">Operador de Produção / Atendimento</option>
                                    <option value="Financeiro">Equipe Financeira</option>
                                    <option value="Administrador">Administrador (Total)</option>
                                </select>
                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <p className="text-[10px] text-gray-500 italic mt-1">* Nota: O usuário terá acesso imediato após salvar.</p>
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalUsuarioAberto(false)} className="px-4 py-2 rounded text-sm font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-sm font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar Acesso</button></div>
                        </form>
                    </div>
                </div>
            )}

            {osParaImprimir && (
                <div className="print-only bg-white text-black font-sans flex flex-col w-full h-[286mm] overflow-hidden justify-between select-none">
                    {[1, 2].map((via, index) => {
                        const cInfo = clientes.find(c => c.nome === osParaImprimir.cliente);
                        const desc = desconstruirTextoServico(osParaImprimir.servico);
                        
                        return (
                            <div key={via} className={`h-[143mm] flex flex-col p-6 overflow-hidden relative justify-between ${index === 0 ? 'border-b-[2px] border-dashed border-gray-400' : ''}`}>
                                
                                <div className="shrink-0 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain object-left mb-2" />
                                            
                                            <h2 className="text-xl font-bold uppercase text-gray-800">O.S. #{osParaImprimir.id}</h2>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <p className="text-xs text-gray-500 font-medium">Entrada: {formatarDataExibicao(osParaImprimir.data_pedido)}</p>
                                                <span className="border border-gray-300 text-gray-400 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded">
                                                    {index === 0 ? 'Via da Gráfica' : 'Via do Cliente'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right text-[11px] text-gray-600 flex flex-col justify-end mt-1">

                                            <p>CNPJ: 36.117.136/0001-23</p>
                                            <p>R. Alencastro, 42 - Silveira</p>
                                            <p>Santo André - SP, 09110-050</p>
                                            <p className="font-semibold text-gray-800 mt-0.5">(11) 2677-6057 | (11) 95471-6011</p>
                                        </div>
                                    </div>

                                    <hr className="border-t-2 border-black mb-3" />

                                    <div className="mb-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <div>
                                                <h3 className="font-bold text-[10px] uppercase text-gray-400 mb-0.5 tracking-wider">Cliente</h3>
                                                <p className="font-bold text-base uppercase text-gray-900">{osParaImprimir.cliente}</p>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="font-bold text-[10px] uppercase text-gray-400 mb-0.5 tracking-wider">Contato</h3>
                                                <p className="font-bold text-sm text-gray-800">{cInfo?.telefone || 'Não informado'}</p>
                                            </div>
                                        </div>
                                        {cInfo?.observacoes && (
                                            <div className="mt-1">
                                                <p className="text-xs text-gray-600 italic">" {cInfo.observacoes} "</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col mt-2">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-800 text-gray-800">
                                                <th className="pb-1 uppercase text-[10px] font-extrabold tracking-wider w-full">Serviços Contratados</th>
                                                <th className="pb-1 uppercase text-[10px] font-extrabold tracking-wider text-right w-32 whitespace-nowrap pl-4">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {desc.itens.length > 0 ? desc.itens.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 last:border-0">
                                                    <td className="py-0.5 text-gray-900 whitespace-pre-wrap pr-4 align-middle text-xs font-medium leading-tight">
                                                        {item.descricao || item.nome}
                                                    </td>
                                                    <td className="py-0.5 text-right whitespace-nowrap align-middle font-bold text-sm">
                                                        R$ {item.valor}
                                                        {item.desconto && <span className="block text-[9px] text-gray-400 font-normal mt-0.5">(-{item.desconto}%)</span>}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td className="py-2 text-gray-500 whitespace-pre-wrap pr-4 align-middle text-xs italic">
                                                        Serviço formatado manualmente (Verifique as observações gerais abaixo).
                                                    </td>
                                                    <td className="py-2 text-right whitespace-nowrap align-middle font-bold text-sm">
                                                        R$ {formatarValorFinanceiro(Number(osParaImprimir.valor_total))}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="shrink-0 flex flex-col mt-auto pt-2">
                                    <hr className="border-t-2 border-black mb-3" />

                                    <div className="flex justify-between items-start gap-6 mb-2">
                                        <div className="flex-1 max-w-[60%] flex flex-col gap-3">
                                            {desc.pagamentos && desc.pagamentos.length > 0 && (
                                                <div>
                                                    <h3 className="font-bold text-[10px] uppercase text-gray-400 mb-1 tracking-wider">Histórico de Pagamentos</h3>
                                                    <div className="text-xs text-gray-800">
                                                        {desc.pagamentos.map((pag, idx) => (
                                                            <div key={idx} className="flex justify-between items-center border-b border-dashed border-gray-200 py-0.5 last:border-0">
                                                                <span>{pag.forma} {pag.parcelas > 1 ? `(${pag.parcelas}x)` : ''} {pag.instituicao ? `(${pag.instituicao})` : ''} <span className="text-[10px] text-gray-500">({pag.data})</span></span>
                                                                <span className="font-bold text-gray-900">R$ {pag.valor}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-[10px] uppercase text-gray-400 mb-1.5 tracking-wider">Observações Gerais do Pedido</h3>
                                                <p className="text-xs text-gray-800 whitespace-pre-wrap leading-snug">
                                                    {desc.observacoes || <span className="italic text-gray-400">Nenhuma observação extra registrada.</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block mb-0.5">Total do Pedido</span>
                                            <h2 className="text-4xl font-black tracking-tight text-gray-900">R$ {formatarValorFinanceiro(Number(osParaImprimir.valor_total))}</h2>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
