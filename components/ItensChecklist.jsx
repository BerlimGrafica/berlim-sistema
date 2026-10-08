"use client";
import Icon from '@/components/Icon';
import { usePedidos } from '@/context/PedidosContext';
import { resumoDoPedido } from '@/lib/utils/servico';

// `compacto` é a versão para a linha do celular. A diferença não é só de gosto:
// o `min-w-[300px]` abaixo existe para a coluna da tabela não espremer os chips,
// e numa linha de 340px ele empurraria o prazo para fora da tela. No compacto o
// mínimo sai e os chips encolhem.
export function ItensChecklist({ pedido, compacto = false }) {
    const { atualizarItemConcluido } = usePedidos();
    const itens = [...(pedido.pedido_itens || [])].sort((a, b) => a.ordem - b.ordem);

    // Sem itens não há o que marcar — mostra o resumo (OS antiga ou só observação).
    if (itens.length === 0) {
        return <span className={`block truncate ${compacto ? 'text-micro text-tinta-suave' : 'max-w-[18rem]'}`}>{resumoDoPedido(pedido)}</span>;
    }

    return (
        <div className={`flex flex-wrap items-center ${compacto ? 'gap-1' : 'gap-1.5 w-full min-w-[300px]'}`}>
            {itens.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); atualizarItemConcluido(pedido.id, item.id, !item.concluido); }}
                    className={`flex items-center gap-1 uppercase font-semibold rounded shadow-sm transition transform hover:scale-105 ${compacto ? 'px-1.5 py-0.5 text-micro' : 'px-2 py-1 text-micro'} ${
                        item.concluido
                            ? 'bg-emerald-500 text-white border border-emerald-600'
                            : 'bg-realce text-tinta-suave border border-borda hover:bg-gray-200 dark:hover:bg-darkHover'
                    }`}
                    title={item.concluido ? 'Marcar como pendente' : 'Marcar como concluído'}
                >
                    {item.concluido && <Icon name="check" className="w-3 h-3" />}
                    <span className={`truncate ${compacto ? 'max-w-[88px]' : 'max-w-[100px]'}`}>{item.nome}</span>
                </button>
            ))}
        </div>
    );
}
