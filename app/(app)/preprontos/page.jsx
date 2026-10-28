"use client";
import { useEffect, useState } from 'react';
import { useOrcamentos } from '@/context/OrcamentosContext';
import BarraDeCor from '@/components/ui/BarraDeCor';

// Protótipo da nova tela de orçamentos pré-prontos (opções A a D), aberto para
// a equipe comparar.
//
// Como em /novaos, o HTML em public/prototipos/preprontos.html é só a casca:
// os textos entram aqui, lidos do banco pela sessão de quem está logado, no
// lugar do marcador /*PREPRONTOS*/. Edições, exclusões e fixados feitos lá
// dentro ficam só na tela — nada grava no banco.
export default function Page() {
    const { orcamentosPreProntos } = useOrcamentos();
    const [modelo, setModelo] = useState(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/preprontos.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    if (!modelo || orcamentosPreProntos.length === 0) {
        return <div className="min-h-[60vh] grid place-items-center"><BarraDeCor mostrarTexto texto="Carregando protótipo" /></div>;
    }

    const textos = orcamentosPreProntos.map(o => [o.id, o.titulo || '', o.empresa || 'Berlim', o.texto || '']);
    // "<" escapado para um texto nunca fechar o <script> do protótipo.
    const json = JSON.stringify(textos).replace(/</g, '\\u003c');
    const html = modelo.replace('/*PREPRONTOS*/', `const TEXTOS_BANCO = ${json};`);

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências; a rolagem fica toda dentro do protótipo.
    return (
        <iframe
            title="Protótipo dos orçamentos pré-prontos"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
