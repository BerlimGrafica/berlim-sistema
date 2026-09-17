"use client";
import { useState } from 'react';
import Icon from '@/components/Icon';
import { CampoNumerico } from '@/components/calculadoras/CampoNumerico';
import {
    PAPEIS, PREMISSAS_PADRAO, mesclarPremissas,
    custoHoraProdutiva, custoPapelPorA4, custoBoppPorA4, custoSaquinho,
} from '@/lib/calculadoras/bloquinhos';

// O painel de premissas: a aba "Custos" da planilha, editável dentro do
// sistema. É o que a planilha dava de liberdade e a primeira versão desta
// calculadora não dava — os números estavam congelados no código, e a cada
// reajuste de papel alguém teria que me chamar.
//
// Fica fechado por padrão e recolhido num só botão. Quem abre um orçamento
// quer o preço, não quarenta campos; quem vem ajustar custo sabe que veio ajustar.

// Um campo por linha da planilha, declarado como dado. `tipo: 'pct'` guarda
// fração (0,70) e mostra inteiro (70) — ninguém digita "zero vírgula sete"
// para dizer setenta por cento.
const GRUPOS = [
    {
        id: 'maoDeObra',
        titulo: 'Mão de obra',
        icone: 'users',
        campos: [
            { campo: 'funcionarios',   rotulo: 'Funcionários considerados' },
            { campo: 'salarioMedio',   rotulo: 'Salário médio mensal', prefixo: 'R$' },
            { campo: 'encargos',       rotulo: 'Encargos sobre salários', tipo: 'pct' },
            { campo: 'horasMes',       rotulo: 'Horas mensais por pessoa' },
            { campo: 'aproveitamento', rotulo: 'Aproveitamento produtivo', tipo: 'pct' },
        ],
        derivado: (p) => `Custo da hora produtiva: R$ ${custoHoraProdutiva(p).toFixed(2).replace('.', ',')}`,
    },
    {
        id: 'materiais',
        titulo: 'Materiais e consumíveis',
        icone: 'package',
        campos: [
            { campo: 'boppPrecoBobina',          rotulo: 'Bobina BOPP 32cm', prefixo: 'R$' },
            { campo: 'boppMetrosBobina',         rotulo: 'Metros da bobina' },
            { campo: 'boppConsumoPorA4',         rotulo: 'Consumo por A4 (m)' },
            { campo: 'saquinhoPrecoPacote',      rotulo: 'Saquinhos 12x25 — pacote', prefixo: 'R$' },
            { campo: 'saquinhoUnidades',         rotulo: 'Saquinhos no pacote' },
            { campo: 'durexPorUnidade',          rotulo: 'Durex por unidade', prefixo: 'R$' },
            { campo: 'embalagemColetivaMaterial', rotulo: 'Material do pacote coletivo', prefixo: 'R$' },
            { campo: 'blocosPorPacote',          rotulo: 'Bloquinhos por pacote' },
            { campo: 'colaPorBlocoColado',       rotulo: 'Cola por bloco colado', prefixo: 'R$' },
            { campo: 'paranaPorBloco',           rotulo: 'Paraná 1,9mm — par de placas', prefixo: 'R$' },
            { campo: 'impressaoCapaDuraPorBloco', rotulo: 'Impressão externa da capa dura', prefixo: 'R$' },
        ],
        derivado: (p) => `BOPP R$ ${custoBoppPorA4(p).toFixed(4).replace('.', ',')} por face A4 · `
            + `saquinho R$ ${custoSaquinho(p).toFixed(4).replace('.', ',')} cada`,
    },
    {
        id: 'tempos',
        titulo: 'Tempos de produção (minutos)',
        icone: 'clock',
        campos: [
            { campo: 'preparacaoPedido',   rotulo: 'Preparação do pedido' },
            { campo: 'setupImpressao',     rotulo: 'Setup de impressão' },
            { campo: 'setupCorte',         rotulo: 'Setup de corte' },
            { campo: 'setupColado',        rotulo: 'Setup bloco colado' },
            { campo: 'setupEspiral',       rotulo: 'Setup espiral' },
            { campo: 'setupWireO',         rotulo: 'Setup wire-o' },
            { campo: 'setupCapaFlexivel',  rotulo: 'Setup capa flexível' },
            { campo: 'setupCapaDura',      rotulo: 'Setup capa dura' },
            { campo: 'manuseioPorA4',      rotulo: 'Manuseio por A4' },
            { campo: 'laminacaoPorA4',     rotulo: 'Laminação por A4' },
            { campo: 'corteContagemPorBloco', rotulo: 'Corte/contagem por bloco' },
            { campo: 'corteContagemPorFolha', rotulo: 'Corte/contagem por folha' },
            { campo: 'montagemColado',     rotulo: 'Montagem — colado' },
            { campo: 'montagemEspiral',    rotulo: 'Montagem — espiral' },
            { campo: 'montagemWireO',      rotulo: 'Montagem — wire-o' },
            { campo: 'acabamentoCapaDura', rotulo: 'Acabamento capa dura' },
            { campo: 'acabamentoCapaFlexivel', rotulo: 'Acabamento capa flexível' },
            { campo: 'embalagemIndividualPorBloco', rotulo: 'Embalagem individual por bloco' },
            { campo: 'embalagemColetivaPorPacote',  rotulo: 'Embalagem coletiva por pacote' },
        ],
    },
    {
        id: 'precificacao',
        titulo: 'Precificação',
        icone: 'tag',
        campos: [
            { campo: 'custosIndiretos',  rotulo: 'Custos indiretos', tipo: 'pct' },
            { campo: 'margemSobreCusto', rotulo: 'Margem sobre o custo', tipo: 'pct' },
            { campo: 'valorCriacaoArte', rotulo: 'Criação de arte', prefixo: 'R$' },
            { campo: 'arredondamentoPreco', rotulo: 'Arredondar o preço a cada', prefixo: 'R$' },
        ],
        nota: 'A margem é a mesma que aparece na linha do preço, lá em cima — mudar num lugar '
            + 'muda no outro. A criação de arte entra depois dela: é repasse, não produção.',
    },
];

const classeCampo = 'w-full bg-elevado border border-borda-forte rounded px-2.5 py-1.5 text-corpo text-tinta outline-none focus:border-brand transition tabular-nums';

// Os campos daqui sofriam do mesmo defeito do campo de perda: reconstruíam o
// texto a partir do número a cada tecla, o que engolia a vírgula no meio da
// digitação e, nos percentuais, ainda exibia o ponto flutuante cru (0,075 × 100
// virava "7.500000000000001"). Quem cuida disso agora é o CampoNumerico.
function CampoNumero({ rotulo, valor, padrao, prefixo, tipo, aoMudar }) {
    const ehPct = tipo === 'pct';
    const referencia = ehPct ? `${(padrao * 100).toFixed(1).replace('.', ',')}%` : String(padrao).replace('.', ',');
    const mudado = valor !== '' && valor !== undefined && Number(valor) !== padrao;

    return (
        <div>
            <label className="block text-mini font-semibold text-tinta-corpo mb-1 leading-snug">{rotulo}</label>
            <div className="relative">
                {prefixo && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mini text-tinta-suave pointer-events-none">{prefixo}</span>
                )}
                <CampoNumerico
                    pct={ehPct}
                    valor={valor}
                    aoMudar={aoMudar}
                    ariaLabel={rotulo}
                    placeholder={ehPct ? String(Number((padrao * 100).toPrecision(12))) : String(padrao)}
                    className={`${classeCampo} ${prefixo ? 'pl-9' : ''} ${ehPct ? 'pr-7' : ''} ${mudado ? 'border-brand' : ''}`}
                />
                {ehPct && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mini text-tinta-suave pointer-events-none">%</span>}
            </div>
            <p className="text-micro text-tinta-suave mt-0.5">
                {mudado ? `padrão ${referencia}` : 'padrão da planilha'}
            </p>
        </div>
    );
}

export function PremissasBloquinho({ ajustes, aoMudar, aoRestaurar, quantosMudados }) {
    const [aberto, setAberto] = useState(false);
    const [grupoAberto, setGrupoAberto] = useState('maoDeObra');
    const premissas = mesclarPremissas(ajustes);

    const mexer = (grupo, campo, valor) => aoMudar({
        ...ajustes,
        [grupo]: { ...(ajustes[grupo] || {}), [campo]: valor },
    });

    return (
        <div className="rounded-lg border border-borda bg-sutil overflow-hidden">
            <button
                type="button"
                onClick={() => setAberto(a => !a)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-realce transition"
            >
                <Icon name="wrench" className="w-4 h-4 shrink-0 text-tinta-suave" />
                <span className="flex-1 min-w-0">
                    <span className="block text-corpo font-bold text-tinta">Ajustar custos e premissas</span>
                    <span className="block text-mini text-tinta-suave mt-0.5">
                        Salário, papéis, tempos, margens — tudo o que a planilha deixava editar.
                    </span>
                </span>
                {quantosMudados > 0 && (
                    <span className="shrink-0 rounded-full bg-brand/20 text-brand px-2 py-0.5 text-mini font-bold tabular-nums">
                        {quantosMudados} alterado{quantosMudados > 1 ? 's' : ''}
                    </span>
                )}
                <Icon name="chevron-down" className={`w-4 h-4 shrink-0 text-tinta-suave transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`} />
            </button>

            <div className="gaveta" data-aberta={aberto}>
                <div>
                    <div inert={!aberto} className="border-t border-borda px-4 pb-4 pt-3 space-y-2">

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
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {g.campos.map(c => (
                                                        <CampoNumero
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
                                                {g.derivado && (
                                                    <p className="mt-3 pt-2.5 border-t border-borda-fraca text-mini font-semibold text-brand tabular-nums">
                                                        {g.derivado(premissas)}
                                                    </p>
                                                )}
                                                {g.nota && (
                                                    <p className="mt-2 text-mini text-tinta-suave leading-snug">{g.nota}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Papéis: o preço do pacote é o que muda na vida real, e o
                            custo por A4 é derivado dele. Editar o custo por A4
                            direto seria mais rápido e impossível de conferir contra
                            uma nota fiscal. */}
                        <div className="rounded-md border border-borda bg-superficie overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setGrupoAberto(grupoAberto === 'papeis' ? null : 'papeis')}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-realce transition"
                            >
                                <Icon name="file-text" className={`w-4 h-4 shrink-0 ${grupoAberto === 'papeis' ? 'text-brand' : 'text-tinta-suave'}`} />
                                <span className="flex-1 text-corpo font-semibold text-tinta">Preço dos papéis</span>
                                <Icon name="chevron-down" className={`w-4 h-4 shrink-0 text-tinta-suave transition-transform duration-300 ${grupoAberto === 'papeis' ? 'rotate-180' : ''}`} />
                            </button>
                            <div className="gaveta" data-aberta={grupoAberto === 'papeis'}>
                                <div>
                                    <div inert={grupoAberto !== 'papeis'} className="border-t border-borda-fraca p-3 space-y-2">
                                        {PAPEIS.map(papel => {
                                            const valor = ajustes?.papeis?.[papel.nome] ?? '';
                                            const mudado = valor !== '' && Number(valor) !== papel.precoPacote;
                                            return (
                                                <div key={papel.nome} className="flex items-center gap-3">
                                                    <span className="flex-1 min-w-0 text-corpo text-tinta truncate">{papel.nome}</span>
                                                    <span className="shrink-0 text-mini text-tinta-suave tabular-nums hidden sm:inline">
                                                        {papel.folhas} fl. × {papel.rendimentoA4} A4
                                                    </span>
                                                    <div className="relative w-28 shrink-0">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mini text-tinta-suave pointer-events-none">R$</span>
                                                        <CampoNumerico
                                                            valor={valor}
                                                            aoMudar={v => mexer('papeis', papel.nome, v)}
                                                            ariaLabel={`Preço do pacote — ${papel.nome}`}
                                                            placeholder={String(papel.precoPacote)}
                                                            className={`${classeCampo} pl-9 ${mudado ? 'border-brand' : ''}`}
                                                        />
                                                    </div>
                                                    <span className="shrink-0 w-24 text-right text-mini font-semibold text-brand tabular-nums">
                                                        {custoPapelPorA4(papel.nome, premissas).toFixed(4).replace('.', ',')}/A4
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

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
            </div>
        </div>
    );
}
