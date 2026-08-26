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
import { SubAbas } from '@/components/ui/SubAbas';
import { BarraAcoes } from '@/components/ui/BarraAcoes';

export default function FinanceiroTab() {
    const { usuario } = useSessao();
    const { notasFiscais, filtroNotas, buscaNotaFiscal, setBuscaNotaFiscal, setPaginaNotasFiscais, setFiltroNotas } = useNotasFiscais();
    const { setAbaFinanceiro, abaFinanceiro, dataFiltroContasPagarInicio, setDataFiltroContasPagarInicio, dataFiltroContasPagarFim, setDataFiltroContasPagarFim, dataFiltroContasReceberInicio, setDataFiltroContasReceberInicio, dataFiltroContasReceberFim, setDataFiltroContasReceberFim, dataFiltroBoletosInicio, setDataFiltroBoletosInicio, dataFiltroBoletosFim, setDataFiltroBoletosFim, setNovaConta, setModalContaAberto, setModalEmpresaFaturamentoAberto } = useFinanceiro();
    const [mostrarContasPagas, setMostrarContasPagas] = useState(false);

    return (
        <>
            { (
                    <SubAbas
                        valor={abaFinanceiro}
                        aoMudar={setAbaFinanceiro}
                        abas={[
                            { id: 'contas_pagar',       rotulo: 'Contas a Pagar',   icone: 'file-text' },
                            { id: 'contas_receber',     rotulo: 'Contas a Receber', icone: 'dollar-sign' },
                            { id: 'boletos',            rotulo: 'Boletos',          icone: 'calendar' },
                            { id: 'empresas_aprovadas', rotulo: 'Faturamento',      icone: 'check-circle' },
                            { id: 'notas_fiscais',      rotulo: 'Notas Fiscais',    icone: 'file-text', sinal: notasFiscais.some(n => !n.concluido) },
                        ]}
                    />
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

                            <div className="hidden lg:flex flex-wrap items-end gap-3 w-full lg:w-auto">
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

            {/* Cada sub-aba do Financeiro tem controles próprios: três filtram por
                período, duas criam registro e uma busca. A barra monta as ações da
                aba ativa, então o rodapé nunca mostra um filtro que não se aplica. */}
            <BarraAcoes
                acoes={[
                    abaFinanceiro === 'contas_pagar' && {
                        id: 'periodo', icone: 'calendar', rotulo: 'Período',
                        ativo: !!(dataFiltroContasPagarInicio || dataFiltroContasPagarFim),
                        conteudo: (
                            <CustomDateRangePicker
                                startValue={dataFiltroContasPagarInicio} endValue={dataFiltroContasPagarFim}
                                onChangeStart={setDataFiltroContasPagarInicio} onChangeEnd={setDataFiltroContasPagarFim}
                                placeholder="Todo o período"
                                className="w-full bg-elevado border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition"
                            />
                        ),
                    },
                    abaFinanceiro === 'contas_pagar' && {
                        id: 'pagas', icone: 'list', rotulo: 'Pagas',
                        ativo: mostrarContasPagas,
                        aoClicar: () => setMostrarContasPagas(v => !v),
                    },
                    abaFinanceiro === 'contas_pagar' && {
                        id: 'nova', icone: 'plus', rotulo: 'Nova Conta', destaque: true,
                        aoClicar: () => { setNovaConta({ id: null, descricao: '', valor: '', vencimento: '', status: 'Pendente', recorrente: false, recorrente_total_parcelas: null, recorrente_parcela_atual: 1, categoria: 'Despesa', fornecedor_id: null }); setModalContaAberto(true); },
                    },
                    abaFinanceiro === 'contas_receber' && {
                        id: 'periodo', icone: 'calendar', rotulo: 'Período',
                        ativo: !!(dataFiltroContasReceberInicio || dataFiltroContasReceberFim),
                        conteudo: (
                            <CustomDateRangePicker
                                startValue={dataFiltroContasReceberInicio} endValue={dataFiltroContasReceberFim}
                                onChangeStart={setDataFiltroContasReceberInicio} onChangeEnd={setDataFiltroContasReceberFim}
                                placeholder="Todo o período"
                                className="w-full bg-elevado border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition"
                            />
                        ),
                    },
                    abaFinanceiro === 'boletos' && {
                        id: 'periodo', icone: 'calendar', rotulo: 'Vencimento',
                        ativo: !!(dataFiltroBoletosInicio || dataFiltroBoletosFim),
                        conteudo: (
                            <CustomDateRangePicker
                                startValue={dataFiltroBoletosInicio} endValue={dataFiltroBoletosFim}
                                onChangeStart={setDataFiltroBoletosInicio} onChangeEnd={setDataFiltroBoletosFim}
                                placeholder="Todo o período"
                                className="w-full bg-elevado border border-borda rounded-md px-3 py-2 text-corpo outline-none hover:border-brand transition"
                            />
                        ),
                    },
                    abaFinanceiro === 'empresas_aprovadas' && {
                        id: 'empresa', icone: 'plus', rotulo: 'Adicionar Empresa', destaque: true,
                        aoClicar: () => setModalEmpresaFaturamentoAberto(true),
                    },
                    abaFinanceiro === 'notas_fiscais' && {
                        id: 'buscar', icone: 'search', rotulo: 'Buscar',
                        ativo: !!buscaNotaFiscal,
                        conteudo: (
                            <div className="relative">
                                <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Nome, razão ou CNPJ..."
                                    value={buscaNotaFiscal}
                                    onChange={(e) => { setBuscaNotaFiscal(e.target.value); setPaginaNotasFiscais(1); }}
                                    className="w-full pl-9 pr-9 py-2 text-corpo border border-borda bg-elevado rounded-md focus:outline-none focus:border-brand dark:text-white transition"
                                />
                                {buscaNotaFiscal && (
                                    <button type="button" onClick={() => { setBuscaNotaFiscal(''); setPaginaNotasFiscais(1); }} aria-label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition">
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ),
                    },
                    abaFinanceiro === 'notas_fiscais' && {
                        id: 'situacao', icone: 'check-square',
                        rotulo: filtroNotas === 'pendentes' ? 'Pendentes' : 'Concluídas',
                        ativo: filtroNotas === 'pendentes' && notasFiscais.some(n => !n.concluido),
                        aoClicar: () => { setFiltroNotas(filtroNotas === 'pendentes' ? 'concluidas' : 'pendentes'); setPaginaNotasFiscais(1); },
                    },
                    abaFinanceiro === 'notas_fiscais' && {
                        id: 'formulario', icone: 'external-link', rotulo: 'Formulário', destaque: true,
                        aoClicar: () => window.open('/solicitar-nota', '_blank'),
                    },
                ].filter(Boolean)}
            />
        </>
    );
}
