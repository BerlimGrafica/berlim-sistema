"use client";
import { useSyncExternalStore } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Modals from '@/components/Modals';
import PrintLayout from '@/components/PrintLayout';
import PageTransition from '@/components/PageTransition';
import ToastContainer from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';
import ContextMenu from '@/components/ContextMenu';
import { inscrever, haModalAberto, haModalAbertoNoServidor } from '@/lib/ui/pilhaModais';

export default function AppLayout({ children }) {
    const modalAberto = useSyncExternalStore(inscrever, haModalAberto, haModalAbertoNoServidor);

    return (
        <AppProvider>
            <div className="flex flex-col min-h-screen no-print bg-fundo">
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
                    <div className="flex-1 bg-fundo relative">
                        <PageTransition>{children}</PageTransition>
                    </div>
                </div>
                <Modals />
                <ToastContainer />
                <ConfirmDialog />
                <ContextMenu />
            </div>
            <PrintLayout />
        </AppProvider>
    );
}
