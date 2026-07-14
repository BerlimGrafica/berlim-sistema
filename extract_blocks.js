const fs = require('fs');
const content = fs.readFileSync('monolith.jsx', 'utf8');
const lines = content.split('\n');

function findBlock(searchStr) {
    let start = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchStr)) {
            start = i;
            break;
        }
    }
    if (start === -1) return null;
    
    let braceCount = 0;
    let end = -1;
    let started = false;
    
    for (let i = start; i < lines.length; i++) {
        for (const ch of lines[i]) {
            if (ch === '{' || ch === '(') { braceCount++; started = true; }
            if (ch === '}' || ch === ')') { braceCount--; }
        }
        if (started && braceCount === 0) {
            end = i;
            break;
        }
    }
    return { start, end };
}

const produtos = findBlock("abaAtual === 'cadastros' && abaCadastros === 'produtos' && isAdmin && (");
const usuarios = findBlock("abaAtual === 'cadastros' && abaCadastros === 'usuarios' && isAdmin && (");
const fornecedores = findBlock("abaAtual === 'cadastros' && abaCadastros === 'fornecedores' && isAdmin && (");

console.log('Produtos:', produtos);
console.log('Usuarios:', usuarios);
console.log('Fornecedores:', fornecedores);

// Generate the blocks to a file
if (produtos) fs.writeFileSync('produtos_block.jsx', lines.slice(produtos.start, produtos.end + 1).join('\n'));
if (usuarios) fs.writeFileSync('usuarios_block.jsx', lines.slice(usuarios.start, usuarios.end + 1).join('\n'));
if (fornecedores) fs.writeFileSync('fornecedores_block.jsx', lines.slice(fornecedores.start, fornecedores.end + 1).join('\n'));
