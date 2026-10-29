"use client";
import { useState } from 'react';
import Icon from '@/components/Icon';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

// Montagem na folha: o desenho de como os adesivos cabem na folha, como a
// imposição de uma gráfica — linha de corte, sangria e as medidas da área útil.
// Usa a mesma conta da calculadora (0,2 cm de sangria somados à peça, peça em
// pé) e começa na folha que o preço está usando para a quantidade digitada.
//
// É um painel à parte, ao lado da caixa da calculadora, e não um bloco dentro
// dela: a caixa segue igual, e o desenho é consulta, não parte da conta.
//
// A linha de corte é magenta porque é assim que a faca aparece num arquivo de
// gráfica; fica só no desenho, nunca em texto.
export const FOLHAS = {
    sra3: { rotulo: 'SRA3', nome: 'folha SRA3', w: 26, h: 39 },
    meio: { rotulo: 'Meio metro', nome: 'meio metro', w: 44, h: 94 },
    metro: { rotulo: 'Metro', nome: 'metro', w: 94, h: 94 },
};
const SANGRIA = 0.2;
const COR_FACA = '#EC008C';
const cabem = (folha, l, a) => Math.floor(folha.w / l) * Math.floor(folha.h / a);
const fmt = (n) => n.toLocaleString('pt-BR');

// A mesma escolha do preço: a menor folha em que a quantidade inteira cabe.
export function folhaDoPreco(largura, altura, quantidade) {
    const l = largura + SANGRIA, a = altura + SANGRIA;
    if (quantidade > 0 && quantidade <= cabem(FOLHAS.sra3, l, a)) return 'sra3';
    if (quantidade > 0 && quantidade <= cabem(FOLHAS.meio, l, a)) return 'meio';
    return 'metro';
}

const PAINEL = 'bg-superficie p-6 rounded border border-borda flex flex-col gap-4';

function Titulo() {
    return (
        <p className="text-corpo font-semibold text-tinta flex items-center gap-2">
            <Icon name="layers" className="w-4 h-4 text-tinta-suave" />
            Montagem na folha
        </p>
    );
}

export function MontagemNaFolha({ largura, altura, quantidade }) {
    const valido = largura > 0 && altura > 0;
    const doPreco = valido ? folhaDoPreco(largura, altura, quantidade) : 'sra3';
    // A folha escolhida à mão vale até as medidas mudarem; aí volta para a do preço.
    const chave = `${largura}x${altura}x${quantidade}`;
    const [escolha, setEscolha] = useState({ chave: '', folha: null });
    const folhaId = escolha.chave === chave && escolha.folha ? escolha.folha : doPreco;
    const folha = FOLHAS[folhaId];

    if (!valido) {
        return (
            <section className={PAINEL}>
                <Titulo />
                <p className="rounded-lg border border-dashed border-borda bg-sutil px-4 py-8 text-mini text-tinta-suave text-center">
                    Preencha largura e altura para ver como os adesivos ficam montados na folha.
                </p>
            </section>
        );
    }

    const l = largura + SANGRIA, a = altura + SANGRIA;
    const cols = Math.floor(folha.w / l), lins = Math.floor(folha.h / a), n = cols * lins;
    const deitado = cabem(folha, altura + SANGRIA, largura + SANGRIA);
    const metros = folhaId === 'metro' && n > 0 && quantidade > 0 ? quantidade / n : null;

    // Desenho em escala, com espaço em cima e à direita para as cotas.
    const esc = Math.min(300 / folha.w, 300 / folha.h);
    const W = folha.w * esc, H = folha.h * esc, X = 4, Y = 24;
    const largSvg = X + W + 30, altSvg = Y + H + 4;
    const pw = l * esc, ph = a * esc, mx = X + (W - cols * pw) / 2, my = Y + (H - lins * ph) / 2;
    const miudo = pw < 9 || ph < 9, s = (SANGRIA / 2) * esc;
    const pecas = [];
    for (let c = 0; c < cols; c++) for (let r = 0; r < lins; r++) pecas.push([mx + c * pw, my + r * ph]);
    const cx = X + W + 16;

    return (
        <section className={PAINEL}>
            <Titulo />
            <SegmentedControl
                className="w-full"
                value={folhaId}
                onChange={(f) => setEscolha({ chave, folha: f })}
                options={Object.entries(FOLHAS).map(([value, f]) => ({ value, label: f.rotulo }))}
            />

            <div className="grid place-items-center rounded-lg bg-sutil border border-borda-fraca p-3 min-w-0">
                <svg
                    viewBox={`0 0 ${largSvg} ${altSvg}`}
                    width={largSvg}
                    height={altSvg}
                    className="max-w-full h-auto"
                    role="img"
                    aria-label={`${fmt(n)} adesivos de ${fmt(largura)} por ${fmt(altura)} centímetros montados na ${folha.nome}, área útil de ${folha.w} por ${folha.h} centímetros`}
                >
                    <rect x={X + 0.5} y={Y + 0.5} width={W - 1} height={H - 1} rx="1.5" className="fill-superficie stroke-borda-forte" />
                    {pecas.map(([px, py], i) => (
                        <g key={i}>
                            <rect x={px} y={py} width={pw} height={ph} fill={COR_FACA} fillOpacity="0.1" />
                            <rect
                                x={px + s} y={py + s} width={pw - 2 * s} height={ph - 2 * s} rx={miudo ? 0 : 1.5}
                                className="fill-superficie" stroke={COR_FACA} strokeWidth={miudo ? 0.5 : 1}
                                strokeDasharray={miudo ? undefined : '3 2'}
                            />
                        </g>
                    ))}
                    {n === 0 && (
                        <text x={X + W / 2} y={Y + H / 2} textAnchor="middle" className="fill-tinta-suave text-[11px] font-semibold">Não cabe nesta folha</text>
                    )}
                    <g className="stroke-tinta-suave" fill="none">
                        <path d={`M${X + 0.5} 8v10M${X + W - 0.5} 8v10M${X + 0.5} 13H${X + W / 2 - 22}M${X + W / 2 + 22} 13H${X + W - 0.5}`} />
                        <path d={`M${cx - 5} ${Y + 0.5}h10M${cx - 5} ${Y + H - 0.5}h10M${cx} ${Y + 0.5}V${Y + H / 2 - 22}M${cx} ${Y + H / 2 + 22}V${Y + H - 0.5}`} />
                    </g>
                    <text x={X + W / 2} y="16.5" textAnchor="middle" className="fill-tinta-suave text-[10px] font-semibold">{folha.w} cm</text>
                    <text x={cx} y={Y + H / 2 + 3.5} textAnchor="middle" transform={`rotate(90 ${cx} ${Y + H / 2})`} className="fill-tinta-suave text-[10px] font-semibold">{folha.h} cm</text>
                </svg>
            </div>

            <div className="flex items-end gap-3">
                <p className="text-3xl font-black text-tinta tabular-nums leading-none">{fmt(n)}</p>
                <p className="text-mini text-tinta-suave pb-0.5">por {folha.nome} · área útil {folha.w} × {folha.h} cm</p>
            </div>
            {folhaId === doPreco && quantidade > 0 && (
                <p className="text-mini text-tinta-corpo flex items-start gap-1.5">
                    <Icon name="check" className="w-3.5 h-3.5 mt-0.5 shrink-0 text-sucesso" />
                    {metros ? `É a folha do preço: ${fmt(quantidade)} adesivos ocupam ${metros.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m.` : `É a folha que o preço usa para ${fmt(quantidade)} adesivos.`}
                </p>
            )}
            {deitado > n && (
                <p className="text-mini text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                    <Icon name="rotate-ccw" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Deitado cabem {fmt(deitado)}. O preço continua contando em pé.
                </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3 border-t border-borda-fraca text-mini text-tinta-suave">
                <span className="flex items-center gap-2"><i className="inline-block w-4 h-2.5 rounded-sm" style={{ background: 'rgba(236,0,140,.1)', boxShadow: `inset 0 0 0 1px ${COR_FACA}` }} />Sangria de 0,2 cm</span>
                <span className="flex items-center gap-2"><i className="inline-block w-4 h-px" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${COR_FACA} 0 3px, transparent 3px 5px)`, height: 2 }} />Linha de corte</span>
            </div>
        </section>
    );
}
