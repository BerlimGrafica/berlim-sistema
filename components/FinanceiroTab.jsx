"use client";
import { useSessao } from '@/context/SessaoContext';
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { CustomDateRangePicker } from '@/components/ui/DateRangePicker';
import ContasAPagarPanel from '@/components/financeiro/ContasAPagarPanel';
import ContasAReceberPanel from '@/components/financeiro/ContasAReceberPanel';
import BoletosPanel from '@/components/financeiro/BoletosPanel';
import EmpresasAprovadasPanel from '@/components/financeiro/EmpresasAprovadasPanel';
import NotasFiscaisPanel from '@/components/financeiro/NotasFiscaisPanel';
import { useState } from 'react';

export default function FinanceiroTab() {
    const { usuario } = useSessao();
    const { notasFiscais, filtroNotas, buscaNotaFiscal, setBuscaNotaFiscal, setPaginaNotasFiscais, setFiltroNotas } = useNotasFiscais();
    const { setAbaFinanceiro, abaFinanceiro, dataFiltroContasPagarInicio, setDataFiltroContasPagarInicio, dataFiltroContasPagarFim, setDataFiltroContasPagarFim, dataFiltroContasReceberInicio, setDataFiltroContasReceberInicio, dataFiltroContasReceberFim, setDataFiltroContasReceberFim, dataFiltroBoletosInicio, setDataFiltroBoletosInicio, dataFiltroBoletosFim, setDataFiltroBoletosFim, setNovaConta, setModalContaAberto, setModalEmpresaFaturamentoAberto } = useFinanceiro();
    const [mostrarContasPagas, setMostrarContasPagas] = useState(false);

    return (
        <>
            { (
                    <div className="bg-fundo border-b border-borda px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaFinanceiro('contas_pagar')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_pagar' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="file-text" className="w-4 h-4" /> Contas a Pagar</button>
                        <button onClick={() => setAbaFinanceiro('contas_receber')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_receber' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="dollar-sign" className="w-4 h-4" /> Contas a Receber</button>
                        <button onClick={() => setAbaFinanceiro('boletos')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'boletos' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="calendar" className="w-4 h-4" /> Boletos</button>
                        <button onClick={() => setAbaFinanceiro('empresas_aprovadas')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'empresas_aprovadas' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}><Icon name="check-circle" className="w-4 h-4" /> Faturamento</button>
                        <button onClick={() => setAbaFinanceiro('notas_fiscais')} className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'notas_fiscais' ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> Notas Fiscais
                            {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}
                        </button>
                    </div>
                )}
{ /* <main> sem max-w, igual à Produção: as 5 sub-abas são tabelas largas (Boletos
     tem 11 colunas, Notas Fiscais 8) e o teto de 1400px deixava menos espaço que a
     soma das larguras mínimas — a última coluna saía pra fora pelo overflow-x-auto. */
  (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                    <main className="flex-1 p-6 lg:p-10 mx-auto w-full flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">
                                    {abaFinanceiro === 'contas_pagar' ? 'Contas a Pagar' :
                                     abaFinanceiro === 'contas_receber' ? 'Contas a Receber' :
                                     abaFinanceiro === 'boletos' ? 'Boletos' :
                                     abaFinanceiro === 'empresas_aprovadas' ? 'Faturamento' :
                                     abaFinanceiro === 'notas_fiscais' ? `Notas Fiscais ${filtroNotas === 'pendentes' ? 'Pendentes' : 'Concluídas'}` : ''}
                                </h1>
                                <p className="text-corpo text-tinta-suave mt-1">
                                    {abaFinanceiro === 'contas_pagar' ? 'Gerencie as despesas da empresa.' :
                                     abaFinanceiro === 'contas_receber' ? 'Todas as OS\'s com saldo devedor.' :
                                     abaFinanceiro === 'boletos' ? 'Pedidos com pagamento via Boleto.' :
                                     abaFinanceiro === 'empresas_aprovadas' ? 'Gerencie as empresas com faturamento.' :
                                     abaFinanceiro === 'notas_fiscais' ? (filtroNotas === 'pendentes' ? 'Notas enviadas pelos clientes aguardando processamento.' : 'Histórico de notas já emitidas e processadas.') : ''}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                                {abaFinanceiro === 'contas_pagar' && (
                                    <>
                                        <div className="flex flex-col w-60">
                                            <span className="text-micro font-semibold text-tinta-suave uppercase mb-1">Período:</span>
                                            <CustomDateRangePicker startValue={dataFiltroContasPagarInicio} endValue={dataFiltroContasPagarFim} onChangeStart={setDataFiltroContasPagarInicio} onChangeEnd={setDataFiltroContasPagarFim} placeholder="Todo o período" className="bg-superficie border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition" />
                                        </div>
                                        <button onClick={() => setMostrarContasPagas(!mostrarContasPagas)} className={`h-[38px] px-4 text-corpo rounded-md font-semibold border transition flex items-center justify-center ${mostrarContasPagas ? 'bg-realce border-borda text-tinta-corpo' : 'bg-superficie border-borda text-tinta-suave hover:bg-gray-50'}`}>
                                            {mostrarContasPagas ? 'Ocultar Pagas' : 'Mostrar Histórico'}
                                        </button>
                                        <button onClick={() => { setNovaConta({ id: null, descricao: '', valor: '', vencimento: '', status: 'Pendente', recorrente: false, recorrente_total_parcelas: null, recorrente_parcela_atual: 1, categoria: 'Despesa', fornecedor_id: null }); setModalContaAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                            <Icon name="plus" className="w-4 h-4" /> Nova Conta
                                        </button>
                                    </>
                                )}

                                {abaFinanceiro === 'contas_receber' && (
                                    <div className="flex flex-col w-60">
                                        <span className="text-micro font-semibold text-tinta-suave uppercase mb-1">Período (data do pedido):</span>
                                        <CustomDateRangePicker startValue={dataFiltroContasReceberInicio} endValue={dataFiltroContasReceberFim} onChangeStart={setDataFiltroContasReceberInicio} onChangeEnd={setDataFiltroContasReceberFim} placeholder="Todo o período" className="bg-superficie border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition" />
                                    </div>
                                )}

                                {abaFinanceiro === 'boletos' && (
                                    <div className="flex flex-col w-60">
                                        <span className="text-micro font-semibold text-tinta-suave uppercase mb-1">Período (vencimento):</span>
                                        <CustomDateRangePicker startValue={dataFiltroBoletosInicio} endValue={dataFiltroBoletosFim} onChangeStart={setDataFiltroBoletosInicio} onChangeEnd={setDataFiltroBoletosFim} placeholder="Todo o período" className="bg-superficie border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition" />
                                    </div>
                                )}

                                {abaFinanceiro === 'empresas_aprovadas' && (
                                    <button onClick={() => setModalEmpresaFaturamentoAberto(true)} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                        <Icon name="plus" className="w-4 h-4" /> Adicionar Empresa
                                    </button>
                                )}

                                {abaFinanceiro === 'notas_fiscais' && (
                                    <>
                                        <div className="relative w-full lg:w-64">
                                            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nome, razão ou CNPJ..."
                                                value={buscaNotaFiscal}
                                                onChange={(e) => { setBuscaNotaFiscal(e.target.value); setPaginaNotasFiscais(1); }}
                                                className="w-full pl-9 pr-9 py-1.5 h-[38px] text-corpo border border-borda bg-superficie rounded-md focus:outline-none focus:ring-2 focus:ring-brand dark:text-white transition"
                                            />
                                            {buscaNotaFiscal && (
                                                <Tooltip label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                    <button type="button" onClick={() => { setBuscaNotaFiscal(''); setPaginaNotasFiscais(1); }} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                                                </Tooltip>
                                            )}
                                        </div>
                                        <div className="flex h-[38px] bg-gray-100/50 dark:bg-darkHover/50 p-1 rounded-lg border border-borda w-full lg:w-auto mt-3 lg:mt-0">
                                            <button onClick={() => { setFiltroNotas('pendentes'); setPaginaNotasFiscais(1); }} className={`h-full px-4 text-compacto font-semibold rounded-md transition flex items-center gap-2 ${filtroNotas === 'pendentes' ? 'bg-superficie text-brand shadow-sm border border-borda' : 'text-tinta-suave hover:text-tinta'}`}>Pendentes {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}</button>
                                            <button onClick={() => { setFiltroNotas('concluidas'); setPaginaNotasFiscais(1); }} className={`h-full px-4 text-compacto font-semibold rounded-md transition flex items-center gap-2 ${filtroNotas === 'concluidas' ? 'bg-superficie text-brand shadow-sm border border-borda' : 'text-tinta-suave hover:text-tinta'}`}>Concluídas</button>
                                        </div>
                                        <div className="flex rounded-md shadow-sm">
                                            <button onClick={() => window.open('/solicitar-nota', '_blank')} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-l-md font-semibold transition flex items-center gap-2 border border-brand border-r-0">
                                                <Icon name="external-link" className="w-4 h-4" /> Formulário
                                            </button>
                                            <Tooltip label="Copiar Link">
                                                <button onClick={() => {
                                                    const link = window.location.origin + '/solicitar-nota';
                                                    navigator.clipboard.writeText(link);
                                                }} aria-label="Copiar Link" className="bg-brand hover:bg-brandHover text-white h-[38px] px-3 rounded-r-md border-l border-white/20 transition flex items-center justify-center">
                                                    <Icon name="copy" className="w-3.5 h-3.5" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div key={abaFinanceiro} className="animate-fade-screen">
                            {abaFinanceiro === 'contas_pagar' && <ContasAPagarPanel mostrarContasPagas={mostrarContasPagas} dataInicio={dataFiltroContasPagarInicio} dataFim={dataFiltroContasPagarFim} />}
                            {abaFinanceiro === 'contas_receber' && <ContasAReceberPanel dataInicio={dataFiltroContasReceberInicio} dataFim={dataFiltroContasReceberFim} />}
                            {abaFinanceiro === 'boletos' && <BoletosPanel dataInicio={dataFiltroBoletosInicio} dataFim={dataFiltroBoletosFim} />}
                            {abaFinanceiro === 'empresas_aprovadas' && <EmpresasAprovadasPanel />}
                            {abaFinanceiro === 'notas_fiscais' && <NotasFiscaisPanel />}
                        </div>
                    </main>
                )}

        </>
    );
}
