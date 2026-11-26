"use client";
import Notas_fiscaisTab from '@/components/Notas_fiscaisTab';
import NovoFinanceiro from '../novofinanceiro/page';
import { useSessao } from '@/context/SessaoContext';
import { usaTelasNovas } from '@/lib/acesso/telasNovas';

export default function Page() {
    // Quem testa as telas novas vê aqui a aba de Notas fiscais do Financeiro
    // novo, sozinha (sem as outras abas nem os dados delas): esta tela existe
    // para quem cuida só das notas. O resto da equipe segue na tela atual.
    const { usuario } = useSessao();
    if (usaTelasNovas(usuario)) return <NovoFinanceiro somente="notas" />;
    return <Notas_fiscaisTab />;
}
