const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('context/AppContext.jsx', 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

let topLevelVars = new Set();
traverse(ast, {
    VariableDeclarator(path) {
        if (path.scope.block.type === 'ArrowFunctionExpression' && path.scope.parent.block.type === 'Program') {
            topLevelVars.add(path.node.id.name);
        }
    },
    FunctionDeclaration(path) {
        if (path.scope.block.type === 'ArrowFunctionExpression' && path.scope.parent.block.type === 'Program') {
            topLevelVars.add(path.node.id.name);
        }
    }
});

// also include isOperador, isAdmin, itensPorPagina which are manually pushed
topLevelVars.add('isOperador');
topLevelVars.add('isAdmin');
topLevelVars.add('itensPorPagina');

console.log('Valid top level vars:', topLevelVars.size);

// Read the value object and filter it
const valueMatch = code.match(/const value = \{([\s\S]*?)\};/);
const currentVars = valueMatch[1].split(',').map(s => s.trim()).filter(Boolean);

const validVars = currentVars.filter(v => topLevelVars.has(v) || v === 'isAdmin' || v === 'isOperador');

const newValueObj = 'const value = {\n        ' + validVars.join(',\n        ') + '\n    };';

const newCode = code.replace(valueMatch[0], newValueObj);
fs.writeFileSync('context/AppContext.jsx', newCode);
console.log('Fixed AppContext exports. Exporting:', validVars.length, 'variables.');
