"use client";

// O contador de páginas como ele aparece no painel da máquina: um dígito por
// janela. Quando entra um registro novo, os dígitos que mudaram giram até o
// número novo, o da direita primeiro, como num contador mecânico. Na primeira
// vez que aparece, já está parado no valor (o elemento nasce com a posição
// final, então não há transição). Com "reduzir movimento", troca sem girar.
//
// Nos tons do card, e não numa caixa preta: no card ele é um detalhe, e o
// preto o fazia pesar mais que o nome da máquina. Os zeros à esquerda ficam
// apagados, para que o número de verdade se leia de relance.
const ALTURA = 18;

export function ContadorMecanico({ valor }) {
    const n = Math.max(0, Math.floor(Number(valor) || 0));
    const texto = String(n).padStart(Math.max(6, String(n).length), '0');
    const zeros = texto.length - String(n).length;
    return (
        <>
            <span aria-hidden="true" className="inline-flex gap-[2px] rounded-[5px] border border-borda bg-sutil p-[2px]">
                {texto.split('').map((d, i) => (
                    <span
                        key={texto.length - i}
                        className="relative w-[13px] overflow-hidden rounded-[2px] bg-superficie shadow-[inset_0_3px_3px_-2px_rgb(0_0_0/0.14),inset_0_-3px_3px_-2px_rgb(0_0_0/0.14)]"
                        style={{ height: ALTURA }}
                    >
                        <span
                            className={`absolute inset-x-0 top-0 flex flex-col transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${i < zeros ? 'text-tinta-fraca' : 'text-tinta'}`}
                            style={{ transform: `translateY(-${Number(d) * ALTURA}px)`, transitionDelay: `${(texto.length - 1 - i) * 70}ms` }}
                        >
                            {Array.from({ length: 10 }, (_, k) => (
                                <span key={k} className="grid place-items-center text-[11px] font-bold tabular-nums" style={{ height: ALTURA }}>{k}</span>
                            ))}
                        </span>
                    </span>
                ))}
            </span>
            <span className="sr-only">{n.toLocaleString('pt-BR')} páginas</span>
        </>
    );
}
