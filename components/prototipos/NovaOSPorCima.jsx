"use client";
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { usePedidos } from '@/context/PedidosContext';
import { useCadastros } from '@/context/CadastrosContext';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { useUi } from '@/context/UiContext';
import { mascararCliente, parseValorMoeda, formatarMoeda, obterDataAtual, rotuloCliente } from '@/lib/utils/formatters';
import { itensDoPedido, pagamentosDoPedido, observacoesDoPedido } from '@/lib/utils/servico';
import { buscarClientes } from '@/lib/clientes/busca';
import { carregarModeloNovaOS, montarNovaOS } from '@/lib/prototipos/novaos';
import { buscarLotes } from '@/lib/pedidos/lotes';

// O novo modal de O.S. (public/prototipos/novaos.html) aberto por cima das
// telas novas, no lugar do modal antigo: com uma O.S. real (`id`) ou vazio,
// para uma O.S. nova (`id === 'nova'`).
//
// GRAVA PELO MESMO CAMINHO DO MODAL DE HOJE
// O HTML não fala com o banco. Ele pede por mensagem e esta página responde:
//   salvar-os          → gravarOS (AppContext), o miolo do salvarOS: mesmas
//                        regras de status, datas, nº novo e itens/pagamentos
//   buscar-clientes    → a mesma busca do modal de hoje (lib/clientes/busca.js)
//   cadastrar-cliente  → criarCliente (WhatsApp repetido não entra)
//   cadastrar-produto  → criarProduto
//   pagar-lote         → registrarPagamentoLoteOutrasOS: as partes de todas as
//                        O.S. (esta inclusive) gravam juntas, ou nenhuma
//   remover-lote       → removerPagamentoLote: tira a parte das outras O.S.
//   trocar-os          → abre outra O.S. no lugar desta (a outra parte do lote)
//   fechar-os          → fecha
// Cada pedido leva um número (`n`) e a resposta volta com ele.
//
// A O.S. vem do banco só agora, ao abrir — itens e pagamentos inclusive —, como
// no abrirEdicao(): a lista da tela de trás não carrega isso.
//
// O HTML é montado UMA vez, com os dados do momento em que a O.S. chegou. Se
// fosse remontado a cada render, qualquer mudança no catálogo ou na equipe (o
// tempo real) trocaria o srcDoc e recarregaria o iframe — e o que a pessoa
// digitou sumiria.
//
// O iframe ocupa a tela toda e é transparente: o véu e a janela são desenhados
// pelo próprio HTML. Vai por portal para o body, fora da página — o layout
// deixa a página inerte enquanto há modal na pilha, e o iframe junto ficaria
// sem receber clique. A pilha e o histórico ficam com quem abre a janela
// (useAbrirOSDoPrototipo), que pede o fechamento com o evento PEDIR_FECHAR_OS —
// assim o modal pergunta antes de descartar o que mudou.

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

const reaisDeCentavos = c => formatarMoeda(String(Math.round(Number(c) || 0)));
const dataCurta = iso => iso ? iso.slice(0, 10).split('-').reverse().slice(0, 2).join('/') : '';

export const PEDIR_FECHAR_OS = 'berlim:pedir-fechar-os';

export default function NovaOSPorCima({ id, aoFechar, aoTrocar }) {
    const nova = id === 'nova';
    const { gravarOS, imprimirOS, buscarOutrasOSAbertasDoCliente, registrarPagamentoLoteOutrasOS, removerPagamentoLote, criarCliente, criarProduto, opcoesStatusPermitidas, dadosCarregados } = usePedidos();
    const { produtos, fornecedoresTerceirizacaoNomes } = useCadastros();
    const { usuario, usuariosSistema, darkMode, isDemo, isOperador } = useSessao();
    const { isClienteProblema } = useClientes();
    const { avisar } = useUi();
    const [modelo, setModelo] = useState(null);
    // { pedido, telefone, outras, lotes } — pedido null numa O.S. nova.
    const [achado, setAchado] = useState(null);
    // A O.S. como está no banco: muda quando uma O.S. nova grava o cabeçalho e
    // não os itens — o próximo Salvar completa esta, em vez de criar outra.
    const [antes, setAntes] = useState(null);
    const [html, setHtml] = useState(null);
    const [carregou, setCarregou] = useState(false);
    const iframeRef = useRef(null);
    const salvandoRef = useRef(false);

    useEffect(() => {
        let vivo = true;
        const falhou = msg => { if (vivo) { avisar(msg, 'erro'); aoFechar(); } };
        (async () => {
            const [tpl, resultado] = await Promise.all([carregarModeloNovaOS(), nova ? null : buscarPedido(id)]);
            if (!nova && !resultado) return falhou('Não foi possível carregar esta O.S. Tente novamente.');
            // As outras O.S. do cliente com saldo, para o pagamento em lote.
            const p = resultado?.pedido;
            // E os pagamentos em lote que ela já tem: o pagamento inteiro e as
            // outras O.S. que dividiram com ela. Só busca se há algum.
            const [outras, lotes] = await Promise.all([
                p?.cliente_id ? buscarOutrasOSAbertasDoCliente(p.id, p.cliente_id) : [],
                buscarLotes((p?.pedido_pagamentos || []).map(g => g.lote_id)),
            ]);
            if (!vivo) return;
            setModelo(tpl);
            setAchado({ pedido: p || null, telefone: resultado?.telefone || '', outras, lotes });
            setAntes(p || null);
        })().catch(() => falhou('Não foi possível abrir a O.S. Tente novamente.'));
        return () => { vivo = false; };
    }, [id, nova, avisar, aoFechar, buscarOutrasOSAbertasDoCliente]);

    // Monta o HTML uma vez só, quando a O.S. e o catálogo estão à mão (ajustado
    // durante a renderização, como no resto do sistema, em vez de num efeito).
    if (!html && modelo && achado && dadosCarregados) {
        const { pedido: p, telefone, outras, lotes } = achado;
        const os = p ? {
            id: p.id,
            cliente: p.cliente ? { id: p.cliente_id || null, nome: mascararCliente(p.cliente, isDemo), tel: isDemo ? '' : telefone, problema: isClienteProblema(p.cliente, p.cliente_id) } : null,
            venda: p.data_pedido || '',
            prazo: p.prazo || '',
            hora: p.prazo_hora ? p.prazo_hora.slice(0, 5) : '',
            status: p.status,
            resp: (p.responsavel || '').split(',').map(s => s.trim()).filter(Boolean),
            entrega: !!p.entrega,
            obs: observacoesDoPedido(p),
            // O valor final de cada item vai pronto: refazer a conta do desconto
            // aqui podia errar um centavo e o total deixaria de bater com o da O.S.
            // O "concluído" de cada item vem junto para não se perder ao gravar.
            itens: itensDoPedido(p).map(i => {
                const final = parseValorMoeda(i.valor);
                return { prodId: i.id_produto || null, nome: i.nome || '', esp: i.descricao || '', local: i.local_producao || 'Berlim', bruto: i.valor_original ? parseValorMoeda(i.valor_original) : final, desc: parseInt(i.desconto, 10) || 0, final, concluido: !!i.concluido };
            }),
            // O que a tela não mostra (vencimento e baixa do boleto, lote) volta
            // intacto em `extra`.
            pags: pagamentosDoPedido(p).map(g => ({
                forma: g.forma, valor: parseValorMoeda(g.valor), data: g.data || '', inst: g.instituicao || '', band: g.bandeira || '', parc: g.parcelas || 1, lote: !!g.lote_id,
                extra: { vencimento_boleto: g.vencimento_boleto || null, boleto_concluido: g.boleto_concluido ?? null, lote_id: g.lote_id || null },
            })),
        } : {
            id: null, cliente: null, venda: obterDataAtual(), prazo: '', hora: '',
            status: 'Produzir', resp: [], entrega: false, obs: '', itens: [], pags: [],
        };
        // O mesmo que o modal de hoje deixa: os status do nível de quem está
        // logado; Finalizar só para Administrador e Financeiro; O.S. baixada
        // trancada para Atendimento e Produção. A conta de demonstração só vê.
        const permissoes = {
            status: opcoesStatusPermitidas,
            podeFinalizar: usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro',
            trancado: isDemo || (!!p && p.status === 'Finalizado' && isOperador),
        };
        const outrasOS = outras.map(o => ({ id: o.id, data: dataCurta(o.data_pedido), saldo: Math.round(o.saldo * 100) / 100 }));
        // Os lotes em reais, como o resto do modal. Uma O.S. baixada não abre
        // para Atendimento e Produção, então para eles o número dela não é link.
        const lotesOS = Object.fromEntries(Object.entries(lotes || {}).map(([lote, l]) => [lote, {
            total: l.total / 100, forma: l.forma,
            partes: l.partes.map(x => ({ id: x.id, valor: x.valor / 100, baixada: x.status === 'Finalizado', abre: !!aoTrocar && !(isOperador && x.status === 'Finalizado') })),
        }]));
        setHtml(montarNovaOS(modelo, { produtos, locais: fornecedoresTerceirizacaoNomes.map(f => f.nome), usuariosSistema, os, permissoes, outras: outrasOS, lotes: lotesOS, escuro: darkMode }));
    }

    // Quem abriu a janela (Esc fora do iframe, voltar do navegador) pede o
    // fechamento com o evento PEDIR_FECHAR_OS: o modal pergunta antes de
    // descartar o que mudou. Ainda carregando, não há o que perder: fecha.
    useEffect(() => {
        const aoPedir = () => {
            const janela = carregou && iframeRef.current?.contentWindow;
            if (janela) janela.postMessage({ tipo: 'pedir-fechar' }, '/');
            else aoFechar();
        };
        window.addEventListener(PEDIR_FECHAR_OS, aoPedir);
        return () => window.removeEventListener(PEDIR_FECHAR_OS, aoPedir);
    }, [carregou, aoFechar]);

    useEffect(() => {
        const responder = (n, dados) => iframeRef.current?.contentWindow?.postMessage({ n, ...dados }, '/');
        const comoCliente = c => ({ id: c.id, nome: mascararCliente(rotuloCliente(c), isDemo), tel: isDemo ? '' : (c.telefone || ''), problema: !!c.cliente_problema });

        async function salvar(n, o, imprimir) {
            if (salvandoRef.current) return;
            salvandoRef.current = true;
            try {
                const itens = o.itens.map(i => ({
                    id_produto: i.prodId || null, nome: i.nome || '', descricao: i.esp || '',
                    valor: reaisDeCentavos(i.final), valor_original: reaisDeCentavos(i.bruto),
                    desconto: i.desc ? String(i.desc) : '', local_producao: i.local || 'Berlim', concluido: !!i.concluido,
                }));
                const pagamentos = o.pags.map(g => ({
                    forma: g.forma, valor: reaisDeCentavos(g.valor), parcelas: g.parc || 1,
                    instituicao: g.inst || '', bandeira: g.band || '', data: g.data || obterDataAtual(),
                    vencimento_boleto: g.extra?.vencimento_boleto || null, boleto_concluido: g.extra?.boleto_concluido ?? null, lote_id: g.extra?.lote_id || null,
                }));
                // O total é a soma dos itens. Uma O.S. antiga sem item nenhum
                // guarda o valor que foi digitado à mão: esse fica como está.
                const soma = o.itens.reduce((s, i) => s + Math.round(i.final), 0);
                const r = await gravarOS({
                    antes,
                    campos: {
                        cliente: o.cliente.nome, cliente_id: o.cliente.id || null, servico: o.obs || '',
                        status: o.status, valor_total: o.itens.length ? soma : (antes?.valor_total || 0),
                        data_pedido: o.venda || null, prazo: o.prazo || null, prazo_hora: o.hora || '',
                        responsavel: o.resp.join(', '), aprovado: antes?.aprovado || false, entrega: !!o.entrega,
                    },
                    itens, pagamentos,
                });
                if (r.semItens) {
                    if (!antes) setAntes(r.pedido);
                    responder(n, { ok: false, viraEdicao: r.pedido.id });
                    return;
                }
                if (!r.pedido && !r.recarregou) { responder(n, { ok: false }); return; }
                const numero = r.pedido?.id || antes?.id;
                avisar(numero ? `O.S. #${numero} ${antes ? 'atualizada' : 'criada'}.` : 'O.S. salva.', 'sucesso');
                aoFechar();
                if (imprimir) {
                    if (r.pedido) imprimirOS(r.pedido);
                    else avisar('Para evitar lentidão, imprima esta O.S. pelo Histórico.', 'sucesso');
                }
            } finally {
                salvandoRef.current = false;
            }
        }

        async function pagarLote(n, metadados, alocacoes, valorDesta) {
            const porId = new Map(achado.outras.map(o => [o.id, o]));
            const lista = alocacoes.map(a => ({ pedido: porId.get(a.id), valorAlocado: reaisDeCentavos(a.valor) })).filter(a => a.pedido);
            if (!lista.length) { responder(n, { ok: false }); return; }
            const loteId = `lote_${Date.now()}`;
            // A parte desta O.S. grava junto com as das outras: ou entram todas,
            // ou nenhuma. O modal a põe na lista e salva a O.S. em seguida.
            const atual = antes?.id && valorDesta > 0 ? { pedidoId: antes.id, valorAlocado: reaisDeCentavos(valorDesta) } : null;
            const resultado = await registrarPagamentoLoteOutrasOS(loteId, metadados, lista, atual);
            if (resultado.sucesso) avisar(`Pagamento registrado em ${1 + lista.length} O.S.`, 'sucesso');
            responder(n, resultado.sucesso ? { ok: true, loteId } : { ok: false });
        }

        // Desfazer um lote inteiro: só os lotes que esta O.S. tem, e só quando
        // nenhuma das outras O.S. está baixada (o modal nem oferece).
        async function removerLote(n, loteId) {
            const lote = achado.lotes?.[loteId];
            if (!antes?.id || !lote || lote.partes.some(x => x.id !== antes.id && x.status === 'Finalizado')) { responder(n, { ok: false }); return; }
            const resultado = await removerPagamentoLote(loteId, antes.id);
            responder(n, { ok: !!resultado.sucesso });
        }

        function aoReceber(e) {
            if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
            const d = e.data || {};
            if (d.tipo === 'fechar-os') aoFechar();
            if (d.tipo === 'salvar-os') salvar(d.n, d.os, !!d.imprimir);
            if (d.tipo === 'buscar-clientes') {
                buscarClientes(d.q).then(lista => responder(d.n, { lista: lista.map(comoCliente) }));
            }
            if (d.tipo === 'cadastrar-cliente') {
                criarCliente(d.dados || {}).then(r => {
                    if (r.erro) avisar(r.erro, 'erro');
                    responder(d.n, r.cliente ? { cliente: comoCliente(r.cliente) } : { erro: r.erro });
                });
            }
            if (d.tipo === 'cadastrar-produto') {
                criarProduto(d.dados || {}).then(r => {
                    if (r.erro) avisar(r.erro, 'erro');
                    responder(d.n, r.produto ? { produto: [r.produto.id, r.produto.nome, r.produto.preco_base || 0, r.produto.texto_padrao || ''] } : { erro: r.erro });
                });
            }
            if (d.tipo === 'pagar-lote' && achado) pagarLote(d.n, d.metadados || {}, d.alocacoes || [], Number(d.atual) || 0);
            if (d.tipo === 'remover-lote' && achado) removerLote(d.n, String(d.loteId || ''));
            if (d.tipo === 'trocar-os' && Number.isInteger(d.id)) aoTrocar?.(d.id);
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [antes, achado, aoFechar, aoTrocar, avisar, gravarOS, imprimirOS, registrarPagamentoLoteOutrasOS, removerPagamentoLote, criarCliente, criarProduto, isDemo]);

    // Enquanto a O.S. chega, o véu já aparece — da mesma cor do véu do
    // modal, que assume no lugar dele quando o iframe termina de carregar.
    // O esquema de cor do iframe acompanha o tema: com esquemas diferentes dos
    // dois lados, o navegador pinta um fundo opaco atrás dele.
    return createPortal(
        <div className="fixed inset-0 z-[60] no-print">
            {!carregou && <div className="absolute inset-0 bg-[rgba(15,23,42,.42)] dark:bg-[rgba(0,0,0,.72)] animate-modal-backdrop" />}
            {html && (
                <iframe
                    ref={iframeRef}
                    title={nova ? 'Nova O.S.' : `O.S. #${id}`}
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
