"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: catálogo de produtos, fornecedores e usuários do
// sistema (listas + modais de cadastro). Clientes têm fatia própria
// (ClientesContext) por mudarem com muito mais frequência.
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const CadastrosContext = createContext(null);
export const useCadastros = () => useContext(CadastrosContext);
