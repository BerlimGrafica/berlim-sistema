const fs = require('fs');
const files = [
    'components/BaixaTab.jsx', 'components/CadastrosTab.jsx', 'components/CalculadorasTab.jsx',
    'components/DashboardTab.jsx', 'components/FinanceiroTab.jsx', 'components/Modals.jsx',
    'components/Navbar.jsx', 'components/Notas_fiscaisTab.jsx', 'components/OrcamentosTab.jsx',
    'components/ProducaoTab.jsx'
];

// Get all exports from AppContext value
const ctx = fs.readFileSync('context/AppContext.jsx', 'utf8');
const valueMatch = ctx.match(/const value = \{([^}]+)\}/s);
const contextExports = valueMatch ? valueMatch[1].split(',').map(s => s.trim().split(':')[0].trim()).filter(Boolean) : [];
console.log('AppContext exports ' + contextExports.length + ' values');

let errors = 0;
files.forEach(f => {
    if (!fs.existsSync(f)) return;
    const content = fs.readFileSync(f, 'utf8');
    
    // Extract destructured variables from useAppContext
    const match = content.match(/const \{([^}]+)\} = useAppContext/);
    if (!match) return;
    
    const destructured = match[1].split(',').map(s => s.trim()).filter(Boolean);
    
    // Check each destructured variable is in AppContext exports
    destructured.forEach(varName => {
        if (!contextExports.includes(varName)) {
            console.log('ERROR: ' + f + ' destructures "' + varName + '" but NOT in AppContext value');
            errors++;
        }
    });
    
    // Check for statusColors usage
    if (content.includes('statusColors')) {
        console.log('ERROR: ' + f + ' uses undefined statusColors');
        errors++;
    }
    // Check for abrirModalOS usage
    if (content.includes('abrirModalOS')) {
        console.log('ERROR: ' + f + ' uses undefined abrirModalOS');
        errors++;
    }
    // Check for supabase usage without import
    if (content.includes('supabase.from') && !content.includes("import") ) {
        console.log('WARNING: ' + f + ' uses supabase but may not import it');
    }
});

console.log('\nTotal errors found: ' + errors);
