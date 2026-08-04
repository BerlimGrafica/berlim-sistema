"use client";
import { CalculadoraBanner } from '@/components/calculadoras/CalculadoraBanner';
import { CalculadoraAdesivo } from '@/components/calculadoras/CalculadoraAdesivo';
import { CalculadoraCasamento } from '@/components/calculadoras/CalculadoraCasamento';

export function CalculadorasAba({ calculadoraAtiva, produtos }) {
    return (
        <div className="flex-1 p-6 lg:p-10 mx-auto w-full max-w-3xl flex flex-col">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Calculadoras</h1>
                    <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Ferramentas para auxiliar em orçamentos rápidos.</p>
                </div>
            </div>

            <div className="w-full">
                {calculadoraAtiva === 'banner' && <CalculadoraBanner />}
                {calculadoraAtiva === 'adesivo' && <CalculadoraAdesivo produtos={produtos} />}
                {calculadoraAtiva === 'casamento' && <CalculadoraCasamento />}
            </div>
        </div>
    );
}
