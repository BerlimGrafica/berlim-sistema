"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Chat da equipe (canal único). Recebe `usuario`/`usuariosSistema` do useAuth
// para resolver o nome de quem enviou cada mensagem e marcar mensagens próprias.
export function useChat(usuario, usuariosSistema, avisar) {
    const [chatAberto, setChatAberto] = useState(false);
    const [chatMensagens, setChatMensagens] = useState([]);
    const [chatNaoLidas, setChatNaoLidas] = useState(0);
    const [enviandoChat, setEnviandoChat] = useState(false);
    const chatAbertoRef = useRef(false);
    useEffect(() => { chatAbertoRef.current = chatAberto; }, [chatAberto]);
    // Desce (descending) e inverte no cliente. Com `ascending: true`, o limite
    // recortava as 200 mensagens MAIS ANTIGAS da tabela: passado esse total, todo
    // recarregamento — F5, volta de aba, reconexão do tempo real — trocava a
    // conversa de hoje pelo começo do histórico, e as mensagens novas só voltavam
    // a aparecer uma a uma pelo tempo real.
    async function carregarChat() {
        const { data, error } = await supabase
            .from('chat_mensagens') .select('*') .order('criado_em', { ascending: false })
            .limit(200);
        if (!error && data) setChatMensagens(data.slice().reverse());
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
        // `.select().single()` devolve a linha gravada, e ela entra na lista aqui
        // mesmo. Antes a própria mensagem só aparecia quando o tempo real
        // devolvia o eco do INSERT — e o canal cai (o próprio AppContext registra
        // CHANNEL_ERROR/TIMED_OUT no console quando isso acontece). Nesse estado,
        // enviar limpava o campo e não mostrava nada: parecia que o envio falhou,
        // embora a mensagem estivesse gravada. O guarda por id impede a duplicata
        // quando o eco chega — e o tratador de tempo real já tem o mesmo guarda.
        const { data, error } = await supabase
            .from('chat_mensagens') .insert([{ conteudo: texto, usuario_id: usuario.id }])
            .select() .single();
        setEnviandoChat(false);
        if (error) { avisar('Erro ao enviar mensagem: ' + error.message, 'erro'); return; }
        if (data) setChatMensagens(prev => (prev.some(m => m.id === data.id) ? prev : [...prev, data]));
    }

    async function excluirMensagemChat(id) {
        const { error } = await supabase.from('chat_mensagens').delete().eq('id', id);
        if (error) avisar('Erro ao apagar mensagem: ' + error.message, 'erro');
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
