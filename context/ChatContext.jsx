"use client";
import { createContext, useContext } from 'react';

// Fatia do AppContext: chat da equipe. O hook chama-se useChatEquipe para não
// colidir com hooks/useChat.js (o hook interno que o AppProvider usa).
// O valor é montado pelo AppProvider (context/AppContext.jsx).
export const ChatContext = createContext(null);
export const useChatEquipe = () => useContext(ChatContext);
