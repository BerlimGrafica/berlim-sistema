"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/Icon';
import { TELAS_NOVAS, indiceDaTela, useValidadas } from '@/lib/prototipos/roteiro';

// A faixa fina no topo de cada tela nova: em que tela do roteiro a pessoa está,
// marcar como validada, e ir para a anterior ou a próxima sem digitar endereço.
// Fora das telas novas ela não existe. Fica acima da página, e não flutuando
// sobre ela: os protótipos ocupam a área inteira e têm avisos embaixo, que uma
// pílula flutuante taparia.
const BOTAO = 'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-compacto font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

function Vizinha({ tela, lado }) {
    if (!tela) {
        return (
            <span className={`${BOTAO} text-tinta-fraca cursor-default`} aria-hidden="true">
                <Icon name={lado === 'antes' ? 'chevron-left' : 'chevron-right'} className="w-4 h-4" />
            </span>
        );
    }
    const rotulo = `${lado === 'antes' ? 'Anterior' : 'Próxima'}: ${tela.nome}`;
    const conteudo = lado === 'antes' ? (
        <>
            <Icon name="chevron-left" className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline max-w-40 truncate">{tela.nome}</span>
        </>
    ) : (
        <>
            <span className="hidden md:inline max-w-40 truncate">{tela.nome}</span>
            <Icon name={tela.fora ? 'external-link' : 'chevron-right'} className="w-4 h-4 shrink-0" />
        </>
    );
    const classe = `${BOTAO} text-tinta-suave hover:text-tinta hover:bg-realce`;
    return tela.fora ? (
        <a href={tela.href} target="_blank" rel="noopener" className={classe} aria-label={`${rotulo} (abre numa aba nova)`} title={`${rotulo} (abre numa aba nova)`}>{conteudo}</a>
    ) : (
        <Link href={tela.href} className={classe} aria-label={rotulo} title={rotulo}>{conteudo}</Link>
    );
}

export default function RoteiroTelasNovas() {
    const pathname = usePathname();
    const { validadas, alternar } = useValidadas();
    const i = indiceDaTela(pathname);
    if (i < 0) return null;

    const tela = TELAS_NOVAS[i];
    const feita = validadas.includes(tela.href);
    const nFeitas = TELAS_NOVAS.filter(t => validadas.includes(t.href)).length;

    return (
        <nav aria-label="Roteiro das telas novas" className="no-print shrink-0 flex items-center gap-2 h-12 px-3 sm:px-4 bg-superficie border-b border-borda">
            <Link
                href="/telas-novas"
                className={`${BOTAO} -ml-1 text-tinta-suave hover:text-tinta hover:bg-realce`}
                title={`Todas as telas novas (${nFeitas} de ${TELAS_NOVAS.length} validadas)`}
            >
                <Icon name="list" className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Telas novas</span>
            </Link>
            <span className="w-px h-5 bg-borda shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex items-baseline gap-2">
                <span className="text-mini text-tinta-suave tabular-nums shrink-0">{i + 1} de {TELAS_NOVAS.length}</span>
                <span className="text-corpo font-semibold text-tinta truncate">{tela.nome}</span>
                <span className="hidden xl:inline text-mini text-tinta-suave truncate">substitui {tela.substitui}</span>
            </p>

            <div className="ml-auto flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={() => alternar(tela.href)}
                    aria-pressed={feita}
                    className={`${BOTAO} border ${feita
                        ? 'border-sucesso/40 bg-sucesso/10 text-sucesso hover:bg-sucesso/15'
                        : 'border-borda text-tinta-corpo hover:bg-realce hover:text-tinta'}`}
                    title={feita ? 'Clique para desmarcar' : 'Marcar esta tela como validada'}
                >
                    <Icon name={feita ? 'check-circle' : 'check'} className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{feita ? 'Validada' : 'Marcar como validada'}</span>
                    <span className="sm:hidden sr-only">{feita ? 'Validada' : 'Marcar como validada'}</span>
                </button>
                <span className="w-px h-5 bg-borda mx-1" aria-hidden="true" />
                <Vizinha tela={TELAS_NOVAS[i - 1]} lado="antes" />
                <Vizinha tela={TELAS_NOVAS[i + 1]} lado="depois" />
            </div>
        </nav>
    );
}
