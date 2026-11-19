"use client";
import { useRouter } from 'next/navigation';
import { usePedidos } from '@/context/PedidosContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { useSessao } from '@/context/SessaoContext';
import { usaTelasNovas } from '@/lib/acesso/telasNovas';
import { ABRIR_NOVA_OS } from '@/components/prototipos/NovaOSGlobal';

// Para onde levar ao clicar numa pendência. Diferente do antigo
// useNavegarAlerta, que traduzia um `tipo` num switch: aqui o destino é um
// campo da própria pendência (rota, sub-aba e, quando for o caso, a O.S. a
// abrir), então uma regra nova em pendencias.js já chega navegável.
//
// Quem usa as telas novas vê a O.S. no modal novo, aberto ali mesmo, sem trocar
// de tela (components/prototipos/NovaOSGlobal.jsx): trocar de tela e abrir o
// modal ao mesmo tempo brigariam pelo histórico do navegador.
export function useIrParaPendencia() {
    const router = useRouter();
    const { pedidos, abrirEdicao } = usePedidos();
    const { setAbaFinanceiro } = useFinanceiro();
    const { usuario } = useSessao();
    const telasNovas = usaTelasNovas(usuario);

    return function irPara(pendencia) {
        if (!pendencia) return;
        if (telasNovas && pendencia.osId) {
            window.dispatchEvent(new CustomEvent(ABRIR_NOVA_OS, { detail: { id: pendencia.osId } }));
            return;
        }
        if (pendencia.aba) setAbaFinanceiro(pendencia.aba);
        if (pendencia.destino) router.push(pendencia.destino);
        if (pendencia.osId) {
            const pedido = pedidos.find(p => p.id === pendencia.osId);
            if (pedido) abrirEdicao(pedido);
        }
    };
}
