"use client";
import { CalculadoraBanner } from '@/components/calculadoras/CalculadoraBanner';
import { CalculadoraAdesivo } from '@/components/calculadoras/CalculadoraAdesivo';
import { CalculadoraCasamento } from '@/components/calculadoras/CalculadoraCasamento';
import { CalculadoraBloquinho } from '@/components/calculadoras/CalculadoraBloquinho';
import { CalculadoraHotmelt } from '@/components/calculadoras/CalculadoraHotmelt';

// As duas novas ocupam a tela toda: elas têm uma coluna de ajustes ao lado dos
// números, e com 5xl sobrava margem vazia dos dois lados enquanto o conteúdo se
// empilhava no meio. O teto existe só para a linha de texto não ficar longa
// demais num monitor ultrawide.
const LARGURAS = { bloquinho: 'max-w-[1500px]', hotmelt: 'max-w-[1500px]' };

export function CalculadorasAba({ calculadoraAtiva, produtos }) {
    const largura = LARGURAS[calculadoraAtiva] || 'max-w-3xl';

    return (
        <div className={`flex-1 p-6 lg:p-10 mx-auto w-full ${largura} flex flex-col`}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Calculadoras</h1>
                    <p className="text-corpo text-tinta-suave mt-1">Ferramentas para auxiliar em orçamentos rápidos.</p>
                </div>
            </div>

            <div className="w-full">
                {calculadoraAtiva === 'banner' && <CalculadoraBanner />}
                {calculadoraAtiva === 'adesivo' && <CalculadoraAdesivo produtos={produtos} />}
                {calculadoraAtiva === 'casamento' && <CalculadoraCasamento />}
                {calculadoraAtiva === 'bloquinho' && <CalculadoraBloquinho />}
                {calculadoraAtiva === 'hotmelt' && <CalculadoraHotmelt />}
            </div>
        </div>
    );
}
