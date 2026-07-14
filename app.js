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
    if (name === 'x-circle') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
    if (name === 'bell') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
    if (name === 'truck') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;
    if (name === 'user') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    if (name === 'pie-chart') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
    if (name === 'tag') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
    if (name === 'file-text') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    if (name === 'image') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
    if (name === 'grid') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
    if (name === 'heart') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
    if (name === 'clock') return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
    return null;
}

// ==== LISTAS GLOBAIS DE ESTADOS ====
const STATUSES_PRODUCAO = [
    'Aguardando Pagamento', 'Aguardando Retorno', 'Desenvolvimento de Arte', 
    'Etiqueta Escolar', 'Produzir', 'Produção', 'Avisar Cliente', 'Retirada'
];
const STATUSES_FINALIZADOS = ['Abandonado', 'Cancelado', 'Concluído', 'Finalizado'];
const RESPONSAVEIS = ['Giovana', 'Murilo', 'Bruno', 'Nicole', 'Hellen', 'Jessica', 'Vini'];


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

function CalculadoraAdesivo({ produtos }) {
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

function CalculadorasAba({ calculadoraAtiva, produtos }) {
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
function App() {
    /// ==== CONTROLE DE SESSÃO E USUÁRIOS ====
    const [usuariosSistema, setUsuariosSistema] = useState([]);
    const [usuario, setUsuario] = useState(null);
    
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [erroLogin, setErroLogin] = useState('');

    const [abaAtual, setAbaAtual] = useState('dashboard');
    const [pedidos, setPedidos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [draggedProdutoIndex, setDraggedProdutoIndex] = useState(null);
    
    // ESTADOS ORÇAMENTOS
    const [abaOrcamentos, setAbaOrcamentos] = useState('formalizados'); // 'formalizados' | 'pre_prontos'
    const [orcamentosFormalizados, setOrcamentosFormalizados] = useState([]);
    const [orcamentosPreProntos, setOrcamentosPreProntos] = useState([]);
    const [modalOrcamentoPreAberto, setModalOrcamentoPreAberto] = useState(false);
    const [novoOrcamentoPre, setNovoOrcamentoPre] = useState({ id: null, titulo: '', texto: '' });
    const [modalOrcamentoFormalizadoAberto, setModalOrcamentoFormalizadoAberto] = useState(false);
    const [orcamentoFormalizadoEmEdicao, setOrcamentoFormalizadoEmEdicao] = useState(null);
    
    const [clientes, setClientes] = useState([]);
    const [clientesCadastrados, setClientesCadastrados] = useState([]);
    const [totalClientesCad, setTotalClientesCad] = useState(0);
    const [clientesProblema, setClientesProblema] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [abaCadastros, setAbaCadastros] = useState('clientes');
    const [abaOS, setAbaOS] = useState('abertas');
    const [buscaCadClientes, setBuscaCadClientes] = useState('');
    const [buscaCadProdutos, setBuscaCadProdutos] = useState('');
    const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false);
    const [novoFornecedor, setNovoFornecedor] = useState({ id: null, nome: '', contato: '', observacoes: '' });
    const [paginaClientes, setPaginaClientes] = useState(1);
    const [letraFiltroCliente, setLetraFiltroCliente] = useState('');
    
    const [notasFiscais, setNotasFiscais] = useState([]);
    const [filtroNotas, setFiltroNotas] = useState('pendentes');
    const [buscaNotaFiscal, setBuscaNotaFiscal] = useState('');
    const [paginaNotasFiscais, setPaginaNotasFiscais] = useState(1);
    const [modalNotaFiscalAberto, setModalNotaFiscalAberto] = useState(false);
    const [notaFiscalEmEdicao, setNotaFiscalEmEdicao] = useState(null);
    const [salvandoNotaFiscal, setSalvandoNotaFiscal] = useState(false);

    const [darkMode, setDarkMode] = useState(false); 
    
    useEffect(() => {
        if (darkMode) { document.documentElement.classList.add('dark'); }
        else { document.documentElement.classList.remove('dark'); }
    }, [darkMode]);
    const isAdmin = usuario?.nivel === 'Administrador';
    const isOperador = usuario?.nivel === 'Produção/Atendimento';
    
    // Filtros
    const [buscaHistoricoText, setBuscaHistoricoText] = useState('');
    
    // Paginação
    const [paginaProducao, setPaginaProducao] = useState(1);
    const [paginaHistorico, setPaginaHistorico] = useState(1);
    const [pedidosHistorico, setPedidosHistorico] = useState([]);
    const [totalPedidosHistorico, setTotalPedidosHistorico] = useState(0);
    const [triggerRealtime, setTriggerRealtime] = useState(0);
    const [paginaFinanceiro, setPaginaFinanceiro] = useState(1);
    const itensPorPagina = 50;
    const [dataFiltroInicio, setDataFiltroInicio] = useState('');
    const [dataFiltroFim, setDataFiltroFim] = useState('');

    const [buscaProducaoText, setBuscaProducaoText] = useState('');

    const [dataFiltroFinInicio, setDataFiltroFinInicio] = useState('');
    const [dataFiltroFinFim, setDataFiltroFinFim] = useState('');
    
    // Financeiro Expandido e Alertas
    const [abaFinanceiro, setAbaFinanceiro] = useState('geral');
    const [produtosSelecionadosGrafico, setProdutosSelecionadosGrafico] = useState(null);
    const [contasPagar, setContasPagar] = useState([]);
    const [calculadoraAtiva, setCalculadoraAtiva] = useState('banner');
    const [modalContaAberto, setModalContaAberto] = useState(false);
    const [novaConta, setNovaConta] = useState({ id: null, descricao: '', valor: '', vencimento: '', status: 'Pendente' });
    
    const [empresasFaturamento, setEmpresasFaturamento] = useState([]);
    const [modalEmpresaFaturamentoAberto, setModalEmpresaFaturamentoAberto] = useState(false);
    const [novaEmpresaFaturamento, setNovaEmpresaFaturamento] = useState({ id: null, nome: '', cnpj: '', status: 'Aprovado' });
    const [alertasNaoLidos, setAlertasNaoLidos] = useState([]);
    const alertasFuturaDisparados = useRef(new Set());
    const alertasBoletoDisparados = useRef(new Set());
    const [modalAlertasAberto, setModalAlertasAberto] = useState(false);

    const [modalAberto, setModalAberto] = useState(false);
    const [salvandoOS, setSalvandoOS] = useState(false);
    const [osParaImprimir, setOsParaImprimir] = useState(null);
    const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null); 
    const [idOrcamentoOrigem, setIdOrcamentoOrigem] = useState(null);

    const [itensPedido, setItensPedido] = useState([]);
    const [itemAtual, setItemAtual] = useState({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });

    const [buscaCliente, setBuscaCliente] = useState('');
    const [clienteDropdownAberto, setClienteDropdownAberto] = useState(false);
    const [buscaProduto, setBuscaProduto] = useState('');
    const [produtoDropdownAberto, setProdutoDropdownAberto] = useState(false);

    const [pagamentosPedido, setPagamentosPedido] = useState([]);
    const [novoPagamento, setNovoPagamento] = useState({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', vencimento_boleto: '' });

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
                        const isAdm = usuario?.nivel === 'Administrador';
                        const isFin = usuario?.nivel === 'Financeiro';
                        const isOpe = usuario?.nivel === 'Produção/Atendimento';
                        
                        // Lógica de alerta
                        if (payload.eventType === 'UPDATE') {
                            const oldResponsavel = payload.old?.responsavel || '';
                            const newResponsavel = payload.new?.responsavel || '';
                            
                            const oldList = oldResponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                            const newList = newResponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

                            const nomeUsuario = (usuario.nome || '').trim().toLowerCase();

                            if (!oldList.includes(nomeUsuario) && newList.includes(nomeUsuario)) {
                                setAlertasNaoLidos(prev => {
                                    if(prev.some(a => a.os_id === payload.new.id && a.tipo === 'atribuicao')) return prev;
                                    return [...prev, { id: Date.now(), msg: `Você foi designado para a O.S. #${payload.new.id}`, os_id: payload.new.id, tipo: 'atribuicao' }];
                                });
                            }

                            // Alerta: Serviço Concluído (para Financeiro/Admin)
                            if (payload.new.status === 'Concluído' && payload.old?.status !== 'Concluído') {
                                if (isAdm || isFin) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 1, msg: `Serviço O.S. #${payload.new.id} concluído!`, os_id: payload.new.id, tipo: 'concluido' }]);
                                }
                            }

                            // Alerta: Avisar Cliente (para Atendimento/Admin)
                            if (payload.new.status === 'Avisar Cliente' && payload.old?.status !== 'Avisar Cliente') {
                                if (isAdm || isOpe) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 5, msg: `Avisar cliente: ${payload.new.cliente} (O.S. #${payload.new.id})`, os_id: payload.new.id, tipo: 'avisar_cliente' }]);
                                }
                            }

                            // Alerta: Serviço de Urgência (para Operacional/Admin)
                            if (payload.new.urgente && !payload.old?.urgente) {
                                if (isAdm || isOpe) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 2, msg: `Urgência marcada na O.S. #${payload.new.id}!`, os_id: payload.new.id, tipo: 'urgencia' }]);
                                }
                            }

                        } else if (payload.eventType === 'INSERT') {
                            const newResponsavel = payload.new?.responsavel || '';
                            const newList = newResponsavel.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                            const nomeUsuario = (usuario.nome || '').trim().toLowerCase();
                            
                            if (newList.includes(nomeUsuario)) {
                                setAlertasNaoLidos(prev => [...prev, { id: Date.now(), msg: `Nova O.S. #${payload.new.id} atribuída a você`, os_id: payload.new.id, tipo: 'atribuicao' }]);
                            }
                            
                            // Alerta: Serviço de Urgência no cadastro
                            if (payload.new.urgente) {
                                if (isAdm || isOpe) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 2, msg: `Urgência na nova O.S. #${payload.new.id}!`, os_id: payload.new.id, tipo: 'urgencia' }]);
                                }
                            }
                        }

                        carregarDados(); // Puxa os dados novos invisivelmente
                        setTriggerRealtime(prev => prev + 1);
                    }
                )
                .on(
                    'postgres_changes', 
                    { event: '*', schema: 'public', table: 'notas_fiscais' }, 
                    (payload) => {
                        console.log('Atualização em tempo real (notas_fiscais) recebida!', payload);
                        const isAdm = usuario?.nivel === 'Administrador';
                        const isFin = usuario?.nivel === 'Financeiro';
                        const isOpe = usuario?.nivel === 'Produção/Atendimento';

                        if (payload.eventType === 'INSERT') {
                            if (isAdm || isOpe) {
                                setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 3, msg: `Nova Nota Fiscal solicitada (${payload.new.cliente || payload.new.cnpj})`, os_id: null, tipo: 'nf_nova' }]);
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            const changedServico = payload.new.servico_feito !== payload.old?.servico_feito && payload.new.servico_feito;
                            const changedValor = payload.new.valor_pago !== payload.old?.valor_pago && payload.new.valor_pago;
                            if (changedServico || changedValor) {
                                if (isAdm || isFin) {
                                    setAlertasNaoLidos(prev => [...prev, { id: Date.now() + 4, msg: `Nota Fiscal (${payload.new.cliente || payload.new.cnpj}) preenchida!`, os_id: null, tipo: 'nf_preenchida' }]);
                                }
                            }
                        }

                        carregarDados(); // Puxa os dados novos invisivelmente
                        setTriggerRealtime(prev => prev + 1);
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
        return clientesProblema.includes(nome);
    };

    async function carregarDados() {
        let todosPedidos = [];
        let from = 0;
        let limit = 1000;
        let fetchMore = true;
        
        const anoAnteriorStr = (new Date().getFullYear() - 1).toString();
        const dataCorte = `${anoAnteriorStr}-01-01`;

        while (fetchMore) {
            const { data: batch, error } = await supabase
                .from('pedidos')
                .select('*')
                .or(`data_pedido.gte.${dataCorte},status.in.(Produzir,Arte,Impressão,Acabamento,Retirada)`)
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
        if (todosPedidos.length > 0) {
            // Regra de pedidos Abandonados (Em Retirada a mais de 15 dias após o prazo)
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const pedidosParaAbandonar = todosPedidos.filter(p => {
                if (p.status !== 'Retirada' || !p.prazo) return false;
                const partes = p.prazo.split('-');
                if(partes.length !== 3) return false;
                const dataPrazo = new Date(partes[0], partes[1] - 1, partes[2]);
                dataPrazo.setDate(dataPrazo.getDate() + 15);
                return dataPrazo < hoje;
            });
            if (pedidosParaAbandonar.length > 0) {
                pedidosParaAbandonar.forEach(async p => {
                    await supabase.from('pedidos').update({status: 'Abandonado'}).eq('id', p.id);
                });
                pedidosParaAbandonar.forEach(p => p.status = 'Abandonado');
            }

            setPedidos(todosPedidos);

            if (usuario?.nivel === 'Administrador') {
                const hoje = new Date();
                const amanha = new Date(hoje);
                amanha.setDate(amanha.getDate() + 1);
                const amanhaStr = amanha.getFullYear() + '-' + String(amanha.getMonth() + 1).padStart(2, '0') + '-' + String(amanha.getDate()).padStart(2, '0');

                const statusIgnorados = ['Concluída', 'Finalizada', 'Cancelada', 'Abandonada'];
                
                const hojeStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
                
                const pedidosFuturaAlertar = todosPedidos.filter(p => p.local_producao && p.local_producao.toLowerCase().includes('futura') && !statusIgnorados.includes(p.status) && p.prazo && p.prazo <= amanhaStr);
                
                if (pedidosFuturaAlertar.length > 0) {
                    setAlertasNaoLidos(prev => {
                        let novosAlertas = [...prev];
                        pedidosFuturaAlertar.forEach(p => {
                            if (!novosAlertas.some(a => a.os_id === p.id && a.tipo === 'alerta_futura') && !alertasFuturaDisparados.current.has(p.id)) {
                                let msg = `Prazo da Futura termina amanhã (O.S. #${p.id}). Retirar!`;
                                if (p.prazo === hojeStr) msg = `Prazo da Futura é HOJE (O.S. #${p.id}). Retirar o quanto antes!`;
                                else if (p.prazo < hojeStr) msg = `Prazo da Futura VENCIDO (O.S. #${p.id}). Verifique imediatamente!`;
                                
                                novosAlertas.push({ id: Date.now() + Math.random(), msg, os_id: p.id, tipo: 'alerta_futura' });
                                alertasFuturaDisparados.current.add(p.id);
                            }
                        });
                        return novosAlertas;
                    });
                }
                
                const pedidosComBoleto = todosPedidos.filter(p => !statusIgnorados.includes(p.status) && Array.isArray(p.pagamentos));
                if (pedidosComBoleto.length > 0) {
                    let novosAlertasBoleto = [];
                    pedidosComBoleto.forEach(p => {
                        p.pagamentos.forEach(pag => {
                            if (pag.forma === 'Boleto' && pag.vencimento_boleto) {
                                if (pag.vencimento_boleto === hojeStr || pag.vencimento_boleto === amanhaStr) {
                                    const alertId = `${p.id}_${pag.vencimento_boleto}`;
                                    if (!alertasBoletoDisparados.current.has(alertId)) {
                                        let msg = `O boleto da O.S. #${p.id} vence amanhã!`;
                                        if (pag.vencimento_boleto === hojeStr) msg = `O boleto da O.S. #${p.id} vence HOJE!`;
                                        
                                        novosAlertasBoleto.push({ id: Date.now() + Math.random(), msg, os_id: p.id, tipo: 'alerta_boleto' });
                                        alertasBoletoDisparados.current.add(alertId);
                                    }
                                }
                            }
                        });
                    });
                    
                    if (novosAlertasBoleto.length > 0) {
                        setAlertasNaoLidos(prev => {
                            let mergeAlertas = [...prev];
                            novosAlertasBoleto.forEach(n => {
                                if (!mergeAlertas.some(a => a.msg === n.msg && a.os_id === n.os_id)) {
                                    mergeAlertas.push(n);
                                }
                            });
                            return mergeAlertas;
                        });
                    }
                }
            }
        }
        
        const { data: listaProdutos } = await supabase.from('produtos').select('*').order('ordem', { ascending: true });
        if (listaProdutos) setProdutos(listaProdutos);
        
        // Clientes não são mais puxados integralmente aqui.

        const { data: listaUsuarios } = await supabase.from('usuarios').select('*').order('nome', { ascending: true });
        if (listaUsuarios) setUsuariosSistema(listaUsuarios);

        const { data: listaNotas } = await supabase.from('notas_fiscais').select('*').order('created_at', { ascending: false });
        if (listaNotas) setNotasFiscais(listaNotas);
        
        const { data: listaEmpresasFaturamento } = await supabase.from('empresas_faturamento').select('*').order('nome', { ascending: true });
        if (listaEmpresasFaturamento) setEmpresasFaturamento(listaEmpresasFaturamento);

        const { data: listaContas, error: erroContas } = await supabase.from('contas_pagar').select('*').order('vencimento', { ascending: true });
        if (!erroContas && listaContas) setContasPagar(listaContas);

        const { data: listaFornecedores } = await supabase.from('fornecedores').select('*').order('nome', { ascending: true });
        if (listaFornecedores) setFornecedores(listaFornecedores);

        const { data: listaOrcF } = await supabase.from('orcamentos_formalizados').select('*').order('created_at', { ascending: false });
        if (listaOrcF) setOrcamentosFormalizados(listaOrcF);

        const { data: listaOrcPP } = await supabase.from('orcamentos_pre_prontos').select('*').order('created_at', { ascending: false });
        if (listaOrcPP) setOrcamentosPreProntos(listaOrcPP);
    }
    
    useEffect(() => {
        setPaginaHistorico(1);
    }, [buscaHistoricoText, dataFiltroInicio, dataFiltroFim]);

    useEffect(() => {
        if (!usuario) return;
        
        async function fetchHistorico() {
            let query = supabase.from('pedidos').select('*', { count: 'exact' });
            
            if (abaOS === 'abertas') {
                query = query.not('status', 'in', '("Concluído","Finalizado","Cancelado","Abandonado")');
            } else if (abaOS === 'concluidas') {
                query = query.eq('status', 'Concluído');
            } else if (abaOS === 'finalizadas') {
                query = query.eq('status', 'Finalizado');
            } else if (abaOS === 'canceladas') {
                query = query.eq('status', 'Cancelado');
            } else if (abaOS === 'abandonadas') {
                query = query.eq('status', 'Abandonado');
            }

            const isOperador = usuario?.nivel === 'Produção/Atendimento';
            if (isOperador) {
                query = query.not('status', 'eq', 'Finalizado');
            }

            if (buscaHistoricoText) {
                const isNum = !isNaN(buscaHistoricoText);
                if (isNum) {
                    query = query.or(`cliente.ilike.%${buscaHistoricoText}%,id.eq.${buscaHistoricoText}`);
                } else {
                    query = query.ilike('cliente', `%${buscaHistoricoText}%`);
                }
            }

            if (dataFiltroInicio) query = query.gte('data_pedido', dataFiltroInicio);
            if (dataFiltroFim) query = query.lte('data_pedido', dataFiltroFim);

            query = query.order('id', { ascending: false });
            
            const from = (paginaHistorico - 1) * itensPorPagina;
            const to = from + itensPorPagina - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;
            if (!error && data) {
                setPedidosHistorico(data);
                if (count !== null) setTotalPedidosHistorico(count);
            }
        }
        
        const timeout = setTimeout(fetchHistorico, 300);
        return () => clearTimeout(timeout);
    }, [usuario, abaOS, paginaHistorico, buscaHistoricoText, dataFiltroInicio, dataFiltroFim, triggerRealtime]);

    useEffect(() => {
        if (!usuario) return;
        async function fetchProblemas() {
            const { data } = await supabase.from('clientes').select('nome').eq('cliente_problema', true);
            if (data) setClientesProblema(data.map(c => c.nome));
        }
        fetchProblemas();
    }, [usuario, triggerRealtime]);

    useEffect(() => {
        if (!buscaCliente || buscaCliente.length < 1) {
            setClientes([]);
            return;
        }
        const timeout = setTimeout(async () => {
            const isNum = !isNaN(buscaCliente);
            let query = supabase.from('clientes').select('*').limit(15);
            if (isNum) {
                query = query.ilike('telefone', `%${buscaCliente}%`);
            } else {
                query = query.ilike('nome', `%${buscaCliente}%`);
            }
            const { data } = await query;
            if (data) setClientes(data);
        }, 300);
        return () => clearTimeout(timeout);
    }, [buscaCliente]);

    useEffect(() => {
        if (abaAtual !== 'cadastros' || abaCadastros !== 'clientes' || !usuario) return;
        
        async function fetchClientesCadastrados() {
            let query = supabase.from('clientes').select('*', { count: 'exact' });
            
            if (letraFiltroCliente) {
                query = query.ilike('nome', `${letraFiltroCliente}%`);
            }
            if (buscaCadClientes) {
                const isNum = !isNaN(buscaCadClientes);
                if (isNum) {
                    query = query.ilike('telefone', `%${buscaCadClientes}%`);
                } else {
                    query = query.or(`nome.ilike.%${buscaCadClientes}%,email.ilike.%${buscaCadClientes}%`);
                }
            }
            
            query = query.order('nome', { ascending: true });
            
            const from = (paginaClientes - 1) * itensPorPagina;
            const to = from + itensPorPagina - 1;
            query = query.range(from, to);
            
            const { data, count } = await query;
            if (data) {
                setClientesCadastrados(data);
                if (count !== null) setTotalClientesCad(count);
            }
        }
        
        const timeout = setTimeout(fetchClientesCadastrados, 300);
        return () => clearTimeout(timeout);
    }, [usuario, abaAtual, abaCadastros, paginaClientes, buscaCadClientes, letraFiltroCliente, triggerRealtime]);

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
            setAbaAtual('dashboard');
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
        setIdOrcamentoOrigem(null);
        setBuscaCliente('');
        setBuscaProduto('');
        setItensPedido([]); 
        setPagamentosPedido([]);
        setNovoPagamento({ valor: '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', vencimento_boleto: '' });
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });
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
        
        setItemAtual({ nome: '', descricao: '', valor: '', desconto: '', local_producao: 'Berlim', id_produto: null });
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
                const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
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
                if (idOrcamentoOrigem) {
                    supabase.from('orcamentos_formalizados').delete().eq('id', idOrcamentoOrigem).then(({ error }) => {
                        if (!error) setOrcamentosFormalizados(prev => prev.filter(o => o.id !== idOrcamentoOrigem));
                    });
                }
                fecharModalOS(); 
                if (querImprimir) imprimirOS(data[0]); 
            } else {
                // Se a resposta for vazia, puxa as informações limpas e fecha sem travar
                if (idOrcamentoOrigem) {
                    supabase.from('orcamentos_formalizados').delete().eq('id', idOrcamentoOrigem).then(({ error }) => {
                        if (!error) setOrcamentosFormalizados(prev => prev.filter(o => o.id !== idOrcamentoOrigem));
                    });
                }
                carregarDados();
                fecharModalOS();
                if (querImprimir) alert('Pedido atualizado com sucesso! Para evitar lentidão, inicie a impressão manualmente através do Histórico.');
            }
        }
        setSalvandoOS(false);
    }
    
    // === FUNÇÕES ORÇAMENTOS PRÉ PRONTOS ===
    async function salvarOrcamentoPre(e) {
        e.preventDefault();
        const payload = { titulo: novoOrcamentoPre.titulo, texto: novoOrcamentoPre.texto };
        if (novoOrcamentoPre.id) {
            const { data, error } = await supabase.from('orcamentos_pre_prontos').update(payload).eq('id', novoOrcamentoPre.id).select();
            if (!error && data) {
                setOrcamentosPreProntos(orcamentosPreProntos.map(o => o.id === novoOrcamentoPre.id ? data[0] : o));
                setModalOrcamentoPreAberto(false);
            } else alert('Erro: ' + error?.message);
        } else {
            const { data, error } = await supabase.from('orcamentos_pre_prontos').insert([payload]).select();
            if (!error && data) {
                setOrcamentosPreProntos([data[0], ...orcamentosPreProntos]);
                setModalOrcamentoPreAberto(false);
            } else alert('Erro: ' + error?.message);
        }
    }
    
    async function excluirOrcamentoPre(id) {
        if (!confirm('Excluir este modelo pré-pronto?')) return;
        const { error } = await supabase.from('orcamentos_pre_prontos').delete().eq('id', id);
        if (!error) setOrcamentosPreProntos(orcamentosPreProntos.filter(o => o.id !== id));
        else alert('Erro: ' + error.message);
    }

    // === FUNÇÕES ORÇAMENTOS FORMALIZADOS ===
    async function salvarOrcamentoFormalizado(e, querImprimir = false) {
        if (e) e.preventDefault();
        
        let textoFinalServico = '';
        if (itensPedido.length > 0) {
            const itensTextoArray = itensPedido.map(i => {
                const strDesconto = i.desconto ? ' (-' + i.desconto + '%)' : '';
                const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
                const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
                return strNome + '\n  ' + i.descricao + '\n  Valor: R$ ' + i.valor + strDesconto + strLocal;
            });
            textoFinalServico += itensTextoArray.join('\n\n') + '\n\n';
            if (novoPedido.servico) textoFinalServico += '[OBSERVAÇÕES GERAIS]\n' + novoPedido.servico;
        } else {
            textoFinalServico = novoPedido.servico;
        }

        const valorNumericoFinal = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;

        const payload = {
            cliente: novoPedido.cliente,
            telefone: clientes.find(c => c.nome === novoPedido.cliente)?.telefone || '',
            produto: itensPedido.map(i => i.nome).join(', ') || 'Serviços Diversos',
            descricao: textoFinalServico + (itensPedido.length > 0 ? '\n\n[ITENS_JSON]\n' + JSON.stringify(itensPedido) : ''),
            quantidade: 1,
            valor: valorNumericoFinal,
            observacoes: novoPedido.servico,
            criado_por: usuario?.nome || 'Desconhecido'
        };

        if (orcamentoFormalizadoEmEdicao) {
            const { data, error } = await supabase.from('orcamentos_formalizados').update(payload).eq('id', orcamentoFormalizadoEmEdicao.id).select();
            if (error) alert('Erro: ' + error.message);
            else if (data && data.length > 0) {
                setOrcamentosFormalizados(orcamentosFormalizados.map(o => o.id === data[0].id ? data[0] : o));
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento(data[0]);
            }
        } else {
            const { data, error } = await supabase.from('orcamentos_formalizados').insert([payload]).select();
            if (error) alert('Erro: ' + error.message);
            else if (data && data.length > 0) {
                setOrcamentosFormalizados([data[0], ...orcamentosFormalizados]);
                setModalOrcamentoFormalizadoAberto(false);
                if (querImprimir) baixarPDFOrcamento(data[0]);
            }
        }
    }

    function baixarPDFOrcamento(orc) {
        alert("A função de gerar e baixar o PDF do orçamento está em desenvolvimento!");
    }
    
    function extrairItensOrcamento(orc) {
        if (!orc.descricao) return [];
        const match = orc.descricao.match(/\[ITENS_JSON\]\n(.*)/);
        if (match) {
            try { return JSON.parse(match[1]); } catch(e) {}
        }
        return desconstruirTextoServico(orc.descricao).itens;
    }

    function abrirEdicaoOrcamento(orcamento) {
        const itensCarregados = extrairItensOrcamento(orcamento);
        const obs = orcamento.observacoes || (orcamento.descricao ? desconstruirTextoServico(orcamento.descricao.split('\n\n[ITENS_JSON]')[0]).observacoes : '');
        
        setOrcamentoFormalizadoEmEdicao(orcamento);
        setBuscaCliente(orcamento.cliente);
        setItensPedido(itensCarregados);
        setNovoPedido({
            cliente: orcamento.cliente,
            servico: obs || '',
            valor_total: formatarMoeda((orcamento.valor * 100).toFixed(0).toString()),
            status: 'Orçamento',
            data_pedido: obterDataAtual(),
            prazo: '',
            responsavel: usuario?.nome || '',
            entrega: false,
            urgente: false
        });
        setModalOrcamentoFormalizadoAberto(true);
    }
    
    function transformarEmOS(orcamento) {
        const itensCarregados = extrairItensOrcamento(orcamento);
        setPedidoEmEdicao(null);
        setBuscaCliente(orcamento.cliente);
        setItensPedido(itensCarregados);
        setNovoPedido({
            cliente: orcamento.cliente,
            servico: '',
            valor_total: formatarMoeda((orcamento.valor * 100).toFixed(0).toString()),
            status: 'Produzir',
            data_pedido: obterDataAtual(),
            prazo: '',
            responsavel: usuario?.nome || '',
            entrega: false,
            urgente: false
        });
        setIdOrcamentoOrigem(orcamento.id);
        setModalAberto(true);
    }
    
    async function excluirOrcamentoFormalizado(id) {
        if (!confirm('Excluir este orçamento formalizado?')) return;
        const { error } = await supabase.from('orcamentos_formalizados').delete().eq('id', id);
        if (!error) setOrcamentosFormalizados(orcamentosFormalizados.filter(o => o.id !== id));
        else alert('Erro: ' + error.message);
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

    const [salvandoConta, setSalvandoConta] = useState(false);
    async function salvarConta(e) {
        e.preventDefault();
        setSalvandoConta(true);
        const contaFormatada = { 
            descricao: novaConta.descricao, 
            valor: parseFloat(String(novaConta.valor).replace(/\./g, '').replace(',', '.')) || 0,
            vencimento: novaConta.vencimento,
            status: novaConta.status
        };

        if (novaConta.id) {
            const { data, error } = await supabase.from('contas_pagar').update(contaFormatada).eq('id', novaConta.id).select();
            if (!error && data) { 
                setContasPagar(contasPagar.map(c => c.id === novaConta.id ? data[0] : c)); 
                setModalContaAberto(false); 
            } else {
                alert('Falha ao atualizar (Tabela contas_pagar existe no Supabase?): ' + (error?.message || 'Erro desconhecido'));
            }
        } else {
            const { data, error } = await supabase.from('contas_pagar').insert([contaFormatada]).select();
            if (!error && data) { 
                setContasPagar([...contasPagar, data[0]]); 
                setModalContaAberto(false); 
            } else {
                alert('Falha ao salvar (Tabela contas_pagar existe no Supabase?): ' + (error?.message || 'Erro desconhecido'));
            }
        }
        setSalvandoConta(false);
    }

    const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
    async function salvarEmpresaFaturamento(e) {
        e.preventDefault();
        setSalvandoEmpresa(true);
        const payload = { nome: novaEmpresaFaturamento.nome, cnpj: novaEmpresaFaturamento.cnpj, status: novaEmpresaFaturamento.status };
        if (novaEmpresaFaturamento.id) {
            const { data, error } = await supabase.from('empresas_faturamento').update(payload).eq('id', novaEmpresaFaturamento.id).select();
            if (!error && data) setEmpresasFaturamento(empresasFaturamento.map(x => x.id === data[0].id ? data[0] : x));
            else if (error) alert('Falha ao atualizar (A tabela empresas_faturamento foi criada?): ' + error.message);
        } else {
            const { data, error } = await supabase.from('empresas_faturamento').insert([payload]).select();
            if (!error && data) setEmpresasFaturamento([...empresasFaturamento, data[0]]);
            else if (error) alert('Falha ao salvar (A tabela empresas_faturamento foi criada?): ' + error.message);
        }
        setModalEmpresaFaturamentoAberto(false);
        setSalvandoEmpresa(false);
    }

    async function excluirEmpresaFaturamento(id) {
        if (!confirm('Deseja excluir esta empresa?')) return;
        const { error } = await supabase.from('empresas_faturamento').delete().eq('id', id);
        if (!error) setEmpresasFaturamento(empresasFaturamento.filter(x => x.id !== id));
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
            let duplicado = null;
            if (telNormalizado.length >= 8) {
                const searchString = `%${telNormalizado.slice(-4)}%`;
                const { data: dupData } = await supabase.from('clientes').select('id,nome,telefone').ilike('telefone', searchString);
                if (dupData) {
                    duplicado = dupData.find(c => {
                        if (novoCliente.id && c.id === novoCliente.id) return false;
                        if (!c.telefone) return false;
                        const cTelNorm = c.telefone.replace(/\D/g, '');
                        return cTelNorm.endsWith(telNormalizado) || telNormalizado.endsWith(cTelNorm);
                    });
                }
            }
            
            if (duplicado) {
                alert('Aviso: Este número de WhatsApp/Telefone já está cadastrado no cliente "' + duplicado.nome + '"!');
                setSalvandoCliente(false);
                return;
            }
        }

        if (novoCliente.id) {
            const { data, error } = await supabase.from('clientes').update(clienteFormatado).eq('id', novoCliente.id).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); } 
            else alert('Falha ao atualizar: ' + error.message);
        } else {
            const { data, error } = await supabase.from('clientes').insert([clienteFormatado]).select();
            if (!error && data) { setTriggerRealtime(prev => prev + 1); setNovoPedido({...novoPedido, cliente: data[0].nome}); setBuscaCliente(data[0].nome); setModalClienteAberto(false); setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); } 
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

    async function imprimirOS(pedido) {
        setOsParaImprimir(pedido);
        const { data } = await supabase.from('clientes').select('*').eq('nome', pedido.cliente).single();
        if (data) {
            setOsParaImprimir(prev => ({...prev, clienteInfo: data}));
        }
        setTimeout(() => window.print(), 200);
    }

    const clientesFiltrados = clientes;
    // Lógica para elencar os 5 produtos mais vendidos com base no histórico
    const vendasPorProduto = useMemo(() => {
        const mapa = {};
        pedidos.forEach(p => {
            if (!p.servico) return;
            const { itens } = desconstruirTextoServico(p.servico);
            
            itens.forEach(item => {
                const id_produto_match = item.id_produto;
                const nomeLimpo = item.nome.trim();
                const valorNum = parseFloat(item.valor.replace(/\./g, '').replace(',', '.')) || 0;
                
                const prod = id_produto_match 
                    ? produtos.find(p => String(p.id) === String(id_produto_match)) 
                    : produtos.find(prod => prod.nome.toLowerCase() === nomeLimpo.toLowerCase());

                const finalName = prod ? prod.nome : nomeLimpo;

                if (mapa[finalName]) mapa[finalName] += valorNum;
                else mapa[finalName] = valorNum;
            });
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
    
    // (Filtros locais de Clientes foram substituídos por busca no servidor e paginação)

    const produtosCatalogoFiltrados = produtos.filter(p => {
        if (!buscaCadProdutos) return true;
        const termo = buscaCadProdutos.toLowerCase();
        return (p.nome && p.nome.toLowerCase().includes(termo));
    });
    const clientesPaginados = clientesCadastrados;
    const totalPaginasClientes = Math.ceil(totalClientesCad / itensPorPagina) || 1;

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

    // (Filtros locais do Histórico foram substituídos por busca no servidor e paginação)

    const opcoesStatusPermitidas = isOperador ? [...STATUSES_PRODUCAO, 'Abandonado', 'Concluído'] : [...STATUSES_PRODUCAO, ...STATUSES_FINALIZADOS];
    const isModalTrancado = (pedidoEmEdicao && pedidoEmEdicao.status === 'Finalizado' && isOperador) ? true : false;

    // Render de barras para o Financeiro
    const renderBarHorizontal = (label, valor, maxVal, isCaixa = false, customColor = null) => {
        const pct = maxVal > 0 ? (valor / maxVal) * 100 : 0;
        const barColor = customColor || (isCaixa ? 'bg-emerald-500' : 'bg-brand');
        return (
            <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[11px] group">
                <span className="w-24 sm:w-32 font-medium truncate text-gray-700 dark:text-gray-300">{label}</span>
                <div className="flex-1 bg-gray-100 dark:bg-darkElevated h-6 rounded overflow-hidden relative border dark:border-darkBorder">
                    <div className={`${barColor} h-full transition-all duration-500 opacity-80 group-hover:opacity-100`} style={{ width: `${Math.max(pct, 1)}%` }}></div>
                </div>
                <span className="w-24 text-right font-semibold text-gray-900 dark:text-[#EDEDED]">
                    R$ {formatarValorFinanceiro(valor)}
                </span>
            </div>
        )
    };

    // ==== TELA DE LOGIN ====
    if (!usuario) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#EDEFF0] text-[#454545] p-4 select-none font-sans">
                <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col gap-6">
                    <div className="text-center flex flex-col items-center">
                        <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain mb-3" />
                        <p className="text-[11px] text-gray-400 mt-1">Insira suas credenciais para acessar o ERP</p>
                    </div>
                    
                    <form onSubmit={efetuarLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Usuário</label>
                            <input required type="text" value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition text-gray-800" placeholder="Ex: admin, gi, financeiro..." autoComplete="off" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Senha</label>
                            <input required type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition text-gray-800" placeholder="••••••" />
                        </div>
                        {erroLogin && <p className="text-[11px] text-red-500 font-medium text-center">{erroLogin}</p>}
                        <button type="submit" className="w-full bg-brand hover:bg-brandHover text-white py-2 rounded text-[13px] font-semibold shadow transition mt-2">
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
                {/* TIER 1: Logo and Profile */}
                <header className="sticky top-0 z-40 bg-white dark:bg-darkBg px-6 h-[64px] flex justify-between items-center">
                    <div className="flex items-center">
                        <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-8 object-contain" />
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <button onClick={() => setModalAlertasAberto(!modalAlertasAberto)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition text-gray-600 dark:text-[#888888] relative">
                                <Icon name="bell" className="w-5 h-5" />
                                {alertasNaoLidos.length > 0 && (
                                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                                        {alertasNaoLidos.length}
                                    </span>
                                )}
                            </button>
                            {modalAlertasAberto && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded-lg shadow-lg py-2 z-50 fade-in">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center">
                                        <h3 className="font-semibold text-[13px] dark:text-white">Notificações</h3>
                                        {alertasNaoLidos.length > 0 && (
                                            <button onClick={() => setAlertasNaoLidos([])} className="text-[11px] text-brand hover:underline">Limpar</button>
                                        )}
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {alertasNaoLidos.length === 0 ? (
                                            <p className="px-4 py-4 text-[11px] text-gray-500 text-center">Nenhuma nova notificação.</p>
                                        ) : (
                                            alertasNaoLidos.slice().reverse().map(alerta => (
                                                <div key={alerta.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-darkHover border-b border-gray-50 dark:border-darkBorder/50 last:border-0 cursor-pointer flex justify-between items-start group" onClick={() => {
                                                    setModalAlertasAberto(false);
                                                    setAbaAtual('producao');
                                                    if (alerta.os_id) {
                                                        const p = pedidos.find(x => x.id === alerta.os_id);
                                                        if (p) abrirEdicao(p);
                                                    }
                                                }}>
                                                    <div className="flex-1 pr-2">
                                                        <p className="text-[11px] text-gray-800 dark:text-[#EDEDED]">{alerta.msg}</p>
                                                        <span className="text-[10px] text-gray-400 mt-1 block">Agora</span>
                                                    </div>
                                                    <button type="button" onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setAlertasNaoLidos(prev => prev.filter(a => a.id !== alerta.id)); 
                                                    }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition p-1">
                                                        <Icon name="x" className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition text-gray-600 dark:text-[#888888]">
                            <Icon name={darkMode ? "sun" : "moon"} className="w-5 h-5" />
                        </button>
                        
                        {/* SEPARADOR ATALHOS */}
                        <div className="hidden sm:block w-[1px] h-8 bg-gray-200 dark:border-darkBorder"></div>

                        <div className="flex items-center gap-1.5">
                            {/* LINK FUTURA IM */}
                            <a href="https://www.futuraim.com.br/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition flex items-center justify-center" title="Acessar Futura IM">
                                <img src="https://www.google.com/s2/favicons?domain=futuraim.com.br&sz=64" alt="Futura IM" className="w-5 h-5 object-contain rounded-sm" />
                            </a>
                            
                            {/* LINK ATUAL CARD */}
                            <a href="https://oferta.atualcard.com.br/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition flex items-center justify-center" title="Acessar Atual Card">
                                <img src="https://www.google.com/s2/favicons?domain=atualcard.com.br&sz=64" alt="Atual Card" className="w-5 h-5 object-contain rounded-sm" />
                            </a>
                            
                            {/* LINK ALVO PRINT */}
                            <a href="https://www.alvoprint.com.br/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkHover transition flex items-center justify-center" title="Acessar Alvo Print">
                                <img src="https://www.google.com/s2/favicons?domain=alvoprint.com.br&sz=64" alt="Alvo Print" className="w-5 h-5 object-contain rounded-sm" />
                            </a>
                        </div>

                        {/* SEPARADOR VERTICAL DE ELEGÂNCIA */}
                        <div className="hidden sm:block w-[1px] h-8 bg-gray-200 dark:border-darkBorder"></div>

                        {/* BLOCO DO USUÁRIO ATUALIZADO */}
                        <div className="flex items-center gap-4 select-none">
                            <div className="flex flex-col text-right">
                                <span className="text-[13px] font-extrabold text-gray-900 dark:text-white leading-none">
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

                {/* TIER 2: Main Navigation Bar (Brand Color) */}
                <nav className="bg-brand text-white px-6 shadow-sm z-30 sticky top-[64px] h-[48px]">
                    <div className="flex gap-1 overflow-x-auto custom-scrollbar no-scrollbar-style items-end pt-2 h-full">
                        <a onClick={() => setAbaAtual('dashboard')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center tracking-wide uppercase ${abaAtual === 'dashboard' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                            Início
                        </a>
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Produção/Atendimento') && (
                            <a onClick={() => setAbaAtual('producao')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center tracking-wide uppercase ${abaAtual === 'producao' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Produção
                            </a>
                        )}
                        <a onClick={() => setAbaAtual('baixa')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center tracking-wide uppercase ${abaAtual === 'baixa' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                            O.S.
                        </a>
                        {usuario?.nivel !== 'Financeiro' && (
                            <a onClick={() => setAbaAtual('calculadoras')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center tracking-wide uppercase ${abaAtual === 'calculadoras' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Calculadoras
                            </a>
                        )}
                        
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                            <a onClick={() => setAbaAtual('financeiro')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center tracking-wide uppercase ${abaAtual === 'financeiro' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Financeiro
                            </a>
                        )}
                        
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro' || usuario?.nivel === 'Produção/Atendimento') && (
                            <a onClick={() => setAbaAtual('notas_fiscais')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center gap-2 tracking-wide uppercase ${abaAtual === 'notas_fiscais' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Notas Fiscais
                                {notasFiscais.some(n => !n.concluido) && <span className={`w-2 h-2 rounded-full ${abaAtual === 'notas_fiscais' ? 'bg-emerald-500' : 'bg-white'} shadow`}></span>}
                            </a>
                        )}

                        {usuario?.nivel !== 'Financeiro' && (
                            <a onClick={() => setAbaAtual('orcamentos')} className={`px-5 py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center tracking-wide uppercase ${abaAtual === 'orcamentos' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Orçamentos
                            </a>
                        )}
                        
                        {usuario?.nivel !== 'Financeiro' && (
                            <a onClick={() => setAbaAtual('cadastros')} className={`px-5 py-2.5 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap rounded-t-md flex items-center tracking-wide uppercase ${abaAtual === 'cadastros' ? 'bg-[#EDEFF0] text-gray-900 dark:bg-darkBg dark:text-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]' : 'hover:bg-black/10 text-white/90'}`}>
                                Cadastros
                            </a>
                        )}
                    </div>
                </nav>

                {/* TIER 3: Submenus */}
                {abaAtual === 'orcamentos' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <a onClick={() => setAbaOrcamentos('formalizados')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaOrcamentos === 'formalizados' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> Formalizados
                        </a>
                        <a onClick={() => setAbaOrcamentos('pre_prontos')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaOrcamentos === 'pre_prontos' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <Icon name="file" className="w-4 h-4" /> Pré Prontos
                        </a>
                    </div>
                )}
                
                {abaAtual === 'cadastros' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'Produção/Atendimento') && (
                            <a onClick={() => setAbaCadastros('clientes')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'clientes' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                <Icon name="users" className="w-4 h-4" /> Clientes
                            </a>
                        )}
                        {isAdmin && (
                            <>
                                <a onClick={() => setAbaCadastros('produtos')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'produtos' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="package" className="w-4 h-4" /> Catálogo
                                </a>
                                <a onClick={() => setAbaCadastros('fornecedores')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'fornecedores' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="truck" className="w-4 h-4" /> Fornecedores / Locais
                                </a>
                                <a onClick={() => setAbaCadastros('usuarios')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'usuarios' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="user" className="w-4 h-4" /> Usuários
                                </a>
                            </>
                        )}
                    </div>
                )}
                {abaAtual === 'financeiro' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaFinanceiro('geral')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'geral' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="pie-chart" className="w-4 h-4" /> Visão Geral</button>
                        <button onClick={() => setAbaFinanceiro('vendas_produto')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'vendas_produto' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="tag" className="w-4 h-4" /> Vendas por Produto</button>
                        <button onClick={() => setAbaFinanceiro('contas_pagar')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_pagar' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="file-text" className="w-4 h-4" /> Contas a Pagar</button>
                        <button onClick={() => setAbaFinanceiro('contas_receber')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_receber' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="dollar-sign" className="w-4 h-4" /> Contas a Receber</button>
                        <button onClick={() => setAbaFinanceiro('empresas_aprovadas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'empresas_aprovadas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-circle" className="w-4 h-4" /> Faturamento Aprovado</button>
                    </div>
                )}
                {abaAtual === 'calculadoras' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setCalculadoraAtiva('banner')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'banner' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="image" className="w-4 h-4" /> Banner / Lona</button>
                        <button onClick={() => setCalculadoraAtiva('adesivo')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'adesivo' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="grid" className="w-4 h-4" /> Adesivos (Vinil)</button>
                        <button onClick={() => setCalculadoraAtiva('casamento')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'casamento' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="heart" className="w-4 h-4" /> Papelaria Casamento</button>
                        {/* Se tiver mais calculadoras, elas aparecem aqui */}
                    </div>
                )}
                {abaAtual === 'notas_fiscais' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => { setFiltroNotas('pendentes'); setPaginaNotasFiscais(1); }} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${filtroNotas === 'pendentes' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}>
                            <Icon name="clock" className="w-4 h-4" /> Pendentes
                            {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}
                        </button>
                        <button onClick={() => { setFiltroNotas('concluidas'); setPaginaNotasFiscais(1); }} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${filtroNotas === 'concluidas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-circle" className="w-4 h-4" /> Concluídas</button>
                    </div>
                )}

                {abaAtual === 'dashboard' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in flex flex-col gap-8">
                        
                        {/* HERO SECTION */}
                        <div className="relative rounded-md overflow-hidden bg-gradient-to-r from-brand to-brandHover text-white p-8 lg:p-10 shadow-lg shadow-brand/20 border border-white/10 shrink-0">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaDJWMzRoLTI2djIwaDJWMzRoMjB2MjBoMnYtMjBoLTI2di0yaDI2di0yMGgydjIwaC0yNlYxMGgydjIwaDIwVjEwaDJ2MjBoLTI2em0tMjYtMnYtMmgyNnYyaC0yNnptMC00VjEwaDJ2MThoLTI2em0yNiAwaC0yNnYtMmg4YTIgMiAwIDAgMSA0IDBoMTR2MnptLTI2IDEydjIwaDJ2LTIwaC0yNnptMjYgMHYyMGgydi0yMGgtMjZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 drop-shadow-sm">Olá, {usuario?.nome?.split(' ')[0]}!</h1>
                                    <p className="text-white/80 font-medium text-[15px]">Aqui está o seu resumo de tarefas e atividades do dia.</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-md px-5 py-3 flex items-center gap-3 shadow-inner">
                                    <Icon name="calendar" className="w-5 h-5 text-white/90" />
                                    <div className="flex flex-col">
                                        <span className="text-[11px] uppercase tracking-wider font-semibold text-white/70">Hoje</span>
                                        <span className="text-[14px] font-bold text-white leading-tight">
                                            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* METRICS & ALERTS ROW */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                            
                            {/* KPIs */}
                            {(() => {
                                const statusIgnorados = ['Concluída', 'Finalizada', 'Cancelada', 'Abandonada'];
                                const minhasTarefas = pedidos.filter(p => p.responsavel && p.responsavel.toLowerCase().includes(usuario?.nome?.toLowerCase()) && !statusIgnorados.includes(p.status));
                                const tarefasAtrasadas = minhasTarefas.filter(p => {
                                    if(!p.prazo) return false;
                                    const prazo = new Date(p.prazo + 'T23:59:59');
                                    return prazo < new Date();
                                });

                                return (
                                    <>
                                        <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between hover:shadow-lg transition hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-gray-500 dark:text-[#888888] font-bold text-[11px] uppercase tracking-wider mb-1">Minhas Tarefas</h3>
                                                    <p className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight">{minhasTarefas.length}</p>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-md border border-blue-100 dark:border-blue-500/20">
                                                    <Icon name="layout-dashboard" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Tarefas em andamento designadas a você.</p>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between hover:shadow-lg transition hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-gray-500 dark:text-[#888888] font-bold text-[11px] uppercase tracking-wider mb-1">Atrasadas</h3>
                                                    <p className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{tarefasAtrasadas.length}</p>
                                                </div>
                                                <div className="bg-rose-50 dark:bg-rose-500/10 p-3 rounded-md border border-rose-100 dark:border-rose-500/20">
                                                    <Icon name="clock" className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                                </div>
                                            </div>
                                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Ordens de serviço com prazo vencido.</p>
                                        </div>
                                    </>
                                );
                            })()}

                            {/* ALERTS WALL */}
                            <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md p-0 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none flex flex-col overflow-hidden hover:shadow-lg transition lg:col-span-1 row-span-2 relative">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder bg-gray-50/50 dark:bg-darkHover/30 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-[13px] uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Icon name="bell" className="w-4 h-4 text-brand" /> Mural de Avisos
                                    </h3>
                                    {alertasNaoLidos.length > 0 && (
                                        <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">{alertasNaoLidos.length}</span>
                                    )}
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-[250px]">
                                    {alertasNaoLidos.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                            <Icon name="check-circle" className="w-10 h-10 mb-2 text-emerald-500" />
                                            <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">Nenhum aviso pendente.</p>
                                        </div>
                                    ) : (
                                        alertasNaoLidos.map((alerta, idx) => (
                                            <div key={idx} className="bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 flex gap-3 items-start shadow-sm hover:shadow-md hover:bg-rose-50 dark:hover:bg-rose-500/20 transition cursor-pointer backdrop-blur-sm" onClick={() => {
                                                setAbaAtual('producao');
                                                if (alerta.os_id) {
                                                    setBuscaProducaoText(alerta.os_id.toString());
                                                }
                                            }}>
                                                <div className="bg-rose-500/20 p-2 rounded-lg shrink-0 mt-0.5">
                                                    <Icon name="alert-triangle" className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-snug">{alerta.msg}</p>
                                                    <span className="text-[10px] font-bold text-rose-500 mt-1.5 inline-block uppercase tracking-wider hover:underline">Ver Detalhes &rarr;</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* MINHAS TAREFAS LIST */}
                            <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none lg:col-span-2 overflow-hidden flex flex-col hover:shadow-lg transition">
                                <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder bg-gray-50/50 dark:bg-darkHover/30 flex justify-between items-center shrink-0">
                                    <h3 className="font-bold text-[13px] uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Icon name="list" className="w-4 h-4 text-brand" /> Fila de Produção
                                    </h3>
                                    <button onClick={() => setAbaAtual('producao')} className="text-[11px] font-bold text-brand hover:text-brandHover uppercase tracking-wider transition">
                                        Ver Todas &rarr;
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                            <tr className="border-b border-gray-100 dark:border-darkBorder text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                <th className="px-6 py-4">O.S.</th>
                                                <th className="px-6 py-4">Cliente</th>
                                                <th className="px-6 py-4">Serviço</th>
                                                <th className="px-6 py-4">Prazo</th>
                                                <th className="px-6 py-4 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const statusIgnorados = ['Concluída', 'Finalizada', 'Cancelada', 'Abandonada'];
                                                const minhasTarefas = pedidos.filter(p => p.responsavel && p.responsavel.toLowerCase().includes(usuario?.nome?.toLowerCase()) && !statusIgnorados.includes(p.status)).slice(0, 5);

                                                if (minhasTarefas.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                                <div className="flex flex-col items-center justify-center opacity-70">
                                                                    <Icon name="package" className="w-10 h-10 mb-3 text-gray-400" />
                                                                    <p className="text-gray-500 dark:text-gray-400 text-[14px] font-semibold">Oba! Você não tem tarefas pendentes.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return minhasTarefas.map(t => (
                                                    <tr key={t.id} className="border-b border-gray-50 dark:border-darkBorder/50 hover:bg-gray-50/80 dark:hover:bg-darkHover/80 transition group">
                                                        <td className="px-6 py-4 text-[13px] font-bold text-gray-900 dark:text-gray-200">#{t.id}</td>
                                                        <td className="px-6 py-4 text-[13px] font-semibold text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{t.cliente}</td>
                                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-600 dark:text-gray-400 max-w-[250px] truncate">{obterResumoServicos(t.servico)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[11px] font-bold px-2.5 py-1.5 bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-darkBorder shadow-sm">
                                                                {t.prazo ? t.prazo.split('-').reverse().join('/') : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => abrirModalOS(t)} className="opacity-0 group-hover:opacity-100 transition p-2 bg-brand hover:bg-brandHover text-white rounded-md shadow-sm" title="Abrir OS">
                                                                <Icon name="edit-3" className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </main>
                )}

                {abaAtual === 'producao' && (
                    <main className="flex-1 p-6 lg:p-10 mx-auto w-full fade-in flex flex-col h-[calc(100vh-60px)]">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Produção</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie a esteira de pedidos ativos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaProducaoText} onChange={e => setBuscaProducaoText(e.target.value)} placeholder="Pesquisar por cliente, OS ou responsável..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                {buscaProducaoText && (
                                    <button type="button" onClick={() => setBuscaProducaoText('')} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand" title="Limpar Busca"><Icon name="x" className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => { setPedidoEmEdicao(null); setModalAberto(true); }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2"><Icon name="plus" /> Nova O.S.</button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white dark:bg-darkCard rounded border border-gray-200 dark:border-darkBorder overflow-hidden flex flex-col">
                            <div className="overflow-auto custom-scrollbar flex-1">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead className="sticky top-0 z-10 bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase text-center">
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
                                                            <td colSpan="9" className={`px-4 py-2 border-y border-gray-200 dark:border-darkBorder font-semibold tracking-wide uppercase text-[10px] bg-gray-100/50 dark:bg-darkHover/40 ${obterCorStatus(status)}`}>
                                                                {status} — <span className="text-gray-400 dark:text-gray-500">{pedidosDoStatus.length} {pedidosDoStatus.length === 1 ? 'pedido' : 'pedidos'}</span>
                                                            </td>
                                                        </tr>
                                                        {pedidosDoStatus.map(p => (
                                                            <tr key={p.id} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition group text-[13px]">
                                                                <td className="px-4 py-3 font-medium text-gray-400 dark:text-gray-600 text-center"><button type="button" onClick={() => abrirEdicao(p)} className="hover:text-brand transition">#{p.id}</button></td>
                                                                <td className="px-4 py-3"><CustomDatePicker value={p.prazo || ''} onChange={val => atualizarCampoInline(p.id, 'prazo', val)} placeholder="Definir prazo..." className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-[11px] outline-none hover:border-brand transition text-gray-700 dark:text-[#EDEDED]" /></td>
                                                                <td className="px-4 py-3"><MultiSelectDropdown value={p.responsavel} options={RESPONSAVEIS} onChange={(val) => atualizarCampoInline(p.id, 'responsavel', val)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-[11px] outline-none hover:border-brand" /></td>
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
                                                                <td className="px-4 py-3"><InlineDropdown value={p.status} options={opcoesStatusPermitidas} onChange={(val) => atualizarCampoInline(p.id, 'status', val)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2.5 py-1.5 text-[11px] outline-none hover:border-brand" /></td>
                                                                <td className="px-4 py-3 align-middle">
                                                                    <div className="flex items-center justify-center min-h-[32px]">
                                                                        <span className="text-[11px] font-semibold px-2 py-1 bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-[#EDEDED] rounded border border-gray-200 dark:border-darkBorder truncate max-w-[150px] inline-block" title={p.local_producao || 'Berlim'}>{p.local_producao || 'Berlim'}</span>
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
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaOS('abertas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'abertas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="list" className="w-4 h-4" /> Abertas</button>
                        <button onClick={() => setAbaOS('concluidas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'concluidas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-circle" className="w-4 h-4" /> Concluídas</button>
                        <button onClick={() => setAbaOS('finalizadas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'finalizadas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-square" className="w-4 h-4" /> Finalizadas</button>
                        <button onClick={() => setAbaOS('canceladas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'canceladas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="x-circle" className="w-4 h-4" /> Canceladas</button>
                        <button onClick={() => setAbaOS('abandonadas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaOS === 'abandonadas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="alert-triangle" className="w-4 h-4" /> Abandonadas</button>
                    </div>
                )}
                {abaAtual === 'baixa' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Histórico de Notas</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Busque ordens e filtre por período.</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaHistoricoText} onChange={e => setBuscaHistoricoText(e.target.value)} placeholder="Buscar cliente ou OS..." className="w-full bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">De:</span>
                                    <CustomDatePicker value={dataFiltroInicio} onChange={setDataFiltroInicio} placeholder="Início" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">Até:</span>
                                    <CustomDatePicker value={dataFiltroFim} onChange={setDataFiltroFim} placeholder="Fim" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
                                </div>
                                {(dataFiltroInicio || dataFiltroFim || buscaHistoricoText) && (
                                    <button type="button" onClick={() => { setDataFiltroInicio(''); setDataFiltroFim(''); setBuscaHistoricoText(''); }} className="w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md hover:bg-gray-100 dark:hover:bg-darkElevated transition text-gray-400 hover:text-brand" title="Limpar Filtros"><Icon name="x" className="w-4 h-4" /></button>
                                )}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard rounded border border-gray-200 dark:border-darkBorder overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">OS Nº</th>
                                        {isAdmin && <th className="px-6 py-4 w-32">Criado Por</th>}
                                        <th className="px-6 py-4 w-32">Data</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Serviço (Resumo)</th>
                                        <th className="px-6 py-4 w-48">Status</th>
                                        <th className="px-6 py-4 w-36 text-right">Valor Final</th>
                                        <th className="px-6 py-4 w-24 text-center">Imprimir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosHistorico.map(p => {
                                        const trancado = isOperador && p.status === 'Finalizado';
                                        return (
                                            <tr key={p.id} onClick={() => { if (trancado) return; abrirEdicao(p); }} className={`border-b border-gray-100 dark:border-darkBorder transition ${trancado ? 'opacity-30 bg-[#050505] cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-darkHover'}`}>
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-500"><span className="flex items-center gap-1.5">{trancado && <Icon name="lock" className="w-3 h-3 text-red-500" />}#{p.id}</span></td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4">
                                                        <div className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED]">{p.criado_por || '---'}</div>
                                                        <div className="text-[11px] text-gray-400 mt-0.5">{formatarDataExibicao(p.data_pedido)}</div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-[#A1A1AA]">{formatarDataExibicao(p.prazo || p.data_pedido)}</td>
                                                <td className={`px-6 py-4 font-semibold text-[13px] ${isClienteProblema(p.cliente) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-[#EDEDED]'}`}>
                                                    <div className="flex items-center gap-1.5">{p.cliente} {isClienteProblema(p.cliente) && <Icon name="alert-triangle" className="w-4 h-4 text-red-500 shrink-0" title="Cliente Problema" />}</div>
                                                </td>
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-[#A1A1AA] truncate max-w-xs">{obterResumoServicos(p.servico)}</td>
                                                <td className="px-6 py-4"><span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border bg-gray-50 border-gray-200 dark:bg-darkElevated dark:border-darkBorder ${obterCorStatus(p.status)}`}>{p.status}</span></td>
                                                <td className="px-6 py-4 font-semibold text-[13px] text-right text-gray-900 dark:text-[#EDEDED]">R$ {formatarValorFinanceiro(Number(p.valor_total))}</td>
                                                <td className="px-6 py-4 text-center"><button type="button" onClick={(e) => { e.stopPropagation(); imprimirOS(p); }} className="p-2 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition rounded inline-block" title="Imprimir O.S."><Icon name="printer" className="w-5 h-5 inline-block" /></button></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {totalPedidosHistorico > itensPorPagina && (
                                <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard rounded-b-xl">
                                    <span className="text-[13px] text-gray-500">
                                        Mostrando {((paginaHistorico - 1) * itensPorPagina) + 1} a {Math.min(paginaHistorico * itensPorPagina, totalPedidosHistorico)} de {totalPedidosHistorico}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.max(1, p - 1))}
                                            disabled={paginaHistorico === 1}
                                            className="px-3 py-1 text-[13px] font-medium bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >Anterior</button>
                                        <button 
                                            onClick={() => setPaginaHistorico(p => Math.min(Math.ceil(totalPedidosHistorico / itensPorPagina), p + 1))}
                                            disabled={paginaHistorico === Math.ceil(totalPedidosHistorico / itensPorPagina)}
                                            className="px-3 py-1 text-[13px] font-medium bg-gray-100 dark:bg-darkElevated text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Análise de Receitas, Centros de Custo e Performance.</p>
                            </div>
                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">Período De:</span>
                                    <CustomDatePicker value={dataFiltroFinInicio} onChange={setDataFiltroFinInicio} placeholder="Início" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
                                </div>
                                <div className="flex flex-col w-36">
                                    <span className="text-[10px] font-semibold text-gray-500 dark:text-[#888888] uppercase mb-1">Período Até:</span>
                                    <CustomDatePicker value={dataFiltroFinFim} onChange={setDataFiltroFinFim} placeholder="Fim" className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[13px] outline-none hover:border-brand transition" />
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
                                    className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2"
                                >
                                    <Icon name="printer" className="w-4 h-4" /> Exportar CSV
                                </button>
                            </div>
                        </div>

                        {/* SUB-MENU FOI MOVIDO PARA O TOPNAV */}
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
                                if (p.forma === 'PIX' || p.forma === 'Link de Pagamento' || p.forma === 'Boleto') {
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
                                if (p.forma === 'PIX' || p.forma === 'Link de Pagamento' || p.forma === 'Boleto') {
                                    const inst = p.instituicao;
                                    if (!acc[inst]) acc[inst] = 0;
                                    acc[inst] += p.valor;
                                }
                                return acc;
                            }, {});
                            const rankingInstituicaoMesAtual = Object.entries(agrupadoInstituicaoMesAtual).sort((a,b) => b[1] - a[1]);
                            const maxInstituicaoMesAtual = Math.max(...rankingInstituicaoMesAtual.map(i => i[1]), 1);

                            const renderLayer2 = () => {
                                if (rankingLocalMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum local registrado no mês.</p>;
                                return rankingLocalMesAtual.map((loc, index) => renderBarHorizontal(loc[0], loc[1], maxLocalMesAtual, false, colorsLocal[index % colorsLocal.length]));
                            };
                            const renderLayer3 = () => {
                                if (rankingFormaMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum pagamento registrado no mês.</p>;
                                return rankingFormaMesAtual.map((f, index) => renderBarHorizontal(f[0], f[1], maxFormaMesAtual, false, colorsForma[index % colorsForma.length]));
                            };
                            const renderLayer4 = () => {
                                if (rankingInstituicaoMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhuma instituição no mês.</p>;
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
                                    {abaFinanceiro === 'geral' && (
                                        <div className="flex flex-col gap-6 fade-in">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm relative overflow-hidden flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Crescimento (YoY)</span>
                                                <h2 className="text-xl font-black text-gray-900 dark:text-white">R$ {formatarValorFinanceiro(totalAnoAtual)}</h2>
                                            </div>
                                            <div className="mt-2">
                                                <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${crescimentoPercentual >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    <Icon name={crescimentoPercentual >= 0 ? 'trending-up' : 'trending-down'} className="w-3 h-3" />
                                                    {Math.abs(crescimentoPercentual).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-200 dark:border-purple-900/30 shadow-sm relative overflow-hidden flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">Vendas Hoje</span>
                                                <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400">R$ {formatarValorFinanceiro(totalVendasHoje)}</h2>
                                            </div>
                                            <p className="text-[10px] text-purple-500/70 dark:text-purple-400/70 mt-2 font-medium">Pedidos lançados hoje</p>
                                        </div>

                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/30 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Total Pago (Recebido)</span>
                                                <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {formatarValorFinanceiro(totalRecebido)}</h2>
                                            </div>
                                            <p className="text-[10px] text-emerald-500/70 dark:text-emerald-400/70 mt-2 font-medium">Já entrou no caixa</p>
                                        </div>
                                        
                                        <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-200 dark:border-orange-900/30 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider block mb-1">Saldo Devedor (A Receber)</span>
                                                <h2 className="text-2xl font-black text-orange-600 dark:text-orange-400">R$ {formatarValorFinanceiro(totalAReceber)}</h2>
                                            </div>
                                            <p className="text-[10px] text-orange-500/70 dark:text-orange-400/70 mt-2 font-medium">Falta receber</p>
                                        </div>
                                        
                                        <div className="bg-white dark:bg-darkCard p-5 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider block mb-1">Ticket Médio</span>
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
                                                { title: "Faturamento Histórico", content: anosOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : anosOrdenados.map(a => renderBarHorizontal(a.ano, a.bruto, maxBrutoAno, false, 'bg-blue-500')) },
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
                                                { title: `Faturamento (${anoAtual})`, content: mesesOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : mesesOrdenados.map(m => renderBarHorizontal(formatarMesAno(m.mesAno), m.bruto, maxBrutoMes, false, 'bg-emerald-500')) },
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
                                                { title: `Faturamento (${nomeMesAtual})`, content: diasOrdenados.length === 0 ? <p className="text-[11px] text-gray-500 italic">Sem dados.</p> : diasOrdenados.map(d => renderBarHorizontal(formatarDataExibicao(d.dia).substring(0,5), d.bruto, maxBrutoDia, false, 'bg-purple-500')) },
                                                { title: `Local de Produção (${diaAtual})`, content: renderLayer2() },
                                                { title: `Formas de Pagamento (${diaAtual})`, content: renderLayer3() },
                                                { title: `Vendas por Instituição (${diaAtual})`, content: renderLayer4() }
                                            ]}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Receitas por Local (Geral)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Rentabilidade total no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingLocal.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhum local registrado.</p> :
                                                    rankingLocal.map((loc, index) => renderBarHorizontal(loc[0], loc[1], maxLocal, false, colorsLocal[index % colorsLocal.length]))
                                                }
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Formas de Pagamento (Geral)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Como os clientes pagaram no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingForma.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhum pagamento registrado.</p> :
                                                    rankingForma.map((f, index) => renderBarHorizontal(f[0], f[1], maxForma, false, colorsForma[index % colorsForma.length]))
                                                }
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Instituições (Geral)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Volume por conta no período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                                                {rankingInstituicao.length === 0 ? <p className="text-[11px] text-gray-500 italic">Nenhuma instituição registrada.</p> :
                                                    rankingInstituicao.map((i, index) => renderBarHorizontal(i[0], i[1], maxInstituicao, false, colorsInst[index % colorsInst.length]))
                                                }
                                            </div>
                                        </div>

                                        </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'vendas_produto' && (
                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4 fade-in">
                                            <div>
                                                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Vendas por Produto (Catálogo)</h3>
                                                <p className="text-[11px] text-gray-400 mt-0.5">Visão expandida de vendas baseadas nos produtos do sistema referentes ao período filtrado.</p>
                                            </div>
                                            <div className="flex flex-col gap-3 mt-4">
                                                {(() => {
                                                    const agrupadoPorProduto = pedidosFin.reduce((acc, p) => {
                                                        if (!p.servico) return acc;
                                                        const { itens } = desconstruirTextoServico(p.servico);
                                                        
                                                        itens.forEach(item => {
                                                            const id_produto_match = item.id_produto;
                                                            const nomeLimpo = item.nome.trim();
                                                            const valorNum = parseFloat(item.valor.replace(/\./g, '').replace(',', '.')) || 0;
                                                            
                                                            const prod = id_produto_match 
                                                                ? produtos.find(p => String(p.id) === String(id_produto_match)) 
                                                                : produtos.find(prod => prod.nome.toLowerCase() === nomeLimpo.toLowerCase());
                                                            
                                                            const finalName = prod ? prod.nome : nomeLimpo;
                                                            if (!acc[finalName]) acc[finalName] = 0;
                                                            acc[finalName] += valorNum;
                                                        });
                                                        return acc;
                                                    }, {});
                                                    
                                                    const rankingProduto = Object.entries(agrupadoPorProduto).sort((a,b) => b[1] - a[1]);
                                                    const maxProduto = Math.max(...rankingProduto.map(r => r[1]), 1);
                                                    
                                                    if (rankingProduto.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum produto do catálogo faturado no período.</p>;
                                                    
                                                    const top5Nomes = rankingProduto.slice(0, 5).map(r => r[0]);
                                                    const selecionadosAtuais = produtosSelecionadosGrafico || top5Nomes;

                                                    const mesesGrafico = [];
                                                    const dataAtualGrafico = new Date();
                                                    for (let i = 11; i >= 0; i--) {
                                                        const d = new Date(dataAtualGrafico.getFullYear(), dataAtualGrafico.getMonth() - i, 1);
                                                        const m = String(d.getMonth() + 1).padStart(2, '0');
                                                        const y = d.getFullYear();
                                                        mesesGrafico.push(`${y}-${m}`);
                                                    }

                                                    const limiteData = mesesGrafico[0] + '-01';
                                                    const dadosMesProduto = {}; 
                                                    selecionadosAtuais.forEach(prod => {
                                                        dadosMesProduto[prod] = {};
                                                        mesesGrafico.forEach(m => dadosMesProduto[prod][m] = 0);
                                                    });

                                                    pedidos.forEach(p => {
                                                        if (!p.data_pedido || p.data_pedido < limiteData) return;
                                                        if (p.status === 'Cancelado') return;
                                                        if (!p.servico) return;

                                                        const mesAno = p.data_pedido.substring(0, 7);
                                                        if (!mesesGrafico.includes(mesAno)) return;

                                                        const { itens } = desconstruirTextoServico(p.servico);
                                                        itens.forEach(item => {
                                                            const nomeLimpo = item.nome.trim();
                                                            const id_match = item.id_produto;
                                                            const prod = id_match ? produtos.find(pr => String(pr.id) === String(id_match)) : produtos.find(pr => pr.nome.toLowerCase() === nomeLimpo.toLowerCase());
                                                            const finalName = prod ? prod.nome : nomeLimpo;

                                                            if (selecionadosAtuais.includes(finalName)) {
                                                                const valorNum = parseFloat(item.valor.replace(/\./g, '').replace(',', '.')) || 0;
                                                                dadosMesProduto[finalName][mesAno] += valorNum;
                                                            }
                                                        });
                                                    });

                                                    let maxYGrafico = 1;
                                                    selecionadosAtuais.forEach(prod => {
                                                        mesesGrafico.forEach(m => {
                                                            if (dadosMesProduto[prod][m] > maxYGrafico) maxYGrafico = dadosMesProduto[prod][m];
                                                        });
                                                    });
                                                    maxYGrafico = maxYGrafico * 1.1;

                                                    const svgWidth = 1000;
                                                    const svgHeight = 250;
                                                    const padX = 70;
                                                    const padY = 20;
                                                    const stepX = (svgWidth - padX * 2) / (mesesGrafico.length - 1 || 1);
                                                    const hexColors = ["#2D3349", "#76AB3C", "#3b82f6", "#F37020", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#f43f5e", "#84cc16"];
                                                    
                                                    const renderSVG = () => (
                                                        <div className="w-full overflow-x-auto bg-white dark:bg-darkCard rounded-xl p-4 border border-gray-100 dark:border-darkBorder mb-6 relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                                            {selecionadosAtuais.length > 0 ? (
                                                                <>
                                                                    <div className="flex flex-wrap gap-2 mb-6 justify-center px-4">
                                                                        {selecionadosAtuais.map((prod, i) => (
                                                                            <span key={prod} className="text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 bg-gray-50 dark:bg-darkElevated border border-gray-100 dark:border-darkBorder dark:text-gray-200">
                                                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hexColors[i % hexColors.length] }}></span>
                                                                                {prod}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[700px] overflow-visible">
                                                                        {[0, 0.25, 0.5, 0.75, 1].map(f => {
                                                                            const y = svgHeight - padY - f * (svgHeight - padY * 2);
                                                                            return (
                                                                                <g key={f}>
                                                                                    <line x1={padX} y1={y} x2={svgWidth - padX} y2={y} stroke="currentColor" className="text-gray-200/70 dark:text-gray-800/70" strokeDasharray="3 3" />
                                                                                    <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                                                                        R$ {formatarValorFinanceiro(f * (maxYGrafico / 1.1))}
                                                                                    </text>
                                                                                </g>
                                                                            )
                                                                        })}
                                                                        {mesesGrafico.map((m, i) => {
                                                                            const x = padX + i * stepX;
                                                                            const [ano, mes] = m.split('-');
                                                                            return (
                                                                                <g key={m}>
                                                                                    {i > 0 && i < mesesGrafico.length - 1 && (
                                                                                        <line x1={x} y1={padY} x2={x} y2={svgHeight - padY} stroke="currentColor" className="text-gray-200/50 dark:text-gray-800/50" strokeDasharray="2 4" />
                                                                                    )}
                                                                                    <text x={x} y={svgHeight} textAnchor="middle" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                                                                        {mes}/{ano.substring(2)}
                                                                                    </text>
                                                                                </g>
                                                                            );
                                                                        })}
                                                                        {selecionadosAtuais.map((prod, i) => {
                                                                            const color = hexColors[i % hexColors.length];
                                                                            const points = mesesGrafico.map((m, mi) => {
                                                                                const x = padX + mi * stepX;
                                                                                const val = dadosMesProduto[prod][m] || 0;
                                                                                const y = svgHeight - padY - (val / maxYGrafico) * (svgHeight - padY * 2);
                                                                                return `${x},${y}`;
                                                                            }).join(" ");
                                                                            return (
                                                                                <g key={prod}>
                                                                                    <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" className="drop-shadow-sm transition-all duration-500 ease-out" />
                                                                                    {mesesGrafico.map((m, mi) => {
                                                                                        const x = padX + mi * stepX;
                                                                                        const val = dadosMesProduto[prod][m] || 0;
                                                                                        const y = svgHeight - padY - (val / maxYGrafico) * (svgHeight - padY * 2);
                                                                                        return <circle key={m} cx={x} cy={y} r="3.5" fill="white" stroke={color} strokeWidth="2" className="transition-all duration-500 ease-out" />;
                                                                                    })}
                                                                                </g>
                                                                            );
                                                                        })}
                                                                    </svg>
                                                                </>
                                                            ) : (
                                                                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-[13px] italic font-medium">Nenhum produto selecionado para gerar o gráfico.</div>
                                                            )}
                                                        </div>
                                                    );

                                                    const toggleProduto = (nome) => {
                                                        let list = [...selecionadosAtuais];
                                                        if (list.includes(nome)) {
                                                            list = list.filter(n => n !== nome);
                                                        } else {
                                                            list.push(nome);
                                                        }
                                                        setProdutosSelecionadosGrafico(list);
                                                    };

                                                    return (
                                                        <>
                                                            {renderSVG()}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-3">
                                                                {rankingProduto.map((r, index) => {
                                                                    const isSelected = selecionadosAtuais.includes(r[0]);
                                                                    const selectedIndex = selecionadosAtuais.indexOf(r[0]);
                                                                    const colorIndicator = isSelected ? hexColors[selectedIndex % hexColors.length] : 'transparent';
                                                                    
                                                                    return (
                                                                        <div key={index} onClick={() => toggleProduto(r[0])} className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer transition border ${isSelected ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-darkHover shadow-sm' : 'border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkElevated'}`}>
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <div className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded border border-gray-300 dark:border-gray-600 transition-colors" style={{ backgroundColor: colorIndicator, borderColor: isSelected ? colorIndicator : '' }}>
                                                                                        {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
                                                                                    </div>
                                                                                    <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate" title={r[0]}>{r[0]}</div>
                                                                                </div>
                                                                                <div className="text-right text-[11px] font-black text-gray-900 dark:text-white whitespace-nowrap">R$ {formatarValorFinanceiro(r[1])}</div>
                                                                            </div>
                                                                            <div className="w-full bg-gray-200 dark:bg-darkBg rounded-full h-1.5 overflow-hidden relative">
                                                                                <div className={`h-full transition-all duration-1000 ease-out opacity-90`} style={{ width: `${(r[1] / maxProduto) * 100}%`, backgroundColor: isSelected ? colorIndicator : '#9ca3af' }}></div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'contas_pagar' && (
                                        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4 fade-in">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Contas a Pagar</h3>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">Gerencie as despesas da empresa.</p>
                                                </div>
                                                <button onClick={() => { setNovaConta({ id: null, descricao: '', valor: '', vencimento: '', status: 'Pendente' }); setModalContaAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                                    <Icon name="plus" className="w-4 h-4" /> Nova Conta
                                                </button>
                                            </div>
                                            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden mt-4">
                                                <div className="overflow-x-auto min-h-[300px]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                                <th className="px-6 py-4">Vencimento</th>
                                                                <th className="px-6 py-4">Descrição</th>
                                                                <th className="px-6 py-4">Valor</th>
                                                                <th className="px-6 py-4">Status</th>
                                                                <th className="px-6 py-4 text-right">Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                                            {contasPagar.length === 0 ? (
                                                                <tr><td colSpan="5" className="text-center py-8 text-gray-400">Nenhuma conta a pagar registrada.</td></tr>
                                                            ) : (
                                                                contasPagar.map(conta => (
                                                                    <tr key={conta.id} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors group">
                                                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-[#A1A1AA]">{formatarDataExibicao(conta.vencimento)}</td>
                                                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-gray-300">{conta.descricao}</td>
                                                                        <td className="px-6 py-4 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">R$ {formatarValorFinanceiro(conta.valor)}</td>
                                                                        <td className="px-6 py-4 text-[13px]">
                                                                            <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${conta.status === 'Pago' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
                                                                                {conta.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                                                            <button onClick={() => { setNovaConta(conta); setModalContaAberto(true); }} className="p-1.5 text-gray-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-darkHover rounded transition opacity-0 group-hover:opacity-100" title="Editar">
                                                                                <Icon name="edit-2" className="w-4 h-4" />
                                                                            </button>
                                                                            <button onClick={() => excluirConta(conta.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition opacity-0 group-hover:opacity-100" title="Excluir">
                                                                                <Icon name="trash-2" className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'contas_receber' && (
                                        <div className="fade-in">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Icon name="dollar-sign" className="w-5 h-5 text-emerald-500" /> Contas a Receber</h2>
                                                    <p className="text-[13px] text-gray-500 mt-1">Pedidos com pagamento via Boleto</p>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                                                <div className="overflow-x-auto min-h-[300px]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                                <th className="px-6 py-4">O.S. / Cliente</th>
                                                                <th className="px-6 py-4">Serviço</th>
                                                                <th className="px-6 py-4 text-center">Data Pedido</th>
                                                                <th className="px-6 py-4 text-center">Status</th>
                                                                <th className="px-6 py-4">Status Pagamento</th>
                                                                <th className="px-6 py-4 text-right">Valor Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                                            {(() => {
                                                                const pedidosBoleto = pedidos.filter(p => Array.isArray(p.pagamentos) && p.pagamentos.some(pag => pag.forma === 'Boleto'));
                                                                if (pedidosBoleto.length === 0) return (
                                                                    <tr><td colSpan="6" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhum pedido com boleto encontrado.</td></tr>
                                                                );
                                                                return pedidosBoleto.map(p => {
                                                                    const totalPago = p.pagamentos.reduce((acc, pg) => acc + (parseFloat(String(pg.valor).replace(/\./g, '').replace(',', '.')) || 0), 0);
                                                                    const totalGeral = parseFloat(String(p.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                                                    const pagoPercent = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;
                                                                    return (
                                                                        <tr key={p.id} onClick={() => abrirEdicao(p)} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors cursor-pointer group">
                                                                            <td className="px-6 py-4">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 w-8">#{p.id}</span>
                                                                                    <span className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED] truncate max-w-[200px]" title={p.cliente}>{p.cliente}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4">
                                                                                <div className="text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-[250px]" title={p.servico}>{p.servico}</div>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-[13px] text-center text-gray-500">{formatarDataExibicao(p.data_pedido)}</td>
                                                                            <td className="px-6 py-4 text-center">
                                                                                <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${statusColors[p.status] || 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}>
                                                                                    {p.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-[13px]">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shrink-0"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, pagoPercent)}%` }}></div></div>
                                                                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{totalPago >= totalGeral ? 'Pago' : `${Math.floor(pagoPercent)}%`}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-[13px] font-bold text-gray-900 dark:text-white text-right whitespace-nowrap">R$ {p.valor_total}</td>
                                                                        </tr>
                                                                    );
                                                                });
                                                            })()}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {abaFinanceiro === 'empresas_aprovadas' && (
                                        <div className="fade-in">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Icon name="check-circle" className="w-5 h-5 text-blue-500" /> Faturamento Aprovado</h2>
                                                    <p className="text-[13px] text-gray-500 mt-1">Gerencie as empresas com faturamento aprovado</p>
                                                </div>
                                                <button onClick={() => setModalEmpresaFaturamentoAberto(true)} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                                    <Icon name="plus" /> Adicionar Empresa
                                                </button>
                                            </div>

                                            <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                                                <div className="overflow-x-auto min-h-[300px]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                                            <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                                                <th className="px-6 py-4">Empresa</th>
                                                                <th className="px-6 py-4">CNPJ/CPF</th>
                                                                <th className="px-6 py-4 text-center">Status</th>
                                                                <th className="px-6 py-4 text-right">Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                                            {empresasFaturamento.length === 0 ? (
                                                                <tr><td colSpan="4" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhuma empresa cadastrada.</td></tr>
                                                            ) : (
                                                                empresasFaturamento.map(emp => (
                                                                    <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors group">
                                                                        <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-white">{emp.nome}</td>
                                                                        <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{emp.cnpj}</td>
                                                                        <td className="px-6 py-4 text-center">
                                                                            <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded border ${emp.status === 'Aprovado' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' : 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'}`}>
                                                                                {emp.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                                                            <button onClick={() => { setNovaEmpresaFaturamento(emp); setModalEmpresaFaturamentoAberto(true); }} className="p-1.5 text-gray-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-darkHover rounded transition opacity-0 group-hover:opacity-100" title="Editar">
                                                                                <Icon name="edit-2" className="w-4 h-4" />
                                                                            </button>
                                                                            <button onClick={() => excluirEmpresaFaturamento(emp.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition opacity-0 group-hover:opacity-100" title="Excluir">
                                                                                <Icon name="trash-2" className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </main>
                )}

                {abaAtual === 'orcamentos' && abaOrcamentos === 'formalizados' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Orçamentos Formalizados</h1>
                                <p className="text-[13px] text-gray-500 mt-1.5 font-medium max-w-xl">
                                    Crie e gerencie orçamentos. Transforme orçamentos aprovados em Ordens de Serviço.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setOrcamentoFormalizadoEmEdicao(null);
                                    setBuscaCliente('');
                                    setItensPedido([]);
                                    setNovoPedido({
                                        cliente: '',
                                        servico: '',
                                        valor_total: '',
                                        status: 'Orçamento',
                                        data_pedido: obterDataAtual(),
                                        prazo: '',
                                        responsavel: '',
                                        entrega: false,
                                        urgente: false
                                    });
                                    setModalOrcamentoFormalizadoAberto(true);
                                }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" /> Novo Orçamento
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="overflow-x-auto min-h-[300px]">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Criado por</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Valor</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-darkBorder">
                                        {orcamentosFormalizados.map(orc => (
                                            <tr key={orc.id} onClick={() => abrirEdicaoOrcamento(orc)} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-gray-300">#{orc.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[13px] font-semibold text-gray-800 dark:text-[#EDEDED]">{orc.criado_por || '---'}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">{new Date(orc.created_at).toLocaleDateString('pt-BR')}</div>
                                                </td>
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-gray-300">{orc.cliente}</td>
                                                <td className="px-6 py-4 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">R$ {formatarMoeda((orc.valor * 100).toFixed(0).toString())}</td>
                                                <td className="px-6 py-4 text-[13px] text-right flex justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); transformarEmOS(orc); }} className="px-3 py-1.5 text-[11px] font-bold bg-orange-500 hover:bg-orange-600 text-white rounded transition flex items-center gap-1.5 shadow-sm" title="Transformar em O.S.">
                                                        <Icon name="arrow-right-circle" className="w-3.5 h-3.5" />
                                                        Transformar em O.S.
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); baixarPDFOrcamento(orc); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition opacity-0 group-hover:opacity-100" title="Baixar PDF">
                                                        <Icon name="file-text" className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); abrirEdicaoOrcamento(orc); }} className="p-1.5 text-gray-400 hover:text-brand hover:bg-gray-100 dark:hover:bg-darkHover rounded transition opacity-0 group-hover:opacity-100" title="Editar">
                                                        <Icon name="edit-2" className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); excluirOrcamentoFormalizado(orc.id); }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition opacity-0 group-hover:opacity-100" title="Excluir">
                                                        <Icon name="trash-2" className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {orcamentosFormalizados.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-12 text-center text-[13px] text-gray-400">Nenhum orçamento formalizado encontrado.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                )}

                {abaAtual === 'orcamentos' && abaOrcamentos === 'pre_prontos' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Textos Pré Prontos</h1>
                                <p className="text-[13px] text-gray-500 mt-1.5 font-medium max-w-xl">
                                    Modelos de texto para orçamentos rápidos (Visíveis para a produção, editáveis apenas por Admin).
                                </p>
                            </div>
                            {isAdmin && (
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        setNovoOrcamentoPre({ id: null, titulo: '', texto: '' });
                                        setModalOrcamentoPreAberto(true);
                                    }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                        <Icon name="plus" /> Novo Texto
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orcamentosPreProntos.map(orc => (
                                <div key={orc.id} className="bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-5 flex flex-col gap-3 group">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{orc.titulo}</h3>
                                        {isAdmin && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setNovoOrcamentoPre(orc); setModalOrcamentoPreAberto(true); }} className="p-1 text-gray-400 hover:text-brand"><Icon name="edit-2" className="w-4 h-4" /></button>
                                                <button onClick={() => excluirOrcamentoPre(orc.id)} className="p-1 text-gray-400 hover:text-red-500"><Icon name="trash-2" className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                    <pre className="text-[13px] text-gray-600 dark:text-[#A1A1AA] whitespace-pre-wrap font-sans bg-gray-50 dark:bg-darkElevated p-3 rounded-lg flex-1">
                                        {orc.texto}
                                    </pre>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(orc.texto);
                                        alert('Texto copiado!');
                                    }} className="mt-2 text-[11px] font-semibold text-brand hover:underline flex items-center gap-1 self-start">
                                        <Icon name="copy" className="w-3 h-3" /> Copiar Texto
                                    </button>
                                </div>
                            ))}
                        </div>
                    </main>
                )}


                {abaAtual === 'cadastros' && abaCadastros === 'produtos' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Catálogo</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie os serviços, itens e preços base para orçamentos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaCadProdutos} onChange={e => setBuscaCadProdutos(e.target.value)} placeholder="Buscar produto..." className="w-56 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                <button onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Produto
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">ID</th>
                                        <th className="px-6 py-4">Nome do Produto</th>
                                        <th className="px-6 py-4">Descrição Base</th>
                                        <th className="px-6 py-4 w-36 text-right">Preço Base</th>
                                        <th className="px-6 py-4 w-24 text-center">Excluir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtosCatalogoFiltrados.map((p, index) => (
                                        <tr 
                                            key={p.id} 
                                            draggable
                                            onDragStart={(e) => handleDragStartProduto(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleDropProduto(e, index)}
                                            onClick={() => abrirEdicaoProduto(p)} 
                                            className={`border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition cursor-pointer group ${draggedProdutoIndex === index ? 'opacity-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300 cursor-grab active:cursor-grabbing">
                                                <Icon name="list" className="w-4 h-4 inline-block mr-2 opacity-50" />
                                                #{p.id}
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-medium text-gray-800 dark:text-white">{p.nome}</td>
                                            <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-xs">{p.texto_padrao}</td>
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300 text-right">R$ {formatarValorFinanceiro(Number(p.preco_base))}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button type="button" onClick={(e) => excluirProduto(p.id, e)} className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30" title="Excluir Produto">
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

                {abaAtual === 'cadastros' && abaCadastros === 'clientes' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Clientes</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Base de dados e informações de contato dos seus clientes.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaCadClientes} onChange={e => setBuscaCadClientes(e.target.value)} placeholder="Buscar cliente..." className="w-56 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                </div>
                                <button onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Cliente
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-darkBorder flex flex-wrap gap-1.5 items-center justify-center sm:justify-start">
                                <button onClick={() => { setLetraFiltroCliente(''); setPaginaClientes(1); }} className={`px-2 py-1 text-[11px] font-semibold rounded border ${!letraFiltroCliente ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-darkCard text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover'}`}>Todas</button>
                                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letra => (
                                    <button key={letra} onClick={() => { setLetraFiltroCliente(letra); setPaginaClientes(1); }} className={`px-2 py-1 text-[11px] font-semibold rounded border ${letraFiltroCliente === letra ? 'bg-brand text-white border-brand' : 'bg-white dark:bg-darkCard text-gray-600 dark:text-gray-300 border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover'}`}>{letra}</button>
                                ))}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand"><tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"><th className="px-6 py-4">Cliente</th><th className="px-6 py-4 w-48">WhatsApp</th><th className="px-6 py-4 w-64">E-mail</th><th className="px-6 py-4">Observações</th><th className="px-6 py-4 w-24 text-center">Ações</th></tr></thead>
                                <tbody>
                                    {clientesPaginados.length > 0 ? clientesPaginados.map(c => (
                                        <tr key={c.id} onClick={() => abrirEdicaoCliente(c)} className="border-b border-gray-100 dark:border-darkBorder/50 hover:bg-gray-50/50 dark:hover:bg-darkHover/50 transition cursor-pointer"><td className={`px-6 py-4 text-[13px] font-semibold ${c.cliente_problema ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-300'}`}>{c.nome} {c.cliente_problema && <Icon name="alert-triangle" className="w-3.5 h-3.5 inline text-red-500 ml-1" title="Cliente Problema" />}</td><td className="px-6 py-4 text-[13px] font-medium text-gray-800 dark:text-white">{c.telefone || '---'}</td><td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{c.email || '---'}</td><td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400 truncate max-w-xs">{c.observacoes || '---'}</td><td className="px-6 py-4 text-center"><button type="button" onClick={(e) => { e.stopPropagation(); if(confirm(`Excluir o cliente ${c.nome}?`)) { supabase.from('clientes').delete().eq('id', c.id).then(() => carregarDados()); } }} className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30" title="Excluir Cliente"><Icon name="trash-2" className="w-4 h-4" /></button></td></tr>
                                    )) : (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-[#A1A1AA]">Nenhum cliente encontrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPaginasClientes > 1 && (
                            <div className="mt-6 flex justify-between items-center p-4">
                                <button onClick={() => setPaginaClientes(Math.max(1, paginaClientes - 1))} disabled={paginaClientes === 1} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Anterior</button>
                                <span className="text-[13px] font-semibold dark:text-white">Página {paginaClientes} de {totalPaginasClientes}</span>
                                <button onClick={() => setPaginaClientes(Math.min(totalPaginasClientes, paginaClientes + 1))} disabled={paginaClientes === totalPaginasClientes} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Próxima</button>
                            </div>
                        )}
                    </main>
                )}

                {abaAtual === 'notas_fiscais' && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro' || usuario?.nivel === 'Produção/Atendimento') && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Notas Fiscais {filtroNotas === 'pendentes' ? 'Pendentes' : 'Concluídas'}</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">{filtroNotas === 'pendentes' ? 'Notas enviadas pelos clientes aguardando processamento.' : 'Histórico de notas já emitidas e processadas.'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative w-full lg:w-64">
                                    <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nome, razão ou CNPJ..." 
                                        value={buscaNotaFiscal} 
                                        onChange={(e) => { setBuscaNotaFiscal(e.target.value); setPaginaNotasFiscais(1); }}
                                        className="w-full pl-9 pr-4 py-1.5 h-[38px] text-[13px] border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard rounded-md focus:outline-none focus:ring-2 focus:ring-brand dark:text-white transition"
                                    />
                                </div>
                                {/* BOTOES FILTRONOTAS MOVIDOS PARA O TOPNAV */}
                                <div className="flex rounded-md shadow-sm">
                                    <a href="/solicitar-nota.html" target="_blank" className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-l-md font-semibold transition flex items-center gap-2 border border-brand border-r-0">
                                        <Icon name="external-link" className="w-4 h-4" /> Formulário
                                    </a>
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/solicitar-nota.html'); alert('Link copiado!'); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-3 rounded-r-md font-semibold transition flex items-center gap-2 border border-brand border-l border-l-white/20" title="Copiar Link">
                                        <Icon name="copy" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                        <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                            <th className="px-6 py-4 w-28">Data</th>
                                            <th className="px-6 py-4 w-48">Cliente / Razão Social</th>
                                            <th className="px-6 py-4 w-36">CPF / CNPJ</th>
                                            <th className="px-6 py-4 min-w-[300px]">Serviço / Valor</th>
                                            <th className="px-6 py-4 w-24 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notasFiscaisPaginadas.map(n => (
                                            <tr key={n.id} className="border-b border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover transition">
                                                <td className="px-4 py-3 text-[13px] dark:text-[#EDEDED] whitespace-nowrap">{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-[13px] font-semibold dark:text-[#EDEDED]">{n.cliente || 'Sem Identificação'}</div>
                                                    <div className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">{n.razao_social}</div>
                                                </td>
                                                <td className="px-4 py-3 text-[13px] dark:text-[#EDEDED] whitespace-nowrap">{n.cnpj}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-[13px] dark:text-[#EDEDED]">{n.servico_feito || <span className="text-gray-400 italic">Pendente</span>}</div>
                                                    <div className="text-[11px] font-semibold text-orange-500 dark:text-orange-400">{n.valor_pago ? `R$ ${parseFloat(n.valor_pago).toFixed(2).replace('.', ',')}` : ''}</div>
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
                                    <button onClick={() => setPaginaNotasFiscais(Math.max(1, paginaNotasFiscais - 1))} disabled={paginaNotasFiscais === 1} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Anterior</button>
                                    <span className="text-[13px] font-semibold dark:text-white">Página {paginaNotasFiscais} de {totalPaginasNotasFiscais}</span>
                                    <button onClick={() => setPaginaNotasFiscais(Math.min(totalPaginasNotasFiscais, paginaNotasFiscais + 1))} disabled={paginaNotasFiscais === totalPaginasNotasFiscais} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 dark:border-darkBorder rounded hover:bg-gray-50 dark:hover:bg-darkHover disabled:opacity-50 dark:text-white transition">Próxima</button>
                                </div>
                            )}
                        </div>
                    </main>
                )}

                {abaAtual === 'cadastros' && abaCadastros === 'usuarios' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Usuários do Sistema</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie os acessos da equipe (Administrador, Produção/Atendimento, Financeiro).</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoUsuario({ id: null, nome: '', senha: '', nivel: 'Produção/Atendimento' }); setModalUsuarioAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Usuário
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand"><tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase"><th className="px-6 py-4">Nome do Usuário</th><th className="px-6 py-4 w-48 text-right">Nível de Acesso</th></tr></thead>
                                <tbody>
                                    {usuariosSistema.map(u => (
                                        <tr key={u.id} onClick={() => abrirEdicaoUsuario(u)} className="border-b border-gray-100 dark:border-darkBorder/50 hover:bg-gray-50/50 dark:hover:bg-darkHover/50 transition cursor-pointer">
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300">{u.nome}</td>
                                            <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300 text-right">
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

                {abaAtual === 'cadastros' && abaCadastros === 'fornecedores' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                            <div>
                                <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Fornecedores e Locais</h1>
                                <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Gerencie os locais de produção e fornecedores externos.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoFornecedor({ id: null, nome: '', contato: '', observacoes: '' }); setModalFornecedorAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Fornecedor
                                </button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                                    <tr className="border-b border-gray-200 dark:border-darkBorder text-[13px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                                        <th className="px-6 py-4 w-24">ID</th>
                                        <th className="px-6 py-4">Nome do Fornecedor / Local</th>
                                        <th className="px-6 py-4">Contato</th>
                                        <th className="px-6 py-4">Observações</th>
                                        <th className="px-6 py-4 w-24 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fornecedores.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-[13px] text-gray-400 dark:text-gray-500">
                                                Nenhum fornecedor cadastrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        fornecedores.map(f => (
                                            <tr key={f.id} onClick={() => { setNovoFornecedor(f); setModalFornecedorAberto(true); }} className="border-b border-gray-100 dark:border-darkBorder/50 hover:bg-gray-50/50 dark:hover:bg-darkHover/50 transition cursor-pointer">
                                                <td className="px-6 py-4 text-[13px] font-semibold text-gray-900 dark:text-gray-300">#{f.id}</td>
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-800 dark:text-white">{f.nome}</td>
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{f.contato || '-'}</td>
                                                <td className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-400">{f.observacoes || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button type="button" onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if(confirm(`Excluir o fornecedor ${f.nome}?`)) {
                                                            await supabase.from('fornecedores').delete().eq('id', f.id);
                                                            carregarDados();
                                                        }
                                                    }} className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30" title="Excluir Fornecedor">
                                                        <Icon name="trash-2" className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </main>
                )}
                {abaAtual === 'calculadoras' && <CalculadorasAba calculadoraAtiva={calculadoraAtiva} produtos={produtos} />}
            </div>

            {modalAberto && (
                <div onClick={fecharModalOS} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-3xl rounded border border-gray-200 dark:border-darkBorder shadow-2xl flex flex-col max-h-[95vh] cursor-default overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-xl tracking-tight">
                                    {pedidoEmEdicao ? 'Editar Ordem de Serviço #' + pedidoEmEdicao.id : 'Nova Ordem de Serviço'}
                                </h3>
                                {isModalTrancado && <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded"><Icon name="lock" className="w-3 h-3" /> Trancado</span>}
                            </div>
                            <button type="button" onClick={fecharModalOS} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5" /></button>
                        </div>
                        
                        <form onSubmit={(e) => salvarOS(e, false)} className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            {isModalTrancado && <div className="p-3 bg-red-950/20 border border-red-900/50 rounded text-[11px] text-red-400 mb-2">Nota liquidada. Peça para um Admin ou Financeiro destravar para edições.</div>}
                            
                            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-100 dark:border-darkBorder">
                                <div>
                                    <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Data da Venda</label>
                                    <CustomDatePicker value={novoPedido.data_pedido} onChange={val => setNovoPedido({...novoPedido, data_pedido: val})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Prazo</label>
                                    <CustomDatePicker value={novoPedido.prazo} onChange={val => setNovoPedido({...novoPedido, prazo: val})} disabled={isModalTrancado} placeholder="Data final..." className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Status Inicial</label>
                                    <div className="relative">
                                        <select required value={novoPedido.status} onChange={e => setNovoPedido({...novoPedido, status: e.target.value})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2.5 text-[13px] outline-none focus:border-brand transition dark:text-white font-semibold cursor-pointer appearance-none disabled:opacity-50">
                                            {opcoesStatusPermitidas.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <Icon name="chevron-down" className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Resp.</label>
                                    <MultiSelectDropdown 
                                        value={novoPedido.responsavel} 
                                        options={RESPONSAVEIS} 
                                        onChange={val => setNovoPedido({...novoPedido, responsavel: val})} 
                                        disabled={isModalTrancado} 
                                        className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Tags Especiais</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button type="button" onClick={() => setNovoPedido({...novoPedido, entrega: !novoPedido.entrega})} disabled={isModalTrancado} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-[11px] font-semibold transition disabled:opacity-50 ${novoPedido.entrega ? 'text-white bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700' : 'bg-gray-100 text-gray-500 dark:bg-darkElevated dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkHover'}`}><Icon name="package" className="w-4 h-4"/> Entrega</button>
                                        <button type="button" onClick={() => setNovoPedido({...novoPedido, urgente: !novoPedido.urgente})} disabled={isModalTrancado} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-[11px] font-semibold transition disabled:opacity-50 ${novoPedido.urgente ? 'text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700' : 'bg-gray-100 text-gray-500 dark:bg-darkElevated dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkHover'}`}><Icon name="alert-triangle" className="w-3.5 h-3.5"/> Urgente</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Cliente / Empresa</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input required type="text" value={buscaCliente} disabled={isModalTrancado}
                                            onChange={e => { setBuscaCliente(e.target.value); setNovoPedido({...novoPedido, cliente: e.target.value}); setClienteDropdownAberto(true); }}
                                            onFocus={() => { if(!isModalTrancado) setClienteDropdownAberto(true); }} onBlur={() => setTimeout(() => setClienteDropdownAberto(false), 200)}
                                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Buscar cliente..." autoComplete="off" />
                                        <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        {clienteDropdownAberto && clientesFiltrados.length > 0 && (
                                            <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                {clientesFiltrados.map(c => (
                                                    <li key={c.id} onClick={() => { setBuscaCliente(c.nome); setNovoPedido({...novoPedido, cliente: c.nome}); setClienteDropdownAberto(false); }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex justify-between items-center transition"><span className="font-medium text-[13px] text-gray-800 dark:text-[#EDEDED]">{c.nome}</span><span className="text-[11px] text-gray-500">{c.telefone}</span></li>
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
                                            <span className="text-[13px] font-semibold block">Atenção: Cliente Problemático</span>
                                            <span className="text-[11px]">Este cliente possui restrições ou histórico negativo na empresa. Fique atento.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium mb-3 text-gray-700 dark:text-[#EDEDED]">Carrinho de Itens do Orçamento</label>
                                {itensPedido.length > 0 ? (
                                    <div className="mb-4 flex flex-col gap-2">
                                        {itensPedido.map((item, index) => (
                                            <div key={item.id_temp} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded shadow-sm">
                                                <div className="flex flex-col"><span className="font-semibold text-[13px] dark:text-white">{index + 1}. {item.nome || 'Serviço Personalizado'}</span><span className="text-[11px] text-gray-500 dark:text-[#A1A1AA] whitespace-pre-wrap mt-1">{item.descricao}</span>{item.local_producao && <span className="text-[10px] bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded mt-1.5 w-max">Local: {item.local_producao}</span>}</div>
                                                <div className="flex items-center gap-4"><div className="text-right"><span className="font-semibold text-[13px] dark:text-white">R$ {item.valor}</span>{item.desconto && <span className="block text-[10px] text-brand font-medium">-{item.desconto}% desc</span>}</div><button type="button" disabled={isModalTrancado} onClick={() => removerItemDoCarrinho(item.id_temp)} className="text-gray-400 hover:text-red-500 transition disabled:opacity-30"><Icon name="trash-2" className="w-4 h-4" /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-gray-500 dark:text-[#666] mb-4 italic">Nenhum item adicionado de forma estruturada.</p>
                                )}

                                <div className="p-4 border border-dashed border-gray-300 dark:border-darkBorder rounded bg-transparent">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input type="text" value={buscaProduto} disabled={isModalTrancado} 
                                                    onChange={e => { setBuscaProduto(e.target.value); setProdutoDropdownAberto(true); }}
                                                    onFocus={() => { if(!isModalTrancado) setProdutoDropdownAberto(true); }} onBlur={() => setTimeout(() => setProdutoDropdownAberto(false), 200)}
                                                    className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Puxar item do catálogo (Opcional)..." autoComplete="off" />
                                                <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                {produtoDropdownAberto && produtosFiltrados.length > 0 && (
                                                    <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                        {produtosFiltrados.map(p => (
                                                            <li key={p.id} onClick={() => { 
                                                                setBuscaProduto(p.nome);
                                                                setItemAtual({ ...itemAtual, nome: p.nome, descricao: p.texto_padrao, valor: formatarMoeda((p.preco_base * 100).toFixed(0).toString()), desconto: '', id_produto: p.id }); 
                                                                setProdutoDropdownAberto(false); 
                                                            }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex flex-col transition">
                                                                <div className="flex justify-between items-center"><span className="font-medium text-[13px] dark:text-[#EDEDED]">{p.nome}</span><span className="text-[11px] font-semibold text-brand">R$ {formatarValorFinanceiro(Number(p.preco_base))}</span></div>
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

                                        <textarea rows="2" value={itemAtual.descricao} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Especificações do item (Ex: Medida, quantidade, material...)"></textarea>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="relative col-span-2">
                                                <span className="absolute left-3 top-2.5 text-[11px] text-gray-400 font-medium">Local:</span>
                                                <select value={itemAtual.local_producao} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, local_producao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-[52px] pr-8 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium appearance-none disabled:opacity-50">
                                                    {(fornecedores.length > 0 ? fornecedores.map(f => f.nome) : ['Berlim']).map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-2.5 text-[11px] text-gray-400">R$</span>
                                                <input type="text" value={itemAtual.valor} disabled={isModalTrancado} onChange={e => setItemAtual({...itemAtual, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-7 pr-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium disabled:opacity-50" placeholder="Bruto" />
                                            </div>
                                            <div><input type="text" value={itemAtual.desconto} disabled={isModalTrancado} onChange={e => { let val = e.target.value.replace(/\D/g, ''); if (parseFloat(val) > 100) val = '100'; setItemAtual({...itemAtual, desconto: val}); }} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] disabled:opacity-50" placeholder="Desc. %" /></div>
                                        </div>
                                        <button type="button" onClick={adicionarItemAoCarrinho} disabled={!itemAtual.descricao || !itemAtual.valor || isModalTrancado} className="w-full mt-3 px-3 py-2 text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-darkHover dark:hover:bg-darkBorder text-gray-800 dark:text-white rounded border border-gray-200 dark:border-darkBorder transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5"/> Inserir Item no Orçamento</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-darkBorder">
                                <label className="block text-[13px] font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Histórico de Pagamentos</label>
                                {pagamentosPedido.length > 0 && (
                                    <div className="mb-3 flex flex-col gap-2">
                                        {pagamentosPedido.map((pag, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-darkElevated px-3 py-2 rounded border border-gray-100 dark:border-darkBorder">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-medium dark:text-white">{pag.forma} {pag.parcelas > 1 ? `(${pag.parcelas}x)` : ''}</span>
                                                    {pag.vencimento_boleto && (
                                                        <span className="text-[11px] text-orange-500 font-semibold ml-2">Vencimento: {pag.vencimento_boleto.split('-').reverse().join('/')}</span>
                                                    )}
                                                    <span className="text-[11px] text-gray-500 ml-2">{pag.data}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-[13px] text-emerald-600 dark:text-emerald-400">R$ {pag.valor}</span>
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
                                            <div className="mb-4 flex justify-between items-center text-[13px]">
                                                <span className="text-gray-600 dark:text-gray-400">Total Pago: <strong className="text-emerald-600">R$ {formatarValorFinanceiro(totalPago)}</strong></span>
                                                <span className="text-gray-600 dark:text-gray-400">Saldo Devedor: <strong className={saldo > 0 ? "text-red-500" : "text-gray-400"}>R$ {formatarValorFinanceiro(saldo)}</strong></span>
                                            </div>

                                            {!isModalTrancado && saldo > 0 && (
                                                <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded mb-4">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <select value={novoPagamento.forma} onChange={e => setNovoPagamento({...novoPagamento, forma: e.target.value})} className="bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none">
                                                            <option value="PIX">PIX</option>
                                                            <option value="Boleto">Boleto</option>
                                                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                                                            <option value="Cartão de Débito">Cartão de Débito</option>
                                                            <option value="Dinheiro">Dinheiro</option>
                                                            <option value="Link de Pagamento">Link de Pagamento</option>
                                                        </select>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-[10px] text-gray-400">R$</span>
                                                            <input type="text" value={novoPagamento.valor} onChange={e => setNovoPagamento({...novoPagamento, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded pl-6 pr-2 py-1.5 text-[11px] outline-none" placeholder="Valor" />
                                                        </div>
                                                    </div>
                                                    {(novoPagamento.forma === 'PIX' || novoPagamento.forma === 'Link de Pagamento') && (
                                                        <div>
                                                            <select value={novoPagamento.instituicao} onChange={e => setNovoPagamento({...novoPagamento, instituicao: e.target.value})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none">
                                                                <option value="Itaú">Itaú</option>
                                                                <option value="Infinite Pay">Infinite Pay</option>
                                                                <option value="Pag Seguro">Pag Seguro</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {(novoPagamento.forma === 'Cartão de Crédito' || novoPagamento.forma === 'Link de Pagamento') && (
                                                        <div>
                                                            <select value={novoPagamento.parcelas} onChange={e => setNovoPagamento({...novoPagamento, parcelas: parseInt(e.target.value)})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none">
                                                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x</option>)}
                                                            </select>
                                                        </div>
                                                    )}
                                                    {novoPagamento.forma === 'Boleto' && (
                                                        <div>
                                                            <input type="date" value={novoPagamento.vencimento_boleto} onChange={e => setNovoPagamento({...novoPagamento, vencimento_boleto: e.target.value})} className="w-full bg-white dark:bg-darkCard border border-gray-300 dark:border-darkBorder rounded px-2 py-1.5 text-[11px] outline-none text-gray-600 dark:text-gray-300" />
                                                        </div>
                                                    )}
                                                    <button type="button" onClick={() => {
                                                        if (!novoPagamento.valor) return;
                                                        setPagamentosPedido([...pagamentosPedido, { ...novoPagamento, data: obterDataAtual() }]);
                                                        
                                                        // Atualiza sugerindo o restante
                                                        const novoTotalPago = pagamentosPedido.reduce((acc, p) => acc + (parseFloat(String(p.valor).replace(/\./g, '').replace(',', '.')) || 0), 0) + parseFloat(String(novoPagamento.valor).replace(/\./g, '').replace(',', '.'));
                                                        const totalOSStr = parseFloat(String(novoPedido.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
                                                        const saldoRestante = totalOSStr - novoTotalPago;
                                                        
                                                        setNovoPagamento({ valor: saldoRestante > 0 ? formatarMoeda((saldoRestante * 100).toFixed(0).toString()) : '', forma: 'PIX', parcelas: 1, instituicao: 'Itaú', vencimento_boleto: '' });
                                                    }} className="w-full bg-brand hover:bg-brandHover text-white py-1.5 rounded text-[11px] font-semibold transition">Registrar Pagamento</button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Observações Gerais ou Texto Complementar</label>
                                <textarea rows="4" value={novoPedido.servico} onChange={e => setNovoPedido({...novoPedido, servico: e.target.value})} disabled={isModalTrancado} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] custom-scrollbar disabled:opacity-50" placeholder="Prazos de entrega, observações do financeiro ou complementos da O.S..."></textarea>
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-darkBorder bg-gray-50/80 dark:bg-darkCard/80 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0 rounded-b-xl z-20 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] dark:shadow-none">
                            
                            <div className="flex items-center gap-3 bg-white dark:bg-darkElevated px-4 py-3 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm w-full lg:w-auto justify-between lg:justify-start">
                                <span className="text-[11px] font-bold text-gray-400 dark:text-[#888888] uppercase tracking-widest mt-1">Total Final</span>
                                <div className="relative flex items-center justify-end">
                                    <span className="font-bold text-[14px] text-gray-300 dark:text-gray-500 mr-1.5">R$</span>
                                    <input required type="text" value={novoPedido.valor_total} onChange={e => setNovoPedido({...novoPedido, valor_total: formatarMoeda(e.target.value)})} disabled={isModalTrancado} className="bg-transparent border-none text-right font-black text-2xl text-brand outline-none disabled:opacity-50 w-28 sm:w-32 placeholder-brand/30" placeholder="0,00" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
                                {!isModalTrancado && (
                                    <>
                                        <button type="button" onClick={(e) => salvarOS(e, true)} disabled={salvandoOS} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-white dark:bg-darkCard text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                                            <Icon name="printer" className="w-4 h-4 shrink-0" />
                                            {salvandoOS ? 'Salvando...' : 'Salvar e Imprimir'}
                                        </button>
                                        
                                        <button type="button" onClick={(e) => salvarOS(e, false)} disabled={salvandoOS} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                                            <Icon name="save" className="w-4 h-4 shrink-0" />
                                            {salvandoOS ? 'Salvando...' : pedidoEmEdicao ? 'Atualizar' : 'Salvar OS'}
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
                                            }} disabled={salvandoOS} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-600/50 whitespace-nowrap">
                                                <Icon name="check-circle" className="w-4 h-4 shrink-0" />
                                                Finalizar OS
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalProdutoAberto && (
                <div onClick={() => setModalProdutoAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoProduto.id ? 'Editar Produto' : 'Novo Produto'}</h3><button onClick={() => setModalProdutoAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarProduto} className="p-6 flex flex-col gap-4">
                            <input required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome" />
                            <textarea rows="2" value={novoProduto.texto_padrao} onChange={e => setNovoProduto({...novoProduto, texto_padrao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Descrição"></textarea>
                            <input required value={novoProduto.preco_base} onChange={e => setNovoProduto({...novoProduto, preco_base: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white font-medium transition" placeholder="0,00" />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalProdutoAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-white text-black hover:bg-gray-200 transition">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}
            {modalOrcamentoPreAberto && (
                <div onClick={() => setModalOrcamentoPreAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoOrcamentoPre.id ? 'Editar Modelo' : 'Novo Modelo'}</h3><button onClick={() => setModalOrcamentoPreAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarOrcamentoPre} className="p-6 flex flex-col gap-4">
                            <input required value={novoOrcamentoPre.titulo} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, titulo: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Título (Ex: Adesivos Redondos)" />
                            <textarea rows="6" required value={novoOrcamentoPre.texto} onChange={e => setNovoOrcamentoPre({...novoOrcamentoPre, texto: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition custom-scrollbar" placeholder="Cole aqui o texto do orçamento..."></textarea>
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOrcamentoPreAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar</button></div>
                        </form>
                    </div>
                </div>
            )}

            {modalOrcamentoFormalizadoAberto && (
                <div onClick={() => setModalOrcamentoFormalizadoAberto(false)} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div onClick={(e) => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-3xl rounded border border-gray-200 dark:border-darkBorder shadow-2xl flex flex-col max-h-[95vh] cursor-default overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-xl tracking-tight">
                                    {orcamentoFormalizadoEmEdicao ? 'Editar Orçamento Formalizado' : 'Novo Orçamento Formalizado'}
                                </h3>
                            </div>
                            <button type="button" onClick={() => setModalOrcamentoFormalizadoAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" className="w-5 h-5" /></button>
                        </div>
                        
                        <form className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            <div>
                                <label className="block text-[13px] font-medium mb-1.5 text-gray-700 dark:text-[#EDEDED]">Cliente / Empresa</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input required type="text" value={buscaCliente}
                                            onChange={e => { setBuscaCliente(e.target.value); setNovoPedido({...novoPedido, cliente: e.target.value}); setClienteDropdownAberto(true); }}
                                            onFocus={() => { setClienteDropdownAberto(true); }} onBlur={() => setTimeout(() => setClienteDropdownAberto(false), 200)}
                                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Buscar cliente..." autoComplete="off" />
                                        <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                        {clienteDropdownAberto && clientesFiltrados.length > 0 && (
                                            <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                {clientesFiltrados.map(c => (
                                                    <li key={c.id} onClick={() => { setBuscaCliente(c.nome); setNovoPedido({...novoPedido, cliente: c.nome}); setClienteDropdownAberto(false); }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex justify-between items-center transition"><span className="font-medium text-[13px] text-gray-800 dark:text-[#EDEDED]">{c.nome}</span><span className="text-[11px] text-gray-500">{c.telefone}</span></li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition" title="Novo Cliente">
                                        <Icon name="plus" className="w-4 h-4 text-brand" />
                                    </button>
                                </div>
                                {isClienteProblema(novoPedido.cliente) && (
                                    <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded flex items-start gap-2.5 text-red-600 dark:text-red-400">
                                        <Icon name="alert-triangle" className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[13px] font-semibold block">Atenção: Cliente Problemático</span>
                                            <span className="text-[11px]">Este cliente possui restrições ou histórico negativo na empresa. Fique atento.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium mb-3 text-gray-700 dark:text-[#EDEDED]">Carrinho de Itens do Orçamento</label>
                                {itensPedido.length > 0 ? (
                                    <div className="mb-4 flex flex-col gap-2">
                                        {itensPedido.map((item, index) => (
                                            <div key={item.id_temp} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded shadow-sm">
                                                <div className="flex flex-col"><span className="font-semibold text-[13px] dark:text-white">{index + 1}. {item.nome || 'Serviço Personalizado'}</span><span className="text-[11px] text-gray-500 dark:text-[#A1A1AA] whitespace-pre-wrap mt-1">{item.descricao}</span>{item.local_producao && <span className="text-[10px] bg-brand/10 text-brand font-semibold px-1.5 py-0.5 rounded mt-1.5 w-max">Local: {item.local_producao}</span>}</div>
                                                <div className="flex items-center gap-4"><div className="text-right"><span className="font-semibold text-[13px] dark:text-white">R$ {item.valor}</span>{item.desconto && <span className="block text-[10px] text-brand font-medium">-{item.desconto}% desc</span>}</div><button type="button" onClick={() => removerItemDoCarrinho(item.id_temp)} className="text-gray-400 hover:text-red-500 transition"><Icon name="trash-2" className="w-4 h-4" /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-gray-500 dark:text-[#666] mb-4 italic">Nenhum item adicionado de forma estruturada.</p>
                                )}

                                <div className="p-4 border border-dashed border-gray-300 dark:border-darkBorder rounded bg-transparent">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input type="text" value={buscaProduto} 
                                                    onChange={e => { setBuscaProduto(e.target.value); setProdutoDropdownAberto(true); }}
                                                    onFocus={() => { setProdutoDropdownAberto(true); }} onBlur={() => setTimeout(() => setProdutoDropdownAberto(false), 200)}
                                                    className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Puxar item do catálogo (Opcional)..." autoComplete="off" />
                                                <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                {produtoDropdownAberto && produtosFiltrados.length > 0 && (
                                                    <ul className="absolute z-[60] w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded shadow-xl custom-scrollbar">
                                                        {produtosFiltrados.map(p => (
                                                            <li key={p.id} onClick={() => { 
                                                                setBuscaProduto(p.nome);
                                                                setItemAtual({ ...itemAtual, nome: p.nome, descricao: p.texto_padrao, valor: formatarMoeda((p.preco_base * 100).toFixed(0).toString()), desconto: '', id_produto: p.id }); 
                                                                setProdutoDropdownAberto(false); 
                                                            }} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-darkHover cursor-pointer border-b border-gray-100 dark:border-darkBorder last:border-0 flex flex-col transition">
                                                                <div className="flex justify-between items-center"><span className="font-medium text-[13px] dark:text-[#EDEDED]">{p.nome}</span><span className="text-[11px] font-semibold text-brand">R$ {formatarValorFinanceiro(Number(p.preco_base))}</span></div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <button type="button" onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} className="shrink-0 w-[38px] h-[38px] flex items-center justify-center bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded hover:bg-darkHover transition" title="Novo Produto">
                                                    <Icon name="plus" className="w-4 h-4 text-brand" />
                                                </button>
                                            )}
                                        </div>

                                        <textarea rows="2" value={itemAtual.descricao} onChange={e => setItemAtual({...itemAtual, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Especificações do item (Ex: Medida, quantidade, material...)"></textarea>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="relative col-span-2">
                                                <span className="absolute left-3 top-2.5 text-[11px] text-gray-400 font-medium">Local:</span>
                                                <select value={itemAtual.local_producao} onChange={e => setItemAtual({...itemAtual, local_producao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-[52px] pr-8 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium appearance-none">
                                                    {(fornecedores.length > 0 ? fornecedores.map(f => f.nome) : ['Berlim']).map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-2.5 text-[11px] text-gray-400">R$</span>
                                                <input type="text" value={itemAtual.valor} onChange={e => setItemAtual({...itemAtual, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-7 pr-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Bruto" />
                                            </div>
                                            <div><input type="text" value={itemAtual.desconto} onChange={e => { let val = e.target.value.replace(/\D/g, ''); if (parseFloat(val) > 100) val = '100'; setItemAtual({...itemAtual, desconto: val}); }} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-2 py-2 text-[11px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Desc. %" /></div>
                                        </div>
                                        <button type="button" onClick={adicionarItemAoCarrinho} disabled={!itemAtual.descricao || !itemAtual.valor} className="w-full mt-3 px-3 py-2 text-[11px] font-semibold bg-white hover:bg-gray-100 dark:bg-darkHover dark:hover:bg-darkBorder text-gray-800 dark:text-white rounded border border-gray-200 dark:border-darkBorder transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"><Icon name="plus" className="w-3.5 h-3.5"/> Inserir Item no Orçamento</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-darkBorder">
                                <label className="block text-[13px] font-medium mb-2 text-gray-700 dark:text-[#EDEDED]">Observações Gerais ou Texto Complementar</label>
                                <textarea rows="4" value={novoPedido.servico} onChange={e => setNovoPedido({...novoPedido, servico: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED] custom-scrollbar" placeholder="Detalhes adicionais, garantias, etc..."></textarea>
                            </div>
                        </form>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-darkBorder bg-gray-50/80 dark:bg-darkCard/80 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0 rounded-b-xl z-20 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] dark:shadow-none">
                            <div className="flex items-center gap-3 bg-white dark:bg-darkElevated px-4 py-3 rounded-xl border border-gray-200 dark:border-darkBorder shadow-sm w-full lg:w-auto justify-between lg:justify-start">
                                <span className="text-[11px] font-bold text-gray-400 dark:text-[#888888] uppercase tracking-widest mt-1">Total Final</span>
                                <div className="relative flex items-center justify-end">
                                    <span className="font-bold text-[14px] text-gray-300 dark:text-gray-500 mr-1.5">R$</span>
                                    <input required type="text" value={novoPedido.valor_total} onChange={e => setNovoPedido({...novoPedido, valor_total: formatarMoeda(e.target.value)})} className="bg-transparent border-none text-right font-black text-2xl text-brand outline-none w-28 sm:w-32 placeholder-brand/30" placeholder="0,00" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
                                <button type="button" onClick={(e) => salvarOrcamentoFormalizado(e, true)} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-white dark:bg-darkCard text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkHover hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition flex items-center justify-center gap-2 whitespace-nowrap">
                                    <Icon name="file-text" className="w-4 h-4 shrink-0" />
                                    Salvar e Baixar PDF
                                </button>
                                <button type="button" onClick={(e) => salvarOrcamentoFormalizado(e, false)} className="w-full sm:w-44 px-2 py-2.5 rounded-lg text-[13px] font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition flex items-center justify-center gap-2 whitespace-nowrap">
                                    <Icon name="save" className="w-4 h-4 shrink-0" />
                                    {orcamentoFormalizadoEmEdicao ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {modalFornecedorAberto && (
                <div onClick={() => setModalFornecedorAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div onClick={e => e.stopPropagation()} className="bg-[#EDEFF0] dark:bg-darkBg rounded shadow-2xl w-full max-w-md overflow-hidden cursor-default border border-gray-100 dark:border-darkBorder animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-darkBorder bg-gray-50/50 dark:bg-darkHover/30 flex justify-between items-center">
                            <div>
                                <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-wide">{novoFornecedor.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">Preencha os dados do local de produção</p>
                            </div>
                            <button type="button" onClick={() => setModalFornecedorAberto(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition p-1"><Icon name="x" className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide uppercase">Nome / Local *</label>
                                <input type="text" required value={novoFornecedor.nome} onChange={e => setNovoFornecedor({...novoFornecedor, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Ex: Gráfica XYZ, Futura..." />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide uppercase">Contato (Telefone, E-mail)</label>
                                <input type="text" value={novoFornecedor.contato} onChange={e => setNovoFornecedor({...novoFornecedor, contato: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium" placeholder="Ex: (11) 9999-9999" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5 tracking-wide uppercase">Observações</label>
                                <textarea rows="3" value={novoFornecedor.observacoes} onChange={e => setNovoFornecedor({...novoFornecedor, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[12px] outline-none focus:border-brand transition dark:text-[#EDEDED] font-medium resize-none custom-scrollbar" placeholder="Dados bancários, prazo padrão..." />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-darkHover/30 border-t border-gray-100 dark:border-darkBorder flex justify-end gap-3">
                            <button type="button" onClick={() => setModalFornecedorAberto(false)} className="px-4 py-2 text-[12px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkHover rounded transition">Cancelar</button>
                            <button type="button" onClick={async () => {
                                if(!novoFornecedor.nome) return alert('Nome é obrigatório');
                                if (novoFornecedor.id) await supabase.from('fornecedores').update({ nome: novoFornecedor.nome, contato: novoFornecedor.contato, observacoes: novoFornecedor.observacoes }).eq('id', novoFornecedor.id);
                                else await supabase.from('fornecedores').insert([{ nome: novoFornecedor.nome, contato: novoFornecedor.contato, observacoes: novoFornecedor.observacoes }]);
                                carregarDados();
                                setModalFornecedorAberto(false);
                            }} className="bg-brand hover:bg-brandHover text-white px-5 py-2 text-[12px] font-semibold rounded shadow-sm transition">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {modalClienteAberto && (
                <div onClick={() => setModalClienteAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoCliente.id ? 'Editar Cliente' : 'Novo Cliente'}</h3><button onClick={() => setModalClienteAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarCliente} className="p-6 flex flex-col gap-4">
                            <input required value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome *" />
                            <div className="grid grid-cols-2 gap-4"><input value={novoCliente.telefone} onChange={e => setNovoCliente({...novoCliente, telefone: formatarTelefone(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="WhatsApp" /><input type="email" value={novoCliente.email} onChange={e => setNovoCliente({...novoCliente, email: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="E-mail" /></div>
                            <textarea rows="2" value={novoCliente.observacoes} onChange={e => setNovoCliente({...novoCliente, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand transition dark:text-[#EDEDED]" placeholder="Observações"></textarea>
                            <label className="flex items-center gap-2 cursor-pointer mt-1 p-2 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded transition hover:bg-red-100 dark:hover:bg-red-900/30">
                                <input type="checkbox" checked={novoCliente.cliente_problema} onChange={e => setNovoCliente({...novoCliente, cliente_problema: e.target.checked})} className="w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500 cursor-pointer accent-red-600" />
                                <span className="text-[13px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5"><Icon name="alert-triangle" className="w-4 h-4" /> Sinalizar como Cliente Problema</span>
                            </label>
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalClienteAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" disabled={salvandoCliente} className="px-5 py-2 rounded text-[13px] font-medium bg-white text-black hover:bg-gray-200 transition disabled:opacity-50">{salvandoCliente ? 'Salvando...' : 'Salvar'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {modalEmpresaFaturamentoAberto && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-darkCard rounded-xl shadow-2xl w-full max-w-md overflow-hidden fade-in border border-gray-100 dark:border-darkBorder">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50/50 dark:bg-darkHover/50">
                            <h2 className="text-[15px] font-bold text-gray-800 dark:text-[#EDEDED] flex items-center gap-2">
                                <Icon name="check-circle" className="w-4 h-4 text-blue-500" />
                                {novaEmpresaFaturamento.id ? 'Editar Empresa' : 'Adicionar Empresa'}
                            </h2>
                            <button onClick={() => setModalEmpresaFaturamentoAberto(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"><Icon name="x" className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={salvarEmpresaFaturamento} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-[#888888] mb-1.5 uppercase tracking-wider">Nome da Empresa</label>
                                    <input type="text" required value={novaEmpresaFaturamento.nome} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, nome: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="Razão Social ou Fantasia" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-[#888888] mb-1.5 uppercase tracking-wider">CNPJ/CPF</label>
                                    <input type="text" required value={novaEmpresaFaturamento.cnpj} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, cnpj: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow" placeholder="00.000.000/0000-00" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-[#888888] mb-1.5 uppercase tracking-wider">Status</label>
                                    <select required value={novaEmpresaFaturamento.status} onChange={e => setNovaEmpresaFaturamento({...novaEmpresaFaturamento, status: e.target.value})} className="w-full bg-white dark:bg-darkHover border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2.5 text-[13px] text-gray-800 dark:text-[#EDEDED] outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand transition-shadow">
                                        <option value="Aprovado">Aprovado</option>
                                        <option value="Bloqueado">Bloqueado</option>
                                        <option value="Em Análise">Em Análise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setModalEmpresaFaturamentoAberto(false)} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 dark:text-[#888888] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                <button type="submit" disabled={salvandoEmpresa} className="px-6 py-2 rounded-lg text-[13px] font-bold bg-brand text-white hover:bg-brandHover shadow-md shadow-brand/20 transition disabled:opacity-50">
                                    {salvandoEmpresa ? 'Salvando...' : 'Salvar Empresa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalContaAberto && (
                <div onClick={() => setModalContaAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard">
                            <h3 className="font-semibold text-lg dark:text-white tracking-tight">{novaConta.id ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</h3>
                            <button onClick={() => setModalContaAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button>
                        </div>
                        <form onSubmit={salvarConta} className="p-6 flex flex-col gap-4">
                            <input required value={novaConta.descricao} onChange={e => setNovaConta({...novaConta, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Descrição da Despesa" />
                            <div className="grid grid-cols-2 gap-4">
                                <input required value={novaConta.valor} onChange={e => setNovaConta({...novaConta, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white font-medium transition" placeholder="Valor (R$)" />
                                <input type="date" required value={novaConta.vencimento} onChange={e => setNovaConta({...novaConta, vencimento: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition text-gray-700" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase">Status</label>
                                <select value={novaConta.status} onChange={e => setNovaConta({...novaConta, status: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition">
                                    <option value="Pendente">Pendente</option>
                                    <option value="Pago">Pago</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-2">
                                <button type="button" onClick={() => setModalContaAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                <button type="submit" disabled={salvandoConta} className="px-5 py-2 rounded text-[13px] font-medium bg-white text-black hover:bg-gray-200 transition disabled:opacity-50">
                                    {salvandoConta ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalNotaFiscalAberto && notaFiscalEmEdicao && (
                <div onClick={() => setModalNotaFiscalAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-2xl rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">Detalhes e Edição da Nota Fiscal</h3><button onClick={() => setModalNotaFiscalAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4 bg-gray-50 dark:bg-darkElevated p-4 rounded border border-gray-100 dark:border-darkBorder">
                                    <h4 className="font-semibold text-[13px] text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Dados do Cliente (Link)</h4>
                                    <div><label className="text-[11px] text-gray-500">Razão Social</label><div className="flex items-center gap-2"><div className="text-[13px] dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.razao_social || '---'}</div>{notaFiscalEmEdicao.razao_social && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.razao_social)} className="text-gray-400 hover:text-brand transition" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-[11px] text-gray-500">CNPJ</label><div className="flex items-center gap-2"><div className="text-[13px] dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.cnpj || '---'}</div>{notaFiscalEmEdicao.cnpj && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.cnpj)} className="text-gray-400 hover:text-brand transition" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-[11px] text-gray-500">Endereço</label><div className="flex items-center gap-2"><div className="text-[13px] dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.endereco || '---'}</div>{notaFiscalEmEdicao.endereco && <button type="button" onClick={() => navigator.clipboard.writeText(notaFiscalEmEdicao.endereco)} className="text-gray-400 hover:text-brand transition" title="Copiar"><Icon name="copy" className="w-3.5 h-3.5" /></button>}</div></div>
                                    <div><label className="text-[11px] text-gray-500">Contato</label><div className="text-[13px] dark:text-[#EDEDED] font-medium">{notaFiscalEmEdicao.contato || '---'}</div></div>
                                </div>
                                <form id="formNota" onSubmit={salvarNotaFiscal} className="space-y-4">
                                    <h4 className="font-semibold text-[13px] text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Preenchimento Interno</h4>
                                    <div>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Cliente (Identificação Interna)</label>
                                        <input value={notaFiscalEmEdicao.cliente || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, cliente: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome Fantasia / Cliente" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Serviço Feito</label>
                                        <input value={notaFiscalEmEdicao.servico_feito || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, servico_feito: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Qual foi o serviço?" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Valor Pago (R$)</label>
                                        <input type="text" value={notaFiscalEmEdicao.valor_pago || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, valor_pago: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="0,00" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-gray-500 mb-1 block">Observações</label>
                                        <textarea rows="2" value={notaFiscalEmEdicao.observacoes || ''} onChange={e => setNotaFiscalEmEdicao({...notaFiscalEmEdicao, observacoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Anotações internas..."></textarea>
                                    </div>
                                </form>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-darkBorder">
                                <button type="button" onClick={() => setModalNotaFiscalAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                                <button type="submit" form="formNota" disabled={salvandoNotaFiscal} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition disabled:opacity-50">{salvandoNotaFiscal ? 'Salvando...' : 'Salvar Alterações'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalUsuarioAberto && (
                <div onClick={() => setModalUsuarioAberto(false)} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer">
                    <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-darkBorder flex justify-between items-center bg-gray-50 dark:bg-darkCard"><h3 className="font-semibold text-lg dark:text-white tracking-tight">{novoUsuario.id ? 'Editar Conta' : 'Nova Conta de Acesso'}</h3><button onClick={() => setModalUsuarioAberto(false)} className="text-gray-400 hover:text-white transition"><Icon name="x" /></button></div>
                        <form onSubmit={salvarUsuario} className="p-6 flex flex-col gap-4">
                            <input required value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Nome de Acesso" />
                            <input required type="password" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Senha" />
                            
                            <div className="relative">
                                <select value={novoUsuario.nivel} onChange={e => setNovoUsuario({...novoUsuario, nivel: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                                    <option value="Produção/Atendimento">Operador de Produção / Atendimento</option>
                                    <option value="Financeiro">Equipe Financeira</option>
                                    <option value="Administrador">Administrador (Total)</option>
                                </select>
                                <Icon name="chevron-down" className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <p className="text-[10px] text-gray-500 italic mt-1">* Nota: O usuário terá acesso imediato após salvar.</p>
                            <div className="flex justify-end gap-3 mt-2"><button type="button" onClick={() => setModalUsuarioAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button><button type="submit" className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Salvar Acesso</button></div>
                        </form>
                    </div>
                </div>
            )}

            {osParaImprimir && (
                <div className="print-only bg-white text-black font-sans flex flex-col w-full h-[286mm] overflow-hidden justify-between select-none">
                    {[1, 2].map((via, index) => {
                        const cInfo = osParaImprimir.clienteInfo;
                        const desc = desconstruirTextoServico(osParaImprimir.servico);
                        
                        return (
                            <div key={via} className={`h-[143mm] flex flex-col p-6 overflow-hidden relative justify-between ${index === 0 ? 'border-b-[2px] border-dashed border-gray-400' : ''}`}>
                                
                                <div className="shrink-0 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-12 object-contain object-left mb-2" />
                                            
                                            <h2 className="text-xl font-semibold uppercase text-gray-800">O.S. #{osParaImprimir.id}</h2>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <p className="text-[11px] text-gray-500 font-medium">Entrada: {formatarDataExibicao(osParaImprimir.data_pedido)}</p>
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
                                                <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-0.5 tracking-wider">Cliente</h3>
                                                <p className="font-semibold text-base uppercase text-gray-900">{osParaImprimir.cliente}</p>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-0.5 tracking-wider">Contato</h3>
                                                <p className="font-semibold text-[13px] text-gray-800">{cInfo?.telefone || 'Não informado'}</p>
                                            </div>
                                        </div>
                                        {cInfo?.observacoes && (
                                            <div className="mt-1">
                                                <p className="text-[11px] text-gray-600 italic">" {cInfo.observacoes} "</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col mt-2">
                                    <table className="w-full text-left text-[13px] border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-800 text-gray-800">
                                                <th className="pb-1 uppercase text-[10px] font-extrabold tracking-wider w-full">Serviços Contratados</th>
                                                <th className="pb-1 uppercase text-[10px] font-extrabold tracking-wider text-right w-32 whitespace-nowrap pl-4">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {desc.itens.length > 0 ? desc.itens.map((item, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 last:border-0">
                                                    <td className="py-0.5 text-gray-900 whitespace-pre-wrap pr-4 align-middle text-[11px] font-medium leading-tight">
                                                        {item.descricao || item.nome}
                                                    </td>
                                                    <td className="py-0.5 text-right whitespace-nowrap align-middle font-semibold text-[13px]">
                                                        R$ {item.valor}
                                                        {item.desconto && <span className="block text-[9px] text-gray-400 font-normal mt-0.5">(-{item.desconto}%)</span>}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td className="py-2 text-gray-500 whitespace-pre-wrap pr-4 align-middle text-[11px] italic">
                                                        Serviço formatado manualmente (Verifique as observações gerais abaixo).
                                                    </td>
                                                    <td className="py-2 text-right whitespace-nowrap align-middle font-semibold text-[13px]">
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
                                                    <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-1 tracking-wider">Histórico de Pagamentos</h3>
                                                    <div className="text-[11px] text-gray-800">
                                                        {desc.pagamentos.map((pag, idx) => (
                                                            <div key={idx} className="flex justify-between items-center border-b border-dashed border-gray-200 py-0.5 last:border-0">
                                                                <span>{pag.forma} {pag.parcelas > 1 ? `(${pag.parcelas}x)` : ''} {pag.instituicao ? `(${pag.instituicao})` : ''} <span className="text-[10px] text-gray-500">({pag.data})</span></span>
                                                                <span className="font-semibold text-gray-900">R$ {pag.valor}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-[10px] uppercase text-gray-400 mb-1.5 tracking-wider">Observações Gerais do Pedido</h3>
                                                <p className="text-[11px] text-gray-800 whitespace-pre-wrap leading-snug">
                                                    {desc.observacoes || <span className="italic text-gray-400">Nenhuma observação extra registrada.</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] uppercase font-semibold tracking-widest text-gray-500 block mb-0.5">Total do Pedido</span>
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
