"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarHistorico, POR_PAGINA } from '@/lib/equipamentos/consultas';

// O histórico de equipamentos, em páginas de 50, com os filtros feitos no
// banco (lib/equipamentos/consultas.js). Só busca com `ativo` — a parte da tela
// que mostra o histórico aberta —, e de novo só quando um filtro muda, ao pedir
// mais ou ao recarregar depois de registrar ou apagar. Nada em segundo plano.
//
// `filtros`: { equipamento, tipo, cor, tecnico }, todos opcionais.
export function useHistoricoEquipamentos(filtros, ativo = true) {
    const chave = JSON.stringify(filtros || {});
    const [estado, setEstado] = useState({ chave: null, registros: [], total: 0, erro: null });
    const [buscandoMais, setBuscandoMais] = useState(false);
    // Só a resposta do pedido mais recente vale: trocar de filtro no meio de uma
    // busca não pode deixar a lista do filtro anterior na tela.
    const ultimoPedido = useRef(0);

    // Busca uma página e devolve o resultado com o número do pedido.
    const ler = useCallback(async (de) => {
        const pedido = ++ultimoPedido.current;
        const r = await buscarHistorico(JSON.parse(chave), de);
        return { pedido, r };
    }, [chave]);

    // Aplica a página no estado, se ainda for a do pedido mais recente.
    const aplicar = useCallback(({ pedido, r }, acumular) => {
        if (pedido !== ultimoPedido.current) return;
        setEstado(e => r.erro
            ? { ...e, chave, erro: r.erro.message }
            : {
                chave,
                registros: acumular && e.chave === chave ? [...e.registros, ...r.registros] : r.registros,
                total: r.total,
                erro: null,
            });
    }, [chave]);

    useEffect(() => {
        if (!ativo) return;
        ler(0).then(x => aplicar(x, false));
    }, [ativo, ler, aplicar]);

    const carregarMais = useCallback(async () => {
        setBuscandoMais(true);
        aplicar(await ler(estado.registros.length), true);
        setBuscandoMais(false);
    }, [ler, aplicar, estado.registros.length]);

    // Depois de registrar ou apagar: a primeira página de novo, sem esvaziar a
    // lista enquanto a nova não chega.
    const recarregar = useCallback(() => ler(0).then(x => aplicar(x, false)), [ler, aplicar]);

    const atual = estado.chave === chave;
    return {
        registros: atual ? estado.registros : [],
        total: atual ? estado.total : 0,
        // Esperando a primeira página deste filtro.
        carregando: ativo && !atual,
        buscandoMais,
        temMais: atual && estado.registros.length < estado.total,
        porPagina: POR_PAGINA,
        erro: atual ? estado.erro : null,
        carregarMais,
        recarregar,
    };
}
