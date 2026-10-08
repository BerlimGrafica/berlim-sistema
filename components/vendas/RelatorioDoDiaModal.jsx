"use client";
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSessao } from '@/context/SessaoContext';
import Icon from '@/components/Icon';
import { useModal } from '@/components/modals/useModal';
import { useVendasDoDia } from '@/hooks/useVendasDoDia';
import { formatarValorFinanceiro, centavosParaReais, mascararCliente } from '@/lib/utils/formatters';

// O que aconteceu num dia: quem comprou, o que levou e como pagou.
//
// Nasceu de uma pergunta que a barra não respondia. A série "Por dia" diz que a
// terça fez R$ 3.358, e a pergunta seguinte é sempre a mesma — foi uma venda
// grande ou foram vinte pequenas? Era preciso ir até Pedidos e filtrar na mão.
//
// É UM RELATÓRIO, ENTÃO É UMA TABELA
// Quem abre isto está numa tarefa — conferir o dia, achar o pedido que não foi
// pago, ver se a maior venda foi de quem se imagina. Tarefa pede densidade e
// alinhamento: valores na mesma coluna comparam-se de relance, e nomes na mesma
// margem esquerda varrem-se com o olho. Cada pedido numa caixa própria, como
// estava antes, quebra as duas colunas e transforma 23 registros numa parede.
//
// As colunas são um grid que reflui: no celular viram duas linhas por pedido,
// no computador viram tabela. Uma marcação só, sem dois desenhos para manter.
//
// O estado do pagamento é a única cor da lista, e é semântica — âmbar para
// falta, vermelho para nada lançado. Cor de forma de pagamento existe só na
// faixa de composição do topo, onde ela de fato distingue fatias.
//
// É leitura, não edição: nenhum campo, nenhum botão de salvar. O guarda de
// alterações do useModal nunca dispara, e as três saídas fecham direto.

// Escritas por extenso porque o Tailwind só gera o que encontra no código.
const CORES_FORMA = {
    'PIX': 'bg-emerald-500',
    'Cartão de Crédito': 'bg-indigo-500',
    'Cartão de Débito': 'bg-sky-500',
    'Link de Pagamento': 'bg-violet-500',
    'Dinheiro': 'bg-amber-500',
    'Boleto': 'bg-slate-500',
    'Estorno': 'bg-red-500',
};
const corDaForma = (f) => CORES_FORMA[f] || 'bg-gray-400';

// Estorno é lançado com valor positivo e precisa entrar negativo — mesma regra
// de `pagos_por_pedido` em metricas_vendas_migration.sql. Somar tudo faria uma
// devolução parecer recebimento, e o pedido apareceria quitado.
const valorDoPagamento = (p) => (p.forma === 'Estorno' ? -(p.valor_centavos || 0) : (p.valor_centavos || 0));
const somaPagamentos = (pags) => (pags || []).reduce((t, p) => t + valorDoPagamento(p), 0);
const somaItens = (itens) => (itens || []).reduce((t, i) => t + (i.valor_centavos || 0), 0);

const porExtenso = (dia) => {
    const d = new Date(`${dia}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dia;
    const t = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return t.charAt(0).toUpperCase() + t.slice(1);
};

const reais = (centavos) => formatarValorFinanceiro(centavosParaReais(centavos));

const Valor = ({ centavos, className = '' }) => (
    <span className={`tabular-nums ${className}`}>R$ {reais(centavos)}</span>
);

// Três estados, porque é o que muda a ação de quem lê: nada a fazer, cobrar o
// resto, cobrar tudo.
function estadoDoPagamento(pedido) {
    const pago = somaPagamentos(pedido.pedido_pagamentos);
    const total = pedido.valor_total || 0;
    if ((pedido.pedido_pagamentos || []).length === 0) return { rotulo: 'não pago', classe: 'text-perigo', falta: total };
    if (pago < total) return { rotulo: `falta ${reais(total - pago)}`, classe: 'text-aviso', falta: total - pago };
    return { rotulo: null, classe: '', falta: 0 };
}

// Linha de colunas iguais à da lista, para os títulos ficarem exatamente sobre
// os seus valores. Some no celular, onde a linha empilha e os títulos seriam
// rótulos repetidos 23 vezes.
// Sem o `display` aqui: o cabeçalho das colunas precisa ser `hidden sm:grid`, e
// um `grid` embutido nesta constante brigaria com o `hidden` — as duas são
// utilitárias de display, e quem vence é a ordem do CSS gerado, não a ordem em
// que aparecem no atributo. Cada uso declara o próprio display.
const COLUNAS = 'grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_7rem_auto] gap-x-4 items-baseline';

function LinhaPedido({ pedido, isDemo, aberto, aoAlternar }) {
    const itens = [...(pedido.pedido_itens || [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    const pags = pedido.pedido_pagamentos || [];
    const estado = estadoDoPagamento(pedido);
    const servico = itens.length > 0
        ? itens.map(i => i.nome).filter(Boolean).join(', ')
        : (pedido.servico || '—');
    const formas = [...new Set(pags.map(p => p.forma))];

    return (
        <li className="border-b border-borda-fraca last:border-b-0">
            <button
                type="button"
                onClick={aoAlternar}
                aria-expanded={aberto}
                className={`grid ${COLUNAS} w-full text-left py-2.5 px-4 transition-colors duration-150 hover:bg-sutil focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand`}
            >
                <span className="font-semibold text-corpo text-tinta truncate">
                    {mascararCliente(pedido.cliente, isDemo)}
                </span>

                <span className="hidden sm:block text-mini text-tinta-suave truncate">{servico}</span>

                <span className="hidden sm:block text-mini text-tinta-suave truncate">
                    {formas.length > 0 ? formas.join(', ') : <span className="text-perigo font-semibold">não pago</span>}
                </span>

                <span className="flex items-baseline gap-2 justify-self-end">
                    <Valor centavos={pedido.valor_total} className="font-semibold text-corpo text-tinta" />
                    <Icon
                        name="chevron-down"
                        className={`w-3.5 h-3.5 shrink-0 text-tinta-fraca transition-transform duration-150 ${aberto ? 'rotate-180' : ''}`}
                    />
                </span>

                {/* No celular as colunas do meio não cabem lado a lado: descem
                    para uma segunda linha, abaixo do nome, ainda alinhadas à
                    mesma margem. */}
                <span className="sm:hidden col-span-2 text-mini text-tinta-suave truncate -mt-0.5">
                    {servico}
                    {estado.rotulo && <span className={`font-semibold ${estado.classe}`}> · {estado.rotulo}</span>}
                </span>

                {estado.rotulo && (
                    <span className={`hidden sm:block col-start-3 text-micro font-semibold ${estado.classe} -mt-1`}>
                        {estado.rotulo}
                    </span>
                )}
            </button>

            <div className="gaveta" data-aberta={String(aberto)} inert={!aberto || undefined}>
                <div>
                    <div className="px-4 pb-4 pt-1 bg-sutil border-t border-borda-fraca">
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-micro text-tinta-fraca pt-3 pb-2">
                            <span className="font-semibold text-tinta-suave">O.S. #{pedido.id}</span>
                            <span>{pedido.status}</span>
                            {pedido.responsavel && <span>{pedido.responsavel}</span>}
                            {pedido.local_producao && <span>{pedido.local_producao}</span>}
                        </div>

                        <dl className="flex flex-col">
                            {itens.map((item, i) => (
                                <div key={`i${i}`} className="flex items-baseline justify-between gap-4 py-1 text-mini">
                                    <dt className="text-tinta-corpo min-w-0 truncate">
                                        {item.nome}
                                        {item.descricao && <span className="text-tinta-fraca"> — {item.descricao}</span>}
                                    </dt>
                                    <dd className="shrink-0"><Valor centavos={item.valor_centavos} className="text-tinta-suave" /></dd>
                                </div>
                            ))}

                            {itens.length === 0 && (
                                <p className="py-1 text-mini text-tinta-suave italic">{pedido.servico || 'Sem itens lançados.'}</p>
                            )}

                            {/* Desconto no fechamento, frete, acerto manual: quando a
                                soma dos itens não fecha com a O.S., o aviso evita que
                                a conta pareça errada. */}
                            {itens.length > 0 && somaItens(itens) !== pedido.valor_total && (
                                <p className="pt-1 text-micro text-tinta-fraca">
                                    Itens somam <Valor centavos={somaItens(itens)} />, O.S. fechada em{' '}
                                    <Valor centavos={pedido.valor_total} />.
                                </p>
                            )}

                            {pags.map((p, i) => {
                                const detalhe = [p.bandeira, p.instituicao, p.parcelas > 1 ? `${p.parcelas}x` : null]
                                    .filter(Boolean).join(' · ');
                                return (
                                    <div key={`p${i}`} className="flex items-baseline justify-between gap-4 py-1 text-mini border-t border-borda-fraca first:border-t-0 mt-1 first:mt-0">
                                        <dt className="text-tinta-suave truncate">
                                            {p.forma}
                                            {detalhe && <span className="text-tinta-fraca"> · {detalhe}</span>}
                                        </dt>
                                        <dd className="shrink-0">
                                            <Valor
                                                centavos={valorDoPagamento(p)}
                                                className={`font-semibold ${p.forma === 'Estorno' ? 'text-perigo' : 'text-tinta-corpo'}`}
                                            />
                                        </dd>
                                    </div>
                                );
                            })}

                            {pags.length === 0 && (
                                <p className="pt-2 mt-1 border-t border-borda-fraca text-mini font-semibold text-perigo">
                                    Nenhum pagamento lançado.
                                </p>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </li>
    );
}

// A composição do dia por forma de pagamento. Responde "o dia foi de PIX ou de
// cartão?" antes de qualquer número ser lido — e é o único lugar da tela onde
// cor de forma significa alguma coisa.
function Composicao({ porForma, total }) {
    if (total <= 0 || porForma.length === 0) return null;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex h-1.5 rounded-full overflow-hidden bg-realce" role="presentation">
                {porForma.map(([forma, centavos]) => (
                    <div
                        key={forma}
                        className={corDaForma(forma)}
                        style={{ width: `${(centavos / total) * 100}%` }}
                        title={`${forma}: R$ ${reais(centavos)}`}
                    />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
                {porForma.map(([forma, centavos]) => (
                    <span key={forma} className="flex items-center gap-1.5 text-micro text-tinta-suave">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${corDaForma(forma)}`} />
                        {forma}
                        <span className="font-semibold text-tinta-corpo tabular-nums">
                            {Math.round((centavos / total) * 100)}%
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------

export default function RelatorioDoDiaModal({ dia, aoFechar }) {
    const { isDemo } = useSessao();
    const modal = useModal(!!dia, aoFechar);
    const { pedidos, carregando, erro } = useVendasDoDia(dia);
    const [abertos, setAbertos] = useState(() => new Set());

    // `document` não existe na renderização do servidor; `dia` também nasce nulo
    // lá, mas a guarda explícita evita depender disso.
    if (!dia || typeof document === 'undefined') return null;

    const lista = pedidos ?? [];
    const total = lista.reduce((t, p) => t + (p.valor_total || 0), 0);
    const recebido = lista.reduce((t, p) => t + somaPagamentos(p.pedido_pagamentos), 0);
    const aReceber = total - recebido;
    const ticket = lista.length > 0 ? Math.round(total / lista.length) : 0;

    const porForma = Object.entries(
        lista.flatMap(p => p.pedido_pagamentos || []).reduce((acc, p) => {
            const v = valorDoPagamento(p);
            if (v > 0) acc[p.forma] = (acc[p.forma] || 0) + v;
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]);
    const totalPorForma = porForma.reduce((t, [, v]) => t + v, 0);

    const alternar = (id) => setAbertos(atual => {
        const novo = new Set(atual);
        if (novo.has(id)) novo.delete(id);
        else novo.add(id);
        return novo;
    });

    // Portal para o body, e isto NÃO é detalhe de estilo.
    //
    // O layout da área logada embrulha Navbar e conteúdo num <div inert={...}>
    // que liga assim que qualquer modal entra na pilha — é o que impede o Tab de
    // alcançar a tabela atrás do overlay. Este modal é renderizado de dentro do
    // VisaoGeralPanel, ou seja, de dentro desse embrulho: ao se registrar, ele
    // tornava inerte a si mesmo. O modal aparecia, nenhum clique funcionava, e o
    // Esc continuava fechando porque o ouvinte de teclado vive no documento.
    //
    // O mesmo aconteceu antes com a gaveta do chat — ver o comentário em
    // app/(app)/layout.jsx. Os treze modais de <Modals /> escapam por serem
    // montados fora do embrulho; este escapa pelo portal, que o tira dali no DOM
    // sem precisar de um estado global para um modal de uma tela só.
    return createPortal(
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-fundo w-full max-w-none sm:max-w-3xl h-full sm:h-auto sm:max-h-[88vh] rounded-none sm:rounded-xl shadow-2xl overflow-hidden border border-borda animate-modal-in flex flex-col cursor-default" onClick={(e) => e.stopPropagation()}>

                <div className="px-4 sm:px-6 py-4 flex justify-between items-center gap-3 bg-brand text-white shrink-0">
                    <h3 className="font-bold text-base tracking-tight truncate">{porExtenso(dia)}</h3>
                    <button type="button" onClick={modal.fechar} aria-label="Fechar relatório" className="text-amber-50 hover:text-white transition-colors duration-150 shrink-0 -mr-1 p-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>

                {!carregando && !erro && lista.length > 0 && (
                    <div className="px-4 sm:px-6 py-4 bg-superficie border-b border-borda shrink-0 flex flex-col gap-3">
                        <p className="text-corpo text-tinta-corpo">
                            <strong className="font-bold text-tinta tabular-nums">{lista.length}</strong>{' '}
                            {lista.length === 1 ? 'pedido' : 'pedidos'}, <Valor centavos={total} className="font-bold text-tinta" /> vendidos
                            <span className="text-tinta-suave"> · ticket médio <Valor centavos={ticket} /></span>
                            {aReceber > 0
                                ? <> · <Valor centavos={aReceber} className="font-semibold text-aviso" /> <span className="text-aviso font-semibold">a receber</span></>
                                : <span className="text-sucesso font-semibold"> · tudo recebido</span>}
                        </p>
                        <Composicao porForma={porForma} total={totalPorForma} />
                    </div>
                )}

                {!carregando && !erro && lista.length > 0 && (
                    <div className={`${COLUNAS} hidden sm:grid px-4 sm:px-6 py-2 bg-sutil border-b border-borda text-micro font-semibold uppercase tracking-wider text-tinta-fraca shrink-0`}>
                        <span>Cliente</span>
                        <span>Serviço</span>
                        <span>Pagamento</span>
                        <span className="justify-self-end pr-5">Valor</span>
                    </div>
                )}

                {/* min-h-0 é o que faz a rolagem existir. Num container `flex`
                    com altura limitada, o filho nasce com min-height:auto e se
                    recusa a encolher abaixo do próprio conteúdo: a barra nunca
                    aparece, o conteúdo transborda e o rodapé é empurrado para
                    fora do cartão. */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
                    {carregando && (
                        <div className="divide-y divide-borda-fraca">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                                    <div className="h-3.5 rounded bg-realce animate-pulse" style={{ width: `${30 + (i % 3) * 12}%` }} />
                                    <div className="h-3.5 w-20 rounded bg-realce animate-pulse shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!carregando && erro && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-corpo font-semibold text-tinta">Não deu para carregar este dia</p>
                            <p className="text-mini text-tinta-suave mt-1">{erro}</p>
                        </div>
                    )}

                    {!carregando && !erro && lista.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-corpo font-semibold text-tinta">Nenhum pedido neste dia</p>
                            <p className="text-mini text-tinta-suave mt-1">
                                Pedidos cancelados não entram no faturamento e por isso não aparecem aqui.
                            </p>
                        </div>
                    )}

                    {!carregando && !erro && lista.length > 0 && (
                        <ul className="sm:px-2">
                            {lista.map(pedido => (
                                <LinhaPedido
                                    key={pedido.id}
                                    pedido={pedido}
                                    isDemo={isDemo}
                                    aberto={abertos.has(pedido.id)}
                                    aoAlternar={() => alternar(pedido.id)}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                {!carregando && !erro && lista.length > 0 && (
                    <div className="px-4 sm:px-6 py-3 bg-superficie border-t border-borda shrink-0 flex items-baseline justify-between gap-4">
                        <span className="text-micro text-tinta-fraca">Clique numa linha para ver itens e pagamentos</span>
                        <span className="text-mini text-tinta-suave shrink-0">
                            recebido <Valor centavos={recebido} className="font-bold text-sucesso" />
                        </span>
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
