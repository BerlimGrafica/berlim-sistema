"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: estado do modal de OS e do carrinho compartilhado com
// os modais de orçamento (itens, pagamentos, buscas de cliente/produto).
// É a fatia que muda a cada tecla digitada — só quem renderiza esses modais
// (ou prepara o carrinho deles) deve assinar.
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const OsModalContext = createContext(null);
export const useOsModal = () => useContext(OsModalContext);
