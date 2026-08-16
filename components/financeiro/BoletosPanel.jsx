"use client";
import { useFinanceiro } from '@/context/FinanceiroContext';
import { SkeletonLinhas } from '@/components/ui/SkeletonLinhas';
import { obterDataAtual } from '@/lib/utils/formatters';
import BoletoRow from '@/components/financeiro/BoletoRow';

export default function BoletosPanel({ dataInicio, dataFim }) {
    const { pedidosBoleto, carregandoBoletos } = useFinanceiro();

    return (
        <div>
            <div className="bg-superficie border border-borda rounded overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                            <tr className="border-b border-borda text-corpo font-semibold text-tinta-suave tracking-wide uppercase">
                                <th className="px-6 py-4">O.S.</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4 w-52">CNPJ</th>
                                <th className="px-6 py-4 w-48">Número do Boleto</th>
                                <th className="px-6 py-4 w-40 text-right">Valor</th>
                                <th className="px-6 py-4 w-36 text-center">Data de Emissão</th>
                                <th className="px-6 py-4 w-36 text-center">Prazo</th>
                                <th className="px-6 py-4 w-28 text-center">Protesto/<br />Negativação</th>
                                <th className="px-6 py-4 w-32 text-center">Situação</th>
                                <th className="px-6 py-4 w-24 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-borda-fraca">
                            {(() => {
                                const hojeStr = obterDataAtual();
                                // Deriva "amanhã" a partir da própria string de hoje (em vez de um novo Date()),
                                // pra garantir exatamente 1 dia de diferença mesmo com o fuso de obterDataAtual.
                                const [anoHoje, mesHoje, diaHoje] = hojeStr.split('-').map(Number);
                                const amanha = new Date(anoHoje, mesHoje - 1, diaHoje + 1);
                                const amanhaStr = amanha.getFullYear() + '-' + String(amanha.getMonth() + 1).padStart(2, '0') + '-' + String(amanha.getDate()).padStart(2, '0');

                                const pedidosFiltrados = pedidosBoleto.filter(p => {
                                    if (dataInicio && (!p.prazo_pagamento || p.prazo_pagamento < dataInicio)) return false;
                                    if (dataFim && (!p.prazo_pagamento || p.prazo_pagamento > dataFim)) return false;
                                    return true;
                                });

                                if (carregandoBoletos && pedidosFiltrados.length === 0) return (
                                    <SkeletonLinhas colunas={10} />
                                );

                                if (pedidosFiltrados.length === 0) return (
                                    <tr><td colSpan="10" className="px-4 py-12 text-center text-corpo text-gray-400">Nenhum pedido com boleto encontrado.</td></tr>
                                );

                                return pedidosFiltrados.map(p => {
                                    let statusPagamento = 'A Pagar';
                                    let statusPagamentoCor = 'bg-realce text-tinta-suave border-borda-forte';
                                    if (p.boleto.boleto_concluido) {
                                        statusPagamento = 'Pago';
                                        statusPagamentoCor = 'bg-emerald-50 text-sucesso border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800';
                                    } else if (p.prazo_pagamento && p.prazo_pagamento < hojeStr) {
                                        statusPagamento = 'Vencido';
                                        statusPagamentoCor = 'bg-red-50 text-perigo border-red-200 dark:bg-red-900/30 dark:border-red-800';
                                    } else if (p.prazo_pagamento === hojeStr) {
                                        statusPagamento = 'Vence hoje';
                                        statusPagamentoCor = 'bg-amber-50 text-aviso border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
                                    } else if (p.prazo_pagamento === amanhaStr) {
                                        statusPagamento = 'Vence amanhã';
                                        statusPagamentoCor = 'bg-amber-50 text-aviso border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
                                    }
                                    return <BoletoRow key={p.id} p={p} statusPagamento={statusPagamento} statusPagamentoCor={statusPagamentoCor} />;
                                });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
