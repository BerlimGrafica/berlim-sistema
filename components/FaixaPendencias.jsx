"use client";
import { useState } from 'react';
import { useUi } from '@/context/UiContext';
import Icon from '@/components/Icon';
import { gravidadeDe, piorGravidade, resumirPendencias } from '@/lib/alertas/pendencias';
import { useIrParaPendencia } from '@/hooks/useIrParaPendencia';

// Faixa logo abaixo da barra, com dois estados:
//
//   recolhida  — uma linha, enquanto houver algo com prazo (vencido ou vencendo).
//                Fica na tela o tempo todo, porque o sino sozinho depende de a
//                pessoa lembrar de olhar para ele.
//   aberta     — a lista. Entra assim uma vez por sessão, no primeiro
//                carregamento, e depois só quando a pessoa clica.
//
// Pendência puramente "a fazer" não segura a faixa aberta: ela aparece no
// resumo de entrada e vive no sino e no contador do menu. Uma tarja permanente
// para trabalho de rotina vira parte do cenário e para de ser lida.
export default function FaixaPendencias() {
    const { pendencias, pendenciasUrgentes, resumoDeEntrada, fecharResumoDeEntrada } = useUi();
    const irPara = useIrParaPendencia();
    const [abertaPorClique, setAbertaPorClique] = useState(false);

    const ehResumo = !!resumoDeEntrada?.length;
    const aberta = ehResumo || abertaPorClique;
    const lista = ehResumo ? resumoDeEntrada : pendencias;

    if (!ehResumo && pendenciasUrgentes.length === 0) return null;

    const gravidade = gravidadeDe(piorGravidade(ehResumo ? resumoDeEntrada : pendenciasUrgentes));
    const total = ehResumo ? resumoDeEntrada.length : pendenciasUrgentes.length;

    const fechar = () => {
        setAbertaPorClique(false);
        if (ehResumo) fecharResumoDeEntrada();
    };

    return (
        <div className={`sticky top-[var(--altura-barra)] z-30 border-b ${gravidade.faixa} no-print`}>
            <div className="px-4 lg:px-6 py-2 flex items-center gap-3">
                <span className={`shrink-0 w-2 h-2 rounded-full ${gravidade.ponto}`} />
                <button
                    type="button"
                    onClick={() => (aberta ? fechar() : setAbertaPorClique(true))}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left"
                    aria-expanded={aberta}
                >
                    <span className={`shrink-0 text-corpo font-bold ${gravidade.texto}`}>
                        {total} {total === 1 ? 'pendência' : 'pendências'}
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
                </ul>
            )}
        </div>
    );
}
