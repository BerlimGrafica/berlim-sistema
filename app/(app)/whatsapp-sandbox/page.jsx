"use client";
import { useState, useRef, useEffect } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { supabase } from '@/lib/supabaseClient';
import Icon from '@/components/Icon';

// Sandbox pra validar o agente de IA do WhatsApp (prompt + as 2 ferramentas
// reais, só leitura) numa conversa simulada, sem nenhuma infraestrutura de
// WhatsApp — só a rota /api/whatsapp/sandbox, que chama o Claude/Gemini e as
// próprias rotas /api/whatsapp/{catalogo,pedido} do sistema. O agente nunca
// grava nada — ele só coleta informação na conversa.

function Bolha({ autor, children }) {
    const minha = autor === 'cliente';
    const sistema = autor === 'sistema';
    if (sistema) {
        return (
            <div className="flex justify-center my-2">
                <div className="max-w-[85%] text-compacto text-perigo bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                    {children}
                </div>
            </div>
        );
    }
    return (
        <div className={`flex ${minha ? 'justify-end' : 'justify-start'} mt-2`}>
            <div
                className={`max-w-[75%] px-3.5 py-2 text-corpo leading-snug break-words whitespace-pre-wrap rounded-2xl ${
                    minha
                        ? 'bg-brand text-white rounded-br-sm'
                        : 'bg-elevado text-tinta border border-borda-fraca rounded-bl-sm'
                }`}
            >
                {children}
            </div>
        </div>
    );
}

function LogFerramentas({ ferramentas }) {
    if (!ferramentas || ferramentas.length === 0) return null;
    return (
        <div className="flex justify-start mt-1">
            <div className="max-w-[85%] w-full flex flex-col gap-1.5">
                {ferramentas.map((f, i) => (
                    <details key={i} className="bg-sutil border border-borda rounded-lg px-3 py-1.5 text-mini">
                        <summary className="cursor-pointer select-none font-mono font-semibold text-tinta-suave flex items-center gap-1.5">
                            <Icon name="wrench" className="w-3 h-3 shrink-0" />
                            {f.nome}
                        </summary>
                        <div className="mt-2 flex flex-col gap-2">
                            <div>
                                <p className="text-gray-400 mb-0.5">entrada</p>
                                <pre className="font-mono whitespace-pre-wrap break-words text-tinta-corpo bg-superficie rounded p-2 border border-borda-fraca">
                                    {JSON.stringify(f.input, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-0.5">resultado</p>
                                <pre className="font-mono whitespace-pre-wrap break-words text-tinta-corpo bg-superficie rounded p-2 border border-borda-fraca">
                                    {JSON.stringify(f.resultado, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
}

const PROVEDORES = [
    { id: 'claude', nome: 'Claude', modelo: 'Haiku 4.5' },
    { id: 'gemini', nome: 'Gemini', modelo: '3.6 Flash · grátis' },
];

export default function WhatsappSandboxPage() {
    const { isAdmin } = useSessao();

    const [provedor, setProvedor] = useState('claude');
    const [historicoApi, setHistoricoApi] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [inputTexto, setInputTexto] = useState('');
    const [telefoneSimulado, setTelefoneSimulado] = useState('');
    const [carregando, setCarregando] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [turnos, carregando]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-3 text-center px-4">
                <Icon name="lock" className="w-8 h-8 text-gray-300" />
                <p className="text-tinta-suave text-sm">Este sandbox é restrito a Administradores.</p>
            </div>
        );
    }

    function reiniciar() {
        setHistoricoApi([]);
        setTurnos([]);
    }

    function trocarProvedor(novoProvedor) {
        if (novoProvedor === provedor) return;
        setProvedor(novoProvedor);
        // Claude e Gemini guardam o histórico da conversa em formatos
        // incompatíveis entre si, então trocar de provedor sempre reinicia.
        reiniciar();
    }

    async function enviar(e) {
        e.preventDefault();
        const texto = inputTexto.trim();
        if (!texto || carregando) return;
        if (!telefoneSimulado.trim()) {
            setTurnos(prev => [...prev, { autor: 'sistema', texto: 'Informe um telefone de teste antes de mandar mensagem — é ele que o agente vai usar pra consultar pedido.' }]);
            return;
        }

        setTurnos(prev => [...prev, { autor: 'cliente', texto }]);
        setInputTexto('');
        setCarregando(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sessão expirada, faça login novamente.');

            const resp = await fetch('/api/whatsapp/sandbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                body: JSON.stringify({
                    provedor,
                    mensagens: historicoApi,
                    texto,
                    telefoneSimulado: telefoneSimulado.trim(),
                }),
            });
            const resultado = await resp.json();

            if (!resp.ok) {
                setTurnos(prev => [...prev, { autor: 'sistema', texto: resultado.erro || resultado.error || 'Falha ao chamar o agente.' }]);
                return;
            }

            setHistoricoApi(resultado.mensagens || []);
            setTurnos(prev => [...prev, { autor: 'agente', texto: resultado.resposta, ferramentas: resultado.ferramentas }]);
        } catch (err) {
            setTurnos(prev => [...prev, { autor: 'sistema', texto: err.message || 'Erro de rede ao chamar o sandbox.' }]);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
            <div>
                <h1 className="text-lg font-bold text-tinta">Sandbox do agente de WhatsApp</h1>
                <p className="text-corpo text-tinta-suave mt-1">
                    Conversa simulada com o mesmo prompt e as mesmas 2 ferramentas (só leitura) que o agente usaria no WhatsApp de verdade — nenhuma mensagem sai ou entra por WhatsApp aqui, e o agente nunca grava nada, só coleta informação na conversa.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <div className="inline-flex bg-realce rounded-lg p-1 gap-1">
                    {PROVEDORES.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => trocarProvedor(p.id)}
                            className={`px-3 py-1.5 rounded-md text-compacto font-semibold transition ${
                                provedor === p.id
                                    ? 'bg-superficie text-tinta shadow-sm'
                                    : 'text-tinta-suave hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {p.nome}
                        </button>
                    ))}
                </div>
                <span className="text-mini text-gray-400">{PROVEDORES.find((p) => p.id === provedor)?.modelo}</span>
            </div>

            <div className="bg-superficie border border-borda rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <Icon name="phone" className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={telefoneSimulado}
                        onChange={(e) => setTelefoneSimulado(e.target.value)}
                        placeholder="Telefone de teste, ex: 11999998888"
                        className="flex-1 bg-realce text-corpo text-tinta placeholder-gray-400 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand/40"
                    />
                </div>
                <button
                    type="button"
                    onClick={reiniciar}
                    title="Reiniciar conversa"
                    className="p-2 rounded-lg text-gray-400 hover:text-tinta-corpo hover:bg-realce transition shrink-0"
                >
                    <Icon name="rotate-ccw" className="w-4 h-4" />
                </button>
            </div>

            <div ref={listRef} className="bg-sutil border border-borda rounded-xl px-4 py-4 h-[50vh] overflow-y-auto custom-scrollbar flex flex-col">
                {turnos.length === 0 ? (
                    <p className="text-center text-compacto text-gray-400 mt-6">Digite como se fosse um cliente mandando a primeira mensagem no WhatsApp.</p>
                ) : (
                    turnos.map((t, i) => (
                        <div key={i}>
                            <Bolha autor={t.autor}>{t.texto}</Bolha>
                            {t.autor === 'agente' && <LogFerramentas ferramentas={t.ferramentas} />}
                        </div>
                    ))
                )}
                {carregando && (
                    <div className="flex justify-start mt-2">
                        <div className="px-3.5 py-2 rounded-2xl rounded-bl-sm bg-elevado border border-borda-fraca text-compacto text-gray-400">
                            digitando…
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={enviar} className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputTexto}
                    onChange={(e) => setInputTexto(e.target.value)}
                    placeholder="Mensagem do cliente simulado..."
                    className="flex-1 bg-elevado border border-borda text-corpo text-tinta placeholder-gray-400 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand/40"
                />
                <button
                    type="submit"
                    disabled={!inputTexto.trim() || carregando}
                    aria-label="Enviar mensagem"
                    className="p-2.5 rounded-full bg-brand hover:bg-brandHover text-white transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                    <Icon name="send" className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
