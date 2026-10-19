"use client";
import { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import { useModal } from '@/components/modals/useModal';
import {
    TINTAS, IDS_TINTAS, TINTAS_MONO, FAMILIAS_EQUIPAMENTO, TIPOS_EQUIPAMENTO, tipoPorId, fundoDaTinta,
} from '@/lib/equipamentos/catalogo';

// Cadastro e edição de uma máquina. Cadastrar é só do administrador; editar
// (e arquivar) é de toda a equipe que vê a tela.
//
// Duas colunas no computador: à esquerda o que identifica a máquina (nome,
// modelo, tipo, impressão), à direita o que ela consome (as tintas) e a prévia
// do card. Assim tudo cabe numa tela, sem rolagem escondida. No celular as
// duas colunas viram uma, na mesma ordem, e o formulário ocupa a tela inteira.
//
// As tintas são cartuchos: vazios, com só um fundo da cor; marcados, cheios.
// É a única ornamentação do formulário, e ela carrega dado — a cor de processo
// verdadeira da tinta que vai no frasco.
//
// A prévia responde à pergunta que o cadastro deixa no ar: como a máquina vai
// aparecer na tela, e em qual grupo. O grupo vem do tipo, e é ali que um
// "jato de tinta" sem pigmentada/corante se denuncia antes de salvar.
//
// Mesmo arranjo do modal de nova entrada: sempre montado, entregue por portal
// (o layout deixa a página `inert` com modal aberto) e com o guarda de
// alterações do useModal no X.

const CMYK = ['preto', 'amarelo', 'ciano', 'magenta'];

// Um rótulo de seção do formulário. Não é um "eyebrow" sobre um título: é o
// próprio rótulo do grupo de campos.
function Rotulo({ children, id, htmlFor, extra }) {
    const Tag = htmlFor ? 'label' : 'p';
    return (
        <div className="flex items-baseline justify-between gap-3 mb-2">
            <Tag id={id} htmlFor={htmlFor} className="text-corpo font-semibold text-tinta">{children}</Tag>
            {extra}
        </div>
    );
}

// Escolha única em pílulas, como os filtros do histórico na mesma tela.
// Botões com aria-pressed num grupo rotulado, e não role="radio" — o mesmo
// raciocínio do seletor de tipo do modal de nova entrada.
function Pilulas({ opcoes, valor, aoMudar, rotuladoPor }) {
    return (
        <div role="group" aria-labelledby={rotuladoPor} className="flex flex-wrap gap-2">
            {opcoes.map(o => {
                const ativo = valor === o.id;
                return (
                    <button
                        key={o.id}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => aoMudar(o.id)}
                        className={`h-10 px-4 rounded-full border text-corpo font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                            ativo ? 'bg-tinta text-fundo border-tinta' : 'bg-superficie text-tinta-suave border-borda hover:text-tinta hover:border-borda-forte'
                        }`}
                    >
                        {o.rotulo}
                    </button>
                );
            })}
        </div>
    );
}

// Amostras pequenas de tinta, alinhadas — usadas na escolha de impressão e na
// prévia do card.
function Amostras({ ids, tamanho = 'w-3 h-3' }) {
    return (
        <span className="flex items-center -space-x-1" aria-hidden="true">
            {ids.map(id => (
                // O anel na cor da superfície separa as amostras sobrepostas; o
                // contorno interno é o que deixa o preto visível no tema escuro.
                <span key={id} className={`${tamanho} rounded-full ring-2 ring-superficie shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]`} style={{ background: fundoDaTinta(id) }} />
            ))}
        </span>
    );
}

function Cartucho({ id, marcada, travada, aoAlternar }) {
    const tinta = TINTAS[id];
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={marcada}
            aria-disabled={travada || undefined}
            onClick={travada ? undefined : () => aoAlternar(id)}
            className={`group flex flex-col items-center gap-1.5 rounded-xl px-1 pt-2 pb-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                travada ? 'cursor-default' : 'hover:bg-realce'
            }`}
        >
            {/* O corpo do cartucho. Vazio, guarda um fundo de tinta para a cor
                ainda ser reconhecida; marcado, enche até o topo. A borda
                acompanha: tracejada vazio, cheia quando escolhido. */}
            <span
                className={`relative w-9 h-12 rounded-[10px] overflow-hidden border transition-colors duration-200 ${
                    marcada ? 'border-black/20 dark:border-white/30' : 'border-dashed border-borda-forte bg-sutil'
                }`}
            >
                <span
                    // O fio claro no topo do nível é o que mostra o preto no tema escuro.
                    className="absolute inset-x-0 bottom-0 transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
                    style={{ background: fundoDaTinta(id), height: marcada ? '100%' : '22%' }}
                />
                {marcada && (
                    <span className="absolute inset-0 grid place-items-center">
                        <span className="w-5 h-5 rounded-full bg-white/90 dark:bg-black/60 grid place-items-center shadow-sm">
                            <Icon name="check" className="w-3.5 h-3.5 text-tinta" />
                        </span>
                    </span>
                )}
            </span>
            <span className={`text-micro font-bold leading-none ${marcada ? 'text-tinta' : 'text-tinta-suave'}`}>{tinta.sigla}</span>
            <span className={`text-micro leading-tight text-center min-h-[2lh] ${marcada ? 'text-tinta-corpo' : 'text-tinta-suave'}`}>{tinta.rotulo}</span>
        </button>
    );
}

function Previa({ nome, modelo, tipo, cromia, tintas }) {
    const grupo = tipo ? tipoPorId(tipo).rotulo : null;
    const detalhe = [modelo.trim(), cromia === 'mono' && 'Monocromática'].filter(Boolean).join(' · ');
    return (
        <div aria-hidden="true">
            <p className="text-mini font-semibold text-tinta-suave mb-2">
                {grupo ? <>Aparece no grupo <span className="text-tinta">{grupo}</span></> : 'Prévia do card'}
            </p>
            <div className="rounded-xl border border-borda bg-superficie p-4 flex flex-col gap-4">
                <span className="min-w-0">
                    <span className={`block font-bold text-base leading-snug break-words ${nome.trim() ? 'text-tinta' : 'text-tinta-fraca'}`}>
                        {nome.trim() || 'Nome da máquina'}
                    </span>
                    {detalhe && <span className="block text-mini text-tinta-suave leading-snug">{detalhe}</span>}
                </span>
                {tintas.length ? (
                    <span className="grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] gap-x-1 gap-y-2.5">
                        {tintas.map(id => (
                            <span key={id} className="min-w-0 flex flex-col items-center gap-1">
                                <span className="h-2 w-full rounded-full ring-1 ring-inset ring-black/15 dark:ring-white/25" style={{ background: fundoDaTinta(id) }} />
                                <span className="text-micro font-semibold leading-none text-tinta-suave">{TINTAS[id].sigla}</span>
                            </span>
                        ))}
                    </span>
                ) : (
                    <span className="h-2 rounded-full border border-dashed border-borda-forte" />
                )}
            </div>
        </div>
    );
}

function Formulario({ equipamento, nomesEmUso, aoSalvar, aoArquivar, aoFechar, fecharComGuarda }) {
    const editando = !!equipamento;
    const tipoInicial = equipamento ? tipoPorId(equipamento.tipo) : null;
    const [nome, setNome] = useState(equipamento?.nome ?? '');
    const [modelo, setModelo] = useState(equipamento?.modelo ?? '');
    const [familia, setFamilia] = useState(tipoInicial?.familia ?? null);
    const [variante, setVariante] = useState(tipoInicial?.familia === 'jato' ? tipoInicial.id : null);
    const [cromia, setCromia] = useState(equipamento?.cromia ?? 'cor');
    const [cores, setCores] = useState(() => new Set(equipamento?.cromia === 'cor' ? equipamento.cores : []));
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null);
    const [temMaisAbaixo, setTemMaisAbaixo] = useState(false);
    const observador = useRef(null);

    const tipo = familia === 'jato' ? variante : familia;
    const nomeRepetido = !!nome.trim() && nomesEmUso.has(nome.trim().toLowerCase());
    const tintasEscolhidas = cromia === 'mono' ? TINTAS_MONO : IDS_TINTAS.filter(id => cores.has(id));

    const falta = !nome.trim() ? 'Dê um nome à máquina.'
        : nomeRepetido ? 'Já existe outra máquina em uso com esse nome.'
        : !familia ? 'Escolha o tipo da máquina.'
        : !tipo ? 'Jato de tinta: pigmentada ou corante?'
        : cromia === 'cor' && cores.size === 0 ? 'Escolha ao menos uma tinta.'
        : null;

    // Uma marca invisível no fim do conteúdo. Enquanto ela está fora da área
    // visível, o rodapé ganha uma sombra: é o sinal de que há mais campos
    // abaixo, que uma barra de rolagem fina sozinha não dava.
    const marcaDoFim = useCallback((el) => {
        observador.current?.disconnect();
        if (!el) return;
        observador.current = new IntersectionObserver(([e]) => setTemMaisAbaixo(!e.isIntersecting), { root: el.parentElement, threshold: 1 });
        observador.current.observe(el);
    }, []);

    const alternarCor = (id) => setCores(atual => {
        const novo = new Set(atual);
        if (novo.has(id)) novo.delete(id);
        else novo.add(id);
        return novo;
    });

    async function salvar(e) {
        e.preventDefault();
        if (falta || salvando) return;
        setSalvando(true);
        setErro(null);
        const resultado = await aoSalvar({
            nome: nome.trim(),
            modelo: modelo.trim() || null,
            tipo,
            cromia,
            // Na ordem do catálogo, não na dos toques.
            cores: tintasEscolhidas,
        });
        setSalvando(false);
        if (resultado?.erro) {
            setErro(resultado.erro);
            return;
        }
        aoFechar();
    }

    const campo = 'h-12 w-full rounded-xl border bg-elevado px-4 text-base text-tinta outline-none transition-colors placeholder:font-normal placeholder:text-tinta-suave';

    return (
        <form onSubmit={salvar} className="flex flex-col min-h-0 flex-1">
            <div className="px-4 sm:px-6 py-3.5 flex items-center gap-3 bg-brand text-white shrink-0">
                <span className="w-11 h-11 shrink-0 rounded-lg bg-white/15 grid place-items-center">
                    <Icon name="printer" className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 id="maquina-modal-titulo" className="font-bold text-base tracking-tight truncate">
                        {editando ? 'Editar máquina' : 'Nova máquina'}
                    </h2>
                    <p className="text-mini text-amber-50 truncate">
                        {editando ? equipamento.nome : 'Entra no grupo do tipo dela.'}
                    </p>
                </div>
                <button type="button" onClick={fecharComGuarda} aria-label="Fechar" className="w-11 h-11 -mr-2 grid place-items-center rounded-lg text-amber-50 hover:text-white hover:bg-white/10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white">
                    <Icon name="x" className="w-5 h-5" />
                </button>
            </div>

            {/* A única área que rola. Barra fina mas visível, na cor da borda
                forte — a barra de 4px quase preta do resto do sistema some no
                tema claro, e o conteúdo cortado parecia o fim do formulário. */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:var(--borda-forte)_transparent]">
                <div className="px-4 sm:px-6 py-5 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                    <div className="flex flex-col gap-6 min-w-0">
                        <div>
                            <Rotulo htmlFor="maquina-nome">Nome interno</Rotulo>
                            <input
                                id="maquina-nome"
                                type="text"
                                autoComplete="off"
                                autoFocus={!editando}
                                maxLength={40}
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                placeholder="Como a equipe chama a máquina"
                                aria-invalid={nomeRepetido || undefined}
                                aria-describedby={nomeRepetido ? 'maquina-nome-erro' : 'maquina-nome-dica'}
                                className={`${campo} font-semibold ${nomeRepetido ? 'border-perigo focus:border-perigo' : 'border-borda-forte focus:border-brand'}`}
                            />
                            {nomeRepetido
                                ? <p id="maquina-nome-erro" className="mt-1.5 text-mini font-semibold text-perigo">Já existe outra máquina em uso com esse nome.</p>
                                : <p id="maquina-nome-dica" className="mt-1.5 text-mini text-tinta-suave">É o que distingue duas máquinas iguais, como “Workforce - 02”.</p>}
                        </div>

                        <div>
                            <Rotulo htmlFor="maquina-modelo" extra={<span className="text-mini text-tinta-suave">opcional</span>}>Modelo</Rotulo>
                            <input
                                id="maquina-modelo"
                                type="text"
                                autoComplete="off"
                                maxLength={60}
                                value={modelo}
                                onChange={e => setModelo(e.target.value)}
                                placeholder="Ex.: WorkForce Pro WF-C5790"
                                className={`${campo} border-borda-forte focus:border-brand`}
                            />
                        </div>

                        <div>
                            <Rotulo id="maquina-tipo">Tipo</Rotulo>
                            <Pilulas
                                opcoes={FAMILIAS_EQUIPAMENTO}
                                valor={familia}
                                aoMudar={(f) => { setFamilia(f); if (f !== 'jato') setVariante(null); }}
                                rotuladoPor="maquina-tipo"
                            />
                            {/* A variante nasce ligada à família por um fio, para
                                ler como continuação de "Jato de tinta" e não como
                                uma terceira pergunta solta. */}
                            {familia === 'jato' && (
                                <div className="mt-3 ml-4 pl-4 border-l-2 border-borda">
                                    <p id="maquina-variante" className="text-mini font-semibold text-tinta-suave mb-2">Qual tinta?</p>
                                    <Pilulas
                                        opcoes={TIPOS_EQUIPAMENTO.filter(t => t.familia === 'jato').map(t => ({ id: t.id, rotulo: t.variante }))}
                                        valor={variante}
                                        aoMudar={setVariante}
                                        rotuladoPor="maquina-variante"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <Rotulo id="maquina-impressao">Impressão</Rotulo>
                            <div role="group" aria-labelledby="maquina-impressao" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-realce">
                                {[
                                    { id: 'cor', rotulo: 'Colorida', amostra: CMYK },
                                    { id: 'mono', rotulo: 'Monocromática', amostra: TINTAS_MONO },
                                ].map(o => {
                                    const ativo = cromia === o.id;
                                    return (
                                        <button
                                            key={o.id}
                                            type="button"
                                            aria-pressed={ativo}
                                            onClick={() => setCromia(o.id)}
                                            className={`min-h-12 px-3 rounded-lg flex items-center justify-center gap-2.5 text-corpo font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand ${
                                                ativo ? 'bg-superficie text-tinta shadow-sm' : 'text-tinta-suave hover:text-tinta'
                                            }`}
                                        >
                                            <Amostras ids={o.amostra} />
                                            {o.rotulo}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 min-w-0">
                        <fieldset>
                            <div className="flex items-baseline justify-between gap-3 mb-2">
                                <legend className="text-corpo font-semibold text-tinta">
                                    Tintas
                                    <span className="ml-2 text-mini font-semibold text-tinta-suave tabular-nums">
                                        {tintasEscolhidas.length} {tintasEscolhidas.length === 1 ? 'escolhida' : 'escolhidas'}
                                    </span>
                                </legend>
                                {cromia === 'cor' && (
                                    <span className="flex items-center gap-1">
                                        <button type="button" onClick={() => setCores(new Set(CMYK))} className="h-8 px-2.5 rounded-md text-mini font-semibold text-tinta-suave hover:text-tinta hover:bg-realce transition-colors focus-visible:outline-2 focus-visible:outline-brand">
                                            Só CMYK
                                        </button>
                                        <button type="button" onClick={() => setCores(new Set())} disabled={cores.size === 0} className="h-8 px-2.5 rounded-md text-mini font-semibold text-tinta-suave hover:text-tinta hover:bg-realce transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-brand">
                                            Limpar
                                        </button>
                                    </span>
                                )}
                            </div>
                            <div className="rounded-xl border border-borda bg-superficie p-2">
                                {cromia === 'mono' ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-[4.5rem] shrink-0"><Cartucho id="preto" marcada travada /></div>
                                        <p className="text-mini text-tinta-suave pr-2">Monocromática recebe só o preto. Para escolher outras tintas, marque <span className="font-semibold text-tinta">Colorida</span>.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))]">
                                        {IDS_TINTAS.map(id => (
                                            <Cartucho key={id} id={id} marcada={cores.has(id)} aoAlternar={alternarCor} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </fieldset>

                        <Previa nome={nome} modelo={modelo} tipo={tipo} cromia={cromia} tintas={tintasEscolhidas} />

                        {erro && (
                            <p role="alert" className="text-mini font-semibold text-perigo">Não foi possível salvar: {erro}</p>
                        )}
                    </div>
                </div>
                <div ref={marcaDoFim} className="h-px" aria-hidden="true" />
            </div>

            <div
                className={`relative px-4 sm:px-6 py-3 border-t border-borda bg-superficie shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 transition-shadow duration-200 ${
                    temMaisAbaixo ? 'shadow-[0_-8px_16px_-8px_rgb(0_0_0/0.18)]' : ''
                }`}
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
                <p className="flex-1 text-mini font-semibold text-tinta-suave" aria-live="polite">{falta}</p>
                <div className="flex gap-2">
                    {editando && (
                        <button
                            type="button"
                            onClick={() => aoArquivar(equipamento)}
                            className="h-12 px-4 rounded-xl text-corpo font-semibold text-perigo hover:bg-realce transition-colors focus-visible:outline-2 focus-visible:outline-brand mr-auto sm:mr-0"
                        >
                            Arquivar
                        </button>
                    )}
                    <button type="button" onClick={fecharComGuarda} className="h-12 px-5 rounded-xl text-corpo font-semibold text-tinta-suave hover:bg-realce transition-colors focus-visible:outline-2 focus-visible:outline-brand">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!!falta || salvando}
                        className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-brand text-white text-corpo font-bold shadow-sm transition-colors hover:bg-brandHover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        {salvando ? 'Salvando…' : editando ? 'Salvar' : 'Cadastrar máquina'}
                    </button>
                </div>
            </div>
        </form>
    );
}

// `alvo`: null (fechado), { equipamento: null } (nova) ou { equipamento } (editar).
export default function MaquinaModal({ alvo, nomesEmUso, aoSalvar, aoArquivar, aoFechar }) {
    const modal = useModal(!!alvo, aoFechar);

    if (!alvo || typeof document === 'undefined') return null;

    return createPortal(
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print cursor-pointer animate-modal-backdrop">
            {/* Altura em dvh: no celular, 100vh conta a barra de endereço que
                some e aparece, e o rodapé com os botões ficava atrás dela. */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="maquina-modal-titulo"
                className="bg-fundo w-full sm:max-w-2xl lg:max-w-4xl h-dvh sm:h-auto sm:max-h-[calc(100dvh-2rem)] rounded-none sm:rounded-xl shadow-2xl overflow-hidden border border-borda animate-modal-in flex flex-col cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <Formulario
                    key={alvo.equipamento?.id ?? 'nova'}
                    equipamento={alvo.equipamento}
                    nomesEmUso={nomesEmUso(alvo.equipamento?.id)}
                    aoSalvar={(dados) => aoSalvar(alvo.equipamento, dados)}
                    aoArquivar={aoArquivar}
                    aoFechar={aoFechar}
                    fecharComGuarda={modal.fechar}
                />
            </div>
        </div>,
        document.body,
    );
}
