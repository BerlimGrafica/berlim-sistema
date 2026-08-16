"use client";
import { usePedidos } from '@/context/PedidosContext';
import Icon from '@/components/Icon';
import { formatarValorFinanceiro, centavosParaReais } from '@/lib/utils/formatters';

const CORES = ["#2D3349", "#76AB3C", "#3b82f6", "#F37020", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#f43f5e", "#84cc16"];

const LARGURA = 1000;
const ALTURA = 250;
const PAD_X = 70;
const PAD_Y = 20;

export default function VendasPorProdutoPanel({ metricas }) {
    const { produtosSelecionadosGrafico, setProdutosSelecionadosGrafico } = usePedidos();

    const ranking = metricas.ranking_produto;
    const { meses, series } = metricas.serie_produto_mes;

    if (ranking.length === 0) {
        return (
            <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder">
                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Vendas por produto (catálogo)</h3>
                <p className="text-[11px] text-gray-500 italic mt-4">Nenhum produto faturado no período.</p>
            </div>
        );
    }

    const nomes = ranking.map(r => r.rotulo);
    const selecionados = produtosSelecionadosGrafico || nomes.slice(0, 5);
    const todosSelecionados = nomes.length > 0 && nomes.every(n => selecionados.includes(n));
    const maiorDoRanking = Math.max(...ranking.map(r => centavosParaReais(r.centavos)), 1);

    // Série mensal por produto, já somada no banco (12 meses até o mês corrente).
    const porProduto = Object.fromEntries(series.map(s => [s.produto, s.valores.map(centavosParaReais)]));
    const valorEm = (produto, i) => (porProduto[produto] ? porProduto[produto][i] || 0 : 0);

    let maxY = 1;
    selecionados.forEach(p => meses.forEach((_, i) => { if (valorEm(p, i) > maxY) maxY = valorEm(p, i); }));
    const topoY = maxY * 1.1;

    const passoX = (LARGURA - PAD_X * 2) / (meses.length - 1 || 1);
    const coordY = (valor) => ALTURA - PAD_Y - (valor / topoY) * (ALTURA - PAD_Y * 2);

    const alternarProduto = (nome) => {
        const lista = selecionados.includes(nome) ? selecionados.filter(n => n !== nome) : [...selecionados, nome];
        setProdutosSelecionadosGrafico(lista);
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
            <div>
                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Vendas por produto (catálogo)</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">A lista abaixo segue o período escolhido. O gráfico mostra sempre os últimos 12 meses.</p>
            </div>

            <div className="w-full overflow-x-auto bg-white dark:bg-darkCard rounded-xl p-4 border border-gray-100 dark:border-darkBorder mb-2 relative">
                {selecionados.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-[13px] italic font-medium">Nenhum produto selecionado para gerar o gráfico.</div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2 mb-6 justify-center px-4">
                            {selecionados.map((produto, i) => (
                                <span key={produto} className="text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 bg-gray-50 dark:bg-darkElevated border border-gray-100 dark:border-darkBorder dark:text-gray-200">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CORES[i % CORES.length] }}></span>
                                    {produto}
                                </span>
                            ))}
                        </div>
                        <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="w-full h-auto min-w-[700px] overflow-visible">
                            {[0, 0.25, 0.5, 0.75, 1].map(f => {
                                const y = ALTURA - PAD_Y - f * (ALTURA - PAD_Y * 2);
                                return (
                                    <g key={f}>
                                        <line x1={PAD_X} y1={y} x2={LARGURA - PAD_X} y2={y} stroke="currentColor" className="text-gray-200/70 dark:text-gray-800/70" strokeDasharray="3 3" />
                                        <text x={PAD_X - 10} y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                            R$ {formatarValorFinanceiro(f * maxY)}
                                        </text>
                                    </g>
                                );
                            })}
                            {meses.map((mes, i) => {
                                const x = PAD_X + i * passoX;
                                const [ano, m] = mes.split('-');
                                return (
                                    <g key={mes}>
                                        {i > 0 && i < meses.length - 1 && (
                                            <line x1={x} y1={PAD_Y} x2={x} y2={ALTURA - PAD_Y} stroke="currentColor" className="text-gray-200/50 dark:text-gray-800/50" strokeDasharray="2 4" />
                                        )}
                                        <text x={x} y={ALTURA} textAnchor="middle" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                            {m}/{ano.substring(2)}
                                        </text>
                                    </g>
                                );
                            })}
                            {selecionados.map((produto, i) => {
                                const cor = CORES[i % CORES.length];
                                const pontos = meses.map((_, mi) => `${PAD_X + mi * passoX},${coordY(valorEm(produto, mi))}`).join(' ');
                                return (
                                    <g key={produto}>
                                        <polyline points={pontos} fill="none" stroke={cor} strokeWidth="2.5" strokeLinejoin="round" className="drop-shadow-sm transition-all duration-500 ease-out" />
                                        {meses.map((mes, mi) => (
                                            <circle key={mes} cx={PAD_X + mi * passoX} cy={coordY(valorEm(produto, mi))} r="3.5" fill="white" stroke={cor} strokeWidth="2" className="transition-all duration-500 ease-out" />
                                        ))}
                                    </g>
                                );
                            })}
                        </svg>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{selecionados.length} de {nomes.length} produtos selecionados</span>
                <button type="button" onClick={() => setProdutosSelecionadosGrafico(todosSelecionados ? [] : nomes)} className="flex items-center gap-1.5 text-[11px] font-semibold text-brand hover:text-brandHover transition">
                    <Icon name={todosSelecionados ? 'square' : 'check-square'} className="w-3.5 h-3.5" />
                    {todosSelecionados ? 'Remover todos' : 'Selecionar todos'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-3">
                {ranking.map((item) => {
                    const valor = centavosParaReais(item.centavos);
                    const selecionado = selecionados.includes(item.rotulo);
                    const cor = selecionado ? CORES[selecionados.indexOf(item.rotulo) % CORES.length] : 'transparent';
                    return (
                        <button
                            key={item.rotulo}
                            type="button"
                            onClick={() => alternarProduto(item.rotulo)}
                            aria-pressed={selecionado}
                            className={`text-left flex flex-col gap-2 p-3 rounded-lg transition border ${selecionado ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-darkHover shadow-sm' : 'border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkElevated'}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded border border-gray-300 dark:border-gray-600 transition-colors" style={{ backgroundColor: cor, borderColor: selecionado ? cor : '' }}>
                                        {selecionado && <Icon name="check" className="w-3 h-3 text-white" />}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate" title={item.rotulo}>{item.rotulo}</span>
                                </div>
                                <span className="text-right text-[11px] font-black text-gray-900 dark:text-white whitespace-nowrap tabular-nums">R$ {formatarValorFinanceiro(valor)}</span>
                            </div>
                            <span className="w-full bg-gray-200 dark:bg-darkBg rounded-full h-1.5 overflow-hidden relative block">
                                <span className="h-full block transition-all duration-1000 ease-out opacity-90" style={{ width: `${(valor / maiorDoRanking) * 100}%`, backgroundColor: selecionado ? cor : '#9ca3af' }}></span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
