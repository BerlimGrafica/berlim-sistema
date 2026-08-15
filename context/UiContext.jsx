"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: toasts, diálogo de confirmação, menu de contexto,
// alertas/notificações e estados soltos de UI (calculadora ativa).
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const UiContext = createContext(null);
export const useUi = () => useContext(UiContext);
