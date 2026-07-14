const fs = require('fs');
const code = fs.readFileSync('monolith.jsx', 'utf8');

// Find the main return statement of App component
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

let mainReturnStart = 0;
traverse(ast, {
    FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === 'App') {
            const body = path.node.body.body;
            for (let i = body.length - 1; i >= 0; i--) {
                if (body[i].type === 'ReturnStatement') {
                    mainReturnStart = body[i].start;
                    break;
                }
            }
        }
    }
});

const appStart = code.indexOf('function App()');
const logic = code.substring(appStart, mainReturnStart);
fs.writeFileSync('app_body.txt', logic);

// The UI is everything after mainReturnStart up to the end of the return statement.
// We can just take from mainReturnStart to the end of the file, then slice out the last brace.
const ui = code.substring(mainReturnStart);
fs.writeFileSync('app_ui.txt', ui);

// Extract top utils
const topLevel = code.substring(0, appStart);
fs.writeFileSync('lib/utils.js', topLevel);

console.log('logic length:', logic.length);
console.log('ui length:', ui.length);
console.log('utils length:', topLevel.length);
