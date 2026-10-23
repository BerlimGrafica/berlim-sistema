"use client";
import { useEffect, useState } from 'react';
import { usePedidos } from '@/context/PedidosContext';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { STATUSES_PRODUCAO } from '@/lib/utils/constants';
import { mascararCliente, valorPagamentoComSinalCentavos, corPorNome } from '@/lib/utils/formatters';
import { resumoDoPedido } from '@/lib/utils/servico';

// Protótipo da nova tela de Produção (opções A a D), aberto para a equipe
// comparar.
//
// Como em /novaos e /preprontos, o HTML em public/prototipos/producao.html é só
// a casca: as O.S. em produção entram aqui, lidas da sessão de quem está
// logado, no lugar do marcador /*PRODUCAO*/. Tudo o que se mexe lá dentro
// (status, itens, prazo...) fica só na tela — nada grava no banco.

// As cores de pessoa e de local vêm de corPorNome, a mesma fonte da tela atual
// (chips de responsável, chat, locais). Ela devolve classes do Tailwind; o
// protótipo é HTML puro, então traduzimos para o hex de cada uma.
const HEX_POR_CLASSE = {
    'bg-green-500': '#22c55e', 'bg-black': '#000000', 'bg-purple-400': '#c084fc', 'bg-red-500': '#ef4444',
    'bg-yellow-400': '#facc15', 'bg-orange-500': '#f97316', 'bg-blue-500': '#3b82f6', 'bg-fuchsia-500': '#d946ef',
    'bg-teal-600': '#0d9488', 'bg-teal-500': '#14b8a6', 'bg-lime-600': '#65a30d', 'bg-rose-500': '#f43f5e',
    'bg-indigo-500': '#6366f1', 'bg-slate-500': '#64748b', 'bg-amber-500': '#f59e0b', 'bg-emerald-500': '#10b981',
    'bg-sky-500': '#0ea5e9',
};
const corDoNome = (nome) => {
    const { bg, text } = corPorNome(nome);
    return [HEX_POR_CLASSE[bg] || '#64748b', text === 'text-gray-900' ? '#111827' : '#ffffff'];
};

export default function Page() {
    const { pedidos, dadosCarregados, opcoesStatusPermitidas } = usePedidos();
    const { usuario, usuariosSistema, isDemo } = useSessao();
    const { isClienteProblema } = useClientes();
    const [modelo, setModelo] = useState(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/producao.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    if (!modelo || !dadosCarregados) {
        return <div className="p-6 text-corpo text-tinta-suave">Carregando protótipo…</div>;
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
        <iframe
            title="Protótipo da nova tela de Produção"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
