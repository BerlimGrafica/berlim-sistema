"use client";
import { useEffect, useState } from 'react';
import { useCadastros } from '@/context/CadastrosContext';
import * as banner from '@/lib/calculadoras/banner';
import * as adesivo from '@/lib/calculadoras/adesivo';
import * as casamento from '@/lib/calculadoras/casamento';
import * as bloquinhos from '@/lib/calculadoras/bloquinhos';
import * as hotmelt from '@/lib/calculadoras/hotmelt';
import LogoCarregando from '@/components/ui/LogoCarregando';

// Protótipo da nova tela de Calculadoras: as cinco (banner, adesivo, casamento,
// bloquinho e livro hot melt) numa tela só, com o desenho do DESIGN.md.
//
// Como nas outras telas novas, public/prototipos/calculadoras.html é só a
// casca. A diferença é que aqui não há dado de banco para mostrar, e sim CONTA:
// as regras de preço moram em lib/calculadoras/*.js e a casca as recebe prontas
// ao carregar (iniciarCalculadoras), em vez de ter uma cópia delas — a cópia
// envelheceria no primeiro reajuste. O iframe é do mesmo endereço, então pode
// chamar as funções daqui direto.
//
// Do banco entram só os preços dos adesivos (produtos 15 a 21, como na tela de
// hoje), no lugar do marcador /*CALCULADORAS*/. Nada aqui grava: os ajustes de
// custo do bloquinho e do hot melt ficam no navegador, com as mesmas chaves da
// tela de hoje — o que alguém já ajustou lá vale aqui também.
const CONTAS = { banner, adesivo, casamento, bloquinhos, hotmelt };

export default function Page() {
    const { produtos } = useCadastros();
    const [modelo, setModelo] = useState(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/calculadoras.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    if (!modelo || produtos.length === 0) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    const dados = { precosAdesivo: adesivo.precosDoCatalogo(produtos) };
    // "<" escapado para um nome de produto nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*CALCULADORAS*/', `const DADOS = ${json};`);

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências; a rolagem fica toda dentro do protótipo. clipboard-write
    // deixa o "Copiar imagem" do banner pôr o PNG na área de transferência.
    return (
        <iframe
            title="Protótipo da nova tela de Calculadoras"
            srcDoc={html}
            allow="clipboard-write"
            onLoad={(e) => e.currentTarget.contentWindow?.iniciarCalculadoras?.(CONTAS)}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
