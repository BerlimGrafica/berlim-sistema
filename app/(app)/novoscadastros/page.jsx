"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { useCadastros } from '@/context/CadastrosContext';
import { buscarCadastroClientes } from '@/lib/clientes/busca';
import { TELAS, CARGOS, NIVEIS_VALIDOS, cargoDe, telasDoCargo, telasVisiveis, usaPadraoDoCargo, subtelasVisiveis } from '@/lib/acesso/telas';
import { CATEGORIAS_CONTA } from '@/lib/utils/constants';
import { mascararCliente, rotuloCliente } from '@/lib/utils/formatters';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import LogoCarregando from '@/components/ui/LogoCarregando';

// Protótipo da nova tela de Cadastros, no padrão do DESIGN.md: clientes,
// catálogo, fornecedores e usuários numa tela só, com abas (só as que a pessoa
// pode ver; Usuários é só do Administrador).
//
// Como nos outros protótipos, public/prototipos/cadastros.html é só a casca.
// - Catálogo, fornecedores e usuários já estão na memória (e o tempo real os
//   mantém): entram no lugar do marcador /*CADASTROS*/, sem consulta nova, e o
//   que muda depois vai por mensagem, sem recarregar o protótipo.
// - Clientes são milhares: o protótipo PEDE uma página por vez (50), com a
//   busca, a letra e o filtro feitos no banco pela mesma função da tela de hoje
//   (lib/clientes/busca.js). Nada é lido sem a aba aberta.
//
// O HTML não fala com o banco: pede por mensagem e esta página grava pelas
// MESMAS funções da tela de hoje (components/CadastrosTab.jsx e os modais).
// - salvar-*: a janela nova do protótipo manda os campos; aqui eles são
//   conferidos (a mensagem vem do iframe) e vão para gravarCliente,
//   gravarProduto, gravarFornecedor ou gravarUsuario — o miolo do salvar* de hoje.
// - excluir já foi confirmado no segundo clique do próprio botão; a ordem do
//   catálogo usa a mesma gravação do arrastar de hoje.
const iso = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
// O que a janela pode mandar: texto com tamanho máximo, números inteiros e só
// os valores que existem.
const txt = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
const TIPOS_FORNECEDOR = ['Terceirização', 'Material', 'Manutenção'];
const IDS_TELAS = new Set(TELAS.flatMap(t => [t.id, ...(t.subtelas || []).map(s => `${t.id}:${s.id}`)]));
// O catálogo de telas e os cargos, para a janela de usuário mostrar o que cada
// escolha libera (as regras são as de lib/acesso/telas.js; o servidor confere).
const CATALOGO = TELAS.map(t => ({
    id: t.id, rotulo: t.rotulo, icone: t.icone, fixa: !!t.fixa,
    subtelas: (t.subtelas || []).map(s => ({ id: s.id, rotulo: s.rotulo, soAdmin: !!s.soAdmin })),
}));
const CARGOS_PROTO = CARGOS.map(c => ({ valor: c.valor, rotulo: c.rotulo, resumo: c.resumo, icone: c.icone, padrao: telasDoCargo(c.valor) }));

export default function Page() {
    const { usuario, isAdmin, isDemo, usuariosSistema, darkMode } = useSessao();
    const { gravarCliente } = useClientes();
    const {
        produtos, excluirProduto, duplicarProduto, reordenarProduto, gravarProduto,
        fornecedores, duplicarFornecedor, gravarFornecedor, gravarUsuario,
    } = useCadastros();
    const [modelo, setModelo] = useState(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/cadastros.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    const dados = useMemo(() => {
        const ver = new Set(subtelasVisiveis(usuario, 'cadastros').map(s => s.id));
        const pessoas = ver.has('usuarios') ? usuariosSistema.filter(u => u.nivel !== 'demo') : [];
        return {
            eu: usuario?.nome || '',
            admin: !!isAdmin,
            abas: [...ver],
            totalTelas: TELAS.length,
            cores: Object.fromEntries(pessoas.map(u => [u.nome, corDoNome(u.nome)])),
            categorias: Object.fromEntries(CATEGORIAS_CONTA.map(c => [c.value, c.cor])),
            produtos: ver.has('produtos') ? produtos.map(p => ({
                id: p.id, nome: p.nome || 'Produto', texto: p.texto_padrao || '', preco: Math.round(p.preco_base || 0),
            })) : [],
            fornecedores: ver.has('fornecedores') ? fornecedores.map(f => ({
                id: f.id, nome: f.nome || 'Fornecedor', tipo: f.tipo || 'Terceirização', contato: f.contato || '', obs: f.observacoes || '',
            })) : [],
            usuarios: pessoas.map(u => ({
                id: u.id, nome: u.nome || '', cargo: cargoDe(u.nivel).rotulo, icone: cargoDe(u.nivel).icone || 'user',
                nivel: u.nivel || '', telasProprias: Array.isArray(u.telas) ? u.telas : null,
                padrao: usaPadraoDoCargo(u), telas: telasVisiveis(u).map(t => t.rotulo),
            })),
        };
    }, [usuario, isAdmin, usuariosSistema, produtos, fornecedores]);

    // A casca é montada uma vez; o resto chega pela mensagem abaixo.
    const html = useMemo(() => {
        if (!modelo) return null;
        // "<" escapado para um texto nunca fechar o <script> do protótipo.
        const json = JSON.stringify({ ...dados, escuro: !!darkMode, todasTelas: TELAS.map(t => t.rotulo), catalogo: CATALOGO, cargos: CARGOS_PROTO }).replace(/</g, '\\u003c');
        return modelo.replace('/*CADASTROS*/', `const DADOS = ${json};`);
    }, [modelo]); // eslint-disable-line react-hooks/exhaustive-deps
    const dadosRef = useRef(dados);
    useEffect(() => {
        dadosRef.current = dados;
        if (html) iframeRef.current?.contentWindow?.postMessage({ tipo: 'dados', dados }, '/');
    }, [html, dados]);

    useEffect(() => {
        async function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            const responder = r => quadro.contentWindow?.postMessage(r, '/');
            // Número nos cadastros; texto (uuid) só nos usuários.
            const id = Number.isInteger(msg.id) || (typeof msg.id === 'string' && /^[0-9a-f-]{36}$/i.test(msg.id)) ? msg.id : null;

            if (msg.tipo === 'pronto') return responder({ tipo: 'dados', dados: dadosRef.current });
            if (msg.tipo === 'pedir-clientes') {
                const pagina = Number.isInteger(msg.pagina) && msg.pagina > 0 ? msg.pagina : 1;
                const r = await buscarCadastroClientes({ busca: txt(msg.busca, 80).trim(), letra: txt(msg.letra, 1), soProblema: msg.problema === true, pagina });
                if (r.erro) return responder({ tipo: 'clientes-erro', pedido: msg.pedido, erro: r.erro.message || 'Não deu para carregar os clientes.' });
                return responder({
                    tipo: 'clientes', pedido: msg.pedido, pagina, total: r.total,
                    lista: r.lista.map(c => ({
                        id: c.id, nome: mascararCliente(String(c.nome || '').trim(), isDemo) || 'Sem nome',
                        empresa: isDemo ? '' : String(c.empresa || '').trim(),
                        telefone: isDemo ? '' : (c.telefone || ''), email: isDemo ? '' : (c.email || ''),
                        obs: c.observacoes || '', problema: !!c.cliente_problema, criado: iso(c.created_at),
                    })),
                });
            }

            const [acao, tipo] = String(msg.tipo || '').split('-');
            if (acao === 'salvar') {
                const salvo = r => responder({ tipo: 'salvo', n: msg.n, ok: !!r.ok, erro: r.erro || null, aviso: r.aviso || null, campo: r.campo || null, erroCampo: r.erroCampo || null });
                if (isDemo) return salvo({ erro: 'No modo demonstração nada é gravado.' });
                const d = msg.dados || {};
                if (tipo === 'cliente') {
                    const nome = txt(d.nome, 200).trim();
                    if (!nome) return salvo({ erro: 'Diga o nome do cliente.', campo: 'nome', erroCampo: 'diga o nome' });
                    // Editando: o cadastro de agora, para saber se o nome que as
                    // O.S. mostram mudou (e se a coluna de empresa pode ser limpa).
                    let antes = null;
                    if (id != null) {
                        const { data } = await supabase.from('clientes').select('*').eq('id', id).maybeSingle();
                        if (!data) return salvo({ erro: 'Esse cliente não existe mais.' });
                        antes = data;
                    }
                    const r = await gravarCliente({
                        id, nome, empresa: txt(d.empresa, 200), telefone: txt(d.telefone, 30).trim(), email: txt(d.email, 200).trim(),
                        observacoes: txt(d.observacoes, 4000), cliente_problema: d.cliente_problema === true,
                        empresaAntes: antes?.empresa || '', rotuloAntes: antes ? rotuloCliente(antes) : undefined,
                    });
                    return salvo(r.duplicado ? { ...r, campo: 'telefone', erroCampo: `já é de ${r.duplicado.nome}` } : r);
                }
                if (tipo === 'produto') {
                    const nome = txt(d.nome, 200).trim();
                    if (!nome) return salvo({ erro: 'Diga o nome do produto.', campo: 'nome', erroCampo: 'diga o nome' });
                    const preco = Number.isInteger(d.preco_base) && d.preco_base >= 0 ? d.preco_base : 0;
                    return salvo(await gravarProduto({ id, nome, texto_padrao: txt(d.texto_padrao, 4000), preco_base: preco }));
                }
                if (tipo === 'fornecedor') {
                    const nome = txt(d.nome, 200).trim();
                    if (!nome) return salvo({ erro: 'Diga o nome do fornecedor.', campo: 'nome', erroCampo: 'diga o nome' });
                    const atual = id != null ? fornecedores.find(f => f.id === id)?.tipo : null;
                    const tipoF = TIPOS_FORNECEDOR.includes(d.tipo) || d.tipo === atual ? d.tipo : 'Terceirização';
                    return salvo(await gravarFornecedor({ id, nome, tipo: tipoF, contato: txt(d.contato, 300), observacoes: txt(d.observacoes, 4000) }));
                }
                if (tipo === 'usuario') {
                    // A rota /api/usuarios confere de novo no servidor se quem chama é Administrador.
                    if (!isAdmin) return salvo({ erro: 'Só o Administrador cadastra usuários.' });
                    const nome = txt(d.nome, 120).trim();
                    if (!nome) return salvo({ erro: 'Diga o nome.', campo: 'nome', erroCampo: 'diga o nome' });
                    if (!NIVEIS_VALIDOS.includes(d.nivel)) return salvo({ erro: 'Escolha um cargo.' });
                    const telas = Array.isArray(d.telas) ? d.telas.filter(x => typeof x === 'string' && IDS_TELAS.has(x)) : null;
                    return salvo(await gravarUsuario({ id, nome, nivel: d.nivel, telas, email: txt(d.email, 200).trim(), senha: txt(d.senha, 72) }));
                }
                return;
            }
            if (id == null) return;
            if (acao === 'duplicar') {
                if (tipo === 'produto') { const p = produtos.find(x => x.id === id); if (p) duplicarProduto(p); }
                if (tipo === 'fornecedor') { const f = fornecedores.find(x => x.id === id); if (f) duplicarFornecedor(f); }
                return;
            }
            if (acao === 'mover' && tipo === 'produto' && Number.isInteger(msg.para)) {
                const de = produtos.findIndex(x => x.id === id);
                return reordenarProduto(de, Math.max(0, Math.min(produtos.length - 1, msg.para)));
            }
            if (acao === 'excluir') {
                if (tipo === 'produto') return excluirProduto(id, null, { jaConfirmado: true });
                // Cliente e fornecedor: o mesmo DELETE da tela de hoje. Fornecedor
                // volta pelo tempo real; a página de clientes é relida.
                if (tipo === 'fornecedor') {
                    const { error } = await supabase.from('fornecedores').delete().eq('id', id);
                    return responder({ tipo: 'excluido', alvo: 'fornecedor', id, erro: error?.message || null });
                }
                if (tipo === 'cliente' && isAdmin) {
                    const { error } = await supabase.from('clientes').delete().eq('id', id);
                    return responder({ tipo: 'excluido', alvo: 'cliente', id, erro: error?.message || null });
                }
            }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [isAdmin, isDemo, produtos, fornecedores, gravarCliente, gravarProduto, gravarFornecedor, gravarUsuario,
        excluirProduto, duplicarProduto, reordenarProduto, duplicarFornecedor]);

    if (!html) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    return (
        <iframe
            ref={iframeRef}
            title="Protótipo da nova tela de Cadastros"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
