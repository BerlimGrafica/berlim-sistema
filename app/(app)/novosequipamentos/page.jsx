"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useEquipamentos } from '@/hooks/useEquipamentos';
import { useRegistrosEquipamentos } from '@/hooks/useRegistrosEquipamentos';
import { useTecnicosManutencao } from '@/hooks/useTecnicosManutencao';
import { buscarHistorico } from '@/lib/equipamentos/consultas';
import { TINTAS, TIPOS_EQUIPAMENTO } from '@/lib/equipamentos/catalogo';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import LogoCarregando from '@/components/ui/LogoCarregando';

// Protótipo da nova tela de Equipamentos, no padrão do DESIGN.md. A lista de
// máquinas é o quadro de tintas (a opção B escolhida; a lista por tipo saiu).
//
// Como em /novaproducao, o HTML em public/prototipos/equipamentos.html é só a
// casca: as máquinas, o resumo dos registros e os técnicos entram aqui, lidos
// com a sessão de quem está logado, no lugar do marcador /*EQUIPAMENTOS*/ — os
// mesmos hooks da tela atual. O histórico o protótipo PEDE por mensagem, uma
// página por vez e com os filtros, e a página busca no banco
// (lib/equipamentos/consultas.js); nada é trazido sem a aba aberta. Tudo o que
// se faz lá dentro (registrar, apagar, cadastrar, reordenar) fica só na tela.
const TIPOS_REGISTRO = new Set(['Reabastecimento', 'Manutenção']);

export default function Page() {
    const { usuario, usuariosSistema, isAdmin, isDemo } = useSessao();
    const maquinasApi = useEquipamentos();
    const { registros, total, carregando } = useRegistrosEquipamentos();
    const tecnicos = useTecnicosManutencao();
    const [modelo, setModelo] = useState(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/equipamentos.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    // Um registro no formato do protótipo; `rend` é o rendimento de cada tinta,
    // quando vem pronto do banco.
    const paraProto = useCallback(r => ({
        id: r.id, eq: r.equipamento, tipo: r.tipo, data: r.data, contador: r.contador,
        cores: r.cores || [], desc: r.descricao || '', tecnico: r.tecnico_nome || '',
        valor: r.valor_centavos, por: (usuariosSistema || []).find(u => u.id === r.criado_por)?.nome || '',
        meu: !!usuario?.id && r.criado_por === usuario.id,
        rend: r.rendimentos || null,
    }), [usuariosSistema, usuario]);

    // O protótipo pede uma página do histórico; a página busca e responde.
    useEffect(() => {
        async function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            if (msg.tipo !== 'pedir-historico') return;
            // Cada filtro é uma lista (escolha múltipla); só passa o que é válido.
            const f = msg.filtros || {};
            const lista = (v, valido) => (Array.isArray(v) ? v : []).filter(valido).slice(0, 40);
            const filtros = {
                equipamento: lista(f.maq, Number.isInteger),
                tipo: lista(f.tipo, t => TIPOS_REGISTRO.has(t)),
                cor: lista(f.cor, c => typeof c === 'string' && !!TINTAS[c]),
                tecnico: lista(f.tec, t => typeof t === 'string' && t.length <= 80),
            };
            const de = Number.isInteger(msg.de) && msg.de >= 0 ? msg.de : 0;
            const responder = r => quadro.contentWindow?.postMessage(r, '/');
            const r = await buscarHistorico(filtros, de);
            if (r.erro) responder({ tipo: 'historico-erro', pedido: msg.pedido, erro: r.erro.message || 'Não deu para carregar o histórico.' });
            else responder({ tipo: 'historico', pedido: msg.pedido, de, total: r.total, registros: r.registros.map(paraProto) });
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [paraProto]);

    if (!modelo || maquinasApi.carregando || carregando) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    const dados = {
        maquinas: maquinasApi.equipamentos.map(e => ({
            id: e.id, nome: e.nome, modelo: e.modelo || '', tipo: e.tipo, cromia: e.cromia,
            cores: e.cores || [], ordem: e.ordem, arquivada: !!e.arquivado_em,
        })),
        // O resumo, não a tabela inteira: o que o quadro e a gaveta usam.
        registros: registros.map(paraProto),
        totalRegistros: total,
        tipos: TIPOS_EQUIPAMENTO.map(t => ({ id: t.id, rotulo: t.rotulo })),
        tintas: Object.entries(TINTAS),
        tecnicos: tecnicos.map(t => t.nome),
        eu: usuario?.nome || '',
        admin: !!isAdmin,
        organizar: !isDemo,
        cores: Object.fromEntries((usuariosSistema || []).map(u => [u.nome, corDoNome(u.nome)])),
    };
    // "<" escapado para um nome nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*EQUIPAMENTOS*/', `const DADOS = ${json};`);

    return (
        <iframe
            ref={iframeRef}
            title="Protótipo da nova tela de Equipamentos"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
