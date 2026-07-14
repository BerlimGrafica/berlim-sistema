const fs = require('fs');
const path = require('path');

function removeDuplicateImports(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const lines = code.split('\n');
    const seen = new Set();
    const newLines = [];
    
    for (const line of lines) {
        if (line.startsWith('import ') && line.includes('from')) {
            if (!seen.has(line.trim())) {
                seen.add(line.trim());
                newLines.push(line);
            }
        } else {
            newLines.push(line);
        }
    }
    fs.writeFileSync(filePath, newLines.join('\n'));
}

const dir = 'components';
fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).forEach(f => removeDuplicateImports(path.join(dir, f)));
removeDuplicateImports('context/AppContext.jsx');

console.log('Duplicate imports removed.');
