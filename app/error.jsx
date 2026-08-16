"use client";
import { useEffect } from 'react';

// Boundary de erro acima do layout interno: pega um crash do próprio
// AppProvider/Navbar (que o error.jsx de app/(app)/ não cobre — boundary não
// envolve o layout do mesmo segmento). Aqui não existe mais navbar de pé,
// então a recuperação mais confiável é recarregar a página inteira.
export default function Error({ error, unstable_retry }) {
    useEffect(() => {
        console.error('Erro capturado pelo boundary raiz:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#EDEFF0] dark:bg-darkBg p-6 select-none">
            <div className="w-full max-w-md bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl p-8 shadow-sm flex flex-col items-center gap-4 text-center">
                <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-10 object-contain" />
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">O sistema encontrou um erro</h2>
                    <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">
                        Recarregue a página para continuar. Se acontecer de novo, avise o Murilo com a mensagem abaixo.
                    </p>
                </div>
                {(error?.message || error?.digest) && (
                    <p className="w-full text-[11px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-darkBorder rounded px-3 py-2 break-words">
                        {error?.message}{error?.digest ? ` (ref: ${error.digest})` : ''}
                    </p>
                )}
                <div className="flex gap-3 mt-1">
                    <button type="button" onClick={() => window.location.reload()} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition">
                        Recarregar o sistema
                    </button>
                    <button type="button" onClick={() => unstable_retry()} className="px-4 py-2 text-[13px] rounded-md font-semibold border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-[#EDEDED] hover:bg-gray-50 dark:hover:bg-darkHover transition">
                        Tentar de novo
                    </button>
                </div>
            </div>
        </div>
    );
}
