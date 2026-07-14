"use client";
import React from 'react';
import { AppProvider, useAppContext } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import DashboardTab from '@/components/DashboardTab';
import ProducaoTab from '@/components/ProducaoTab';
import BaixaTab from '@/components/BaixaTab';
import CalculadorasTab from '@/components/CalculadorasTab';
import FinanceiroTab from '@/components/FinanceiroTab';
import OrcamentosTab from '@/components/OrcamentosTab';
import CadastrosTab from '@/components/CadastrosTab';
import Notas_fiscaisTab from '@/components/Notas_fiscaisTab';
import Modals from '@/components/Modals';

function MainContent() {
    const { abaAtual } = useAppContext();

    return (
        <div className="flex flex-col min-h-screen no-print bg-white dark:bg-darkBg">
            <Sidebar />
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-darkBg p-6 relative">
                {abaAtual === 'dashboard' && <DashboardTab />}
                {abaAtual === 'producao' && <ProducaoTab />}
                {abaAtual === 'baixa' && <BaixaTab />}
                {abaAtual === 'calculadoras' && <CalculadorasTab />}
                {abaAtual === 'financeiro' && <FinanceiroTab />}
                {abaAtual === 'orcamentos' && <OrcamentosTab />}
                {abaAtual === 'cadastros' && <CadastrosTab />}
                {abaAtual === 'notas_fiscais' && <Notas_fiscaisTab />}
            </div>
            <Modals />
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <MainContent />
        </AppProvider>
    );
}
