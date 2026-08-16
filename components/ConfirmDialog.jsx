"use client";
import { useUi } from '@/context/UiContext';
import Icon from '@/components/Icon';

// Substituto estilizado do window.confirm() nativo — mesma linguagem visual
// dos toasts (cartão, barra colorida, ícone), mas em modal (precisa de uma
// decisão explícita, então não pode sumir sozinho como um toast).
export default function ConfirmDialog() {
    const { pendingConfirm, resolverConfirm } = useUi();
    if (!pendingConfirm) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 glass no-print animate-modal-backdrop"
            onClick={() => resolverConfirm(false)}
        >
            <div
                className="bg-elevado w-full max-w-sm rounded-lg shadow-2xl overflow-hidden border border-borda animate-modal-in flex"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-1 bg-brand shrink-0"></div>
                <div className="flex-1 p-5">
                    <div className="flex items-start gap-3 mb-5">
                        <span className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                            <Icon name="alert-triangle" className="w-4.5 h-4.5" />
                        </span>
                        <p className="text-[13.5px] text-tinta leading-snug pt-1.5 whitespace-pre-line">{pendingConfirm.mensagem}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => resolverConfirm(false)} className="px-4 py-2 rounded text-corpo font-medium text-tinta-suave hover:bg-realce transition">Cancelar</button>
                        <button type="button" onClick={() => resolverConfirm(true)} className="px-4 py-2 rounded text-corpo font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
