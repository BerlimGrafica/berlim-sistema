"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSessao } from '@/context/SessaoContext';
import Icon from '@/components/Icon';
import { podeVerTela, telaPorHref, primeiraTelaDe } from '@/lib/acesso/telas';

// Esconder a aba no menu nunca foi o mesmo que fechar a tela.
//
// Até aqui a permissão só existia na Navbar: quem soubesse o endereço entrava
// digitando, e quem tivesse a página nos favoritos continuava entrando. Isso
// passava sem consequência enquanto as telas eram as mesmas para quase todo
// mundo — agora que o administrador vai fechar telas pessoa a pessoa, o menu
// escondido viraria uma promessa que o sistema não cumpre.
//
// Isto é uma barreira de INTERFACE, não de dados: ela evita o acesso por
// engano e deixa claro o que está fora do alcance. O que protege de fato os
// registros é a RLS no Postgres (supabase/rls_and_auth_migration.sql), que
// continua sendo a última palavra sobre cada linha.
export default function GuardaDeAcesso({ children }) {
    const { usuario } = useSessao();
    const pathname = usePathname();

    // Sem perfil carregado ainda, ou rota fora do catálogo (a caixa de areia do
    // WhatsApp, por exemplo): não é deste guarda a decisão.
    if (!usuario || !telaPorHref(pathname) || podeVerTela(usuario, pathname)) return children;

    const tela = telaPorHref(pathname);
    const volta = primeiraTelaDe(usuario);

    return (
        <main className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
            <div className="max-w-md w-full text-center animate-surgir">
                <div className="w-14 h-14 mx-auto rounded-full bg-elevado border border-borda flex items-center justify-center">
                    <Icon name="lock" className="w-6 h-6 text-tinta-fraca" />
                </div>
                <h1 className="mt-5 text-xl font-black text-tinta tracking-tight">{tela.rotulo} está fora do seu acesso</h1>
                <p className="mt-2 text-corpo text-tinta-suave leading-relaxed">
                    Esta tela não faz parte das suas permissões. Se você precisa dela para o seu
                    trabalho, peça a um administrador para liberá-la no seu cadastro.
                </p>
                <Link href={volta} className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-corpo font-semibold text-white hover:bg-brandHover transition shadow-sm">
                    <Icon name="chevron-left" className="w-4 h-4" />
                    Voltar
                </Link>
            </div>
        </main>
    );
}
