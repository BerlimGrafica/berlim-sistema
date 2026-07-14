const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const contextContent = fs.readFileSync('context/AppContext.jsx', 'utf8');
const exportMatch = contextContent.match(/const value = \{([\s\S]+?)\};/);
let availableVars = [];
if (exportMatch) {
    availableVars = exportMatch[1].split(',').map(s => s.trim()).filter(s => s);
}

const componentsDir = 'components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx') && f !== 'Icon.jsx' && f !== 'Navbar.jsx');

files.forEach(file => {
    const filePath = componentsDir + '/' + file;
    let code = fs.readFileSync(filePath, 'utf8');
    
    let usedVars = new Set();
    
    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        
        traverse(ast, {
            Identifier(path) {
                if (availableVars.includes(path.node.name)) {
                    usedVars.add(path.node.name);
                }
            }
        });
        
        // Find the existing destructuring line
        const regex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*useAppContext\(\);/;
        if (regex.test(code)) {
            const newDestructure = "const { " + Array.from(usedVars).join(', ') + " } = useAppContext();";
            code = code.replace(regex, newDestructure);
            fs.writeFileSync(filePath, code);
            console.log("Updated destructuring in " + file);
        }
        
    } catch (e) {
        console.error("Error processing " + file + ":", e.message);
    }
});
