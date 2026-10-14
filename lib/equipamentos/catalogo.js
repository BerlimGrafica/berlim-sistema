// As tintas e os tipos de máquina que a tela de Equipamentos conhece.
//
// As máquinas em si ficam no banco (tabela equipamentos, ver
// supabase/equipamentos_migration.sql): o administrador cadastra pela tela.
// Aqui fica só o vocabulário fixo que elas usam. Os ids das tintas e dos
// tipos são os mesmos dos checks da tabela — acrescentar um item aqui exige
// acrescentá-lo lá também.

// Cores de processo reais, não aproximações de tela: é a tinta que está no
// frasco, e quem trabalha com impressão reconhece o ciano e o magenta pelo tom.
// A cor de uma tinta não muda com o tema — no escuro ela continua a mesma, e é
// o anel em volta da amostra que garante que preto e branco se vejam.
//
// `sigla` existe porque três pretos e três tintas sem cor (branco, optimizer,
// verniz) não se distinguem pela amostra. É a sigla que a equipe lê na tira de
// tintas do card; o nome completo fica no formulário e para o leitor de tela.
// `padrao` é o fundo das tintas transparentes: uma amostra lisa de "verniz"
// mentiria a cor.
//
// A ordem desta lista é a ordem em que as tintas aparecem em toda a tela.
export const TINTAS = {
    'preto':             { rotulo: 'Preto',             sigla: 'K',  cor: '#231F20' },
    'branco':            { rotulo: 'Branco',            sigla: 'W',  cor: '#FFFFFF' },
    'amarelo':           { rotulo: 'Amarelo',           sigla: 'Y',  cor: '#FFF200' },
    'ciano':             { rotulo: 'Ciano',             sigla: 'C',  cor: '#00AEEF' },
    'magenta':           { rotulo: 'Magenta',           sigla: 'M',  cor: '#EC008C' },
    'light-magenta':     { rotulo: 'Light Magenta',     sigla: 'Lm', cor: '#F49AC1' },
    'light-ciano':       { rotulo: 'Light Ciano',       sigla: 'Lc', cor: '#6DCFF6' },
    'preto-medio':       { rotulo: 'Preto Médio',       sigla: 'PM', cor: '#58595B' },
    'preto-fotografico': { rotulo: 'Preto Fotográfico', sigla: 'PF', cor: '#000000' },
    'optimizer':         { rotulo: 'Optimizer',         sigla: 'OP', cor: '#E6E7E8',
                           padrao: 'repeating-linear-gradient(135deg, #F1F2F2 0 3px, #D1D3D4 3px 5px)' },
    'verniz':            { rotulo: 'Verniz',            sigla: 'V',  cor: '#F5EFD9',
                           padrao: 'linear-gradient(135deg, #FFFFFF 0%, #EFE6C6 55%, #FFFFFF 100%)' },
};

export const IDS_TINTAS = Object.keys(TINTAS);

// Monocromática recebe só preto — é o que o banco aceita para ela.
export const TINTAS_MONO = ['preto'];

// Uma tinta que não está no catálogo (renomeada, removida) ainda aparece no
// histórico, em cinza neutro e com o próprio id como rótulo: apagar a linha do
// registro por causa disso seria perder um fato.
export const tintaPorId = (id) => TINTAS[id] || { rotulo: id, sigla: '?', cor: '#9CA3AF' };

// O fundo da amostra de uma tinta, para `style={{ background }}`.
export const fundoDaTinta = (id) => {
    const t = tintaPorId(id);
    return t.padrao || t.cor;
};

// As tintas de uma máquina, sempre na ordem do catálogo — independentemente da
// ordem em que foram marcadas no cadastro.
export const tintasDe = (equipamento) => {
    const cores = equipamento?.cromia === 'mono' ? TINTAS_MONO : (equipamento?.cores || []);
    const conhecidas = IDS_TINTAS.filter(id => cores.includes(id));
    return [...conhecidas, ...cores.filter(id => !TINTAS[id])];
};

// Os tipos de máquina, na ordem em que os grupos aparecem na tela. Jato de
// tinta se divide em dois grupos porque pigmentada e corante não trocam tinta
// entre si: misturar as duas no mesmo grupo é o tipo de engano que a tela
// existe para evitar.
export const TIPOS_EQUIPAMENTO = [
    { id: 'jato_pigmentada', rotulo: 'Jato de tinta pigmentada', familia: 'jato', variante: 'Pigmentada' },
    { id: 'jato_corante',    rotulo: 'Jato de tinta corante',    familia: 'jato', variante: 'Corante' },
    { id: 'laser',           rotulo: 'Laser',                    familia: 'laser' },
    { id: 'eco_solvente',    rotulo: 'Eco solvente',             familia: 'eco_solvente' },
    { id: 'latex',           rotulo: 'Látex',                    familia: 'latex' },
    { id: 'uv',              rotulo: 'UV',                       familia: 'uv' },
];

// As famílias, como o formulário as apresenta: "Jato de tinta" primeiro, e só
// depois pigmentada ou corante.
export const FAMILIAS_EQUIPAMENTO = [
    { id: 'jato',         rotulo: 'Jato de tinta' },
    { id: 'laser',        rotulo: 'Laser' },
    { id: 'eco_solvente', rotulo: 'Eco solvente' },
    { id: 'latex',        rotulo: 'Látex' },
    { id: 'uv',           rotulo: 'UV' },
];

export const tipoPorId = (id) => TIPOS_EQUIPAMENTO.find(t => t.id === id) || { id, rotulo: id, familia: id };
