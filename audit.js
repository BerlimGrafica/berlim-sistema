const fs = require('fs');
const content = fs.readFileSync('context/AppContext.jsx', 'utf8');
const lines = content.split('\n');

// Find all identifiers in the value object
let valueStart = -1, valueEnd = -1;
let braceCount = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const value = {')) {
        valueStart = i;
        braceCount = 0;
    }
    if (valueStart >= 0) {
        for (const ch of lines[i]) {
            if (ch === '{') braceCount++;
            if (ch === '}') braceCount--;
        }
        if (braceCount === 0) {
            valueEnd = i;
            break;
        }
    }
}

// Extract all identifiers from value object
const valueText = lines.slice(valueStart, valueEnd + 1).join('\n');
const exportedNames = [];
const re = /\b(\w+)\b/g;
let m;
while ((m = re.exec(valueText)) !== null) {
    const name = m[1];
    if (!['const', 'value', 'true', 'false', 'null', 'undefined'].includes(name)) {
        if (!exportedNames.includes(name)) {
            exportedNames.push(name);
        }
    }
}

// Now check each exported name: is it defined at module/component scope?
// Strategy: check if the name appears as:
// - const/let/var NAME
// - function NAME
// - useState: [NAME, setNAME]
// - useMemo/useRef result
// But NOT inside useEffect/other callbacks

// Simpler approach: just check if each name in the value object 
// is actually reachable at the component scope (not inside useEffect)

// Find all names defined at component scope (inside AppProvider but not inside useEffect/callbacks)
const providerStart = content.indexOf('export const AppProvider');
const providerContent = content.substring(providerStart);

// Find all useEffect blocks
const useEffectRegions = [];
let searchFrom = 0;
while (true) {
    const effectIdx = providerContent.indexOf('useEffect(', searchFrom);
    if (effectIdx === -1) break;
    
    // Find the matching closing of the useEffect callback
    let depth = 0;
    let started = false;
    let effectEnd = effectIdx;
    for (let i = effectIdx; i < providerContent.length; i++) {
        if (providerContent[i] === '(') { depth++; started = true; }
        if (providerContent[i] === ')') { depth--; }
        if (started && depth === 0) {
            effectEnd = i;
            break;
        }
    }
    useEffectRegions.push({ start: effectIdx + providerStart, end: effectEnd + providerStart });
    searchFrom = effectEnd + 1;
}

// Find all function/variable definitions inside useEffect that might be exported
const scopedNames = new Set();
useEffectRegions.forEach(region => {
    const regionText = content.substring(region.start, region.end);
    const funcRe = /(?:async\s+)?function\s+(\w+)/g;
    let fm;
    while ((fm = funcRe.exec(regionText)) !== null) {
        scopedNames.add(fm[1]);
    }
    // Also check for const/let assignments
    const constRe = /(?:const|let)\s+(\w+)\s*=/g;
    while ((fm = constRe.exec(regionText)) !== null) {
        scopedNames.add(fm[1]);
    }
});

console.log('Functions/variables defined INSIDE useEffect (scoped):');
console.log(Array.from(scopedNames).join(', '));
console.log('');

// Now check which of these are in the value object
const problems = [];
exportedNames.forEach(name => {
    if (scopedNames.has(name)) {
        // It's defined inside useEffect - problematic export
        problems.push(name);
    }
});

// Also check for names in value that don't exist ANYWHERE as definitions
const allDefs = new Set();
// Find all const/let/var/function definitions at component scope
const defRe = /(?:const|let|var)\s+(?:\[([^\]]+)\]|(\w+))\s*=/g;
while ((m = defRe.exec(content)) !== null) {
    if (m[1]) {
        // Destructured: [a, b]
        m[1].split(',').forEach(n => allDefs.add(n.trim()));
    } else if (m[2]) {
        allDefs.add(m[2]);
    }
}
const funcDefRe = /(?:async\s+)?function\s+(\w+)/g;
while ((m = funcDefRe.exec(content)) !== null) {
    allDefs.add(m[1]);
}

// Check for names in value object that don't exist at ALL
const missingNames = [];
exportedNames.forEach(name => {
    if (!allDefs.has(name) && !['itensPorPagina'].includes(name)) {
        // Check if it's a computed property or something else
        if (!/^\d+$/.test(name)) {
            missingNames.push(name);
        }
    }
});

console.log('Names in value object NOT found as any definition:');
console.log(missingNames.join(', ') || '(none)');
console.log('');

console.log('Names in value object that are SCOPED inside useEffect (will cause ReferenceError):');
console.log(problems.join(', ') || '(none)');
console.log('');

// Now check value object line by line to identify exact lines to remove
if (problems.length > 0) {
    console.log('Lines to remove from value object:');
    for (let i = valueStart; i <= valueEnd; i++) {
        const line = lines[i].trim();
        for (const prob of problems) {
            if (line === prob + ',' || line === prob) {
                console.log('  Line ' + (i+1) + ': ' + line);
            }
        }
    }
}
