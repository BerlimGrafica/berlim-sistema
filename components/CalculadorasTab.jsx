"use client";
import React from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { useCadastros } from '@/context/CadastrosContext';
import { CalculadorasAba } from '@/components/calculadoras/CalculadorasAba';
import { SubAbas } from '@/components/ui/SubAbas';
import { subtelasVisiveis } from '@/lib/acesso/telas';


export default function CalculadorasTab() {
    const { usuario } = useSessao();
    const { setCalculadoraAtiva, calculadoraAtiva } = useUi();
    const { produtos } = useCadastros();

    return (
        <>
            { (
                    <SubAbas
                        valor={calculadoraAtiva}
                        aoMudar={setCalculadoraAtiva}
                        abas={subtelasVisiveis(usuario, 'calculadoras')}
                    />
                )}
<CalculadorasAba calculadoraAtiva={calculadoraAtiva} produtos={produtos} />

        </>
    );
}
