"use client";
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { useColunasNotaFiscal } from '@/components/notas/colunasNotaFiscal';

export default function NotasFiscaisPanel() {
    const { notasFiscaisPaginadas, dadosCarregados, totalPaginasNotasFiscais, paginaNotasFiscais, setPaginaNotasFiscais } = useNotasFiscais();
    const { colunas, aoClicar, aoContextMenu } = useColunasNotaFiscal();

    return (
        <div className="bg-superficie border border-borda rounded overflow-hidden">
            {/* As colunas vivem em components/notas/colunasNotaFiscal.jsx: esta tela e
                a rota /notas-fiscais mostram exatamente a mesma listagem. */}
            <TabelaCartoes
                itens={notasFiscaisPaginadas}
                chave={n => n.id}
                colunas={colunas}
                aoClicar={aoClicar}
                aoContextMenu={aoContextMenu}
                carregando={!dadosCarregados && notasFiscaisPaginadas.length === 0}
                vazio={<span className="text-corpo text-gray-400">Nenhuma nota fiscal encontrada.</span>}
            />
            {totalPaginasNotasFiscais > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-borda">
                    <button onClick={() => setPaginaNotasFiscais(Math.max(1, paginaNotasFiscais - 1))} disabled={paginaNotasFiscais === 1} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Anterior</button>
                    <span className="text-corpo font-semibold dark:text-white">Página {paginaNotasFiscais} de {totalPaginasNotasFiscais}</span>
                    <button onClick={() => setPaginaNotasFiscais(Math.min(totalPaginasNotasFiscais, paginaNotasFiscais + 1))} disabled={paginaNotasFiscais === totalPaginasNotasFiscais} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Próxima</button>
                </div>
            )}
        </div>
    );
}
