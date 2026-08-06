"use client";
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

// Pra onde a app deve levar o usuário ao clicar num alerta — usado tanto pelo
// dropdown do sino (Navbar) quanto pelos toasts, pra manter as duas entradas
// consistentes sem duplicar o switch por tipo.
export function useNavegarAlerta() {
    const router = useRouter();
    const { setAbaFinanceiro, pedidos, abrirEdicao, usuario } = useAppContext();

    return function navegarParaAlerta(alerta) {
        if (alerta.tipo === 'faturamento_em_analise') {
            setAbaFinanceiro('empresas_aprovadas');
            router.push('/financeiro');
        } else if (alerta.tipo === 'nf_nova' || alerta.tipo === 'nf_preenchida') {
            if (usuario?.nivel === 'Atendimento') {
                router.push('/notas-fiscais');
            } else {
                setAbaFinanceiro('notas_fiscais');
                router.push('/financeiro');
            }
        } else {
            router.push('/producao');
            if (alerta.os_id) {
                const p = pedidos.find(x => x.id === alerta.os_id);
                if (p) abrirEdicao(p);
            }
        }
    };
}
