"use client";
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import Reticula, { tomEntrada } from '@/components/ui/Reticula';
import { AvisoErro, CampoSenha, Girando, IconeGoogle, LogotipoMarca, botaoPrimario, botaoSecundario, campoCaixa, campoIcone, campoInput, foco } from '@/components/ui/Acesso';

// A tela de entrada. À esquerda, o fundo de marca: diz o que é o sistema para
// quem chega pelo link de visitante. À direita, o formulário, que segue o tema.
// No celular o fundo de marca vira uma faixa no topo e o formulário sobe por
// cima dela, como uma folha.

const RECURSOS = [
    { icone: 'clipboard-list', titulo: 'A O.S. do balcão à baixa', texto: 'Abre, acompanha e encerra sem papel.' },
    { icone: 'smartphone', titulo: 'A produção no celular', texto: 'Cada etapa na mão de quem faz.' },
    { icone: 'wallet', titulo: 'O caixa do dia', texto: 'Vendas, contas e boletos no mesmo lugar.' },
];

function saudacao() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
}

export default function TelaEntrada({
    loginInput, setLoginInput, senhaInput, setSenhaInput, erroLogin, setErroLogin, entrando,
    efetuarLogin, entrarComGoogle, entrarComoDemo, darkMode, toggleDarkMode,
}) {
    const [ola] = useState(saudacao);
    // Campo vazio é conferido aqui, sem ir ao banco: { campo, texto }.
    const [erroCampo, setErroCampo] = useState(null);
    const [ajudaSenha, setAjudaSenha] = useState(false);
    const [abrindoGoogle, setAbrindoGoogle] = useState(false);
    const emailRef = useRef(null);
    const senhaRef = useRef(null);
    const temDemo = !!process.env.NEXT_PUBLIC_DEMO_EMAIL;

    // No computador o cursor já começa no e-mail; no celular, não, para o
    // teclado não cobrir metade da tela antes de a pessoa tocar.
    useEffect(() => {
        if (window.matchMedia('(hover: hover)').matches) emailRef.current?.focus();
    }, []);
    // Senha recusada: o cursor volta para ela, já selecionada para redigitar.
    useEffect(() => {
        if (erroLogin) senhaRef.current?.select();
    }, [erroLogin]);

    const limparErro = () => {
        if (erroCampo) setErroCampo(null);
        if (erroLogin) setErroLogin('');
    };
    const enviar = (e) => {
        e.preventDefault();
        if (entrando) return;
        if (!loginInput.trim()) { setErroCampo({ campo: 'email', texto: 'Digite o seu e-mail.' }); emailRef.current?.focus(); return; }
        if (!senhaInput) { setErroCampo({ campo: 'senha', texto: 'Digite a sua senha.' }); senhaRef.current?.focus(); return; }
        setErroCampo(null);
        efetuarLogin(e);
    };
    // A página vai para o Google e volta já dentro; se não sair daqui, o botão
    // volta ao normal (o erro, se houver, aparece no aviso).
    const aoGoogle = async () => {
        setAbrindoGoogle(true);
        await entrarComGoogle();
        setTimeout(() => setAbrindoGoogle(false), 4000);
    };

    const erro = erroCampo?.texto || erroLogin;
    const erroNaSenha = erroCampo?.campo === 'senha' || (!!erroLogin && !erroCampo);

    return (
        <main className="min-h-dvh bg-superficie lg:h-dvh lg:grid lg:grid-cols-[minmax(420px,46%)_1fr]">
            <section className="fundo-marca relative isolate overflow-hidden text-white h-[176px] lg:h-auto">
                <Reticula tom={tomEntrada} duracao={1300} />
                <div className="relative h-full flex flex-col px-4 pt-[22px] pb-[38px] lg:px-[52px] lg:pt-10 lg:pb-8 lg:overflow-y-auto [scrollbar-width:none] animate-cobrir">
                    <LogotipoMarca className="text-2xl" />
                    <div className="mt-auto lg:my-auto lg:py-10 max-w-[470px]">
                        <h2 className="max-w-[22ch] lg:max-w-none text-xl lg:text-[clamp(28px,2.5vw,38px)] font-extrabold tracking-[-0.025em] leading-[1.14] text-balance">
                            Do balcão à retirada, a gráfica inteira num lugar só.
                        </h2>
                        <p className="hidden lg:block mt-4 max-w-[42ch] text-[15px] leading-relaxed text-white/75">
                            Ordens de serviço, produção, orçamentos e o caixa do dia, ao vivo para toda a equipe.
                        </p>
                        <ul className="hidden lg:grid mt-8 gap-[18px]">
                            {RECURSOS.map(r => (
                                <li key={r.titulo} className="grid grid-cols-[36px_1fr] gap-x-3.5 items-center">
                                    <span className="row-span-2 w-9 h-9 rounded-lg grid place-items-center bg-white/[.07] text-[var(--marca-azul)]">
                                        <Icon name={r.icone} className="w-4 h-4" />
                                    </span>
                                    <b className="text-[14px] font-bold leading-snug">{r.titulo}</b>
                                    <span className="text-[13px] leading-snug text-white/75">{r.texto}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="hidden lg:block text-[12px] text-white/55">Berlim Gráfica Rápida · sistema interno</p>
                </div>
            </section>

            <section className="relative -mt-[18px] lg:mt-0 rounded-t-xl lg:rounded-none bg-superficie px-4 pt-7 pb-10 lg:px-8 lg:py-14 lg:grid lg:place-items-center lg:overflow-y-auto">
                <button
                    type="button"
                    onClick={toggleDarkMode}
                    aria-label={darkMode ? 'Tema claro' : 'Tema escuro'}
                    className={`absolute top-[22px] right-3 lg:top-[18px] lg:right-[18px] w-9 h-9 grid place-items-center rounded-lg text-tinta-suave hover:bg-realce hover:text-tinta transition-colors ${foco}`}
                >
                    <Icon name={darkMode ? 'sun' : 'moon'} className="w-[18px] h-[18px]" />
                </button>

                <form onSubmit={enviar} noValidate className="w-full max-w-[372px] mx-auto flex flex-col animate-subir [animation-delay:.15s]">
                    <h1 className="pr-11 lg:pr-0 text-[26px] lg:text-[30px] font-extrabold tracking-[-0.025em] leading-tight text-tinta">{ola}</h1>
                    <p className="mt-2 text-[14px] leading-normal text-tinta-suave">Entre com o seu e-mail e a sua senha da Berlim.</p>

                    <div className="mt-[30px] grid gap-[18px]">
                        <div>
                            <label htmlFor="entrada-email" className="block mb-[7px] text-[12.5px] font-semibold text-tinta-corpo">E-mail</label>
                            <div className={campoCaixa(erroCampo?.campo === 'email')}>
                                <Icon name="mail" className={campoIcone} />
                                <input
                                    ref={emailRef}
                                    id="entrada-email"
                                    name="email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="username"
                                    spellCheck={false}
                                    value={loginInput}
                                    onChange={(e) => { setLoginInput(e.target.value); limparErro(); }}
                                    placeholder="voce@exemplo.com"
                                    aria-invalid={erroCampo?.campo === 'email' || undefined}
                                    className={campoInput}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline justify-between gap-3 mb-[7px]">
                                <label htmlFor="entrada-senha" className="text-[12.5px] font-semibold text-tinta-corpo">Senha</label>
                                <button
                                    type="button"
                                    onClick={() => setAjudaSenha(a => !a)}
                                    aria-expanded={ajudaSenha}
                                    aria-controls="entrada-ajuda-senha"
                                    className={`text-[12.5px] font-semibold text-brand-tinta hover:underline underline-offset-[3px] rounded ${foco}`}
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                            <CampoSenha
                                id="entrada-senha"
                                inputRef={senhaRef}
                                value={senhaInput}
                                onChange={(v) => { setSenhaInput(v); limparErro(); }}
                                comErro={erroNaSenha}
                            />
                            {ajudaSenha && (
                                <p id="entrada-ajuda-senha" className="mt-2 flex items-start gap-[7px] text-[12.5px] leading-snug text-tinta-suave">
                                    <Icon name="info" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    Um administrador troca a sua senha em Cadastros, na aba Usuários. Depois é só entrar com a nova.
                                </p>
                            )}
                        </div>
                    </div>

                    {erro && <AvisoErro className="mt-4">{erro}</AvisoErro>}
                    <button type="submit" disabled={entrando} aria-busy={entrando || undefined} className={`${erro ? 'mt-4' : 'mt-6'} ${botaoPrimario}`}>
                        {entrando ? <><Girando />Entrando…</> : 'Entrar'}
                    </button>

                    <div className="my-[22px] flex items-center gap-3 text-[12px] font-medium text-tinta-suave before:flex-1 before:h-px before:bg-borda after:flex-1 after:h-px after:bg-borda">ou</div>

                    <button type="button" onClick={aoGoogle} disabled={abrindoGoogle} aria-busy={abrindoGoogle || undefined} className={botaoSecundario}>
                        {abrindoGoogle ? <Girando /> : <IconeGoogle />}
                        {abrindoGoogle ? 'Abrindo o Google…' : 'Entrar com Google'}
                    </button>

                    {temDemo && (
                        <p className="mt-7 text-center text-[13px] text-tinta-suave">
                            Só quer conhecer o sistema?{' '}
                            <button type="button" onClick={entrarComoDemo} className={`font-semibold text-brand-tinta hover:underline underline-offset-[3px] rounded ${foco}`}>
                                Entrar como visitante
                            </button>
                        </p>
                    )}
                </form>
            </section>
        </main>
    );
}
