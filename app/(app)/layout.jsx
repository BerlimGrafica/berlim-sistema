"use client";
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Modals from '@/components/Modals';
import PrintLayout from '@/components/PrintLayout';
import PageTransition from '@/components/PageTransition';
import ToastContainer from '@/components/ToastContainer';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AppLayout({ children }) {
    return (
        <AppProvider>
            <div className="flex flex-col min-h-screen no-print bg-[#EDEFF0] dark:bg-darkBg">
                <Navbar />
                <div className="flex-1 bg-[#EDEFF0] dark:bg-darkBg relative">
                    <PageTransition>{children}</PageTransition>
                </div>
                <Modals />
                <ToastContainer />
                <ConfirmDialog />
            </div>
            <PrintLayout />
        </AppProvider>
    );
}
