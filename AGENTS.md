<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dados: cada tela busca só o que mostra

O plano gratuito do Supabase tem 5 GB de tráfego por ciclo (renova no dia 3). Para uma tela nova não pesar:

- **Reaproveite a memória.** `pedidos` (context/AppContext.jsx) guarda só as O.S. abertas: em produção e concluídas recentes. Produção, Início e pendências leem dali, sem consulta nova.
- **Histórico vem do banco, sob demanda:** só a página que aparece, só com a tela aberta (condicione o efeito à rota com `pathname`) e com o filtro feito no banco, nunca baixando tudo para filtrar no navegador. O Supabase devolve no máximo 1.000 linhas por consulta: o que passar disso some sem aviso.
- **Itens e pagamentos só quando a pessoa abre a O.S.** `abrirEdicao()` já relê a O.S. pelo id.
- **Nada de recarga em laço nem a cada volta à aba.** O tempo real atualiza a memória; a recarga completa só acontece depois de 10 minutos fora ou quando o canal cai.
