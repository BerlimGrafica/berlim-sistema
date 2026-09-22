"use client";
import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { CustomSelect } from '@/components/ui/Dropdown';
import { formatarValorFinanceiro } from '@/lib/utils/formatters';
import { PremissasBloquinho } from '@/components/calculadoras/PremissasBloquinho';
import { CampoNumerico } from '@/components/calculadoras/CampoNumerico';
import {
    PAPEIS_MIOLO, IMPRESSOES_MIOLO, ENCADERNACOES, CAPAS, EMBALAGENS, ARTES,
    CONFIG_PADRAO, PREMISSAS_PADRAO,
    calcularBloquinho, calcularFaixas, textoWhatsapp, mesclarPremissas, pecasPorA4,
} from '@/lib/calculadoras/bloquinhos';

// A conta inteira vive em lib/calculadoras/bloquinhos.js — aqui é só a tela.
//
// O desenho segue a ordem em que a pergunta é feita no balcão: o que o cliente
// quer, com que material, como acaba — e só então quanto custa e quanto sai.
// A versão anterior jogava os doze campos numa grade lisa de três colunas, sem
// dizer onde uma decisão terminava e a outra começava, e mostrava dois preços
// concorrentes com um "método" ao lado explicando qual tinha vencido. Ninguém
// deveria precisar entender a política de preços da casa para orçar um
// bloquinho.
//
// Agora o preço tem uma linha só: custo + margem. E ela aparece escrita assim,
// como uma conta, com a margem editável no meio — é a única decisão comercial
// que existe, e vale mais na cara do resultado do que enterrada num painel.

const CHAVE_PREMISSAS = 'calc_bloquinhos_premissas_v2';

const dinheiro = (v) => `R$ ${formatarValorFinanceiro(v)}`;
const pct = (v, casas = 1) => `${(v * 100).toFixed(casas).replace('.', ',')}%`;
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

// Cada bloco de perguntas com um título curto. A numeração não é enfeite: ela
// diz que há uma ordem, e que dá para parar de ler quando a resposta apareceu.
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

export function CalculadoraBloquinho() {
    const [config, setConfig] = useState(CONFIG_PADRAO);
    const [ajustes, setAjustes] = useState({});
    const [verDetalhe, setVerDetalhe] = useState(false);

    // Os ajustes vêm do navegador na primeira pintura, e não no useState: ler
    // localStorage durante a renderização do servidor quebraria a hidratação,
    // porque o servidor não tem como saber o que está guardado aqui.
    useEffect(() => {
        try {
            const guardado = localStorage.getItem(CHAVE_PREMISSAS);
            if (guardado) setAjustes(JSON.parse(guardado));
        } catch {
            // Aba anônima, armazenamento bloqueado: segue com o padrão da planilha.
        }
    }, []);

    const mexer = (campos) => setConfig(c => ({ ...c, ...campos }));

    const guardarAjustes = (novos) => {
        setAjustes(novos);
        try { localStorage.setItem(CHAVE_PREMISSAS, JSON.stringify(novos)); } catch {}
    };
    const restaurarAjustes = () => {
        setAjustes({});
        try { localStorage.removeItem(CHAVE_PREMISSAS); } catch {}
    };

    // A margem mora nas premissas, mas é editada na cara do preço. Esta é a
    // ponte entre as duas coisas.
    const definirMargem = (v) => guardarAjustes({
        ...ajustes,
        precificacao: { ...(ajustes.precificacao || {}), margemSobreCusto: v },
    });

    const r = useMemo(() => calcularBloquinho(config, ajustes), [config, ajustes]);
    const faixas = useMemo(() => calcularFaixas(config, ajustes), [config, ajustes]);
    const texto = useMemo(() => textoWhatsapp(config, r), [config, r]);
    const quantosMudados = useMemo(() => contarMudados(ajustes), [ajustes]);

    const capaDura = config.capa === 'Capa dura Paraná 1,9mm';
    const rendimentoCalculado = pecasPorA4(config.larguraCm, config.alturaCm);
    const margemDigitada = ajustes?.precificacao?.margemSobreCusto ?? PREMISSAS_PADRAO.precificacao.margemSobreCusto;

    const linhasDeCusto = [
        ['Papel do miolo', r.custos.papelMiolo],
        ['Impressão do miolo', r.custos.impressaoMiolo],
        ['Capas', r.custos.capas],
        ['Encadernação / cola', r.custos.encadernacao],
        ['Embalagem', r.custos.embalagem],
        ['Mão de obra', r.custos.maoDeObra],
        ['Perdas e custos indiretos', r.custos.perdasEIndiretos],
        ['Criação de arte', r.custos.arte],
    ].filter(([, valor]) => valor > 0);

    const maiorCusto = Math.max(...linhasDeCusto.map(([, v]) => v), 1);

    return (
        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(320px,370px)] gap-4 items-start">
            <div className="space-y-4 min-w-0">

                {/* ---------- Perguntas ---------- */}
                <div className="bg-superficie p-5 sm:p-6 rounded-lg border border-borda border-t-[3px] border-t-brand space-y-6">

                    <Bloco numero={1} titulo="O pedido" colunas="sm:grid-cols-4">
                        <Campo rotulo="Quantidade" dica="mín. 10">
                            <CampoNumerico valor={config.quantidade} aoMudar={v => mexer({ quantidade: v })} className={classeCampo} />
                        </Campo>
                        <Campo rotulo="Largura (cm)">
                            <CampoNumerico valor={config.larguraCm} aoMudar={v => mexer({ larguraCm: v })} className={classeCampo} />
                        </Campo>
                        <Campo rotulo="Altura (cm)">
                            <CampoNumerico valor={config.alturaCm} aoMudar={v => mexer({ alturaCm: v })} className={classeCampo} />
                        </Campo>
                        <Campo rotulo="Folhas por bloquinho">
                            <CampoNumerico valor={config.folhas} aoMudar={v => mexer({ folhas: v })} className={classeCampo} />
                        </Campo>
                    </Bloco>

                    <Bloco numero={2} titulo="Miolo e capa" colunas="sm:grid-cols-2">
                        <Campo rotulo="Papel do miolo">
                            <Selecao valor={config.papelMiolo} aoMudar={v => mexer({ papelMiolo: v })} opcoes={PAPEIS_MIOLO.map(p => p.nome)} />
                        </Campo>
                        <Campo rotulo="Impressão do miolo">
                            <Selecao valor={config.impressaoMiolo} aoMudar={v => mexer({ impressaoMiolo: v })} opcoes={IMPRESSOES_MIOLO.map(i => i.nome)} />
                        </Campo>
                        <Campo rotulo="Capa e contracapa">
                            <Selecao valor={config.capa} aoMudar={v => mexer({ capa: v })} opcoes={CAPAS.map(c => c.nome)} />
                        </Campo>
                        <Campo rotulo="Encadernação" dica={r.ok ? r.encadernacaoSugerida : undefined}>
                            <Selecao valor={config.encadernacao} aoMudar={v => mexer({ encadernacao: v })} opcoes={ENCADERNACOES} />
                        </Campo>
                    </Bloco>

                    <Bloco numero={3} titulo="Acabamento e produção">
                        <Campo rotulo="Embalagem">
                            <Selecao valor={config.embalagem} aoMudar={v => mexer({ embalagem: v })} opcoes={EMBALAGENS} />
                        </Campo>
                        <Campo rotulo="Arte">
                            <Selecao valor={config.arte} aoMudar={v => mexer({ arte: v })} opcoes={ARTES} />
                        </Campo>
                        <Campo rotulo="Perda de produção">
                            <div className="relative">
                                <CampoNumerico pct valor={config.perda} aoMudar={v => mexer({ perda: v })} className={`${classeCampo} pr-7`} />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mini text-tinta-suave pointer-events-none">%</span>
                            </div>
                        </Campo>
                    </Bloco>
            </div>

            {/* ---------- Impedimentos ---------- */}
            {!r.ok && (
                <div className="rounded-lg border-2 border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-3 space-y-1">
                    {r.erros.map(e => (
                        <p key={e} className="flex items-center gap-2 text-corpo font-semibold text-perigo">
                            <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
                            {e}
                        </p>
                    ))}
                </div>
            )}

            {/* ---------- Preço ---------- */}
            <div className="rounded-lg border-2 border-brand/60 bg-brand/[0.07] overflow-hidden">
                <div className="p-5 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="text-mini font-bold uppercase tracking-widest text-tinta-corpo">Preço sugerido</p>
                        <p className="text-4xl font-black text-brand leading-none mt-1">{dinheiro(r.precoSugerido)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-tinta leading-none tabular-nums">{dinheiro(r.precoUnitario)}</p>
                        <p className="text-mini text-tinta-corpo mt-1">por bloquinho</p>
                    </div>
                </div>

                {/* A conta inteira numa linha. Antes havia dois preços
                    concorrendo e um rótulo de "método" dizendo qual tinha
                    ganhado; agora só existe este caminho, e ele cabe numa
                    frase — com a margem editável no meio dela. */}
                <div className="border-t border-brand/25 px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-corpo">
                    <span className="text-tinta-corpo">Custo</span>
                    <span className="font-bold text-tinta tabular-nums">{dinheiro(r.custoTotal)}</span>
                    <span className="text-tinta-suave">+ margem de</span>
                    <span className="relative w-24">
                        <CampoNumerico
                            pct valor={margemDigitada} aoMudar={definirMargem} ariaLabel="Margem sobre o custo"
                            className="w-full bg-elevado border-2 border-brand/50 rounded px-2 py-1 pr-6 text-corpo font-bold text-tinta text-right outline-none focus:border-brand transition"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-mini text-tinta-suave pointer-events-none">%</span>
                    </span>
                    <span className="text-tinta-suave">=</span>
                    <span className="font-black text-brand tabular-nums">{dinheiro(r.precoSugerido)}</span>
                    <span className="ml-auto text-mini text-tinta-corpo">
                        lucro <strong className="font-bold text-tinta">{dinheiro(r.lucroBruto)}</strong>
                        {' · '}{pct(r.margemBruta)} do preço
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ---------- Composição do custo ---------- */}
                <div className="rounded-lg border border-borda bg-superficie p-5">
                    <h3 className="text-corpo font-bold text-tinta">Para onde vai o custo</h3>
                    <p className="text-mini text-tinta-suave mt-0.5 mb-3">
                        A barra mostra o peso de cada parte — é o que muda quando você ajusta uma premissa.
                    </p>
                    <div className="space-y-2">
                        {linhasDeCusto.map(([rotulo, valor]) => (
                            <div key={rotulo}>
                                <div className="flex items-baseline justify-between gap-3 text-corpo">
                                    <span className="text-tinta-corpo truncate">{rotulo}</span>
                                    <span className="font-semibold text-tinta tabular-nums shrink-0">{dinheiro(valor)}</span>
                                </div>
                                <div className="mt-1 h-1.5 rounded-full bg-realce overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand/70 transition-[width] duration-300"
                                        style={{ width: `${Math.max(2, (valor / maiorCusto) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-baseline justify-between gap-3 pt-3 mt-3 border-t border-borda text-corpo">
                        <span className="font-bold text-tinta">Custo total</span>
                        <span className="font-black text-tinta tabular-nums">{dinheiro(r.custoTotal)}</span>
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
                                <p>{r.formato.nome} · {r.formato.rendimentoA4} peças por A4
                                    {r.formato.rendimentoForcado && ` (o cálculo daria ${r.formato.rendimentoCalculado})`}</p>
                                <p>{r.a4Miolo} folhas A4 no miolo
                                    {capaDura ? ` · ${r.a4AdesivoCapaDura} A4 de adesivo` : ` · ${r.a4CapaFlexivel} A4 de capa`}</p>
                                <p>{Math.round(r.minutos)} minutos de produção
                                    {config.embalagem === 'Embalado coletivamente' && ` · ${r.pacotes} pacotes`}</p>
                                {/* O rendimento é calculado das medidas, mas continua
                                    editável: sangria, sentido da fibra e pinça da
                                    impressora mudam o que de fato cabe na folha. Vive
                                    aqui, e não no formulário, porque é exceção — o
                                    normal é o cálculo acertar. */}
                                <div className="pt-1.5">
                                    <Campo rotulo="Peças por A4" dica={`cálculo: ${rendimentoCalculado}`}>
                                        <CampoNumerico
                                            valor={config.rendimentoA4}
                                            aoMudar={v => mexer({ rendimentoA4: v })}
                                            placeholder={String(rendimentoCalculado)}
                                            className={`w-28 bg-elevado border rounded px-2.5 py-1.5 text-corpo text-tinta outline-none focus:border-brand transition ${r.formato.rendimentoForcado ? 'border-brand' : 'border-borda-forte'}`}
                                        />
                                    </Campo>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------- Faixas de quantidade ---------- */}
                <div className="rounded-lg border border-borda bg-superficie p-5">
                    <h3 className="text-corpo font-bold text-tinta">Se levar mais</h3>
                    <p className="text-mini text-tinta-suave mt-0.5 mb-3">
                        A mesma configuração em outras quantidades. Clique para adotar.
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
                                    <span className="shrink-0 tabular-nums text-tinta-corpo">{f.ok ? `${dinheiro(f.unitario)}/un` : ''}</span>
                                </button>
                            );
                        })}
                    </div>
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
                <PremissasBloquinho
                    ajustes={ajustes}
                    aoMudar={guardarAjustes}
                    aoRestaurar={restaurarAjustes}
                    quantosMudados={quantosMudados}
                />
            </aside>
        </div>
    );
}
