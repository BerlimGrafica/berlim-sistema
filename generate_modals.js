const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const modals = JSON.parse(fs.readFileSync('modals_ast.json', 'utf8'));
const contextContent = fs.readFileSync('context/AppContext.jsx', 'utf8');

const exportMatch = contextContent.match(/const value = \{([\s\S]+?)\};/);
let availableVars = [];
if (exportMatch) {
    availableVars = exportMatch[1].split(',').map(s => s.trim()).filter(s => s);
}

// Ensure fecharModalOS is in availableVars since it might be a function
if (!availableVars.includes('fecharModalOS')) availableVars.push('fecharModalOS');

let combinedCode = '';
modals.forEach(m => {
    combinedCode += m.code + '\n';
});

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
    console.error("Error parsing modals:", e);
    usedVars = availableVars;
}

const destructure = usedVars.length > 0 ? 'const { ' + usedVars.join(', ') + ' } = useAppContext();' : '';

const utilsImports = "import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';";

const componentCode = '"use client";\nimport React, { useState, useEffect, useRef, useMemo } from "react";\nimport { useAppContext } from "@/context/AppContext";\nimport Icon from "@/components/Icon";\n' + utilsImports + '\n\nexport default function Modals() {\n    ' + destructure + '\n\n    return (\n        <>\n            ' + combinedCode + '\n        </>\n    );\n}\n';

fs.writeFileSync('components/Modals.jsx', componentCode);
console.log('Created components/Modals.jsx');
