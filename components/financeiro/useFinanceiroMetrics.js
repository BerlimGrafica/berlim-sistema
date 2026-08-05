"use client";
import { centavosParaReais, parseValorMoeda, obterDataAtual, formatarDataExibicao } from '@/lib/utils/formatters';
import { BarRow } from '@/components/financeiro/BarRow';

// Todas as métricas derivadas compartilhadas pelos painéis "Visão Geral" e
// "Vendas por Produto" (o único dado que atravessa os dois é `pedidosFin`).
// Extraído tal como estava no FinanceiroTab.jsx original — sem memoização,
// recalcula a cada render, igual ao comportamento anterior.
export function useFinanceiroMetrics(pedidos, contasPagar, dataFiltroFinInicio, dataFiltroFinFim) {
    const pedidosFin = pedidos.filter(p => {
        if (p.status === 'Cancelado' || p.status === 'Cancelada') return false;
        let match = true;
        if (dataFiltroFinInicio && (!p.data_pedido || p.data_pedido < dataFiltroFinInicio)) match = false;
        if (dataFiltroFinFim && (!p.data_pedido || p.data_pedido > dataFiltroFinFim)) match = false;
        return match;
    });

    // Helper: pedidos.valor_total vem do banco em centavos.
    const valorTotalPedido = (p) => centavosParaReais(p.valor_total);

    // Helper para extrair pagamentos de um pedido
    const obterTotalPagoPedido = (pedido) => {
        const pagamentosStr = pedido.servico && pedido.servico.split('\n\n[PAGAMENTOS]\n')[1];
        if (!pagamentosStr) return 0;
        try {
            const pagamentos = JSON.parse(pagamentosStr);
            return pagamentos.reduce((a, p) => a + parseValorMoeda(p.valor), 0);
        } catch (e) { return 0; }
    };

    const totalBruto = pedidosFin.reduce((acc, p) => acc + valorTotalPedido(p), 0);

    const totalRecebido = pedidosFin.reduce((acc, p) => {
        const pagoStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
        if (pagoStr) return acc + obterTotalPagoPedido(p);
        // Compatibilidade com OS antigas:
        if (p.status === 'Concluído' || p.status === 'Finalizado') return acc + valorTotalPedido(p);
        return acc;
    }, 0);

    const totalAReceber = totalBruto - totalRecebido;
    const ticketMedio = pedidosFin.length > 0 ? (totalBruto / pedidosFin.length) : 0;

    const totalVendasHoje = pedidos.filter(p => p.data_pedido === obterDataAtual() && p.status !== 'Cancelado' && p.status !== 'Cancelada').reduce((acc, p) => acc + valorTotalPedido(p), 0);

    const contasFiltradas = contasPagar.filter(c => {
        let match = true;
        if (dataFiltroFinInicio && (!c.vencimento || c.vencimento < dataFiltroFinInicio)) match = false;
        if (dataFiltroFinFim && (!c.vencimento || c.vencimento > dataFiltroFinFim)) match = false;
        return match;
    });
    const parseValorConta = (c) => centavosParaReais(c.valor);
    const totalDespesas = contasFiltradas.reduce((acc, c) => acc + parseValorConta(c), 0);

    // Cards "Despesas", "Total Recebido" e "Total Bruto" do Resumo do Período sempre
    // olham pro mês corrente, independente do filtro de data selecionado no dashboard.
    const mesAtualStr = obterDataAtual().substring(0, 7); // yyyy-mm
    const totalDespesasMesAtual = contasPagar.filter(c => c.vencimento && c.vencimento.startsWith(mesAtualStr)).reduce((acc, c) => acc + parseValorConta(c), 0);
    const totalRecebidoMesAtual = pedidos
        .filter(p => p.status !== 'Cancelado' && p.status !== 'Cancelada' && p.data_pedido && p.data_pedido.startsWith(mesAtualStr))
        .reduce((acc, p) => {
            const pagoStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
            if (pagoStr) return acc + obterTotalPagoPedido(p);
            if (p.status === 'Concluído' || p.status === 'Finalizado') return acc + valorTotalPedido(p);
            return acc;
        }, 0);
    // "Total Bruto" (nome de exibição definido pelo negócio) = recebido - despesas do mês.
    const totalBrutoMesAtual = totalRecebidoMesAtual - totalDespesasMesAtual;

    const coresCategoriaDespesa = { 'Despesa': 'bg-gray-500', 'Manutenção': 'bg-purple-500', 'Terceirização': 'bg-indigo-500' };
    const agrupadoCategoriaDespesa = contasFiltradas.reduce((acc, c) => {
        const cat = c.categoria || 'Despesa';
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += parseValorConta(c);
        return acc;
    }, {});
    const rankingCategoriaDespesa = Object.entries(agrupadoCategoriaDespesa).sort((a, b) => b[1] - a[1]);
    const maxCategoriaDespesa = Math.max(...rankingCategoriaDespesa.map(c => c[1]), 1);
    const totalCategoriaDespesa = rankingCategoriaDespesa.reduce((a, [, v]) => a + v, 0);

    const totalContasPendentes = contasFiltradas.filter(c => c.status !== 'Pago').reduce((a, c) => a + parseValorConta(c), 0);
    const totalContasPagas = contasFiltradas.filter(c => c.status === 'Pago').reduce((a, c) => a + parseValorConta(c), 0);
    const qtdContasVencidas = contasFiltradas.filter(c => c.status !== 'Pago' && c.vencimento && c.vencimento < obterDataAtual()).length;
    const maxStatusDespesa = Math.max(totalContasPendentes, totalContasPagas, 1);
    const totalStatusDespesa = totalContasPendentes + totalContasPagas;

    const maioresContas = [...contasFiltradas].sort((a, b) => parseValorConta(b) - parseValorConta(a)).slice(0, 8);
    const maxMaiorConta = Math.max(...maioresContas.map(c => parseValorConta(c)), 1);

    const anoAtualStr = new Date().getFullYear().toString();
    const anoAnteriorStr = (new Date().getFullYear() - 1).toString();

    const totalAnoAtual = pedidos.filter(p => p.data_pedido && p.data_pedido.startsWith(anoAtualStr) && p.status !== 'Cancelado' && p.status !== 'Cancelada').reduce((a, b) => a + valorTotalPedido(b), 0);
    const totalAnoAnterior = pedidos.filter(p => p.data_pedido && p.data_pedido.startsWith(anoAnteriorStr) && p.status !== 'Cancelado' && p.status !== 'Cancelada').reduce((a, b) => a + valorTotalPedido(b), 0);
    const crescimentoPercentual = totalAnoAnterior > 0 ? ((totalAnoAtual - totalAnoAnterior) / totalAnoAnterior) * 100 : (totalAnoAtual > 0 ? 100 : 0);

    const agrupadoPorDia = pedidosFin.reduce((acc, p) => {
        if (!p.data_pedido) return acc;
        const dia = p.data_pedido;
        if (!acc[dia]) acc[dia] = { dia, bruto: 0 };
        acc[dia].bruto += valorTotalPedido(p);
        return acc;
    }, {});
    const diasOrdenados = Object.values(agrupadoPorDia).sort((a, b) => b.dia.localeCompare(a.dia)).slice(0, 15);
    const maxBrutoDia = Math.max(...diasOrdenados.map(d => d.bruto), 1);

    const agrupadoPorMesAno = pedidosFin.reduce((acc, p) => {
        if (!p.data_pedido) return acc;
        const mesAno = p.data_pedido.substring(0, 7);
        if (!acc[mesAno]) acc[mesAno] = { mesAno, bruto: 0, recebido: 0 };
        const val = valorTotalPedido(p);
        acc[mesAno].bruto += val;
        if (p.status === 'Concluído' || p.status === 'Finalizado') acc[mesAno].recebido += val;
        return acc;
    }, {});
    const mesesOrdenados = Object.values(agrupadoPorMesAno).sort((a, b) => b.mesAno.localeCompare(a.mesAno)).slice(0, 15);
    const maxBrutoMes = Math.max(...mesesOrdenados.map(m => m.bruto), 1);

    const agrupadoResp = pedidosFin.reduce((acc, p) => {
        if(!p.responsavel) return acc;
        const resps = p.responsavel.split(',').map(s=>s.trim()).filter(Boolean);
        resps.forEach(r => {
            if(!acc[r]) acc[r] = 0;
            acc[r] += valorTotalPedido(p) / resps.length;
        });
        return acc;
    }, {});
    const rankingResp = Object.entries(agrupadoResp).sort((a,b) => b[1] - a[1]);
    const maxResp = Math.max(...rankingResp.map(r => r[1]), 1);

    const agrupadoLocal = pedidosFin.reduce((acc, p) => {
        if(!p.local_producao) return acc;
        const locais = p.local_producao.split(',').map(s=>s.trim()).filter(Boolean);
        locais.forEach(l => {
            if(!acc[l]) acc[l] = 0;
            acc[l] += valorTotalPedido(p) / locais.length;
        });
        return acc;
    }, {});
    const rankingLocal = Object.entries(agrupadoLocal).sort((a,b) => b[1] - a[1]);
    const maxLocal = Math.max(...rankingLocal.map(l => l[1]), 1);

    const colorsRank = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-red-500'];
    const colorsLocal = ['bg-teal-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'];
    const colorsForma = ['bg-amber-500', 'bg-yellow-500', 'bg-orange-500', 'bg-lime-500'];
    const colorsInst = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500'];

    const pagamentosExtraidos = pedidosFin.flatMap(p => {
        const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
        if (!pagamentosStr) return [];
        try {
            return JSON.parse(pagamentosStr).map(pag => ({
                valor: parseValorMoeda(pag.valor),
                forma: pag.forma || 'Indefinido',
                instituicao: pag.instituicao || 'Indefinido'
            }));
        } catch (e) { return []; }
    });

    const agrupadoForma = pagamentosExtraidos.reduce((acc, p) => {
        if (!acc[p.forma]) acc[p.forma] = 0;
        acc[p.forma] += p.valor;
        return acc;
    }, {});
    const rankingForma = Object.entries(agrupadoForma).sort((a,b) => b[1] - a[1]);
    const maxForma = Math.max(...rankingForma.map(f => f[1]), 1);

    const agrupadoInstituicao = pagamentosExtraidos.reduce((acc, p) => {
        if (p.forma === 'PIX' || p.forma === 'Link de Pagamento' || p.forma === 'Boleto') {
            const inst = p.instituicao;
            if (!acc[inst]) acc[inst] = 0;
            acc[inst] += p.valor;
        }
        return acc;
    }, {});
    const rankingInstituicao = Object.entries(agrupadoInstituicao).sort((a,b) => b[1] - a[1]);
    const maxInstituicao = Math.max(...rankingInstituicao.map(i => i[1]), 1);

    // --- CONTEXTUAL DATE NAMES ---
    const anoAtual = new Date().getFullYear();
    const objData = new Date();
    const nomeMesAtualRaw = objData.toLocaleString('pt-BR', { month: 'long' });
    const nomeMesAtual = nomeMesAtualRaw.charAt(0).toUpperCase() + nomeMesAtualRaw.slice(1);
    const diaAtual = formatarDataExibicao(obterDataAtual()).substring(0, 5);

    // --- MÊS ATUAL METRICS (for layers 2, 3, 4) ---
    const mesAtualString = obterDataAtual().substring(0, 7); // yyyy-mm
    const pedidosMesAtual = pedidosFin.filter(p => p.data_pedido && p.data_pedido.startsWith(mesAtualString));

    const agrupadoLocalMesAtual = pedidosMesAtual.reduce((acc, p) => {
        if(!p.local_producao) return acc;
        const locais = p.local_producao.split(',').map(s=>s.trim()).filter(Boolean);
        locais.forEach(l => {
            if(!acc[l]) acc[l] = 0;
            acc[l] += valorTotalPedido(p) / locais.length;
        });
        return acc;
    }, {});
    const rankingLocalMesAtual = Object.entries(agrupadoLocalMesAtual).sort((a,b) => b[1] - a[1]);
    const maxLocalMesAtual = Math.max(...rankingLocalMesAtual.map(l => l[1]), 1);

    const pagamentosExtraidosMesAtual = pedidosMesAtual.flatMap(p => {
        const pagamentosStr = p.servico && p.servico.split('\n\n[PAGAMENTOS]\n')[1];
        if (!pagamentosStr) return [];
        try {
            return JSON.parse(pagamentosStr).map(pag => ({
                valor: parseValorMoeda(pag.valor),
                forma: pag.forma || 'Indefinido',
                instituicao: pag.instituicao || 'Indefinido'
            }));
        } catch (e) { return []; }
    });

    const agrupadoFormaMesAtual = pagamentosExtraidosMesAtual.reduce((acc, p) => {
        if (!acc[p.forma]) acc[p.forma] = 0;
        acc[p.forma] += p.valor;
        return acc;
    }, {});
    const rankingFormaMesAtual = Object.entries(agrupadoFormaMesAtual).sort((a,b) => b[1] - a[1]);
    const maxFormaMesAtual = Math.max(...rankingFormaMesAtual.map(f => f[1]), 1);

    const agrupadoInstituicaoMesAtual = pagamentosExtraidosMesAtual.reduce((acc, p) => {
        if (p.forma === 'PIX' || p.forma === 'Link de Pagamento' || p.forma === 'Boleto') {
            const inst = p.instituicao;
            if (!acc[inst]) acc[inst] = 0;
            acc[inst] += p.valor;
        }
        return acc;
    }, {});
    const rankingInstituicaoMesAtual = Object.entries(agrupadoInstituicaoMesAtual).sort((a,b) => b[1] - a[1]);
    const maxInstituicaoMesAtual = Math.max(...rankingInstituicaoMesAtual.map(i => i[1]), 1);

    const totalLocalMesAtual = rankingLocalMesAtual.reduce((a, [, v]) => a + v, 0);
    const totalFormaMesAtual = rankingFormaMesAtual.reduce((a, [, v]) => a + v, 0);
    const totalInstituicaoMesAtual = rankingInstituicaoMesAtual.reduce((a, [, v]) => a + v, 0);

    const renderLayer2 = () => {
        if (rankingLocalMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum local registrado no mês.</p>;
        return <div className="flex flex-col gap-3">{rankingLocalMesAtual.map((loc, index) => <BarRow key={loc[0]} label={loc[0]} valor={loc[1]} maxVal={maxLocalMesAtual} color={colorsLocal[index % colorsLocal.length]} rank={index + 1} pctTotal={totalLocalMesAtual > 0 ? (loc[1] / totalLocalMesAtual) * 100 : 0} />)}</div>;
    };
    const renderLayer3 = () => {
        if (rankingFormaMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhum pagamento registrado no mês.</p>;
        return <div className="flex flex-col gap-3">{rankingFormaMesAtual.map((f, index) => <BarRow key={f[0]} label={f[0]} valor={f[1]} maxVal={maxFormaMesAtual} color={colorsForma[index % colorsForma.length]} rank={index + 1} pctTotal={totalFormaMesAtual > 0 ? (f[1] / totalFormaMesAtual) * 100 : 0} />)}</div>;
    };
    const renderLayer4 = () => {
        if (rankingInstituicaoMesAtual.length === 0) return <p className="text-[11px] text-gray-500 italic">Nenhuma instituição no mês.</p>;
        return <div className="flex flex-col gap-3">{rankingInstituicaoMesAtual.map((i, index) => <BarRow key={i[0]} label={i[0]} valor={i[1]} maxVal={maxInstituicaoMesAtual} color={colorsInst[index % colorsInst.length]} rank={index + 1} pctTotal={totalInstituicaoMesAtual > 0 ? (i[1] / totalInstituicaoMesAtual) * 100 : 0} />)}</div>;
    };

    // --- ANUAL METRICS ---
    const agrupadoPorAno = pedidosFin.reduce((acc, p) => {
        if (!p.data_pedido) return acc;
        const ano = p.data_pedido.substring(0, 4);
        if (!acc[ano]) acc[ano] = { ano, bruto: 0 };
        acc[ano].bruto += valorTotalPedido(p);
        return acc;
    }, {});
    const anosOrdenados = Object.values(agrupadoPorAno).sort((a, b) => b.ano.localeCompare(a.ano)).slice(0, 15);
    const maxBrutoAno = Math.max(...anosOrdenados.map(a => a.bruto), 1);

    const totalRankingLocal = rankingLocal.reduce((a, [, v]) => a + v, 0);
    const totalRankingForma = rankingForma.reduce((a, [, v]) => a + v, 0);
    const totalRankingInstituicao = rankingInstituicao.reduce((a, [, v]) => a + v, 0);

    return {
        pedidosFin, valorTotalPedido, obterTotalPagoPedido,
        totalBruto, totalRecebido, totalAReceber, ticketMedio, totalVendasHoje,
        contasFiltradas, parseValorConta, totalDespesas,
        totalDespesasMesAtual, totalRecebidoMesAtual, totalBrutoMesAtual,
        coresCategoriaDespesa, agrupadoCategoriaDespesa, rankingCategoriaDespesa, maxCategoriaDespesa, totalCategoriaDespesa,
        totalContasPendentes, totalContasPagas, qtdContasVencidas, maxStatusDespesa, totalStatusDespesa,
        maioresContas, maxMaiorConta,
        totalAnoAtual, totalAnoAnterior, crescimentoPercentual,
        diasOrdenados, maxBrutoDia,
        mesesOrdenados, maxBrutoMes,
        rankingResp, maxResp,
        rankingLocal, maxLocal,
        colorsRank, colorsLocal, colorsForma, colorsInst,
        rankingForma, maxForma,
        rankingInstituicao, maxInstituicao,
        anoAtual, nomeMesAtual, diaAtual,
        renderLayer2, renderLayer3, renderLayer4,
        anosOrdenados, maxBrutoAno,
        totalRankingLocal, totalRankingForma, totalRankingInstituicao,
    };
}
