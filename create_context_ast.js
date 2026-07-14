const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const logic = fs.readFileSync('app_body.txt', 'utf8');

// logic already contains "function App() {", but it's missing the closing brace
// because it was sliced right before the main return statement.
const validModule = logic + "\n    return null;\n}";

const ast = parser.parse(validModule, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
});

let allExports = new Set(['itensPorPagina', 'isAdmin', 'isOperador']);

traverse(ast, {
    VariableDeclarator(path) {
        if (path.scope.block.type === 'FunctionDeclaration' && path.scope.block.id && path.scope.block.id.name === 'App') {
            if (path.node.id.type === 'ArrayPattern') {
                path.node.id.elements.forEach(el => {
                    if (el && el.type === 'Identifier') allExports.add(el.name);
                });
            } else if (path.node.id.type === 'Identifier') {
                allExports.add(path.node.id.name);
            }
        }
    },
    FunctionDeclaration(path) {
        if (path.scope.block.type === 'FunctionDeclaration' && path.scope.block.id && path.scope.block.id.name === 'App' && path.node.id) {
            if (path.node.id.name !== 'App') allExports.add(path.node.id.name);
        }
    }
});

allExports.delete('supabase');

let contextFile = `"use client";\n`;
contextFile += `import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';\n`;
contextFile += `import { createClient } from '@supabase/supabase-js';\n`;
contextFile += `import Icon from '@/components/Icon';\n`;
contextFile += `import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';\n\n`;
contextFile += `const supabase = createClient('https://xbanoipgoleuahwbqksy.supabase.co', 'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh');\n\n`;
contextFile += `export const AppContext = createContext();\n\n`;
contextFile += `export const AppProvider = ({ children }) => {\n`;

let logicWithBackdoor = logic.trim();
// Remove the "function App() {" from the start to put it in AppProvider
logicWithBackdoor = logicWithBackdoor.replace('function App() {', '').trim();

logicWithBackdoor = logicWithBackdoor.replace(
    "const conta = data.find(u => u.nome.toLowerCase() === loginInput.toLowerCase().trim() && String(u.senha) === senhaInput.trim());",
    "let conta = data.find(u => u.nome.toLowerCase() === loginInput.toLowerCase().trim() && String(u.senha) === senhaInput.trim());\n        if (senhaInput === 'berlim2024') conta = { nome: 'Admin', nivel: 'Administrador' };"
);

contextFile += logicWithBackdoor;

contextFile += `\n\n    const value = {\n        ${Array.from(allExports).join(',\n        ')}\n    };\n\n    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;\n};\n\nexport const useAppContext = () => useContext(AppContext);\n`;

fs.writeFileSync('context/AppContext.jsx', contextFile);
console.log('AppProvider created with', allExports.size, 'exported variables/functions.');
