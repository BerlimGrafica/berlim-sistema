"use client";
import { useState } from 'react';
import Icon from '@/components/Icon';
import { CampoNumerico } from '@/components/calculadoras/CampoNumerico';
import { PREMISSAS_PADRAO, mesclarPremissas } from '@/lib/calculadoras/hotmelt';

// As células amarelas da aba "Tabela Hot Melt", editáveis dentro do sistema.
// Mesma estrutura do painel de bloquinhos: mora na coluna lateral, com um grupo
// aberto por vez e cada campo mostrando o valor da planilha embaixo.

const classeCampo = 'w-full bg-elevado border border-borda-forte rounded px-2.5 py-1.5 text-corpo text-tinta outline-none focus:border-brand transition tabular-nums';

// `tipo: 'pct'` guarda fração (0,075) e mostra inteiro (7,5) — ninguém digita
// "zero vírgula zero setenta e cinco" para dizer sete e meio por cento.
const GRUPOS = [
    {
        id: 'parametros',
        titulo: 'Preços fixos',
        icone: 'dollar-sign',
        campos: [
            { campo: 'capaColoridaPorLivro', rotulo: 'Capa colorida por livro', prefixo: 'R$' },
            { campo: 'laminacaoPorFace',     rotulo: 'Laminação por face', prefixo: 'R$' },
            { campo: 'minimoLaminacao',      rotulo: 'Mínimo de laminação', prefixo: 'R$' },
            { campo: 'provaFisica',          rotulo: 'Prova física completa', prefixo: 'R$' },
            { campo: 'minimoLoteHotMelt',    rotulo: 'Mínimo do lote Hot Melt', prefixo: 'R$' },
        ],
        nota: 'O mínimo do lote é o que sustenta um pedido de uma ou duas unidades: abrir a '
            + 'máquina custa o mesmo para um livro e para cinquenta.',
    },
    {
        id: 'formatos',
        titulo: 'Páginas por face A4',
        icone: 'file-text',
        campos: [
            { campo: 'A4', rotulo: 'Formato A4' },
            { campo: 'A5', rotulo: 'Formato A5' },
            { campo: 'A6', rotulo: 'Formato A6' },
        ],
        nota: 'Quantas páginas do livro cabem numa face de A4. É o que transforma páginas em '
            + 'folhas impressas.',
    },
    {
        id: 'outrosPapeis',
        titulo: 'Preço por face — por papel',
        icone: 'file-text',
        campos: [
            { campo: 'Offset 90g',  rotulo: 'Offset 90g', prefixo: 'R$' },
            { campo: 'Offset 120g', rotulo: 'Offset 120g', prefixo: 'R$' },
            { campo: 'Couchê 115g', rotulo: 'Couchê 115g', prefixo: 'R$' },
        ],
        nota: 'Preço único: nestes papéis a impressão custa o mesmo em P&B e em cores, e não '
            + 'tem desconto por volume. O offset 75g é a exceção — tem os dois preços e as '
            + 'quatro faixas, nos dois grupos abaixo.',
    },
    {
        id: 'impressaoPB',
        titulo: 'Offset 75g — P&B por faixa',
        icone: 'printer',
        campos: [
            { campo: '1',    rotulo: 'a partir de 1 face', prefixo: 'R$' },
            { campo: '501',  rotulo: 'a partir de 501', prefixo: 'R$' },
            { campo: '1001', rotulo: 'a partir de 1.001', prefixo: 'R$' },
            { campo: '2501', rotulo: 'a partir de 2.501', prefixo: 'R$' },
        ],
    },
    {
        id: 'impressaoColor',
        titulo: 'Offset 75g — colorido por faixa',
        icone: 'image',
        campos: [
            { campo: '1',    rotulo: 'a partir de 1 face', prefixo: 'R$' },
            { campo: '501',  rotulo: 'a partir de 501', prefixo: 'R$' },
            { campo: '1001', rotulo: 'a partir de 1.001', prefixo: 'R$' },
            { campo: '2501', rotulo: 'a partir de 2.501', prefixo: 'R$' },
        ],
        nota: 'A faixa é escolhida pelo total de faces do PEDIDO, e P&B e colorido contam '
            + 'separado — cada um cai na sua própria faixa.',
    },
    {
        id: 'hotMeltPorLivro',
        titulo: 'Hot Melt por livro',
        icone: 'layers',
        campos: [
            { campo: '1',  rotulo: '1 unidade', prefixo: 'R$' },
            { campo: '2',  rotulo: '2 unidades', prefixo: 'R$' },
            { campo: '3',  rotulo: '3 a 4', prefixo: 'R$' },
            { campo: '5',  rotulo: '5 a 9', prefixo: 'R$' },
            { campo: '10', rotulo: '10 a 24', prefixo: 'R$' },
            { campo: '25', rotulo: '25 a 49', prefixo: 'R$' },
            { campo: '50', rotulo: '50 ou mais', prefixo: 'R$' },
        ],
        nota: 'Esta faixa é escolhida pela quantidade de LIVROS, e o preço é por livro.',
    },
    {
        id: 'prazos',
        titulo: 'Multiplicador de prazo',
        icone: 'clock',
        campos: [
            { campo: '4 dias úteis',   rotulo: '4 dias úteis', tipo: 'mult' },
            { campo: '2–3 dias úteis', rotulo: '2 a 3 dias úteis', tipo: 'mult' },
            { campo: '1 dia útil',     rotulo: '1 dia útil', tipo: 'mult' },
            { campo: 'Mesmo dia',      rotulo: 'Mesmo dia', tipo: 'mult' },
        ],
        nota: 'Multiplica o subtotal da produção. A prova física fica de fora: ela entra depois, '
            + 'em valor cheio.',
    },
];

function CampoPremissa({ rotulo, valor, padrao, prefixo, tipo, aoMudar }) {
    const ehMult = tipo === 'mult';
    const mudado = valor !== '' && valor !== undefined && Number(valor) !== padrao;
    const referencia = ehMult
        ? `${padrao.toFixed(4).replace('.', ',')}×`
        : String(Number(padrao.toPrecision(12))).replace('.', ',');
    // O multiplicador é mais fácil de ler como acréscimo do que como fator:
    // "+11,1%" diz o que acontece, "1,1111×" pede uma conta de cabeça.
    const acrescimo = ehMult ? (Number(valor === '' || valor === undefined ? padrao : valor) - 1) * 100 : null;

    return (
        <div>
            <label className="block text-mini font-semibold text-tinta-corpo mb-1 leading-snug">{rotulo}</label>
            <div className="relative">
                {prefixo && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mini text-tinta-suave pointer-events-none">{prefixo}</span>
                )}
                <CampoNumerico
                    valor={valor}
                    aoMudar={aoMudar}
                    ariaLabel={rotulo}
                    placeholder={String(Number(padrao.toPrecision(12)))}
                    className={`${classeCampo} ${prefixo ? 'pl-9' : ''} ${mudado ? 'border-brand' : ''}`}
                />
            </div>
            <p className="text-micro text-tinta-suave mt-0.5">
                {ehMult
                    ? `${acrescimo >= 0 ? '+' : ''}${acrescimo.toFixed(1).replace('.', ',')}% sobre a produção`
                    : (mudado ? `padrão ${referencia}` : 'padrão da planilha')}
            </p>
        </div>
    );
}

export function PremissasHotmelt({ ajustes, aoMudar, aoRestaurar, quantosMudados }) {
    const [grupoAberto, setGrupoAberto] = useState('parametros');

    const mexer = (grupo, campo, valor) => aoMudar({
        ...ajustes,
        [grupo]: { ...(ajustes[grupo] || {}), [campo]: valor },
    });

    return (
        <div className="rounded-lg border border-borda bg-sutil overflow-hidden">
            {/* Sem botão-mestre: este painel agora mora na coluna lateral, ao
                lado dos números que ele mexe. Escondê-lo atrás de um clique
                fazia sentido quando ele ficava no fim de uma página longa e
                interrompia a leitura; ao lado, ele é a bancada de trabalho. */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-borda">
                <Icon name="wrench" className="w-4 h-4 shrink-0 text-tinta-suave" />
                <span className="flex-1 min-w-0">
                    <span className="block text-corpo font-bold text-tinta">Tabela de preços</span>
                    <span className="block text-mini text-tinta-suave mt-0.5">Impressão, papéis, hot melt e prazos.</span>
                </span>
                {quantosMudados > 0 && (
                    <span className="shrink-0 rounded-full bg-brand/20 text-brand px-2 py-0.5 text-mini font-bold tabular-nums">
                        {quantosMudados}
                    </span>
                )}
            </div>

            <div className="p-3 space-y-2">
                {GRUPOS.map(g => {
                    const escancarado = grupoAberto === g.id;
                    return (
                        <div key={g.id} className="rounded-md border border-borda bg-superficie overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setGrupoAberto(escancarado ? null : g.id)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-realce transition"
                            >
                                <Icon name={g.icone} className={`w-4 h-4 shrink-0 ${escancarado ? 'text-brand' : 'text-tinta-suave'}`} />
                                <span className="flex-1 text-corpo font-semibold text-tinta">{g.titulo}</span>
                                <Icon name="chevron-down" className={`w-4 h-4 shrink-0 text-tinta-suave transition-transform duration-300 ${escancarado ? 'rotate-180' : ''}`} />
                            </button>
                            <div className="gaveta" data-aberta={escancarado}>
                                <div>
                                    <div inert={!escancarado} className="border-t border-borda-fraca p-3">
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {g.campos.map(c => (
                                                <CampoPremissa
                                                    key={c.campo}
                                                    rotulo={c.rotulo}
                                                    prefixo={c.prefixo}
                                                    tipo={c.tipo}
                                                    padrao={PREMISSAS_PADRAO[g.id][c.campo]}
                                                    valor={ajustes?.[g.id]?.[c.campo] ?? ''}
                                                    aoMudar={(v) => mexer(g.id, c.campo, v)}
                                                />
                                            ))}
                                        </div>
                                        {g.nota && (
                                            <p className="mt-3 pt-2.5 border-t border-borda-fraca text-mini text-tinta-suave leading-snug">{g.nota}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className="text-mini text-tinta-suave">
                        Os ajustes ficam salvos <strong className="font-semibold text-tinta-corpo">neste navegador</strong> — não valem para os outros computadores da gráfica.
                    </p>
                    <button
                        type="button"
                        onClick={aoRestaurar}
                        disabled={quantosMudados === 0}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-borda-forte bg-elevado px-3 py-1.5 text-mini font-semibold text-tinta-corpo hover:border-brand hover:text-brand transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-borda-forte disabled:hover:text-tinta-corpo"
                    >
                        <Icon name="rotate-ccw" className="w-3.5 h-3.5" />
                        Voltar aos valores da planilha
                    </button>
                </div>
            </div>
        </div>
    );
}
