const fs = require('fs');

const tabContent = fs.readFileSync('components/CadastrosTab.jsx', 'utf8');

let p = fs.readFileSync('produtos_block.jsx', 'utf8');
let u = fs.readFileSync('usuarios_block.jsx', 'utf8');
let f = fs.readFileSync('fornecedores_block.jsx', 'utf8');

// Fix encoding issues
const fixEncoding = (str) => {
    return str
        .replace(/Catǭlogo/g, 'Catálogo')
        .replace(/servios/g, 'serviços')
        .replace(/preos/g, 'preços')
        .replace(/oramentos/g, 'orçamentos')
        .replace(/Descriǜo/g, 'Descrição')
        .replace(/Preo/g, 'Preço')
        .replace(/Usuǭrios/g, 'Usuários')
        .replace(/Usuǭrio/g, 'Usuário')
        .replace(/Produǜo/g, 'Produção')
        .replace(/Nvel/g, 'Nível')
        .replace(/Observaes/g, 'Observações')
        .replace(/Aes/g, 'Ações')
        .replace(/produǜo/g, 'produção');
};

p = fixEncoding(p);
u = fixEncoding(u);
f = fixEncoding(f);

let newContent = tabContent;

// Update useAppContext imports
const contextImportRegex = /const {([^}]+)} = useAppContext\(\);/;
const currentImports = newContent.match(contextImportRegex)[1];
const newImportsStr = currentImports.trim() + 
    ', buscaCadProdutos, setBuscaCadProdutos, setNovoProduto, setModalProdutoAberto, produtosCatalogoFiltrados, handleDragStartProduto, handleDropProduto, abrirEdicaoProduto, draggedProdutoIndex, excluirProduto' + 
    ', usuariosSistema, setNovoUsuario, setModalUsuarioAberto, abrirEdicaoUsuario' + 
    ', fornecedores, setNovoFornecedor, setModalFornecedorAberto';

newContent = newContent.replace(contextImportRegex, `const { \n    ${newImportsStr}\n} = useAppContext();`);

// Replace the empty placeholders
newContent = newContent.replace("{abaAtual === 'cadastros' && abaCadastros === 'produtos' && isAdmin}", p);
newContent = newContent.replace("{abaAtual === 'cadastros' && abaCadastros === 'produtos'}", '');

newContent = newContent.replace("{abaAtual === 'cadastros' && abaCadastros === 'usuarios' && isAdmin}", u);
newContent = newContent.replace("{abaAtual === 'cadastros' && abaCadastros === 'usuarios'}", '');

newContent = newContent.replace("{abaAtual === 'cadastros' && abaCadastros === 'fornecedores' && isAdmin}", f);
newContent = newContent.replace("{abaAtual === 'cadastros' && abaCadastros === 'fornecedores'}", '');

fs.writeFileSync('components/CadastrosTab.jsx', newContent);
console.log('Fixed CadastrosTab.jsx');
