"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: sessão/autenticação, permissões e dark mode.
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const SessaoContext = createContext(null);
export const useSessao = () => useContext(SessaoContext);
