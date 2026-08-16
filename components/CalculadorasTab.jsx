"use client";
import React from 'react';
import { useUi } from '@/context/UiContext';
import { useCadastros } from '@/context/CadastrosContext';
import Icon from '@/components/Icon';
import { CalculadorasAba } from '@/components/calculadoras/CalculadorasAba';


export default function CalculadorasTab() {
    const { setCalculadoraAtiva, calculadoraAtiva } = useUi();
    const { produtos } = useCadastros();

    return (
        <>
            { (
                    <div className="bg-fundo border-b border-borda px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setCalculadoraAtiva('banner')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'banner' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="image" className="w-4 h-4" /> Banner / Lona</button>
                        <button onClick={() => setCalculadoraAtiva('adesivo')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'adesivo' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="grid" className="w-4 h-4" /> Adesivos (Vinil)</button>
                        <button onClick={() => setCalculadoraAtiva('casamento')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${calculadoraAtiva === 'casamento' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="heart" className="w-4 h-4" /> Papelaria Casamento</button>
                        {/* Se tiver mais calculadoras, elas aparecem aqui */}
                    </div>
                )}
<CalculadorasAba calculadoraAtiva={calculadoraAtiva} produtos={produtos} />

        </>
    );
}
