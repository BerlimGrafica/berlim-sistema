"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: comunicação interna — requisições de material,
// tarefas internas e links de pagamento (listas + modais).
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const ComunicacaoContext = createContext(null);
export const useComunicacao = () => useContext(ComunicacaoContext);
