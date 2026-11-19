"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { mascararCliente, valorPagamentoComSinalCentavos } from '@/lib/utils/formatters';
import { campoDeBusca, valorDoFiltro } from '@/lib/utils/busca';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import { resumoDoPedido } from '@/lib/utils/servico';
import { useAbrirOSDoPrototipo } from '@/hooks/useAbrirOSDoPrototipo';
import { usePedidos } from '@/context/PedidosContext';
import LogoCarregando from '@/components/ui/LogoCarregando';
import { prepararNoSistema } from '@/lib/prototipos/noSistema';

// Protótipo da nova tela de O.S. (o Histórico/Baixa do menu): abas por situação
// e lista agrupada por mês da venda, a opção escolhida pela equipe.
//
// Como em /novaproducao, o HTML em public/prototipos/baixa.html é só a casca: as
// O.S. entram aqui, lidas com a sessão de quem está logado, no lugar do marcador
// /*BAIXA*/. As cinco abas usam os mesmos filtros do Histórico (fetchHistorico em
// context/AppContext.jsx), mas cada uma traz só as primeiras O.S. — o total vem
// da contagem do banco. Só leitura: nada lá dentro grava.
//
// Com período ou busca, o protótipo PEDE por mensagem e a página filtra no
// banco: a contagem de cada aba e as primeiras O.S. da aba aberta. Antes o
// filtro rodava no navegador, só sobre as 80 primeiras de cada aba — com mais de
// mil baixadas, escolher agosto dava "nenhuma O.S. neste período".
const POR_ABA = 80;
// "Carregar mais": o pedaço seguinte de cada aba.
const MAIS = 50;
const ABAS = {
    abertas: q => q.not('status', 'in', '("Concluído","Finalizado","Cancelado","Abandonado")'),
    concluidas: q => q.eq('status', 'Concluído'),
    finalizadas: q => q.eq('status', 'Finalizado'),
    canceladas: q => {
        const quinzeDiasAtras = new Date();
        quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
        return q.eq('status', 'Cancelado').gte('cancelado_em', quinzeDiasAtras.toISOString());
    },
    abandonadas: q => q.eq('status', 'Abandonado'),
};
const CAMPOS = '*, pedido_itens(*), pedido_pagamentos(*)';
// A coluna do banco de cada setinha do cabeçalho do protótipo.
const COLUNA_ORDEM = { id: 'id', cliente: 'cliente', valor: 'valor_total' };
const ehData = s => s === '' || (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s));

// Busca como no Histórico: cliente (sem acento, quando o banco já tem a coluna)
// e, se for número, também o nº da O.S. A coluna se descobre uma vez, antes.
async function prepararBusca(busca) {
    const texto = (busca || '').trim();
    if (!texto) return null;
    const { coluna, termo } = await campoDeBusca(supabase, 'cliente', texto);
    return { texto, coluna, termo };
}

// Período pela data da venda e a busca já preparada. Síncrona de propósito: a
// consulta do Supabase é "thenable", e devolvê-la de uma função async faria o
// await executá-la ali mesmo, entregando o resultado no lugar da consulta.
function filtrar(q, { de, ate }, busca) {
    if (de) q = q.gte('data_pedido', de);
    if (ate) q = q.lte('data_pedido', ate);
    if (busca) {
        q = /^\d+$/.test(busca.texto)
            ? q.or(`${busca.coluna}.ilike.${valorDoFiltro(`%${busca.termo}%`)},id.eq.${busca.texto}`)
            : q.ilike(busca.coluna, `%${busca.termo}%`);
    }
    return q;
}

// As O.S. de uma aba com o filtro e a ordem do protótipo, a partir de `desde`.
// O.S. sem cliente ou sem valor vão para o fim nos dois sentidos; empate vai
// pelo nº, mais nova primeiro.
async function buscarAba(msg, filtro, busca, desde, quantas) {
    const coluna = COLUNA_ORDEM[msg.campo] || 'id';
    let q = filtrar(ABAS[msg.aba](supabase.from('pedidos').select(CAMPOS)), filtro, busca)
        .order(coluna, { ascending: msg.ordem === 'asc', nullsFirst: false });
    if (coluna !== 'id') q = q.order('id', { ascending: false });
    const { data, error } = await q.range(desde, desde + quantas - 1);
    if (error) throw error;
    return data || [];
}

export default function Page() {
    const { usuario, isDemo } = useSessao();
    const { isClienteProblema } = useClientes();
    // Dar baixa, imprimir e duplicar: as mesmas funções da tela de hoje.
    const { atualizarCampoInline, imprimirOS, duplicarOS } = usePedidos();
    // Quem pode dar baixa: Administrador e Financeiro, como o "Finalizar OS" de hoje.
    const podeBaixar = usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro';
    const [modelo, setModelo] = useState(null);
    const [abas, setAbas] = useState(null);
    // A situação de cada O.S. que o protótipo já mostrou (as da carga inicial e
    // as que vieram de um filtro): baixada fica trancada para Atendimento e Produção.
    const situacoes = useRef(new Map());
    // As O.S. completas que o protótipo já mostrou: imprimir e duplicar usam a linha inteira.
    const linhas = useRef(new Map());
    const statusDe = useCallback(id => situacoes.current.get(id), []);
    const { iframeRef, modalOS } = useAbrirOSDoPrototipo(statusDe);

    // Guarda a situação das O.S. que chegam do banco (fora da renderização).
    const anotar = useCallback(lista => lista.forEach(p => { situacoes.current.set(p.id, p.status); linhas.current.set(p.id, p); }), []);

    const paraProto = useCallback(p => {
        return {
            id: p.id,
            cliente: mascararCliente(p.cliente, isDemo) || 'Sem cliente',
            problema: isClienteProblema(p.cliente, p.cliente_id),
            status: p.status,
            venda: p.data_pedido || '',
            prazo: p.prazo || '',
            hora: p.prazo_hora ? p.prazo_hora.slice(0, 5) : '',
            criado: p.criado_por || '',
            resp: (p.responsavel || '').split(',').map(s => s.trim()).filter(Boolean),
            cancelado: p.cancelado_em ? p.cancelado_em.slice(0, 10) : '',
            retirada: p.data_retirada || '',
            locais: (p.local_producao || 'Berlim').split(',').map(s => s.trim()).filter(Boolean),
            itens: [...(p.pedido_itens || [])].sort((a, b) => a.ordem - b.ordem).map(i => [i.nome || 'Item', i.descricao || '', i.valor_centavos || 0]),
            resumo: resumoDoPedido(p),
            valor: p.valor_total || 0,
            pago: Math.round((p.pedido_pagamentos || []).reduce((s, pg) => s + valorPagamentoComSinalCentavos(pg), 0) * 100),
            pags: (p.pedido_pagamentos || []).map(pg => [pg.forma || 'Pagamento', Math.round(valorPagamentoComSinalCentavos(pg) * 100), pg.data || '', !!pg.lote_id]),
        };
    }, [isDemo, isClienteProblema]);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/baixa.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    useEffect(() => {
        if (!usuario) return;
        let vivo = true;
        Promise.all(Object.entries(ABAS).map(async ([id, filtro]) => {
            const { data, count } = await filtro(supabase.from('pedidos').select(CAMPOS, { count: 'exact' }))
                .order('id', { ascending: false })
                .range(0, POR_ABA - 1);
            return [id, { total: count ?? (data || []).length, pedidos: data || [] }];
        })).then(r => {
            if (!vivo) return;
            r.forEach(([, a]) => anotar(a.pedidos));
            setAbas(Object.fromEntries(r));
        });
        return () => { vivo = false; };
    }, [usuario, anotar]);

    // O protótipo pede um filtro ou uma ordem; a página conta cada aba no banco
    // (só a contagem, sem trazer linhas, e só quando há filtro) e traz as
    // primeiras O.S. da aba aberta, já na ordem da setinha escolhida.
    useEffect(() => {
        async function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            const responder = r => quadro.contentWindow?.postMessage(r, '/');
            const linha = Number.isInteger(msg.id) ? linhas.current.get(msg.id) : null;
            if (msg.tipo === 'imprimir-os' && linha) return imprimirOS(linha);
            if (msg.tipo === 'duplicar-os' && linha) return duplicarOS(linha);
            // Dar baixa: só O.S. concluída que o protótipo mostrou, e só para quem
            // pode finalizar. O sistema marca quem deu a baixa como responsável.
            if (msg.tipo === 'baixar-os' && Array.isArray(msg.ids)) {
                if (!podeBaixar) return;
                msg.ids.filter(id => Number.isInteger(id) && situacoes.current.get(id) === 'Concluído').slice(0, 100).forEach(id => {
                    situacoes.current.set(id, 'Finalizado');
                    atualizarCampoInline(id, 'status', 'Finalizado');
                });
                return;
            }
            // Desfazer a baixa: volta para Concluído com o responsável de antes.
            if (msg.tipo === 'desfazer-baixa' && Array.isArray(msg.itens)) {
                if (!podeBaixar) return;
                msg.itens.filter(i => Number.isInteger(i?.id) && situacoes.current.get(i.id) === 'Finalizado').slice(0, 100).forEach(i => {
                    situacoes.current.set(i.id, 'Concluído');
                    atualizarCampoInline(i.id, 'status', 'Concluído');
                    if (typeof i.resp === 'string' && i.resp.length <= 300) atualizarCampoInline(i.id, 'responsavel', i.resp);
                    // Voltar para Concluído marca o prazo como hoje; o de antes volta junto.
                    if (i.prazo === null || (i.prazo !== '' && ehData(i.prazo))) atualizarCampoInline(i.id, 'prazo', i.prazo);
                });
                return;
            }
            if ((msg.tipo !== 'pedir-filtro' && msg.tipo !== 'pedir-mais') || !ABAS[msg.aba] || !ehData(msg.de || '') || !ehData(msg.ate || '')) return;
            const filtro = { de: msg.de || '', ate: msg.ate || '', busca: String(msg.busca || '').slice(0, 80) };
            // "Carregar mais 50": o pedaço seguinte, com o mesmo filtro e a mesma ordem.
            if (msg.tipo === 'pedir-mais') {
                const desde = Number.isInteger(msg.desde) && msg.desde >= 0 ? msg.desde : 0;
                try {
                    const busca = await prepararBusca(filtro.busca);
                    const lista = await buscarAba(msg, filtro, busca, desde, MAIS);
                    anotar(lista);
                    const pedidos = lista.map(paraProto);
                    const nomes = new Set(pedidos.flatMap(p => [p.criado, ...p.resp, ...p.locais]).filter(Boolean));
                    responder({ tipo: 'mais', pedido: msg.pedido, aba: msg.aba, pedidos, cores: Object.fromEntries([...nomes].map(n => [n, corDoNome(n)])) });
                } catch (err) {
                    responder({ tipo: 'mais-erro', pedido: msg.pedido, erro: err.message || 'Não deu para carregar mais O.S.' });
                }
                return;
            }
            try {
                const busca = await prepararBusca(filtro.busca);
                const [totais, linhas] = await Promise.all([
                    msg.contar === false ? null : Promise.all(Object.entries(ABAS).map(async ([id, daAba]) => {
                        const { count, error } = await filtrar(daAba(supabase.from('pedidos').select('id', { count: 'exact', head: true })), filtro, busca);
                        if (error) throw error;
                        return [id, count ?? 0];
                    })),
                    buscarAba(msg, filtro, busca, 0, POR_ABA),
                ]);
                anotar(linhas);
                const pedidos = linhas.map(paraProto);
                const nomes = new Set(pedidos.flatMap(p => [p.criado, ...p.resp, ...p.locais]).filter(Boolean));
                responder({
                    tipo: 'filtro', pedido: msg.pedido, aba: msg.aba,
                    totais: totais ? Object.fromEntries(totais) : null, pedidos,
                    cores: Object.fromEntries([...nomes].map(n => [n, corDoNome(n)])),
                });
            } catch (err) {
                responder({ tipo: 'filtro-erro', pedido: msg.pedido, erro: err.message || 'Não deu para filtrar as O.S.' });
            }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [iframeRef, paraProto, anotar, podeBaixar, atualizarCampoInline, imprimirOS, duplicarOS]);

    if (!modelo || !abas) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    const dadosAbas = Object.fromEntries(Object.entries(abas).map(([id, a]) => [id, { total: a.total, pedidos: a.pedidos.map(paraProto) }]));
    const nomes = new Set(Object.values(dadosAbas).flatMap(a => a.pedidos.flatMap(p => [p.criado, ...p.resp, ...p.locais])).filter(Boolean));
    const dados = {
        abas: dadosAbas,
        cores: Object.fromEntries([...nomes].map(n => [n, corDoNome(n)])),
        nivel: usuario?.nivel || '',
        eu: usuario?.nome || '',
    };
    // "<" escapado para um nome nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = prepararNoSistema(modelo.replace('/*BAIXA*/', `const DADOS = ${json};`));

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências; a rolagem fica toda dentro do protótipo.
    return (
        <>
            <iframe
                ref={iframeRef}
                title="Protótipo da nova tela de O.S."
                srcDoc={html}
                className="absolute inset-0 w-full h-full border-0"
            />
            {modalOS}
        </>
    );
}
