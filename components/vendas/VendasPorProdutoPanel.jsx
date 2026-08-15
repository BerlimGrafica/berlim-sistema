"use client";
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { formatarValorFinanceiro, centavosParaReais } from '@/lib/utils/formatters';
import { useFinanceiroMetrics } from '@/components/vendas/useFinanceiroMetrics';

export default function VendasPorProdutoPanel() {
    const { pedidos, contasPagar, produtos, produtosSelecionadosGrafico, setProdutosSelecionadosGrafico } = useAppContext();
    const { pedidosFin } = useFinanceiroMetrics(pedidos, contasPagar);

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded-xl border border-gray-200 dark:border-darkBorder flex flex-col gap-4">
            <div>
                <h3 className="font-semibold text-[13px] text-gray-800 dark:text-white uppercase tracking-wider">Vendas por Produto (Catálogo)</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Visão expandida de vendas baseadas nos produtos do sistema.</p>
            </div>
            <div className="flex flex-col gap-3 mt-4">
                {(() => {
                    const agrupadoPorProduto = pedidosFin.reduce((acc, p) => {
                        (p.pedido_itens || []).forEach(item => {
                            const nomeLimpo = (item.nome || '').trim();
                            const valorNum = centavosParaReais(item.valor_centavos);

                            const prod = item.produto_id
                                ? produtos.find(p => String(p.id) === String(item.produto_id))
                                : produtos.find(prod => prod.nome.toLowerCase() === nomeLimpo.toLowerCase());

                            const finalName = prod ? prod.nome : nomeLimpo;
                            if (!acc[finalName]) acc[finalName] = 0;
                            acc[finalName] += valorNum;
                        });
                        return acc;
                    }, {});

                    const rankingProduto = Object.entries(agrupadoPorProduto).sort((a,b) => b[1] - a[1]);
                    const maxProduto = Math.max(...rankingProduto.map(r => r[1]), 1);

                    if (rankingProduto.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum produto do catálogo faturado no período.</p>;

                    const top5Nomes = rankingProduto.slice(0, 5).map(r => r[0]);
                    const selecionadosAtuais = produtosSelecionadosGrafico || top5Nomes;
                    const todosNomes = rankingProduto.map(r => r[0]);
                    const todosSelecionados = todosNomes.length > 0 && todosNomes.every(n => selecionadosAtuais.includes(n));
                    const alternarTodos = () => setProdutosSelecionadosGrafico(todosSelecionados ? [] : todosNomes);

                    const mesesGrafico = [];
                    const dataAtualGrafico = new Date();
                    for (let i = 11; i >= 0; i--) {
                        const d = new Date(dataAtualGrafico.getFullYear(), dataAtualGrafico.getMonth() - i, 1);
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const y = d.getFullYear();
                        mesesGrafico.push(`${y}-${m}`);
                    }

                    const limiteData = mesesGrafico[0] + '-01';
                    const dadosMesProduto = {};
                    selecionadosAtuais.forEach(prod => {
                        dadosMesProduto[prod] = {};
                        mesesGrafico.forEach(m => dadosMesProduto[prod][m] = 0);
                    });

                    pedidos.forEach(p => {
                        if (!p.data_pedido || p.data_pedido < limiteData) return;
                        if (p.status === 'Cancelado') return;

                        const mesAno = p.data_pedido.substring(0, 7);
                        if (!mesesGrafico.includes(mesAno)) return;

                        (p.pedido_itens || []).forEach(item => {
                            const nomeLimpo = (item.nome || '').trim();
                            const prod = item.produto_id ? produtos.find(pr => String(pr.id) === String(item.produto_id)) : produtos.find(pr => pr.nome.toLowerCase() === nomeLimpo.toLowerCase());
                            const finalName = prod ? prod.nome : nomeLimpo;

                            if (selecionadosAtuais.includes(finalName)) {
                                const valorNum = centavosParaReais(item.valor_centavos);
                                dadosMesProduto[finalName][mesAno] += valorNum;
                            }
                        });
                    });

                    let maxYGrafico = 1;
                    selecionadosAtuais.forEach(prod => {
                        mesesGrafico.forEach(m => {
                            if (dadosMesProduto[prod][m] > maxYGrafico) maxYGrafico = dadosMesProduto[prod][m];
                        });
                    });
                    maxYGrafico = maxYGrafico * 1.1;

                    const svgWidth = 1000;
                    const svgHeight = 250;
                    const padX = 70;
                    const padY = 20;
                    const stepX = (svgWidth - padX * 2) / (mesesGrafico.length - 1 || 1);
                    const hexColors = ["#2D3349", "#76AB3C", "#3b82f6", "#F37020", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#f43f5e", "#84cc16"];

                    const renderSVG = () => (
                        <div className="w-full overflow-x-auto bg-white dark:bg-darkCard rounded-xl p-4 border border-gray-100 dark:border-darkBorder mb-6 relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                            {selecionadosAtuais.length > 0 ? (
                                <>
                                    <div className="flex flex-wrap gap-2 mb-6 justify-center px-4">
                                        {selecionadosAtuais.map((prod, i) => (
                                            <span key={prod} className="text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 bg-gray-50 dark:bg-darkElevated border border-gray-100 dark:border-darkBorder dark:text-gray-200">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hexColors[i % hexColors.length] }}></span>
                                                {prod}
                                            </span>
                                        ))}
                                    </div>
                                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[700px] overflow-visible">
                                        {[0, 0.25, 0.5, 0.75, 1].map(f => {
                                            const y = svgHeight - padY - f * (svgHeight - padY * 2);
                                            return (
                                                <g key={f}>
                                                    <line x1={padX} y1={y} x2={svgWidth - padX} y2={y} stroke="currentColor" className="text-gray-200/70 dark:text-gray-800/70" strokeDasharray="3 3" />
                                                    <text x={padX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                                        R$ {formatarValorFinanceiro(f * (maxYGrafico / 1.1))}
                                                    </text>
                                                </g>
                                            )
                                        })}
                                        {mesesGrafico.map((m, i) => {
                                            const x = padX + i * stepX;
                                            const [ano, mes] = m.split('-');
                                            return (
                                                <g key={m}>
                                                    {i > 0 && i < mesesGrafico.length - 1 && (
                                                        <line x1={x} y1={padY} x2={x} y2={svgHeight - padY} stroke="currentColor" className="text-gray-200/50 dark:text-gray-800/50" strokeDasharray="2 4" />
                                                    )}
                                                    <text x={x} y={svgHeight} textAnchor="middle" fontSize="11" fill="currentColor" className="text-gray-400 dark:text-gray-500 font-semibold">
                                                        {mes}/{ano.substring(2)}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        {selecionadosAtuais.map((prod, i) => {
                                            const color = hexColors[i % hexColors.length];
                                            const points = mesesGrafico.map((m, mi) => {
                                                const x = padX + mi * stepX;
                                                const val = dadosMesProduto[prod][m] || 0;
                                                const y = svgHeight - padY - (val / maxYGrafico) * (svgHeight - padY * 2);
                                                return `${x},${y}`;
                                            }).join(" ");
                                            return (
                                                <g key={prod}>
                                                    <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" className="drop-shadow-sm transition-all duration-500 ease-out" />
                                                    {mesesGrafico.map((m, mi) => {
                                                        const x = padX + mi * stepX;
                                                        const val = dadosMesProduto[prod][m] || 0;
                                                        const y = svgHeight - padY - (val / maxYGrafico) * (svgHeight - padY * 2);
                                                        return <circle key={m} cx={x} cy={y} r="3.5" fill="white" stroke={color} strokeWidth="2" className="transition-all duration-500 ease-out" />;
                                                    })}
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-[13px] italic font-medium">Nenhum produto selecionado para gerar o gráfico.</div>
                            )}
                        </div>
                    );

                    const toggleProduto = (nome) => {
                        let list = [...selecionadosAtuais];
                        if (list.includes(nome)) {
                            list = list.filter(n => n !== nome);
                        } else {
                            list.push(nome);
                        }
                        setProdutosSelecionadosGrafico(list);
                    };

                    return (
                        <>
                            {renderSVG()}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{selecionadosAtuais.length} de {todosNomes.length} produtos selecionados</span>
                                <button type="button" onClick={alternarTodos} className="flex items-center gap-1.5 text-[11px] font-semibold text-brand hover:text-brandHover transition">
                                    <Icon name={todosSelecionados ? 'square' : 'check-square'} className="w-3.5 h-3.5" />
                                    {todosSelecionados ? 'Remover todos' : 'Selecionar todos'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-3">
                                {rankingProduto.map((r, index) => {
                                    const isSelected = selecionadosAtuais.includes(r[0]);
                                    const selectedIndex = selecionadosAtuais.indexOf(r[0]);
                                    const colorIndicator = isSelected ? hexColors[selectedIndex % hexColors.length] : 'transparent';

                                    return (
                                        <div key={index} onClick={() => toggleProduto(r[0])} className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer transition border ${isSelected ? 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-darkHover shadow-sm' : 'border-gray-100 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-darkElevated'}`}>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded border border-gray-300 dark:border-gray-600 transition-colors" style={{ backgroundColor: colorIndicator, borderColor: isSelected ? colorIndicator : '' }}>
                                                        {isSelected && <Icon name="check" className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate" title={r[0]}>{r[0]}</div>
                                                </div>
                                                <div className="text-right text-[11px] font-black text-gray-900 dark:text-white whitespace-nowrap">R$ {formatarValorFinanceiro(r[1])}</div>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-darkBg rounded-full h-1.5 overflow-hidden relative">
                                                <div className={`h-full transition-all duration-1000 ease-out opacity-90`} style={{ width: `${(r[1] / maxProduto) * 100}%`, backgroundColor: isSelected ? colorIndicator : '#9ca3af' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
}
