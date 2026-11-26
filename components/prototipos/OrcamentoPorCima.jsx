"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCadastros } from '@/context/CadastrosContext';
import { useSessao } from '@/context/SessaoContext';
import { useClientes } from '@/context/ClientesContext';
import { useOrcamentos } from '@/context/OrcamentosContext';
import { usePedidos } from '@/context/PedidosContext';
import { useUi } from '@/context/UiContext';
import { mascararCliente, parseValorMoeda, formatarMoeda, rotuloCliente } from '@/lib/utils/formatters';
import { itensDoOrcamento, observacoesDoOrcamento } from '@/lib/utils/servico';
import { buscarClientes } from '@/lib/clientes/busca';
import { carregarModeloNovaOS, montarNovaOS } from '@/lib/prototipos/novaos';
import { prepararNoSistema } from '@/lib/prototipos/noSistema';
import { entrarNaPilha, souOTopo, voltarDoHistorico, voltaVeioDoCodigo } from '@/lib/ui/pilhaModais';

// O modal novo de orçamento formalizado, aberto por cima da tela nova de
// Orçamentos no lugar do modal antigo. É o mesmo HTML do modal novo de O.S.
// (public/prototipos/novaos.html) no modo orçamento (OS_REAL.orcamento): sem
// status, responsável, prazo com data, entrega e pagamentos; com o prazo de
// produção e o total.
//
// GRAVA PELO MESMO CAMINHO DO MODAL DE HOJE
//   salvar-orcamento   → gravarOrcamento (AppContext), o miolo do
//                        salvarOrcamentoFormalizado; "Salvar e imprimir" chama
//                        o mesmo baixarPDFOrcamento
//   buscar-clientes, cadastrar-cliente, cadastrar-produto → como na O.S.
//   fechar-os          → fecha
// Cada pedido leva um número (`n`) e a resposta volta com ele.
//
// O orçamento já está na memória (OrcamentosContext carrega os itens junto):
// abre sem consulta nova. O HTML é montado uma vez só, como na O.S.

export const PEDIR_FECHAR_ORCAMENTO = 'berlim:pedir-fechar-orcamento';

const reaisDeCentavos = c => formatarMoeda(String(Math.round(Number(c) || 0)));

function OrcamentoPorCima({ orcamento, aoFechar }) {
    const { gravarOrcamento, baixarPDFOrcamento } = useOrcamentos();
    const { criarCliente, criarProduto, dadosCarregados } = usePedidos();
    const { produtos, fornecedoresTerceirizacaoNomes } = useCadastros();
    const { usuariosSistema, darkMode, isDemo } = useSessao();
    const { isClienteProblema } = useClientes();
    const { avisar } = useUi();
    const [modelo, setModelo] = useState(null);
    // O orçamento como está no banco: muda quando um novo grava o cabeçalho e
    // não os itens — o próximo Salvar completa este, em vez de criar outro.
    const [antes, setAntes] = useState(orcamento || null);
    const [html, setHtml] = useState(null);
    const [carregou, setCarregou] = useState(false);
    const iframeRef = useRef(null);
    const salvandoRef = useRef(false);

    useEffect(() => {
        let vivo = true;
        carregarModeloNovaOS().then(t => { if (vivo) setModelo(t); })
            .catch(() => { if (vivo) { avisar('Não foi possível abrir o orçamento. Tente novamente.', 'erro'); aoFechar(); } });
        return () => { vivo = false; };
    }, [avisar, aoFechar]);

    // Monta o HTML uma vez só, quando o modelo e o catálogo estão à mão.
    if (!html && modelo && dadosCarregados) {
        const o = orcamento;
        const os = {
            id: o?.id || null,
            orcamento: true,
            cliente: o?.cliente ? { id: o.cliente_id || null, nome: mascararCliente(o.cliente, isDemo), tel: isDemo ? '' : (o.telefone || ''), problema: isClienteProblema(o.cliente, o.cliente_id) } : null,
            venda: '', prazo: '', hora: '', status: 'Orçamento', resp: [], entrega: false,
            obs: o ? observacoesDoOrcamento(o) : '',
            prazoProducao: o?.prazo_producao || '',
            // O valor final de cada item vai pronto, como na O.S.: refazer a
            // conta do desconto podia errar um centavo.
            itens: (o ? itensDoOrcamento(o) : []).map(i => {
                const final = parseValorMoeda(i.valor);
                return { prodId: i.id_produto || null, nome: i.nome || '', esp: i.descricao || '', local: i.local_producao || 'Berlim', bruto: i.valor_original ? parseValorMoeda(i.valor_original) : final, desc: parseInt(i.desconto, 10) || 0, final };
            }),
            pags: [],
        };
        // A conta de demonstração só vê.
        const permissoes = { status: ['Orçamento'], podeFinalizar: false, trancado: isDemo };
        setHtml(prepararNoSistema(montarNovaOS(modelo, { produtos, locais: fornecedoresTerceirizacaoNomes.map(f => f.nome), usuariosSistema, os, permissoes, outras: [], lotes: {}, escuro: darkMode })));
    }

    // Esc fora do iframe e o voltar do navegador pedem o fechamento: o modal
    // pergunta antes de descartar o que mudou. Ainda carregando, só fecha.
    useEffect(() => {
        const aoPedir = () => {
            const janela = carregou && iframeRef.current?.contentWindow;
            if (janela) janela.postMessage({ tipo: 'pedir-fechar' }, '/');
            else aoFechar();
        };
        window.addEventListener(PEDIR_FECHAR_ORCAMENTO, aoPedir);
        return () => window.removeEventListener(PEDIR_FECHAR_ORCAMENTO, aoPedir);
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
                    desconto: i.desc ? String(i.desc) : '', local_producao: i.local || 'Berlim',
                }));
                // O total é a soma dos itens. Um orçamento antigo sem item nenhum
                // guarda o valor digitado à mão: esse fica como está.
                const soma = o.itens.reduce((s, i) => s + Math.round(i.final), 0);
                const r = await gravarOrcamento({
                    antes,
                    campos: {
                        cliente: o.cliente.nome, cliente_id: o.cliente.id || null,
                        // O telefone do cliente escolhido; sem cadastro, o que já
                        // estava no orçamento (a mesma regra do modal de hoje).
                        telefone: o.cliente.tel || antes?.telefone || '',
                        observacoes: o.obs || '', prazo_producao: o.prazoProd || '',
                        valor: o.itens.length ? soma : (antes?.valor || 0),
                    },
                    itens,
                });
                if (!r.orcamento) { responder(n, { ok: false }); return; }
                if (r.semItens) { setAntes(r.orcamento); responder(n, { ok: false, viraEdicao: r.orcamento.id }); return; }
                avisar(`Orçamento #${r.orcamento.id} ${antes ? 'atualizado' : 'criado'}.`, 'sucesso');
                aoFechar();
                if (imprimir) baixarPDFOrcamento(r.orcamento);
            } finally {
                salvandoRef.current = false;
            }
        }

        function aoReceber(e) {
            if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
            const d = e.data || {};
            if (d.tipo === 'fechar-os') aoFechar();
            if (d.tipo === 'salvar-orcamento' && d.orc) salvar(d.n, d.orc, !!d.imprimir);
            if (d.tipo === 'buscar-clientes') buscarClientes(d.q).then(lista => responder(d.n, { lista: lista.map(comoCliente) }));
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
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [antes, aoFechar, avisar, gravarOrcamento, baixarPDFOrcamento, criarCliente, criarProduto, isDemo]);

    // Enquanto o modelo chega, o véu já aparece, da mesma cor do véu do modal.
    return createPortal(
        <div className="fixed inset-0 z-[60] no-print">
            {!carregou && <div className="absolute inset-0 bg-[rgba(15,23,42,.42)] dark:bg-[rgba(0,0,0,.72)] animate-modal-backdrop" />}
            {html && (
                <iframe
                    ref={iframeRef}
                    title={orcamento ? `Orçamento #${orcamento.id}` : 'Novo orçamento'}
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

// Quem abre: guarda qual orçamento está aberto ({ orcamento } — null num novo)
// e põe a janela na pilha de modais, como o useAbrirOSDoPrototipo faz com a
// O.S.: a página de trás fica inerte, o voltar do navegador e o Esc pedem o
// fechamento. Fica aqui, e não no componente da janela, porque quem entra e
// sai da pilha precisa já estar montado.
export function useOrcamentoPorCima() {
    const [aberto, setAberto] = useState(null);
    const fechar = useCallback(() => setAberto(null), []);
    const pedirFechar = useCallback(() => window.dispatchEvent(new Event(PEDIR_FECHAR_ORCAMENTO)), []);
    const estaAberto = aberto !== null;

    useEffect(() => {
        if (!estaAberto) return;
        const marca = {};
        const sair = entrarNaPilha(marca);
        window.history.pushState({ modalBerlimAberto: true }, '');
        function aoVoltar() {
            if (!souOTopo(marca) || voltaVeioDoCodigo()) return;
            window.history.pushState({ modalBerlimAberto: true }, '');
            pedirFechar();
        }
        function aoTeclar(e) {
            if (e.key !== 'Escape' || !souOTopo(marca) || e.defaultPrevented) return;
            e.preventDefault();
            pedirFechar();
        }
        document.addEventListener('keydown', aoTeclar);
        window.addEventListener('popstate', aoVoltar);
        return () => {
            document.removeEventListener('keydown', aoTeclar);
            window.removeEventListener('popstate', aoVoltar);
            sair();
            if (window.history.state?.modalBerlimAberto) voltarDoHistorico();
        };
    }, [estaAberto, pedirFechar]);

    const modal = estaAberto ? <OrcamentoPorCima key={aberto.orcamento?.id ?? 'novo'} orcamento={aberto.orcamento} aoFechar={fechar} /> : null;
    // abrir(orcamento) edita; abrir(null) abre um novo.
    const abrir = useCallback(orcamento => setAberto({ orcamento: orcamento || null }), []);
    return { abrir, modal };
}
