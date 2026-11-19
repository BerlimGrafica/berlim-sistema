// Telas novas por pessoa.
//
// Enquanto as telas novas estão em teste, elas valem só para quem tem
// `telas_novas` ligado no perfil (supabase/telas_novas_migration.sql). Para essa
// pessoa, os MESMOS endereços do menu (/producao, /financeiro…) abrem a versão
// nova; para o resto da equipe nada muda. Assim os atalhos, as pendências e os
// favoritos continuam levando ao mesmo lugar, e voltar atrás é só desligar a
// coluna.
//
// Sem a coluna no banco (a migração ainda não rodou), ninguém vê as telas novas.

export const usaTelasNovas = (usuario) => usuario?.telas_novas === true;

// As telas que já têm versão nova. Elas têm as próprias abas lá dentro, então
// as sub-abas do menu lateral somem para quem usa as telas novas — clicar nelas
// trocaria uma aba que a tela nova não lê. Orçamentos fica de fora: a sub-aba
// escolhe entre os formalizados e os pré-prontos, que são duas telas novas.
export const TELAS_COM_VERSAO_NOVA = new Set([
    'inicio', 'producao', 'baixa', 'equipamentos', 'calculadoras',
    'financeiro', 'vendas', 'cadastros', 'comunicacao',
]);
