"use client";
import { useState, useRef } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { usePedidos } from '@/context/PedidosContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarValorFinanceiro, formatarDataExibicao, formatarMesAno, centavosParaReais, obterDataAtual, mascararCliente } from '@/lib/utils/formatters';
import { BarRow } from '@/components/vendas/BarRow';
import { CATEGORIAS_CONTA } from '@/lib/utils/constants';

const SLIDES = ['Faturamento no tempo', 'Distribuição no período', 'Despesas e cobranças'];

// "R$" sempre em cima, número embaixo — e o número encolhe se for ficar largo
// demais pro card, em vez de quebrar linha no meio do valor.
const tamanhoNumero = (texto) => (texto.length > 12 ? 'text-sm' : texto.length > 9 ? 'text-base' : 'text-lg');

function CardIndicador({ rotulo, centavos, cor, icone, nota }) {
    const texto = formatarValorFinanceiro(centavosParaReais(centavos));
    return (
        <div className="bg-superficie p-5 rounded-xl border border-borda shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                    <span className="text-micro font-bold text-gray-400 uppercase tracking-wider block mb-1">{rotulo}</span>
                    <span className={`block text-lg font-black ${cor} leading-tight`}>R$</span>
                    <h2 className={`${tamanhoNumero(texto)} font-black ${cor} leading-tight tabular-nums`}>{texto}</h2>
                </div>
                <div className={`p-2 rounded-lg shrink-0 ${icone.fundo}`}><Icon name={icone.nome} className={`w-4 h-4 ${cor}`} /></div>
            </div>
            <p className="text-mini text-gray-400 mt-3 font-medium truncate" title={nota}>{nota}</p>
        </div>
    );
}

function CardPainel({ titulo, descricao, icone, fundoIcone, corIcone, children }) {
    return (
        <div className="bg-superficie rounded-xl border border-borda flex flex-col">
            <div className="rounded-t-xl px-5 py-4 border-b border-borda-fraca flex items-center gap-3 shrink-0">
                <div className={`p-2 rounded-lg shrink-0 ${fundoIcone}`}><Icon name={icone} className={`w-4 h-4 ${corIcone}`} /></div>
                <div className="min-w-0">
                    <h3 className="font-bold text-corpo text-tinta truncate">{titulo}</h3>
                    <p className="text-mini text-gray-400 truncate">{descricao}</p>
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 p-5 overflow-y-auto max-h-72 custom-scrollbar">{children}</div>
        </div>
    );
}

function Barras({ itens, cores, vazio, rotuloDe = (i) => i.rotulo, corFixa }) {
    if (!itens || itens.length === 0) return <p className="text-mini text-gray-500 italic">{vazio}</p>;
    const valores = itens.map(i => centavosParaReais(i.centavos));
    // Módulo na escala: com estorno na lista há valores negativos, e a maior
    // barra pode ser justamente a devolução.
    const max = Math.max(...valores.map(Math.abs), 1);
    const total = valores.reduce((a, v) => a + v, 0);
    // Porcentagem sobre um total de sinais misturados não quer dizer nada —
    // nesse caso a coluna some em vez de mostrar número sem sentido.
    const temNegativo = valores.some(v => v < 0);
    return itens.map((item, i) => (
        <BarRow
            key={item.rotulo}
            label={rotuloDe(item)}
            valor={valores[i]}
            maxVal={max}
            color={corFixa || (typeof cores === 'function' ? cores(item, i) : cores[i % cores.length])}
            rank={i + 1}
            pctTotal={temNegativo || total <= 0 ? null : (valores[i] / total) * 100}
        />
    ));
}

const CORES_LOCAL = ['bg-teal-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'];
const CORES_FORMA = ['bg-amber-500', 'bg-yellow-500', 'bg-orange-500', 'bg-lime-500'];
const CORES_INST = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500'];
// Mesma paleta do modal, da listagem e do cadastro — ver CATEGORIAS_CONTA.
const CORES_CATEGORIA = Object.fromEntries(CATEGORIAS_CONTA.map(c => [c.value, c.ponto]));

export default function VisaoGeralPanel({ metricas, rotulo }) {
    const [slide, setSlide] = useState(0);
    const scrollRef = useRef(null);
    const { isDemo } = useSessao();
    // Só para abrir a O.S. direto da lista de cobrança pendente.
    const { pedidos, abrirEdicao } = usePedidos();

    const irPara = (i) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
        setSlide(i);
    };
    const aoRolar = () => {
        const el = scrollRef.current;
        if (!el || !el.clientWidth) return;
        setSlide(Math.round(el.scrollLeft / el.clientWidth));
    };

    const { resumo, ano, despesas } = metricas;
    const anoAnterior = String(Number(ano.rotulo) - 1);
    const brutoMenosDespesas = resumo.recebido_centavos - despesas.total_centavos;
    const crescimento = Number(ano.crescimento_pct) || 0;

    return (
        <div className="flex flex-col gap-8">

            {/* RESUMO DO PERÍODO */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 bg-brand rounded-full"></span>
                    <h2 className="text-mini font-bold uppercase tracking-wider text-tinta-suave">Resumo do período</h2>
                    <span className="text-micro text-gray-400 font-medium normal-case">{rotulo}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Crescimento é sempre ano contra ano — não segue o período, e o rótulo diz isso. */}
                    <div className="bg-superficie p-5 rounded-xl border border-borda shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-micro font-bold text-gray-400 uppercase tracking-wider block mb-1">Crescimento (YoY)</span>
                                <span className="block text-lg font-black text-tinta leading-tight">R$</span>
                                <h2 className={`${tamanhoNumero(formatarValorFinanceiro(centavosParaReais(ano.atual_centavos)))} font-black text-gray-900 dark:text-white leading-tight tabular-nums`}>
                                    {formatarValorFinanceiro(centavosParaReais(ano.atual_centavos))}
                                </h2>
                            </div>
                            <div className={`p-2 rounded-lg shrink-0 ${crescimento >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                                <Icon name={crescimento >= 0 ? 'trending-up' : 'trending-down'} className={`w-4 h-4 ${crescimento >= 0 ? 'text-sucesso' : 'text-perigo'}`} />
                            </div>
                        </div>
                        <p className={`text-mini font-bold mt-3 ${crescimento >= 0 ? 'text-sucesso' : 'text-perigo'}`}>
                            {crescimento >= 0 ? '+' : '-'}{Math.abs(crescimento).toFixed(1)}% — {ano.rotulo} vs {anoAnterior}
                        </p>
                    </div>

                    <CardIndicador rotulo="Despesas (a pagar)" centavos={despesas.total_centavos} cor="text-perigo"
                        icone={{ nome: 'dollar-sign', fundo: 'bg-red-50 dark:bg-red-500/10' }} nota={rotulo} />
                    <CardIndicador rotulo="Total recebido" centavos={resumo.recebido_centavos} cor="text-sucesso"
                        icone={{ nome: 'check-circle', fundo: 'bg-emerald-50 dark:bg-emerald-500/10' }} nota={rotulo} />
                    <CardIndicador rotulo="Total bruto" centavos={brutoMenosDespesas} cor="text-cyan-600 dark:text-cyan-400"
                        icone={{ nome: 'dollar-sign', fundo: 'bg-cyan-50 dark:bg-cyan-500/10' }} nota="Recebido menos despesas" />
                    <CardIndicador rotulo="Vendas hoje" centavos={metricas.vendas_hoje_centavos} cor="text-purple-600 dark:text-purple-400"
                        icone={{ nome: 'calendar', fundo: 'bg-purple-50 dark:bg-purple-500/10' }} nota={formatarDataExibicao(obterDataAtual())} />
                    <CardIndicador rotulo="Saldo devedor" centavos={resumo.a_receber_centavos} cor="text-orange-600 dark:text-orange-400"
                        icone={{ nome: 'clock', fundo: 'bg-orange-50 dark:bg-orange-500/10' }} nota="Falta receber no período" />
                    {/* Antes esse valor era somado ao "recebido" como se tivesse entrado. */}
                    <CardIndicador rotulo="Concluído sem baixa" centavos={metricas.sem_baixa.total_centavos} cor="text-rose-600 dark:text-rose-400"
                        icone={{ nome: 'alert-triangle', fundo: 'bg-rose-50 dark:bg-rose-500/10' }}
                        nota={metricas.sem_baixa.qtd === 0 ? 'Nada pendente de baixa' : `${metricas.sem_baixa.qtd} O.S. encerrada(s) sem pagamento`} />
                    <CardIndicador rotulo="Ticket médio" centavos={resumo.ticket_medio_centavos} cor="text-info"
                        icone={{ nome: 'tag', fundo: 'bg-blue-50 dark:bg-blue-500/10' }} nota={`${resumo.qtd_pedidos} pedido(s) no período`} />
                </div>
            </div>

            {/* PAINEL COM ROLAGEM LATERAL */}
            <div>
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="w-1 h-4 bg-brand rounded-full"></span>
                        <h2 className="text-mini font-bold uppercase tracking-wider text-tinta-suave">{SLIDES[slide]}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            {SLIDES.map((nome, i) => (
                                <Tooltip key={nome} label={nome}>
                                    <button onClick={() => irPara(i)} aria-label={nome} className={`h-1.5 rounded-full transition-all ${slide === i ? 'w-5 bg-brand' : 'w-1.5 bg-gray-300 dark:bg-darkBorder hover:bg-gray-400'}`}></button>
                                </Tooltip>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => irPara(Math.max(0, slide - 1))} disabled={slide === 0} aria-label="Painel anterior" className="w-7 h-7 flex items-center justify-center rounded-md border border-borda text-tinta-suave hover:bg-sutil disabled:opacity-30 disabled:cursor-not-allowed transition"><Icon name="chevron-left" className="w-4 h-4" /></button>
                            <button onClick={() => irPara(Math.min(SLIDES.length - 1, slide + 1))} disabled={slide === SLIDES.length - 1} aria-label="Próximo painel" className="w-7 h-7 flex items-center justify-center rounded-md border border-borda text-tinta-suave hover:bg-sutil disabled:opacity-30 disabled:cursor-not-allowed transition"><Icon name="chevron-right" className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                <div ref={scrollRef} onScroll={aoRolar} className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar-style">

                    {/* SLIDE 1: FATURAMENTO NO TEMPO */}
                    <div className="w-full shrink-0 snap-start pr-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <CardPainel titulo="Por ano" descricao="Todo o histórico, fora do período" icone="calendar" fundoIcone="bg-blue-50 dark:bg-blue-500/10" corIcone="text-info">
                                <Barras itens={metricas.serie_ano} corFixa="bg-blue-500" vazio="Sem faturamento registrado." />
                            </CardPainel>
                            <CardPainel titulo="Por mês" descricao="Meses dentro do período" icone="layout-dashboard" fundoIcone="bg-emerald-50 dark:bg-emerald-500/10" corIcone="text-sucesso">
                                <Barras itens={metricas.serie_mes} corFixa="bg-emerald-500" rotuloDe={(i) => formatarMesAno(i.rotulo)} vazio="Nenhum mês com faturamento no período." />
                            </CardPainel>
                            <CardPainel titulo="Por dia" descricao="Dias dentro do período" icone="list" fundoIcone="bg-purple-50 dark:bg-purple-500/10" corIcone="text-purple-600 dark:text-purple-400">
                                <Barras itens={metricas.serie_dia} corFixa="bg-purple-500" rotuloDe={(i) => formatarDataExibicao(i.rotulo).substring(0, 5)} vazio="Nenhum dia com faturamento no período." />
                            </CardPainel>
                        </div>
                    </div>

                    {/* SLIDE 2: DISTRIBUIÇÃO NO PERÍODO */}
                    <div className="w-full shrink-0 snap-start px-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <CardPainel titulo="Receitas por local" descricao="Rateado entre os locais da O.S." icone="map-pin" fundoIcone="bg-teal-50 dark:bg-teal-500/10" corIcone="text-teal-600 dark:text-teal-400">
                                <Barras itens={metricas.ranking_local} cores={CORES_LOCAL} vazio="Nenhum local registrado no período." />
                            </CardPainel>
                            <CardPainel titulo="Formas de pagamento" descricao="Como os clientes pagaram" icone="dollar-sign" fundoIcone="bg-amber-50 dark:bg-amber-500/10" corIcone="text-aviso">
                                <Barras itens={metricas.ranking_forma} cores={CORES_FORMA} vazio="Nenhum pagamento registrado no período." />
                            </CardPainel>
                            <CardPainel titulo="Instituições" descricao="Volume por conta (PIX, Boleto e Link)" icone="link" fundoIcone="bg-sky-50 dark:bg-sky-500/10" corIcone="text-sky-600 dark:text-sky-400">
                                <Barras itens={metricas.ranking_instituicao} cores={CORES_INST} vazio="Nenhuma instituição registrada no período." />
                            </CardPainel>
                        </div>
                    </div>

                    {/* SLIDE 3: DESPESAS E COBRANÇAS DO PERÍODO */}
                    <div className="w-full shrink-0 snap-start pl-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <CardPainel titulo="Despesas por categoria" descricao="Contas com vencimento no período" icone="tag" fundoIcone="bg-gray-100 dark:bg-gray-500/10" corIcone="text-tinta-suave">
                                <Barras itens={despesas.por_categoria} cores={(item) => CORES_CATEGORIA[item.rotulo] || 'bg-gray-500'} vazio="Nenhuma conta no período." />
                            </CardPainel>

                            <CardPainel titulo="Status das contas" descricao={despesas.qtd_vencidas > 0 ? `${despesas.qtd_vencidas} conta(s) vencida(s)` : 'Nenhuma conta vencida'} icone="check-circle" fundoIcone="bg-rose-50 dark:bg-rose-500/10" corIcone="text-rose-600 dark:text-rose-400">
                                {despesas.total_centavos === 0 ? (
                                    <p className="text-mini text-gray-500 italic">Nenhuma conta no período.</p>
                                ) : (() => {
                                    const pendente = centavosParaReais(despesas.pendente_centavos);
                                    const pago = centavosParaReais(despesas.pago_centavos);
                                    const max = Math.max(pendente, pago, 1);
                                    const total = pendente + pago;
                                    return (
                                        <>
                                            <BarRow label="Pendente" valor={pendente} maxVal={max} color="bg-red-500" pctTotal={total > 0 ? (pendente / total) * 100 : 0} />
                                            <BarRow label="Pago" valor={pago} maxVal={max} color="bg-emerald-500" pctTotal={total > 0 ? (pago / total) * 100 : 0} />
                                        </>
                                    );
                                })()}
                            </CardPainel>

                            <CardPainel titulo="Maiores contas" descricao="Top despesas do período" icone="trending-up" fundoIcone="bg-indigo-50 dark:bg-indigo-500/10" corIcone="text-indigo-600 dark:text-indigo-400">
                                {despesas.maiores.length === 0 ? (
                                    <p className="text-mini text-gray-500 italic">Nenhuma conta no período.</p>
                                ) : (() => {
                                    const hoje = obterDataAtual();
                                    const max = Math.max(...despesas.maiores.map(c => centavosParaReais(c.centavos)), 1);
                                    return despesas.maiores.map((c, i) => (
                                        <BarRow
                                            key={c.id}
                                            label={c.descricao}
                                            valor={centavosParaReais(c.centavos)}
                                            maxVal={max}
                                            rank={i + 1}
                                            color={c.status === 'Pago' ? 'bg-emerald-500' : (c.vencimento && c.vencimento < hoje ? 'bg-red-500' : 'bg-amber-500')}
                                        />
                                    ));
                                })()}
                            </CardPainel>

                            {/* Cobrança pendente: o que antes era contado como recebido. */}
                            <CardPainel titulo="Concluído sem baixa" descricao="O.S. encerradas sem pagamento lançado" icone="alert-triangle" fundoIcone="bg-rose-50 dark:bg-rose-500/10" corIcone="text-rose-600 dark:text-rose-400">
                                {metricas.sem_baixa.pedidos.length === 0 ? (
                                    <p className="text-mini text-gray-500 italic">Toda O.S. encerrada no período tem pagamento lançado.</p>
                                ) : metricas.sem_baixa.pedidos.map(p => {
                                    // Só abre a O.S. se ela estiver na lista já carregada; fora
                                    // da janela de carregamento vira linha simples, sem clique
                                    // que não faria nada.
                                    const naMemoria = pedidos.find(x => x.id === p.id);
                                    const conteudo = (
                                        <>
                                            <span className="min-w-0 text-left">
                                                <span className="block text-compacto font-bold text-tinta tabular-nums">#{p.id}</span>
                                                <span className="block text-mini text-tinta-suave truncate">{mascararCliente(p.cliente, isDemo) || '---'}</span>
                                            </span>
                                            <span className="text-compacto font-bold text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                                                R$ {formatarValorFinanceiro(centavosParaReais(p.centavos))}
                                            </span>
                                        </>
                                    );
                                    return naMemoria ? (
                                        <button key={p.id} type="button" onClick={() => abrirEdicao(naMemoria)}
                                            className="w-full flex items-center justify-between gap-3 py-1.5 rounded hover:bg-sutil transition px-1 -mx-1">
                                            {conteudo}
                                        </button>
                                    ) : (
                                        <div key={p.id} className="w-full flex items-center justify-between gap-3 py-1.5 px-1 -mx-1">{conteudo}</div>
                                    );
                                })}
                            </CardPainel>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
