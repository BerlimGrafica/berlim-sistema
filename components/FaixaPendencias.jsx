"use client";
import { useCallback, useRef, useState } from 'react';
import { useUi } from '@/context/UiContext';
import Icon from '@/components/Icon';
import { gravidadeDe, piorGravidade, resumirPendencias } from '@/lib/alertas/pendencias';
import { useIrParaPendencia } from '@/hooks/useIrParaPendencia';

// Faixa logo abaixo da barra: SÓ o que é vermelho (atrasado, vencido, Futura
// no prazo). Divide o trabalho com o sino em vez de repeti-lo:
//
//   faixa — o urgente, à vista o tempo todo, porque o sino sozinho depende de
//           a pessoa lembrar de olhar. Some quando não há nada vermelho.
//   sino  — todas as pendências, inclusive as de hoje e as tarefas.
//
// Antes a faixa aparecia também para o âmbar e abria a mesma lista do sino,
// com um número diferente do dele ("3 pendências" na faixa, 7 no sino). Rara,
// ela volta a chamar atenção quando aparece.
//
// Dois estados: recolhida (uma linha) e aberta (a lista). Entra aberta uma
// vez por sessão, no primeiro carregamento, se houver algo vermelho; sem
// vermelho, quem abre no login é o painel do sino (hooks/usePendencias.js).
export default function FaixaPendencias() {
    const { pendencias, pendenciasUrgentes, resumoDeEntrada, fecharResumoDeEntrada, setModalAlertasAberto } = useUi();
    const irPara = useIrParaPendencia();
    const [abertaPorClique, setAbertaPorClique] = useState(false);

    // A faixa publica a própria altura em --altura-faixa, que entra em
    // --altura-cabecalho (app/globals.css). É assim que as sub-abas, que grudam
    // logo abaixo do cabeçalho, descem quando a faixa aparece e sobem quando
    // ela some — sem precisar saber que a faixa existe.
    //
    // Ref de callback, e não useEffect: o React a chama com o elemento quando a
    // faixa entra e com null quando ela sai (o `return null` abaixo, quando não
    // há nada urgente). É exatamente o momento de zerar a variável.
    const observador = useRef(null);
    const medir = useCallback((el) => {
        observador.current?.disconnect();
        observador.current = null;
        const raiz = document.documentElement;
        if (!el) {
            raiz.style.setProperty('--altura-faixa', '0px');
            return;
        }
        const publicar = () => raiz.style.setProperty('--altura-faixa', `${Math.ceil(el.getBoundingClientRect().height)}px`);
        publicar();
        observador.current = new ResizeObserver(publicar);
        observador.current.observe(el);
    }, []);

    const ehResumo = !!resumoDeEntrada?.length;
    const aberta = ehResumo || abertaPorClique;
    const lista = ehResumo ? resumoDeEntrada : pendenciasUrgentes;
    const outras = pendencias.length - pendenciasUrgentes.length;

    if (!ehResumo && pendenciasUrgentes.length === 0) return null;

    const gravidade = gravidadeDe(piorGravidade(ehResumo ? resumoDeEntrada : pendenciasUrgentes));
    const total = ehResumo ? resumoDeEntrada.length : pendenciasUrgentes.length;

    const fechar = () => {
        setAbertaPorClique(false);
        if (ehResumo) fecharResumoDeEntrada();
    };

    return (
        // Gruda abaixo da barra E das abas. Antes grudava em --altura-barra, o
        // mesmo ponto das abas, e por vir depois no código era desenhada por
        // cima delas — cobrindo o menu pela metade ao rolar a página.
        <div ref={medir} className={`sticky top-[calc(var(--altura-barra)+var(--altura-abas))] z-30 border-b ${gravidade.faixa} no-print`}>
            <div className="px-4 lg:px-6 py-2 flex items-center gap-3">
                <span className={`shrink-0 w-2 h-2 rounded-full ${gravidade.ponto}`} />
                <button
                    type="button"
                    onClick={() => (aberta ? fechar() : setAbertaPorClique(true))}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left"
                    aria-expanded={aberta}
                >
                    <span className={`shrink-0 text-corpo font-bold ${gravidade.texto}`}>
                        {total} {total === 1 ? 'pendência urgente' : 'pendências urgentes'}
                    </span>
                    {!aberta && (
                        <span className="min-w-0 truncate text-corpo text-tinta-suave">
                            {resumirPendencias(pendenciasUrgentes)}
                        </span>
                    )}
                    <Icon name="chevron-down" className={`shrink-0 w-4 h-4 text-tinta-suave transition-transform ${aberta ? 'rotate-180' : ''}`} />
                </button>
                {aberta && (
                    <button
                        type="button"
                        onClick={fechar}
                        className="shrink-0 px-2.5 py-1 rounded-md text-mini font-semibold text-tinta-suave hover:bg-black/5 dark:hover:bg-white/10 transition"
                    >
                        Entendi
                    </button>
                )}
            </div>

            {aberta && (
                <ul className="px-2 lg:px-4 pb-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {lista.map(p => {
                        const g = gravidadeDe(p.gravidade);
                        return (
                            <li key={p.id}>
                                <button
                                    type="button"
                                    onClick={() => { fechar(); irPara(p); }}
                                    className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-left hover:bg-black/5 dark:hover:bg-white/10 transition"
                                >
                                    <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${g.ponto}`} />
                                    <span className={`shrink-0 text-corpo font-semibold ${g.texto}`}>{p.titulo}</span>
                                    <span className="min-w-0 flex-1 truncate text-corpo text-tinta-suave">{p.detalhe}</span>
                                    <Icon name="chevron-right" className="shrink-0 w-4 h-4 text-tinta-fraca" />
                                </button>
                            </li>
                        );
                    })}
                    {/* O resto mora no sino: um atalho até ele, em vez de
                        repetir aqui a lista inteira. */}
                    {outras > 0 && (
                        <li>
                            <button
                                type="button"
                                onClick={() => { fechar(); setModalAlertasAberto(true); }}
                                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-mini font-semibold text-tinta-suave hover:bg-black/5 dark:hover:bg-white/10 transition"
                            >
                                <Icon name="bell" className="shrink-0 w-3.5 h-3.5" />
                                {outras === 1 ? 'Mais 1 pendência no sino' : `Mais ${outras} pendências no sino`}
                            </button>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
