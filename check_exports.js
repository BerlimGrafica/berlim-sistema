const fs = require('fs');

const contextContent = fs.readFileSync('context/AppContext.jsx', 'utf8');

// find all unction abc( or const abc = async ( or const abc = ( inside AppContext
const funcs = [...contextContent.matchAll(/(?:async )?function\s+([a-zA-Z0-9_]+)\s*\(/g)].map(m => m[1]);
const constFuncs = [...contextContent.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/g)].map(m => m[1]);

const allFuncs = [...new Set([...funcs, ...constFuncs])];

const exportMatch = contextContent.match(/const value = \{([\s\S]+?)\};/);
let availableVars = [];
if (exportMatch) {
    availableVars = exportMatch[1].split(',').map(s => s.trim()).filter(s => s);
}

const missingExports = allFuncs.filter(f => !availableVars.includes(f) && f !== 'AppProvider' && f !== 'useAppContext' && f !== 'App' && f !== 'useEffect' && f !== 'useState');

console.log("Missing exports:", missingExports);
