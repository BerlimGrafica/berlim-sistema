-- ============================================================================
-- Berlim Sistema — limpeza de dados transacionais.
-- Rode este arquivo no SQL Editor do Supabase (Dashboard > SQL Editor).
--
-- MANTÉM (não são tocadas):
--   - public.clientes
--   - public.produtos                (catálogo)
--   - public.orcamentos_pre_prontos  (textos-modelo)
--   - public.fornecedores
--   - public.profiles                (usuários do sistema)
--   - auth.users                     (login/senha — não é apagado por aqui)
--   - public.usuarios                (tabela legada, já travada por RLS;
--                                      fora do escopo desta limpeza)
--
-- APAGA (TRUNCATE = remove todas as linhas, mantém a tabela e sua estrutura):
--   pedidos, pedido_itens, pedido_pagamentos, orcamentos_formalizados,
--   orcamento_itens, notas_fiscais, empresas_faturamento, contas_pagar,
--   requisicoes_material, tarefas_internas, links_pagamento, chat_mensagens
--
-- Nenhuma das tabelas mantidas acima tem FK apontando para as tabelas
-- apagadas, então não há risco de CASCADE atingir clientes/produtos/
-- fornecedores/orçamentos pré-prontos/profiles. pedido_itens/pedido_pagamentos/
-- orcamento_itens têm FK (on delete cascade) para pedidos/orcamentos_formalizados
-- — por isso precisam entrar no MESMO truncate (Postgres exige truncar
-- referenciadora e referenciada juntas, senão o comando falha).
--
-- ATENÇÃO: operação destrutiva e irreversível. Confirme que tem backup/export
-- antes de rodar (Supabase Dashboard > Database > Backups, ou pg_dump).
-- ============================================================================

truncate table
  public.pedidos,
  public.pedido_itens,
  public.pedido_pagamentos,
  public.orcamentos_formalizados,
  public.orcamento_itens,
  public.notas_fiscais,
  public.empresas_faturamento,
  public.contas_pagar,
  public.requisicoes_material,
  public.tarefas_internas,
  public.links_pagamento,
  public.chat_mensagens
restart identity;
