"use client";
import { useFinanceiro } from '@/context/FinanceiroContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';

export default function EmpresasAprovadasPanel() {
    const { empresasFaturamento, setNovaEmpresaFaturamento, setModalEmpresaFaturamentoAberto, excluirEmpresaFaturamento } = useFinanceiro();

    return (
        <div className="bg-superficie border border-borda rounded overflow-hidden min-h-[300px]">
            {/* Ver components/ui/TabelaCartoes.jsx. */}
            <TabelaCartoes
                itens={empresasFaturamento}
                chave={emp => emp.id}
                vazio={<span className="text-corpo text-gray-400">Nenhuma empresa cadastrada.</span>}
                aoClicar={emp => { setNovaEmpresaFaturamento(emp); setModalEmpresaFaturamentoAberto(true); }}
                colunas={[
                    {
                        papel: 'titulo',
                        titulo: 'Empresa',
                        tdClassName: 'px-6 py-4 text-corpo font-semibold text-tinta',
                        celula: emp => emp.nome,
                    },
                    {
                        papel: 'subtitulo',
                        titulo: 'CNPJ/CPF',
                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave',
                        celula: emp => emp.cnpj,
                    },
                    {
                        papel: 'selo',
                        titulo: 'Status',
                        thClassName: 'px-6 py-4 text-center',
                        tdClassName: 'px-6 py-4 text-center',
                        celula: emp => (
                            <span className={`whitespace-nowrap px-2.5 py-1 text-mini font-semibold rounded border ${emp.status === 'Aprovado' ? 'bg-emerald-50 border-emerald-200 text-sucesso dark:bg-emerald-900/20 dark:border-emerald-800/50' : 'bg-red-50 border-red-200 text-perigo dark:bg-red-900/20 dark:border-red-800/50'}`}>
                                {emp.status}
                            </span>
                        ),
                    },
                    {
                        titulo: 'Observações',
                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave truncate max-w-[200px]',
                        celula: emp => <span title={emp.observacoes}>{emp.observacoes || '-'}</span>,
                    },
                    {
                        papel: 'acoes',
                        titulo: 'Ações',
                        thClassName: 'px-6 py-4 text-right',
                        tdClassName: 'px-6 py-4 text-corpo text-right',
                        celula: emp => (
                            <div className="flex justify-end">
                                <Tooltip label="Excluir">
                                    <button onClick={(e) => { e.stopPropagation(); excluirEmpresaFaturamento(emp.id); }} aria-label="Excluir" className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                        <Icon name="trash-2" className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
