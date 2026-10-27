"use client";
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { useCadastros } from '@/context/CadastrosContext';
import { useComunicacao } from '@/context/ComunicacaoContext';
import { useOrcamentos } from '@/context/OrcamentosContext';
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import { useMenuLateral } from '@/hooks/useMenuLateral';
import { telasVisiveis, subtelasVisiveis } from '@/lib/acesso/telas';
import { sinaisDasSubAbas } from '@/lib/acesso/sinais';

// O menu principal no computador, à esquerda da tela.
//
// No topo ele já não cabia: onze telas numa fita horizontal, com as sub-abas
// de cada uma numa segunda faixa logo abaixo, comiam quase 100px de altura de
// toda tela e ainda rolavam de lado. Na vertical as onze cabem com folga, e
// as sub-abas abrem embaixo do item a que pertencem — a faixa de sub-abas no
// topo de cada tela deixa de ser necessária enquanto o menu estiver aberto.
//
// No celular nada muda: lá continuam o seletor de seções e o de sub-abas.
//
// O MENU MANDA NA SUB-ABA, MAS NÃO A GUARDA
// A sub-aba escolhida de cada tela continua onde sempre esteve, no estado do
// AppContext, exposto pelos contextos de cada área. O menu só lê e escreve
// esse mesmo estado — é por isso que clicar em "Boletos" aqui e trocar de
// sub-aba no celular são a mesma coisa, sem duas fontes para manter em dia.
// Os ids das sub-abas são os mesmos do catálogo (lib/acesso/telas.js).
//
// RECOLHIDO É UMA FAIXA DE ÍCONES
// A primeira versão sumia por inteiro ao fechar, e a equipe passava o dia
// abrindo o menu só para trocar de tela e fechando de novo para ganhar
// espaço. Recolhido, ele vira uma faixa de 64px só com os ícones: a troca de
// tela é um clique direto, e o nome de cada uma aparece ao passar o mouse.
// As sub-abas não cabem na faixa — elas voltam para a faixa no topo de cada
// tela (components/ui/SubAbas.jsx), como antes do menu lateral. A escolha
// fica guardada no aparelho.

const LARGURA_RECOLHIDO = 64; // w-16

function ContadorPendencias({ n, rotulo, recolhido }) {
    if (!n) return null;
    return (
        <span
            className={`px-1 rounded-full bg-brand text-sobre-brand font-bold grid place-items-center tabular-nums ${
                // Recolhido, o número vai para o canto do ícone, como nos
                // ícones de app: é o único lugar que sobra na faixa. Menor e
                // deslocado para fora, para não tapar o ícone que identifica a
                // tela.
                recolhido
                    ? 'absolute -top-2.5 -right-3.5 min-w-4 h-4 text-[9px] ring-2 ring-superficie'
                    : 'ml-auto min-w-[18px] h-[18px] text-[10px]'
            }`}
        >
            {n}
            <span className="sr-only"> {n === 1 ? 'pendência' : 'pendências'} em {rotulo}</span>
        </span>
    );
}

export default function MenuLateral() {
    const { aberto, alternar } = useMenuLateral();
    const recolhido = !aberto;
    const { usuario } = useSessao();
    const { pendencias, pendenciasPorDestino, calculadoraAtiva, setCalculadoraAtiva } = useUi();
    const { abaOS, setAbaOS, abaVendas, setAbaVendas } = usePedidos();
    const { abaFinanceiro, setAbaFinanceiro } = useFinanceiro();
    const { abaCadastros, setAbaCadastros } = useCadastros();
    const { abaComunicacao, setAbaComunicacao } = useComunicacao();
    const { abaOrcamentos, setAbaOrcamentos } = useOrcamentos();
    const { notasFiscais } = useNotasFiscais();
    const pathname = usePathname();
    const router = useRouter();

    // O nome da tela sob o mouse, na faixa recolhida. Vai por portal para o
    // body, e não dentro do menu: a lista rola (um balão dentro dela seria
    // cortado na borda), e o menu, por ser sticky, é uma camada própria — o
    // balão ficaria por baixo da página ao lado, mesmo com z-index alto.
    const [dica, setDica] = useState(null); // { texto, top }
    const mostrarDica = (texto) => (e) => {
        if (!recolhido) return;
        const r = e.currentTarget.getBoundingClientRect();
        setDica({ texto, top: r.top + r.height / 2 });
    };
    const esconderDica = () => setDica(null);

    // Onde mora a sub-aba escolhida de cada tela que tem sub-abas.
    const subAbaDe = {
        baixa: [abaOS, setAbaOS],
        calculadoras: [calculadoraAtiva, setCalculadoraAtiva],
        financeiro: [abaFinanceiro, setAbaFinanceiro],
        vendas: [abaVendas, setAbaVendas],
        orcamentos: [abaOrcamentos, setAbaOrcamentos],
        cadastros: [abaCadastros, setAbaCadastros],
        comunicacao: [abaComunicacao, setAbaComunicacao],
    };
    const sinais = sinaisDasSubAbas({ notasFiscais });

    const destinos = telasVisiveis(usuario).map(t => ({ ...t, subs: subAbaDe[t.id] ? subtelasVisiveis(usuario, t.id) : [] }));
    const telaAtual = destinos.find(t => t.href === pathname);
    const padraoAberta = telaAtual?.subs.length ? telaAtual.id : null;

    // Qual grupo está aberto. A tela atual abre o seu sozinha; um clique pode
    // abrir outro ou fechar o atual. A escolha vale para o endereço em que foi
    // feita — ao trocar de tela, volta a valer o grupo da tela nova. Derivado,
    // e não corrigido num efeito, para não renderizar duas vezes a cada troca.
    const [expansao, setExpansao] = useState({ caminho: pathname, aberta: padraoAberta });
    const aberta = expansao.caminho === pathname ? expansao.aberta : padraoAberta;

    const aoClicarTela = (e, tela) => {
        esconderDica();
        // Recolhido não há grupo para abrir: o ícone só leva à tela.
        if (recolhido || !tela.subs.length) return;
        if (tela.href === pathname) {
            // Já está nela: o clique abre ou fecha as sub-abas, sem recarregar.
            e.preventDefault();
            setExpansao({ caminho: pathname, aberta: aberta === tela.id ? null : tela.id });
        } else {
            setExpansao({ caminho: tela.href, aberta: tela.id });
        }
    };

    const aoClicarSub = (tela, subId) => {
        subAbaDe[tela.id][1](subId);
        setExpansao({ caminho: tela.href, aberta: tela.id });
        if (tela.href !== pathname) router.push(tela.href);
    };

    const foco = 'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand';

    return (
        <aside
            id="menu-lateral"
            aria-label="Menu principal"
            className={`hidden lg:flex flex-col shrink-0 self-start sticky top-[var(--altura-barra)] h-[calc(100dvh-var(--altura-barra))] bg-superficie border-r border-borda no-print overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                aberto ? 'w-60' : 'w-16'
            }`}
        >
            <nav
                onScroll={esconderDica}
                className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain custom-scrollbar py-3 ${recolhido ? 'px-2' : 'px-2.5'}`}
            >
                <ul className="flex flex-col gap-0.5">
                    {destinos.map(tela => {
                        const ativa = tela.href === pathname;
                        const temSubs = tela.subs.length > 0;
                        const expandida = !recolhido && temSubs && aberta === tela.id;
                        const [subAtual] = subAbaDe[tela.id] || [];
                        const nPend = pendenciasPorDestino[tela.href];
                        return (
                            <li key={tela.id}>
                                <Link
                                    href={tela.href}
                                    onClick={(e) => aoClicarTela(e, tela)}
                                    onMouseEnter={mostrarDica(tela.rotulo)}
                                    onMouseLeave={esconderDica}
                                    onFocus={mostrarDica(tela.rotulo)}
                                    onBlur={esconderDica}
                                    aria-current={ativa ? 'page' : undefined}
                                    aria-expanded={!recolhido && temSubs ? expandida : undefined}
                                    // Recolhido, o rótulo some da vista, mas fica para o
                                    // leitor de tela pelo aria-label.
                                    aria-label={recolhido ? tela.rotulo : undefined}
                                    className={`flex items-center h-10 rounded-lg text-corpo font-semibold transition-colors duration-150 ${foco} ${
                                        recolhido ? 'justify-center w-12 mx-auto' : 'gap-3 px-3'
                                    } ${ativa ? 'bg-brand/10 text-tinta' : 'text-tinta-suave hover:bg-realce hover:text-tinta'}`}
                                >
                                    <span className="relative shrink-0 grid place-items-center">
                                        <Icon name={tela.icone} className={`w-4 h-4 ${ativa ? 'text-brand' : ''}`} />
                                        {recolhido && <ContadorPendencias n={nPend} rotulo={tela.rotulo} recolhido />}
                                    </span>
                                    {!recolhido && (
                                        <>
                                            <span className="min-w-0 truncate whitespace-nowrap">{tela.rotulo}</span>
                                            <ContadorPendencias n={nPend} rotulo={tela.rotulo} />
                                            {temSubs && (
                                                <Icon
                                                    name="chevron-down"
                                                    className={`w-3.5 h-3.5 shrink-0 text-tinta-suave transition-transform duration-200 ${nPend ? '' : 'ml-auto'} ${expandida ? 'rotate-180' : ''}`}
                                                />
                                            )}
                                        </>
                                    )}
                                </Link>

                                {temSubs && !recolhido && (
                                    <div className="gaveta" data-aberta={String(expandida)} inert={!expandida || undefined}>
                                        <div>
                                            {/* O fio à esquerda é o que diz "estas pertencem a
                                                Financeiro" sem repetir a palavra. A sub-aba
                                                atual acende o seu trecho dele — um fio de 1px,
                                                não uma barra de cor sobre o item. */}
                                            <ul className="ml-[21px] mt-0.5 mb-1.5 pl-3 border-l border-borda flex flex-col gap-px">
                                                {tela.subs.map(sub => {
                                                    const atual = ativa && subAtual === sub.id;
                                                    const nPendSub = pendencias.filter(p => p.destino === tela.href && p.aba === sub.id).length;
                                                    const sinal = sinais[`${tela.id}:${sub.id}`];
                                                    return (
                                                        <li key={sub.id}>
                                                            <button
                                                                type="button"
                                                                onClick={() => aoClicarSub(tela, sub.id)}
                                                                aria-current={atual ? 'page' : undefined}
                                                                className={`relative w-full flex items-center gap-2 h-9 px-3 rounded-md text-compacto text-left whitespace-nowrap transition-colors duration-150 ${foco} ${
                                                                    atual
                                                                        ? 'text-tinta font-semibold before:absolute before:-left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-brand'
                                                                        : 'text-tinta-suave hover:text-tinta hover:bg-sutil'
                                                                }`}
                                                            >
                                                                <span className="min-w-0 truncate">{sub.rotulo}</span>
                                                                {nPendSub > 0 ? (
                                                                    <ContadorPendencias n={nPendSub} rotulo={sub.rotulo} />
                                                                ) : sinal ? (
                                                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shrink-0">
                                                                        <span className="sr-only">tem pendência</span>
                                                                    </span>
                                                                ) : null}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className={`border-t border-borda-fraca shrink-0 ${recolhido ? 'p-2' : 'p-2.5'}`}>
                <button
                    type="button"
                    onClick={() => { esconderDica(); alternar(); }}
                    onMouseEnter={mostrarDica('Expandir menu')}
                    onMouseLeave={esconderDica}
                    onFocus={mostrarDica('Expandir menu')}
                    onBlur={esconderDica}
                    aria-controls="menu-lateral"
                    aria-expanded={aberto}
                    aria-label={recolhido ? 'Expandir menu' : undefined}
                    className={`flex items-center h-10 rounded-lg text-corpo font-semibold text-tinta-suave hover:bg-realce hover:text-tinta transition-colors duration-150 whitespace-nowrap ${foco} ${
                        recolhido ? 'justify-center w-12 mx-auto' : 'w-full gap-3 px-3'
                    }`}
                >
                    {/* O mesmo ícone nos dois sentidos, virado: a seta aponta para
                        onde o menu vai. */}
                    <Icon name="panel-left-close" className={`w-4 h-4 shrink-0 transition-transform duration-300 ${recolhido ? 'rotate-180' : ''}`} />
                    {!recolhido && 'Recolher menu'}
                </button>
            </div>

            {recolhido && dica && createPortal(
                <span
                    role="tooltip"
                    className="fixed z-[90] -translate-y-1/2 pointer-events-none whitespace-nowrap rounded-md bg-gray-900 dark:bg-black dark:border dark:border-darkBorder px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg"
                    style={{ top: dica.top, left: LARGURA_RECOLHIDO + 8 }}
                >
                    {dica.texto}
                    <span className="absolute top-1/2 -translate-y-1/2 -left-[3px] h-1.5 w-1.5 rotate-45 bg-gray-900 dark:bg-black" />
                </span>,
                document.body,
            )}
        </aside>
    );
}
