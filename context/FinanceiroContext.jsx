"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: financeiro — contas a pagar, contas a receber
// (saldo devedor), boletos, empresas de faturamento e filtros de período.
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const FinanceiroContext = createContext(null);
export const useFinanceiro = () => useContext(FinanceiroContext);
