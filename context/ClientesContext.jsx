"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: clientes — resultado do autocomplete dos modais,
// listagem paginada de Cadastros, clientes problemáticos e modal de cliente.
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const ClientesContext = createContext(null);
export const useClientes = () => useContext(ClientesContext);
