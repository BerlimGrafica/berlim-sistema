"use client";
import Icon from '@/components/Icon';
import { useAppContext } from '@/context/AppContext';

export function ItensChecklist({ pedido }) {
    const { atualizarItemConcluido } = useAppContext();
    const itens = [...(pedido.pedido_itens || [])].sort((a, b) => a.ordem - b.ordem);

    if (itens.length === 0) {
        return <span className="truncate max-w-[18rem] block">{pedido.servico ? pedido.servico.substring(0, 40) + '...' : '---'}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5 items-center w-full min-w-[300px]">
            {itens.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); atualizarItemConcluido(pedido.id, item.id, !item.concluido); }}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-semibold rounded shadow-sm transition transform hover:scale-105 ${
                        item.concluido
                            ? 'bg-emerald-500 text-white border border-emerald-600'
                            : 'bg-gray-100 dark:bg-darkElevated text-gray-500 dark:text-[#A1A1AA] border border-gray-200 dark:border-darkBorder hover:bg-gray-200 dark:hover:bg-darkHover'
                    }`}
                    title={item.concluido ? 'Marcar como pendente' : 'Marcar como concluído'}
                >
                    {item.concluido && <Icon name="check" className="w-3 h-3" />}
                    <span className="truncate max-w-[100px]">{item.nome}</span>
                </button>
            ))}
        </div>
    );
}
