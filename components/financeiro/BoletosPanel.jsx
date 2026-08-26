"use client";
import { useFinanceiro } from '@/context/FinanceiroContext';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { useColunasBoleto } from '@/components/financeiro/colunasBoleto';

export default function BoletosPanel({ dataInicio, dataFim }) {
    const { pedidosBoleto, carregandoBoletos } = useFinanceiro();
    const { colunas, aoClicar, aoContextMenu } = useColunasBoleto();

    const pedidosFiltrados = pedidosBoleto.filter(p => {
        if (dataInicio && (!p.prazo_pagamento || p.prazo_pagamento < dataInicio)) return false;
        if (dataFim && (!p.prazo_pagamento || p.prazo_pagamento > dataFim)) return false;
        return true;
    });

    return (
        <div className="bg-superficie border border-borda rounded overflow-hidden min-h-[300px]">
            {/* A definição das colunas mora em colunasBoleto.jsx porque quase toda
                célula aqui é campo editável, com estado e gravação próprios — deixá-la
                neste arquivo misturaria a listagem com o formulário. */}
            <TabelaCartoes
                itens={pedidosFiltrados}
                chave={p => p.id}
                colunas={colunas}
                aoClicar={aoClicar}
                aoContextMenu={aoContextMenu}
                carregando={carregandoBoletos && pedidosFiltrados.length === 0}
                vazio={<span className="text-corpo text-gray-400">Nenhum pedido com boleto encontrado.</span>}
            />
        </div>
    );
}
