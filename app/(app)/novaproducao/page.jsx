"use client";
import { useEffect, useState } from 'react';
import { usePedidos } from '@/context/PedidosContext';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { STATUSES_PRODUCAO } from '@/lib/utils/constants';
import { mascararCliente, valorPagamentoComSinalCentavos } from '@/lib/utils/formatters';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import { resumoDoPedido } from '@/lib/utils/servico';
import { useAbrirOSDoPrototipo } from '@/hooks/useAbrirOSDoPrototipo';
import BarraDeCor from '@/components/ui/BarraDeCor';

// Protótipo da nova tela de Produção (opções A a D), aberto para a equipe
// comparar.
//
// Como em /novaos e /preprontos, o HTML em public/prototipos/producao.html é só
// a casca: as O.S. em produção entram aqui, lidas da sessão de quem está
// logado, no lugar do marcador /*PRODUCAO*/. Tudo o que se mexe lá dentro
// (status, itens, prazo...) fica só na tela — nada grava no banco. As cores de
// pessoa e de local vêm de corPorNome (via corDoNome), a mesma fonte da tela atual.
export default function Page() {
    const { pedidos, dadosCarregados, opcoesStatusPermitidas } = usePedidos();
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

    if (!modelo || !dadosCarregados) {
        return <div className="min-h-[60vh] grid place-items-center"><BarraDeCor mostrarTexto texto="Carregando protótipo" /></div>;
    }

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
    const dados = {
        pedidos: lista,
        equipe,
        cores: Object.fromEntries([...nomes].map(n => [n, corDoNome(n)])),
        status: STATUSES_PRODUCAO,
        permitidos: opcoesStatusPermitidas,
        eu: usuario?.nome || '',
    };
    // "<" escapado para um nome nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*PRODUCAO*/', `const DADOS = ${json};`);

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
