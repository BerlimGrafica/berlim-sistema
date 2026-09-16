"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessao } from "@/context/SessaoContext";
import { useUi } from "@/context/UiContext";
import { useChatEquipe } from "@/context/ChatContext";
import Icon from "@/components/Icon";
import Tooltip from "@/components/Tooltip";
import { CustomSelect } from "@/components/ui/Dropdown";
import { useIrParaPendencia } from "@/hooks/useIrParaPendencia";
import { gravidadeDe } from "@/lib/alertas/pendencias";
import { telasVisiveis } from "@/lib/acesso/telas";

// A lista de destinos do menu vem de lib/acesso/telas.js, e não mais de uma
// tabela escrita aqui dentro. Ela deixou de ser regra de menu: a mesma lista
// responde pelo que abre por URL (o guarda de rota) e pelo que o administrador
// marca no cadastro do usuário. Escrita em três lugares, divergiria na primeira
// permissão nova — alguém veria a aba e tomaria um "acesso negado" ao clicar.
//
// As duas formas de navegação (fita no desktop, seletor no celular) continuam
// lendo da mesma variável, pelo mesmo motivo de antes.

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
    const { setModalAlertasAberto, modalAlertasAberto, pendencias, pendenciasPorDestino, pendenciaGravidade, confirmar } = useUi();
    const { abrirChat, chatNaoLidas } = useChatEquipe();
    const notificacoesRef = useRef(null);
    const atalhosRef = useRef(null);
    const [atalhosAbertos, setAtalhosAbertos] = useState(false);
    const irParaPendencia = useIrParaPendencia();
    const pathname = usePathname();
    const router = useRouter();

    const destinos = telasVisiveis(usuario);
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
                                {/* O número conta pendências abertas, não avisos não lidos:
                                    ele só cai quando o trabalho é feito. E a cor já diz o
                                    que fazer primeiro — vermelho tem coisa atrasada. */}
                                {pendencias.length > 0 && (
                                    <span className={`absolute top-0.5 right-0.5 min-w-[14px] h-[14px] px-1 flex items-center justify-center text-white text-[9px] font-bold rounded-full shadow-sm ${gravidadeDe(pendenciaGravidade).contador}`}>
                                        {pendencias.length}
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
                                    <div className="px-4 py-2 border-b border-borda-fraca">
                                        <h3 className="font-semibold text-corpo dark:text-white">Pendências</h3>
                                    </div>
                                    {/* Não há botão de limpar nem X por item, de propósito:
                                        uma pendência sai daqui quando é resolvida. É o que
                                        torna o número confiável — antes dava para zerar o
                                        sino sem ter feito nada. */}
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {pendencias.length === 0 ? (
                                            <p className="px-4 py-5 text-mini text-gray-500 text-center">Nada pendente. Tudo em dia.</p>
                                        ) : (
                                            pendencias.map(pendencia => {
                                                const g = gravidadeDe(pendencia.gravidade);
                                                return (
                                                    <button
                                                        key={pendencia.id}
                                                        type="button"
                                                        onClick={() => { setModalAlertasAberto(false); irParaPendencia(pendencia); }}
                                                        className="w-full text-left px-4 py-3 hover:bg-sutil border-b border-gray-50 dark:border-darkBorder/50 last:border-0 flex items-start gap-2.5"
                                                    >
                                                        <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${g.ponto}`} />
                                                        <span className="min-w-0 flex-1">
                                                            <span className={`block text-mini font-semibold ${g.texto}`}>{pendencia.titulo}</span>
                                                            <span className="block text-mini text-tinta-suave truncate">{pendencia.detalhe}</span>
                                                        </span>
                                                    </button>
                                                );
                                            })
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
                                {/* Confirma antes de sair: o botão fica encostado no de
                                    vincular Google, e um clique errado derrubava a sessão
                                    na hora, sem volta a não ser refazendo o login. */}
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (await confirmar('Sair do sistema? Você vai precisar entrar de novo para continuar.')) logout();
                                    }}
                                    aria-label="Sair do Sistema"
                                    className="text-gray-400 hover:text-red-500 transition p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                                >
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
                                // O número entra no próprio rótulo: o seletor fechado só
                                // mostra o texto da opção, e um selo ao lado sumiria
                                // justamente quando a tela não está selecionada.
                                label: pendenciasPorDestino[d.href] ? `${d.rotulo} (${pendenciasPorDestino[d.href]})` : d.rotulo,
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
                            const quantas = pendenciasPorDestino[href] || 0;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`px-4 py-2.5 text-corpo font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 rounded-t-lg flex items-center gap-2 tracking-wide uppercase border-t-2 ${ativo ? 'bg-fundo text-tinta border-brand shadow-[0_-2px_6px_rgba(0,0,0,0.08)]' : 'border-transparent text-tinta-suave hover:bg-sutil hover:text-tinta'}`}
                                >
                                    <Icon name={icone} className={`w-4 h-4 shrink-0 ${ativo ? 'text-brand' : ''}`} /> {rotulo}
                                    {/* Diz ONDE está o trabalho: o sino dá o total, a aba
                                        aponta a tela. */}
                                    {quantas > 0 && (
                                        <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brand text-white text-[10px] font-bold rounded-full">
                                            {quantas}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
        </>
    );
}
