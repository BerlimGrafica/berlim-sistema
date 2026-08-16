"use client";
import { useEffect } from 'react';

// Boundary de erro das telas internas: um erro de renderização em qualquer
// página derruba só o conteúdo da rota — a Navbar e o resto do app continuam
// de pé. Nesta versão do Next a prop de recuperação é unstable_retry (re-busca
// e re-renderiza o segmento), não o antigo reset.
// Não usa nenhum contexto de propósito: se o erro veio de lá, o boundary
// precisa continuar renderizando mesmo assim.
export default function Error({ error, unstable_retry }) {
    useEffect(() => {
        console.error('Erro capturado pelo boundary da rota:', error);
    }, [error]);

    return (
        <main className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
            <div className="w-full max-w-md bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl p-8 shadow-sm flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Algo deu errado nesta tela</h2>
                    <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">
                        O restante do sistema continua funcionando. Tente de novo; se o problema insistir, avise o Murilo com a mensagem abaixo.
                    </p>
                </div>
                {(error?.message || error?.digest) && (
                    <p className="w-full text-[11px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-darkBorder rounded px-3 py-2 break-words">
                        {error?.message}{error?.digest ? ` (ref: ${error.digest})` : ''}
                    </p>
                )}
                <div className="flex gap-3 mt-1">
                    <button type="button" onClick={() => unstable_retry()} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition">
                        Tentar novamente
                    </button>
                    <a href="/" className="px-4 py-2 text-[13px] rounded-md font-semibold border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-[#EDEDED] hover:bg-gray-50 dark:hover:bg-darkHover transition">
                        Voltar ao início
                    </a>
                </div>
            </div>
        </main>
    );
}
