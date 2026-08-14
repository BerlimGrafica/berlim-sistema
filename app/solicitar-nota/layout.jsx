// Este layout existe só para dar metadata própria ao formulário público.
// A página em si é "use client" e componentes client não podem exportar
// metadata — sem isto, o link herda o título de ERP do layout raiz, que não
// faz sentido para o cliente que recebe o link no WhatsApp.
export const metadata = {
    title: "Berlim Gráfica | Nota Fiscal",
    description: "Formulário para solicitação de nota fiscal.",
    openGraph: {
        title: "Berlim Gráfica | Nota Fiscal",
        description: "Formulário para solicitação de nota fiscal.",
        url: "/solicitar-nota",
        siteName: "Berlim Gráfica",
        locale: "pt_BR",
        type: "website",
        images: [
            {
                url: "/og-nota-fiscal.png",
                width: 1200,
                height: 630,
                alt: "Berlim Gráfica | Nota Fiscal",
            },
        ],
    },
};

export default function SolicitarNotaLayout({ children }) {
    return children;
}
