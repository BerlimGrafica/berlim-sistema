"use client";
import Link from 'next/link';
import Icon from '@/components/Icon';
import { TELAS_NOVAS, useValidadas } from '@/lib/prototipos/roteiro';

// Todas as telas novas numa lista, na ordem do menu, para validar uma a uma.
// Em cada tela, a faixa do topo (RoteiroTelasNovas) leva à próxima; daqui se vê
// o que falta e o que conferir em cada uma. As marcas de "validada" ficam neste
// navegador (lib/prototipos/roteiro.js).
export default function Page() {
    const { validadas, alternar, limpar } = useValidadas();
    const feitas = TELAS_NOVAS.filter(t => validadas.includes(t.href)).length;
    const total = TELAS_NOVAS.length;
    const proxima = TELAS_NOVAS.find(t => !validadas.includes(t.href));

    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <header className="flex flex-wrap items-end gap-x-6 gap-y-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-black text-tinta tracking-tight">Telas novas</h1>
                    <p className="mt-1.5 text-corpo text-tinta-suave leading-relaxed max-w-prose">
                        Todas as telas refeitas, na ordem do menu. Abra uma, confira e marque como validada;
                        a faixa no topo de cada tela leva à próxima.
                    </p>
                </div>
                {proxima ? (
                    proxima.fora ? (
                        <a href={proxima.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-brand text-sobre-brand text-corpo font-semibold hover:bg-brandHover transition shadow-sm">
                            {feitas ? 'Continuar' : 'Começar'}: {proxima.nome}
                            <Icon name="external-link" className="w-4 h-4" />
                        </a>
                    ) : (
                        <Link href={proxima.href} className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-brand text-sobre-brand text-corpo font-semibold hover:bg-brandHover transition shadow-sm">
                            {feitas ? 'Continuar' : 'Começar'}: {proxima.nome}
                            <Icon name="chevron-right" className="w-4 h-4" />
                        </Link>
                    )
                ) : (
                    <p className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-sucesso/10 text-sucesso text-corpo font-semibold">
                        <Icon name="check-circle" className="w-4 h-4" />
                        Todas validadas
                    </p>
                )}
            </header>

            <div className="mt-8 flex items-center gap-3">
                <div
                    className="flex-1 h-1.5 rounded-full bg-sutil overflow-hidden"
                    role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={feitas}
                    aria-label="Telas validadas"
                >
                    <div className="h-full rounded-full bg-sucesso transition-[width] duration-300" style={{ width: `${(feitas / total) * 100}%` }} />
                </div>
                <p className="text-mini text-tinta-suave tabular-nums shrink-0">{feitas} de {total} validadas</p>
                {feitas > 0 && (
                    <button type="button" onClick={limpar} className="text-mini font-semibold text-tinta-suave hover:text-tinta underline-offset-2 hover:underline">
                        Desmarcar todas
                    </button>
                )}
            </div>

            <ol className="mt-4 rounded-lg border border-borda bg-superficie divide-y divide-borda-fraca overflow-hidden">
                {TELAS_NOVAS.map((t, i) => {
                    const feita = validadas.includes(t.href);
                    const Abrir = t.fora ? 'a' : Link;
                    const extra = t.fora ? { target: '_blank', rel: 'noopener' } : {};
                    return (
                        <li key={t.href} className="flex items-start gap-3 sm:gap-4 px-4 py-4 hover:bg-sutil transition-colors">
                            <span className="mt-0.5 w-6 text-mini text-tinta-fraca tabular-nums text-right shrink-0">{i + 1}</span>
                            <span className={`mt-0.5 w-8 h-8 rounded-md grid place-items-center shrink-0 ${feita ? 'bg-sucesso/10 text-sucesso' : 'bg-sutil text-tinta-suave'}`}>
                                <Icon name={t.icone} className="w-4 h-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <Abrir href={t.href} {...extra} className="group inline-flex items-center gap-1.5 text-corpo font-semibold text-tinta hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded-sm">
                                    {t.nome}
                                    <Icon name={t.fora ? 'external-link' : 'chevron-right'} className="w-3.5 h-3.5 text-tinta-fraca group-hover:text-brand" />
                                </Abrir>
                                <p className="text-mini text-tinta-suave">Substitui {t.substitui} · <span className="font-mono">{t.href}</span></p>
                                <p className="mt-1.5 text-compacto text-tinta-corpo leading-relaxed">{t.conferir}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => alternar(t.href)}
                                aria-pressed={feita}
                                aria-label={`${t.nome}: ${feita ? 'validada (clique para desmarcar)' : 'marcar como validada'}`}
                                className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-compacto font-semibold transition-colors ${feita
                                    ? 'border-sucesso/40 bg-sucesso/10 text-sucesso hover:bg-sucesso/15'
                                    : 'border-borda text-tinta-suave hover:bg-realce hover:text-tinta'}`}
                            >
                                <Icon name={feita ? 'check-circle' : 'check'} className="w-4 h-4" />
                                <span className="hidden sm:inline">{feita ? 'Validada' : 'Validar'}</span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </main>
    );
}
