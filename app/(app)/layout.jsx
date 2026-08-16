"use client";
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Modals from '@/components/Modals';
import PrintLayout from '@/components/PrintLayout';
import PageTransition from '@/components/PageTransition';
import ToastContainer from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';
import ContextMenu from '@/components/ContextMenu';

export default function AppLayout({ children }) {
    return (
        <AppProvider>
            <div className="flex flex-col min-h-screen no-print bg-fundo">
                <Navbar />
                <div className="flex-1 bg-fundo relative">
                    <PageTransition>{children}</PageTransition>
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
