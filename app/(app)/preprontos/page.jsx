"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useOrcamentos } from '@/context/OrcamentosContext';
import LogoCarregando from '@/components/ui/LogoCarregando';

// Protótipo da nova tela de orçamentos pré-prontos: o balcão (busca, fixados,
// lista por categoria, copiar com um clique) com a conversa do WhatsApp do lado,
// onde a resposta para o cliente é montada juntando vários textos.
//
// Como em /novaos, o HTML em public/prototipos/preprontos.html é só a casca:
// os textos entram aqui, lidos do banco pela sessão de quem está logado, no
// lugar do marcador /*PREPRONTOS*/.
//
// SALVAR E EXCLUIR GRAVAM
// O protótipo pede por mensagem (com um número, `n`) e esta página grava pelo
// mesmo miolo do modal de hoje (gravarOrcamentoPre / apagarOrcamentoPre, no
// AppContext), com a mesma permissão: só o administrador altera os textos. Os
// fixados não têm coluna no banco: ficam guardados no navegador de quem fixou.
//
// A casca é montada uma vez; os textos novos vão por mensagem ('dados').
export default function Page() {
    const { orcamentosPreProntos, gravarOrcamentoPre, apagarOrcamentoPre } = useOrcamentos();
    const [modelo, setModelo] = useState(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/preprontos.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    const textos = useMemo(
        () => orcamentosPreProntos.map(o => [o.id, o.titulo || '', o.empresa || 'Berlim', o.texto || '']),
        [orcamentosPreProntos],
    );
    const pronto = !!modelo && orcamentosPreProntos.length > 0;
    // Montada uma vez; o resto vai por mensagem.
    const html = useMemo(() => {
        if (!pronto) return null;
        // "<" escapado para um texto nunca fechar o <script> do protótipo.
        const json = JSON.stringify(textos).replace(/</g, '\\u003c');
        return modelo.replace('/*PREPRONTOS*/', `const TEXTOS_BANCO = ${json};`);
    }, [pronto]); // eslint-disable-line react-hooks/exhaustive-deps
    const textosRef = useRef(textos);
    useEffect(() => {
        textosRef.current = textos;
        if (html) iframeRef.current?.contentWindow?.postMessage({ tipo: 'dados', textos }, '/');
    }, [html, textos]);

    useEffect(() => {
        async function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            if (msg.tipo === 'pronto') return quadro.contentWindow?.postMessage({ tipo: 'dados', textos: textosRef.current }, '/');
            if (!Number.isInteger(msg.n)) return;
            const responder = r => quadro.contentWindow?.postMessage({ n: msg.n, ok: !r.erro, erro: r.erro || null, id: r.texto?.id ?? null }, '/');
            const existe = id => orcamentosPreProntos.find(o => String(o.id) === String(id));
            if (msg.tipo === 'salvar-texto') {
                const titulo = typeof msg.titulo === 'string' ? msg.titulo.trim().slice(0, 200) : '';
                const texto = typeof msg.texto === 'string' ? msg.texto.slice(0, 20000) : '';
                if (!titulo || !texto.trim()) return responder({ erro: 'Preencha o título e o texto.' });
                const atual = msg.id == null ? null : existe(msg.id);
                if (msg.id != null && !atual) return responder({ erro: 'Este texto não existe mais.' });
                return responder(await gravarOrcamentoPre({ id: atual?.id ?? null, titulo, texto, empresa: msg.empresa === 'Futura' ? 'Futura' : 'Berlim' }));
            }
            if (msg.tipo === 'excluir-texto') {
                const atual = existe(msg.id);
                if (!atual) return responder({ erro: 'Este texto não existe mais.' });
                return responder(await apagarOrcamentoPre(atual.id));
            }
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [orcamentosPreProntos, gravarOrcamentoPre, apagarOrcamentoPre]);

    if (!html) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências; a rolagem fica toda dentro do protótipo.
    return (
        <iframe
            ref={iframeRef}
            title="Protótipo dos orçamentos pré-prontos"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
