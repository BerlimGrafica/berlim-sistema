const fs = require('fs');
const importStmt = "import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';\n";

const files = [
    'context/AppContext.jsx',
    ...fs.readdirSync('components').filter(f => f.endsWith('.jsx')).map(f => 'components/' + f)
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
        const nextLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLine + 1) + importStmt + content.slice(nextLine + 1);
        fs.writeFileSync(file, content);
    }
});
