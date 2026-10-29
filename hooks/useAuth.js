"use client";
import { useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useRouter } from 'next/navigation';
import { supabase, setSomenteLeitura } from '@/lib/supabaseClient';
import { trocarTema } from '@/lib/utils/trocarTema';

// Tela bloqueada. O bloqueio fica no navegador, e não só na memória da página:
// sem isso um F5 destrancava a tela. O registro guarda de quem é e o último
// login daquela pessoa no momento em que bloqueou — se a sessão volta com
// outro login (ela entrou de novo, pelo Google por exemplo), a tela abre.
// Comparar com o último login, e não com o relógio, deixa a regra imune a um
// computador com a hora errada.
//
// DESLIGADO por enquanto (29/10/2026, a pedido): sem cadeado na barra, sem o
// item no menu da conta e sem bloqueio por tempo parado. Um bloqueio que tenha
// ficado gravado no navegador é apagado na próxima abertura. Para religar,
// basta voltar esta chave para true; o resto do código continua pronto.
export const BLOQUEIO_LIGADO = false;
const CHAVE_BLOQUEIO = 'berlim:tela-bloqueada';
// O último uso é dividido entre as abas: quem trabalha numa aba mantém as
// outras abertas, em vez de cada uma contar o seu próprio tempo parado.
const CHAVE_USO = 'berlim:ultimo-uso';
const LIMITE_SEM_USO = 60 * 60 * 1000;

function lerBloqueio() {
    try { return JSON.parse(localStorage.getItem(CHAVE_BLOQUEIO) || 'null'); } catch { return null; }
}
function gravarBloqueio(registro) {
    try {
        if (registro) localStorage.setItem(CHAVE_BLOQUEIO, JSON.stringify(registro));
        else localStorage.removeItem(CHAVE_BLOQUEIO);
    } catch { /* navegador sem armazenamento: o bloqueio vale só nesta página */ }
}
// O bloqueio guardado ainda vale para esta sessão? Senão, some com ele.
function bloqueioDaSessao(user) {
    const registro = lerBloqueio();
    if (!BLOQUEIO_LIGADO) {
        if (registro) gravarBloqueio(null);
        return null;
    }
    if (registro && registro.id === user.id && registro.login === (user.last_sign_in_at || null)) return { em: registro.em };
    if (registro) gravarBloqueio(null);
    return null;
}

// Sessão, login (e-mail/senha, Google, demo), tela bloqueada e dark mode. Um
// login bem-sucedido sempre leva o usuário de volta para a rota inicial ("/").
export function useAuth() {
    const router = useRouter();
    const [usuariosSistema, setUsuariosSistema] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [googleVinculado, setGoogleVinculado] = useState(false);
    const [loginInput, setLoginInput] = useState('');
    const [senhaInput, setSenhaInput] = useState('');
    const [erroLogin, setErroLogin] = useState('');
    const [entrando, setEntrando] = useState(false);
    // { em: timestamp } enquanto a tela está bloqueada; null quando não.
    const [telaBloqueada, setTelaBloqueada] = useState(null);
    // true enquanto o getSession() do carregamento inicial não resolveu — o
    // AppProvider mostra uma splash neutra nesse meio-tempo, em vez de piscar
    // a tela de login para quem já está logado (F5, volta do redirect Google).
    const [restaurandoSessao, setRestaurandoSessao] = useState(true);
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
        setErroLogin('');
        setEntrando(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginInput.trim(),
            password: senhaInput,
        });

        if (error) {
            setEntrando(false);
            setErroLogin('E-mail ou senha incorretos. Confira os dois e tente de novo.');
            return;
        }

        const perfil = await carregarPerfil(data.user.id);
        setEntrando(false);
        if (!perfil) {
            setErroLogin('Login válido, mas sem perfil cadastrado (tabela profiles). Fale com um administrador.');
            await supabase.auth.signOut();
            return;
        }

        atualizarGoogleVinculado(data.user);
        gravarBloqueio(null);
        setTelaBloqueada(null);
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

        gravarBloqueio(null);
        setTelaBloqueada(null);
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
        gravarBloqueio(null);
        setTelaBloqueada(null);
        setUsuario(null);
    };

    // === TELA BLOQUEADA ===
    // Bloquear não encerra nada: a sessão, os dados em memória e o que estava
    // aberto continuam por trás. Só a tela fica coberta até a senha.
    const bloquearTela = useCallback(async () => {
        if (!BLOQUEIO_LIGADO) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const registro = { id: session.user.id, em: Date.now(), login: session.user.last_sign_in_at || null };
        gravarBloqueio(registro);
        setTelaBloqueada({ em: registro.em });
    }, []);

    // Confere a senha entrando de novo com ela; devolve a mensagem de erro, ou
    // nada quando deu certo. Não libera a tela: quem chama (TelaBloqueada)
    // anima a saída e só então chama liberarTela().
    const desbloquearTela = async (senha) => {
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email;
        if (!email) return 'A sua sessão terminou. Entre de novo.';
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (!error) return;
        return error.status === 400 || /invalid/i.test(error.message || '')
            ? 'Senha incorreta. Tente de novo.'
            : 'Não foi possível conferir a senha agora. Tente de novo.';
    };

    // Pelo Google a página vai e volta: na volta, o login novo destranca a tela
    // (ver bloqueioDaSessao). Volta para a mesma tela quando o Supabase aceita
    // o endereço; se não, para o Início.
    const desbloquearComGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + window.location.pathname },
        });
        if (error) return 'Não foi possível abrir o Google agora.';
    };

    const liberarTela = () => {
        gravarBloqueio(null);
        setTelaBloqueada(null);
    };

    // Bloqueio ou desbloqueio feito em outra aba vale para esta também.
    useEffect(() => {
        if (!BLOQUEIO_LIGADO) return;
        const aoMudar = (e) => {
            if (e.key !== CHAVE_BLOQUEIO) return;
            const registro = lerBloqueio();
            setTelaBloqueada(registro ? { em: registro.em } : null);
        };
        window.addEventListener('storage', aoMudar);
        return () => window.removeEventListener('storage', aoMudar);
    }, []);

    // Uma hora sem uso no computador bloqueia a tela sozinha. No celular, não:
    // quem tranca é o próprio aparelho. A conta de demonstração nunca bloqueia
    // (o visitante não sabe a senha dela).
    const usuarioId = usuario?.id;
    const bloqueada = !!telaBloqueada;
    useEffect(() => {
        if (!BLOQUEIO_LIGADO || !usuarioId || isDemo || bloqueada) return;
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
        let ultimo = Date.now(), gravado = 0;
        const gravar = (quando) => {
            gravado = quando;
            try { localStorage.setItem(CHAVE_USO, String(quando)); } catch { /* sem armazenamento: conta só esta aba */ }
        };
        // Grava no máximo a cada 30s: mexer o mouse não pode virar escrita a cada pixel.
        const usou = () => {
            ultimo = Date.now();
            if (ultimo - gravado > 30000) gravar(ultimo);
        };
        const conferir = () => {
            let outraAba = 0;
            try { outraAba = Number(localStorage.getItem(CHAVE_USO)) || 0; } catch { /* idem */ }
            if (Date.now() - Math.max(ultimo, outraAba) >= LIMITE_SEM_USO) bloquearTela();
        };
        // Computador que dormiu: o intervalo para junto, então confere também na volta.
        const aoVoltar = () => { if (document.visibilityState === 'visible') conferir(); };
        gravar(ultimo);
        const eventos = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];
        eventos.forEach(ev => window.addEventListener(ev, usou, { passive: true, capture: true }));
        document.addEventListener('visibilitychange', aoVoltar);
        const relogio = setInterval(conferir, 60000);
        return () => {
            eventos.forEach(ev => window.removeEventListener(ev, usou, { capture: true }));
            document.removeEventListener('visibilitychange', aoVoltar);
            clearInterval(relogio);
        };
    }, [usuarioId, isDemo, bloqueada, bloquearTela]);

    // Restaura a sessão ao recarregar a página e reage a logout/expiração feitos em outra aba
    // (e também ao voltar do redirect do Google, seja de login ou de vinculação de conta)
    useEffect(() => {
        let ativo = true;
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!ativo) return;
            if (!session) { setRestaurandoSessao(false); return; }
            const perfil = await carregarPerfil(session.user.id);
            if (!ativo) return;
            if (perfil) {
                atualizarGoogleVinculado(session.user);
                // No mesmo lote do setUsuario: a página nunca aparece destrancada
                // nem por um quadro antes da tela bloqueada.
                setTelaBloqueada(bloqueioDaSessao(session.user));
                setUsuario(perfil);
            } else {
                setErroLogin('Login válido, mas sem perfil cadastrado (tabela profiles). Fale com um administrador.');
                await supabase.auth.signOut();
            }
            // Junto (em batch) com o setUsuario acima: a splash sai de cena no
            // mesmo commit em que o app (ou a tela de login) entra.
            setRestaurandoSessao(false);
        }).catch(() => { if (ativo) setRestaurandoSessao(false); });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') { setUsuario(null); setGoogleVinculado(false); setTelaBloqueada(null); gravarBloqueio(null); }
            if (event === 'USER_UPDATED' && session?.user) atualizarGoogleVinculado(session.user);
        });

        return () => {
            ativo = false;
            listener?.subscription?.unsubscribe();
        };
    }, []);

    // O ícone do botão (sol/lua) precisa trocar junto com as cores, na mesma
    // "foto" da transição — por isso o flushSync.
    const toggleDarkMode = (evento) => {
        const escuro = !darkMode;
        trocarTema(escuro, evento?.currentTarget, () => flushSync(() => setDarkMode(escuro)));
    };

    return {
        isAdmin, isOperador, isDemo,
        restaurandoSessao,
        usuariosSistema, setUsuariosSistema,
        usuario, setUsuario,
        googleVinculado, vincularGoogle, desvincularGoogle,
        loginInput, setLoginInput,
        senhaInput, setSenhaInput,
        erroLogin, setErroLogin, entrando,
        darkMode, setDarkMode,
        efetuarLogin, entrarComoDemo, entrarComGoogle, logout, toggleDarkMode,
        telaBloqueada, bloquearTela, desbloquearTela, desbloquearComGoogle, liberarTela,
    };
}
