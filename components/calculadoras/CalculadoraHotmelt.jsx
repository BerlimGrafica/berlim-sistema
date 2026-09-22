"use client";
import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { CustomSelect } from '@/components/ui/Dropdown';
import { formatarValorFinanceiro } from '@/lib/utils/formatters';
import { CampoNumerico } from '@/components/calculadoras/CampoNumerico';
import { PremissasHotmelt } from '@/components/calculadoras/PremissasHotmelt';
import {
    MODALIDADES, LAMINACOES, PAPEIS_MIOLO, papelPorNome, PRAZOS, FORMATOS,
    CONFIG_PADRAO, PREMISSAS_PADRAO,
    calcularHotmelt, calcularFaixas, textoWhatsapp, mesclarPremissas,
} from '@/lib/calculadoras/hotmelt';

// Mesmo desenho da calculadora de bloquinhos, pelas mesmas razões: três blocos
// numerados na ordem em que a pergunta é feita no balcão, o preço grande com a
// conta escrita por extenso logo abaixo, e as duas colunas de apoio.
//
// A diferença está na linha da conta. Em bloquinhos ela é "custo + margem =
// preço", porque lá o preço nasce do custo. Aqui a planilha já parte de preços
// de venda, e a única coisa que os multiplica é a urgência — então a linha é
// "produção × prazo + prova". É a mesma ideia: mostrar a conta inteira em vez
// de um número que aparece do nada.

const CHAVE_PREMISSAS = 'calc_hotmelt_premissas';

const dinheiro = (v) => `R$ ${formatarValorFinanceiro(v)}`;
const classeCampo = 'w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo text-tinta outline-none focus:border-brand transition';

function Campo({ rotulo, children, dica }) {
    return (
        <div>
            <label className="block text-mini font-semibold text-tinta-corpo mb-1">
                {rotulo}
                {dica && <span className="font-normal text-tinta-suave"> · {dica}</span>}
            </label>
            {children}
        </div>
    );
}

function Selecao({ valor, aoMudar, opcoes }) {
    return (
        <CustomSelect
            value={valor}
            onChange={aoMudar}
            className={`${classeCampo} cursor-pointer`}
            options={opcoes.map(o => (typeof o === 'object' ? o : { value: o, label: String(o) }))}
        />
    );
}

function Bloco({ numero, titulo, children, colunas = 'sm:grid-cols-3' }) {
    return (
        <section>
            <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-mini font-black flex items-center justify-center shrink-0">{numero}</span>
                <h3 className="text-corpo font-bold text-tinta">{titulo}</h3>
            </div>
            <div className={`grid grid-cols-1 ${colunas} gap-3`}>{children}</div>
        </section>
    );
}

function contarMudados(ajustes) {
    const efetivas = mesclarPremissas(ajustes);
    let n = 0;
    for (const [grupo, campos] of Object.entries(PREMISSAS_PADRAO)) {
        for (const campo of Object.keys(campos)) {
            if (efetivas[grupo][campo] !== campos[campo]) n += 1;
        }
    }
    return n;
}

export function CalculadoraHotmelt() {
    const [config, setConfig] = useState(CONFIG_PADRAO);
    const [ajustes, setAjustes] = useState({});
    const [verDetalhe, setVerDetalhe] = useState(false);

    // Os ajustes vêm do navegador na primeira pintura, e não no useState: ler
    // localStorage durante a renderização do servidor quebraria a hidratação.
    useEffect(() => {
        try {
            const guardado = localStorage.getItem(CHAVE_PREMISSAS);
            if (guardado) setAjustes(JSON.parse(guardado));
        } catch {
            // Aba anônima, armazenamento bloqueado: segue com o padrão da planilha.
        }
    }, []);

    const mexer = (campos) => setConfig(c => ({ ...c, ...campos }));

    // Trocar para um papel sem preço de P&B junta as páginas num campo só.
    // Elas passam a ser cobradas como coloridas de qualquer jeito — melhor que
    // isso aconteça à vista, e não num campo que some levando o número consigo.
    const trocarPapel = (nome) => {
        if (papelPorNome(nome).temPB) return mexer({ papelMiolo: nome });
        const total = Math.floor(Number(config.paginasPB) || 0) + Math.floor(Number(config.paginasColoridas) || 0);
        mexer({ papelMiolo: nome, paginasPB: 0, paginasColoridas: total });
    };

    const guardarAjustes = (novos) => {
        setAjustes(novos);
        try { localStorage.setItem(CHAVE_PREMISSAS, JSON.stringify(novos)); } catch {}
    };
    const restaurarAjustes = () => {
        setAjustes({});
        try { localStorage.removeItem(CHAVE_PREMISSAS); } catch {}
    };

    const r = useMemo(() => calcularHotmelt(config, ajustes), [config, ajustes]);
    const faixas = useMemo(() => calcularFaixas(config, ajustes), [config, ajustes]);
    const texto = useMemo(() => textoWhatsapp(config, r), [config, r]);
    const quantosMudados = useMemo(() => contarMudados(ajustes), [ajustes]);

    const completo = config.modalidade === 'Livro completo';
    const premissas = mesclarPremissas(ajustes);
    const porFacePadrao = premissas.formatos[config.formato] ?? 0;

    const linhasDoPreco = [
        ['Impressão do miolo', r.partes.impressaoMiolo],
        ['Capas coloridas', r.partes.capas],
        ['Laminação', r.partes.laminacao],
        ['Encadernação Hot Melt', r.partes.hotMelt],
        ['Adicional de urgência', r.partes.adicionalUrgencia],
        ['Prova física', r.partes.prova],
    ].filter(([, valor]) => valor > 0);

    const maiorParte = Math.max(...linhasDoPreco.map(([, v]) => v), 1);

    return (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(320px,370px)] gap-4 items-start">
            <div className="space-y-4 min-w-0">

                {/* ---------- Perguntas ---------- */}
                <div className="bg-superficie p-5 sm:p-6 rounded-lg border border-borda border-t-[3px] border-t-brand space-y-6">

                    <Bloco numero={1} titulo="O pedido" colunas="sm:grid-cols-2">
                        <Campo rotulo="Modalidade" dica={MODALIDADES.find(m => m.valor === config.modalidade)?.resumo}>
                            <Selecao
                                valor={config.modalidade}
                                aoMudar={v => mexer({ modalidade: v })}
                                opcoes={MODALIDADES.map(m => m.valor)}
                            />
                        </Campo>
                        <Campo rotulo="Quantidade de livros">
                            <CampoNumerico valor={config.quantidade} aoMudar={v => mexer({ quantidade: v })} className={classeCampo} />
                        </Campo>
                    </Bloco>

                    {/* O miolo só existe quando a Berlim imprime o livro. Na
                        modalidade "Somente Hot Melt" esses campos não entram em
                        conta nenhuma, e mostrá-los sugeriria que entram. */}
                    {completo && (
                        <Bloco numero={2} titulo="O livro" colunas="sm:grid-cols-4">
                            {/* O papel vem primeiro porque ele decide o resto: é ele que
                                define o preço da face e se ainda existe divisão entre
                                preto e branco e colorido. */}
                            <Campo rotulo="Papel do miolo" dica={r.papel.temPB ? undefined : 'só colorido'}>
                                <Selecao valor={config.papelMiolo} aoMudar={trocarPapel} opcoes={PAPEIS_MIOLO.map(p => p.nome)} />
                            </Campo>
                            <Campo rotulo="Formato fechado">
                                <Selecao valor={config.formato} aoMudar={v => mexer({ formato: v, paginasPorFaceA4: '' })} opcoes={FORMATOS} />
                            </Campo>
                            {r.papel.temPB ? (
                                <>
                                    <Campo rotulo="Páginas P&B">
                                        <CampoNumerico valor={config.paginasPB} aoMudar={v => mexer({ paginasPB: v })} className={classeCampo} />
                                    </Campo>
                                    <Campo rotulo="Páginas coloridas">
                                        <CampoNumerico valor={config.paginasColoridas} aoMudar={v => mexer({ paginasColoridas: v })} className={classeCampo} />
                                    </Campo>
                                </>
                            ) : (
                                <Campo rotulo="Páginas do livro" dica={`${dinheiro(r.precoFaceColor || premissas.outrosPapeis[config.papelMiolo] || 0)} por face`}>
                                    <CampoNumerico valor={config.paginasColoridas} aoMudar={v => mexer({ paginasColoridas: v })} className={classeCampo} />
                                </Campo>
                            )}
                        </Bloco>
                    )}

                    <Bloco numero={completo ? 3 : 2} titulo="Acabamento e prazo" colunas="sm:grid-cols-4">
                        {completo && (
                            <Campo rotulo="Laminação da capa">
                                <Selecao valor={config.laminacao} aoMudar={v => mexer({ laminacao: v })} opcoes={LAMINACOES} />
                            </Campo>
                        )}
                        <Campo rotulo="Prazo">
                            <Selecao
                                valor={config.prazo}
                                aoMudar={v => mexer({ prazo: v })}
                                opcoes={PRAZOS.map(p => {
                                    const acrescimo = (premissas.prazos[p] - 1) * 100;
                                    return { value: p, label: acrescimo > 0 ? `${p} (+${acrescimo.toFixed(1).replace('.', ',')}%)` : p };
                                })}
                            />
                        </Campo>
                        {completo && (
                            <Campo rotulo="Prova física" dica={`R$ ${formatarValorFinanceiro(premissas.parametros.provaFisica)}`}>
                                <Selecao
                                    valor={config.provaFisica ? 'Sim' : 'Não'}
                                    aoMudar={v => mexer({ provaFisica: v === 'Sim' })}
                                    opcoes={['Não', 'Sim']}
                                />
                            </Campo>
                        )}
                        <Campo rotulo="Perda de produção">
                            <div className="relative">
                                <CampoNumerico pct valor={config.perda} aoMudar={v => mexer({ perda: v })} className={`${classeCampo} pr-7`} />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mini text-tinta-suave pointer-events-none">%</span>
                            </div>
                        </Campo>
                    </Bloco>
            </div>

            {/* ---------- Impedimentos ---------- */}
            {r.erros.length > 0 && (
                <div className="rounded-lg border-2 border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 space-y-1">
                    {r.erros.map(e => (
                        <p key={e} className="flex items-center gap-2 text-corpo font-semibold text-perigo">
                            <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
                            {e}
                        </p>
                    ))}
                </div>
            )}

            {/* Ressalvas não impedem o orçamento — são coisas que quem atende
                precisa confirmar com o cliente antes de fechar. Por isso âmbar
                e não vermelho, e por isso o preço continua na tela. */}
            {r.avisos.length > 0 && (
                <div className="rounded-lg border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 space-y-1">
                    {r.avisos.map(a => (
                        <p key={a} className="flex items-start gap-2 text-corpo text-tinta-corpo">
                            <Icon name="alert-triangle" className="w-4 h-4 shrink-0 mt-0.5 text-aviso" />
                            {a}
                        </p>
                    ))}
                </div>
            )}

            {/* ---------- Preço ---------- */}
            <div className="rounded-lg border-2 border-brand/60 bg-brand/[0.07] overflow-hidden">
                <div className="p-5 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="text-mini font-bold uppercase tracking-widest text-tinta-corpo">Total do pedido</p>
                        <p className="text-4xl font-black text-brand leading-none mt-1">{dinheiro(r.total)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-tinta leading-none tabular-nums">{dinheiro(r.porLivro)}</p>
                        <p className="text-mini text-tinta-corpo mt-1">por livro</p>
                    </div>
                </div>

                {/* A conta inteira numa linha, como na de bloquinhos. A prova
                    física aparece somada FORA do multiplicador porque é assim
                    que ela é cobrada: produzir o exemplar de aprovação não fica
                    mais caro porque o resto do lote é urgente. */}
                <div className="border-t border-brand/25 px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-corpo">
                    <span className="text-tinta-corpo">Produção</span>
                    <span className="font-bold text-tinta tabular-nums">{dinheiro(r.subtotal)}</span>
                    <span className="text-tinta-suave">×</span>
                    <span className={`font-bold tabular-nums ${r.multiplicador > 1 ? 'text-aviso' : 'text-tinta'}`}>
                        {r.multiplicador.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-mini text-tinta-suave">({config.prazo})</span>
                    {r.prova > 0 && (
                        <>
                            <span className="text-tinta-suave">+</span>
                            <span className="font-bold text-tinta tabular-nums">{dinheiro(r.prova)}</span>
                            <span className="text-mini text-tinta-suave">(prova)</span>
                        </>
                    )}
                    <span className="text-tinta-suave">=</span>
                    <span className="font-black text-brand tabular-nums">{dinheiro(r.total)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ---------- Composição ---------- */}
                <div className="rounded-lg border border-borda bg-superficie p-5">
                    <h3 className="text-corpo font-bold text-tinta">Do que é feito o preço</h3>
                    <p className="text-mini text-tinta-suave mt-0.5 mb-3">
                        A barra mostra o peso de cada parte — é o que muda quando você ajusta a tabela.
                    </p>
                    <div className="space-y-2">
                        {linhasDoPreco.map(([rotulo, valor]) => (
                            <div key={rotulo}>
                                <div className="flex items-baseline justify-between gap-3 text-corpo">
                                    <span className="text-tinta-corpo truncate">{rotulo}</span>
                                    <span className="font-semibold text-tinta tabular-nums shrink-0">{dinheiro(valor)}</span>
                                </div>
                                <div className="mt-1 h-1.5 rounded-full bg-realce overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand/70 transition-[width] duration-300"
                                        style={{ width: `${Math.max(2, (valor / maiorParte) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-baseline justify-between gap-3 pt-3 mt-3 border-t border-borda text-corpo">
                        <span className="font-bold text-tinta">Total</span>
                        <span className="font-black text-tinta tabular-nums">{dinheiro(r.total)}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setVerDetalhe(v => !v)}
                        className="mt-3 flex items-center gap-1.5 text-mini font-semibold text-tinta-suave hover:text-brand transition"
                    >
                        <Icon name="chevron-down" className={`w-3.5 h-3.5 transition-transform duration-300 ${verDetalhe ? 'rotate-180' : ''}`} />
                        Detalhes da produção
                    </button>
                    <div className="gaveta" data-aberta={verDetalhe}>
                        <div>
                            <div inert={!verDetalhe} className="pt-2 text-mini text-tinta-corpo space-y-1 tabular-nums">
                                {completo ? (
                                    <>
                                        <p>{r.paginas} páginas · {r.paginasPorFace} por face A4
                                            {r.aproveitamentoForcado && ` (o formato ${config.formato} daria ${r.formatoPadrao})`}</p>
                                        <p>
                                            {r.papel.temPB
                                                ? <>{r.facesPB} faces P&B a {dinheiro(r.precoFacePB)}
                                                    {r.facesColoridas > 0 && ` · ${r.facesColoridas} coloridas a ${dinheiro(r.precoFaceColor)}`}</>
                                                : <>{r.facesTotais} faces a {dinheiro(r.precoFaceColor)} ({config.papelMiolo}, preço único)</>}
                                            {' '}(perda já incluída)
                                        </p>
                                    </>
                                ) : (
                                    <p>Miolo e capa fornecidos pelo cliente — só a encadernação é cobrada.</p>
                                )}
                                <p>
                                    Hot Melt a {dinheiro(r.hotMeltPorLivro)} por livro
                                    {r.hotMeltNoMinimo && ' — abaixo do mínimo de lote, cobrado o mínimo'}
                                </p>
                                {completo && (
                                    <div className="pt-1.5">
                                        {/* Sobrescrever o aproveitamento é exceção: o normal é o
                                            formato acertar. Vive aqui, e não no formulário, pelo
                                            mesmo motivo do "peças por A4" dos bloquinhos. */}
                                        <Campo rotulo="Páginas por face A4" dica={`formato ${config.formato}: ${porFacePadrao}`}>
                                            <CampoNumerico
                                                valor={config.paginasPorFaceA4}
                                                aoMudar={v => mexer({ paginasPorFaceA4: v })}
                                                placeholder={String(porFacePadrao)}
                                                className={`w-28 bg-elevado border rounded px-2.5 py-1.5 text-corpo text-tinta outline-none focus:border-brand transition ${r.aproveitamentoForcado ? 'border-brand' : 'border-borda-forte'}`}
                                            />
                                        </Campo>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------- Faixas de quantidade ---------- */}
                <div className="rounded-lg border border-borda bg-superficie p-5">
                    <h3 className="text-corpo font-bold text-tinta">Se levar mais</h3>
                    <p className="text-mini text-tinta-suave mt-0.5 mb-3">
                        O mesmo livro em outras quantidades. Clique para adotar.
                    </p>
                    <div className="space-y-1">
                        {faixas.map(f => {
                            const atual = Math.floor(Number(config.quantidade)) === f.quantidade;
                            return (
                                <button
                                    key={f.quantidade}
                                    type="button"
                                    onClick={() => mexer({ quantidade: f.quantidade })}
                                    className={`w-full flex items-baseline gap-3 rounded-md px-3 py-2 text-corpo text-left transition border
                                        ${atual ? 'border-brand bg-brand/[0.07]' : 'border-transparent hover:bg-realce'}`}
                                >
                                    <span className={`w-12 shrink-0 tabular-nums font-bold ${atual ? 'text-brand' : 'text-tinta'}`}>{f.quantidade}</span>
                                    <span className="flex-1 tabular-nums font-semibold text-tinta">{f.ok ? dinheiro(f.total) : '—'}</span>
                                    <span className="shrink-0 tabular-nums text-tinta-corpo">{f.ok ? `${dinheiro(f.porLivro)}/livro` : ''}</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-3 pt-3 border-t border-borda-fraca text-mini text-tinta-suave leading-snug">
                        {r.observacao}
                    </p>
                </div>
            </div>

            {/* ---------- Texto para o cliente ---------- */}
            <div className="rounded-lg border border-borda bg-superficie p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-corpo font-bold text-tinta">Texto pronto para o WhatsApp</h3>
                    <Tooltip label="Copiar texto">
                        <button type="button" onClick={() => navigator.clipboard.writeText(texto)} aria-label="Copiar texto"
                            className="w-8 h-8 flex items-center justify-center shrink-0 bg-elevado border border-borda-forte rounded hover:text-brand hover:border-brand transition">
                            <Icon name="copy" className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
                <pre className="text-mini text-tinta-corpo whitespace-pre-wrap font-sans leading-relaxed">{texto}</pre>
            </div>

            </div>

            {/* A coluna de ajustes acompanha a rolagem: mexer numa premissa e
                olhar o preço mudar são o mesmo gesto, e antes exigiam rolar a
                página inteira de um lado ao outro. Abaixo de xl ela volta a
                empilhar no fim, que é o único lugar onde cabe. */}
            <aside className="min-w-0 xl:sticky xl:top-[calc(var(--altura-cabecalho)+1rem)]">
                <PremissasHotmelt
                    ajustes={ajustes}
                    aoMudar={guardarAjustes}
                    aoRestaurar={restaurarAjustes}
                    quantosMudados={quantosMudados}
                />
            </aside>
        </div>
    );
}
