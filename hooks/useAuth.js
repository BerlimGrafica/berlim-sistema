"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, setSomenteLeitura } from '@/lib/supabaseClient';

// Sessão, login (e-mail/senha, Google, demo) e dark mode. Um login bem-sucedido
// sempre leva o usuário de volta para a rota inicial ("/").
export function useAuth() {
    const router = useRouter();
    const [usuariosSistema, setUsuariosSistema] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [googleVinculado, setGoogleVinculado] = useState(false);
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [erroLogin, setErroLogin] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
        if (darkMode) { document.documentElement.classList.add('dark'); }
        else { document.documentElement.classList.remove('dark'); }
    }, [darkMode]);
    const isAdmin = usuario?.nivel === 'Administrador';
    const isOperador = usuario?.nivel === 'Atendimento' || usuario?.nivel === 'Produção';
    const isDemo = usuario?.nivel === 'demo';
    useEffect(() => {
        setSomenteLeitura(isDemo);
    }, [isDemo]);
    async function carregarPerfil(userId) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error || !data) return null;
        return data;
    }

    // Reflete se a sessão atual tem uma identidade Google vinculada (usado no botão de "Vincular Google" da Navbar).
    function atualizarGoogleVinculado(user) {
        setGoogleVinculado(!!user?.identities?.some(i => i.provider === 'google'));
        sincronizarAvatarGoogle(user);
    }

    // Copia a foto de perfil do Google (se ainda não tiver sido salva) para profiles.avatar_url,
    // via RPC que só grava essa coluna e só na própria linha (ver avatar_google_migration.sql).
    async function sincronizarAvatarGoogle(user) {
        const identidadeGoogle = user?.identities?.find(i => i.provider === 'google');
        const avatarGoogle = identidadeGoogle?.identity_data?.avatar_url || identidadeGoogle?.identity_data?.picture || null;
        if (!avatarGoogle) return;

        const { error } = await supabase.rpc('atualizar_meu_avatar', { novo_avatar_url: avatarGoogle });
        if (!error) {
            setUsuario(prev => (prev && prev.avatar_url !== avatarGoogle ? { ...prev, avatar_url: avatarGoogle } : prev));
            setUsuariosSistema(prev => prev.map(u => (u.id === user.id && u.avatar_url !== avatarGoogle ? { ...u, avatar_url: avatarGoogle } : u)));
        }
    }

    const efetuarLogin = async (e) => {
        e.preventDefault();
        setErroLogin('Entrando...');

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginInput.trim(),
            password: senhaInput,
        });

        if (error) {
            setErroLogin('E-mail ou senha incorretos.');
            return;
        }

        const perfil = await carregarPerfil(data.user.id);
        if (!perfil) {
            setErroLogin('Login válido, mas sem perfil cadastrado (tabela profiles). Fale com um administrador.');
            await supabase.auth.signOut();
            return;
        }

        atualizarGoogleVinculado(data.user);
        setUsuario(perfil);
        setErroLogin('');
        setLoginInput('');
        setSenhaInput('');
        router.push('/');
    };

    // Login de 1 clique com a conta de demonstração (somente leitura), usada no link do
    // currículo. Credenciais fixas via env — se não estiverem configuradas, avisa em vez
    // de tentar logar com "undefined".
    const entrarComoDemo = async () => {
        setErroLogin('');
        const email = process.env.NEXT_PUBLIC_DEMO_EMAIL;
        const senha = process.env.NEXT_PUBLIC_DEMO_SENHA;
        if (!email || !senha) {
            setErroLogin('Acesso demo não configurado.');
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) {
            setErroLogin('Não foi possível entrar no modo demonstração.');
            return;
        }

        const perfil = await carregarPerfil(data.user.id);
        if (!perfil) {
            setErroLogin('Conta demo sem perfil cadastrado. Fale com um administrador.');
            await supabase.auth.signOut();
            return;
        }

        setUsuario(perfil);
        router.push('/');
    };

    // Login direto com Google — só entra se essa identidade já estiver vinculada a uma conta
    // com perfil cadastrado (ver vincularGoogle); senão cai no mesmo aviso de "sem perfil".
    const entrarComGoogle = async () => {
        setErroLogin('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) setErroLogin('Não foi possível iniciar o login com Google.');
    };

    // Vincula a conta Google à sessão atual (usuário já logado por e-mail/senha).
    // Depois disso, ele também pode entrar direto pelo botão "Entrar com Google".
    // Retornam uma mensagem de erro (string) em caso de falha, ou undefined em caso
    // de sucesso — quem chama (AppContext) decide como avisar o usuário, já que este
    // hook roda antes do useAlertas() e não tem acesso ao avisar() ainda.
    const vincularGoogle = async () => {
        const { error } = await supabase.auth.linkIdentity({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) return error.message;
    };

    const desvincularGoogle = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const identidadeGoogle = user?.identities?.find(i => i.provider === 'google');
        if (!identidadeGoogle) return;
        const { error } = await supabase.auth.unlinkIdentity(identidadeGoogle);
        if (error) { return error.message; }
        setGoogleVinculado(false);

        const { error: erroAvatar } = await supabase.rpc('atualizar_meu_avatar', { novo_avatar_url: null });
        if (!erroAvatar) {
            setUsuario(prev => (prev ? { ...prev, avatar_url: null } : prev));
            setUsuariosSistema(prev => prev.map(u => (u.id === user.id ? { ...u, avatar_url: null } : u)));
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUsuario(null);
    };

    // Restaura a sessão ao recarregar a página e reage a logout/expiração feitos em outra aba
    // (e também ao voltar do redirect do Google, seja de login ou de vinculação de conta)
    useEffect(() => {
        let ativo = true;
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!session || !ativo) return;
            const perfil = await carregarPerfil(session.user.id);
            if (!ativo) return;
            if (perfil) {
                atualizarGoogleVinculado(session.user);
                setUsuario(perfil);
            } else {
                setErroLogin('Login válido, mas sem perfil cadastrado (tabela profiles). Fale com um administrador.');
                await supabase.auth.signOut();
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') { setUsuario(null); setGoogleVinculado(false); }
            if (event === 'USER_UPDATED' && session?.user) atualizarGoogleVinculado(session.user);
        });

        return () => {
            ativo = false;
            listener?.subscription?.unsubscribe();
        };
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) { document.documentElement.classList.remove('dark'); }
        else { document.documentElement.classList.add('dark'); }
        setDarkMode(!darkMode);
    };

    return {
        isAdmin, isOperador, isDemo,
        usuariosSistema, setUsuariosSistema,
        usuario, setUsuario,
        googleVinculado, vincularGoogle, desvincularGoogle,
        loginInput, setLoginInput,
        senhaInput, setSenhaInput,
        erroLogin, setErroLogin,
        darkMode, setDarkMode,
        efetuarLogin, entrarComoDemo, entrarComGoogle, logout, toggleDarkMode,
    };
}
