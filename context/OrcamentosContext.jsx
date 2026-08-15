"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: orçamentos formalizados e pré-prontos (listas, abas e
// modais próprios). O carrinho que os modais de orçamento editam fica em
// OsModalContext (é compartilhado com o modal de OS).
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const OrcamentosContext = createContext(null);
export const useOrcamentos = () => useContext(OrcamentosContext);
