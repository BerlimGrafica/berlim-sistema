import { corDoNome } from '@/lib/prototipos/coresDoNome';

// O protótipo do modal de O.S. (public/prototipos/novaos.html) é só a casca: o
// catálogo, os locais e a equipe entram no lugar do marcador /*CATALOGO*/,
// lidos do banco pela sessão de quem está logado. Usado pela página /novaos e
// pelo modal que abre por cima das telas novas (NovaOSPorCima), que passa
// também a O.S. real em `os` — com ela o protótipo abre no modo "por cima".

let modelo = null;
export function carregarModeloNovaOS() {
    modelo ??= fetch('/prototipos/novaos.html').then(r => r.text()).catch(e => { modelo = null; throw e; });
    return modelo;
}

export function montarNovaOS(html, { produtos, locais, usuariosSistema, os, escuro }) {
    const catalogo = produtos.map(p => [p.id, p.nome, p.preco_base || 0, p.texto_padrao || '']);
    // A equipe com as cores do sistema: [nome, fundo, texto].
    const equipe = usuariosSistema.filter(u => u.nivel !== 'demo').map(u => [u.nome, ...corDoNome(u.nome)]);
    // "<" escapado para um nome de produto nunca fechar o <script> do protótipo.
    const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
    const extras = os ? `\nconst OS_REAL = ${json(os)};\nconst TEMA_ESCURO = ${escuro ? 'true' : 'false'};` : '';
    return html.replace('/*CATALOGO*/', `const CATALOGO = ${json(catalogo)};\nconst LOCAIS_NOMES = ${json(locais.length ? locais : ['Berlim'])};\nconst EQUIPE_BANCO = ${json(equipe)};${extras}`);
}
