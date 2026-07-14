const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const files = ['components/DashboardTab.jsx', 'components/Navbar.jsx', 'components/Modals.jsx', 'components/ProducaoTab.jsx', 'app/page.jsx'];

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    let undeclared = new Set();
    
    traverse(ast, {
        Identifier(path) {
            // Only check variable reads, not properties (like obj.prop)
            if (path.parent.type === 'MemberExpression' && path.parent.property === path.node && !path.parent.computed) return;
            // Ignore object keys
            if (path.parent.type === 'ObjectProperty' && path.parent.key === path.node) return;
            // Ignore JSX identifiers (like <div className="...">)
            if (path.parent.type === 'JSXAttribute' || path.parent.type === 'JSXOpeningElement' || path.parent.type === 'JSXClosingElement') return;
            
            // If it's a reference to a variable and it's not bound in scope, it's undeclared
            if (path.isReferencedIdentifier() && !path.scope.hasBinding(path.node.name)) {
                // Ignore globals
                const globals = ['console', 'window', 'document', 'alert', 'setTimeout', 'clearTimeout', 'Math', 'Date', 'parseFloat', 'String', 'Object', 'Array', 'isNaN'];
                if (!globals.includes(path.node.name)) {
                    undeclared.add(path.node.name);
                }
            }
        }
    });
    
    console.log(file + " undeclared: " + Array.from(undeclared).join(', '));
});
