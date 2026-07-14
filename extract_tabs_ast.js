const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const code = fs.readFileSync('monolith.jsx', 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

const tabs = {};

traverse(ast, {
    LogicalExpression(path) {
        if (path.node.operator === '&&') {
            let left = path.node.left;
            let abaName = null;

            if (left.type === 'BinaryExpression' && left.left.name === 'abaAtual' && left.right.type === 'StringLiteral') {
                abaName = left.right.value;
            } else if (left.type === 'LogicalExpression' && left.operator === '&&') {
                if (left.left.type === 'BinaryExpression' && left.left.left.name === 'abaAtual' && left.left.right.type === 'StringLiteral') {
                    abaName = left.left.right.value;
                }
            }

            if (abaName) {
                if (!tabs[abaName]) tabs[abaName] = [];
                // Only add if it doesn't already contain <DashboardTab />
                const generated = code.substring(path.node.start, path.node.end);
                if (!generated.includes('<DashboardTab />')) {
                    tabs[abaName].push({
                        start: path.node.start,
                        end: path.node.end,
                        code: '{' + generated + '}'
                    });
                }
            }
        }
    }
});

fs.writeFileSync('tabs_ast.json', JSON.stringify(tabs, null, 2));
console.log('Extracted tabs:', Object.keys(tabs).join(', '));
