"use client";
import React from 'react';
import { useUi } from '@/context/UiContext';
import { useCadastros } from '@/context/CadastrosContext';
import { CalculadorasAba } from '@/components/calculadoras/CalculadorasAba';
import { SubAbas } from '@/components/ui/SubAbas';


export default function CalculadorasTab() {
    const { setCalculadoraAtiva, calculadoraAtiva } = useUi();
    const { produtos } = useCadastros();

    return (
        <>
            { (
                    <SubAbas
                        valor={calculadoraAtiva}
                        aoMudar={setCalculadoraAtiva}
                        abas={[
                            { id: 'banner',    rotulo: 'Banner / Lona',        icone: 'image' },
                            { id: 'adesivo',   rotulo: 'Adesivos (Vinil)',     icone: 'grid' },
                            { id: 'casamento', rotulo: 'Papelaria Casamento',  icone: 'heart' },
                        ]}
                    />
                )}
<CalculadorasAba calculadoraAtiva={calculadoraAtiva} produtos={produtos} />

        </>
    );
}
