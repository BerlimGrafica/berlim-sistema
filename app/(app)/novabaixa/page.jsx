"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { mascararCliente, valorPagamentoComSinalCentavos } from '@/lib/utils/formatters';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import { resumoDoPedido } from '@/lib/utils/servico';
import { useAbrirOSDoPrototipo } from '@/hooks/useAbrirOSDoPrototipo';

// Protótipo da nova tela de O.S. (o Histórico/Baixa do menu): abas por situação
// e lista agrupada por mês da venda, a opção escolhida pela equipe.
//
// Como em /novaproducao, o HTML em public/prototipos/baixa.html é só a casca: as
// O.S. entram aqui, lidas com a sessão de quem está logado, no lugar do marcador
// /*BAIXA*/. As cinco abas usam os mesmos filtros do Histórico (fetchHistorico em
// context/AppContext.jsx), mas cada uma traz só as primeiras O.S. — o total vem
// da contagem do banco. Só leitura: nada lá dentro grava.
const POR_ABA = 80;
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

export default function Page() {
    const { usuario, isDemo } = useSessao();
    const { isClienteProblema } = useClientes();
    const [modelo, setModelo] = useState(null);
    const [abas, setAbas] = useState(null);
    const { iframeRef, modalOS } = useAbrirOSDoPrototipo(id => abas && Object.values(abas).flatMap(a => a.pedidos).find(p => p.id === id)?.status);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/baixa.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    useEffect(() => {
        if (!usuario) return;
        let vivo = true;
        Promise.all(Object.entries(ABAS).map(async ([id, filtro]) => {
            const { data, count } = await filtro(supabase.from('pedidos').select('*, pedido_itens(*), pedido_pagamentos(*)', { count: 'exact' }))
                .order('id', { ascending: false })
                .range(0, POR_ABA - 1);
            return [id, { total: count ?? (data || []).length, pedidos: data || [] }];
        })).then(r => { if (vivo) setAbas(Object.fromEntries(r)); });
        return () => { vivo = false; };
    }, [usuario]);

    if (!modelo || !abas) {
        return <div className="p-6 text-corpo text-tinta-suave">Carregando protótipo…</div>;
    }

    const paraProto = p => ({
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
        pags: (p.pedido_pagamentos || []).map(pg => [pg.forma || 'Pagamento', Math.round(valorPagamentoComSinalCentavos(pg) * 100), pg.data || '']),
    });
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
    const html = modelo.replace('/*BAIXA*/', `const DADOS = ${json};`);

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
