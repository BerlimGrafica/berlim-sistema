"use client";
import { useEffect, useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { useCadastros } from '@/context/CadastrosContext';
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import { usePedidos } from '@/context/PedidosContext';
import { useContaDoPrototipo } from '@/hooks/useContaDoPrototipo';
import { useAbrirOSDoPrototipo } from '@/hooks/useAbrirOSDoPrototipo';
import { buscarContasReceber } from '@/lib/financeiro/receber';
import { buscarBoletos } from '@/lib/financeiro/boletos';
import { buscarNotasConcluidas } from '@/lib/financeiro/notas';
import { ouvirPedidosMudados } from '@/lib/pedidos/mudancas';
import { CATEGORIAS_CONTA } from '@/lib/utils/constants';
import { formatarMoeda, mascararCliente, obterDataAtual } from '@/lib/utils/formatters';
import BarraDeCor from '@/components/ui/BarraDeCor';

// Protótipo da nova tela do Financeiro, no padrão do DESIGN.md: as cinco partes
// numa tela só, com abas. Contas a pagar é o protótipo de /novascontas.
//
// Como nos outros protótipos, public/prototipos/financeiro.html é só a casca.
// - Contas a pagar, Faturamento e Notas fiscais já estão na memória: entram
//   junto do HTML, no lugar do marcador /*FINANCEIRO*/, sem consulta nova.
// - Contas a receber e Boletos o protótipo PEDE por mensagem quando a aba abre:
//   a vista contas_receber (uma linha por O.S. que deve, somada no banco) e os
//   boletos lidos pelo lado do pagamento (lib/financeiro/). Nada é lido sem a
//   aba aberta, e nada em laço. Depois, o tempo real diz quais O.S. mudaram
//   (lib/pedidos/mudancas.js) e o protótipo relê só essas, no mesmo período.
// Quase nada grava aqui: "Abrir O.S." abre a O.S. real por cima
// (useAbrirOSDoPrototipo); conta, nota e empresa abrem os modais de hoje, que
// gravam. A exceção são os dados do boleto (CNPJ, número, valor, emissão,
// vencimento, protesto) e o "pago": gravam de verdade, pelas MESMAS funções da
// tela de Boletos de hoje (atualizarCampoInline / atualizarPagamentoBoleto), com
// as mesmas permissões — não há modal para levar esse preenchimento.
// created_at é um instante em UTC; a data que importa é a do dia em Brasília.
const dataLocalDe = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const ehData = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

// Os campos do boleto que moram na O.S. e o tipo de valor que cada um aceita.
// Só estes passam: a mensagem vem do iframe e não escolhe coluna à vontade.
const CAMPOS_BOLETO = {
    boleto_cnpj: v => typeof v === 'string' && v.length <= 20,
    boleto_numero: v => typeof v === 'string' && v.length <= 60,
    boleto_data_emissao: v => v === '' || ehData(v),
    prazo_pagamento: v => v === '' || ehData(v),
    boleto_protesto_negativacao: v => typeof v === 'boolean',
};

// Uma nota no formato do protótipo (no modo demonstração, sem dado pessoal).
const notaParaProto = (n, isDemo) => ({
    id: n.id, cliente: mascararCliente(n.cliente || '', isDemo), razao: isDemo ? '' : (n.razao_social || ''), cnpj: isDemo ? '' : (n.cnpj || ''),
    contato: isDemo ? '' : (n.contato || ''), envio: n.forma_envio || '', tipo: n.tipo_nota || '', servico: n.servico_feito || '',
    valor: n.valor_pago || 0, obs: n.observacoes || '', obsCliente: n.observacao_cliente || '', pagamento: n.forma_pagamento || '',
    transporte: n.forma_transporte || '', endereco: isDemo ? '' : (n.endereco || ''), criado: dataLocalDe(n.created_at), concluida: !!n.concluido,
});

export default function Page() {
    const { isDemo, usuario } = useSessao();
    // Quem conclui nota e gera uma nova a partir de outra: as mesmas pessoas da tela de hoje.
    const podeNotas = usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro';
    const { contasPagar, empresasFaturamento, dadosCarregados, setNovaEmpresaFaturamento, setModalEmpresaFaturamentoAberto, atualizarPagamentoBoleto, concluirBoletoContasReceber } = useFinanceiro();
    const { atualizarCampoInline } = usePedidos();
    const { fornecedores } = useCadastros();
    const { notasFiscais, setNotaFiscalEmEdicao, setModalNotaFiscalAberto, reabrirNotaFiscal } = useNotasFiscais();
    const [modelo, setModelo] = useState(null);
    const { iframeRef, modalOS } = useAbrirOSDoPrototipo();
    useContaDoPrototipo(iframeRef);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/financeiro.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    // O protótipo pede contas a receber e boletos quando a aba abre; a página lê
    // e responde. E pede os modais de hoje para editar uma nota ou uma empresa.
    useEffect(() => {
        async function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            const responder = r => quadro.contentWindow?.postMessage(r, '/');
            // O período vem do protótipo: só passa adiante data de verdade.
            const periodo = { de: ehData(msg.de) ? msg.de : '', ate: ehData(msg.ate) ? msg.ate : '' };
            // Releitura do tempo real: só as O.S. que mudaram (números, e poucas).
            const ids = Array.isArray(msg.ids) ? msg.ids.filter(Number.isInteger).slice(0, 100) : null;
            if (ids && !ids.length) return;
            if (msg.tipo === 'pedir-receber') {
                const r = await buscarContasReceber(periodo, ids);
                if (r.erro) return responder({ tipo: 'receber-erro', pedido: msg.pedido, ids, erro: r.erro.message || 'Não deu para carregar as contas a receber.' });
                responder({
                    tipo: 'receber', pedido: msg.pedido, ids, total: r.total, antes: r.antes,
                    lista: r.lista.map(o => ({
                        id: o.id, cliente: mascararCliente(o.cliente || '', isDemo), clienteId: o.cliente_id || null, status: o.status,
                        pedido: o.data_pedido || '', prazo: o.prazo || '', retirada: o.data_retirada || '', vence: o.boleto_vence || '',
                        total: o.total || 0, recebido: o.recebido || 0, boleto: o.em_boleto || 0, saldo: o.saldo || 0,
                        ultimo: o.ultimo_pagamento || '', formas: o.formas || [], nItens: o.n_itens || 0, itens: o.itens || '',
                    })),
                });
            }
            if (msg.tipo === 'pedir-boletos') {
                const r = await buscarBoletos(periodo, ids);
                if (r.erro) return responder({ tipo: 'boletos-erro', pedido: msg.pedido, ids, erro: r.erro.message || 'Não deu para carregar os boletos.' });
                responder({ tipo: 'boletos', pedido: msg.pedido, ids, vencidosAntes: r.vencidosAntes, lista: r.lista.map(b => ({ ...b, cliente: mascararCliente(b.cliente, isDemo), cnpj: isDemo ? '' : b.cnpj })) });
            }
            // Preencher o boleto: grava pelas funções da tela de Boletos de hoje.
            if (msg.tipo === 'salvar-boleto' && Number.isInteger(msg.os)) {
                if (msg.campo === 'valor' && Number.isInteger(msg.centavos) && msg.centavos >= 0) {
                    return atualizarPagamentoBoleto({ id: msg.os }, { valor: formatarMoeda(String(msg.centavos)) });
                }
                const valido = CAMPOS_BOLETO[msg.campo];
                if (valido && valido(msg.valor)) return atualizarCampoInline(msg.os, msg.campo, msg.valor === '' ? null : msg.valor);
                return;
            }
            if (msg.tipo === 'concluir-boleto' && Number.isInteger(msg.os)) return concluirBoletoContasReceber({ id: msg.os });
            if (msg.tipo === 'pedir-notas') {
                const r = await buscarNotasConcluidas(periodo);
                if (r.erro) return responder({ tipo: 'notas-erro', pedido: msg.pedido, erro: r.erro.message || 'Não deu para carregar as notas.' });
                responder({ tipo: 'notas', pedido: msg.pedido, total: r.total, lista: r.lista.map(n => notaParaProto(n, isDemo)) });
            }
            // O clique veio de dentro do iframe: tirar o foco de lá devolve o
            // teclado (Esc, Tab) para a página, onde o modal abre.
            if (msg.tipo === 'editar-nota' && Number.isInteger(msg.id)) {
                const n = notasFiscais.find(x => x.id === msg.id);
                if (!n) return;
                quadro.blur();
                setNotaFiscalEmEdicao({ ...n, valor_pago: n.valor_pago ? formatarMoeda(Math.round(n.valor_pago).toString()) : '' });
                setModalNotaFiscalAberto(true);
            }
            // "Gerar nova nota" a partir de uma concluída: a função da tela de hoje
            // (dados da empresa; serviço, valor e tipo em branco), já confirmada no
            // botão do protótipo. A nota nova abre no modal para preencher o resto.
            if (msg.tipo === 'gerar-nota' && Number.isInteger(msg.id) && podeNotas && !isDemo) {
                const n = notasFiscais.find(x => x.id === msg.id);
                if (!n?.concluido) return;
                const nova = await reabrirNotaFiscal(n, { jaConfirmado: true });
                if (!nova) return;
                quadro.blur();
                setNotaFiscalEmEdicao({ ...nova, valor_pago: '' });
                setModalNotaFiscalAberto(true);
            }
            if (msg.tipo === 'editar-empresa' && Number.isInteger(msg.id)) {
                const emp = empresasFaturamento.find(x => x.id === msg.id);
                if (!emp) return;
                quadro.blur();
                setNovaEmpresaFaturamento(emp);
                setModalEmpresaFaturamentoAberto(true);
            }
            if (msg.tipo === 'nova-empresa') {
                quadro.blur();
                setNovaEmpresaFaturamento({ id: null, nome: '', cnpj: '', status: 'Aprovado' });
                setModalEmpresaFaturamentoAberto(true);
            }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [iframeRef, isDemo, podeNotas, reabrirNotaFiscal, notasFiscais, empresasFaturamento, setNotaFiscalEmEdicao, setModalNotaFiscalAberto, setNovaEmpresaFaturamento, setModalEmpresaFaturamentoAberto, atualizarPagamentoBoleto, concluirBoletoContasReceber, atualizarCampoInline]);

    // O tempo real diz quais O.S. mudaram; o protótipo relê só essas nas abas
    // que vieram do banco. É isto que dispensa um botão de atualizar.
    useEffect(() => ouvirPedidosMudados(({ ids, tudo }) => {
        iframeRef.current?.contentWindow?.postMessage({ tipo: 'pedidos-mudaram', ids, tudo }, '/');
    }), [iframeRef]);

    if (!modelo || !dadosCarregados) {
        return <div className="min-h-[60vh] grid place-items-center"><BarraDeCor mostrarTexto texto="Carregando protótipo" /></div>;
    }

    const dados = {
        hoje: obterDataAtual(),
        contas: contasPagar.map(c => ({
            id: c.id, descricao: c.descricao || 'Conta', valor: c.valor || 0, vencimento: c.vencimento || '', status: c.status,
            categoria: c.categoria || 'Despesa',
            fornecedor: fornecedores.find(f => f.id === c.fornecedor_id)?.nome || '', fornecedorId: c.fornecedor_id || null,
            recorrente: !!c.recorrente, parcelas: c.recorrente_total_parcelas || null, parcela: c.recorrente_parcela_atual || null,
        })),
        categorias: Object.fromEntries(CATEGORIAS_CONTA.map(c => [c.value, { label: c.label, icone: c.icone, cor: c.cor }])),
        fornecedores: fornecedores.map(f => ({ id: f.id, nome: f.nome || '', tipo: f.tipo || '' })),
        // Faturamento e notas já estão na memória: entram junto, sem consulta.
        empresas: empresasFaturamento.map(e => ({
            id: e.id, nome: e.nome || '', cnpj: isDemo ? '' : (e.cnpj || ''), status: e.status || '', obs: e.observacoes || '',
            criado: (e.created_at || '').slice(0, 10),
        })),
        // Só as pendentes; as concluídas o protótipo pede por período.
        notas: notasFiscais.filter(n => !n.concluido).map(n => notaParaProto(n, isDemo)),
        podeNotas: podeNotas && !isDemo,
    };
    // "<" escapado para um nome nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*FINANCEIRO*/', `const DADOS = ${json};`);

    return (
        <>
            <iframe
                ref={iframeRef}
                title="Protótipo da nova tela do Financeiro"
                srcDoc={html}
                className="absolute inset-0 w-full h-full border-0"
            />
            {modalOS}
        </>
    );
}
