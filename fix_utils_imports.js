const fs = require('fs');

const utilsCode = fs.readFileSync('lib/utils.js', 'utf8');
const exportsList = [];
const lines = utilsCode.split('\n');
for (const line of lines) {
    const match = line.match(/^export (const|function) ([a-zA-Z0-9_]+)/);
    if (match) {
        exportsList.push(match[2]);
    }
}

const importStmt = "import { " + exportsList.join(', ') + " } from '@/lib/utils';\n";

const dir = 'components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => 'components/' + f);
files.push('context/AppContext.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Remove any existing import from @/lib/utils
    const lines = content.split('\n');
    const newLines = [];
    for (const line of lines) {
        if (!line.includes('@/lib/utils')) {
            newLines.push(line);
        }
    }
    content = newLines.join('\n');
    
    // Insert new import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
        const nextLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLine + 1) + importStmt + content.slice(nextLine + 1);
        fs.writeFileSync(file, content);
    }
});
console.log('Imports updated in all components!');
