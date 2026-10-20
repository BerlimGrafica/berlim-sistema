"use client";
import { useEffect, useState } from 'react';
import { useCadastros } from '@/context/CadastrosContext';

// Protótipo do novo modal de O.S. (opção B), aberto para a equipe testar.
//
// O HTML em public/prototipos/novaos.html não carrega preço nenhum: o catálogo
// entra aqui, lido do banco pela sessão de quem está logado, no lugar do
// marcador /*CATALOGO*/. Assim o arquivo público é só a casca, e os preços
// continuam atrás do login como no resto do sistema. Nada do protótipo grava
// no banco — clientes e equipe lá dentro são fictícios.
export default function Page() {
    const { produtos, fornecedoresTerceirizacaoNomes } = useCadastros();
    const [modelo, setModelo] = useState(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/novaos.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    if (!modelo || produtos.length === 0) {
        return <div className="p-6 text-corpo text-tinta-suave">Carregando protótipo…</div>;
    }

    const catalogo = produtos.map(p => [p.id, p.nome, p.preco_base || 0, p.texto_padrao || '']);
    const locais = fornecedoresTerceirizacaoNomes.length > 0 ? fornecedoresTerceirizacaoNomes.map(f => f.nome) : ['Berlim'];
    // "<" escapado para um nome de produto nunca fechar o <script> do protótipo.
    const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
    const html = modelo.replace('/*CATALOGO*/', `const CATALOGO = ${json(catalogo)};\nconst LOCAIS_NOMES = ${json(locais)};`);

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
