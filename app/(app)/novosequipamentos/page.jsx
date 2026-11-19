"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
// (lib/equipamentos/consultas.js); nada é trazido sem a aba aberta.
//
// O QUE SE FAZ LÁ DENTRO GRAVA
// Registrar carga ou manutenção, apagar registro, cadastrar e editar máquina,
// arquivar, restaurar e reordenar: o protótipo pede por mensagem (com um
// número, `n`) e esta página grava pelos MESMOS hooks da tela atual
// (useEquipamentos, useRegistrosEquipamentos), com as mesmas permissões — a
// RLS continua sendo a última palavra. A resposta volta com o mesmo `n`.
//
// A casca é montada uma vez; as máquinas e os registros novos vão por mensagem
// ('dados'). Recarregar o iframe a cada registro fecharia a gaveta.
const TIPOS_REGISTRO = new Set(['Reabastecimento', 'Manutenção']);
const TIPOS_MAQUINA = new Set(TIPOS_EQUIPAMENTO.map(t => t.id));
const ehData = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const ehTexto = (v, max) => typeof v === 'string' && v.length <= max;
const tintasValidas = v => Array.isArray(v) && v.length <= 12 && v.every(c => typeof c === 'string' && !!TINTAS[c]);

export default function Page() {
    const { usuario, usuariosSistema, isAdmin, isDemo } = useSessao();
    const maquinasApi = useEquipamentos();
    const registrosApi = useRegistrosEquipamentos();
    const { registros, total, carregando } = registrosApi;
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
    const maquinaProto = e => ({
        id: e.id, nome: e.nome, modelo: e.modelo || '', tipo: e.tipo, cromia: e.cromia,
        cores: e.cores || [], ordem: e.ordem, arquivada: !!e.arquivado_em,
    });

    const dados = useMemo(() => ({
        maquinas: maquinasApi.equipamentos.map(maquinaProto),
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
    }), [maquinasApi.equipamentos, registros, total, tecnicos, usuario, isAdmin, isDemo, usuariosSistema, paraProto]);

    const pronto = !!modelo && !maquinasApi.carregando && !carregando;
    // Montada uma vez, quando tudo chegou; o resto vai por mensagem.
    const html = useMemo(() => {
        if (!pronto) return null;
        // "<" escapado para um nome nunca fechar o <script> do protótipo.
        const json = JSON.stringify(dados).replace(/</g, '\\u003c');
        return modelo.replace('/*EQUIPAMENTOS*/', `const DADOS = ${json};`);
    }, [pronto]); // eslint-disable-line react-hooks/exhaustive-deps
    const dadosRef = useRef(dados);
    const enviarDados = useCallback(() => {
        const d = dadosRef.current;
        iframeRef.current?.contentWindow?.postMessage({ tipo: 'dados', maquinas: d.maquinas, registros: d.registros, totalRegistros: d.totalRegistros }, '/');
    }, []);
    useEffect(() => {
        dadosRef.current = dados;
        if (html) enviarDados();
    }, [html, dados, enviarDados]);

    // As funções de gravar mudam a cada render (dependem da lista): o ouvinte
    // lê sempre as mais novas daqui, sem se reinscrever a cada mudança.
    const apiRef = useRef(null);
    useEffect(() => { apiRef.current = { maquinasApi, registrosApi, tecnicos, paraProto }; });

    useEffect(() => {
        async function gravar(msg) {
            const { maquinasApi: maq, registrosApi: reg, tecnicos: tecs, paraProto: proto } = apiRef.current;
            const maquinaDe = id => maq.equipamentos.find(e => e.id === id);

            if (msg.tipo === 'registrar') {
                const e = msg.entrada || {};
                if (!maquinaDe(e.equipamento) || !TIPOS_REGISTRO.has(e.tipo) || !ehData(e.data)) return { erro: 'Registro inválido.' };
                if (!Number.isInteger(e.contador) || e.contador < 0) return { erro: 'Contador inválido.' };
                const carga = e.tipo === 'Reabastecimento';
                if (carga && (!tintasValidas(e.cores) || !e.cores.length)) return { erro: 'Escolha ao menos uma tinta.' };
                const entrada = { equipamento: e.equipamento, tipo: e.tipo, data: e.data, contador: e.contador, cores: carga ? e.cores : null, descricao: null };
                if (!carga) {
                    // Como no modal de hoje: técnico (id e nome) e valor só na manutenção.
                    const tec = typeof e.tecnico === 'string' ? tecs.find(t => t.nome === e.tecnico) : null;
                    entrada.descricao = ehTexto(e.descricao, 1000) ? e.descricao.trim() : '';
                    entrada.tecnico_id = tec?.id ?? null;
                    entrada.tecnico_nome = tec?.nome ?? null;
                    entrada.valor_centavos = Number.isInteger(e.valor_centavos) && e.valor_centavos > 0 ? e.valor_centavos : null;
                }
                const r = await reg.registrar(entrada);
                return r.erro ? { erro: r.erro } : { registro: proto(r.registro) };
            }
            if (msg.tipo === 'apagar-registro') {
                if (!Number.isInteger(msg.id)) return { erro: 'Registro inválido.' };
                return reg.apagar(msg.id);
            }
            if (msg.tipo === 'arquivar-maquina' || msg.tipo === 'restaurar-maquina') {
                if (!maquinaDe(msg.id)) return { erro: 'Máquina não encontrada.' };
                const r = await (msg.tipo === 'arquivar-maquina' ? maq.arquivar(msg.id) : maq.restaurar(msg.id));
                return r.erro ? { erro: r.erro } : {};
            }
            if (msg.tipo === 'salvar-maquina') {
                const d = msg.dados || {};
                if (!ehTexto(d.nome, 80) || !d.nome.trim() || !ehTexto(d.modelo || '', 80) || !TIPOS_MAQUINA.has(d.tipo)
                    || !['cor', 'mono'].includes(d.cromia) || !tintasValidas(d.cores) || !d.cores.length) return { erro: 'Dados da máquina inválidos.' };
                const limpos = { nome: d.nome.trim(), modelo: (d.modelo || '').trim() || null, tipo: d.tipo, cromia: d.cromia, cores: d.cores };
                const existente = msg.id == null ? null : maquinaDe(msg.id);
                if (msg.id != null && !existente) return { erro: 'Máquina não encontrada.' };
                if (!existente) {
                    const r = await maq.criar(limpos);
                    return r.erro ? { erro: r.erro } : { maquina: maquinaProto(r.equipamento) };
                }
                // Mudou de tipo, mudou de grupo: entra no fim do grupo novo (como na tela de hoje).
                if (limpos.tipo !== existente.tipo) {
                    limpos.ordem = maq.equipamentos.filter(x => x.tipo === limpos.tipo && !x.arquivado_em).reduce((m, x) => Math.max(m, x.ordem), 0) + 1;
                }
                const r = await maq.atualizar(existente.id, limpos);
                return r.erro ? { erro: r.erro } : { maquina: maquinaProto(r.equipamento) };
            }
            if (msg.tipo === 'reordenar') {
                const ids = Array.isArray(msg.ids) ? msg.ids.filter(Number.isInteger).slice(0, 200) : [];
                if (!ids.length || ids.some(id => !maquinaDe(id))) return { erro: 'Ordem inválida.' };
                return maq.reordenar(ids);
            }
            return null;
        }

        async function aoReceber(e) {
            const quadro = iframeRef.current;
            if (!quadro || e.source !== quadro.contentWindow) return;
            const msg = e.data || {};
            const responder = r => quadro.contentWindow?.postMessage(r, '/');
            if (msg.tipo === 'pronto') return enviarDados();
            if (msg.tipo === 'pedir-historico') {
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
                const r = await buscarHistorico(filtros, de);
                if (r.erro) responder({ tipo: 'historico-erro', pedido: msg.pedido, erro: r.erro.message || 'Não deu para carregar o histórico.' });
                else responder({ tipo: 'historico', pedido: msg.pedido, de, total: r.total, registros: r.registros.map(apiRef.current.paraProto) });
                return;
            }
            if (!Number.isInteger(msg.n)) return;
            const r = await gravar(msg);
            if (r === null) return;
            responder({ n: msg.n, ok: !r.erro, erro: r.erro || null, registro: r.registro || null, maquina: r.maquina || null });
        }
        window.addEventListener('message', aoReceber);
        return () => window.removeEventListener('message', aoReceber);
    }, [enviarDados]);

    if (!html) {
        return <div className="min-h-[60vh] grid place-items-center"><LogoCarregando mostrarTexto texto="Carregando protótipo" /></div>;
    }

    return (
        <iframe
            ref={iframeRef}
            title="Protótipo da nova tela de Equipamentos"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
