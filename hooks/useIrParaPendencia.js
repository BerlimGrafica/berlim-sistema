"use client";
import { useRouter } from 'next/navigation';
import { usePedidos } from '@/context/PedidosContext';
import { useFinanceiro } from '@/context/FinanceiroContext';

// Para onde levar ao clicar numa pendência. Diferente do antigo
// useNavegarAlerta, que traduzia um `tipo` num switch: aqui o destino é um
// campo da própria pendência (rota, sub-aba e, quando for o caso, a O.S. a
// abrir), então uma regra nova em pendencias.js já chega navegável.
export function useIrParaPendencia() {
    const router = useRouter();
    const { pedidos, abrirEdicao } = usePedidos();
    const { setAbaFinanceiro } = useFinanceiro();

    return function irPara(pendencia) {
        if (!pendencia) return;
        if (pendencia.aba) setAbaFinanceiro(pendencia.aba);
        if (pendencia.destino) router.push(pendencia.destino);
        if (pendencia.osId) {
            const pedido = pedidos.find(p => p.id === pendencia.osId);
            if (pedido) abrirEdicao(pedido);
        }
    };
}
