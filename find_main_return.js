const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('app/page.jsx', 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

traverse(ast, {
    FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name === 'App') {
            // Find the main return statement of this function
            const body = path.node.body.body;
            for (let i = body.length - 1; i >= 0; i--) {
                if (body[i].type === 'ReturnStatement') {
                    console.log('MAIN_RETURN_START=' + body[i].start);
                    break;
                }
            }
        }
    }
});
