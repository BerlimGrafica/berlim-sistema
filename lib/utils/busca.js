// Normalização de texto para busca.
//
// Quem procura "andre" quer achar "André", e quem procura "ANDRÉ" quer achar
// "andré". Comparar as duas pontas com `toLowerCase()` resolvia metade do
// problema — a caixa — e deixava a outra metade de pé: o acento. Num cadastro
// com "Gonçalves", "Camarão" e "Segurança", digitar sem acento (que é como se
// digita com pressa, e é como o teclado do celular entrega) não achava nada, e
// o atendente concluía que o cliente não estava cadastrado.
//
// `normalize('NFD')` separa a letra do sinal — "é" vira "e" + U+0301 — e o
// replace varre a faixa de sinais combinantes. Funciona para todo o português
// (ç, ã, õ, â, ê, ü) sem tabela de-para, e não estraga texto que já está sem
// acento.
//
// O equivalente no banco é a função sem_acento() de
// supabase/busca_sem_acento_migration.sql. As duas precisam concordar: esta
// filtra as listas que já estão na memória, aquela filtra as que são buscadas
// linha a linha no Postgres.
// O NFD só separa o que é acento COMBINANTE. Letras com traço — o "ø" — não
// se decompõem, e ficariam de fora. São duas, e sem elas as duas pontas
// discordariam: o banco usa translate(), que converte tudo por tabela.
const TRACOS = { 'ø': 'o', 'Ø': 'O' };

export const semAcento = (texto) =>
    String(texto ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[øØ]/g, (c) => TRACOS[c])
        .toLowerCase();

// Açúcar para o caso comum: "este campo contém o que foi digitado?".
// O termo já vem normalizado de fora — normalizar o termo uma vez por busca,
// em vez de uma vez por linha da lista, é a diferença entre uma passada e
// sete mil.
export const contem = (campo, termoNormalizado) =>
    !termoNormalizado || semAcento(campo).includes(termoNormalizado);

// ---------------------------------------------------------------------------
// Lado do servidor
//
// As listas grandes — 7.314 clientes, 755 pedidos — não vêm para a memória:
// elas são filtradas no Postgres, linha a linha, e para essas o acento tem de
// sair antes, numa coluna gerada. Essa coluna vem da migração
// supabase/busca_sem_acento_migration.sql, que pode ainda não ter sido rodada.
//
// Em vez de quebrar a busca até lá, o app pergunta uma vez ao banco se a
// coluna existe e usa a busca antiga enquanto não existir. A pergunta é feita
// uma vez por sessão e o resultado fica guardado — inclusive a PROMESSA, e não
// só a resposta: sem isso, três campos de busca abertos ao mesmo tempo no
// primeiro segundo disparariam três consultas idênticas.
// ---------------------------------------------------------------------------

let promessaDeSuporte = null;

export function buscaSemAcentoNoBanco(supabase) {
    if (!promessaDeSuporte) {
        promessaDeSuporte = supabase
            .from('clientes').select('nome_busca').limit(1)
            .then(({ error }) => {
                if (error) {
                    console.warn(
                        'Busca sem acento indisponível no banco — rode '
                        + 'supabase/busca_sem_acento_migration.sql no SQL Editor do Supabase. '
                        + 'Até lá, procurar "goncalves" não acha "Gonçalves".',
                    );
                    return false;
                }
                return true;
            })
            .catch(() => false);
    }
    return promessaDeSuporte;
}

// Devolve o par (coluna, termo) para o filtro, conforme a migração já tenha
// rodado ou não. Quem chama não precisa saber qual dos dois mundos está em pé.
export async function campoDeBusca(supabase, coluna, termo) {
    const pronto = await buscaSemAcentoNoBanco(supabase);
    return pronto
        ? { coluna: `${coluna}_busca`, termo: semAcento(termo) }
        : { coluna, termo };
}
