"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePedidos } from '@/context/PedidosContext';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { STATUSES_PRODUCAO, STATUSES_SEM_ATRASO } from '@/lib/utils/constants';
import { mascararCliente, valorPagamentoComSinalCentavos } from '@/lib/utils/formatters';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import { resumoDoPedido } from '@/lib/utils/servico';
import { useAbrirOSDoPrototipo } from '@/hooks/useAbrirOSDoPrototipo';
import LogoCarregando from '@/components/ui/LogoCarregando';
import { prepararNoSistema } from '@/lib/prototipos/noSistema';

// Protótipo da nova tela de Produção (opções A a D), aberto para a equipe
// comparar.
//
// Como em /novaos e /preprontos, o HTML em public/prototipos/producao.html é só
// a casca: as O.S. em produção entram aqui, lidas da sessão de quem está
// logado, no lugar do marcador /*PRODUCAO*/. A O.S. aberta — e a Nova O.S. — é o
// novo modal de O.S. por cima (useAbrirOSDoPrototipo), e esse grava. As cores de
// pessoa e de local vêm de corPorNome (via corDoNome), a mesma fonte da tela atual.
//
// O QUE SE MEXE NA LISTA GRAVA
// Status, responsável, prazo e horário, OK da arte, entrega, item feito,
// concluir, duplicar e imprimir: o protótipo pede por mensagem e esta página
// grava pelas MESMAS funções da tela atual (atualizarCampoInline,
// atualizarItemConcluido, duplicarOS, imprimirOS), com as mesmas regras —
// concluir marca o prazo como hoje, só entra status que o cargo pode usar.
//
// A casca é montada uma vez; depois, cada mudança nas O.S. (as daqui e as do
// tempo real) vai por mensagem. Recarregar o iframe a cada clique fecharia a
// gaveta e jogaria a pessoa para o topo.

// Os campos que a lista pode mudar, e o que cada um aceita.
const CAMPOS = {
    status: v => typeof v === 'string',
    responsavel: v => typeof v === 'string' && v.length <= 300,
    prazo: v => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v),
    prazo_hora: v => v === null || /^\d{2}:\d{2}$/.test(v),
    aprovado: v => typeof v === 'boolean',
    entrega: v => typeof v === 'boolean',
};

export default function Page() {
    const { pedidos, dadosCarregados, opcoesStatusPermitidas, atualizarCampoInline, atualizarItemConcluido, duplicarOS, imprimirOS } = usePedidos();
    const { usuario, usuariosSistema, isDemo } = useSessao();
    const { isClienteProblema } = useClientes();
    const [modelo, setModelo] = useState(null);
    // Só O.S. em produção chegam aqui; nenhuma está baixada.
    const { iframeRef, modalOS } = useAbrirOSDoPrototipo();

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/producao.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    const dados = useMemo(() => {
    const lista = pedidos.filter(p => STATUSES_PRODUCAO.includes(p.status)).map(p => ({
        id: p.id,
        cliente: mascararCliente(p.cliente, isDemo) || 'Sem cliente',
        problema: isClienteProblema(p.cliente, p.cliente_id),
        prazo: p.prazo || '',
        hora: p.prazo_hora ? p.prazo_hora.slice(0, 5) : '',
        resp: (p.responsavel || '').split(',').map(s => s.trim()).filter(Boolean),
        status: p.status,
        arte: !!p.aprovado,
        entrega: !!p.entrega,
        locais: (p.local_producao || 'Berlim').split(',').map(s => s.trim()).filter(Boolean),
        itens: [...(p.pedido_itens || [])].sort((a, b) => a.ordem - b.ordem).map(i => [i.id, i.nome || 'Item', !!i.concluido, i.descricao || '']),
        resumo: resumoDoPedido(p),
        valor: p.valor_total || 0,
        pago: Math.round((p.pedido_pagamentos || []).reduce((s, pg) => s + valorPagamentoComSinalCentavos(pg), 0) * 100),
        venda: p.data_pedido || '',
    }));
    const equipe = usuariosSistema.filter(u => u.nivel !== 'demo').map(u => u.nome);
    const nomes = new Set([...equipe, ...lista.flatMap(p => [...p.resp, ...p.locais])]);
    return {
        pedidos: lista,
        equipe,
        cores: Object.fromEntries([...nomes].map(n => [n, corDoNome(n)])),
        status: STATUSES_PRODUCAO,
        // As etapas em que prazo vencido não é atraso: a mesma regra do sistema.
        semAtraso: STATUSES_SEM_ATRASO,
        permitidos: opcoesStatusPermitidas,
        eu: usuario?.nome || '',
    };
    }, [pedidos, usuariosSistema, opcoesStatusPermitidas, usuario, isDemo, isClienteProblema]);

    // Montada uma vez, quando o modelo e as O.S. chegam; o resto vai por mensagem.
    const html = useMemo(() => {
        if (!modelo || !dadosCarregados) return null;
        // "<" escapado para um nome nunca fechar o <script> do protótipo.
        const json = JSON.stringify(dados).replace(/</g, '\\u003c');
        return prepararNoSistema(modelo.replace('/*PRODUCAO*/', `const DADOS = ${json};`));
    }, [modelo, dadosCarregados]); // eslint-disable-line react-hooks/exhaustive-deps
    const dadosRef = useRef(dados);
    useEffect(() => {
        dadosRef.current = dados;
        if (html) iframeRef.current?.contentWindow?.postMessage({ tipo: 'dados', pedidos: dados.pedidos, cores: dados.cores }, '/');
    }, [html, dados, iframeRef]);

    // Os pedidos do protótipo: só para O.S. que estão na lista, e só com valores válidos.
    useEffect(() => {
        function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            const enviar = () => quadro.contentWindow?.postMessage({ tipo: 'dados', pedidos: dadosRef.current.pedidos, cores: dadosRef.current.cores }, '/');
            if (msg.tipo === 'pronto') return enviar();
            const pedido = Number.isInteger(msg.id) ? pedidos.find(p => p.id === msg.id) : null;
            if (!pedido) return;
            if (msg.tipo === 'mudar-campo') {
                const valido = CAMPOS[msg.campo];
                if (!valido || !valido(msg.valor)) return;
                // Status: só os que o cargo pode usar (Concluído é o "Concluir O.S.").
                if (msg.campo === 'status' && msg.valor !== 'Concluído' && !opcoesStatusPermitidas.includes(msg.valor)) return enviar();
                return atualizarCampoInline(pedido.id, msg.campo, msg.valor);
            }
            if (msg.tipo === 'item-os' && Number.isInteger(msg.item) && typeof msg.concluido === 'boolean') {
                if (!(pedido.pedido_itens || []).some(i => i.id === msg.item)) return;
                return atualizarItemConcluido(pedido.id, msg.item, msg.concluido);
            }
            if (msg.tipo === 'duplicar-os') return duplicarOS(pedido);
            if (msg.tipo === 'imprimir-os') return imprimirOS(pedido);
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [pedidos, opcoesStatusPermitidas, atualizarCampoInline, atualizarItemConcluido, duplicarOS, imprimirOS, iframeRef]);

    if (!html) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências; a rolagem fica toda dentro do protótipo.
    return (
        <>
            <iframe
                ref={iframeRef}
                title="Protótipo da nova tela de Produção"
                srcDoc={html}
                className="absolute inset-0 w-full h-full border-0"
            />
            {modalOS}
        </>
    );
}
