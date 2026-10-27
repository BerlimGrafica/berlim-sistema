"use client";
import { useEffect, useState } from 'react';
import { useCadastros } from '@/context/CadastrosContext';
import { useSessao } from '@/context/SessaoContext';
import { carregarModeloNovaOS, montarNovaOS } from '@/lib/prototipos/novaos';

// Protótipo do novo modal de O.S. (opção B), aberto para a equipe testar.
//
// O HTML em public/prototipos/novaos.html não carrega preço nenhum: o catálogo
// e a equipe entram aqui, lidos do banco pela sessão de quem está logado (ver
// lib/prototipos/novaos.js). Assim o arquivo público é só a casca, e os dados
// continuam atrás do login como no resto do sistema. Nada do protótipo grava no
// banco — os clientes lá dentro são fictícios.
export default function Page() {
    const { produtos, fornecedoresTerceirizacaoNomes } = useCadastros();
    const { usuariosSistema } = useSessao();
    const [modelo, setModelo] = useState(null);

    useEffect(() => {
        let vivo = true;
        carregarModeloNovaOS().then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    if (!modelo || produtos.length === 0) {
        return <div className="p-6 text-corpo text-tinta-suave">Carregando protótipo…</div>;
    }

    const html = montarNovaOS(modelo, { produtos, locais: fornecedoresTerceirizacaoNomes.map(f => f.nome), usuariosSistema });

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências (o pai é "relative" e estica até o fim da tela), sem rolagem
    // dupla — a rolagem fica toda dentro do protótipo.
    return (
        <iframe
            title="Protótipo do modal de O.S."
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
