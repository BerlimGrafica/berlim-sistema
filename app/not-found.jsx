import Link from 'next/link';

// 404 do app inteiro (endereço digitado errado, link antigo). Com um único
// layout raiz, este not-found compõe com ele e cobre as URLs sem rota.
export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-fundo p-6 select-none">
            <div className="w-full max-w-sm bg-superficie border border-borda rounded-xl p-8 shadow-sm flex flex-col items-center gap-4 text-center">
                <p className="text-4xl font-black text-brand tracking-tight">404</p>
                <div>
                    <h2 className="text-lg font-black text-tinta tracking-tight">Página não encontrada</h2>
                    <p className="text-corpo text-tinta-suave mt-1">Esse endereço não existe no sistema.</p>
                </div>
                <Link href="/" className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-corpo rounded-md font-semibold shadow-sm transition">
                    Voltar ao início
                </Link>
            </div>
        </div>
    );
}
