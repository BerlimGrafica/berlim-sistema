const fs = require('fs');

const contextCode = fs.readFileSync('context/AppContext.jsx', 'utf8');
const valueMatch = contextCode.match(/const value = \{([\s\S]*?)\};/);
if (!valueMatch) { console.log('value object not found'); process.exit(1); }

const providedVars = new Set(valueMatch[1].split(',').map(s => s.trim()).filter(Boolean));

const checkComponent = (compName) => {
    const compCode = fs.readFileSync('components/' + compName, 'utf8');
    const destructureMatch = compCode.match(/const \{([^}]+)\}\s*=\s*useAppContext\(\);/);
    if (!destructureMatch) return;
    
    const usedVars = destructureMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    const missing = usedVars.filter(v => !providedVars.has(v));
    if (missing.length > 0) {
        console.log(compName + ' is missing: ' + missing.join(', '));
    }
};

fs.readdirSync('components').filter(f => f.endsWith('.jsx')).forEach(checkComponent);
