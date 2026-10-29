// Os registros guardam o nome da pessoa como texto, não o id: o responsável da
// O.S., quem abriu, quem pediu o material. Trocar o nome no cadastro não muda
// esses textos — e o nome antigo seguia aparecendo, sumia da lista de escolha
// (que vem do cadastro) e a pessoa deixava de ver as próprias tarefas. Aqui a
// troca é levada a todos eles.
//
// `lista`: a coluna pode ter vários nomes separados por vírgula ("Nicole, Bruno").
const CAMPOS = [
    { tabela: 'pedidos', coluna: 'responsavel', lista: true },
    { tabela: 'pedidos', coluna: 'criado_por' },
    { tabela: 'orcamentos_formalizados', coluna: 'criado_por' },
    { tabela: 'tarefas_internas', coluna: 'responsavel', lista: true },
    { tabela: 'tarefas_internas', coluna: 'criado_por' },
    { tabela: 'requisicoes_material', coluna: 'criado_por' },
    { tabela: 'links_pagamento', coluna: 'criado_por' },
];

const chave = (nome) => String(nome || '').trim().toLocaleLowerCase('pt-BR');
// No ilike, % e _ são curingas; um nome com eles casaria com outros textos.
const literal = (texto) => texto.replace(/[\\%_]/g, (c) => '\\' + c);

// "Produção, Bruno" com Produção → Bruno vira "Bruno", sem repetir o nome.
// Devolve null quando o nome antigo não está na lista.
export function trocarNaLista(valor, antigo, novo) {
    let achou = false;
    const vistos = new Set();
    const nomes = [];
    for (const parte of String(valor || '').split(',')) {
        let nome = parte.trim();
        if (chave(nome) === chave(antigo)) { nome = novo; achou = true; }
        if (nome && !vistos.has(chave(nome))) { vistos.add(chave(nome)); nomes.push(nome); }
    }
    return achou ? nomes.join(', ') : null;
}

// Devolve { alterados, erros }. Cada coluna é tratada à parte: uma que falhe
// não impede as outras.
export async function renomearNosRegistros(admin, antigo, novo) {
    let alterados = 0;
    const erros = [];

    for (const { tabela, coluna, lista } of CAMPOS) {
        if (!lista) {
            const { count, error } = await admin.from(tabela)
                .update({ [coluna]: novo }, { count: 'exact' })
                .ilike(coluna, literal(antigo.trim()));
            if (error) erros.push(`${tabela}.${coluna}: ${error.message}`);
            else alterados += count || 0;
            continue;
        }

        // Numa lista o nome vem junto de outros, então cada combinação vira um
        // texto novo. As combinações são poucas: uma atualização por combinação,
        // não por linha. A leitura vai em páginas por causa do teto de 1.000.
        const combinacoes = new Set();
        let erroLeitura = null;
        for (let de = 0; ; de += 1000) {
            const { data, error } = await admin.from(tabela).select(coluna)
                .ilike(coluna, `%${literal(antigo.trim())}%`)
                .order('id').range(de, de + 999);
            if (error) { erroLeitura = error; break; }
            data.forEach((r) => combinacoes.add(r[coluna]));
            if (data.length < 1000) break;
        }
        if (erroLeitura) { erros.push(`${tabela}.${coluna}: ${erroLeitura.message}`); continue; }

        for (const original of combinacoes) {
            const trocado = trocarNaLista(original, antigo, novo);
            if (trocado === null || trocado === original) continue;
            const { count, error } = await admin.from(tabela)
                .update({ [coluna]: trocado }, { count: 'exact' })
                .eq(coluna, original);
            if (error) erros.push(`${tabela}.${coluna}: ${error.message}`);
            else alterados += count || 0;
        }
    }

    return { alterados, erros };
}
