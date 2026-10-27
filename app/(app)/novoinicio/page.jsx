"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePedidos } from '@/context/PedidosContext';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { useComunicacao } from '@/context/ComunicacaoContext';
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import { mascararCliente, obterDataAtual, valorPagamentoComSinalCentavos } from '@/lib/utils/formatters';
import { resumoDoPedido } from '@/lib/utils/servico';
import { calcularPendencias } from '@/lib/alertas/pendencias';
import { corDoNome } from '@/lib/prototipos/coresDoNome';

// Protótipo do novo Início: uma tela por cargo, com o que importa para cada um
// (dono, atendimento, produção, financeiro), e um "Ver como" para trocar de
// pessoa e conferir a tela de cada uma.
//
// Como nos outros protótipos, public/prototipos/inicio.html é só a casca: os
// dados entram aqui, no lugar do marcador /*INICIO*/, lidos pela sessão de quem
// está logado. Quase tudo já está na memória do sistema (O.S. abertas, contas,
// tarefas, requisições, notas). Do banco vêm só as métricas de vendas — duas
// chamadas de metricas_vendas, somadas lá dentro — e só com esta tela aberta.
// Só leitura: nada grava.

// O mesmo dia do mês anterior, para comparar "outubro até hoje" com "setembro
// até o mesmo dia" (dia 31 num mês de 30 vira o último dia dele).
function mesmoPeriodoDoMesAnterior(hoje) {
    const [a, m, d] = hoje.split('-').map(Number);
    const inicio = new Date(a, m - 2, 1);
    const ultimoDia = new Date(a, m - 1, 0).getDate();
    const fim = new Date(a, m - 2, Math.min(d, ultimoDia));
    const iso = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    return [iso(inicio), iso(fim)];
}

export default function Page() {
    const { pedidos, dadosCarregados } = usePedidos();
    const { usuario, usuariosSistema, isDemo } = useSessao();
    const { isClienteProblema } = useClientes();
    const { contasPagar, empresasFaturamento } = useFinanceiro();
    const { tarefasInternas, requisicoesMaterial, linksPagamento } = useComunicacao();
    const { notasFiscais } = useNotasFiscais();
    const [modelo, setModelo] = useState(null);
    const [metricas, setMetricas] = useState(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/inicio.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    useEffect(() => {
        if (!usuario) return;
        let vivo = true;
        const hoje = obterDataAtual();
        const [iniAnt, fimAnt] = mesmoPeriodoDoMesAnterior(hoje);
        const metrica = (ini, fim) => supabase.rpc('metricas_vendas', { p_inicio: ini, p_fim: fim }).then(({ data }) => data);
        Promise.all([metrica(`${hoje.slice(0, 8)}01`, hoje), metrica(iniAnt, fimAnt)])
            .then(([mes, anterior]) => { if (vivo) setMetricas({ mes, anterior }); });
        return () => { vivo = false; };
    }, [usuario]);

    if (!modelo || !dadosCarregados || !metricas) {
        return <div className="p-6 text-corpo text-tinta-suave">Carregando protótipo…</div>;
    }

    const hoje = obterDataAtual();
    const equipe = usuariosSistema.filter(u => u.nivel !== 'demo');
    const locais = new Set(pedidos.flatMap(p => (p.local_producao || 'Berlim').split(',').map(s => s.trim()).filter(Boolean)));
    const listas = { pedidos, contasPagar, notasFiscais, tarefasInternas, requisicoesMaterial, linksPagamento, empresasFaturamento, hoje };
    const resumirMetricas = m => m && ({
        bruto: m.resumo?.bruto_centavos || 0,
        recebido: m.resumo?.recebido_centavos || 0,
        qtd: m.resumo?.qtd_pedidos || 0,
        ticket: m.resumo?.ticket_medio_centavos || 0,
        hoje: m.vendas_hoje_centavos || 0,
        serieDia: m.serie_dia || [],
        serieMes: m.serie_mes || [],
        clientes: (m.ranking_cliente || []).slice(0, 6).map(c => ({ nome: c.eh_balcao ? 'Balcão' : mascararCliente(c.rotulo, isDemo), centavos: c.centavos, qtd: c.qtd })),
        produtos: (m.ranking_produto || []).slice(0, 6),
        formas: (m.ranking_forma || []).slice(0, 6),
        semBaixa: { centavos: m.sem_baixa?.total_centavos || 0, qtd: m.sem_baixa?.qtd || 0 },
        despesas: { pago: m.despesas?.pago_centavos || 0, pendente: m.despesas?.pendente_centavos || 0, vencidas: m.despesas?.qtd_vencidas || 0 },
    });

    const dados = {
        hoje,
        eu: usuario?.nome || '',
        equipe: equipe.map(u => ({ nome: u.nome, nivel: u.nivel, cor: corDoNome(u.nome) })),
        // A cor de cada local, a mesma dos chips de local da Produção.
        coresLocais: Object.fromEntries([...locais].map(l => [l, corDoNome(l)[0]])),
        pedidos: pedidos.map(p => ({
            id: p.id,
            cliente: mascararCliente(p.cliente, isDemo) || 'Sem cliente',
            problema: isClienteProblema(p.cliente, p.cliente_id),
            status: p.status,
            prazo: p.prazo || '',
            hora: p.prazo_hora ? p.prazo_hora.slice(0, 5) : '',
            resp: (p.responsavel || '').split(',').map(s => s.trim()).filter(Boolean),
            criado: p.criado_por || '',
            venda: p.data_pedido || '',
            retirada: p.data_retirada || '',
            valor: p.valor_total || 0,
            pago: Math.round((p.pedido_pagamentos || []).reduce((s, pg) => s + valorPagamentoComSinalCentavos(pg), 0) * 100),
            locais: (p.local_producao || 'Berlim').split(',').map(s => s.trim()).filter(Boolean),
            resumo: resumoDoPedido(p),
        })),
        contas: contasPagar.map(c => ({ id: c.id, descricao: c.descricao || 'Conta', valor: c.valor || 0, vencimento: c.vencimento || '', status: c.status, categoria: c.categoria || '' })),
        requisicoes: requisicoesMaterial.filter(r => r.status === 'Pendente').map(r => ({ id: r.id, itens: r.itens || '', quando: (r.created_at || '').slice(0, 10) })),
        // As pendências de cada pessoa, pela mesma regra do sino: o "Ver como"
        // mostra exatamente o que aquela pessoa vê hoje.
        pendencias: Object.fromEntries(equipe.map(u => [u.nome, calcularPendencias({ ...listas, usuario: u }).map(p => ({ gravidade: p.gravidade, titulo: p.titulo, detalhe: p.detalhe, destino: p.destino || '' }))])),
        vendas: { mes: resumirMetricas(metricas.mes), anterior: resumirMetricas(metricas.anterior) },
    };
    // "<" escapado para um nome nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*INICIO*/', `const DADOS = ${json};`);

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências; a rolagem fica toda dentro do protótipo.
    return (
        <iframe
            title="Protótipo do novo Início"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
