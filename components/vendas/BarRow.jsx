"use client";
import { formatarValorFinanceiro } from '@/lib/utils/formatters';

export function BarRow({ label, valor, maxVal, color, rank, pctTotal }) {
    // Estorno entra negativo nos rankings (mesmo sinal do total recebido). A
    // barra usa o módulo para ter largura, e a linha inteira fica vermelha —
    // senão um valor negativo apareceria como uma barra mínima, indistinguível
    // de um valor pequeno.
    const negativo = valor < 0;
    const pct = maxVal > 0 ? (Math.abs(valor) / maxVal) * 100 : 0;

    return (
        <div className="flex items-center gap-3 group">
            {rank != null && (
                <span className="w-5 h-5 shrink-0 rounded-full bg-realce text-micro font-bold text-tinta-suave flex items-center justify-center">{rank}</span>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                    <span className="text-compacto font-semibold text-tinta-corpo truncate">{label}</span>
                    <span className={`text-compacto font-bold tabular-nums shrink-0 ${negativo ? 'text-red-600 dark:text-red-400' : 'text-tinta'}`}>
                        {negativo ? '− ' : ''}R$ {formatarValorFinanceiro(Math.abs(valor))}
                    </span>
                </div>
                <div className="h-[6px] rounded-full bg-realce overflow-hidden">
                    <div className={`h-full rounded-full ${negativo ? 'bg-red-500' : color} transition-all duration-500 group-hover:opacity-90`} style={{ width: `${Math.max(pct, 2)}%` }}></div>
                </div>
            </div>
            {pctTotal != null && (
                <span className="text-micro font-semibold text-gray-400 w-9 text-right tabular-nums shrink-0">{pctTotal.toFixed(0)}%</span>
            )}
        </div>
    );
}
