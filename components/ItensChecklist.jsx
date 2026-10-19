"use client";
import Icon from '@/components/Icon';
import { usePedidos } from '@/context/PedidosContext';
import { resumoDoPedido } from '@/lib/utils/servico';

// `compacto` é a versão para a linha do celular: chips menores, sem largura
// mínima.
//
// Na tabela o mínimo é de 12rem — o bastante para um chip inteiro (o nome corta
// em 100px) sem espremer. Era 300px, e era ele, mais que a coluna, que travava
// a tabela da Produção mais larga que a tela de um notebook com o menu aberto:
// o Serviço é a coluna que deve ceder espaço, porque os chips quebram linha.
export function ItensChecklist({ pedido, compacto = false }) {
    const { atualizarItemConcluido } = usePedidos();
    const itens = [...(pedido.pedido_itens || [])].sort((a, b) => a.ordem - b.ordem);

    // Sem itens não há o que marcar — mostra o resumo (OS antiga ou só observação).
    // Na tabela ele quebra em até duas linhas em vez de cortar numa só: uma linha
    // de 18rem sem quebra era uma largura mínima escondida, que alargava a coluna
    // de novo sempre que uma O.S. antiga aparecesse na lista.
    if (itens.length === 0) {
        return (
            <span className={compacto ? 'block truncate text-micro text-tinta-suave' : 'line-clamp-2 break-words'} title={resumoDoPedido(pedido)}>
                {resumoDoPedido(pedido)}
            </span>
        );
    }

    return (
        <div className={`flex flex-wrap items-center ${compacto ? 'gap-1' : 'gap-1.5 w-full min-w-[12rem]'}`}>
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
