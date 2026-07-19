"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';

const PALETA_AVATAR = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-teal-500', 'bg-sky-500', 'bg-indigo-500', 'bg-fuchsia-500'];

function corAvatar(nome) {
    const str = nome || '?';
    let soma = 0;
    for (let i = 0; i < str.length; i++) soma += str.charCodeAt(i);
    return PALETA_AVATAR[soma % PALETA_AVATAR.length];
}

function iniciais(nome) {
    if (!nome) return '?';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatarHora(iso) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel() {
    const {
        chatAberto, setChatAberto,
        chatMensagens, enviandoChat,
        usuario, usuariosSistema, isAdmin,
        nomeDoUsuarioChat, enviarMensagemChat, excluirMensagemChat,
    } = useAppContext();

    const [texto, setTexto] = useState('');
    const listRef = useRef(null);

    useEffect(() => {
        if (chatAberto && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [chatAberto, chatMensagens]);

    useEffect(() => {
        if (!chatAberto) return;
        const handleEsc = (e) => { if (e.key === 'Escape') setChatAberto(false); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [chatAberto, setChatAberto]);

    function handleEnviar(e) {
        e.preventDefault();
        if (!texto.trim() || enviandoChat) return;
        enviarMensagemChat(texto);
        setTexto('');
    }

    const participantes = usuariosSistema.slice(0, 4);
    const extras = Math.max(0, usuariosSistema.length - participantes.length);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${chatAberto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setChatAberto(false)}
            />
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-darkCard border-l border-gray-200 dark:border-darkBorder shadow-2xl z-50 flex flex-col transition-transform duration-300 ${chatAberto ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Cabeçalho */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-darkBorder shrink-0">
                    <h2 className="font-bold text-gray-900 dark:text-white">Chat</h2>
                    <button onClick={() => setChatAberto(false)} aria-label="Fechar chat" className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-darkHover dark:hover:text-white transition">
                        <Icon name="x" className="w-4 h-4" />
                    </button>
                </div>

                {/* Canal + participantes */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-darkBorder shrink-0">
                    <div>
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Equipe Berlim</p>
                        <p className="text-[11px] text-gray-400">{usuariosSistema.length} pessoa{usuariosSistema.length === 1 ? '' : 's'}</p>
                    </div>
                    <div className="flex items-center -space-x-2">
                        {participantes.map(p => (
                            <div key={p.id} title={p.nome} className={`w-7 h-7 rounded-full ${corAvatar(p.nome)} border-2 border-white dark:border-darkCard flex items-center justify-center text-[10px] font-bold text-white`}>
                                {iniciais(p.nome)}
                            </div>
                        ))}
                        {extras > 0 && (
                            <div className="w-7 h-7 rounded-full bg-gray-500 border-2 border-white dark:border-darkCard flex items-center justify-center text-[10px] font-bold text-white">
                                +{extras}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mensagens */}
                <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3 bg-gray-50 dark:bg-darkBg">
                    {chatMensagens.length === 0 ? (
                        <p className="text-center text-[12px] text-gray-400 mt-6">Nenhuma mensagem ainda. Diga oi!</p>
                    ) : (
                        chatMensagens.map((msg, idx) => {
                            const minha = msg.usuario_id === usuario?.id;
                            const anterior = chatMensagens[idx - 1];
                            const mostrarCabecalho = !anterior || anterior.usuario_id !== msg.usuario_id;
                            const nome = nomeDoUsuarioChat(msg.usuario_id);

                            return (
                                <div key={msg.id} className={`flex items-end gap-2 group ${minha ? 'flex-row-reverse' : ''}`}>
                                    {mostrarCabecalho ? (
                                        <div title={nome} className={`w-7 h-7 rounded-full shrink-0 ${corAvatar(nome)} flex items-center justify-center text-[10px] font-bold text-white`}>
                                            {iniciais(nome)}
                                        </div>
                                    ) : (
                                        <div className="w-7 shrink-0" />
                                    )}
                                    <div className={`flex flex-col max-w-[75%] ${minha ? 'items-end' : 'items-start'}`}>
                                        {mostrarCabecalho && !minha && (
                                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 px-1">{nome}</span>
                                        )}
                                        <div className={`relative px-3.5 py-2 text-[13px] leading-snug break-words rounded-2xl ${minha ? 'bg-brand text-white rounded-br-sm' : 'bg-white dark:bg-darkElevated text-gray-800 dark:text-[#EDEDED] rounded-bl-sm border border-gray-100 dark:border-darkBorder'}`}>
                                            {msg.conteudo}
                                            {(minha || isAdmin) && (
                                                <button
                                                    onClick={() => excluirMensagemChat(msg.id)}
                                                    aria-label="Apagar mensagem"
                                                    className={`absolute top-1/2 -translate-y-1/2 ${minha ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-1`}
                                                >
                                                    <Icon name="x" className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">{formatarHora(msg.criado_em)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Envio */}
                <form onSubmit={handleEnviar} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-darkBorder shrink-0">
                    <div className={`w-8 h-8 rounded-full shrink-0 ${corAvatar(usuario?.nome)} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {iniciais(usuario?.nome)}
                    </div>
                    <input
                        type="text"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="Escreva uma mensagem..."
                        className="flex-1 bg-gray-100 dark:bg-darkElevated text-[13px] text-gray-900 dark:text-white placeholder-gray-400 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-brand/40"
                    />
                    <button
                        type="submit"
                        disabled={!texto.trim() || enviandoChat}
                        aria-label="Enviar mensagem"
                        className="p-2 rounded-full bg-brand hover:bg-brandHover text-white transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        <Icon name="send" className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </>
    );
}
