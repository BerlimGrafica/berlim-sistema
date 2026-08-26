"use client";
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { obterCorStatus, obterCorFundoStatus } from '@/lib/utils/constants';
import { formatarValorFinanceiro, formatarDataExibicao, mascararCliente } from '@/lib/utils/formatters';
import { resumoDoPedido } from '@/lib/utils/servico';

export default function ContasAReceberPanel({ dataInicio, dataFim }) {
    const { isDemo } = useSessao();
    const { abrirContextMenu, avisar } = useUi();
    const { abrirEdicao, duplicarOS, imprimirOS } = usePedidos();
    const { pedidosSaldoDevedor, carregandoContasReceber } = useFinanceiro();

    const pedidosFiltrados = pedidosSaldoDevedor.filter(p => {
        if (dataInicio && (!p.data_pedido || p.data_pedido < dataInicio)) return false;
        if (dataFim && (!p.data_pedido || p.data_pedido > dataFim)) return false;
        return true;
    });

    return (
        <div className="bg-superficie border border-borda rounded overflow-hidden min-h-[300px]">
            {/* Tela de leitura: no cartão o saldo devedor é o que a pessoa veio ver,
                então ele vira o destaque e os outros dois valores ficam abaixo, para
                conferência. Ver components/ui/TabelaCartoes.jsx. */}
            <TabelaCartoes
                itens={pedidosFiltrados}
                chave={p => p.id}
                faixa={p => obterCorFundoStatus(p.status)}
                carregando={carregandoContasReceber && pedidosFiltrados.length === 0}
                vazio={<span className="text-corpo text-gray-400">Nenhuma OS com saldo devedor encontrada.</span>}
                aoClicar={p => abrirEdicao(p)}
                aoContextMenu={(p, e) => abrirContextMenu(e, [
                    { label: 'Editar', icon: 'edit-3', onClick: () => abrirEdicao(p) },
                    { label: 'Duplicar', icon: 'layers', onClick: () => duplicarOS(p) },
                    { label: 'Imprimir', icon: 'printer', onClick: () => imprimirOS(p) },
                    { label: 'Copiar linha', icon: 'copy', onClick: () => {
                        navigator.clipboard.writeText([`#${p.id}`, mascararCliente(p.cliente, isDemo), formatarDataExibicao(p.data_pedido), `R$ ${formatarValorFinanceiro(p.saldo)}`].join('\t'));
                        avisar('Linha copiada!', 'sucesso');
                    }},
                ])}
                colunas={[
                    {
                        papel: 'titulo',
                        titulo: 'O.S.',
                        celula: p => <span className="text-compacto font-bold text-tinta-fraca">#{p.id}</span>,
                    },
                    {
                        papel: 'subtitulo',
                        titulo: 'Cliente',
                        celula: p => (
                            <span className="text-corpo font-semibold text-tinta truncate max-w-[200px] block" title={mascararCliente(p.cliente, isDemo)}>
                                {mascararCliente(p.cliente, isDemo)}
                            </span>
                        ),
                    },
                    {
                        papel: 'selo',
                        titulo: 'Status',
                        thClassName: 'px-6 py-4 text-center',
                        tdClassName: 'px-6 py-4 text-center',
                        celula: p => (
                            <span className={`whitespace-nowrap px-2.5 py-1 text-mini font-semibold rounded border ${obterCorStatus(p.status)}`}>
                                {p.status}
                            </span>
                        ),
                    },
                    {
                        papel: 'destaque',
                        titulo: 'Saldo Devedor',
                        rotuloCartao: 'Saldo devedor',
                        thClassName: 'px-6 py-4 text-right',
                        tdClassName: 'px-6 py-4 text-corpo font-bold text-perigo text-right whitespace-nowrap',
                        celula: p => <span className="text-perigo">R$ {formatarValorFinanceiro(p.saldo)}</span>,
                    },
                    {
                        titulo: 'Serviço',
                        tdClassName: 'px-6 py-4',
                        celula: p => (
                            <span className="text-corpo text-tinta-suave block truncate max-w-[250px]" title={resumoDoPedido(p)}>
                                {resumoDoPedido(p)}
                            </span>
                        ),
                    },
                    {
                        titulo: 'Valor Total',
                        rotuloCartao: 'Total',
                        thClassName: 'px-6 py-4 text-right',
                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave text-right whitespace-nowrap',
                        celula: p => `R$ ${formatarValorFinanceiro(p.totalReais)}`,
                    },
                    {
                        titulo: 'Valor Pago',
                        rotuloCartao: 'Pago',
                        thClassName: 'px-6 py-4 text-right',
                        tdClassName: 'px-6 py-4 text-corpo text-sucesso text-right whitespace-nowrap',
                        celula: p => <span className="text-sucesso">R$ {formatarValorFinanceiro(p.totalPago)}</span>,
                    },
                    {
                        titulo: 'Data Pedido',
                        rotuloCartao: 'Data',
                        thClassName: 'px-6 py-4 text-center',
                        tdClassName: 'px-6 py-4 text-corpo text-center text-tinta-suave',
                        celula: p => formatarDataExibicao(p.data_pedido),
                    },
                ]}
            />
        </div>
    );
}
