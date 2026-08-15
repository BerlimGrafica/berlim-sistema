"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: notas fiscais (lista, filtros, paginação e modal).
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const NotasFiscaisContext = createContext(null);
export const useNotasFiscais = () => useContext(NotasFiscaisContext);
