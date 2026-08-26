"use client";
import { useRef, useLayoutEffect } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useClientes } from '@/context/ClientesContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { STATUSES_PRODUCAO, obterCorFundoStatus, obterCorContornoPrazo } from '@/lib/utils/constants';
import { mascararCliente, formatarDataExibicao } from '@/lib/utils/formatters';
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { InlineDropdown, MultiSelectDropdown } from '@/components/ui/Dropdown';
import { ItensChecklist } from '@/components/ItensChecklist';
import { ChipNome } from '@/components/ui/ChipNome';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { BarraAcoes } from '@/components/ui/BarraAcoes';


// Anima a linha que trocou de posição na tabela (ex: mudou de status e foi pra
// outro grupo, ou reordenou por prazo). Técnica FLIP: mede a posição de cada
// linha, e se ela mudou desde a última medição, aplica um deslocamento
// instantâneo (sem transição) que a "volta" pro lugar antigo e, no frame
// seguinte, anima até a posição real via transform.
// Importante: só remede quando `ordem` (a sequência de IDs renderizada)
// realmente muda — nunca a cada render — senão qualquer coisa que cause um
// re-render (abrir um dropdown, rolar a página, digitar na busca) é
// interpretada como "todas as linhas se moveram" e a tela inteira treme.
function useAnimacaoLinhas(ordem) {
    const nodesRef = useRef({});
    const posicoesRef = useRef({});

    const registrarLinha = (id) => (node) => {
        if (node) nodesRef.current[id] = node;
        else delete nodesRef.current[id];
    };

    useLayoutEffect(() => {
        const posicoesAnteriores = posicoesRef.current;
        const novasPosicoes = {};
        const alteracoes = [];

        Object.entries(nodesRef.current).forEach(([id, node]) => {
            // Posição absoluta no documento (soma o scroll), pra não confundir
            // "a página rolou" com "a linha mudou de lugar".
            const top = node.getBoundingClientRect().top + window.scrollY;
            novasPosicoes[id] = top;
            const anterior = posicoesAnteriores[id];
            if (anterior !== undefined && Math.abs(anterior - top) > 1) {
                alteracoes.push({ node, delta: anterior - top });
            }
        });

        if (alteracoes.length > 0) {
            alteracoes.forEach(({ node, delta }) => {
                node.style.transition = 'none';
                node.style.transform = `translateY(${delta}px)`;
            });
            alteracoes[0].node.getBoundingClientRect();
            requestAnimationFrame(() => {
                alteracoes.forEach(({ node }) => {
                    node.style.transition = 'transform 350ms ease';
                    node.style.transform = '';
                    const limparTransicao = () => { node.style.transition = ''; node.removeEventListener('transitionend', limparTransicao); };
                    node.addEventListener('transitionend', limparTransicao);
                });
            });
        }

        posicoesRef.current = novasPosicoes;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ordem]);

    return registrarLinha;
}

export default function ProducaoTab() {
    const { isDemo, usuariosSistema } = useSessao();
    const { confirmar, abrirContextMenu, avisar } = useUi();
    const { buscaProducaoText, setBuscaProducaoText, setPedidoEmEdicao, setModalAberto, pedidosProducaoAtivos, dadosCarregados, opcoesStatusPermitidas, abrirEdicao, atualizarCampoInline, imprimirOS, duplicarOS } = usePedidos();
    const { isClienteProblema } = useClientes();
    const nomesResponsaveis = usuariosSistema.filter(u => u.nivel !== 'demo').map(u => u.nome);

    const gruposStatus = STATUSES_PRODUCAO
        .map(status => ({
            status,
            pedidos: pedidosProducaoAtivos
                .filter(p => p.status === status)
                .sort((a, b) => {
                    if (!a.prazo) return 1;
                    if (!b.prazo) return -1;
                    return a.prazo.localeCompare(b.prazo);
                }),
        }))
        .filter(g => g.pedidos.length > 0);

    const ordemLinhas = gruposStatus.flatMap(g => g.pedidos.map(p => p.id)).join(',');
    const registrarLinha = useAnimacaoLinhas(ordemLinhas);

    const handleAtualizarCampo = async (id, campo, valor) => {
        if (campo === 'status' && valor === 'Concluído') {
            if (!(await confirmar("Deseja realmente concluir esta OS?"))) {
                return;
            }
        }
        atualizarCampoInline(id, campo, valor);
    };

    const montarItensContexto = (p) => [
        { label: 'Editar O.S.', icon: 'edit-3', onClick: () => abrirEdicao(p) },
        { label: 'Duplicar O.S.', icon: 'layers', onClick: () => duplicarOS(p) },
        { label: 'Imprimir', icon: 'printer', onClick: () => imprimirOS(p) },
        { label: 'Copiar linha', icon: 'copy', onClick: () => {
            const linha = [`#${p.id}`, formatarDataExibicao(p.prazo), p.responsavel || '', mascararCliente(p.cliente, isDemo), p.status].join('\t');
            navigator.clipboard.writeText(linha);
            avisar('Linha copiada!', 'sucesso');
        }},
        { label: 'Marcar Concluído', icon: 'check-circle', divisorAntes: true, onClick: () => handleAtualizarCampo(p.id, 'status', 'Concluído') },
    ];

    return (
        <>
            { (
                    <main className="flex-1 p-6 lg:p-10 mx-auto w-full flex flex-col min-h-[calc(100vh-60px)]">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Produção</h1>
                                <p className="text-corpo text-tinta-suave mt-1">Gerencie a esteira de pedidos ativos.</p>
                            </div>
                            <div className="hidden lg:flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 min-w-[300px]">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaProducaoText} onChange={e => setBuscaProducaoText(e.target.value)} placeholder="Pesquisar por cliente, OS ou responsável..." className="w-full bg-superficie border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                    {buscaProducaoText && (
                                        <Tooltip label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                            <button type="button" onClick={() => setBuscaProducaoText('')} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                                        </Tooltip>
                                    )}
                                </div>
                                <button onClick={() => { setPedidoEmEdicao(null); setModalAberto(true); }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2"><Icon name="plus" /> Nova O.S.</button>
                            </div>
                        </div>

                        <div className="flex-1 bg-superficie rounded border border-borda">
                            {/* Uma definição de colunas, dois desenhos — ver
                                components/ui/TabelaCartoes.jsx. Os grupos por status
                                viram faixa na tabela e título acima dos cartões.

                                A `faixa` repete a cor do cabeçalho do grupo de
                                propósito: o título rola para fora da tela, e sem o
                                filete o cartão perde, no meio de uma lista longa, a
                                única marca de qual etapa ele é. */}
                            <TabelaCartoes
                                grupos={gruposStatus.map(g => ({
                                    chave: g.status,
                                    classeCabecalho: obterCorFundoStatus(g.status),
                                    itens: g.pedidos,
                                    cabecalho: (
                                        <>
                                            {g.status} — <span className="text-white/70">{g.pedidos.length} {g.pedidos.length === 1 ? 'pedido' : 'pedidos'}</span>
                                        </>
                                    ),
                                }))}
                                chave={p => p.id}
                                faixa={p => obterCorFundoStatus(p.status)}
                                refDaLinha={p => registrarLinha(p.id)}
                                carregando={!dadosCarregados}
                                vazio={<span className="text-gray-500 italic">Nenhuma OS encontrada.</span>}
                                aoContextMenu={(p, e) => abrirContextMenu(e, montarItensContexto(p))}
                                colunas={[
                                    {
                                        papel: 'titulo',
                                        titulo: 'ID',
                                        thClassName: 'px-6 py-4 w-24 text-center',
                                        tdClassName: 'px-4 py-3 font-medium text-tinta-fraca text-center',
                                        celula: p => <button type="button" onClick={() => abrirEdicao(p)} className="hover:text-brand transition">#{p.id}</button>,
                                    },
                                    {
                                        papel: 'bloco',
                                        titulo: 'Prazo',
                                        thClassName: 'px-6 py-4 w-32 text-center',
                                        tdClassName: 'px-4 py-3',
                                        celula: p => <CustomDatePicker value={p.prazo || ''} onChange={val => handleAtualizarCampo(p.id, 'prazo', val)} placeholder="Definir prazo..." className={`w-full bg-gray-50 dark:bg-darkElevated border-2 ${obterCorContornoPrazo(p.prazo)} rounded px-2.5 py-1.5 text-mini outline-none hover:border-brand transition text-gray-700 dark:text-[#EDEDED]`} />,
                                    },
                                    {
                                        papel: 'bloco',
                                        titulo: 'Resp.',
                                        thClassName: 'px-6 py-4 w-32 text-center',
                                        tdClassName: 'px-4 py-3',
                                        celula: p => <MultiSelectDropdown value={p.responsavel} options={nomesResponsaveis} onChange={(val) => handleAtualizarCampo(p.id, 'responsavel', val)} className="w-full bg-sutil border border-borda rounded px-2.5 py-1.5 text-mini outline-none hover:border-brand" />,
                                    },
                                    {
                                        papel: 'subtitulo',
                                        titulo: 'Cliente',
                                        thClassName: 'px-6 py-4 text-center',
                                        tdClassName: `px-4 py-3 font-semibold truncate max-w-[12rem]`,
                                        celula: p => (
                                            <div className={`flex items-center gap-1.5 ${isClienteProblema(p.cliente, p.cliente_id) ? 'text-perigo' : 'text-tinta'}`}>
                                                {mascararCliente(p.cliente, isDemo)}
                                                {isClienteProblema(p.cliente, p.cliente_id) && <Icon name="alert-triangle" className="w-3.5 h-3.5 text-red-500 shrink-0" title="Cliente Problema" />}
                                            </div>
                                        ),
                                    },
                                    {
                                        papel: 'bloco',
                                        titulo: 'Serviço',
                                        thClassName: 'px-6 py-4 w-full min-w-[300px] text-left',
                                        tdClassName: 'px-4 py-3 text-tinta font-medium',
                                        celula: p => <ItensChecklist pedido={p} />,
                                    },
                                    {
                                        papel: 'acoes',
                                        titulo: 'Ações',
                                        thClassName: 'px-6 py-4 w-32 text-center',
                                        tdClassName: 'px-4 py-3',
                                        celula: p => (
                                            <div className="flex items-center justify-center gap-1">
                                                <Tooltip label="Arte Aprovada">
                                                    <button type="button" onClick={() => handleAtualizarCampo(p.id, 'aprovado', !p.aprovado)} aria-label="Arte Aprovada" className={`p-2 rounded transition ${p.aprovado ? 'text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700' : 'text-gray-300 dark:text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>
                                                        <Icon name="thumbs-up" className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip label="Pronto para Entrega">
                                                    <button type="button" onClick={() => handleAtualizarCampo(p.id, 'entrega', !p.entrega)} aria-label="Pronto para Entrega" className={`p-2 rounded transition ${p.entrega ? 'text-white bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700' : 'text-gray-300 dark:text-gray-600 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30'}`}>
                                                        <Icon name="package" className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        ),
                                    },
                                    {
                                        papel: 'bloco',
                                        titulo: 'Status',
                                        thClassName: 'px-6 py-4 w-40 text-center',
                                        tdClassName: 'px-4 py-3',
                                        celula: p => <InlineDropdown value={p.status} options={opcoesStatusPermitidas} onChange={(val) => handleAtualizarCampo(p.id, 'status', val)} className="w-full bg-sutil border border-borda rounded px-2.5 py-1.5 text-mini outline-none hover:border-brand" />,
                                    },
                                    {
                                        titulo: 'Local',
                                        thClassName: 'px-6 py-4 w-32 text-center',
                                        tdClassName: 'px-4 py-3 align-middle',
                                        celula: p => (
                                            <div className="flex items-center justify-end lg:justify-center flex-wrap gap-1 min-h-[32px]">
                                                {(p.local_producao || 'Berlim').split(',').map(s => s.trim()).filter(Boolean).map(local => (
                                                    <ChipNome key={local} nome={local} />
                                                ))}
                                            </div>
                                        ),
                                    },
                                    {
                                        papel: 'acoes',
                                        titulo: 'Concluir',
                                        thClassName: 'px-6 py-4 w-24 text-right',
                                        tdClassName: 'px-4 py-3 text-right',
                                        celula: p => (
                                            <Tooltip label="Marcar como Concluído">
                                                <button type="button" onClick={() => handleAtualizarCampo(p.id, 'status', 'Concluído')} aria-label="Marcar como Concluído" className="p-2 text-sucesso hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition rounded inline-block">
                                                    <Icon name="check-circle" className="w-5 h-5 inline-block" />
                                                </button>
                                            </Tooltip>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                        {/* No celular os mesmos controles do topo viram rodapé fixo: lá em cima
                            eles roubam altura da lista e somem assim que a pessoa rola. */}
                        <BarraAcoes
                            acoes={[
                                {
                                    id: 'buscar', icone: 'search', rotulo: 'Buscar',
                                    ativo: !!buscaProducaoText,
                                    conteudo: (
                                        <div className="relative">
                                            <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                value={buscaProducaoText}
                                                onChange={e => setBuscaProducaoText(e.target.value)}
                                                placeholder="Cliente, O.S. ou responsável..."
                                                className="w-full bg-elevado border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]"
                                            />
                                            {buscaProducaoText && (
                                                <button type="button" onClick={() => setBuscaProducaoText('')} aria-label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition">
                                                    <Icon name="x" className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    id: 'nova', icone: 'plus', rotulo: 'Nova O.S.', destaque: true,
                                    aoClicar: () => { setPedidoEmEdicao(null); setModalAberto(true); },
                                },
                            ]}
                        />
                    </main>
                )}

        </>
    );
}
