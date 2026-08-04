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

export function obterResumoServicos(texto) {
    const desc = desconstruirTextoServico(texto);
    if (desc.itens.length > 0) {
        return desc.itens.map(i => i.nome).join(' + ');
    }
    return texto ? texto.substring(0, 40) + '...' : '---';
}
