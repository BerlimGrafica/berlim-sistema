"use client";
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import Icon from '@/components/Icon';
import NovaEntradaModal from '@/components/equipamentos/NovaEntradaModal';
import MaquinaModal from '@/components/equipamentos/MaquinaModal';
import { BarraAcoes } from '@/components/ui/BarraAcoes';
import { useEquipamentos } from '@/hooks/useEquipamentos';
import { useRegistrosEquipamentos } from '@/hooks/useRegistrosEquipamentos';
import { obterDataAtual } from '@/lib/utils/formatters';
import { TIPOS_EQUIPAMENTO, tipoPorId, tintasDe, tintaPorId, fundoDaTinta } from '@/lib/equipamentos/catalogo';
import {
    ultimaCargaPorTinta, ultimoRegistroComContador, rendimentoDaCargaAnterior,
    tintasMaisAntigas, diasDesde, idadeCurta, formatarContador,
} from '@/lib/equipamentos/historico';

// Equipamentos: a folha de papel pendurada em cada máquina, trazida para o
// celular.
//
// As máquinas aparecem em grupos pelo tipo (jato de tinta pigmentada, corante,
// laser...), cada uma num card com o nome que a equipe usa e a tira de tintas:
// uma faixa por tinta, na cor de processo verdadeira, com quantos dias faz
// desde a última carga — o que a folha nunca dizia de relance. Tocar no card
// abre o registro daquela máquina.
//
// O administrador cadastra, edita, arquiva e reordena as máquinas — arrastando
// o próprio card, a qualquer momento, sem modo à parte (ver GrupoMaquinas).
//
// O histórico fica abaixo, como uma lista comum — e não como uma folha pautada
// imitando o papel. A folha era o suporte, não o valor.

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const ordenar = (lista) => [...lista].sort((a, b) =>
    a.data === b.data ? b.id - a.id : (a.data < b.data ? 1 : -1));

function TiraDeTintas({ equipamento, ultimaCarga, hoje }) {
    const tintas = tintasDe(equipamento);
    // A tinta há mais tempo sem carga sai em tinta cheia e negrito: é a
    // resposta que a tira existe para dar.
    const maisAntigas = tintasMaisAntigas(ultimaCarga, tintas, hoje);
    return (
        // Colunas de no mínimo 2rem, quantas couberem: quatro tintas dividem a
        // largura do card, onze quebram em duas linhas sem espremer a sigla.
        // auto-fit, e não auto-fill: as colunas que sobram somem, em vez de
        // deixar as tintas encolhidas num canto.
        <div className="grid grid-cols-[repeat(auto-fit,minmax(2rem,1fr))] gap-x-1 gap-y-2.5">
            {tintas.map(id => {
                const tinta = tintaPorId(id);
                const ultima = ultimaCarga[id];
                const dias = ultima ? diasDesde(ultima.data, hoje) : null;
                const destaque = maisAntigas.has(id);
                return (
                    <span key={id} className="min-w-0 flex flex-col items-center gap-1" title={tinta.rotulo}>
                        <span
                            className="h-2 w-full rounded-full ring-1 ring-inset ring-black/15 dark:ring-white/25"
                            style={{ background: fundoDaTinta(id) }}
                            aria-hidden="true"
                        />
                        <span className="text-micro font-semibold leading-none text-tinta-suave" aria-hidden="true">{tinta.sigla}</span>
                        <span className={`text-micro tabular-nums leading-none ${destaque ? 'text-tinta font-bold' : 'text-tinta-suave'}`} aria-hidden="true">
                            {ultima ? idadeCurta(dias) : '—'}
                        </span>
                        <span className="sr-only">
                            {tinta.rotulo}: {ultima ? `última carga ${dias === 0 ? 'hoje' : dias === 1 ? 'ontem' : `há ${dias} dias`}` : 'sem carga registrada'}{destaque ? ', a mais antiga da máquina' : ''}.
                        </span>
                    </span>
                );
            })}
        </div>
    );
}

// O miolo do card — nome, detalhe, tira de tintas e contador. Separado para que
// o card na grade e a cópia que acompanha o ponteiro durante o arrasto sejam
// o mesmo desenho, sem duas versões para manter em dia.
function ConteudoCartao({ equipamento, registros, hoje, comLapis }) {
    const ultimaCarga = ultimaCargaPorTinta(registros, equipamento.id);
    const ultimoContador = ultimoRegistroComContador(registros, equipamento.id);
    const detalhe = [equipamento.modelo, equipamento.cromia === 'mono' && 'Monocromática'].filter(Boolean).join(' · ');
    return (
        <>
            <span className={`min-w-0 ${comLapis ? 'pr-9' : ''}`}>
                <span className="block font-bold text-base text-tinta leading-snug break-words">{equipamento.nome}</span>
                {detalhe && <span className="block text-mini text-tinta-suave leading-snug">{detalhe}</span>}
            </span>
            <TiraDeTintas equipamento={equipamento} ultimaCarga={ultimaCarga} hoje={hoje} />
            <span className="mt-auto text-micro text-tinta-suave tabular-nums">
                {ultimoContador
                    ? <>Contador <span className="font-semibold text-tinta">{formatarContador(ultimoContador.contador)}</span></>
                    : 'Sem registro ainda'}
            </span>
        </>
    );
}

const CAIXA_CARTAO = 'flex flex-col gap-4 text-left rounded-xl border bg-superficie p-4';

// O card inteiro é o botão de registrar. Para o administrador ele também se
// arrasta (ver GrupoMaquinas) e ganha o lápis de editar no canto — um botão
// irmão, posicionado por cima, e não aninhado no botão do card, o que o HTML
// não permite.
//
// Durante o arrasto, o card que está na mão vira a vaga tracejada — o mesmo
// elemento, com o conteúdo escondido, e não um elemento novo no lugar dele: no
// toque, os eventos do dedo continuam presos ao elemento em que o toque
// começou, e desmontá-lo devolveria a rolagem ao navegador no meio do arrasto.
function CartaoMaquina({ equipamento, registros, hoje, aoEscolher, gestao, refNo, vaga }) {
    return (
        <div
            ref={refNo}
            data-maquina={equipamento.id}
            aria-hidden={vaga || undefined}
            onPointerDown={gestao ? (e) => gestao.aoPressionar(e, equipamento.id) : undefined}
            // select-none e sem o menu de toque longo: segurar o dedo no card é
            // o gesto de arrastar, e não de selecionar o texto dele.
            className={`relative rounded-xl ${gestao ? 'select-none [-webkit-touch-callout:none]' : ''} ${
                vaga ? 'outline-2 outline-dashed -outline-offset-2 outline-brand/60 bg-brand/5 [&>*]:invisible' : ''
            }`}
        >
            <button
                type="button"
                onClick={() => { if (!gestao?.cliqueBloqueado()) aoEscolher(equipamento); }}
                onKeyDown={gestao ? (e) => gestao.aoTeclar(e, equipamento.id) : undefined}
                aria-describedby={gestao ? 'dica-reordenar' : undefined}
                className={`${CAIXA_CARTAO} w-full h-full border-borda transition-colors duration-150 hover:border-brand active:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
            >
                <ConteudoCartao equipamento={equipamento} registros={registros} hoje={hoje} comLapis={!!gestao} />
            </button>
            {gestao && (
                <button
                    type="button"
                    // Pressionar o lápis não começa um arrasto do card.
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => gestao.aoEditar(equipamento)}
                    aria-label={`Editar ${equipamento.nome}`}
                    className="absolute top-2 right-2 w-10 h-10 grid place-items-center rounded-lg text-tinta-suave hover:text-tinta hover:bg-realce transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
                >
                    <Icon name="edit-3" className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

const GRADE = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';

// Quanto o mouse anda antes de um clique virar arrasto, quanto o dedo precisa
// ficar parado no card antes de pegá-lo, e a faixa junto às bordas da janela
// em que a página rola sozinha durante o arrasto.
const LIMIAR_ARRASTO = 6;
const ESPERA_TOQUE = 350;
const BORDA_ROLAGEM = 72;
const SUAVE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const semMovimento = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Um grupo de máquinas do mesmo tipo. Para o administrador os cards se
// reordenam arrastando, sempre — sem modo à parte:
//
// - Mouse: clicar abre o registro; apertar e mover mais que alguns pixels
//   vira arrasto, e o clique do fim do arrasto é descartado.
// - Toque: deslizar o dedo continua rolando a página, que é o que o celular
//   faz quase sempre. Segurar o dedo parado no card por um instante o pega
//   (com uma vibração curta), e daí em diante o movimento arrasta em vez de
//   rolar.
// - Teclado: Alt + setas no card focado.
//
// O ARRASTO
// O card sai da grade e passa a seguir o ponteiro (uma cópia, por portal, em
// position fixed — sem re-renderizar a cada movimento: a posição vai direto no
// estilo). No lugar dele fica uma vaga tracejada, que é onde ele vai cair.
// Quando o ponteiro entra no espaço de outro card, a vaga troca de lugar com
// ele e os cards deslizam para a posição nova (FLIP: mede antes, mede depois,
// anima a diferença). Ao soltar, o card desliza da mão até a vaga.
//
// A ordem vive só aqui durante o arrasto e vai para o banco uma vez, ao soltar.
// Os movimentos são ouvidos na janela: quando um card troca de lugar, o React
// move o elemento no DOM, e um ouvinte preso a ele deixaria de receber.
function GrupoMaquinas({ maquinas, gerenciavel, registros, hoje, aoEscolher, aoEditar, aoReordenar, anunciar }) {
    const grade = useRef(null);
    const fantasma = useRef(null);
    const nos = useRef(new Map());
    const posicoesAntes = useRef(null);
    const [arrasto, setArrasto] = useState(null); // { id, ordem: [ids], largura, x, y }
    const gesto = useRef(null);
    const bloquearClique = useRef(false);
    const porId = new Map(maquinas.map(m => [m.id, m]));
    const ids = arrasto ? arrasto.ordem : maquinas.map(m => m.id);

    const registrarNo = (id) => (el) => {
        if (el) nos.current.set(id, el);
        else nos.current.delete(id);
    };

    // Mede onde cada card está agora, para animar a diferença depois que a
    // nova ordem for desenhada.
    const medirAntes = (extra) => {
        const mapa = new Map();
        nos.current.forEach((el, id) => mapa.set(id, el.getBoundingClientRect()));
        if (extra) mapa.set(extra.id, extra.rect);
        posicoesAntes.current = mapa;
    };

    // FLIP: depois que a nova ordem está no DOM, cada card que mudou de lugar
    // é desenhado de volta na posição antiga e anima até a nova.
    useLayoutEffect(() => {
        const antes = posicoesAntes.current;
        if (!antes) return;
        posicoesAntes.current = null;
        if (semMovimento()) return;
        nos.current.forEach((el, id) => {
            const de = antes.get(id);
            if (!de) return;
            const para = el.getBoundingClientRect();
            const dx = de.left - para.left;
            const dy = de.top - para.top;
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
            el.animate(
                [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
                { duration: 240, easing: SUAVE },
            );
        });
    });

    // O espaço de cada card na grade, ignorando as animações em curso: medir
    // com getBoundingClientRect durante o deslize faria a vaga trocar de lugar
    // de novo sob um ponteiro parado.
    const slotSob = (x, y) => {
        const g = grade.current?.getBoundingClientRect();
        if (!g) return null;
        for (const [id, el] of nos.current) {
            const l = g.left + el.offsetLeft;
            const t = g.top + el.offsetTop;
            if (x >= l && x <= l + el.offsetWidth && y >= t && y <= t + el.offsetHeight) return id;
        }
        return null;
    };

    const aoPressionar = (e, id) => {
        if (gesto.current) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const el = nos.current.get(id);
        const caixa = el.getBoundingClientRect();
        const inicial = maquinas.map(m => m.id);
        const g = {
            id, x: e.clientX, y: e.clientY, ultimoX: e.clientX, ultimoY: e.clientY,
            dx: e.clientX - caixa.left, dy: e.clientY - caixa.top,
            toque: e.pointerType === 'touch', arrastando: false, inicial, ordem: inicial, timer: null, quadro: null,
        };
        gesto.current = g;

        const posicionarFantasma = () => {
            if (fantasma.current) fantasma.current.style.transform = `translate(${g.ultimoX - g.dx}px, ${g.ultimoY - g.dy}px)`;
        };

        const reposicionar = () => {
            const alvo = slotSob(g.ultimoX, g.ultimoY);
            if (!alvo || alvo === id) return;
            const destino = g.ordem.indexOf(alvo);
            const ordem = g.ordem.filter(x => x !== id);
            ordem.splice(destino, 0, id);
            g.ordem = ordem;
            medirAntes();
            setArrasto(a => (a ? { ...a, ordem } : a));
        };

        // Perto da borda de cima ou de baixo da janela, a página rola sozinha,
        // mais rápido quanto mais perto — para levar um card até um lugar que
        // não está na tela.
        const rolarNaBorda = () => {
            if (!g.arrastando) return;
            const altura = window.innerHeight;
            let passo = 0;
            if (g.ultimoY < BORDA_ROLAGEM) passo = -Math.ceil((BORDA_ROLAGEM - g.ultimoY) / 5);
            else if (g.ultimoY > altura - BORDA_ROLAGEM) passo = Math.ceil((g.ultimoY - (altura - BORDA_ROLAGEM)) / 5);
            if (passo) {
                window.scrollBy(0, passo);
                reposicionar();
            }
            g.quadro = requestAnimationFrame(rolarNaBorda);
        };

        const pegar = () => {
            g.arrastando = true;
            document.documentElement.style.cursor = 'grabbing';
            setArrasto({ id, ordem: g.ordem, largura: caixa.width, x: g.ultimoX - g.dx, y: g.ultimoY - g.dy });
            if (g.toque) navigator.vibrate?.(15);
            g.quadro = requestAnimationFrame(rolarNaBorda);
        };

        const mover = (ev) => {
            g.ultimoX = ev.clientX;
            g.ultimoY = ev.clientY;
            if (!g.arrastando) {
                if (Math.hypot(ev.clientX - g.x, ev.clientY - g.y) < LIMIAR_ARRASTO) return;
                // O dedo andou antes de pegar o card: é rolagem, não arrasto.
                if (g.toque) return encerrar();
                pegar();
            }
            posicionarFantasma();
            reposicionar();
        };

        // Com o card pego, o dedo arrasta em vez de rolar a página. Precisa ser
        // um ouvinte de touchmove não passivo — é o único que pode cancelar a
        // rolagem, e sem ele o navegador a assume e encerra o ponteiro.
        const segurarRolagem = (ev) => { if (g.arrastando) ev.preventDefault(); };
        const semMenu = (ev) => ev.preventDefault();

        const encerrar = () => {
            clearTimeout(g.timer);
            cancelAnimationFrame(g.quadro);
            window.removeEventListener('pointermove', mover);
            window.removeEventListener('pointerup', encerrar);
            window.removeEventListener('pointercancel', encerrar);
            window.removeEventListener('touchmove', segurarRolagem);
            window.removeEventListener('contextmenu', semMenu);
            gesto.current = null;
            if (!g.arrastando) return;
            document.documentElement.style.cursor = '';
            // O soltar do arrasto ainda dispara um clique no card; ele não pode
            // abrir o registro da máquina.
            bloquearClique.current = true;
            setTimeout(() => { bloquearClique.current = false; }, 0);
            // O card pousa: parte de onde a cópia estava, na mão, até a vaga.
            medirAntes(fantasma.current && { id, rect: fantasma.current.getBoundingClientRect() });
            setArrasto(null);
            if (g.ordem.join() === g.inicial.join()) return;
            aoReordenar(g.ordem);
            anunciar(`${porId.get(id)?.nome}: posição ${g.ordem.indexOf(id) + 1} de ${g.ordem.length}.`);
        };

        if (g.toque) g.timer = setTimeout(pegar, ESPERA_TOQUE);
        window.addEventListener('pointermove', mover);
        window.addEventListener('pointerup', encerrar);
        window.addEventListener('pointercancel', encerrar);
        window.addEventListener('touchmove', segurarRolagem, { passive: false });
        window.addEventListener('contextmenu', semMenu);
    };

    const aoTeclar = (e, id) => {
        if (!e.altKey) return;
        const passo = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
        if (!passo) return;
        e.preventDefault();
        const ordem = maquinas.map(m => m.id);
        const de = ordem.indexOf(id);
        const para = de + passo;
        if (para < 0 || para >= ordem.length) return;
        ordem.splice(de, 1);
        ordem.splice(para, 0, id);
        medirAntes();
        aoReordenar(ordem);
        anunciarPosicao(id, ordem);
    };

    const anunciarPosicao = (id, ordem) =>
        anunciar(`${porId.get(id)?.nome}: posição ${ordem.indexOf(id) + 1} de ${ordem.length}.`);

    const emMaos = arrasto && porId.get(arrasto.id);

    return (
        <>
            <div ref={grade} className={`${GRADE} relative`}>
                {ids.map(id => {
                    const eq = porId.get(id);
                    if (!eq) return null;
                    return (
                        <CartaoMaquina
                            key={id}
                            refNo={registrarNo(id)}
                            vaga={arrasto?.id === id}
                            equipamento={eq}
                            registros={registros}
                            hoje={hoje}
                            aoEscolher={aoEscolher}
                            gestao={gerenciavel && {
                                aoPressionar,
                                aoTeclar,
                                aoEditar,
                                cliqueBloqueado: () => bloquearClique.current,
                            }}
                        />
                    );
                })}
            </div>
            {emMaos && createPortal(
                <div
                    ref={fantasma}
                    aria-hidden="true"
                    className="fixed left-0 top-0 z-[60] pointer-events-none"
                    style={{ width: arrasto.largura, transform: `translate(${arrasto.x}px, ${arrasto.y}px)` }}
                >
                    <div className={`${CAIXA_CARTAO} border-brand shadow-[0_18px_40px_-12px_rgb(0_0_0/0.35)] rotate-[1.5deg] scale-[1.03] motion-reduce:rotate-0 motion-reduce:scale-100`}>
                        <ConteudoCartao equipamento={emMaos} registros={registros} hoje={hoje} />
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}

function LinhaRegistro({ registro, registros, nomeMaquina, autor, podeApagar, aoApagar }) {
    const [, mes, dia] = registro.data.split('-');
    const ehCarga = registro.tipo === 'Reabastecimento';

    return (
        <li className="flex gap-3 sm:gap-4 py-3.5 border-b border-borda-fraca last:border-b-0">
            <time dateTime={registro.data} className="w-10 shrink-0 text-center pt-0.5">
                <span className="block text-lg font-black text-tinta leading-none tabular-nums">{dia}</span>
                <span className="block text-micro font-semibold uppercase tracking-wider text-tinta-suave mt-1">{MESES[Number(mes) - 1]}</span>
            </time>

            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                {/* O nome da máquina fica na linha de detalhes, e não ao lado do
                    tipo: no celular "Reabastecimento · Workforce - 02" não cabe
                    numa linha, e truncar cortava justamente a informação que
                    distingue um registro do outro. */}
                <p className="text-corpo font-semibold text-tinta flex items-center gap-1.5">
                    <Icon name={ehCarga ? 'droplet' : 'wrench'} className="w-3.5 h-3.5 shrink-0 text-tinta-suave" />
                    {ehCarga ? 'Reabastecimento' : 'Manutenção'}
                </p>

                {ehCarga ? (
                    <ul className="flex flex-col gap-1">
                        {(registro.cores || []).map(id => {
                            const tinta = tintaPorId(id);
                            const rendeu = rendimentoDaCargaAnterior(registros, registro, id);
                            return (
                                <li key={id} className="text-mini text-tinta-corpo">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-inset ring-black/15 dark:ring-white/25" style={{ background: fundoDaTinta(id) }} aria-hidden="true" />
                                        {tinta.rotulo}
                                    </span>
                                    {rendeu != null && (
                                        <span className="block pl-[18px] text-micro text-tinta-suave tabular-nums">
                                            a carga anterior rendeu <span className="font-semibold text-tinta-corpo">{formatarContador(rendeu)} páginas</span>
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-mini text-tinta-corpo whitespace-pre-line break-words">{registro.descricao}</p>
                )}

                <p className="text-micro text-tinta-suave tabular-nums">
                    {[
                        nomeMaquina,
                        registro.contador != null && `Contador ${formatarContador(registro.contador)}`,
                        autor && `por ${autor}`,
                    ].filter(Boolean).join(' · ')}
                </p>
            </div>

            {podeApagar && (
                <button
                    type="button"
                    onClick={() => aoApagar(registro)}
                    aria-label="Apagar este registro"
                    // 44px de alvo, o mínimo para o polegar, e o ícone em tinta-suave:
                    // em tinta-fraca ele ficava abaixo do contraste mínimo de 3:1
                    // que um controle precisa para ser visto.
                    className="self-start w-11 h-11 -mr-2.5 -mt-2 grid place-items-center rounded-lg text-tinta-suave hover:text-perigo hover:bg-realce transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
                >
                    <Icon name="trash-2" className="w-4 h-4" />
                </button>
            )}
        </li>
    );
}

export default function EquipamentosTab() {
    const { usuario, isAdmin, usuariosSistema } = useSessao();
    const { confirmar, avisar } = useUi();
    const maquinasApi = useEquipamentos();
    const { equipamentos } = maquinasApi;
    const { registros, carregando, erro, indisponivel, registrar, apagar } = useRegistrosEquipamentos();
    const [escolhido, setEscolhido] = useState(null);
    const [alvoCadastro, setAlvoCadastro] = useState(null);
    const [filtro, setFiltro] = useState('todas');
    const [anuncio, setAnuncio] = useState('');
    const hoje = obterDataAtual();

    const emUso = useMemo(() => equipamentos.filter(e => !e.arquivado_em), [equipamentos]);
    const arquivadas = useMemo(() => equipamentos.filter(e => e.arquivado_em), [equipamentos]);
    const porId = useMemo(() => new Map(equipamentos.map(e => [e.id, e])), [equipamentos]);
    const grupos = useMemo(
        () => TIPOS_EQUIPAMENTO
            .map(t => ({ ...t, maquinas: emUso.filter(e => e.tipo === t.id) }))
            .filter(g => g.maquinas.length),
        [emUso],
    );

    const autores = useMemo(
        () => Object.fromEntries((usuariosSistema || []).map(u => [u.id, u.nome])),
        [usuariosSistema],
    );

    const historico = useMemo(() => {
        const ordenados = ordenar(registros);
        return filtro === 'todas' ? ordenados : ordenados.filter(r => r.equipamento === filtro);
    }, [registros, filtro]);

    const nomeDoRegistro = (registro) => porId.get(registro.equipamento)?.nome || 'Máquina removida';

    // Os nomes das máquinas em uso, menos a que está sendo editada — o
    // formulário avisa do nome repetido antes de o banco recusar.
    const nomesEmUso = (excetoId) => new Set(
        emUso.filter(e => e.id !== excetoId).map(e => e.nome.trim().toLowerCase()),
    );

    async function salvarEntrada(entrada) {
        const resultado = await registrar(entrada);
        if (resultado.erro) return resultado;

        // O momento em que anotar o contador se paga: a carga que acabou de sair
        // finalmente tem rendimento conhecido.
        const novo = resultado.registro;
        const rendimentos = entrada.tipo === 'Reabastecimento'
            ? (novo.cores || [])
                .map(id => ({ id, paginas: rendimentoDaCargaAnterior([novo, ...registros], novo, id) }))
                .filter(r => r.paginas != null)
            : [];
        avisar(
            rendimentos.length
                ? `Registrado. ${rendimentos.map(r => `${tintaPorId(r.id).rotulo}: a carga anterior rendeu ${formatarContador(r.paginas)} páginas`).join('; ')}.`
                // "Manutenção" é feminino: o particípio concorda com o tipo.
                : `${entrada.tipo === 'Manutenção' ? 'Manutenção registrada' : 'Reabastecimento registrado'} em ${nomeDoRegistro(novo)}.`,
            'sucesso',
        );
        return resultado;
    }

    async function salvarMaquina(existente, dados) {
        if (!existente) {
            const r = await maquinasApi.criar(dados);
            if (!r.erro) avisar(`${dados.nome} cadastrada.`, 'sucesso');
            return r;
        }
        // Mudou de tipo, mudou de grupo: entra no fim do grupo novo, em vez de
        // herdar uma posição que lá significa outra coisa.
        const mudancas = { ...dados };
        if (dados.tipo !== existente.tipo) {
            mudancas.ordem = emUso.filter(e => e.tipo === dados.tipo).reduce((m, e) => Math.max(m, e.ordem), 0) + 1;
        }
        const r = await maquinasApi.atualizar(existente.id, mudancas);
        if (!r.erro) avisar(`${dados.nome} atualizada.`, 'sucesso');
        return r;
    }

    async function arquivarMaquina(equipamento) {
        if (!(await confirmar(`Arquivar ${equipamento.nome}? Ela sai da tela, mas o histórico dela continua guardado.`))) return;
        const r = await maquinasApi.arquivar(equipamento.id);
        if (r.erro) {
            avisar(`Não foi possível arquivar: ${r.erro}`, 'erro');
            return;
        }
        setAlvoCadastro(null);
        avisar(`${equipamento.nome} arquivada.`, 'sucesso');
    }

    async function restaurarMaquina(equipamento) {
        const r = await maquinasApi.restaurar(equipamento.id);
        avisar(r.erro ? `Não foi possível restaurar: ${r.erro}` : `${equipamento.nome} voltou para a tela.`, r.erro ? 'erro' : 'sucesso');
    }

    async function reordenar(ids) {
        const r = await maquinasApi.reordenar(ids);
        if (r.erro) avisar(`Não foi possível salvar a nova ordem: ${r.erro}`, 'erro');
    }

    async function pedirParaApagar(registro) {
        if (!(await confirmar(`Apagar este registro de ${registro.tipo.toLowerCase()} da ${nomeDoRegistro(registro)}?`))) return;
        const resultado = await apagar(registro.id);
        if (resultado.erro) avisar(resultado.erro, 'erro');
    }

    const maquinasComRegistro = equipamentos.filter(e => registros.some(r => r.equipamento === e.id));
    const podeGerenciar = isAdmin && !maquinasApi.indisponivel && !maquinasApi.carregando;

    return (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 flex flex-col gap-8">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="min-w-0 flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Equipamentos</h1>
                    <p className="text-corpo text-tinta-suave">Escolha a máquina para registrar uma carga de tinta ou uma manutenção.</p>
                    {/* O arrasto não tem botão que o anuncie, então a dica fica
                        escrita — e é ela que o leitor de tela lê em cada card. */}
                    {podeGerenciar && emUso.length > 1 && (
                        <p id="dica-reordenar" className="text-mini text-tinta-suave">
                            Para mudar a ordem, arraste o card dentro do grupo. No celular, segure o card um instante antes de arrastar.
                            <span className="sr-only"> Pelo teclado, Alt e as setas.</span>
                        </p>
                    )}
                </div>
                {/* Igual ao "Nova O.S." de Produção: no computador, no topo; no
                    celular, na barra fixa do rodapé (BarraAcoes, no fim da tela). */}
                {podeGerenciar && (
                    <button
                        type="button"
                        onClick={() => setAlvoCadastro({ equipamento: null })}
                        className="hidden lg:flex shrink-0 bg-brand hover:bg-brandHover text-white px-4 py-2 text-corpo rounded-md font-semibold shadow-sm transition items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        <Icon name="plus" /> Nova máquina
                    </button>
                )}
            </header>

            <p aria-live="polite" className="sr-only">{anuncio}</p>

            {(maquinasApi.indisponivel || indisponivel) && (
                <div role="status" className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-corpo text-tinta-corpo">
                    <p className="font-semibold text-aviso">A tela de equipamentos ainda não está disponível.</p>
                    <p className="text-mini text-tinta-suave mt-0.5">Falta criar as tabelas de máquinas e registros no banco.</p>
                </div>
            )}
            {maquinasApi.erro && (
                <p role="alert" className="text-corpo text-perigo">Não foi possível carregar as máquinas: {maquinasApi.erro}</p>
            )}

            {maquinasApi.carregando ? (
                <div className={GRADE} aria-label="Carregando máquinas">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-36 rounded-xl border border-borda bg-superficie p-4 flex flex-col gap-3">
                            <div className="h-4 w-1/2 rounded bg-realce animate-pulse" />
                            <div className="h-2.5 w-2/3 rounded bg-realce animate-pulse" />
                            <div className="mt-auto h-2 rounded bg-realce animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : grupos.length === 0 && !maquinasApi.indisponivel ? (
                <div className="rounded-xl border border-dashed border-borda-forte px-6 py-10 text-center">
                    <Icon name="printer" className="w-8 h-8 mx-auto text-tinta-fraca" />
                    <p className="mt-3 text-corpo font-semibold text-tinta">Nenhuma máquina cadastrada</p>
                    <p className="mt-1 text-mini text-tinta-suave">
                        {isAdmin ? 'Use "Nova máquina" para cadastrar a primeira.' : 'Peça a um administrador para cadastrar as máquinas.'}
                    </p>
                </div>
            ) : (
                grupos.map(g => (
                    <section key={g.id} aria-labelledby={`grupo-${g.id}`} className="flex flex-col gap-3">
                        <h2 id={`grupo-${g.id}`} className="flex items-baseline gap-2 text-base font-bold text-tinta tracking-tight">
                            {g.rotulo}
                            <span className="text-mini font-semibold text-tinta-suave tabular-nums">
                                {g.maquinas.length} {g.maquinas.length === 1 ? 'máquina' : 'máquinas'}
                            </span>
                        </h2>
                        <GrupoMaquinas
                            maquinas={g.maquinas}
                            gerenciavel={podeGerenciar}
                            registros={registros}
                            hoje={hoje}
                            aoEscolher={setEscolhido}
                            aoEditar={(eq) => setAlvoCadastro({ equipamento: eq })}
                            aoReordenar={reordenar}
                            anunciar={setAnuncio}
                        />
                    </section>
                ))
            )}

            {isAdmin && arquivadas.length > 0 && (
                <details className="group rounded-xl border border-borda bg-superficie">
                    <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none px-4 h-12 flex items-center justify-between gap-3 rounded-xl text-corpo font-semibold text-tinta-suave hover:text-tinta focus-visible:outline-2 focus-visible:outline-brand">
                        <span>Arquivadas <span className="tabular-nums">({arquivadas.length})</span></span>
                        <Icon name="chevron-down" className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <ul className="px-4 pb-1 border-t border-borda-fraca">
                        {arquivadas.map(eq => (
                            <li key={eq.id} className="flex items-center gap-3 py-2.5 border-b border-borda-fraca last:border-b-0">
                                <span className="flex-1 min-w-0">
                                    <span className="block text-corpo font-semibold text-tinta truncate">{eq.nome}</span>
                                    <span className="block text-mini text-tinta-suave truncate">{[tipoPorId(eq.tipo).rotulo, eq.modelo].filter(Boolean).join(' · ')}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => restaurarMaquina(eq)}
                                    className="shrink-0 h-10 px-3.5 rounded-lg border border-borda text-mini font-semibold text-tinta-suave hover:text-tinta hover:border-borda-forte transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand"
                                >
                                    Restaurar
                                </button>
                            </li>
                        ))}
                    </ul>
                </details>
            )}

            <section aria-labelledby="titulo-historico" className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <h2 id="titulo-historico" className="text-lg font-bold text-tinta tracking-tight">Histórico</h2>
                    {maquinasComRegistro.length > 1 && (
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por máquina">
                            {[{ id: 'todas', nome: 'Todas' }, ...maquinasComRegistro].map(m => {
                                const ativo = filtro === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        aria-pressed={ativo}
                                        onClick={() => setFiltro(m.id)}
                                        className={`h-9 px-3.5 rounded-full text-mini font-semibold border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                                            ativo ? 'bg-tinta text-fundo border-tinta' : 'bg-superficie text-tinta-suave border-borda hover:text-tinta hover:border-borda-forte'
                                        }`}
                                    >
                                        {m.nome}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-borda bg-superficie px-4 sm:px-5">
                    {carregando ? (
                        <div aria-label="Carregando histórico">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex gap-3 py-3.5 border-b border-borda-fraca last:border-b-0">
                                    <div className="w-10 h-9 rounded bg-realce animate-pulse shrink-0" />
                                    <div className="flex-1 flex flex-col gap-2 pt-1">
                                        <div className="h-3.5 rounded bg-realce animate-pulse" style={{ width: `${40 + (i % 3) * 15}%` }} />
                                        <div className="h-2.5 w-1/3 rounded bg-realce animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : erro ? (
                        <p className="py-8 text-center text-corpo text-perigo">Não foi possível carregar o histórico: {erro}</p>
                    ) : historico.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-corpo font-semibold text-tinta">Nenhum registro ainda</p>
                            <p className="mt-1 text-mini text-tinta-suave">
                                {emUso.length
                                    ? 'Escolha uma máquina acima para lançar a primeira carga ou manutenção.'
                                    : 'Os registros aparecem aqui assim que as máquinas forem cadastradas.'}
                            </p>
                        </div>
                    ) : (
                        <ul>
                            {historico.map(r => (
                                <LinhaRegistro
                                    key={r.id}
                                    registro={r}
                                    registros={registros}
                                    nomeMaquina={filtro === 'todas' ? nomeDoRegistro(r) : null}
                                    autor={autores[r.criado_por]}
                                    podeApagar={isAdmin || (usuario?.id && r.criado_por === usuario.id)}
                                    aoApagar={pedirParaApagar}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <NovaEntradaModal
                equipamento={escolhido}
                nome={escolhido?.nome}
                registros={registros}
                aoSalvar={salvarEntrada}
                aoFechar={() => setEscolhido(null)}
            />
            <MaquinaModal
                alvo={alvoCadastro}
                nomesEmUso={nomesEmUso}
                aoSalvar={salvarMaquina}
                aoArquivar={arquivarMaquina}
                aoFechar={() => setAlvoCadastro(null)}
            />

            {podeGerenciar && (
                <BarraAcoes
                    acoes={[{
                        id: 'nova', icone: 'plus', rotulo: 'Nova máquina', destaque: true,
                        aoClicar: () => setAlvoCadastro({ equipamento: null }),
                    }]}
                />
            )}
        </main>
    );
}
