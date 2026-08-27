"use client";
import { useState } from 'react';
import { useUi } from '@/context/UiContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarMoeda, formatarValorFinanceiro, formatarDataExibicao, centavosParaReais, obterDataAtual } from '@/lib/utils/formatters';

export default function ContasAPagarPanel({ mostrarContasPagas, dataInicio, dataFim }) {
    const { abrirContextMenu, avisar } = useUi();
    const { contasPagar, dadosCarregados, setNovaConta, setModalContaAberto, concluirConta, excluirConta, duplicarConta } = useFinanceiro();
    // Ordenação simples por clique no header: null = ordem original (mais recente cadastrada primeiro).
    const [ordenacao, setOrdenacao] = useState({ campo: null, direcao: 'asc' });

    const alternarOrdenacao = (campo) => {
        setOrdenacao(prev => prev.campo === campo && prev.direcao === 'asc' ? { campo, direcao: 'desc' } : { campo, direcao: 'asc' });
    };

    const contasFiltradas = contasPagar.filter(c => {
        if (!mostrarContasPagas && c.status === 'Pago') return false;
        if (dataInicio && (!c.vencimento || c.vencimento < dataInicio)) return false;
        if (dataFim && (!c.vencimento || c.vencimento > dataFim)) return false;
        return true;
    });

    const contasOrdenadas = !ordenacao.campo ? contasFiltradas : [...contasFiltradas].sort((a, b) => {
        let va = a[ordenacao.campo] || '';
        let vb = b[ordenacao.campo] || '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return ordenacao.direcao === 'asc' ? -1 : 1;
        if (va > vb) return ordenacao.direcao === 'asc' ? 1 : -1;
        return 0;
    });

    const SetaOrdenacao = ({ campo }) => {
        const ativo = ordenacao.campo === campo;
        return (
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); alternarOrdenacao(campo); }}
                className={`ml-1 p-0.5 rounded transition align-middle ${ativo ? 'text-brand' : 'text-tinta-suave hover:text-gray-700 dark:hover:text-gray-200'}`}
                aria-label="Ordenar"
            >
                <Icon name="chevron-down" className={`w-3.5 h-3.5 stroke-[3] transition-transform ${ativo && ordenacao.direcao === 'asc' ? 'rotate-180' : ''}`} />
            </button>
        );
    };

    const hojeStr = obterDataAtual();
    // Deriva "amanhã" a partir da própria string de hoje (em vez de um novo Date()),
    // pra garantir exatamente 1 dia de diferença mesmo com o fuso de obterDataAtual.
    const [anoHoje, mesHoje, diaHoje] = hojeStr.split('-').map(Number);
    const amanhaDate = new Date(anoHoje, mesHoje - 1, diaHoje + 1);
    const amanhaStr = amanhaDate.getFullYear() + '-' + String(amanhaDate.getMonth() + 1).padStart(2, '0') + '-' + String(amanhaDate.getDate()).padStart(2, '0');

    const obterStatusPagamento = (conta) => {
        if (conta.status === 'Pago') {
            return { label: 'Pago', cor: 'bg-emerald-50 border-emerald-200 text-sucesso dark:bg-emerald-900/20 dark:border-emerald-800/50' };
        }
        if (conta.vencimento && conta.vencimento < hojeStr) {
            return { label: 'Vencido', cor: 'bg-red-50 border-red-200 text-perigo dark:bg-red-900/20 dark:border-red-800/50' };
        }
        if (conta.vencimento === hojeStr) {
            return { label: 'Vence hoje', cor: 'bg-amber-50 border-amber-200 text-aviso dark:bg-amber-900/20 dark:border-amber-800/50' };
        }
        if (conta.vencimento === amanhaStr) {
            return { label: 'Vence amanhã', cor: 'bg-amber-50 border-amber-200 text-aviso dark:bg-amber-900/20 dark:border-amber-800/50' };
        }
        return { label: 'Aberto', cor: 'bg-realce border-borda-forte text-tinta-suave' };
    };

    const obterCorBordaVencimento = (conta) => {
        const { label } = obterStatusPagamento(conta);
        if (label === 'Vencido') return 'border-red-500 dark:border-red-500';
        if (label === 'Vence hoje' || label === 'Vence amanhã') return 'border-amber-500 dark:border-amber-400';
        if (label === 'Pago') return 'border-emerald-500 dark:border-emerald-500';
        return 'border-transparent';
    };

    const montarItensContexto = (conta) => [
        ...(conta.status !== 'Pago' ? [{ label: 'Marcar como Pago', icon: 'check-circle', onClick: () => concluirConta(conta.id) }] : []),
        { label: 'Duplicar', icon: 'layers', onClick: () => duplicarConta(conta) },
        { label: 'Copiar linha', icon: 'copy', onClick: () => {
            const linha = [formatarDataExibicao(conta.vencimento), conta.descricao, conta.categoria || 'Despesa', `R$ ${formatarValorFinanceiro(centavosParaReais(conta.valor))}`, conta.status].join('\t');
            navigator.clipboard.writeText(linha);
            avisar('Linha copiada!', 'sucesso');
        }},
        { label: 'Excluir', icon: 'trash-2', tom: 'perigo', divisorAntes: true, onClick: () => excluirConta(conta.id) },
    ];

    return (
        <div>
            <div className="bg-superficie border border-borda rounded overflow-hidden">
                {/* Ver components/ui/TabelaCartoes.jsx. No cartão o valor vira o
                    destaque e o vencimento sobe para o selo: numa conta a pagar são
                    esses dois que decidem se ela precisa de ação hoje. */}
                <TabelaCartoes
                    itens={contasOrdenadas}
                    chave={conta => conta.id}
                    carregando={!dadosCarregados}
                    vazio={<span className="text-corpo text-gray-400">Nenhuma conta a pagar registrada.</span>}
                    aoClicar={conta => { setNovaConta({...conta, valor: conta.valor ? formatarMoeda(Math.round(conta.valor).toString()) : ''}); setModalContaAberto(true); }}
                    aoContextMenu={(conta, e) => abrirContextMenu(e, montarItensContexto(conta))}
                    colunas={[
                        {
                            papel: 'selo',
                            titulo: <span className="inline-flex items-center">Vencimento<SetaOrdenacao campo="vencimento" /></span>,
                            rotuloCartao: 'Vencimento',
                            tdClassName: 'px-6 py-4 text-corpo text-tinta-suave',
                            celula: conta => (
                                <span className={`inline-block px-2 py-1 rounded border-2 text-mini ${obterCorBordaVencimento(conta)}`}>
                                    {formatarDataExibicao(conta.vencimento)}
                                </span>
                            ),
                        },
                        {
                            papel: 'titulo',
                            titulo: <span className="inline-flex items-center">Descrição<SetaOrdenacao campo="descricao" /></span>,
                            rotuloCartao: 'Descrição',
                            tdClassName: 'px-6 py-4 text-corpo font-medium text-gray-900 dark:text-gray-300',
                            celula: conta => (
                                <div className="flex items-center gap-1.5">
                                    {conta.descricao}
                                    {conta.recorrente && (
                                        conta.recorrente_total_parcelas ? (
                                            <Tooltip label={`Parcela ${conta.recorrente_parcela_atual || 1} de ${conta.recorrente_total_parcelas}`}>
                                                <span className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 text-white text-[9px] font-bold flex items-center justify-center shrink-0 leading-none">
                                                    {conta.recorrente_parcela_atual || 1}
                                                </span>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip label="Recorrente">
                                                <span className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center shrink-0">
                                                    <Icon name="repeat" className="w-2.5 h-2.5 text-white" />
                                                </span>
                                            </Tooltip>
                                        )
                                    )}
                                </div>
                            ),
                        },
                        {
                            titulo: <span className="inline-flex items-center">Categoria<SetaOrdenacao campo="categoria" /></span>,
                            rotuloCartao: 'Categoria',
                            tdClassName: 'px-6 py-4 text-corpo',
                            celula: conta => (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-mini font-semibold rounded-full whitespace-nowrap ${
                                    conta.categoria === 'Manutenção' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                    conta.categoria === 'Terceirização' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                    conta.categoria === 'Material' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                                    conta.categoria === 'Impostos' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                    'bg-realce text-tinta-suave'
                                }`}>
                                    <Icon name={conta.categoria === 'Manutenção' ? 'wrench' : conta.categoria === 'Terceirização' ? 'package' : conta.categoria === 'Material' ? 'shopping-bag' : conta.categoria === 'Impostos' ? 'file-text' : 'dollar-sign'} className="w-3 h-3" />
                                    {conta.categoria || 'Despesa'}
                                </span>
                            ),
                        },
                        {
                            papel: 'destaque',
                            titulo: 'Valor',
                            tdClassName: 'px-6 py-4 text-corpo font-medium text-sucesso',
                            celula: conta => <span className="text-sucesso">R$ {formatarValorFinanceiro(centavosParaReais(conta.valor))}</span>,
                        },
                        {
                            titulo: 'Status Pagamento',
                            rotuloCartao: 'Pagamento',
                            tdClassName: 'px-6 py-4 text-corpo',
                            celula: conta => (
                                <span className={`whitespace-nowrap px-2.5 py-1 text-mini font-semibold rounded border ${obterStatusPagamento(conta).cor}`}>
                                    {obterStatusPagamento(conta).label}
                                </span>
                            ),
                        },
                        {
                            papel: 'acoes',
                            titulo: 'Ações',
                            thClassName: 'px-6 py-4 text-right',
                            tdClassName: 'px-6 py-4 text-corpo text-right',
                            celula: conta => (
                                <div className="flex justify-end gap-2">
                                    {conta.status !== 'Pago' && (
                                        <Tooltip label="Marcar como Pago">
                                            <button onClick={(e) => { e.stopPropagation(); concluirConta(conta.id); }} aria-label="Marcar como Pago" className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded">
                                                <Icon name="check-circle" className="w-4 h-4" />
                                            </button>
                                        </Tooltip>
                                    )}
                                    <Tooltip label="Excluir Conta">
                                        <button onClick={(e) => { e.stopPropagation(); excluirConta(conta.id); }} aria-label="Excluir Conta" className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
