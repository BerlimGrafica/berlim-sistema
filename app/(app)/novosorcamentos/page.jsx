"use client";
import { useEffect, useRef, useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useOsModal } from '@/context/OsModalContext';
import { useOrcamentos } from '@/context/OrcamentosContext';
import { useClientes } from '@/context/ClientesContext';
import { itensDoOrcamento, observacoesDoOrcamento } from '@/lib/utils/servico';
import { mascararCliente, obterDataAtual } from '@/lib/utils/formatters';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import LogoCarregando from '@/components/ui/LogoCarregando';

// Protótipo da nova tela de orçamentos (os comuns, "formalizados"), no padrão
// do DESIGN.md. As mesmas funções da tela de hoje (components/OrcamentosTab.jsx):
// lista, abrir para editar, novo, aprovar e virar O.S., imprimir e excluir.
//
// Como nos outros protótipos, public/prototipos/orcamentos.html é só a casca:
// os orçamentos já estão na memória do sistema (OrcamentosContext carrega a
// tabela com os itens) e entram aqui, no lugar do marcador /*ORCAMENTOS*/, sem
// consulta nova. O protótipo não grava nada: cada ação pede por mensagem e a
// página chama a MESMA função da tela de hoje — o modal de orçamento (novo e
// editar), o modal de O.S. (aprovar), a impressão e a exclusão, que pede
// confirmação como hoje.
const iso = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Page() {
    const { usuario, isAdmin, isDemo } = useSessao();
    const { setBuscaCliente, setItensPedido, setNovoPedido } = useOsModal();
    const {
        orcamentosFormalizados, setOrcamentoFormalizadoEmEdicao, setModalOrcamentoFormalizadoAberto,
        abrirEdicaoOrcamento, transformarEmOS, baixarPDFOrcamento, excluirOrcamentoFormalizado,
    } = useOrcamentos();
    const { isClienteProblema } = useClientes();
    const [modelo, setModelo] = useState(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/orcamentos.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    // As ações do protótipo chamam as funções da tela de hoje. O clique veio de
    // dentro do iframe: tirar o foco de lá devolve o teclado (Esc, Tab) à página,
    // onde o modal abre.
    useEffect(() => {
        function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            const orc = Number.isInteger(msg.id) ? orcamentosFormalizados.find(o => o.id === msg.id) : null;
            if (msg.tipo === 'novo-orcamento') {
                quadro.blur();
                setOrcamentoFormalizadoEmEdicao(null);
                setBuscaCliente('');
                setItensPedido([]);
                setNovoPedido({ cliente: '', cliente_id: null, servico: '', valor_total: '', status: 'Orçamento', data_pedido: obterDataAtual(), prazo: '', responsavel: '', entrega: false });
                setModalOrcamentoFormalizadoAberto(true);
                return;
            }
            if (!orc) return;
            if (msg.tipo === 'editar-orcamento') { quadro.blur(); abrirEdicaoOrcamento(orc); }
            if (msg.tipo === 'aprovar-orcamento') { quadro.blur(); transformarEmOS(orc); }
            if (msg.tipo === 'imprimir-orcamento') baixarPDFOrcamento(orc);
            if (msg.tipo === 'excluir-orcamento' && isAdmin) { quadro.blur(); excluirOrcamentoFormalizado(orc.id); }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [orcamentosFormalizados, isAdmin, setOrcamentoFormalizadoEmEdicao, setBuscaCliente, setItensPedido, setNovoPedido, setModalOrcamentoFormalizadoAberto, abrirEdicaoOrcamento, transformarEmOS, baixarPDFOrcamento, excluirOrcamentoFormalizado]);

    if (!modelo) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    const nomes = new Set([usuario?.nome, ...orcamentosFormalizados.map(o => o.criado_por)].filter(Boolean));
    const dados = {
        hoje: obterDataAtual(),
        eu: usuario?.nome || '',
        admin: !!isAdmin,
        cores: Object.fromEntries([...nomes].map(n => [n, corDoNome(n)])),
        orcamentos: orcamentosFormalizados.map(o => ({
            id: o.id,
            cliente: mascararCliente(o.cliente || '', isDemo) || 'Sem cliente',
            problema: !!isClienteProblema(o.cliente, o.cliente_id),
            telefone: isDemo ? '' : (o.telefone || ''),
            valor: Math.round(o.valor || 0),
            prazo: (o.prazo_producao || '').trim(),
            criadoPor: o.criado_por || '',
            criado: iso(o.created_at),
            obs: (observacoesDoOrcamento(o) || '').trim(),
            itens: itensDoOrcamento(o).map(i => ({ nome: i.nome || '', descricao: i.descricao || '', valor: i.valor || '', desconto: i.desconto || '', local: i.local_producao || '' })),
        })),
    };
    // "<" escapado para um texto nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*ORCAMENTOS*/', `const DADOS = ${json};`);

    return (
        <iframe
            ref={iframeRef}
            title="Protótipo da nova tela de orçamentos"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
