"use client";
import { useState } from 'react';
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
// ESCONDIDO É ESCONDIDO
// Fechado, o menu sai da tela por inteiro (não vira trilho de ícones, por
// decisão da equipe) e fica `inert`, para o Tab não entrar nele. Volta pelo ☰
// da barra do topo. A escolha fica guardada no aparelho.

function ContadorPendencias({ n, rotulo }) {
    if (!n) return null;
    return (
        <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold grid place-items-center tabular-nums">
            {n}
            <span className="sr-only"> {n === 1 ? 'pendência' : 'pendências'} em {rotulo}</span>
        </span>
    );
}

export default function MenuLateral() {
    const { aberto, alternar } = useMenuLateral();
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
        if (!tela.subs.length) return;
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

    return (
        <aside
            id="menu-lateral"
            aria-label="Menu principal"
            inert={!aberto || undefined}
            className={`hidden lg:flex flex-col w-60 shrink-0 self-start sticky top-[var(--altura-barra)] h-[calc(100dvh-var(--altura-barra))] bg-superficie border-r border-borda no-print transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${aberto ? 'ml-0' : '-ml-60'}`}
        >
            <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-2.5 py-3">
                <ul className="flex flex-col gap-0.5">
                    {destinos.map(tela => {
                        const ativa = tela.href === pathname;
                        const temSubs = tela.subs.length > 0;
                        const expandida = temSubs && aberta === tela.id;
                        const [subAtual] = subAbaDe[tela.id] || [];
                        return (
                            <li key={tela.id}>
                                <Link
                                    href={tela.href}
                                    onClick={(e) => aoClicarTela(e, tela)}
                                    aria-current={ativa ? 'page' : undefined}
                                    aria-expanded={temSubs ? expandida : undefined}
                                    className={`flex items-center gap-3 h-10 px-3 rounded-lg text-corpo font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand ${
                                        ativa ? 'bg-brand/10 text-tinta' : 'text-tinta-suave hover:bg-realce hover:text-tinta'
                                    }`}
                                >
                                    <Icon name={tela.icone} className={`w-4 h-4 shrink-0 ${ativa ? 'text-brand' : ''}`} />
                                    <span className="min-w-0 truncate">{tela.rotulo}</span>
                                    <ContadorPendencias n={pendenciasPorDestino[tela.href]} rotulo={tela.rotulo} />
                                    {temSubs && (
                                        <Icon
                                            name="chevron-down"
                                            className={`w-3.5 h-3.5 shrink-0 text-tinta-suave transition-transform duration-200 ${pendenciasPorDestino[tela.href] ? '' : 'ml-auto'} ${expandida ? 'rotate-180' : ''}`}
                                        />
                                    )}
                                </Link>

                                {temSubs && (
                                    <div className="gaveta" data-aberta={String(expandida)} inert={!expandida || undefined}>
                                        <div>
                                            {/* O fio à esquerda é o que diz "estas pertencem a
                                                Financeiro" sem repetir a palavra. A sub-aba
                                                atual acende o seu trecho dele — um fio de 1px,
                                                não uma barra de cor sobre o item. */}
                                            <ul className="ml-[21px] mt-0.5 mb-1.5 pl-3 border-l border-borda flex flex-col gap-px">
                                                {tela.subs.map(sub => {
                                                    const atual = ativa && subAtual === sub.id;
                                                    const nPend = pendencias.filter(p => p.destino === tela.href && p.aba === sub.id).length;
                                                    const sinal = sinais[`${tela.id}:${sub.id}`];
                                                    return (
                                                        <li key={sub.id}>
                                                            <button
                                                                type="button"
                                                                onClick={() => aoClicarSub(tela, sub.id)}
                                                                aria-current={atual ? 'page' : undefined}
                                                                className={`relative w-full flex items-center gap-2 h-9 px-3 rounded-md text-compacto text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand ${
                                                                    atual
                                                                        ? 'text-tinta font-semibold before:absolute before:-left-[13px] before:top-2 before:bottom-2 before:w-px before:bg-brand'
                                                                        : 'text-tinta-suave hover:text-tinta hover:bg-sutil'
                                                                }`}
                                                            >
                                                                <span className="min-w-0 truncate">{sub.rotulo}</span>
                                                                {nPend > 0 ? (
                                                                    <ContadorPendencias n={nPend} rotulo={sub.rotulo} />
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

            <div className="border-t border-borda-fraca p-2.5 shrink-0">
                <button
                    type="button"
                    onClick={alternar}
                    aria-controls="menu-lateral"
                    aria-expanded={aberto}
                    className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-corpo font-semibold text-tinta-suave hover:bg-realce hover:text-tinta transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                >
                    <Icon name="panel-left-close" className="w-4 h-4 shrink-0" />
                    Esconder menu
                </button>
            </div>
        </aside>
    );
}
