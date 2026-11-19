"use client";
import VendasTab from '@/components/VendasTab';
import NovasVendas from '../novavendas/page';
import { useSessao } from '@/context/SessaoContext';
import { usaTelasNovas } from '@/lib/acesso/telasNovas';

export default function Page() {
    // Quem testa as telas novas vê a versão nova neste mesmo endereço
    // (lib/acesso/telasNovas.js); o resto da equipe segue na tela atual.
    const { usuario } = useSessao();
    if (usaTelasNovas(usuario)) return <NovasVendas />;
    return <VendasTab />;
}
