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
                <span className="w-5 h-5 shrink-0 rounded-full bg-gray-100 dark:bg-darkElevated text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center justify-center">{rank}</span>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                    <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 truncate">{label}</span>
                    <span className={`text-[12px] font-bold tabular-nums shrink-0 ${negativo ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {negativo ? '− ' : ''}R$ {formatarValorFinanceiro(Math.abs(valor))}
                    </span>
                </div>
                <div className="h-[6px] rounded-full bg-gray-100 dark:bg-darkElevated overflow-hidden">
                    <div className={`h-full rounded-full ${negativo ? 'bg-red-500' : color} transition-all duration-500 group-hover:opacity-90`} style={{ width: `${Math.max(pct, 2)}%` }}></div>
                </div>
            </div>
            {pctTotal != null && (
                <span className="text-[10px] font-semibold text-gray-400 w-9 text-right tabular-nums shrink-0">{pctTotal.toFixed(0)}%</span>
            )}
        </div>
    );
}
