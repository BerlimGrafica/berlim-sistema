import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NIVEIS_VALIDOS, normalizarTelas } from '@/lib/acesso/telas';

// Confirma quem está chamando a API (pelo token da sessão atual) e exige que seja Administrador.
// Isso é o que impede qualquer pessoa de usar esta rota para criar contas com nível de acesso total.
async function exigirAdmin(request) {
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return { erro: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }) };

    const admin = getSupabaseAdmin();
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
        return { erro: NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 }) };
    }

    const { data: perfil } = await admin.from('profiles').select('nivel').eq('id', userData.user.id).single();
    if (!perfil || perfil.nivel !== 'Administrador') {
        return { erro: NextResponse.json({ error: 'Apenas Administradores podem gerenciar usuários.' }, { status: 403 }) };
    }

    return { admin, chamador: userData.user };
}

// O cliente manda `telas` como array (lista própria) ou null (segue o cargo).
// Aqui a lista é peneirada contra o catálogo — a validação da tela não vale
// nada sozinha, já que esta rota atende a qualquer chamada HTTP autenticada
// como Administrador. Devolve { telas } em caso de sucesso, ou { erro }.
function validarTelas(entrada) {
    if (entrada === undefined || entrada === null) return { telas: null };
    if (!Array.isArray(entrada)) return { erro: 'Lista de telas inválida.' };

    const limpa = normalizarTelas(entrada.filter(id => typeof id === 'string'));
    if (!limpa || limpa.length === 0) return { erro: 'Selecione ao menos uma tela.' };
    return { telas: limpa };
}

// A coluna `telas` vem de supabase/telas_por_usuario_migration.sql. Enquanto
// esse arquivo não for rodado, o PostgREST recusa a gravação inteira por causa
// de uma coluna que ele não conhece — e o cadastro de usuários, que funcionava,
// pararia de funcionar por causa de um recurso novo. Aqui a gravação é repetida
// sem a coluna e a resposta avisa o que falta fazer, em vez de estourar um erro
// de schema na cara de quem só queria trocar uma senha.
const SEM_COLUNA = 'A coluna de permissões ainda não existe no banco: rode supabase/telas_por_usuario_migration.sql no SQL Editor do Supabase. O usuário foi salvo, mas as telas seguem o padrão do cargo.';

function colunaAusente(erro) {
    if (!erro) return false;
    const texto = `${erro.code || ''} ${erro.message || ''}`;
    return texto.includes('PGRST204') || texto.includes('42703') || /column .*telas/i.test(texto);
}

export async function POST(request) {
    const body = await request.json();
    const { admin, erro } = await exigirAdmin(request);
    if (erro) return erro;

    const { email, senha, nome, nivel } = body;
    if (!email || !senha || !nome || !nivel) {
        return NextResponse.json({ error: 'Preencha e-mail, senha, nome e nível.' }, { status: 400 });
    }
    if (!NIVEIS_VALIDOS.includes(nivel)) {
        return NextResponse.json({ error: 'Nível de acesso inválido.' }, { status: 400 });
    }
    if (String(senha).length < 8) {
        return NextResponse.json({ error: 'A senha precisa ter pelo menos 8 caracteres.' }, { status: 400 });
    }
    const { telas, erro: erroTelas } = validarTelas(body.telas);
    if (erroTelas) return NextResponse.json({ error: erroTelas }, { status: 400 });

    const { data: novoUsuario, error: erroCriacao } = await admin.auth.admin.createUser({
        email: String(email).trim().toLowerCase(),
        password: senha,
        email_confirm: true,
    });
    if (erroCriacao) {
        return NextResponse.json({ error: erroCriacao.message }, { status: 400 });
    }

    let aviso = null;
    let { data: perfil, error: erroPerfil } = await admin
        .from('profiles')
        .insert([{ id: novoUsuario.user.id, nome, nivel, telas }])
        .select()
        .single();

    if (colunaAusente(erroPerfil)) {
        aviso = SEM_COLUNA;
        ({ data: perfil, error: erroPerfil } = await admin
            .from('profiles').insert([{ id: novoUsuario.user.id, nome, nivel }]).select().single());
    }

    if (erroPerfil) {
        // Se o perfil falhar, não deixa um usuário de Auth órfão sem perfil.
        await admin.auth.admin.deleteUser(novoUsuario.user.id);
        return NextResponse.json({ error: erroPerfil.message }, { status: 400 });
    }

    return NextResponse.json({ perfil, aviso });
}

export async function PUT(request) {
    const body = await request.json();
    const { admin, chamador, erro } = await exigirAdmin(request);
    if (erro) return erro;

    const { id, nome, nivel, novaSenha } = body;
    if (!id || !nome || !nivel) {
        return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }
    if (!NIVEIS_VALIDOS.includes(nivel)) {
        return NextResponse.json({ error: 'Nível de acesso inválido.' }, { status: 400 });
    }
    if (novaSenha && String(novaSenha).length < 8) {
        return NextResponse.json({ error: 'A nova senha precisa ter pelo menos 8 caracteres.' }, { status: 400 });
    }
    const { telas, erro: erroTelas } = validarTelas(body.telas);
    if (erroTelas) return NextResponse.json({ error: erroTelas }, { status: 400 });

    // Rebaixar a si mesmo tranca a gerência de usuários para todo mundo se este
    // for o único Administrador — e, mesmo não sendo, é sempre um engano: quem
    // quer sair de administrador pede a outro administrador.
    if (chamador.id === id && nivel !== 'Administrador') {
        return NextResponse.json({ error: 'Você não pode remover o seu próprio acesso de Administrador.' }, { status: 400 });
    }

    if (novaSenha) {
        const { error: erroSenha } = await admin.auth.admin.updateUserById(id, { password: novaSenha });
        if (erroSenha) return NextResponse.json({ error: erroSenha.message }, { status: 400 });
    }

    let aviso = null;
    let { data: perfil, error: erroPerfil } = await admin
        .from('profiles')
        .update({ nome, nivel, telas })
        .eq('id', id)
        .select()
        .single();

    if (colunaAusente(erroPerfil)) {
        aviso = SEM_COLUNA;
        ({ data: perfil, error: erroPerfil } = await admin
            .from('profiles').update({ nome, nivel }).eq('id', id).select().single());
    }

    if (erroPerfil) return NextResponse.json({ error: erroPerfil.message }, { status: 400 });

    return NextResponse.json({ perfil, aviso });
}
