"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Chat da equipe (canal único). Recebe `usuario`/`usuariosSistema` do useAuth
// para resolver o nome de quem enviou cada mensagem e marcar mensagens próprias.
export function useChat(usuario, usuariosSistema, avisar) {
    const [chatAberto, setChatAberto] = useState(false);
    const [chatMensagens, setChatMensagens] = useState([]);
    const [enviandoChat, setEnviandoChat] = useState(false);

    // "Até onde eu já li", e não um contador incrementado a cada evento.
    //
    // O contador antigo só subia dentro do tratador de tempo real. Se o canal
    // caísse — e ele cai: oscilação de rede, máquina suspendendo, o Realtime do
    // Supabase reiniciando —, a mensagem chegava depois pela recarga da
    // reconexão, aparecia na lista e a bolinha vermelha NUNCA acendia, porque o
    // evento que a acendia já tinha passado. Também zerava a cada F5, perdendo
    // em silêncio a indicação de conversa não lida.
    //
    // Derivando de uma marca de leitura, a contagem fica certa sempre que a
    // lista estiver certa, tenha o evento sido visto ao vivo ou não.
    const chaveLeitura = usuario ? 'chat_lido_ate_' + usuario.id : null;
    const [lidoAte, setLidoAte] = useState(null);
    const leituraHidratada = useRef(false);

    useEffect(() => {
        leituraHidratada.current = false;
        if (!chaveLeitura) { setLidoAte(null); return; }
        let salvo = null;
        try { salvo = localStorage.getItem(chaveLeitura); } catch { /* indisponível */ }
        setLidoAte(salvo);
        leituraHidratada.current = true;
    }, [chaveLeitura]);

    const marcarLido = (ate) => {
        if (!ate || !chaveLeitura) return;
        setLidoAte(prev => (prev && prev >= ate ? prev : ate));
        try { localStorage.setItem(chaveLeitura, ate); } catch { /* indisponível */ }
    };

    // A mais recente por data, e não a última da lista: a ordem depende de quem
    // inseriu (recarga, eco do próprio envio, evento de tempo real).
    const maisRecente = useMemo(
        () => chatMensagens.reduce((topo, m) => (!topo || m.criado_em > topo ? m.criado_em : topo), null),
        [chatMensagens],
    );

    // Primeira vez deste usuário neste navegador: o histórico que já existe não
    // conta como não lido — senão o primeiro acesso nasceria com 200 na bolinha.
    useEffect(() => {
        if (!leituraHidratada.current || lidoAte !== null) return;
        if (maisRecente) marcarLido(maisRecente);
    }, [maisRecente, lidoAte, chaveLeitura]);

    // Com o painel aberto, tudo que chega já está sendo lido.
    useEffect(() => {
        if (chatAberto && maisRecente) marcarLido(maisRecente);
    }, [chatAberto, maisRecente]);

    const chatNaoLidas = useMemo(() => {
        if (!lidoAte) return 0;
        return chatMensagens.filter(m => m.usuario_id !== usuario?.id && m.criado_em > lidoAte).length;
    }, [chatMensagens, lidoAte, usuario?.id]);
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
        // A marca de leitura avança no efeito acima, que também cobre as
        // mensagens que chegarem enquanto o painel estiver aberto.
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
        chatNaoLidas,
        enviandoChat,
        carregarChat, nomeDoUsuarioChat, abrirChat, enviarMensagemChat, excluirMensagemChat,
    };
}
