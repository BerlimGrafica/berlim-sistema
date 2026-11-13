"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useComunicacao } from '@/context/ComunicacaoContext';
import { useCadastros } from '@/context/CadastrosContext';
import { subtelasVisiveis } from '@/lib/acesso/telas';
import { mascararCliente, obterDataAtual } from '@/lib/utils/formatters';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import { buscarConclusoes } from '@/lib/tarefas/conclusoes';
import LogoCarregando from '@/components/ui/LogoCarregando';

// Protótipo da nova tela de Comunicação, no padrão do DESIGN.md: compras (a
// lista do que falta), tarefas e links de pagamento numa tela só, com abas (só
// as que a pessoa pode ver).
//
// Compras: cada item é uma linha de requisicoes_material, com fornecedor e
// urgência (supabase/compras_itens_migration.sql). O "Comprei" é só do
// Administrador e já lança a conta a pagar (comprarItens), para a compra não
// ser digitada de novo no Financeiro.
//
// Como nos outros protótipos, public/prototipos/comunicacao.html é só a casca:
// os três já estão na memória do sistema (carregados na entrada e mantidos pelo
// tempo real) e entram no lugar do marcador /*COMUNICACAO*/, sem consulta nova.
// Depois da primeira carga, o que muda vai por mensagem: o protótipo redesenha a
// lista sem recarregar, e a gaveta aberta continua aberta.
//
// O HTML não fala com o banco: pede por mensagem e esta página grava pelas
// MESMAS funções da tela de hoje (components/ComunicacaoInternaTab.jsx).
// - salvar-*: a janela nova do protótipo manda os campos; aqui eles são
//   conferidos (a mensagem vem do iframe) e vão para gravarRequisicao,
//   gravarTarefa ou gravarLink — o miolo do salvar* do modal de hoje.
// - concluir e excluir já foram confirmados no segundo clique do próprio botão
//   e chegam com { jaConfirmado: true }.
//
// Rotinas: cada vez feita fica em tarefas_conclusoes. A lista lê só as de hoje
// (quantas vezes, a que horas, quem), relidas quando as tarefas mudam (o
// clique de qualquer pessoa toca a tarefa, e o tempo real avisa). Concluídas
// pede as do período escolhido, por mensagem, só quando abre.
const iso = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
// "Nicole, Bruno" → ['Nicole', 'Bruno']: a coluna aceita vários nomes.
const nomesDe = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);

// O que a janela pode mandar: texto com tamanho máximo e só as situações que existem.
const txt = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
const ehData = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const SITUACOES = {
    requisicao: ['Pendente', 'Comprado', 'Recusado'],
    tarefa: ['Pendente', 'Em Andamento', 'Concluída'],
    link: ['Ativo', 'Pago', 'Inativo', 'Concluído'],
};
const situacao = (tipo, v) => SITUACOES[tipo].includes(v) ? v : SITUACOES[tipo][0];
// Como a compra foi paga: decide a situação e o vencimento da conta.
const FORMAS_COMPRA = ['agora', 'prazo', 'cartao', 'depois'];

export default function Page() {
    const { usuario, isDemo, usuariosSistema, darkMode } = useSessao();
    const { fornecedores } = useCadastros();
    const podeComprar = usuario?.nivel === 'Administrador';
    const {
        requisicoesMaterial, tarefasInternas, linksPagamento,
        gravarRequisicao, gravarTarefa, gravarLink, comprarItens,
        excluirRequisicao, excluirTarefa, excluirLink, concluirTarefa, reabrirTarefaFixa, concluirLink,
    } = useComunicacao();
    const [modelo, setModelo] = useState(null);
    const iframeRef = useRef(null);
    // As vezes em que as rotinas foram feitas hoje: [{ tarefa, hora, por }].
    const [feitasHoje, setFeitasHoje] = useState([]);
    const temRotina = tarefasInternas.some(t => t.fixa);
    useEffect(() => {
        if (!temRotina) return;
        let vivo = true;
        const hoje = obterDataAtual();
        buscarConclusoes({ de: hoje, ate: hoje }).then(r => { if (vivo && !r.erro) setFeitasHoje(r.lista); });
        return () => { vivo = false; };
    }, [tarefasInternas, temRotina]);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/comunicacao.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    const dados = useMemo(() => {
        const hoje = obterDataAtual();
        const nomes = new Set([
            usuario?.nome,
            ...usuariosSistema.filter(u => u.nivel !== 'demo').map(u => u.nome),
            ...requisicoesMaterial.map(r => r.criado_por),
            ...tarefasInternas.flatMap(t => [...nomesDe(t.responsavel), t.criado_por]),
            ...linksPagamento.map(l => l.criado_por),
        ].filter(Boolean));
        return {
            hoje,
            eu: usuario?.nome || '',
            pessoas: usuariosSistema.filter(u => u.nivel !== 'demo').map(u => u.nome).filter(Boolean),
            abas: subtelasVisiveis(usuario, 'comunicacao').map(s => s.id),
            // De onde se compra material: os fornecedores do tipo Material, os
            // mesmos que o modal de conta oferece para essa categoria.
            fornecedores: fornecedores.filter(f => f.tipo === 'Material')
                .map(f => ({ id: f.id, nome: f.nome || 'Sem nome' }))
                .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
            podeComprar,
            // As colunas de Compras só existem depois da migração: sem elas, o
            // protótipo anota e lista, mas esconde fornecedor, urgência e "Comprei".
            colunasCompras: requisicoesMaterial.length ? Object.prototype.hasOwnProperty.call(requisicoesMaterial[0], 'urgente') : true,
            cores: Object.fromEntries([...nomes].map(n => [n, corDoNome(n)])),
            requisicoes: requisicoesMaterial.map(r => ({
                id: r.id, itens: r.itens || '', obs: r.observacoes || '', status: r.status || 'Pendente',
                por: r.criado_por || '', criado: iso(r.created_at),
                urgente: !!r.urgente, fornecedor: r.fornecedor_id || null, conta: r.conta_id || null,
                compradoEm: (r.comprado_em || '').slice(0, 10), compradoPor: r.comprado_por || '',
            })),
            tarefas: tarefasInternas.map(t => ({
                id: t.id, titulo: t.titulo || 'Tarefa', descricao: t.descricao || '', responsaveis: nomesDe(t.responsavel),
                prazo: (t.prazo || '').slice(0, 10), status: t.status || 'Pendente', fixa: !!t.fixa,
                // A fixa volta a pendente todo dia; "feita hoje" é a conclusão de hoje.
                feitaHoje: !!t.fixa && t.status === 'Concluída' && t.ultima_conclusao === hoje,
                // Cada vez de hoje, da mais recente para a mais antiga: { hora, por }.
                vezesHoje: t.fixa ? feitasHoje.filter(c => c.tarefa === t.id).map(c => ({ hora: c.hora, por: c.por })) : [],
                // O dia em que a tarefa foi concluída (as de antes de ele ser
                // gravado ficam sem data).
                concluidaEm: !t.fixa && t.status === 'Concluída' ? (t.ultima_conclusao || '').slice(0, 10) : '',
                por: t.criado_por || '', criado: iso(t.created_at),
            })),
            links: linksPagamento.map(l => ({
                id: l.id, titulo: l.titulo || 'Link', cliente: mascararCliente(l.cliente || '', isDemo), link: isDemo ? '' : (l.link || ''),
                valor: Math.round(l.valor || 0), status: l.status || 'Ativo', por: l.criado_por || '', criado: iso(l.created_at),
            })),
        };
    }, [usuario, usuariosSistema, requisicoesMaterial, tarefasInternas, linksPagamento, isDemo, fornecedores, podeComprar, feitasHoje]);

    // A casca é montada uma vez, com os dados daquele instante. Depois, cada
    // mudança vai por mensagem: recarregar o iframe fecharia a gaveta e jogaria
    // a pessoa para o topo a cada tarefa que alguém concluísse.
    // Só o modelo refaz a casca, de propósito: dados e tema entram como estão na
    // primeira vez, e o resto chega pela mensagem abaixo.
    const html = useMemo(() => {
        if (!modelo) return null;
        // "<" escapado para um texto nunca fechar o <script> do protótipo.
        const json = JSON.stringify({ ...dados, escuro: !!darkMode }).replace(/</g, '\\u003c');
        return modelo.replace('/*COMUNICACAO*/', `const DADOS = ${json};`);
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
            // O protótipo terminou de abrir: o que mudou enquanto ele carregava vai agora.
            if (msg.tipo === 'pronto') return quadro.contentWindow?.postMessage({ tipo: 'dados', dados: dadosRef.current }, '/');
            // Concluídas: as vezes em que as rotinas foram feitas no período.
            if (msg.tipo === 'pedir-conclusoes') {
                const de = ehData(msg.de) ? msg.de : '', ate = ehData(msg.ate) ? msg.ate : '';
                const r = await buscarConclusoes({ de, ate });
                return quadro.contentWindow?.postMessage({ tipo: 'conclusoes', pedido: msg.pedido, erro: !!r.erro, cortado: !!r.cortado, lista: r.lista }, '/');
            }
            // "Comprei": só o Administrador. Fecha os itens e lança a conta.
            if (msg.tipo === 'comprar-itens') {
                const responder = r => quadro.contentWindow?.postMessage({ tipo: 'salvo', n: msg.n, ok: !!r.ok, erro: r.erro || null, aviso: r.aviso || null, campo: r.campo || null, erroCampo: r.erroCampo || null }, '/');
                if (isDemo) return responder({ erro: 'No modo demonstração nada é gravado.' });
                if (!podeComprar) return responder({ erro: 'Só o Administrador marca compras.' });
                const d = msg.dados || {};
                const ids = (Array.isArray(d.ids) ? d.ids : []).filter(Number.isInteger);
                if (!ids.length) return responder({ erro: 'Marque o que foi comprado.', campo: 'itens', erroCampo: 'marque ao menos um' });
                const forma = FORMAS_COMPRA.includes(d.forma) ? d.forma : 'prazo';
                const fornecedorId = Number.isInteger(d.fornecedor) ? d.fornecedor : null;
                if (!fornecedores.some(f => f.id === fornecedorId && f.tipo === 'Material')) return responder({ erro: 'Escolha de onde foi comprado.', campo: 'fornecedor', erroCampo: 'escolha' });
                const valor = Number.isInteger(d.valor) && d.valor > 0 ? d.valor : 0;
                if (forma !== 'depois' && !valor) return responder({ erro: 'Diga quanto custou.', campo: 'valor', erroCampo: 'quanto custou' });
                if (forma !== 'agora' && !ehData(d.vencimento)) return responder({ erro: 'Diga quando vence.', campo: 'vencimento', erroCampo: 'quando vence' });
                const r = await comprarItens({ ids, fornecedorId, forma, valor, vencimento: d.vencimento });
                return responder(r.ok ? { ok: true, aviso: forma === 'agora' ? 'Comprado e lançado como pago' : 'Comprado e lançado em Contas a pagar' } : r);
            }
            const [acao, tipo] = String(msg.tipo || '').split('-');
            if (!SITUACOES[tipo]) return;
            const id = Number.isInteger(msg.id) ? msg.id : null;
            if (acao === 'salvar') {
                const responder = r => quadro.contentWindow?.postMessage({ tipo: 'salvo', n: msg.n, ok: !!r.ok, erro: r.erro || null, aviso: r.aviso || null }, '/');
                if (isDemo) return responder({ erro: 'No modo demonstração nada é gravado.' });
                const d = msg.dados || {};
                if (tipo === 'requisicao') {
                    if (!txt(d.itens, 4000).trim()) return responder({ erro: 'Diga o que comprar.' });
                    const r = { id, itens: txt(d.itens, 4000), observacoes: txt(d.observacoes, 4000), status: situacao(tipo, d.status) };
                    // Marcar comprado direto é só pelo "Comprei" (que lança a conta).
                    const antes = id != null ? requisicoesMaterial.find(x => x.id === id) : null;
                    if (r.status === 'Comprado' && antes?.status !== 'Comprado') r.status = antes?.status || 'Pendente';
                    if ('urgente' in d) r.urgente = d.urgente === true;
                    if ('fornecedor' in d) r.fornecedor_id = fornecedores.some(f => f.id === d.fornecedor && f.tipo === 'Material') ? d.fornecedor : null;
                    return responder(await gravarRequisicao(r));
                }
                if (tipo === 'tarefa') {
                    if (!txt(d.titulo, 200).trim()) return responder({ erro: 'Dê um nome à tarefa.' });
                    // Responsáveis: nomes da equipe, ou os que a tarefa já tinha.
                    const antes = id != null ? nomesDe(tarefasInternas.find(x => x.id === id)?.responsavel) : [];
                    const validos = new Set([...usuariosSistema.map(u => u.nome), ...antes]);
                    const responsavel = (Array.isArray(d.responsaveis) ? d.responsaveis : []).filter(n => typeof n === 'string' && validos.has(n)).join(', ');
                    return responder(await gravarTarefa({ id, titulo: txt(d.titulo, 200), descricao: txt(d.descricao, 4000), responsavel, prazo: ehData(d.prazo) ? d.prazo : '', fixa: d.fixa === true, status: situacao(tipo, d.status) }));
                }
                if (tipo === 'link') {
                    const link = txt(d.link, 1000).trim();
                    if (!txt(d.titulo, 200).trim() || !/^https?:\/\/\S+$/i.test(link)) return responder({ erro: 'Confira a identificação e o link.' });
                    const valor = Number.isInteger(d.valor) && d.valor > 0 ? d.valor : null;
                    return responder(await gravarLink({ id, titulo: txt(d.titulo, 200), cliente: txt(d.cliente, 200), link, valor, status: situacao(tipo, d.status) }));
                }
                return;
            }
            if (id == null) return;
            const jaConfirmado = { jaConfirmado: true };
            if (acao === 'concluir') {
                // Requisição sai da lista só pelo "Comprei", que lança a conta.
                if (tipo === 'requisicao') return;
                if (tipo === 'tarefa') return concluirTarefa(id, jaConfirmado);
                if (tipo === 'link') return concluirLink(id, jaConfirmado);
            }
            if (acao === 'reabrir' && tipo === 'tarefa') return reabrirTarefaFixa(id);
            if (acao === 'excluir') {
                if (tipo === 'requisicao') return excluirRequisicao(id, jaConfirmado);
                if (tipo === 'tarefa') return excluirTarefa(id, jaConfirmado);
                if (tipo === 'link') return excluirLink(id, jaConfirmado);
            }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [isDemo, usuariosSistema, tarefasInternas, requisicoesMaterial, fornecedores, podeComprar, gravarRequisicao, gravarTarefa, gravarLink, comprarItens,
        concluirTarefa, concluirLink, reabrirTarefaFixa, excluirRequisicao, excluirTarefa, excluirLink]);

    if (!html) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    return (
        <iframe
            ref={iframeRef}
            title="Protótipo da nova tela de Comunicação"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
