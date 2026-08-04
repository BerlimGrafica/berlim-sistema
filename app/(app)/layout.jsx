"use client";
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Modals from '@/components/Modals';
import PrintLayout from '@/components/PrintLayout';

export default function AppLayout({ children }) {
    return (
        <AppProvider>
            <div className="flex flex-col min-h-screen no-print bg-[#EDEFF0] dark:bg-darkBg">
                <Navbar />
                <div className="flex-1 bg-[#EDEFF0] dark:bg-darkBg relative">
                    {children}
                </div>
                <Modals />
            </div>
            <PrintLayout />
        </AppProvider>
    );
}
