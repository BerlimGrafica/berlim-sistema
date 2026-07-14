const fs = require('fs');

const contextContent = fs.readFileSync('context/AppContext.jsx', 'utf8');

const missingExports = [
  'carregarDados', 'fetchHistorico', 'fetchProblemas', 'fetchClientesCadastrados',
  'atualizarCampoInline', 'fecharModalOS', 'abrirEdicao', 'abrirEdicaoProduto',
  'abrirEdicaoCliente', 'abrirEdicaoUsuario', 'salvarUsuario', 'adicionarItemAoCarrinho',
  'removerItemDoCarrinho', 'salvarOS', 'salvarOrcamentoPre', 'excluirOrcamentoPre',
  'salvarOrcamentoFormalizado', 'baixarPDFOrcamento', 'extrairItensOrcamento',
  'abrirEdicaoOrcamento', 'transformarEmOS', 'excluirOrcamentoFormalizado',
  'salvarProduto', 'salvarConta', 'salvarEmpresaFaturamento', 'excluirEmpresaFaturamento',
  'excluirConta', 'excluirProduto', 'handleDragStartProduto', 'handleDropProduto', 'salvarCliente',
  'salvarNotaFiscal', 'concluirNotaFiscal', 'imprimirOS', 'excluirUsuario'
];

let newContextContent = contextContent.replace(/renderBarHorizontal\n    \};/, 'renderBarHorizontal,\n        ' + missingExports.join(',\n        ') + '\n    };');

fs.writeFileSync('context/AppContext.jsx', newContextContent);
console.log("Updated AppContext.jsx exports.");
