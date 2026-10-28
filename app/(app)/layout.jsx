"use client";
import { useSyncExternalStore } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import MenuLateral from '@/components/MenuLateral';
import FaixaPendencias from '@/components/FaixaPendencias';
import FaviconPendencias from '@/components/FaviconPendencias';
import GuardaDeAcesso from '@/components/GuardaDeAcesso';
import Modals from '@/components/Modals';
import ChatPanel from '@/components/ChatPanel';
import PrintLayout from '@/components/PrintLayout';
import PageTransition from '@/components/PageTransition';
import ToastContainer from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';
import ContextMenu from '@/components/ContextMenu';
import TelaBloqueada from '@/components/TelaBloqueada';
import { useSessao } from '@/context/SessaoContext';
import { inscrever, haModalAberto, haModalAbertoNoServidor } from '@/lib/ui/pilhaModais';

export default function AppLayout({ children }) {
    return (
        <AppProvider>
            <Sistema>{children}</Sistema>
        </AppProvider>
    );
}

// Separado do AppLayout porque precisa ler a sessão, que só existe dentro do
// AppProvider (e ele só renderiza isto com alguém logado).
function Sistema({ children }) {
    const modalAberto = useSyncExternalStore(inscrever, haModalAberto, haModalAbertoNoServidor);
    const { telaBloqueada } = useSessao();

    return (
        <>
            {/* Com a tela bloqueada, tudo aqui fica inerte — modais, chat e
                avisos inclusive: nem o Tab nem um leitor de tela chegam ao que
                está por baixo. Continua montado, então os dados e o tempo real
                seguem vivos e nada precisa recarregar ao desbloquear. */}
            <div className="flex flex-col min-h-screen no-print bg-fundo" inert={!!telaBloqueada}>
                {/* Com um modal aberto, a página de trás fica inerte: não recebe
                    foco pelo Tab nem clique. Antes o backdrop já barrava o clique,
                    mas o Tab passava do último campo do formulário para uma linha
                    da tabela atrás do overlay — invisível e ainda assim ativa, de
                    modo que um Enter abria outra O.S. por cima da que estava sendo
                    preenchida. "display: contents" mantém Navbar e conteúdo como
                    filhos diretos do flex, então o wrapper não altera o layout;
                    inert vale para toda a subárvore de qualquer forma. Modais,
                    toasts, confirmação e menu de contexto ficam de fora de
                    propósito — precisam continuar operantes. */}
                <div className="contents" inert={modalAberto}>
                    <Navbar />
                    {/* Abaixo da barra, duas colunas no computador: o menu lateral e a
                        página. A faixa de pendências fica na coluna da página, e não
                        atravessando a tela toda: assim o menu começa colado na barra e
                        a faixa fala de trabalho, junto do trabalho. No celular o menu
                        lateral não existe e a coluna da página ocupa tudo. */}
                    <div className="flex flex-1">
                        <MenuLateral />
                        <div className="flex-1 min-w-0 flex flex-col">
                            <FaixaPendencias />
                            <div className="flex-1 bg-fundo relative">
                                <PageTransition><GuardaDeAcesso>{children}</GuardaDeAcesso></PageTransition>
                            </div>
                        </div>
                    </div>
                </div>
                <Modals />
                {/* Fora do wrapper inerte junto com os modais, e não mais dentro
                    da Navbar: a gaveta do chat entra na mesma pilha de modais, e
                    de dentro dali ela se tornava inerte ao abrir — o campo de
                    texto parava de aceitar digitação e nem o X fechava. */}
                <ChatPanel />
                <ToastContainer />
                <FaviconPendencias />
                <ConfirmDialog />
                <ContextMenu />
            </div>
            <PrintLayout />
            {telaBloqueada && <TelaBloqueada />}
        </>
    );
}
