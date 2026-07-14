"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';


export default function FinanceiroTab() {
    const { setAbaFinanceiro, abaFinanceiro, notasFiscais } = useAppContext();

    return (
        <>
            abaAtual === 'financeiro' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        <button onClick={() => setAbaFinanceiro('geral')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'geral' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="pie-chart" className="w-4 h-4" /> VisÃ£o Geral</button>
                        <button onClick={() => setAbaFinanceiro('vendas_produto')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'vendas_produto' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="tag" className="w-4 h-4" /> Vendas por Produto</button>
                        <button onClick={() => setAbaFinanceiro('contas_pagar')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_pagar' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="file-text" className="w-4 h-4" /> Contas a Pagar</button>
                        <button onClick={() => setAbaFinanceiro('contas_receber')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'contas_receber' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="dollar-sign" className="w-4 h-4" /> Contas a Receber</button>
                        <button onClick={() => setAbaFinanceiro('empresas_aprovadas')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'empresas_aprovadas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}><Icon name="check-circle" className="w-4 h-4" /> Faturamento Aprovado</button>
                        <button onClick={() => setAbaFinanceiro('notas_fiscais')} className={`py-3 text-[13px] font-semibold border-b-[3px] transition whitespace-nowrap flex items-center gap-2 ${abaFinanceiro === 'notas_fiscais' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-[#888888] dark:hover:text-white'}`}>
                            <Icon name="file-text" className="w-4 h-4" /> Notas Fiscais
                            {notasFiscais.some(n => !n.concluido) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>}
                        </button>
                    </div>
                )
abaAtual === 'financeiro' && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro')

        </>
    );
}
