const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('monolith.jsx', 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

let headerCode = '';
let navCode = '';

traverse(ast, {
    JSXElement(path) {
        if (path.node.openingElement.name.name === 'header') {
            const classNameAttr = path.node.openingElement.attributes.find(a => a.name && a.name.name === 'className');
            if (classNameAttr && classNameAttr.value.value && classNameAttr.value.value.includes('sticky top-0')) {
                headerCode = code.substring(path.node.start, path.node.end);
            }
        }
        if (path.node.openingElement.name.name === 'nav') {
            const classNameAttr = path.node.openingElement.attributes.find(a => a.name && a.name.name === 'className');
            if (classNameAttr && classNameAttr.value.value && classNameAttr.value.value.includes('bg-brand text-white')) {
                navCode = code.substring(path.node.start, path.node.end);
            }
        }
    }
});

fs.writeFileSync('navbar_parts.json', JSON.stringify({ header: headerCode, nav: navCode }, null, 2));
console.log('Header length: ' + headerCode.length + ', Nav length: ' + navCode.length);
