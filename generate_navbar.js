const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const parts = JSON.parse(fs.readFileSync('navbar_parts.json', 'utf8'));
const contextContent = fs.readFileSync('context/AppContext.jsx', 'utf8');

const exportMatch = contextContent.match(/const value = \{([\s\S]+?)\};/);
let availableVars = [];
if (exportMatch) {
    availableVars = exportMatch[1].split(',').map(s => s.trim()).filter(s => s);
}

// Add fecharModalOS, etc if they might be functions.
['abrirEdicao', 'fecharModalOS'].forEach(fn => { if(!availableVars.includes(fn)) availableVars.push(fn) });

const combinedCode = parts.header + '\n' + parts.nav;

let usedVars = [];
try {
    const ast = parser.parse('<>' + combinedCode + '</>', {
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
    console.error("Error parsing navbar parts:", e);
    usedVars = availableVars; // fallback to all
}

const destructure = usedVars.length > 0 ? 'const { ' + usedVars.join(', ') + ' } = useAppContext();' : '';

const utilsImports = "import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';";

const componentCode = '"use client";\nimport React, { useState, useEffect, useRef, useMemo } from "react";\nimport { useAppContext } from "@/context/AppContext";\nimport Icon from "@/components/Icon";\n' + utilsImports + '\n\nexport default function Navbar() {\n    ' + destructure + '\n\n    return (\n        <>\n            ' + parts.header + '\n            ' + parts.nav + '\n        </>\n    );\n}\n';

fs.writeFileSync('components/Navbar.jsx', componentCode);
console.log('Created components/Navbar.jsx');
