"use client";
import React, { useState, useMemo } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useOsModal } from '@/context/OsModalContext';
import { useOrcamentos } from '@/context/OrcamentosContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarMoeda, obterDataAtual, mascararCliente } from '@/lib/utils/formatters';
import { SubAbas } from '@/components/ui/SubAbas';
import { BarraAcoes } from '@/components/ui/BarraAcoes';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';


export default function OrcamentosTab() {
    const { isAdmin, isDemo } = useSessao();
    const { setBuscaCliente, setItensPedido, setNovoPedido } = useOsModal();
    const { setAbaOrcamentos, abaOrcamentos, setOrcamentoFormalizadoEmEdicao, setModalOrcamentoFormalizadoAberto, orcamentosFormalizados, setNovoOrcamentoPre, setModalOrcamentoPreAberto, orcamentosPreProntos, abrirEdicaoOrcamento, transformarEmOS, baixarPDFOrcamento, excluirOrcamentoFormalizado, excluirOrcamentoPre } = useOrcamentos();
    const [buscaPreProntos, setBuscaPreProntos] = useState('');

    const orcsFiltrados = useMemo(() => {
        let filtrados = orcamentosPreProntos;
        if (buscaPreProntos) {
            const term = buscaPreProntos.toLowerCase();
            filtrados = orcamentosPreProntos.filter(o => o.titulo.toLowerCase().includes(term) || o.texto.toLowerCase().includes(term));
        }
        return filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }, [orcamentosPreProntos, buscaPreProntos]);

    return (
        <>
            { (
                    <SubAbas
                        valor={abaOrcamentos}
                        aoMudar={setAbaOrcamentos}
                        abas={[
                            { id: 'formalizados', rotulo: 'Formalizados', icone: 'file-text' },
                            { id: 'pre_prontos',  rotulo: 'Pré Prontos',  icone: 'file-text' },
                        ]}
                    />
                )}
                <div key={abaOrcamentos} className="animate-fade-screen">
{ abaOrcamentos === 'formalizados' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Orçamentos Formalizados</h1>
                                <p className="text-corpo text-tinta-suave mt-1.5 font-medium max-w-xl">
                                    Crie e gerencie orçamentos. Transforme orçamentos aprovados em Ordens de Serviço.
                                </p>
                            </div>
                            <div className="hidden lg:flex gap-2">
                                <button onClick={() => {
                                    setOrcamentoFormalizadoEmEdicao(null);
                                    setBuscaCliente('');
                                    setItensPedido([]);
                                    setNovoPedido({
                                        cliente: '',
                                        cliente_id: null,
                                        servico: '',
                                        valor_total: '',
                                        status: 'Orçamento',
                                        data_pedido: obterDataAtual(),
                                        prazo: '',
                                        responsavel: '',
                                        entrega: false
                                    });
                                    setModalOrcamentoFormalizadoAberto(true);
                                }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" /> Novo Orçamento
                                </button>
                            </div>
                        </div>

                        <div className="bg-superficie border border-borda rounded overflow-hidden">
                            {/* Ver components/ui/TabelaCartoes.jsx. */}
                            <TabelaCartoes
                                itens={orcamentosFormalizados}
                                chave={orc => orc.id}
                                vazio={<span className="text-corpo text-gray-400">Nenhum orçamento formalizado encontrado.</span>}
                                aoClicar={orc => abrirEdicaoOrcamento(orc)}
                                colunas={[
                                    {
                                        papel: 'titulo',
                                        titulo: 'ID',
                                        tdClassName: 'px-6 py-4 text-corpo font-medium text-gray-900 dark:text-gray-300',
                                        celula: orc => `#${orc.id}`,
                                    },
                                    {
                                        papel: 'subtitulo',
                                        titulo: 'Cliente',
                                        tdClassName: 'px-6 py-4 text-corpo font-medium text-gray-900 dark:text-gray-300',
                                        celula: orc => mascararCliente(orc.cliente, isDemo),
                                    },
                                    {
                                        papel: 'destaque',
                                        titulo: 'Valor',
                                        tdClassName: 'px-6 py-4 text-corpo font-medium text-sucesso',
                                        celula: orc => <span className="text-sucesso">R$ {formatarMoeda(Math.round(orc.valor).toString())}</span>,
                                    },
                                    {
                                        titulo: 'Criado por',
                                        celula: orc => (
                                            <>
                                                <span className="block text-corpo font-semibold text-tinta">{orc.criado_por || '---'}</span>
                                                <span className="block text-mini text-gray-400 mt-0.5">{new Date(orc.created_at).toLocaleDateString('pt-BR')}</span>
                                            </>
                                        ),
                                    },
                                    {
                                        papel: 'acoes',
                                        titulo: 'Ações',
                                        thClassName: 'px-6 py-4 text-right',
                                        tdClassName: 'px-6 py-4 text-corpo text-right',
                                        celula: orc => (
                                            <div className="flex justify-end gap-1">
                                                <Tooltip label="Aprovar e Transformar em O.S.">
                                                    <button onClick={(e) => { e.stopPropagation(); transformarEmOS(orc); }} aria-label="Aprovar e Transformar em O.S." className="p-2 text-sucesso hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition inline-block">
                                                        <Icon name="check-circle" className="w-5 h-5 inline-block" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip label="Imprimir Orçamento">
                                                    <button onClick={(e) => { e.stopPropagation(); baixarPDFOrcamento(orc); }} aria-label="Imprimir Orçamento" className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition inline-block">
                                                        <Icon name="file-text" className="w-5 h-5 inline-block" />
                                                    </button>
                                                </Tooltip>
                                                {isAdmin && (
                                                    <Tooltip label="Excluir Orçamento">
                                                        <button onClick={(e) => { e.stopPropagation(); excluirOrcamentoFormalizado(orc.id); }} aria-label="Excluir Orçamento" className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                                            <Icon name="trash-2" className="w-5 h-5 inline-block" />
                                                        </button>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </main>
                )}
{abaOrcamentos === 'formalizados'}
{ abaOrcamentos === 'pre_prontos' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Textos Pré Prontos</h1>
                                <p className="text-corpo text-tinta-suave mt-1.5 font-medium max-w-xl">
                                    Modelos de texto para orçamentos rápidos (Visíveis para a produção, editáveis apenas por Admin).
                                </p>
                            </div>
                            {isAdmin && (
                                <div className="hidden lg:flex gap-2">
                                    <button onClick={() => {
                                        setNovoOrcamentoPre({ id: null, titulo: '', texto: '', empresa: 'Berlim' });
                                        setModalOrcamentoPreAberto(true);
                                    }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                        <Icon name="plus" /> Novo Texto
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative mb-6 hidden lg:block">
                            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar orçamentos por título ou conteúdo..."
                                value={buscaPreProntos}
                                onChange={(e) => setBuscaPreProntos(e.target.value)}
                                className="w-full bg-superficie border border-borda rounded-lg pl-10 pr-9 py-2.5 text-corpo focus:outline-none focus:border-brand transition"
                            />
                            {buscaPreProntos && (
                                <Tooltip label="Limpar Busca" className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <button type="button" onClick={() => setBuscaPreProntos('')} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                                </Tooltip>
                            )}
                        </div>

                        {orcsFiltrados.length === 0 ? (
                            <div className="text-center py-10 text-tinta-suave text-corpo">
                                Nenhum orçamento encontrado com o termo &quot;{buscaPreProntos}&quot;.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {orcsFiltrados.map(orc => (
                                    <div key={orc.id} onClick={() => { setNovoOrcamentoPre({...orc, texto: orc.texto || ''}); setModalOrcamentoPreAberto(true); }} className="bg-superficie rounded-xl shadow-sm border border-borda flex flex-col group relative cursor-pointer hover:border-brand/50 transition-colors">
                                        <div className="flex justify-between items-start gap-3 px-5 py-3.5 bg-gray-50/70 dark:bg-darkElevated/60 rounded-t-xl border-b border-dashed border-borda-forte">
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h3 className="font-bold text-tinta leading-tight truncate">{orc.titulo}</h3>
                                                <p className={`text-mini font-semibold uppercase tracking-wide mt-1 ${orc.empresa === 'Futura' ? 'text-info' : 'text-orange-600 dark:text-orange-400'}`}>
                                                    {orc.empresa === 'Futura' ? 'Futura' : 'Berlim'}
                                                </p>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-1 shrink-0">
                                                    <button onClick={(e) => { e.stopPropagation(); excluirOrcamentoPre(orc.id); }} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"><Icon name="trash-2" className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-3 p-5 flex-1">
                                            <pre className="text-corpo text-tinta-suave whitespace-pre-wrap font-sans bg-sutil p-3 rounded-lg flex-1">
                                                {orc.texto}
                                            </pre>
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(orc.texto);
                                            }} className="text-mini font-semibold text-brand hover:underline flex items-center gap-1 self-start">
                                                <Icon name="copy" className="w-3 h-3" /> Copiar Texto
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                )}
{abaOrcamentos === 'pre_prontos'}
                </div>

            {/* A ação primária muda com a sub-aba. Em "Pré Prontos" ela só existe para
                administrador, e a busca entra como painel — é a única das duas seções
                que tem campo de pesquisa. */}
            <BarraAcoes
                acoes={[
                    abaOrcamentos === 'pre_prontos' && {
                        id: 'buscar', icone: 'search', rotulo: 'Buscar',
                        ativo: !!buscaPreProntos,
                        conteudo: (
                            <div className="relative">
                                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Título ou conteúdo..."
                                    value={buscaPreProntos}
                                    onChange={(e) => setBuscaPreProntos(e.target.value)}
                                    className="w-full bg-elevado border border-borda rounded-lg pl-10 pr-9 py-2 text-corpo focus:outline-none focus:border-brand transition"
                                />
                                {buscaPreProntos && (
                                    <button type="button" onClick={() => setBuscaPreProntos('')} aria-label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition">
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ),
                    },
                    (abaOrcamentos === 'formalizados' || isAdmin) && {
                        id: 'novo', icone: 'plus', destaque: true,
                        rotulo: abaOrcamentos === 'formalizados' ? 'Novo Orçamento' : 'Novo Texto',
                        aoClicar: () => {
                            if (abaOrcamentos === 'formalizados') {
                                setOrcamentoFormalizadoEmEdicao(null);
                                setBuscaCliente('');
                                setItensPedido([]);
                                setNovoPedido({
                                    cliente: '', cliente_id: null, servico: '', valor_total: '',
                                    status: 'Orçamento', data_pedido: obterDataAtual(), prazo: '',
                                    responsavel: '', entrega: false,
                                });
                                setModalOrcamentoFormalizadoAberto(true);
                            } else {
                                setNovoOrcamentoPre({ id: null, titulo: '', texto: '', empresa: 'Berlim' });
                                setModalOrcamentoPreAberto(true);
                            }
                        },
                    },
                ].filter(Boolean)}
            />
        </>
    );
}
