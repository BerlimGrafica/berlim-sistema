"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno, CustomDatePicker, InlineDropdown, MultiSelectDropdown, desconstruirTextoServico, obterResumoServicos, ItensChecklist, StackedCards, CalculadoraBanner, CalculadoraAdesivo, CalculadoraCasamento, CalculadorasAba } from '@/lib/utils';

function CalculadorasAba({ calculadoraAtiva, produtos }) {
    return (
        <div className="flex-1 p-6 lg:p-10 mx-auto w-full max-w-3xl fade-in flex flex-col h-[calc(100vh-112px)] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-semibold dark:text-white tracking-tight">Calculadoras</h1>
                    <p className="text-[13px] text-gray-500 dark:text-[#888888] mt-1">Ferramentas para auxiliar em orÃ§amentos rÃ¡pidos.</p>
                </div>
            </div>

            <div className="w-full">
                {calculadoraAtiva === 'banner' && <CalculadoraBanner />}
                {calculadoraAtiva === 'adesivo' && <CalculadoraAdesivo produtos={produtos} />}
                {calculadoraAtiva === 'casamento' && <CalculadoraCasamento />}
            </div>
        </div>
    );
}

// ================= APLICAÃ‡ÃƒO PRINCIPAL =================

export default CalculadorasAba;
