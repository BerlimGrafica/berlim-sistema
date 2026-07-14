const fs = require('fs');

const files = [
    'app/page.jsx',
    'context/AppContext.jsx',
    'components/BaixaTab.jsx',
    'components/CadastrosTab.jsx',
    'components/CalculadorasTab.jsx',
    'components/DashboardTab.jsx',
    'components/FinanceiroTab.jsx',
    'components/Icon.jsx',
    'components/Modals.jsx',
    'components/Navbar.jsx',
    'components/Notas_fiscaisTab.jsx',
    'components/OrcamentosTab.jsx',
    'components/ProducaoTab.jsx'
];
const replacements = {
    'ǭ': 'á', 'ǜ': 'ã', 'Ǧ': 'ê', 'ǟ': 'ç', 'Ǹ': 'é', 'Ǫ': 'õ', 'es': 'ções', 'Oramentos': 'Orçamentos', 'Aes': 'Ações', 'Aǜo': 'Ação', 'Produǜo': 'Produção', 'Concludo': 'Concluído', 'Concluda': 'Concluída', 'Usurio': 'Usuário', 'Usuǭrio': 'Usuário', 'Grǭfica': 'Gráfica', 'Servio': 'Serviço', 'conexǜo': 'conexão', 'inacessvel': 'inacessível', 'incio': 'início', 'Incio': 'Início', 'avno': 'avanço', '': 'ã'
};
let totalReplaced = 0;
files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content;
    
    // We will do a generic replacement of known mojibake
    for (let [bad, good] of Object.entries(replacements)) {
        if (bad === '') continue;
        newContent = newContent.split(bad).join(good);
    }
    
    // Also replace the replacement character  if it appears in specific words
    newContent = newContent.replace(/Produǜo/g, 'Produção');
    newContent = newContent.replace(/Produão/g, 'Produção');
    newContent = newContent.replace(/Produǜo/g, 'Produção');
    newContent = newContent.replace(/Produo/g, 'Produção');
    newContent = newContent.replace(/Aǜo/g, 'Ação');
    newContent = newContent.replace(/Aão/g, 'Ação');
    newContent = newContent.replace(/Aǜo/g, 'Ação');
    newContent = newContent.replace(/Aes/g, 'Ações');
    newContent = newContent.replace(/Oramento/g, 'Orçamento');
    newContent = newContent.replace(/Oramento/g, 'Orçamento');
    newContent = newContent.replace(/Servio/g, 'Serviço');
    newContent = newContent.replace(/Servio/g, 'Serviço');
    newContent = newContent.replace(/Usurio/g, 'Usuário');
    newContent = newContent.replace(/Usurio/g, 'Usuário');
    newContent = newContent.replace(/Concludo/g, 'Concluído');
    newContent = newContent.replace(/Concludo/g, 'Concluído');
    newContent = newContent.replace(/Concluda/g, 'Concluída');
    newContent = newContent.replace(/Concluda/g, 'Concluída');
    newContent = newContent.replace(/Incio/g, 'Início');
    newContent = newContent.replace(/Incio/g, 'Início');
    newContent = newContent.replace(/incio/g, 'início');
    newContent = newContent.replace(/incio/g, 'início');
    newContent = newContent.replace(/inacessvel/g, 'inacessível');
    newContent = newContent.replace(/inacessvel/g, 'inacessível');
    newContent = newContent.replace(/conexo/g, 'conexão');
    newContent = newContent.replace(/conexǜo/g, 'conexão');
    newContent = newContent.replace(/responsǭvel/g, 'responsável');
    newContent = newContent.replace(/UrgǦncia/g, 'Urgência');
    newContent = newContent.replace(/atribuda/g, 'atribuída');
    newContent = newContent.replace(/Grǭfica/g, 'Gráfica');
    newContent = newContent.replace(/VocǦ/g, 'Você');
    newContent = newContent.replace(/vocǦ/g, 'você');
    newContent = newContent.replace(/Nǜo/g, 'Não');
    newContent = newContent.replace(/nǜo/g, 'não');
    newContent = newContent.replace(/Ǹ/g, 'é');
    newContent = newContent.replace(/obrigatrio/g, 'obrigatório');
    newContent = newContent.replace(/obrigatrio/g, 'obrigatório');
    
    if (newContent !== content) {
        fs.writeFileSync(f, newContent, 'utf8');
        totalReplaced++;
        console.log('Fixed encoding in ' + f);
    }
});
console.log('Total files fixed: ' + totalReplaced);
