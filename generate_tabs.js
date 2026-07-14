const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const tabsData = JSON.parse(fs.readFileSync('./tabs_ast.json', 'utf8'));
const contextContent = fs.readFileSync('context/AppContext.jsx', 'utf8');

const exportMatch = contextContent.match(/const value = \{([\s\S]+?)\};/);
let availableVars = [];
if (exportMatch) {
    availableVars = exportMatch[1].split(',').map(s => s.trim()).filter(s => s);
}

// Add common imports
const commonImports = `import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
`;

for (const [tabName, blocks] of Object.entries(tabsData)) {
    // We combine the code of all blocks for this tab.
    // For example, 'orcamentos' has 3 blocks. We put them all inside a fragment.
    
    // First, we need to extract the actual inner JSX, omitting the `{abaAtual === 'tab' && (` wrapper.
    // The wrapper is `{abaAtual === '...' && (`. We can just strip the first `{abaAtual === '...' && (` and the trailing `)}`.
    
    let combinedCode = '';
    
    blocks.forEach(block => {
        let code = block.code;
        // The block looks like `{abaAtual === 'tabName' && ( <JSX> )}`
        // Or `{abaAtual === 'tabName' && abaOrcamentos === 'formalizados' && ( <JSX> )}`
        
        // Find the first '('
        const firstParenIndex = code.indexOf('(');
        if (firstParenIndex !== -1 && code.endsWith('}')) {
            let innerCode = code.substring(firstParenIndex + 1, code.lastIndexOf(')'));
            // Wrap in conditional if there are extra conditions like `abaOrcamentos === 'formalizados'`
            // It's safer to just keep the original code but replace `abaAtual === '...' &&` with nothing.
            let stripped = code.replace(/^\{\s*abaAtual\s*===\s*'[^']+'\s*&&/, '{');
            combinedCode += stripped + '\n';
        } else {
            combinedCode += code + '\n';
        }
    });

    const componentName = tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab';
    
    // Find used variables in the block
    let usedVars = [];
    try {
        const ast = parser.parse(`<>${combinedCode}</>`, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        
        traverse(ast, {
            Identifier(path) {
                if (availableVars.includes(path.node.name) && !usedVars.includes(path.node.name)) {
                    usedVars.push(path.node.name);
                }
            }
        });
    } catch (e) {
        console.error("Error parsing block for", tabName, e.message);
        // Fallback: just use all available vars
        usedVars = availableVars;
    }

    const destructure = usedVars.length > 0 ? `const { ${usedVars.join(', ')} } = useAppContext();` : '';

    let componentCode = `"use client";\n${commonImports}\n\nexport default function ${componentName}() {\n    ${destructure}\n\n    return (\n        <>\n            ${combinedCode}\n        </>\n    );\n}\n`;
    
    fs.writeFileSync(`components/${componentName}.jsx`, componentCode);
    console.log(`Created components/${componentName}.jsx`);
}
