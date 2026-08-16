import Link from 'next/link';

// 404 do app inteiro (endereço digitado errado, link antigo). Com um único
// layout raiz, este not-found compõe com ele e cobre as URLs sem rota.
export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#EDEFF0] dark:bg-darkBg p-6 select-none">
            <div className="w-full max-w-sm bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl p-8 shadow-sm flex flex-col items-center gap-4 text-center">
                <p className="text-4xl font-black text-brand tracking-tight">404</p>
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Página não encontrada</h2>
                    <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Esse endereço não existe no sistema.</p>
                </div>
                <Link href="/" className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition">
                    Voltar ao início
                </Link>
            </div>
        </div>
    );
}
