"use client";
import { useSessao } from '@/context/SessaoContext';
import { formatarValorFinanceiro, mascararCliente, centavosParaReais } from '@/lib/utils/formatters';

export default function VendasPorClientePanel({ metricas }) {
    const { isDemo } = useSessao();

    // O agrupamento é feito no banco pelo VÍNCULO (cliente_id), nunca pelo nome
    // digitado: o cadastro tem centenas de homônimos e somar por texto fundiria
    // pessoas diferentes numa linha só. Sem vínculo é venda avulsa ("Balcão").
    const ranking = metricas.ranking_cliente;

    return (
        <div className="bg-superficie border border-borda rounded overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                        <tr className="border-b border-borda text-corpo font-semibold text-tinta-suave tracking-wide uppercase">
                            <th className="px-6 py-4 w-12">#</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4 text-center">Qtd. O.S.</th>
                            <th className="px-6 py-4 text-right">Ticket médio</th>
                            <th className="px-6 py-4 text-right">Total vendido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-borda-fraca">
                        {ranking.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-12 text-center text-corpo text-gray-400">Nenhuma venda no período.</td></tr>
                        ) : ranking.map((c, index) => {
                            // "Balcão" não é nome de pessoa — não passa pelo mascaramento do modo demo.
                            const nome = c.eh_balcao ? c.rotulo : mascararCliente(c.rotulo, isDemo);
                            const total = centavosParaReais(c.centavos);
                            return (
                                <tr key={c.chave} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors">
                                    <td className="px-6 py-4 text-compacto font-bold text-tinta-fraca tabular-nums">{index + 1}</td>
                                    <td className="px-6 py-4 text-corpo font-semibold text-tinta truncate max-w-[240px]" title={nome}>{nome}</td>
                                    <td className="px-6 py-4 text-corpo text-center text-tinta-suave tabular-nums">{c.qtd}</td>
                                    <td className="px-6 py-4 text-corpo text-tinta-suave text-right whitespace-nowrap tabular-nums">R$ {formatarValorFinanceiro(c.qtd > 0 ? total / c.qtd : 0)}</td>
                                    <td className="px-6 py-4 text-corpo font-bold text-tinta text-right whitespace-nowrap tabular-nums">R$ {formatarValorFinanceiro(total)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
