"use client";
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { usePedidos } from '@/context/PedidosContext';
import { useCadastros } from '@/context/CadastrosContext';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { useUi } from '@/context/UiContext';
import { mascararCliente, parseValorMoeda } from '@/lib/utils/formatters';
import { itensDoPedido, pagamentosDoPedido, observacoesDoPedido } from '@/lib/utils/servico';
import { carregarModeloNovaOS, montarNovaOS } from '@/lib/prototipos/novaos';

// O novo modal de O.S. (o protótipo de /novaos) aberto por cima das telas novas,
// com a O.S. real — no lugar do modal antigo.
//
// SÓ MOSTRA, NÃO GRAVA
// O protótipo ainda não sabe gravar. Ele abre com os dados de verdade, deixa
// mexer na tela à vontade, mas o Atualizar fica desligado e um "Editar no
// modal atual" leva ao modal de hoje, que é quem grava.
//
// A O.S. vem do banco só agora, ao abrir — itens e pagamentos inclusive —, como
// no abrirEdicao(): a lista da tela de trás não carrega isso.
//
// O iframe ocupa a tela toda e é transparente: o véu e a janela são desenhados
// pelo próprio protótipo. Vai por portal para o body, fora da página — o layout
// deixa a página inerte enquanto há modal na pilha, e o iframe junto ficaria
// sem receber clique. A pilha e o histórico ficam com quem abre a janela
// (useAbrirOSDoPrototipo).

async function buscarPedido(id) {
    const { data } = await supabase.from('pedidos')
        .select('*, pedido_itens(*), pedido_pagamentos(*)')
        .eq('id', id).maybeSingle();
    if (!data) return null;
    let telefone = '';
    if (data.cliente_id) {
        const { data: cliente } = await supabase.from('clientes').select('telefone').eq('id', data.cliente_id).maybeSingle();
        telefone = cliente?.telefone || '';
    }
    return { pedido: data, telefone };
}

export default function NovaOSPorCima({ id, aoFechar }) {
    const { abrirEdicao } = usePedidos();
    const { produtos, fornecedoresTerceirizacaoNomes } = useCadastros();
    const { usuariosSistema, darkMode, isDemo } = useSessao();
    const { isClienteProblema } = useClientes();
    const { avisar } = useUi();
    const [modelo, setModelo] = useState(null);
    const [achado, setAchado] = useState(null);
    const [carregou, setCarregou] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        let vivo = true;
        Promise.all([carregarModeloNovaOS(), buscarPedido(id)]).then(([html, resultado]) => {
            if (!vivo) return;
            if (!resultado) { avisar('Não foi possível carregar esta O.S. Tente novamente.', 'erro'); aoFechar(); return; }
            setModelo(html);
            setAchado(resultado);
        }).catch(() => { if (vivo) { avisar('Não foi possível abrir a O.S. Tente novamente.', 'erro'); aoFechar(); } });
        return () => { vivo = false; };
    }, [id, avisar, aoFechar]);

    // O protótipo fala por mensagem: fechar (X, Esc, clique no véu) e "Editar no
    // modal atual", que troca esta janela pelo modal de hoje.
    useEffect(() => {
        function aoReceber(e) {
            if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
            if (e.data?.tipo === 'fechar-os') aoFechar();
            if (e.data?.tipo === 'editar-no-atual') { aoFechar(); abrirEdicao({ id }); }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [id, aoFechar, abrirEdicao]);

    let html = null;
    if (modelo && achado) {
        const { pedido: p, telefone } = achado;
        const os = {
            id: p.id,
            cliente: { nome: mascararCliente(p.cliente, isDemo) || 'Sem cliente', tel: isDemo ? '' : telefone, problema: isClienteProblema(p.cliente, p.cliente_id) },
            venda: p.data_pedido || '',
            prazo: p.prazo || '',
            hora: p.prazo_hora ? p.prazo_hora.slice(0, 5) : '',
            status: p.status,
            resp: (p.responsavel || '').split(',').map(s => s.trim()).filter(Boolean),
            entrega: !!p.entrega,
            obs: observacoesDoPedido(p),
            // O valor final de cada item vai pronto: refazer a conta do desconto
            // aqui podia errar um centavo e o total deixaria de bater com o da O.S.
            itens: itensDoPedido(p).map(i => {
                const final = parseValorMoeda(i.valor);
                return { nome: i.nome || '', esp: i.descricao || '', local: i.local_producao || 'Berlim', bruto: i.valor_original ? parseValorMoeda(i.valor_original) : final, desc: parseInt(i.desconto, 10) || 0, final };
            }),
            pags: pagamentosDoPedido(p).map(g => ({ forma: g.forma, valor: parseValorMoeda(g.valor), data: g.data || '', inst: g.instituicao || '', band: g.bandeira || '', parc: g.parcelas || 1, lote: !!g.lote_id })),
        };
        html = montarNovaOS(modelo, { produtos, locais: fornecedoresTerceirizacaoNomes.map(f => f.nome), usuariosSistema, os, escuro: darkMode });
    }

    // Enquanto a O.S. chega, o véu já aparece — da mesma cor do véu do
    // protótipo, que assume no lugar dele quando o iframe termina de carregar.
    // O esquema de cor do iframe acompanha o tema: com esquemas diferentes dos
    // dois lados, o navegador pinta um fundo opaco atrás dele.
    return createPortal(
        <div className="fixed inset-0 z-[60] no-print">
            {!carregou && <div className="absolute inset-0 bg-[rgba(15,23,42,.42)] dark:bg-[rgba(0,0,0,.72)] animate-modal-backdrop" />}
            {html && (
                <iframe
                    ref={iframeRef}
                    title={`O.S. #${id}`}
                    srcDoc={html}
                    onLoad={(e) => { setCarregou(true); e.currentTarget.focus(); }}
                    className="absolute inset-0 w-full h-full border-0"
                    style={{ colorScheme: darkMode ? 'dark' : 'light', opacity: carregou ? 1 : 0 }}
                />
            )}
        </div>,
        document.body,
    );
}
