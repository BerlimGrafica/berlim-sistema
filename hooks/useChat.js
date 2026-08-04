"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Chat da equipe (canal único). Recebe `usuario`/`usuariosSistema` do useAuth
// para resolver o nome de quem enviou cada mensagem e marcar mensagens próprias.
export function useChat(usuario, usuariosSistema) {
    const [chatAberto, setChatAberto] = useState(false);
    const [chatMensagens, setChatMensagens] = useState([]);
    const [chatNaoLidas, setChatNaoLidas] = useState(0);
    const [enviandoChat, setEnviandoChat] = useState(false);
    const chatAbertoRef = useRef(false);
    useEffect(() => { chatAbertoRef.current = chatAberto; }, [chatAberto]);
    async function carregarChat() {
        const { data, error } = await supabase
            .from('chat_mensagens')
            .select('*')
            .order('criado_em', { ascending: true })
            .limit(200);
        if (!error && data) setChatMensagens(data);
    }

    function nomeDoUsuarioChat(usuarioId) {
        if (usuarioId === usuario?.id) return usuario?.nome || 'Você';
        return usuariosSistema.find(u => u.id === usuarioId)?.nome || 'Usuário';
    }

    function abrirChat() {
        setChatAberto(true);
        setChatNaoLidas(0);
    }

    async function enviarMensagemChat(conteudo) {
        const texto = (conteudo || '').trim();
        if (!texto || !usuario) return;
        setEnviandoChat(true);
        const { error } = await supabase.from('chat_mensagens').insert([{ conteudo: texto, usuario_id: usuario.id }]);
        setEnviandoChat(false);
        if (error) alert('Erro ao enviar mensagem: ' + error.message);
    }

    async function excluirMensagemChat(id) {
        const { error } = await supabase.from('chat_mensagens').delete().eq('id', id);
        if (error) alert('Erro ao apagar mensagem: ' + error.message);
        else setChatMensagens(prev => prev.filter(m => m.id !== id));
    }

    return {
        chatAberto, setChatAberto,
        chatMensagens, setChatMensagens,
        chatNaoLidas, setChatNaoLidas,
        enviandoChat,
        chatAbertoRef,
        carregarChat, nomeDoUsuarioChat, abrirChat, enviarMensagemChat, excluirMensagemChat,
    };
}
