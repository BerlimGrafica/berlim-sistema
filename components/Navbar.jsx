"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessao } from "@/context/SessaoContext";
import { useUi } from "@/context/UiContext";
import { useChatEquipe } from "@/context/ChatContext";
import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import ChatPanel from "@/components/ChatPanel";
import { CustomSelect } from "@/components/ui/Dropdown";
import { useNavegarAlerta } from "@/hooks/useNavegarAlerta";

// Um destino por linha, com quem enxerga cada um.
//
// Antes a permissão vivia no JSX, escrita à mão em torno de cada <Link>. Com o
// seletor do celular seriam duas cópias da mesma regra por destino, e a primeira
// mudança de permissão acertaria uma e esqueceria a outra — alguém veria a aba
// numa largura de tela e não na outra. Aqui a regra existe uma vez e as duas
// formas de navegação leem dela.
const DESTINOS = [
    { href: '/',              rotulo: 'Início',        icone: 'layout-dashboard', ve: () => true },
    { href: '/producao',      rotulo: 'Produção',      icone: 'grid',             ve: n => n === 'Administrador' || n === 'Atendimento' || n === 'Produção' },
    { href: '/baixa',         rotulo: 'O.S.',          icone: 'check-circle',     ve: () => true },
    { href: '/calculadoras',  rotulo: 'Calculadoras',  icone: 'calculator',       ve: n => n !== 'Financeiro' },
    { href: '/financeiro',    rotulo: 'Financeiro',    icone: 'dollar-sign',      ve: n => n === 'Administrador' || n === 'Financeiro' },
    { href: '/vendas',        rotulo: 'Vendas',        icone: 'trending-up',      ve: n => n === 'Administrador' || n === 'Financeiro' },
    { href: '/notas-fiscais', rotulo: 'Notas Fiscais', icone: 'file-text',        ve: n => n === 'Atendimento' },
    { href: '/orcamentos',    rotulo: 'Orçamentos',    icone: 'edit-3',           ve: n => n !== 'Financeiro' },
    { href: '/cadastros',     rotulo: 'Cadastros',     icone: 'users',            ve: n => n !== 'Financeiro' },
    { href: '/comunicacao',   rotulo: 'Comunicação',   icone: 'mail',             ve: () => true },
];

// Atalhos para os sites das terceirizadas. Os ícones vêm do serviço de favicon
// do Google — se ele falhar, sobra o alt e o link continua clicável.
const ATALHOS = [
    { href: 'https://www.futuraim.com.br/',     dominio: 'futuraim.com.br',  nome: 'Futura IM' },
    { href: 'https://oferta.atualcard.com.br/', dominio: 'atualcard.com.br', nome: 'Atual Card' },
    { href: 'https://www.alvoprint.com.br/',    dominio: 'alvoprint.com.br', nome: 'Alvo Print' },
];

function AtalhosExternos({ className = '' }) {
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {ATALHOS.map(({ href, dominio, nome }) => (
                <Tooltip key={dominio} label={`Acessar ${nome}`}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Acessar ${nome}`} className="p-2 rounded-md hover:bg-realce transition flex items-center justify-center shrink-0">
                        <img src={`https://www.google.com/s2/favicons?domain=${dominio}&sz=64`} alt={nome} className="w-5 h-5 object-contain rounded-sm" />
                    </a>
                </Tooltip>
            ))}
        </div>
    );
}

export default function Navbar() {
    const { toggleDarkMode, darkMode, usuario, logout, googleVinculado, vincularGoogle, desvincularGoogle } = useSessao();
    const { setModalAlertasAberto, modalAlertasAberto, alertasNaoLidos, setAlertasNaoLidos, confirmar } = useUi();
    const { abrirChat, chatNaoLidas } = useChatEquipe();
    const notificacoesRef = useRef(null);
    const atalhosRef = useRef(null);
    const [atalhosAbertos, setAtalhosAbertos] = useState(false);
    const navegarParaAlerta = useNavegarAlerta();
    const pathname = usePathname();
    const router = useRouter();

    const destinos = DESTINOS.filter(d => d.ve(usuario?.nivel));
    const destinoAtual = destinos.find(d => d.href === pathname);

    useEffect(() => {
        if (!modalAlertasAberto) return;
        const handleClickFora = (e) => {
            if (notificacoesRef.current && !notificacoesRef.current.contains(e.target)) {
                setModalAlertasAberto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => document.removeEventListener('mousedown', handleClickFora);
    }, [modalAlertasAberto, setModalAlertasAberto]);

    useEffect(() => {
        if (!atalhosAbertos) return;
        const aoClicarFora = (e) => {
            if (atalhosRef.current && !atalhosRef.current.contains(e.target)) setAtalhosAbertos(false);
        };
        document.addEventListener('mousedown', aoClicarFora);
        return () => document.removeEventListener('mousedown', aoClicarFora);
    }, [atalhosAbertos]);

    // Trocar de seção com os atalhos abertos deixava o painel pendurado sobre a
    // tela nova.
    useEffect(() => { setAtalhosAbertos(false); }, [pathname]);

    return (
        <>
            <header className="sticky top-0 z-40 bg-campo px-4 lg:px-6 h-[var(--altura-barra)] flex justify-between items-center gap-3">
                    {/* A marca não pode encolher: sem o shrink-0 ela era a primeira coisa
                        que o flex espremia quando o lado direito não cabia, e sumia da
                        tela sem deixar rastro. Em tela estreita entra o ícone do próprio
                        sistema, servido daqui — a assinatura completa vem de um host
                        externo e não cabe na largura de um celular. */}
                    <div className="flex items-center shrink-0">
                        <img src="/icon.png" alt="Berlim Gráfica" className="h-7 w-7 object-contain lg:hidden" />
                        <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-8 object-contain hidden lg:block" />
                    </div>
                    <div className="flex items-center gap-2 lg:gap-5 min-w-0">
                        <Tooltip label="Chat da Equipe">
                            <button onClick={() => abrirChat()} aria-label="Abrir chat" className="p-2 rounded-md hover:bg-realce transition text-gray-600 dark:text-[#888888] relative shrink-0">
                                <Icon name="message-circle" className="w-5 h-5" />
                                {chatNaoLidas > 0 && (
                                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                                        {chatNaoLidas}
                                    </span>
                                )}
                            </button>
                        </Tooltip>

                        <div className="relative shrink-0" ref={notificacoesRef}>
                            <button onClick={() => setModalAlertasAberto(!modalAlertasAberto)} aria-label="Notificações" className="p-2 rounded-md hover:bg-realce transition text-gray-600 dark:text-[#888888] relative">
                                <Icon name="bell" className="w-5 h-5" />
                                {alertasNaoLidos.length > 0 && (
                                    <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                                        {alertasNaoLidos.length}
                                    </span>
                                )}
                            </button>
                            {/* No celular o sino fica à esquerda da barra, e um painel
                                ancorado nele com `right-0` cresce para a esquerda —
                                saindo da tela. Abaixo de sm ele passa a se ancorar na
                                JANELA (fixed, preso às duas margens), logo abaixo da
                                barra; de sm em diante volta a pendurar no ícone, que é
                                onde há espaço de sobra. */}
                            {modalAlertasAberto && (
                                <div className="fixed left-2 right-2 top-[calc(var(--altura-barra)+0.25rem)] w-auto sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 bg-elevado border border-borda rounded-lg shadow-lg py-2 z-50">
                                    <div className="px-4 py-2 border-b border-borda-fraca flex justify-between items-center">
                                        <h3 className="font-semibold text-corpo dark:text-white">Notificações</h3>
                                        {alertasNaoLidos.length > 0 && (
                                            <button onClick={() => setAlertasNaoLidos([])} className="text-mini text-brand hover:underline">Limpar</button>
                                        )}
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {alertasNaoLidos.length === 0 ? (
                                            <p className="px-4 py-4 text-mini text-gray-500 text-center">Nenhuma nova notificação.</p>
                                        ) : (
                                            alertasNaoLidos.slice().reverse().map(alerta => (
                                                <div key={alerta.id} className="px-4 py-3 hover:bg-sutil border-b border-gray-50 dark:border-darkBorder/50 last:border-0 cursor-pointer flex justify-between items-start group" onClick={() => {
                                                    setModalAlertasAberto(false);
                                                    navegarParaAlerta(alerta);
                                                }}>
                                                    <div className="flex-1 pr-2">
                                                        <p className="text-mini text-tinta">{alerta.msg}</p>
                                                        <span className="text-micro text-gray-400 mt-1 block">Agora</span>
                                                    </div>
                                                    <button type="button" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAlertasNaoLidos(prev => prev.filter(a => a.id !== alerta.id));
                                                    }} className="text-gray-400 hover:text-gray-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition p-1">
                                                        <Icon name="x" className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={toggleDarkMode} aria-label="Alternar tema" className="p-2 rounded-md hover:bg-realce transition text-gray-600 dark:text-[#888888] shrink-0">
                            <Icon name={darkMode ? "sun" : "moon"} className="w-5 h-5" />
                        </button>

                        {/* SEPARADOR ATALHOS */}
                        <div className="hidden lg:block w-[1px] h-8 bg-gray-200 dark:border-darkBorder"></div>

                        {/* Em tela estreita os atalhos descem para a faixa de navegação:
                            aqui em cima eles competiam por largura com a marca e com os
                            ícones de conta, e o flex resolvia a disputa apagando quem
                            podia encolher. */}
                        <AtalhosExternos className="hidden lg:flex" />

                        {/* SEPARADOR DE ELEGÂNCIA */}
                        <div className="hidden lg:block w-[1px] h-8 bg-gray-200 dark:border-darkBorder"></div>

                        {/* BLOCO DO USUÁRIO */}
                        <div className="flex items-center gap-4 select-none min-w-0">
                            {/* Nome e cargo são informativos e custam caro em largura —
                                somem no celular, onde a conta já está implícita. */}
                            <div className="hidden lg:flex flex-col text-right min-w-0">
                                <span className="text-corpo font-extrabold text-tinta leading-none truncate">
                                    {usuario?.nome}
                                </span>
                                <span className="text-mini font-medium text-brand italic mt-1 tracking-wide truncate">
                                    {usuario?.nivel}
                                </span>
                            </div>
                            <Tooltip label={googleVinculado ? 'Desvincular conta Google' : 'Vincular conta Google (login rápido)'} className="hidden lg:block">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (googleVinculado) {
                                            if (await confirmar('Desvincular sua conta Google? Você vai deixar de conseguir entrar com o botão "Entrar com Google".')) desvincularGoogle();
                                        } else {
                                            vincularGoogle();
                                        }
                                    }}
                                    aria-label={googleVinculado ? 'Desvincular conta Google' : 'Vincular conta Google'}
                                    className={`transition p-2 rounded-md ${googleVinculado ? 'text-emerald-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-gray-400 hover:text-brand hover:bg-realce'}`}
                                >
                                    <Icon name="link" className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            <Tooltip label="Sair do Sistema">
                                <button type="button" onClick={() => logout()} aria-label="Sair do Sistema" className="text-gray-400 hover:text-red-500 transition p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0">
                                    <Icon name="log-out" className="w-5 h-5" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </header>

            {/* A barra usa a cor do tema, não a da marca. O laranja ficou só no
                detalhe: o filete e o ícone da aba ativa. Antes, "Berlim" — o
                local padrão, presente em quase toda O.S. — dividia o mesmo
                laranja com a navegação inteira, o que gastava o destaque na
                informação mais banal da tela. */}
            <nav className="bg-superficie px-4 lg:px-6 shadow-sm z-30 sticky top-[var(--altura-barra)] h-[var(--altura-abas)]">
                    {/* Celular: um seletor com a seção atual. Dez destinos numa fita
                        que rola de lado obrigam a arrastar às cegas — não dá para ver
                        o que existe, e a aba ativa pode estar fora da tela. O seletor
                        mostra onde você está e abre a lista inteira de uma vez. */}
                    <div className="flex lg:hidden items-center gap-1.5 h-full">
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
                                label: d.rotulo,
                                icon: <Icon name={d.icone} className={`w-4 h-4 shrink-0 ${d.href === pathname ? 'text-brand' : 'text-tinta-suave'}`} />,
                            }))}
                        />
                        </div>
                        {/* Atalhos recolhidos atrás de uma seta: são conveniência, não
                            navegação, e lado a lado com o seletor competiam pela atenção
                            numa faixa que só tem 48px de altura. */}
                        <div className="relative shrink-0" ref={atalhosRef}>
                            <button
                                type="button"
                                onClick={() => setAtalhosAbertos(v => !v)}
                                aria-label="Sites das terceirizadas"
                                aria-expanded={atalhosAbertos}
                                className="w-11 flex items-center justify-center py-2 rounded-md text-gray-400 hover:text-tinta hover:bg-realce transition"
                            >
                                <Icon name="chevron-down" className={`w-4 h-4 transition-transform ${atalhosAbertos ? 'rotate-180' : ''}`} />
                            </button>
                            {/* w-max é o que segura os ícones. Um elemento absoluto ajusta
                                a largura ao conteúdo, mas limitado à do bloco que o contém
                                — e aqui esse bloco é o botão de 44px. Sem w-max, os três
                                ícones tentavam caber em 44px e transbordavam a moldura. */}
                            {atalhosAbertos && (
                                <div className="absolute right-0 top-full mt-1 z-50 w-max bg-elevado border border-borda rounded-md shadow-lg p-1" onClick={() => setAtalhosAbertos(false)}>
                                    <AtalhosExternos />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop: as abas de sempre. O shrink-0 é o que faz a fita rolar
                        em vez de espremer — sem ele, o flex encolhe as abas e o texto,
                        que é whitespace-nowrap, transborda por cima da vizinha. */}
                    <div className="hidden lg:flex gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar-style items-end pt-2.5 h-full">
                        {destinos.map(({ href, rotulo, icone }) => {
                            const ativo = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`px-4 py-2.5 text-corpo font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 rounded-t-lg flex items-center gap-2 tracking-wide uppercase border-t-2 ${ativo ? 'bg-fundo text-tinta border-brand shadow-[0_-2px_6px_rgba(0,0,0,0.08)]' : 'border-transparent text-tinta-suave hover:bg-sutil hover:text-tinta'}`}
                                >
                                    <Icon name={icone} className={`w-4 h-4 shrink-0 ${ativo ? 'text-brand' : ''}`} /> {rotulo}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            <ChatPanel />
        </>
    );
}
