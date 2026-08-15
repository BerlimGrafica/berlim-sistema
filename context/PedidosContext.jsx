"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: dados de pedidos/OS (lista em memória, histórico
// paginado, produção, vendas derivadas e impressão).
// O estado do carrinho/modal da OS fica em OsModalContext — separado de
// propósito: digitar no modal não deve re-renderizar as tabelas de pedidos.
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const PedidosContext = createContext(null);
export const usePedidos = () => useContext(PedidosContext);
