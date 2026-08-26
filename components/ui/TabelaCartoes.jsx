"use client";
import React from 'react';
import { SkeletonLinhas } from '@/components/ui/SkeletonLinhas';

// Uma listagem, dois desenhos: tabela no desktop, cartão no celular.
//
// O ponto todo é que as colunas são DADOS, não marcação. Se cada tela escrevesse
// um <table> e uma lista de cartões, seriam duas marcações a manter em sincronia
// — e elas divergem na primeira alteração, porque nada obriga quem mexe numa a
// lembrar da outra. Aqui a coluna é declarada uma vez e cada desenho decide como
// mostrá-la.
//
// O que muda entre os dois é o PAPEL de cada coluna. Numa tabela toda coluna tem
// o mesmo peso visual; num cartão não dá — nove pares de rótulo e valor
// empilhados viram um bloco ilegível. Por isso `papel` diz onde a coluna cai:
//
//   titulo     cabeçalho do cartão, à esquerda e em destaque
//   subtitulo  logo abaixo do título, sem rótulo
//   selo       cabeçalho do cartão, à direita (status, etiqueta)
//   destaque   abaixo do cabeçalho, grande (valor)
//   bloco      largura inteira, com o rótulo acima — para conteúdo que não cabe
//              num par rótulo/valor: um checklist, um seletor, um calendário
//   corpo      lista de rótulo/valor — é o padrão
//   acoes      rodapé do cartão
//   oculto     aparece só na tabela
//
// Colunas condicionais entram com `.filter(Boolean)` na hora de montar o array,
// e não com um `if` no meio da marcação.
//
// PROPRIEDADES DE UMA COLUNA
//   titulo        conteúdo do <th>; aceita nó (ex.: título com botão de ordenar)
//   rotuloCartao  rótulo no cartão quando `titulo` não é texto simples
//   celula        (item) => nó. Só o conteúdo: posicionamento fica nas classes
//                 abaixo, senão o padding da tabela vaza para dentro do cartão
//   thClassName   classes do <th>
//   tdClassName   classes do <td>
//   papel         ver acima; ausente = 'corpo'
//
// LISTA SIMPLES OU AGRUPADA
// `itens` para uma lista corrida; `grupos` quando a tela separa por seção (a
// Produção agrupa por status). Um grupo é { chave, cabecalho, classeCabecalho,
// itens } — no desktop vira uma faixa que atravessa a tabela, no celular um
// título acima dos cartões daquele grupo.
//
// `faixa` é opcional e vale só para o cartão: (item) => classe de fundo, usada
// num filete vertical à esquerda. Serve para o estado do registro ser lido pela
// cor antes do texto.
//
// `refDaLinha` é aplicado só nas linhas da TABELA. A animação que o usa mede
// posição na tela, e um elemento escondido por CSS mede zero — registrar
// cartão e linha com o mesmo id faria a medida vir do que estiver invisível.

const PONTO_DE_CORTE = 'lg'; // abaixo disso, cartões

export function TabelaCartoes({
    colunas,
    itens,
    grupos,
    chave,
    aoClicar,
    aoContextMenu,
    classeDaLinha,
    refDaLinha,
    carregando = false,
    vazio = null,
    faixa,
    className = '',
}) {
    // Uma lista solta é um grupo sem cabeçalho: o resto do componente só conhece
    // grupos, e não precisa de dois caminhos.
    const secoes = grupos ?? [{ chave: '_', cabecalho: null, itens: itens ?? [] }];
    const totalItens = secoes.reduce((n, s) => n + s.itens.length, 0);

    const porPapel = (p) => colunas.filter(c => (c.papel ?? 'corpo') === p);
    const doCorpo = porPapel('corpo');
    const emBloco = porPapel('bloco');
    const [titulo] = porPapel('titulo');
    const [subtitulo] = porPapel('subtitulo');
    const [selo] = porPapel('selo');
    const [destaque] = porPapel('destaque');
    const acoes = porPapel('acoes');

    const clicavel = typeof aoClicar === 'function';
    const aoAtivar = (item) => (clicavel ? () => aoClicar(item) : undefined);
    const aoMenu = (item) => (typeof aoContextMenu === 'function' ? (e) => aoContextMenu(item, e) : undefined);

    const semItens = !carregando && totalItens === 0;

    return (
        <div className={className}>
            {/* ---------- TABELA (desktop) ---------- */}
            <div className={`hidden ${PONTO_DE_CORTE}:block overflow-x-auto custom-scrollbar`}>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                        <tr className="border-b border-borda text-corpo font-semibold text-tinta-suave tracking-wide uppercase">
                            {colunas.map((c, i) => (
                                <th key={i} className={c.thClassName || 'px-6 py-4'}>{c.titulo}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="animate-fade-screen">
                        {carregando && <SkeletonLinhas colunas={colunas.length} />}
                        {semItens && vazio && (
                            <tr><td colSpan={colunas.length} className="px-6 py-10 text-center">{vazio}</td></tr>
                        )}
                        {secoes.map(secao => (
                            <React.Fragment key={secao.chave}>
                                {secao.cabecalho && (
                                    <tr className="select-none">
                                        <td colSpan={colunas.length} className={`px-4 py-2 border-y border-gray-200 dark:border-darkBorder font-semibold tracking-wide uppercase text-micro text-white ${secao.classeCabecalho || ''}`}>
                                            {secao.cabecalho}
                                        </td>
                                    </tr>
                                )}
                                {secao.itens.map(item => (
                                    <tr
                                        key={chave(item)}
                                        ref={refDaLinha ? refDaLinha(item) : undefined}
                                        onClick={aoAtivar(item)}
                                        onContextMenu={aoMenu(item)}
                                        className={`border-b border-borda-fraca transition group ${clicavel ? 'cursor-pointer hover:bg-sutil' : 'hover:bg-sutil'} ${classeDaLinha ? classeDaLinha(item) : ''}`}
                                    >
                                        {colunas.map((c, i) => (
                                            <td key={i} className={c.tdClassName || 'px-6 py-4'}>{c.celula(item)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------- CARTÕES (celular) ---------- */}
            <div className={`${PONTO_DE_CORTE}:hidden flex flex-col gap-2.5 p-3`}>
                {carregando && Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border border-borda rounded-lg p-4 bg-superficie flex flex-col gap-2.5">
                        <div className="h-4 w-1/3 rounded bg-realce animate-pulse" />
                        <div className="h-3 w-2/3 rounded bg-realce animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-realce animate-pulse" />
                    </div>
                ))}

                {semItens && vazio && <div className="py-10 text-center">{vazio}</div>}

                {secoes.map(secao => (
                    <React.Fragment key={secao.chave}>
                        {/* Sem sticky de propósito: a página já tem duas barras fixas
                            (menu e sub-abas), e um terceiro elemento grudento teria de
                            conhecer a altura somada das outras duas para não cobri-las.
                            O título rola junto com os cartões do seu grupo. */}
                        {secao.cabecalho && (
                            <div className={`-mx-3 px-4 py-1.5 mt-1 first:mt-0 font-semibold tracking-wide uppercase text-micro text-white ${secao.classeCabecalho || ''}`}>
                                {secao.cabecalho}
                            </div>
                        )}
                        {secao.itens.map(item => (
                            <div
                                key={chave(item)}
                                onClick={aoAtivar(item)}
                                onContextMenu={aoMenu(item)}
                                className={`relative overflow-hidden border border-borda rounded-lg bg-superficie shadow-sm p-4 flex flex-col gap-3 transition ${faixa ? 'pl-5' : ''} ${clicavel ? 'active:bg-sutil' : ''} ${classeDaLinha ? classeDaLinha(item) : ''}`}
                            >
                                {/* Filete de cor à esquerda. Numa lista rolando no dedo a cor
                                    chega antes da palavra, então o cartão diz o estado antes
                                    de ser lido. Decorativo de propósito (aria-hidden): a
                                    informação já está escrita no selo, e repetir para o leitor
                                    de tela seria ruído. */}
                                {faixa && <span aria-hidden="true" className={`absolute left-0 top-0 bottom-0 w-1.5 ${faixa(item)}`} />}

                                {(titulo || selo) && (
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            {titulo && <div className="font-bold text-tinta text-base">{titulo.celula(item)}</div>}
                                            {subtitulo && <div className="text-corpo text-tinta-suave mt-0.5">{subtitulo.celula(item)}</div>}
                                        </div>
                                        {selo && <div className="shrink-0">{selo.celula(item)}</div>}
                                    </div>
                                )}

                                {destaque && (
                                    <div className="text-xl font-black text-tinta tracking-tight tabular-nums">
                                        {destaque.celula(item)}
                                    </div>
                                )}

                                {emBloco.map((c, i) => (
                                    <div key={i} className="flex flex-col gap-1.5 border-t border-borda-fraca pt-3">
                                        <span className="text-micro uppercase tracking-wider text-tinta-suave">
                                            {c.rotuloCartao ?? c.titulo}
                                        </span>
                                        <div className="min-w-0">{c.celula(item)}</div>
                                    </div>
                                ))}

                                {doCorpo.length > 0 && (
                                    <dl className="flex flex-col gap-1.5 border-t border-borda-fraca pt-3">
                                        {doCorpo.map((c, i) => (
                                            <div key={i} className="flex items-baseline justify-between gap-3">
                                                <dt className="text-micro uppercase tracking-wider text-tinta-suave shrink-0">
                                                    {c.rotuloCartao ?? c.titulo}
                                                </dt>
                                                <dd className="text-corpo text-tinta text-right min-w-0 break-words">
                                                    {c.celula(item)}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}

                                {acoes.length > 0 && (
                                    // stopPropagation no rodapé inteiro: no cartão o alvo do
                                    // clique é a linha toda, e um botão de imprimir que também
                                    // abrisse a O.S. seria um erro difícil de perceber no dedo.
                                    <div className="flex items-center justify-end gap-1 border-t border-borda-fraca pt-2" onClick={(e) => e.stopPropagation()}>
                                        {acoes.map((c, i) => <div key={i}>{c.celula(item)}</div>)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
