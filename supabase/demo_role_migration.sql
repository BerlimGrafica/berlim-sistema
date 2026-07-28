-- ============================================================================
-- Berlim Sistema — acesso demo (somente leitura), para link de currículo.
-- Rode este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor)
-- DEPOIS de já ter rodado rls_and_auth_migration.sql. Seguro rodar de novo.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Libera 'demo' como nível válido em profiles.
-- ----------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_nivel_check;
alter table public.profiles add constraint profiles_nivel_check
  check (nivel in ('Atendimento','Produção','Financeiro','Administrador','demo'));

-- ----------------------------------------------------------------------------
-- 2) Leitura para 'demo' nas tabelas que devem aparecer na navegação.
--    Importante: NÃO criamos policy de insert/update/delete para 'demo' em
--    nenhuma tabela — isso é o bloqueio real de escrita (Postgres nega por
--    padrão sem uma policy que libere). E NÃO adicionamos 'demo' na policy de
--    select de "clientes" — a tabela fica vazia para esse usuário de propósito.
-- ----------------------------------------------------------------------------
drop policy if exists "pedidos_select_demo" on public.pedidos;
create policy "pedidos_select_demo" on public.pedidos for select to authenticated
  using (nivel_atual() = 'demo');

drop policy if exists "produtos_select_demo" on public.produtos;
create policy "produtos_select_demo" on public.produtos for select to authenticated
  using (nivel_atual() = 'demo');

drop policy if exists "orcf_select_demo" on public.orcamentos_formalizados;
create policy "orcf_select_demo" on public.orcamentos_formalizados for select to authenticated
  using (nivel_atual() = 'demo');

drop policy if exists "orcpp_select_demo" on public.orcamentos_pre_prontos;
create policy "orcpp_select_demo" on public.orcamentos_pre_prontos for select to authenticated
  using (nivel_atual() = 'demo');

drop policy if exists "notas_select_demo" on public.notas_fiscais;
create policy "notas_select_demo" on public.notas_fiscais for select to authenticated
  using (nivel_atual() = 'demo');

drop policy if exists "empresas_fat_select_demo" on public.empresas_faturamento;
create policy "empresas_fat_select_demo" on public.empresas_faturamento for select to authenticated
  using (nivel_atual() = 'demo');

drop policy if exists "contas_pagar_select_demo" on public.contas_pagar;
create policy "contas_pagar_select_demo" on public.contas_pagar for select to authenticated
  using (nivel_atual() = 'demo');

-- requisicoes_material, tarefas_internas e links_pagamento já têm policy
-- "for all ... using (true)" para qualquer autenticado (ver
-- rls_and_auth_migration.sql seção 13) — 'demo' já lê essas três.
-- Como são "for all", elas também liberam escrita para 'demo' hoje; a policy
-- abaixo substitui as três por versões que separam select (todos) de
-- escrita (todos, exceto demo), mantendo o comportamento atual para os
-- demais papéis.
drop policy if exists "requisicoes_all" on public.requisicoes_material;
create policy "requisicoes_select" on public.requisicoes_material for select to authenticated using (true);
create policy "requisicoes_write" on public.requisicoes_material for insert to authenticated with check (nivel_atual() <> 'demo');
create policy "requisicoes_update" on public.requisicoes_material for update to authenticated using (nivel_atual() <> 'demo') with check (nivel_atual() <> 'demo');
create policy "requisicoes_delete" on public.requisicoes_material for delete to authenticated using (nivel_atual() <> 'demo');

drop policy if exists "tarefas_all" on public.tarefas_internas;
create policy "tarefas_select" on public.tarefas_internas for select to authenticated using (true);
create policy "tarefas_write" on public.tarefas_internas for insert to authenticated with check (nivel_atual() <> 'demo');
create policy "tarefas_update" on public.tarefas_internas for update to authenticated using (nivel_atual() <> 'demo') with check (nivel_atual() <> 'demo');
create policy "tarefas_delete" on public.tarefas_internas for delete to authenticated using (nivel_atual() <> 'demo');

drop policy if exists "links_all" on public.links_pagamento;
create policy "links_select" on public.links_pagamento for select to authenticated using (true);
create policy "links_write" on public.links_pagamento for insert to authenticated with check (nivel_atual() <> 'demo');
create policy "links_update" on public.links_pagamento for update to authenticated using (nivel_atual() <> 'demo') with check (nivel_atual() <> 'demo');
create policy "links_delete" on public.links_pagamento for delete to authenticated using (nivel_atual() <> 'demo');

-- ============================================================================
-- FIM. Depois de rodar isto, crie o usuário demo pela tela "Novo Usuário"
-- (nível "Demonstração"), configure NEXT_PUBLIC_DEMO_EMAIL/SENHA no Vercel
-- e re-deploy.
-- ============================================================================
