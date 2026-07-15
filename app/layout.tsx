import React from "react";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Berlim Gráfica | ERP Corporativo",
  description: "ERP Corporativo da Berlim Gráfica",
  icons: {
    icon: "https://www.google.com/s2/favicons?domain=berlimgraficarapida.com.br&sz=128",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.className} antialiased`}>
      <body className="bg-[#EDEFF0] dark:bg-darkBg text-[#454545] text-[13px] dark:text-[#EDEDED] min-h-screen selection:bg-brand selection:text-white tracking-tight">
        {children}
      </body>
    </html>
  );
}
