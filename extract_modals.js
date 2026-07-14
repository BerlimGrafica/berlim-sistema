const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('monolith.jsx', 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

let modals = [];

traverse(ast, {
    LogicalExpression(path) {
        if (path.node.operator === '&&') {
            const left = code.substring(path.node.left.start, path.node.left.end);
            if (left.includes('modal') || left.includes('Modal')) {
                // If the right side is a JSX Element and it has "fixed inset-0"
                const rightStr = code.substring(path.node.right.start, path.node.right.end);
                if (rightStr.includes('fixed') && rightStr.includes('inset-0')) {
                    modals.push({
                        condition: left,
                        code: code.substring(path.node.start, path.node.end)
                    });
                }
            }
        }
    }
});

fs.writeFileSync('modals_ast.json', JSON.stringify(modals, null, 2));
console.log('Found ' + modals.length + ' modals');
