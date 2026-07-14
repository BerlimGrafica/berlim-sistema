const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const files = fs.readdirSync('components').filter(f => f.endsWith('Tab.jsx')).map(f => 'components/' + f);
files.push('components/Modals.jsx');
files.push('components/Navbar.jsx');
files.push('app/page.jsx');

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    let undeclared = new Set();
    
    traverse(ast, {
        Identifier(path) {
            if (path.parent.type === 'MemberExpression' && path.parent.property === path.node && !path.parent.computed) return;
            if (path.parent.type === 'ObjectProperty' && path.parent.key === path.node) return;
            if (path.parent.type === 'JSXAttribute' || path.parent.type === 'JSXOpeningElement' || path.parent.type === 'JSXClosingElement') return;
            if (path.parent.type === 'ObjectMethod' && path.parent.key === path.node) return;
            
            if (path.isReferencedIdentifier() && !path.scope.hasBinding(path.node.name)) {
                const globals = ['console', 'window', 'document', 'alert', 'setTimeout', 'clearTimeout', 'Math', 'Date', 'parseFloat', 'parseInt', 'String', 'Object', 'Array', 'isNaN', 'Intl', 'URL', 'Blob', 'URLSearchParams', 'fetch', 'localStorage'];
                if (!globals.includes(path.node.name)) {
                    undeclared.add(path.node.name);
                }
            }
        }
    });
    
    console.log(file + " undeclared: " + Array.from(undeclared).join(', '));
});
