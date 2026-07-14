const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('app/page.jsx', 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

const tabs = {};

traverse(ast, {
    LogicalExpression(path) {
        // Look for abaAtual === 'tabName' && (...)
        if (path.node.operator === '&&') {
            const left = path.node.left;
            if (left.type === 'BinaryExpression' && left.operator === '===') {
                if (left.left.type === 'Identifier' && left.left.name === 'abaAtual') {
                    if (left.right.type === 'StringLiteral') {
                        const tabName = left.right.value;
                        const start = path.node.start;
                        const end = path.node.end;
                        
                        // We only want the outermost ones. Some tabs have sub-tabs, but we want the top level ones.
                        // Actually, just save all of them.
                        if (!tabs[tabName]) {
                            tabs[tabName] = [];
                        }
                        tabs[tabName].push({ start, end, code: code.substring(start, end) });
                    }
                }
            }
        }
    }
});

fs.writeFileSync('tabs_ast.json', JSON.stringify(tabs, null, 2));
console.log('Saved tabs_ast.json');
