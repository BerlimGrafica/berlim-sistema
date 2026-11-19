"use client";
import OrcamentosTab from '@/components/OrcamentosTab';
import NovosOrcamentos from '../novosorcamentos/page';
import PreProntos from '../preprontos/page';
import { SubAbas } from '@/components/ui/SubAbas';
import { useSessao } from '@/context/SessaoContext';
import { useOrcamentos } from '@/context/OrcamentosContext';
import { usaTelasNovas } from '@/lib/acesso/telasNovas';
import { subtelasVisiveis } from '@/lib/acesso/telas';

export default function Page() {
    const { usuario } = useSessao();
    const { abaOrcamentos, setAbaOrcamentos } = useOrcamentos();
    if (!usaTelasNovas(usuario)) return <OrcamentosTab />;

    // Quem testa as telas novas vê a versão nova neste mesmo endereço
    // (lib/acesso/telasNovas.js). Aqui são duas telas novas, e a sub-aba
    // escolhe entre elas: os formalizados ou os pré-prontos. A faixa de
    // sub-abas é a mesma da tela atual — com o menu lateral recolhido (ou no
    // celular) ela é o único caminho de uma para a outra; com o menu aberto ela
    // some, porque as sub-abas já estão nele.
    return (
        <div className="absolute inset-0 flex flex-col">
            <SubAbas valor={abaOrcamentos} aoMudar={setAbaOrcamentos} abas={subtelasVisiveis(usuario, 'orcamentos')} />
            <div className="relative flex-1 min-h-0">
                {abaOrcamentos === 'pre_prontos' ? <PreProntos /> : <NovosOrcamentos />}
            </div>
        </div>
    );
}
