"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessao } from "@/context/SessaoContext";
import { useUi } from "@/context/UiContext";
import { useChatEquipe } from "@/context/ChatContext";
import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import Avatar from "@/components/ui/Avatar";
import { CustomSelect } from "@/components/ui/Dropdown";
import { useIrParaPendencia } from "@/hooks/useIrParaPendencia";
import { gravidadeDe } from "@/lib/alertas/pendencias";
import { telasVisiveis } from "@/lib/acesso/telas";
import { useMenuLateral } from "@/hooks/useMenuLateral";
import { BLOQUEIO_LIGADO } from "@/hooks/useAuth";

// A lista de destinos do menu vem de lib/acesso/telas.js, e não mais de uma
// tabela escrita aqui dentro. Ela deixou de ser regra de menu: a mesma lista
// responde pelo que abre por URL (o guarda de rota) e pelo que o administrador
// marca no cadastro do usuário. Escrita em três lugares, divergiria na primeira
// permissão nova — alguém veria a aba e tomaria um "acesso negado" ao clicar.
//
// A BARRA É UMA BANCADA, NÃO UMA VITRINE
// À esquerda, o menu e a marca. À direita, três grupos separados por um fio:
// os sites das terceirizadas, as ferramentas do dia (chat, pendências, tema) e
// a conta. Ícones de um peso só, cinza até a mão chegar; a cor fica para o que
// pede atenção — os contadores. O que se usa uma vez por mês (vincular o
// Google, sair) mora dentro do menu da conta, e não solto na barra, onde um
// clique errado derrubava a sessão.

// Atalhos para os sites das terceirizadas. Os ícones vêm do serviço de favicon
// do Google — se ele falhar, sobra o alt e o link continua clicável.
const ATALHOS = [
    { href: 'https://www.futuraim.com.br/',     dominio: 'futuraim.com.br',  nome: 'Futura IM' },
    { href: 'https://oferta.atualcard.com.br/', dominio: 'atualcard.com.br', nome: 'Atual Card' },
    { href: 'https://www.alvoprint.com.br/',    dominio: 'alvoprint.com.br', nome: 'Alvo Print' },
];
const favicon = (dominio) => `https://www.google.com/s2/favicons?domain=${dominio}&sz=64`;

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const botaoIcone = `relative grid place-items-center w-9 h-9 rounded-lg text-tinta-suave hover:bg-realce hover:text-tinta transition-colors duration-150 shrink-0 ${foco}`;
const painel = 'bg-elevado border border-borda rounded-[9px] shadow-pop z-50 animate-pop';
const itemMenu = 'w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors duration-150 outline-none hover:bg-realce focus-visible:bg-realce';

// Um painel pendurado num botão da barra fecha com clique fora dele e com Esc —
// que devolve o foco ao botão, para quem está no teclado não se perder.
function useFecharPainel(aberto, fechar) {
    const caixaRef = useRef(null);
    const botaoRef = useRef(null);
    useEffect(() => {
        if (!aberto) return;
        const aoClicarFora = (e) => { if (caixaRef.current && !caixaRef.current.contains(e.target)) fechar(); };
        const aoTeclar = (e) => { if (e.key === 'Escape') { fechar(); botaoRef.current?.focus(); } };
        document.addEventListener('mousedown', aoClicarFora);
        document.addEventListener('keydown', aoTeclar);
        return () => {
            document.removeEventListener('mousedown', aoClicarFora);
            document.removeEventListener('keydown', aoTeclar);
        };
    }, [aberto, fechar]);
    return { caixaRef, botaoRef };
}

// O número no canto do ícone. Vazado por um anel da cor da barra, para não
// colar no desenho do ícone; acima de 99 vira "99+" e não alarga a bolinha.
function Contador({ n, cor }) {
    if (!n) return null;
    return (
        <span aria-hidden="true" className={`absolute top-0.5 right-0.5 min-w-4 h-4 px-1 grid place-items-center rounded-full text-micro font-bold leading-none tabular-nums ring-2 ring-superficie pointer-events-none ${cor}`}>
            {n > 99 ? '99+' : n}
        </span>
    );
}

// No computador, os três sites ficam numa peça só, com um clique cada: são
// abertos várias vezes por dia no balcão. Soltos na barra, três logotipos
// coloridos disputavam a atenção com tudo; juntos numa moldura, viram uma
// ferramenta.
function AtalhosNaBarra() {
    return (
        <div role="group" aria-label="Sites das terceirizadas" className="hidden lg:flex items-center gap-0.5 h-9 p-0.5 rounded-lg border border-borda shrink-0">
            {ATALHOS.map(({ href, dominio, nome }) => (
                <Tooltip key={dominio} label={`Abrir o site da ${nome}`}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Abrir o site da ${nome}`} className={`grid place-items-center w-8 h-[30px] rounded-md hover:bg-realce transition-colors duration-150 ${foco}`}>
                        <img src={favicon(dominio)} alt="" className="w-[18px] h-[18px] object-contain rounded-sm" />
                    </a>
                </Tooltip>
            ))}
        </div>
    );
}

// No celular, os sites descem para a faixa do seletor de seções, atrás de um
// botão: são conveniência, não navegação. O botão mostra os três ícones
// sobrepostos — como as bolinhas de pessoas, mas com canto, porque favicon é
// quadrado — e o menu, o nome de cada um.
function AtalhosNoCelular() {
    const [abertoEm, setAbertoEm] = useState(null);
    const pathname = usePathname();
    // Trocar de seção fecha o menu: ele ficaria pendurado sobre a tela nova.
    const aberto = abertoEm === pathname;
    const fechar = useCallback(() => setAbertoEm(null), []);
    const { caixaRef, botaoRef } = useFecharPainel(aberto, fechar);

    return (
        <div className="relative shrink-0" ref={caixaRef}>
            <button
                ref={botaoRef}
                type="button"
                onClick={() => setAbertoEm(aberto ? null : pathname)}
                aria-label="Sites das terceirizadas"
                aria-expanded={aberto}
                className={`flex items-center h-10 px-2.5 rounded-md border border-borda hover:bg-realce transition-colors ${aberto ? 'bg-realce' : ''} ${foco}`}
            >
                <span className="flex -space-x-1.5">
                    {ATALHOS.map(({ dominio }) => (
                        <img key={dominio} src={favicon(dominio)} alt="" className="w-5 h-5 p-px object-contain rounded-[5px] bg-white ring-2 ring-superficie" />
                    ))}
                </span>
            </button>
            {aberto && (
                <div className={`absolute right-0 top-full mt-1.5 w-60 p-1 ${painel}`} onClick={fechar}>
                    <p className="px-2.5 pt-1.5 pb-1 text-mini font-semibold text-tinta-suave">Sites das terceirizadas</p>
                    {ATALHOS.map(({ href, dominio, nome }) => (
                        <a key={dominio} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 h-11 px-2.5 rounded-md text-corpo font-semibold text-tinta hover:bg-realce outline-none focus-visible:bg-realce">
                            <img src={favicon(dominio)} alt="" className="w-[18px] h-[18px] object-contain rounded-sm" />
                            {nome}
                            <Icon name="external-link" className="w-3.5 h-3.5 ml-auto text-tinta-fraca" />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

function PainelPendencias() {
    const { setModalAlertasAberto, modalAlertasAberto, pendencias, pendenciaGravidade } = useUi();
    const irParaPendencia = useIrParaPendencia();
    const fechar = useCallback(() => setModalAlertasAberto(false), [setModalAlertasAberto]);
    const { caixaRef, botaoRef } = useFecharPainel(modalAlertasAberto, fechar);
    const n = pendencias.length;

    return (
        <div className="relative shrink-0" ref={caixaRef}>
            <button
                ref={botaoRef}
                type="button"
                onClick={() => setModalAlertasAberto(!modalAlertasAberto)}
                aria-label={n ? `Pendências: ${n}` : 'Pendências'}
                aria-expanded={modalAlertasAberto}
                aria-controls="painel-pendencias"
                className={`${botaoIcone} ${modalAlertasAberto ? 'bg-realce text-tinta' : ''}`}
            >
                <Icon name="bell" className="w-[18px] h-[18px]" />
                {/* O número conta pendências abertas, não avisos não lidos:
                    ele só cai quando o trabalho é feito. E a cor já diz o
                    que fazer primeiro — vermelho tem coisa atrasada. */}
                <Contador n={n} cor={gravidadeDe(pendenciaGravidade).contador} />
            </button>
            {/* No celular o sino fica perto do meio da barra, e um painel
                ancorado nele com `right-0` cresce para a esquerda — saindo da
                tela. Abaixo de sm ele se ancora na JANELA (fixed, preso às duas
                margens), logo abaixo da barra; de sm em diante volta a pendurar
                no ícone, que é onde há espaço de sobra. */}
            {modalAlertasAberto && (
                <div id="painel-pendencias" className={`fixed left-2 right-2 top-[calc(var(--altura-barra)+0.25rem)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px] overflow-hidden ${painel}`}>
                    <div className="flex items-baseline gap-2 px-4 pt-3 pb-2.5 border-b border-borda-fraca">
                        <h3 className="text-corpo font-bold text-tinta">Pendências</h3>
                        {n > 0 && <span className="text-mini font-semibold text-tinta-suave tabular-nums">{n}</span>}
                    </div>
                    {/* Não há botão de limpar nem X por item, de propósito:
                        uma pendência sai daqui quando é resolvida. É o que
                        torna o número confiável — antes dava para zerar o
                        sino sem ter feito nada. */}
                    <div className="max-h-[min(420px,calc(100dvh-120px))] overflow-y-auto custom-scrollbar p-1">
                        {n === 0 ? (
                            <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
                                <Icon name="check-circle" className="w-5 h-5 text-sucesso mb-1" />
                                <p className="text-corpo font-semibold text-tinta">Nada pendente</p>
                                <p className="text-mini text-tinta-suave">Tudo em dia.</p>
                            </div>
                        ) : (
                            pendencias.map(pendencia => {
                                const g = gravidadeDe(pendencia.gravidade);
                                return (
                                    <button
                                        key={pendencia.id}
                                        type="button"
                                        onClick={() => { setModalAlertasAberto(false); irParaPendencia(pendencia); }}
                                        className={`group ${itemMenu} px-3`}
                                    >
                                        <span className={`shrink-0 w-2 h-2 rounded-full mt-[5px] ${g.ponto}`} />
                                        <span className="min-w-0 flex-1">
                                            <span className={`block text-corpo font-semibold leading-snug ${g.texto}`}>{pendencia.titulo}</span>
                                            <span className="block text-mini text-tinta-suave truncate mt-0.5">{pendencia.detalhe}</span>
                                        </span>
                                        <Icon name="chevron-right" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-tinta-fraca opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// A conta: quem está logado, com que cargo, bloquear a tela e as duas ações
// raras. Bloquear não encerra nada, então vai no primeiro clique. Sair e
// desvincular o Google pedem o segundo clique no próprio item, como toda ação
// que encerra algo no sistema — sem janela de confirmação por cima.
function MenuConta() {
    const { usuario, logout, googleVinculado, vincularGoogle, desvincularGoogle, isDemo, bloquearTela } = useSessao();
    const [abertoEm, setAbertoEm] = useState(null);
    const [confirmando, setConfirmando] = useState(null); // 'sair' | 'google'
    const pathname = usePathname();
    const aberto = abertoEm === pathname;
    const fechar = useCallback(() => { setAbertoEm(null); setConfirmando(null); }, []);
    const { caixaRef, botaoRef } = useFecharPainel(aberto, fechar);
    const menuRef = useRef(null);
    const abertoPeloTecladoRef = useRef(false);

    // O segundo clique vale por alguns segundos; depois o item volta ao normal,
    // para um clique distraído mais tarde não encerrar nada.
    useEffect(() => {
        if (!confirmando) return;
        const t = setTimeout(() => setConfirmando(null), 4000);
        return () => clearTimeout(t);
    }, [confirmando]);

    // Abriu pelo teclado (Enter ou espaço: o clique chega com detail 0), o foco
    // entra no primeiro item; pelo mouse, fica no botão, sem item aceso à toa.
    // Nos dois casos as setas andam pelos itens.
    useEffect(() => {
        if (aberto && abertoPeloTecladoRef.current) menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    }, [aberto]);
    const aoTeclarNoBotao = (e) => {
        if (!aberto || e.key !== 'ArrowDown') return;
        e.preventDefault();
        menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    };
    const aoTeclarNoMenu = (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const itens = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
        const i = itens.indexOf(document.activeElement);
        itens[(i + (e.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length]?.focus();
    };

    const aoClicarGoogle = () => {
        if (!googleVinculado) { fechar(); vincularGoogle(); return; }
        if (confirmando !== 'google') { setConfirmando('google'); return; }
        fechar();
        desvincularGoogle();
    };
    const aoClicarSair = () => {
        if (confirmando !== 'sair') { setConfirmando('sair'); return; }
        fechar();
        logout();
    };

    return (
        <div className="relative shrink-0" ref={caixaRef}>
            <button
                ref={botaoRef}
                type="button"
                onClick={(e) => {
                    if (aberto) return fechar();
                    abertoPeloTecladoRef.current = e.detail === 0;
                    setAbertoEm(pathname);
                }}
                onKeyDown={aoTeclarNoBotao}
                aria-haspopup="menu"
                aria-expanded={aberto}
                aria-label={`Conta de ${usuario?.nome || 'usuário'}`}
                className={`flex items-center gap-2.5 h-10 p-1.5 lg:pr-2.5 rounded-lg hover:bg-realce transition-colors duration-150 ${aberto ? 'bg-realce' : ''} ${foco}`}
            >
                <Avatar nome={usuario?.nome} avatarUrl={usuario?.avatar_url} className="w-7 h-7 text-micro" />
                {/* Nome e cargo custam largura — no celular fica só a bolinha. */}
                <span className="hidden lg:flex flex-col items-start min-w-0 max-w-40 text-left">
                    <span className="max-w-full text-corpo font-semibold text-tinta leading-tight truncate">{usuario?.nome}</span>
                    <span className="max-w-full text-mini font-medium text-tinta-suave leading-tight truncate">{usuario?.nivel}</span>
                </span>
                <Icon name="chevron-down" className={`hidden lg:block w-3.5 h-3.5 text-tinta-fraca transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`} />
            </button>

            {aberto && (
                <div ref={menuRef} role="menu" aria-label="Sua conta" onKeyDown={aoTeclarNoMenu} className={`absolute right-0 top-full mt-2 w-72 p-1 ${painel}`}>
                    <div className="flex items-center gap-3 px-2.5 pt-2 pb-2.5">
                        <Avatar nome={usuario?.nome} avatarUrl={usuario?.avatar_url} className="w-9 h-9 text-mini" />
                        <div className="min-w-0">
                            <p className="text-corpo font-semibold text-tinta truncate">{usuario?.nome}</p>
                            <p className="text-mini text-tinta-suave truncate">{usuario?.nivel}</p>
                        </div>
                    </div>
                    <hr className="border-borda-fraca mx-1 mb-1" />

                    <button type="button" role="menuitem" onClick={aoClicarGoogle} className={`${itemMenu} ${confirmando === 'google' ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
                        <Icon name={googleVinculado ? 'unlink' : 'link'} className={`w-4 h-4 mt-px shrink-0 ${confirmando === 'google' ? 'text-perigo' : 'text-tinta-suave'}`} />
                        <span className="min-w-0">
                            <span className={`block text-corpo font-semibold ${confirmando === 'google' ? 'text-perigo' : 'text-tinta'}`}>
                                {!googleVinculado ? 'Vincular conta Google' : confirmando === 'google' ? 'Clique de novo para desvincular' : 'Desvincular conta Google'}
                            </span>
                            <span className="block text-mini text-tinta-suave mt-0.5">
                                {!googleVinculado ? 'Para entrar com um clique, sem senha' : confirmando === 'google' ? 'Você volta a entrar só com a senha' : 'Vinculada: você entra pelo botão do Google'}
                            </span>
                        </span>
                    </button>

                    <hr className="border-borda-fraca mx-1 my-1" />

                    {BLOQUEIO_LIGADO && !isDemo && (
                        <button type="button" role="menuitem" onClick={() => { fechar(); bloquearTela(); }} className={itemMenu}>
                            <Icon name="lock" className="w-4 h-4 mt-px shrink-0 text-tinta-suave" />
                            <span className="min-w-0">
                                <span className="block text-corpo font-semibold text-tinta">Bloquear a tela</span>
                                <span className="block text-mini text-tinta-suave mt-0.5">Tudo continua aberto; volta com a senha</span>
                            </span>
                        </button>
                    )}

                    <button type="button" role="menuitem" onClick={aoClicarSair} className={`${itemMenu} items-center ${confirmando === 'sair' ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
                        <Icon name="log-out" className={`w-4 h-4 shrink-0 ${confirmando === 'sair' ? 'text-perigo' : 'text-tinta-suave'}`} />
                        <span className={`text-corpo font-semibold ${confirmando === 'sair' ? 'text-perigo' : 'text-tinta'}`}>
                            {confirmando === 'sair' ? 'Clique de novo para sair' : 'Sair do sistema'}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const { toggleDarkMode, darkMode, usuario, isDemo, bloquearTela } = useSessao();
    const { pendenciasPorDestino } = useUi();
    const { abrirChat, chatNaoLidas } = useChatEquipe();
    const pathname = usePathname();
    const router = useRouter();

    const destinos = telasVisiveis(usuario);
    const { aberto: menuAberto, alternar: alternarMenu } = useMenuLateral();

    return (
        <>
            {/* A linha embaixo da barra só no computador. Lá a barra e o menu
                lateral têm o mesmo fundo e se emendariam sem separação; a borda
                é a mesma da lateral do menu, então as duas se encontram no
                canto. No celular a barra continua colada ao seletor de seções,
                que é parte dela. A borda entra na altura, não soma a ela.

                O respiro da esquerda (12px) põe o centro do botão do menu a
                32px da borda — o mesmo eixo dos ícones do menu recolhido. */}
            <header className="sticky top-0 z-40 bg-superficie px-4 lg:pl-3 lg:pr-4 h-[var(--altura-barra)] lg:border-b lg:border-borda flex items-center gap-3">
                {/* A marca não pode encolher: sem o shrink-0 ela era a primeira coisa
                    que o flex espremia quando o lado direito não cabia, e sumia da
                    tela sem deixar rastro. Em tela estreita entra o ícone do próprio
                    sistema, servido daqui; no computador, o nome escrito. */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Mostra e esconde o menu lateral — só no computador; no
                        celular a navegação é o seletor logo abaixo da barra.

                        O ícone é o próprio favicon da Berlim, e a posição dele é o
                        estado do menu: de pé com o menu aberto, ecoando a coluna da
                        lateral; deitado com o menu fechado, quando as quatro barras
                        viram o "☰" que todo mundo lê como "abrir menu". O giro tem
                        um leve tranco no fim (cubic-bezier com overshoot) para soar
                        como um clique, e some para quem pede menos movimento. */}
                    <button
                        type="button"
                        onClick={alternarMenu}
                        aria-label={menuAberto ? 'Recolher o menu' : 'Expandir o menu'}
                        aria-controls="menu-lateral"
                        aria-expanded={menuAberto}
                        className={`hidden lg:grid w-10 h-10 place-items-center rounded-lg hover:bg-realce transition-colors ${foco}`}
                    >
                        {/* O giro vai em `transform` com os dois ângulos escritos, e não
                            nas classes rotate-0/rotate-90. Aberto, a classe rotate-0
                            resolvia para `rotate: none` — que não é um ângulo — e a
                            transição de `none` para 90deg não era interpolada: ao
                            fechar, o ícone ficava parado um segundo e pulava. Com
                            rotate(0deg) ↔ rotate(90deg) os dois sentidos animam. */}
                        <Image
                            src="/icon.png"
                            alt=""
                            width={20}
                            height={20}
                            unoptimized
                            style={{ transform: `rotate(${menuAberto ? 0 : 90}deg)` }}
                            className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
                        />
                    </button>
                    {/* A marca leva ao Início, como em quase todo sistema — no celular,
                        onde só o ícone aparece, o ícone faz o mesmo. */}
                    <Link href="/" aria-label="Berlim Gráfica — ir para o Início" className={`lg:hidden rounded-md ${foco}`}>
                        <img src="/icon.png" alt="" className="h-7 w-7 object-contain" />
                    </Link>
                    {/* O nome escrito: texto é nítido em qualquer tela, não depende de
                        outro servidor e acompanha o tema escuro. O laranja do BERLIM e o
                        azul do "Gráfica" são as cores do logo; por ser logotipo, fica de
                        fora da exigência de contraste que vale para o texto corrido. */}
                    <Link
                        href="/"
                        aria-label="Berlim Gráfica — ir para o Início"
                        className={`hidden lg:block px-1 text-xl font-black tracking-[-0.02em] leading-none whitespace-nowrap select-none rounded-md transition-opacity duration-150 hover:opacity-80 ${foco}`}
                    >
                        <span className="text-brand">BERLIM</span> <span className="text-brand-azul">Gráfica</span>
                    </Link>
                    {/* Bloquear a tela fica à mão, colado à marca: é o gesto de quem
                        sai do balcão por um minuto. A conta de demonstração não
                        bloqueia — o visitante não sabe a senha dela. */}
                    {BLOQUEIO_LIGADO && !isDemo && (
                        <Tooltip label="Bloquear a tela">
                            <button type="button" onClick={bloquearTela} aria-label="Bloquear a tela" className={`${botaoIcone} lg:ml-1`}>
                                <Icon name="lock" className="w-[18px] h-[18px]" />
                            </button>
                        </Tooltip>
                    )}
                </div>

                <div className="flex items-center gap-3 ml-auto min-w-0">
                    {/* Em tela estreita os atalhos descem para a faixa de navegação:
                        aqui em cima eles competiam por largura com a marca e com os
                        ícones de conta, e o flex resolvia a disputa apagando quem
                        podia encolher. */}
                    <AtalhosNaBarra />
                    <span aria-hidden="true" className="hidden lg:block w-px h-5 bg-borda" />

                    <div className="flex items-center gap-0.5">
                        <Tooltip label="Chat da equipe">
                            <button type="button" onClick={() => abrirChat()} aria-label={chatNaoLidas ? `Chat da equipe: ${chatNaoLidas} não lidas` : 'Chat da equipe'} className={botaoIcone}>
                                <Icon name="message-circle" className="w-[18px] h-[18px]" />
                                {/* Mensagem nova pede atenção, não é erro: laranja da
                                    casa, com o texto escuro que o laranja exige. */}
                                <Contador n={chatNaoLidas} cor="bg-brand text-sobre-brand" />
                            </button>
                        </Tooltip>

                        <PainelPendencias />

                        <Tooltip label={darkMode ? 'Tema claro' : 'Tema escuro'}>
                            <button type="button" onClick={toggleDarkMode} aria-label="Alternar tema" className={botaoIcone}>
                                <Icon name={darkMode ? "sun" : "moon"} className="w-[18px] h-[18px]" />
                            </button>
                        </Tooltip>
                    </div>

                    <span aria-hidden="true" className="hidden lg:block w-px h-5 bg-borda" />
                    <MenuConta />
                </div>
            </header>

            {/* A barra usa a cor do tema, não a da marca. O laranja ficou só no
                detalhe: o filete e o ícone da aba ativa. Antes, "Berlim" — o
                local padrão, presente em quase toda O.S. — dividia o mesmo
                laranja com a navegação inteira, o que gastava o destaque na
                informação mais banal da tela. */}
            <nav className="lg:hidden bg-superficie px-4 shadow-sm z-30 sticky top-[var(--altura-barra)] h-[var(--altura-abas)]">
                {/* Celular: um seletor com a seção atual. Dez destinos numa fita
                    que rola de lado obrigam a arrastar às cegas — não dá para ver
                    o que existe, e a aba ativa pode estar fora da tela. O seletor
                    mostra onde você está e abre a lista inteira de uma vez. */}
                <div className="flex items-center gap-2 h-full">
                    {/* O CustomSelect aplica a className no miolo, não no seu
                        invólucro — um flex-1 posto ali dentro não chega ao filho
                        do flex, e o seletor encolhia até o tamanho do texto.
                        Quem estica é este div. */}
                    <div className="flex-1 min-w-0">
                        <CustomSelect
                            value={pathname}
                            onChange={(destino) => { if (destino !== pathname) router.push(destino); }}
                            className="w-full bg-elevado border border-borda rounded-md px-3 py-2 text-corpo font-semibold text-tinta outline-none"
                            placeholder="Ir para..."
                            options={destinos.map(d => ({
                                value: d.href,
                                // O número entra no próprio rótulo: o seletor fechado só
                                // mostra o texto da opção, e um selo ao lado sumiria
                                // justamente quando a tela não está selecionada.
                                label: pendenciasPorDestino[d.href] ? `${d.rotulo} (${pendenciasPorDestino[d.href]})` : d.rotulo,
                                icon: <Icon name={d.icone} className={`w-4 h-4 shrink-0 ${d.href === pathname ? 'text-brand' : 'text-tinta-suave'}`} />,
                            }))}
                        />
                    </div>
                    <AtalhosNoCelular />
                </div>
            </nav>
        </>
    );
}
