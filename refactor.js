
const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Add pagamentosPedido to state
code = code.replace(
    'const [novoPedido, setNovoPedido] = useState({',
    'const [pagamentosPedido, setPagamentosPedido] = useState([]);\n    const [novoPagamento, setNovoPagamento] = useState({ valor: \\, forma: \PIX\, parcelas: 1 });\n    const [novoPedido, setNovoPedido] = useState({'
);

// 2. Modify fecharModalOS
code = code.replace(
    \setItensPedido([]); \,
    \setItensPedido([]);\n        setPagamentosPedido([]);\n        setNovoPagamento({ valor: '', forma: 'PIX', parcelas: 1 });\
);

// 3. Modify abrirEdicao
code = code.replace(
    \setItensPedido(dadosDesconstruidos.itens); \,
    \setItensPedido(dadosDesconstruidos.itens);\n        setPagamentosPedido(dadosDesconstruidos.pagamentos || []);\
);

// 4. Modify desconstruirTextoServico
const targetDesconstruir = \unction desconstruirTextoServico(texto) {
    if (!texto) return { itens: [], observacoes: '' };
    let partes = texto.split('\\n\\n[OBSERVAÇÕES GERAIS]\\n');\;
const replacementDesconstruir = \unction desconstruirTextoServico(texto) {
    if (!texto) return { itens: [], observacoes: '', pagamentos: [] };
    
    let partesPagamento = texto.split('\\n\\n[PAGAMENTOS]\\n');
    let textoSemPagamento = partesPagamento[0];
    let pagamentosStr = partesPagamento[1] || '[]';
    let pagamentos = [];
    try { pagamentos = JSON.parse(pagamentosStr); } catch (e) { pagamentos = []; }

    let partes = textoSemPagamento.split('\\n\\n[OBSERVAÇÕES GERAIS]\\n');\;

code = code.replace(targetDesconstruir, replacementDesconstruir);

code = code.replace(
    \if (!blocoItens.startsWith('• ') && partes.length === 1) return { itens: [], observacoes: texto };\,
    \if (!blocoItens.startsWith('• ') && partes.length === 1) return { itens: [], observacoes: textoSemPagamento, pagamentos };\
);

code = code.replace(
    \eturn { itens: itensTraduzidos, observacoes: obs };\,
    \eturn { itens: itensTraduzidos, observacoes: obs, pagamentos };\
);

fs.writeFileSync('app.js', code, 'utf8');
console.log('Script run successfully.');
