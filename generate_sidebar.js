const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('app/page.jsx', 'utf8');
const contextContent = fs.readFileSync('context/AppContext.jsx', 'utf8');

const exportMatch = contextContent.match(/const value = \{([\s\S]+?)\};/);
let availableVars = [];
if (exportMatch) {
    availableVars = exportMatch[1].split(',').map(s => s.trim()).filter(s => s);
}

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

let headerCode = '';

traverse(ast, {
    JSXElement(path) {
        if (path.node.openingElement.name.name === 'header') {
            headerCode += code.substring(path.node.start, path.node.end) + '\n';
        }
        if (path.node.openingElement.name.name === 'nav') {
            headerCode += code.substring(path.node.start, path.node.end) + '\n';
            path.stop();
        }
    }
});

let usedVars = [];
try {
    const headerAst = parser.parse(`<>${headerCode}</>`, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
    });
    
    traverse(headerAst, {
        Identifier(path) {
            if (availableVars.includes(path.node.name) && !usedVars.includes(path.node.name)) {
                usedVars.push(path.node.name);
            }
        }
    });
} catch(e) { console.log(e); usedVars = availableVars; }

const destructure = usedVars.length > 0 ? `const { ${usedVars.join(', ')} } = useAppContext();` : '';

let componentCode = `"use client";\nimport React from 'react';\nimport { useAppContext } from '@/context/AppContext';\nimport Icon from '@/components/Icon';\n\nexport default function Sidebar() {\n    ${destructure}\n\n    return (\n        <>\n            ${headerCode}\n        </>\n    );\n}\n`;

fs.writeFileSync('components/Sidebar.jsx', componentCode);
console.log('Created components/Sidebar.jsx');
