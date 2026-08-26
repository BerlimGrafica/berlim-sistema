"use client";
import { useSessao } from '@/context/SessaoContext';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { formatarValorFinanceiro, mascararCliente, centavosParaReais } from '@/lib/utils/formatters';

export default function VendasPorClientePanel({ metricas }) {
    const { isDemo } = useSessao();

    // O agrupamento é feito no banco pelo VÍNCULO (cliente_id), nunca pelo nome
    // digitado: o cadastro tem centenas de homônimos e somar por texto fundiria
    // pessoas diferentes numa linha só. Sem vínculo é venda avulsa ("Balcão").
    // A posição entra como campo do próprio item: a coluna não conhece o índice
    // da linha, e procurá-lo com indexOf a cada célula seria uma varredura da
    // lista inteira por linha desenhada.
    const ranking = metricas.ranking_cliente.map((c, i) => ({ ...c, posicao: i + 1 }));

    // "Balcão" não é nome de pessoa — não passa pelo mascaramento do modo demo.
    const nomeDe = (c) => (c.eh_balcao ? c.rotulo : mascararCliente(c.rotulo, isDemo));
    const totalDe = (c) => centavosParaReais(c.centavos);

    return (
        <div className="bg-superficie border border-borda rounded overflow-hidden min-h-[300px]">
            {/* Ver components/ui/TabelaCartoes.jsx. É um ranking, então a posição vira
                o selo do cartão e o total vendido o destaque — quantidade e ticket
                médio ficam abaixo, para comparação. */}
            <TabelaCartoes
                itens={ranking}
                chave={c => c.chave}
                vazio={<span className="text-corpo text-gray-400">Nenhuma venda no período.</span>}
                colunas={[
                    {
                        papel: 'titulo',
                        titulo: 'Cliente',
                        tdClassName: 'px-6 py-4 text-corpo font-semibold text-tinta truncate max-w-[240px]',
                        celula: c => <span title={nomeDe(c)}>{nomeDe(c)}</span>,
                    },
                    {
                        papel: 'selo',
                        titulo: '#',
                        rotuloCartao: 'Posição',
                        thClassName: 'px-6 py-4 w-12',
                        tdClassName: 'px-6 py-4 text-compacto font-bold text-tinta-fraca tabular-nums',
                        celula: c => <span className="text-compacto font-bold text-tinta-fraca tabular-nums">{c.posicao}º</span>,
                    },
                    {
                        papel: 'destaque',
                        titulo: 'Total vendido',
                        rotuloCartao: 'Total',
                        thClassName: 'px-6 py-4 text-right',
                        tdClassName: 'px-6 py-4 text-corpo font-bold text-tinta text-right whitespace-nowrap tabular-nums',
                        celula: c => `R$ ${formatarValorFinanceiro(totalDe(c))}`,
                    },
                    {
                        titulo: 'Qtd. O.S.',
                        rotuloCartao: 'O.S.',
                        thClassName: 'px-6 py-4 text-center',
                        tdClassName: 'px-6 py-4 text-corpo text-center text-tinta-suave tabular-nums',
                        celula: c => c.qtd,
                    },
                    {
                        titulo: 'Ticket médio',
                        thClassName: 'px-6 py-4 text-right',
                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave text-right whitespace-nowrap tabular-nums',
                        celula: c => `R$ ${formatarValorFinanceiro(c.qtd > 0 ? totalDe(c) / c.qtd : 0)}`,
                    },
                ]}
            />
        </div>
    );
}
