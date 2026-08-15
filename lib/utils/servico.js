import { formatarMoeda } from './formatters';

// Converte uma linha de pedido_itens/orcamento_itens (valor em centavos,
// produto_id de verdade) de volta pro formato de string que o carrinho do
// modal usa — mesmo padrão de formatarMoeda(String(centavos)) já usado em
// adicionarItemAoCarrinho/salvarEdicaoItemCarrinho.
export function itemDbParaCarrinho(row) {
    return {
        id_temp: 'db_' + row.id,
        id_produto: row.produto_id,
        nome: row.nome,
        descricao: row.descricao,
        valor: formatarMoeda(String(row.valor_centavos)),
        valor_original: row.valor_original_centavos != null ? formatarMoeda(String(row.valor_original_centavos)) : undefined,
        desconto: row.desconto_percentual != null ? String(row.desconto_percentual) : '',
        local_producao: row.local_producao,
        concluido: !!row.concluido,
    };
}

// Converte uma linha de pedido_pagamentos de volta pro formato usado pelo
// formulário de pagamentos do modal da O.S.
export function pagamentoDbParaCarrinho(row) {
    return {
        forma: row.forma,
        valor: formatarMoeda(String(row.valor_centavos)),
        parcelas: row.parcelas,
        instituicao: row.instituicao,
        bandeira: row.bandeira,
        data: row.data,
        vencimento_boleto: row.vencimento_boleto,
        boleto_concluido: row.boleto_concluido,
        lote_id: row.lote_id,
    };
}

// DESTRUTURADOR E RESUMO DE SERVIÇO
export function desconstruirTextoServico(texto) {
    if (!texto) return { itens: [], observacoes: '', pagamentos: [] };

    let partesPagamento = texto.split('\n\n[PAGAMENTOS]\n');
    let textoSemPagamento = partesPagamento[0];
    let pagamentosStr = partesPagamento[1] || '[]';
    let pagamentos = [];
    try { pagamentos = JSON.parse(pagamentosStr); } catch (e) { pagamentos = []; }

    // Se o texto tiver o bloco [ITENS_JSON] (cópia exata dos itens, imune a
    // descrição com linha em branco), usa ele em vez de reconstruir a partir
    // do texto com marcador "• ". Pedidos salvos antes dessa proteção não têm
    // esse bloco — nesse caso cai no parser de texto abaixo.
    let partesItensJson = textoSemPagamento.split('\n\n[ITENS_JSON]\n');
    let textoSemItensJson = partesItensJson[0];
    if (partesItensJson[1]) {
        try {
            const itens = JSON.parse(partesItensJson[1]);
            const partesObs = textoSemItensJson.split('\n\n[OBSERVAÇÕES GERAIS]\n');
            return { itens, observacoes: partesObs[1] || '', pagamentos };
        } catch (e) { /* bloco corrompido, cai no parser de texto abaixo */ }
    }

    let partes = textoSemItensJson.split('\n\n[OBSERVAÇÕES GERAIS]\n');
    let blocoItens = partes[0];
    let obs = partes[1] || '';
    if (!blocoItens.startsWith('• ') && partes.length === 1) return { itens: [], observacoes: textoSemItensJson, pagamentos };

    let itensTraduzidos = [];
    // Agrupa linha a linha em vez de cortar em toda linha em branco: uma
    // descrição de item com parágrafos (linha em branco no meio) não pode
    // partir o item ao meio e vazar pra observações. Cada item começa,
    // inequivocamente, numa linha "• " — só uma nova linha "• " fecha o
    // bloco atual e abre o próximo.
    let blocosIndividuais = [];
    let blocoAtual = null;
    let textoAntesDoPrimeiroItem = [];
    for (let linha of blocoItens.split('\n')) {
        if (linha.startsWith('• ')) {
            if (blocoAtual !== null) blocosIndividuais.push(blocoAtual.join('\n'));
            blocoAtual = [linha];
        } else if (blocoAtual !== null) {
            blocoAtual.push(linha);
        } else {
            textoAntesDoPrimeiroItem.push(linha);
        }
    }
    if (blocoAtual !== null) blocosIndividuais.push(blocoAtual.join('\n'));
    const textoSolto = textoAntesDoPrimeiroItem.join('\n').trim();
    if (textoSolto) obs = obs ? textoSolto + '\n' + obs : textoSolto;

    for (let bloco of blocosIndividuais) {
        let lines = bloco.split('\n');
        if (lines.length < 3) { obs = obs ? obs + '\n' + bloco : bloco; continue; }

        let nomeBruto = lines[0].replace('• ', '').replace('  ', '').trim();
        let id_produto = null;
        let matchId = nomeBruto.match(/^\[#(\d+)\]\s(.*)$/);
        if (matchId) {
            id_produto = parseInt(matchId[1]);
            nomeBruto = matchId[2];
        }
        let nome = nomeBruto;
        let AppValor = '0,00';
        let local_producao = 'Berlim'; // fallback/default
        let descLines = [];
        let concluido = false;

        for (let i = 1; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line.startsWith('Valor: R$ ')) {
                AppValor = line.replace('Valor: R$ ', '');
            } else if (line.startsWith('Local: ')) {
                local_producao = line.replace('Local: ', '');
            } else if (line === '[✓] Concluído') {
                concluido = true;
            } else {
                descLines.push(lines[i].replace(/^  /, ''));
            }
        }

        let descricao = descLines.join('\n').trim();

        let valor = AppValor; let desconto = '';
        let matchDesconto = AppValor.match(/\s\(-(\d+)%\)$/);
        if (matchDesconto) { desconto = matchDesconto[1]; valor = AppValor.replace(matchDesconto[0], '').trim(); }

        itensTraduzidos.push({ id_produto, nome, descricao, valor, desconto, local_producao, concluido, id_temp: Math.random() + Date.now() });
    }
    return { itens: itensTraduzidos, observacoes: obs, pagamentos };
}

// orcamentos_formalizados.descricao usa o mesmo padrão [ITENS_JSON] de
// pedidos.servico (sem [PAGAMENTOS]). Tenta o bloco JSON estruturado primeiro;
// cai no parser de texto legado (desconstruirTextoServico) se o orçamento for
// anterior a essa proteção existir.
export function extrairItensOrcamento(descricao) {
    if (!descricao) return [];
    const match = descricao.match(/\[ITENS_JSON\]\n(.*)/);
    if (match) {
        try { return JSON.parse(match[1]); } catch (e) { /* bloco corrompido, cai no parser de texto abaixo */ }
    }
    return desconstruirTextoServico(descricao).itens;
}

// Uma linha "• Nome\n  descrição\n  Valor: R$ ...\n  Local: ...\n  [✓] Concluído"
// por item — usada tanto pra montar o bloco de itens quanto o [ITENS_JSON].
function linhaItem(i) {
    const strDesconto = i.desconto ? ' (-' + i.desconto + '%)' : '';
    const strNome = i.nome ? '• ' + (i.id_produto ? `[#${i.id_produto}] ` : '') + i.nome : '• Serviço Personalizado';
    const strLocal = i.local_producao ? '\n  Local: ' + i.local_producao : '\n  Local: Berlim';
    const strConcluido = i.concluido ? '\n  [✓] Concluído' : '';
    return strNome + '\n  ' + i.descricao + '\n  Valor: R$ ' + i.valor + strDesconto + strLocal + strConcluido;
}

// Monta o texto completo de pedidos.servico (itens + [OBSERVAÇÕES GERAIS] +
// [PAGAMENTOS]) — inverso de desconstruirTextoServico. Única fonte dessa
// serialização — reaproveitada por salvarOS, salvarOrcamentoFormalizado e
// ItensChecklist, que antes reimplementavam isso cada um por conta própria
// (e um deles esquecia de reemitir [ITENS_JSON], degradando o pedido pro
// parser de texto legado toda vez que um item era marcado concluído).
export function construirTextoServico({ itens, observacoes, pagamentos }) {
    let texto;
    if (itens && itens.length > 0) {
        texto = itens.map(linhaItem).join('\n\n') + '\n\n';
        if (observacoes) texto += '[OBSERVAÇÕES GERAIS]\n' + observacoes;
        texto += '\n\n[ITENS_JSON]\n' + JSON.stringify(itens);
    } else {
        texto = observacoes || '';
    }
    if (pagamentos && pagamentos.length > 0) {
        texto += '\n\n[PAGAMENTOS]\n' + JSON.stringify(pagamentos);
    }
    return texto;
}

export function obterResumoServicos(texto) {
    const desc = desconstruirTextoServico(texto);
    if (desc.itens.length > 0) {
        return desc.itens.map(i => i.nome).join(' + ');
    }
    return texto ? texto.substring(0, 40) + '...' : '---';
}
