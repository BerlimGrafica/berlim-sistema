import React from "react";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  // Base para resolver caminhos relativos (ex.: a og:image do /solicitar-nota)
  // em URLs absolutas, que é o que os leitores de prévia de link exigem.
  metadataBase: new URL("https://berlim-sistema.vercel.app"),
  title: "Berlim Gráfica | ERP Corporativo",
  description: "ERP Corporativo da Berlim Gráfica",
  // Sem "icons" aqui de propósito: o Next serve automaticamente o app/icon.png
  // (nosso símbolo), e declarar um ícone nesta metadata sobrescreveria o arquivo.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.className} antialiased`}>
      <body className="bg-fundo text-[#454545] text-corpo dark:text-[#EDEDED] min-h-screen selection:bg-brand selection:text-white tracking-tight">
        {children}
      </body>
    </html>
  );
}
