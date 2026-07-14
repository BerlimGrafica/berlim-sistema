const fs = require('fs');

let content = fs.readFileSync('app/page.jsx', 'utf8');

const extractComponent = (compName) => {
    const regex = new RegExp(`^(?:const|function) ${compName}\\b[\\s\\S]*?^(?=(?:(?:const|function) [A-Z][a-zA-Z0-9]+|function App\\b))`, 'm');
    const match = content.match(regex);
    return match ? match[0] : null;
};

const components = [
    'CustomDatePicker', 'InlineDropdown', 'MultiSelectDropdown', 'ItensChecklist',
    'StackedCards', 'CalculadoraBanner', 'CalculadoraAdesivo', 'CalculadoraCasamento', 'CalculadorasAba'
];

let newContent = content;

components.forEach(comp => {
    const compBody = extractComponent(comp);
    if (compBody) {
        let fileContent = `"use client";\nimport React, { useState, useEffect, useRef, useMemo } from 'react';\nimport Icon from '@/components/Icon';\n\n`;
        fileContent += compBody.trim();
        fileContent += `\n\nexport default ${comp};\n`;
        
        fs.writeFileSync(`components/${comp}.jsx`, fileContent);
        
        newContent = newContent.replace(compBody, '');
    }
});

const imports = components.map(c => `import ${c} from '@/components/${c}';`).join('\n');
newContent = newContent.replace(`import Icon from '@/components/Icon';`, `import Icon from '@/components/Icon';\n${imports}`);

fs.writeFileSync('app/page.jsx', newContent);
