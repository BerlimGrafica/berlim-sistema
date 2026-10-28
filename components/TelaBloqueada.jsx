"use client";
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import Avatar from '@/components/ui/Avatar';
import Reticula, { tomBloqueio } from '@/components/ui/Reticula';
import { AvisoErro, CampoSenha, Girando, IconeGoogle, LogotipoMarca, botaoPrimario, botaoSecundario, foco } from '@/components/ui/Acesso';
import { useSessao } from '@/context/SessaoContext';
import { supabase } from '@/lib/supabaseClient';

// A tela bloqueada: cobre o sistema inteiro (o resto fica inerte por trás, ver
// app/(app)/layout.jsx) até a pessoa digitar a senha. Nada é recarregado — os
// dados em memória, o tempo real e o que estava aberto seguem como estavam.
//
// Bloquear: o fundo cobre, a retícula imprime por cima e sobem relógio e
// cartão. Desbloquear: o caminho de volta, mais curto, e só então a tela sai.

const fHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const fData = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

function haQuanto(desde, agora) {
    const min = Math.floor((agora - desde) / 60000);
    if (min < 1) return 'agora mesmo';
    if (min < 60) return `há ${min} min`;
    return `há ${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
}

export default function TelaBloqueada() {
    const {
        usuario, telaBloqueada, googleVinculado, darkMode, toggleDarkMode,
        desbloquearTela, desbloquearComGoogle, liberarTela, logout,
    } = useSessao();
    const [agora, setAgora] = useState(() => Date.now());
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [conferindo, setConferindo] = useState(false);
    const [abrindoGoogle, setAbrindoGoogle] = useState(false);
    const [saindo, setSaindo] = useState(false);
    const [confirmarOutra, setConfirmarOutra] = useState(false);
    const senhaRef = useRef(null);
    const reticulaRef = useRef(null);

    useEffect(() => {
        const relogio = setInterval(() => setAgora(Date.now()), 5000);
        return () => clearInterval(relogio);
    }, []);
    // O e-mail fica na sessão, não no perfil; getSession lê do navegador, sem ir ao banco.
    useEffect(() => {
        let vivo = true;
        supabase.auth.getSession().then(({ data }) => { if (vivo) setEmail(data.session?.user?.email || ''); });
        return () => { vivo = false; };
    }, []);
    // O cursor vai para a senha quando o cartão termina de subir; dali em
    // diante, qualquer tecla leva até ela.
    useEffect(() => {
        const t = setTimeout(() => senhaRef.current?.focus({ preventScroll: true }), 650);
        const aoTeclar = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
            if (document.activeElement !== senhaRef.current) senhaRef.current?.focus();
        };
        document.addEventListener('keydown', aoTeclar);
        return () => { clearTimeout(t); document.removeEventListener('keydown', aoTeclar); };
    }, []);
    // O segundo clique de "Entrar com outra conta" vale por alguns segundos.
    useEffect(() => {
        if (!confirmarOutra) return;
        const t = setTimeout(() => setConfirmarOutra(false), 4000);
        return () => clearTimeout(t);
    }, [confirmarOutra]);

    const sair = async () => {
        setSaindo(true);
        const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        await Promise.all([
            reticulaRef.current?.animar(0, 520),
            new Promise(pronto => setTimeout(pronto, reduzido ? 200 : 600)),
        ]);
        liberarTela();
    };
    const desbloquear = async (e) => {
        e.preventDefault();
        if (conferindo || saindo) return;
        if (!senha) { setErro('Digite a sua senha para desbloquear.'); senhaRef.current?.focus(); return; }
        setErro('');
        setConferindo(true);
        const falha = await desbloquearTela(senha);
        setConferindo(false);
        if (falha) { setErro(falha); senhaRef.current?.select(); return; }
        setSenha('');
        sair();
    };
    const aoGoogle = async () => {
        setAbrindoGoogle(true);
        const falha = await desbloquearComGoogle();
        if (falha) { setAbrindoGoogle(false); setErro(falha); }
    };
    const aoOutraConta = () => {
        if (!confirmarOutra) { setConfirmarOutra(true); return; }
        logout();
    };

    const nome = (usuario?.nome || '').trim();
    const primeiro = nome.split(/\s+/)[0] || 'você';
    const bloqueadaEm = telaBloqueada?.em || agora;

    return (
        <div role="dialog" aria-modal="true" aria-label="Tela bloqueada" className="fixed inset-0 z-[300] text-white">
            <div className={`absolute inset-0 ${saindo ? 'opacity-0 transition-opacity duration-[400ms] delay-[180ms]' : ''}`}>
                <div className="fundo-marca absolute inset-0 animate-cobrir" />
                <Reticula ref={reticulaRef} tom={tomBloqueio} duracao={1100} />
            </div>

            <div className={`absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:none] ${saindo ? 'opacity-0 scale-[.985] transition-[opacity,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)]' : ''}`}>
                <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 md:px-8 md:py-[26px] md:janela-baixa:py-[18px] animate-cobrir [animation-delay:.45s]">
                    <LogotipoMarca className="text-2xl" />
                    <button
                        type="button"
                        onClick={toggleDarkMode}
                        aria-label={darkMode ? 'Tema claro' : 'Tema escuro'}
                        className={`w-9 h-9 grid place-items-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white transition-colors ${foco}`}
                    >
                        <Icon name={darkMode ? 'sun' : 'moon'} className="w-[18px] h-[18px]" />
                    </button>
                </div>

                <div className="min-h-full flex flex-col items-center justify-center px-4 pt-[92px] pb-9 janela-baixa:pt-[62px] janela-baixa:pb-5 max-md:pt-[76px]">
                    <div aria-hidden="true" className="text-center animate-subir [animation-delay:.2s]">
                        <b className="block text-[clamp(64px,8.5vw,100px)] janela-baixa:text-[64px] font-extrabold tracking-[-0.035em] leading-none tabular-nums">{fHora.format(agora)}</b>
                        <span className="block mt-3 janela-baixa:mt-1.5 text-[15px] janela-baixa:text-[14px] font-medium text-white/75 first-letter:uppercase">{fData.format(agora)}</span>
                    </div>

                    <div className="marcas-de-corte w-full max-w-[428px] mt-[34px] janela-baixa:mt-4 animate-subir [animation-delay:.3s]">
                        <form
                            onSubmit={desbloquear}
                            noValidate
                            className="bg-superficie text-tinta-corpo rounded-xl shadow-[0_24px_56px_-16px_rgba(15,23,42,.32),0_2px_8px_rgba(15,23,42,.08)] dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-borda px-7 pt-[30px] pb-5 janela-baixa:px-[26px] janela-baixa:pt-[22px] janela-baixa:pb-4 max-md:px-5 flex flex-col items-center text-center"
                        >
                            <span className="relative">
                                <Avatar nome={nome} avatarUrl={usuario?.avatar_url} className="w-[76px] h-[76px] text-[26px] janela-baixa:w-[60px] janela-baixa:h-[60px] janela-baixa:text-[21px]" />
                                <span className="absolute -right-[5px] -bottom-[3px] w-[30px] h-[30px] janela-baixa:w-[26px] janela-baixa:h-[26px] rounded-full grid place-items-center bg-tinta text-superficie border-[3px] border-superficie">
                                    <Icon name="lock" className="w-[13px] h-[13px]" />
                                </span>
                            </span>
                            <h1 className="mt-4 janela-baixa:mt-3 text-[22px] janela-baixa:text-[20px] font-bold tracking-[-0.018em] leading-tight text-tinta break-words">{nome}</h1>
                            <p className="mt-1 text-[13px] text-tinta-suave break-words">{[usuario?.nivel, email].filter(Boolean).join(' · ')}</p>
                            <p className="mt-3 janela-baixa:mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[12px] font-semibold tabular-nums">
                                <Icon name="lock" className="w-3 h-3" />
                                Bloqueada às {fHora.format(bloqueadaEm)} · {haQuanto(bloqueadaEm, agora)}
                            </p>

                            <div className="w-full mt-5 janela-baixa:mt-4 text-left">
                                {/* Escondido: diz ao gerenciador de senhas de quem é a senha. */}
                                <input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
                                <label htmlFor="bloqueio-senha" className="sr-only">Sua senha</label>
                                <CampoSenha
                                    id="bloqueio-senha"
                                    inputRef={senhaRef}
                                    value={senha}
                                    onChange={(v) => { setSenha(v); if (erro) setErro(''); }}
                                    comErro={!!erro}
                                    placeholder="Digite para desbloquear"
                                />
                                {erro && <AvisoErro className="mt-3">{erro}</AvisoErro>}
                                <button type="submit" disabled={conferindo || saindo} aria-busy={conferindo || undefined} className={`${erro ? 'mt-3' : 'mt-4'} ${botaoPrimario}`}>
                                    {conferindo ? <><Girando />Conferindo…</> : <><Icon name="lock-open" className="w-4 h-4" />Desbloquear</>}
                                </button>
                                {googleVinculado && (
                                    <button
                                        type="button"
                                        onClick={aoGoogle}
                                        disabled={abrindoGoogle || saindo}
                                        aria-busy={abrindoGoogle || undefined}
                                        title="Abre o Google e recarrega a página"
                                        className={`mt-2.5 ${botaoSecundario}`}
                                    >
                                        {abrindoGoogle ? <Girando /> : <IconeGoogle />}
                                        {abrindoGoogle ? 'Abrindo o Google…' : 'Desbloquear com Google'}
                                    </button>
                                )}
                            </div>

                            <p className="w-full mt-5 pt-4 janela-baixa:mt-3.5 janela-baixa:pt-3 border-t border-borda-fraca text-[13px] text-tinta-suave">
                                {!confirmarOutra && <>Não é {primeiro}? </>}
                                <button
                                    type="button"
                                    onClick={aoOutraConta}
                                    className={`font-semibold rounded hover:underline underline-offset-[3px] ${confirmarOutra ? 'text-perigo' : 'text-tinta-corpo hover:text-tinta'} ${foco}`}
                                >
                                    {confirmarOutra ? `Clique de novo para sair da conta de ${primeiro}` : 'Entrar com outra conta'}
                                </button>
                            </p>
                        </form>
                    </div>

                    <p className="mt-[18px] janela-baixa:mt-2 flex items-center gap-2 text-[12.5px] text-white/75 text-center animate-cobrir [animation-delay:.45s]">
                        <Icon name="shield-check" className="w-3.5 h-3.5 shrink-0 text-[var(--marca-azul)]" />
                        O que estava aberto continua do mesmo jeito.
                    </p>
                </div>
            </div>
        </div>
    );
}
