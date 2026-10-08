"use client";
import { useSyncExternalStore } from 'react';

// Preferência de interface guardada no aparelho — não no banco.
//
// São escolhas de quem está olhando a tela, não dados da gráfica: se a produção
// aparece compacta ou em cartão no celular de quem anda pela oficina não tem por
// que valer para o computador do balcão, nem para a colega do lado.
//
// POR QUE NÃO É SÓ `localStorage.getItem` NUM useState
// A página é pré-renderizada no servidor, que não tem como saber o que está
// guardado neste navegador. Ler no corpo do componente faria o servidor e o
// navegador renderizarem coisas diferentes, e a hidratação quebraria. O remendo
// comum — começar no padrão e corrigir com setState dentro de um useEffect — é
// justamente o que o React 19 passou a apontar como erro, porque dispara uma
// segunda renderização em cascata.
//
// `useSyncExternalStore` existe para este caso: recebe um valor para o servidor
// e outro para o navegador, e o React faz a troca sem reclamar de nenhum dos
// dois lados.
//
// O AVISO PRÓPRIO
// O evento `storage` do navegador só dispara em OUTRAS abas — nunca na aba que
// escreveu. Sem a lista de ouvintes abaixo, quem clicasse no botão não veria
// efeito nenhum até recarregar a página.

const ouvintes = new Set();

const assinar = (aoMudar) => {
    ouvintes.add(aoMudar);
    window.addEventListener('storage', aoMudar);
    return () => {
        ouvintes.delete(aoMudar);
        window.removeEventListener('storage', aoMudar);
    };
};

export function gravarPreferencia(chave, valor) {
    try {
        localStorage.setItem(chave, valor);
    } catch {
        // Aba anônima ou armazenamento bloqueado: a escolha vale só até fechar.
        // Avisar mesmo assim mantém a tela coerente com o que a pessoa clicou.
    }
    ouvintes.forEach(fn => fn());
}

// Devolve sempre texto, porque o valor precisa ser comparável por igualdade: o
// React chama a leitura a cada render e um objeto novo a cada chamada o faria
// concluir que mudou, para sempre.
export function usePreferencia(chave, padrao) {
    return useSyncExternalStore(
        assinar,
        () => {
            try { return localStorage.getItem(chave) ?? padrao; } catch { return padrao; }
        },
        () => padrao,
    );
}
