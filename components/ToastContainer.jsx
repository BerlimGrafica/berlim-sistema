"use client";
import { useEffect } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { useNavegarAlerta } from '@/hooks/useNavegarAlerta';
import Icon from '@/components/Icon';

const DURACAO_MS = 6000;

const ESTILOS_TIPO = {
    info: { icone: 'bell', barra: 'bg-brand', iconeBg: 'bg-brand/10', iconeCor: 'text-brand' },
    sucesso: { icone: 'check-circle', barra: 'bg-emerald-500', iconeBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconeCor: 'text-emerald-600 dark:text-emerald-400' },
    erro: { icone: 'alert-triangle', barra: 'bg-red-500', iconeBg: 'bg-red-50 dark:bg-red-500/10', iconeCor: 'text-red-600 dark:text-red-400' },
};

function Toast({ alerta, onFechar, onClicar }) {
    useEffect(() => {
        const t = setTimeout(onFechar, DURACAO_MS);
        return () => clearTimeout(t);
    }, [onFechar]);

    const estilo = ESTILOS_TIPO[alerta.severidade] || ESTILOS_TIPO.info;

    return (
        <div
            onClick={onClicar}
            className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] bg-elevado border border-borda rounded-lg shadow-2xl overflow-hidden cursor-pointer animate-toast-in flex"
        >
            <div className={`w-1 ${estilo.barra} shrink-0`}></div>
            <div className="flex items-start gap-3 p-3.5 flex-1 min-w-0">
                <span className={`w-8 h-8 rounded-full ${estilo.iconeBg} ${estilo.iconeCor} flex items-center justify-center shrink-0`}>
                    <Icon name={estilo.icone} className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[12.5px] text-tinta whitespace-pre-line leading-snug">{alerta.msg}</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onFechar(); }}
                    aria-label="Fechar notificação"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition p-1 -m-1 shrink-0"
                >
                    <Icon name="x" className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function ToastContainer() {
    const { usuario } = useSessao();
    const { toasts, removerToast } = useUi();
    const navegarParaAlerta = useNavegarAlerta();

    if (!usuario || toasts.length === 0) return null;

    // Empilha do mais novo (perto do canto) pro mais antigo, descendo a partir dele.
    const ordenados = [...toasts].reverse();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none no-print">
            {ordenados.map(alerta => (
                <Toast
                    key={alerta.id}
                    alerta={alerta}
                    onFechar={() => removerToast(alerta.id)}
                    onClicar={() => { if (!alerta.avisoManual) navegarParaAlerta(alerta); removerToast(alerta.id); }}
                />
            ))}
        </div>
    );
}
