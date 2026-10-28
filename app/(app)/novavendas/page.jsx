"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSessao } from '@/context/SessaoContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { useCadastros } from '@/context/CadastrosContext';
import { mascararCliente, obterDataAtual } from '@/lib/utils/formatters';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import { podeVerTela, subtelasVisiveis } from '@/lib/acesso/telas';
import { periodoPadrao } from '@/components/vendas/SeletorPeriodo';
import { useAbrirOSDoPrototipo } from '@/hooks/useAbrirOSDoPrototipo';
import { useContaDoPrototipo } from '@/hooks/useContaDoPrototipo';
import BarraDeCor from '@/components/ui/BarraDeCor';

// Protótipo da nova tela de Vendas: as mesmas informações da tela de hoje
// (Visão geral, Produtos, Clientes e o relatório do dia), redesenhadas no padrão
// do DESIGN.md, mais a comparação com o período anterior.
//
// Como nos outros protótipos, public/prototipos/vendas.html é só a casca. Os
// números entram aqui, lidos pela sessão de quem está logado:
// - o primeiro período vai junto do HTML, no lugar do marcador /*VENDAS*/;
// - trocar o período ou abrir um dia o protótipo PEDE por mensagem, e a página
//   responde. Nada é buscado sem a tela aberta, e nada em laço.
// Cada período custa duas chamadas de metricas_vendas (ele e o anterior, para a
// comparação). O relatório do dia lê só as O.S. daquele dia, quando é aberto.
// As contas de uma categoria de despesa saem da memória (FinanceiroContext já
// tem contas_pagar inteira): abrir a categoria não consulta o banco.
// Só leitura: nada grava aqui. Editar uma conta abre o modal de conta de hoje
// (useContaDoPrototipo), que é quem grava.

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const data = s => new Date(`${s}T12:00:00`);
const ultimoDia = (a, m) => new Date(a, m, 0).getDate();
const ehData = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

// Com o que comparar o período escolhido. Período em andamento compara só até
// o dia equivalente: outubro até o dia 28 contra setembro até o dia 28, e não
// contra setembro inteiro. "Tudo" não tem anterior.
function periodoAnterior(inicio, fim, hoje) {
    if (inicio <= '2000-01-01') return null;
    const fimEf = fim > hoje ? hoje : fim;
    if (fimEf < inicio) return null;
    const [ai, mi, di] = inicio.split('-').map(Number);
    const [af, mf, df] = fim.split('-').map(Number);
    const [, , dEf] = fimEf.split('-').map(Number);
    // Um mês inteiro: o mês anterior, até o mesmo dia.
    if (di === 1 && ai === af && mi === mf && df === ultimoDia(af, mf)) {
        const a = mi === 1 ? ai - 1 : ai, m = mi === 1 ? 12 : mi - 1;
        const mm = String(m).padStart(2, '0');
        return [`${a}-${mm}-01`, `${a}-${mm}-${String(Math.min(dEf, ultimoDia(a, m))).padStart(2, '0')}`];
    }
    // Um ano inteiro: o ano anterior, até o mesmo dia do ano.
    if (inicio.endsWith('-01-01') && fim.endsWith('-12-31') && ai === af) {
        const [, me, de] = fimEf.split('-').map(Number);
        return [`${ai - 1}-01-01`, `${ai - 1}-${String(me).padStart(2, '0')}-${String(Math.min(de, ultimoDia(ai - 1, me))).padStart(2, '0')}`];
    }
    // O resto: o mesmo número de dias, logo antes.
    const dias = Math.round((data(fimEf) - data(inicio)) / 864e5) + 1;
    const fimAnt = data(inicio); fimAnt.setDate(fimAnt.getDate() - 1);
    const iniAnt = new Date(fimAnt); iniAnt.setDate(iniAnt.getDate() - (dias - 1));
    return [iso(iniAnt), iso(fimAnt)];
}

// O mesmo recorte de hooks/useVendasDoDia.js: data da venda, cancelados de
// fora, valor_total somado — para o total do dia bater com a coluna do gráfico.
const CAMPOS_DIA = `
    id, cliente, servico, valor_total, status, responsavel, local_producao,
    pedido_itens ( nome, descricao, valor_centavos, ordem ),
    pedido_pagamentos ( forma, valor_centavos, parcelas, instituicao, bandeira )
`;

export default function Page() {
    const { usuario, isDemo } = useSessao();
    const [modelo, setModelo] = useState(null);
    const [inicial, setInicial] = useState(null);
    const [erro, setErro] = useState(null);
    // A situação de cada O.S. que o protótipo já mostrou: baixada fica trancada
    // para Atendimento e Produção, como no resto do sistema.
    const situacoes = useRef(new Map());
    const statusDe = useCallback(id => situacoes.current.get(id), []);
    const { iframeRef, modalOS } = useAbrirOSDoPrototipo(statusDe);
    useContaDoPrototipo(iframeRef);
    const { contasPagar } = useFinanceiro();
    const { fornecedores } = useCadastros();

    const pode = !!usuario && podeVerTela(usuario, '/vendas');
    const abas = useMemo(() => (usuario ? subtelasVisiveis(usuario, 'vendas').map(s => s.id) : []), [usuario]);

    const buscarPeriodo = useCallback(async (inicio, fim) => {
        const anterior = periodoAnterior(inicio, fim, obterDataAtual());
        const metrica = (a, b) => supabase.rpc('metricas_vendas', { p_inicio: a, p_fim: b }).then(({ data: d, error }) => {
            if (error) throw error;
            return d;
        });
        const [m, ant] = await Promise.all([metrica(inicio, fim), anterior ? metrica(anterior[0], anterior[1]) : null]);
        const atual = {
            ...m,
            ranking_cliente: (m.ranking_cliente || []).map(c => ({ ...c, rotulo: c.eh_balcao ? c.rotulo : mascararCliente(c.rotulo, isDemo) })),
        };
        // A lista de "concluído sem baixa" não vai: o protótipo não mostra mais.
        delete atual.sem_baixa;
        return {
            inicio, fim,
            atual,
            // Do anterior só vai o que a comparação usa.
            anterior: ant && { resumo: ant.resumo, despesas: { total_centavos: ant.despesas?.total_centavos || 0 } },
            periodoAnterior: anterior,
            cores: Object.fromEntries((m.ranking_local || []).map(l => [l.rotulo, corDoNome(l.rotulo)[0]])),
        };
    }, [isDemo]);

    const buscarDia = useCallback(async (dia) => {
        const { data: d, error } = await supabase.from('pedidos').select(CAMPOS_DIA)
            .eq('data_pedido', dia)
            .not('status', 'in', '("Cancelado","Cancelada")')
            .order('valor_total', { ascending: false });
        if (error) throw error;
        return (d || []).map(p => {
            situacoes.current.set(p.id, p.status);
            return {
                id: p.id,
                cliente: mascararCliente(p.cliente, isDemo) || 'Sem cliente',
                servico: p.servico || '',
                valor: p.valor_total || 0,
                status: p.status,
                resp: p.responsavel || '',
                local: p.local_producao || '',
                itens: [...(p.pedido_itens || [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                    .map(i => ({ nome: i.nome || '', desc: i.descricao || '', valor: i.valor_centavos || 0 })),
                pags: (p.pedido_pagamentos || []).map(g => ({ forma: g.forma || 'Indefinido', valor: g.valor_centavos || 0, parc: g.parcelas || 1, inst: g.instituicao || '', band: g.bandeira || '' })),
            };
        });
    }, [isDemo]);

    // O mesmo recorte de metricas_vendas: vencimento dentro do período e a
    // categoria vazia contada como "Despesa".
    const contasDaCategoria = useCallback((inicio, fim, categoria) => (contasPagar || [])
        .filter(c => c.vencimento && c.vencimento >= inicio && c.vencimento <= fim && ((c.categoria || '').trim() || 'Despesa') === categoria)
        .map(c => ({
            id: c.id, descricao: c.descricao || 'Conta', valor: c.valor || 0, vencimento: c.vencimento, status: c.status,
            fornecedor: fornecedores.find(f => f.id === c.fornecedor_id)?.nome || '',
            recorrente: !!c.recorrente, parcelas: c.recorrente_total_parcelas || null, parcela: c.recorrente_parcela_atual || null,
        })), [contasPagar, fornecedores]);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/vendas.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    useEffect(() => {
        if (!pode) return;
        let vivo = true;
        const { inicio, fim } = periodoPadrao();
        buscarPeriodo(inicio, fim)
            .then(r => { if (vivo) setInicial(r); })
            .catch(e => { if (vivo) setErro(e.message || 'Não foi possível somar o período.'); });
        return () => { vivo = false; };
    }, [pode, buscarPeriodo]);

    // O protótipo pede; a página busca e responde para o mesmo iframe.
    useEffect(() => {
        async function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            const responder = r => quadro.contentWindow?.postMessage(r, '/');
            if (msg.tipo === 'pedir-periodo' && ehData(msg.inicio) && ehData(msg.fim)) {
                try { responder({ tipo: 'periodo', pedido: msg.pedido, ...(await buscarPeriodo(msg.inicio, msg.fim)) }); }
                catch (err) { responder({ tipo: 'periodo-erro', pedido: msg.pedido, erro: err.message || 'Não foi possível somar o período.' }); }
            }
            if (msg.tipo === 'pedir-dia' && ehData(msg.dia)) {
                try { responder({ tipo: 'dia', dia: msg.dia, pedidos: await buscarDia(msg.dia) }); }
                catch (err) { responder({ tipo: 'dia-erro', dia: msg.dia, erro: err.message || 'Não deu para carregar este dia.' }); }
            }
            if (msg.tipo === 'pedir-contas' && ehData(msg.inicio) && ehData(msg.fim) && typeof msg.categoria === 'string') {
                responder({ tipo: 'contas', pedido: msg.pedido, categoria: msg.categoria, contas: contasDaCategoria(msg.inicio, msg.fim, msg.categoria) });
            }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [iframeRef, buscarPeriodo, buscarDia, contasDaCategoria]);

    // O HTML é montado uma vez: trocar de período não recarrega o iframe.
    const html = useMemo(() => {
        if (!modelo || !inicial) return null;
        const dados = { hoje: obterDataAtual(), abas, ...inicial };
        // "<" escapado para um nome nunca fechar o <script> do protótipo.
        return modelo.replace('/*VENDAS*/', `const DADOS = ${JSON.stringify(dados).replace(/</g, '\\u003c')};`);
    }, [modelo, inicial, abas]);

    if (usuario && !pode) {
        return <div className="p-6 text-corpo text-tinta-suave">Você não tem acesso à tela de Vendas.</div>;
    }
    if (erro) {
        return <div className="p-6 text-corpo text-perigo">Não foi possível somar o período: {erro}</div>;
    }
    if (!html) {
        return <div className="min-h-[60vh] grid place-items-center"><BarraDeCor mostrarTexto texto="Somando o período no banco" /></div>;
    }

    // absolute inset-0 preenche a área da página abaixo da barra; a rolagem fica
    // toda dentro do protótipo.
    return (
        <>
            <iframe
                ref={iframeRef}
                title="Protótipo da nova tela de Vendas"
                srcDoc={html}
                className="absolute inset-0 w-full h-full border-0"
            />
            {modalOS}
        </>
    );
}
