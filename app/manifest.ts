import type { MetadataRoute } from "next";

// O que o celular usa quando o sistema vira atalho na tela inicial.
//
// Sem este arquivo, o Android guarda o ícone da aba como ele está naquele
// instante: 64px e, se houver pendência, com a bolinha vermelha do
// FaviconPendencias congelada no atalho para sempre.
//
// O fundo é o `--fundo` do tema claro, a cor da primeira tela do sistema: a
// abertura do celular passa para ela sem emenda. O manifesto não sabe o tema
// de cada pessoa, então a abertura é sempre clara.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Berlim Gráfica",
    short_name: "Berlim",
    description: "ERP Corporativo da Berlim Gráfica",
    lang: "pt-BR",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#EDEFF0",
    theme_color: "#EDEFF0",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
