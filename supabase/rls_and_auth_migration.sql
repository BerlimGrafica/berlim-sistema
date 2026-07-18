-- ============================================================================
-- Berlim Sistema — migração de segurança: RLS + Auth real
-- Rode este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor).
-- Pode rodar tudo de uma vez; é seguro rodar de novo (idempotente onde possível).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0) TRAVA IMEDIATA na tabela antiga de usuários (guarda senha em texto puro).
--    Zero políticas = ninguém lê/escreve por PostgREST, nem com a anon key.
--    Ela só volta a ser necessária para consulta manual durante a migração.
-- ----------------------------------------------------------------------------
alter table if exists public.usuarios enable row level security;

-- ----------------------------------------------------------------------------
-- 1) Tabela profiles: 1 linha por usuário do Supabase Auth (id = auth.users.id)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  nivel text not null check (nivel in ('Atendimento','Produção','Financeiro','Administrador')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ----------------------------------------------------------------------------
-- 2) Função auxiliar: nível do usuário logado.
--    SECURITY DEFINER + search_path fixo: lê profiles ignorando a própria RLS
--    da tabela (senão as políticas abaixo cairiam em recursão).
-- ----------------------------------------------------------------------------
create or replace function public.nivel_atual()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select nivel from public.profiles where id = auth.uid();
$$;

grant execute on function public.nivel_atual() to authenticated, anon;

-- ----------------------------------------------------------------------------
-- 3) Garantia de GRANT de base (RLS é quem realmente filtra as linhas,
--    mas sem o GRANT o Postgres nem deixa tentar).
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ----------------------------------------------------------------------------
-- 4) Políticas de profiles
--    Leitura liberada para qualquer logado (é só nome/nível, usado em toda a UI).
--    Escrita direta só por Administrador — a criação/edição normal de usuários
--    passa pela rota /api/usuarios (service role), que já valida isso no servidor.
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles
  for all to authenticated
  using (nivel_atual() = 'Administrador')
  with check (nivel_atual() = 'Administrador');

-- ----------------------------------------------------------------------------
-- 5) pedidos — todo mundo logado usa (Produção, O.S., Financeiro leem/escrevem).
--    Sem exclusão nenhuma na UI hoje; deixamos DELETE só para Administrador.
-- ----------------------------------------------------------------------------
alter table public.pedidos enable row level security;
drop policy if exists "pedidos_select" on public.pedidos;
drop policy if exists "pedidos_insert" on public.pedidos;
drop policy if exists "pedidos_update" on public.pedidos;
drop policy if exists "pedidos_delete" on public.pedidos;
create policy "pedidos_select" on public.pedidos for select to authenticated using (true);
create policy "pedidos_insert" on public.pedidos for insert to authenticated with check (true);
create policy "pedidos_update" on public.pedidos for update to authenticated using (true) with check (true);
create policy "pedidos_delete" on public.pedidos for delete to authenticated using (nivel_atual() = 'Administrador');

-- ----------------------------------------------------------------------------
-- 6) produtos — catálogo. Leitura geral, escrita só Administrador (Cadastros).
-- ----------------------------------------------------------------------------
alter table public.produtos enable row level security;
drop policy if exists "produtos_select" on public.produtos;
drop policy if exists "produtos_write" on public.produtos;
create policy "produtos_select" on public.produtos for select to authenticated using (true);
create policy "produtos_write" on public.produtos for all to authenticated
  using (nivel_atual() = 'Administrador') with check (nivel_atual() = 'Administrador');

-- ----------------------------------------------------------------------------
-- 7) clientes — leitura por todos (inclusive Financeiro, que às vezes abre a
--    O.S.); escrita por quem atende/produz; exclusão só Administrador.
-- ----------------------------------------------------------------------------
alter table public.clientes enable row level security;
drop policy if exists "clientes_select" on public.clientes;
drop policy if exists "clientes_insert" on public.clientes;
drop policy if exists "clientes_update" on public.clientes;
drop policy if exists "clientes_delete" on public.clientes;
create policy "clientes_select" on public.clientes for select to authenticated using (true);
create policy "clientes_insert" on public.clientes for insert to authenticated
  with check (nivel_atual() in ('Administrador','Atendimento','Produção'));
create policy "clientes_update" on public.clientes for update to authenticated
  using (nivel_atual() in ('Administrador','Atendimento','Produção'))
  with check (nivel_atual() in ('Administrador','Atendimento','Produção'));
create policy "clientes_delete" on public.clientes for delete to authenticated
  using (nivel_atual() = 'Administrador');

-- ----------------------------------------------------------------------------
-- 8) fornecedores — usado em Cadastros (admin) e no modal de Contas a Pagar
--    (Financeiro também precisa enxergar, só não edita).
-- ----------------------------------------------------------------------------
alter table public.fornecedores enable row level security;
drop policy if exists "fornecedores_select" on public.fornecedores;
drop policy if exists "fornecedores_write" on public.fornecedores;
create policy "fornecedores_select" on public.fornecedores for select to authenticated
  using (nivel_atual() in ('Administrador','Financeiro'));
create policy "fornecedores_write" on public.fornecedores for all to authenticated
  using (nivel_atual() = 'Administrador') with check (nivel_atual() = 'Administrador');

-- ----------------------------------------------------------------------------
-- 9) orçamentos formalizados — Administrador/Atendimento/Produção (Financeiro
--    não acessa a aba). DELETE inclui esses 3 papéis porque "transformar em
--    O.S." apaga o orçamento de origem, e qualquer um deles pode fazer isso.
-- ----------------------------------------------------------------------------
alter table public.orcamentos_formalizados enable row level security;
drop policy if exists "orcf_select" on public.orcamentos_formalizados;
drop policy if exists "orcf_insert" on public.orcamentos_formalizados;
drop policy if exists "orcf_update" on public.orcamentos_formalizados;
drop policy if exists "orcf_delete" on public.orcamentos_formalizados;
create policy "orcf_select" on public.orcamentos_formalizados for select to authenticated
  using (nivel_atual() in ('Administrador','Atendimento','Produção'));
create policy "orcf_insert" on public.orcamentos_formalizados for insert to authenticated
  with check (nivel_atual() in ('Administrador','Atendimento','Produção'));
create policy "orcf_update" on public.orcamentos_formalizados for update to authenticated
  using (nivel_atual() in ('Administrador','Atendimento','Produção'))
  with check (nivel_atual() in ('Administrador','Atendimento','Produção'));
create policy "orcf_delete" on public.orcamentos_formalizados for delete to authenticated
  using (nivel_atual() in ('Administrador','Atendimento','Produção'));

-- ----------------------------------------------------------------------------
-- 10) orçamentos pré-prontos (textos-modelo) — leitura pelos 3 papéis de
--     operação, escrita só Administrador (é o que a UI já faz).
-- ----------------------------------------------------------------------------
alter table public.orcamentos_pre_prontos enable row level security;
drop policy if exists "orcpp_select" on public.orcamentos_pre_prontos;
drop policy if exists "orcpp_write" on public.orcamentos_pre_prontos;
create policy "orcpp_select" on public.orcamentos_pre_prontos for select to authenticated
  using (nivel_atual() in ('Administrador','Atendimento','Produção'));
create policy "orcpp_write" on public.orcamentos_pre_prontos for all to authenticated
  using (nivel_atual() = 'Administrador') with check (nivel_atual() = 'Administrador');

-- ----------------------------------------------------------------------------
-- 11) notas_fiscais — é a única tabela com um caminho público de verdade:
--     o formulário /solicitar-nota roda sem login (role "anon").
--     anon só pode INSERIR; nunca ler, atualizar ou apagar.
-- ----------------------------------------------------------------------------
alter table public.notas_fiscais enable row level security;
drop policy if exists "notas_select" on public.notas_fiscais;
drop policy if exists "notas_insert_auth" on public.notas_fiscais;
drop policy if exists "notas_insert_anon" on public.notas_fiscais;
drop policy if exists "notas_update" on public.notas_fiscais;
drop policy if exists "notas_delete" on public.notas_fiscais;
create policy "notas_select" on public.notas_fiscais for select to authenticated
  using (nivel_atual() in ('Administrador','Financeiro','Atendimento'));
create policy "notas_insert_auth" on public.notas_fiscais for insert to authenticated
  with check (nivel_atual() in ('Administrador','Financeiro','Atendimento'));
create policy "notas_insert_anon" on public.notas_fiscais for insert to anon with check (true);
create policy "notas_update" on public.notas_fiscais for update to authenticated
  using (nivel_atual() in ('Administrador','Financeiro','Atendimento'))
  with check (nivel_atual() in ('Administrador','Financeiro','Atendimento'));
create policy "notas_delete" on public.notas_fiscais for delete to authenticated
  using (nivel_atual() = 'Administrador');

grant insert on public.notas_fiscais to anon;

-- ----------------------------------------------------------------------------
-- 12) empresas_faturamento e contas_pagar — só Financeiro/Administrador.
-- ----------------------------------------------------------------------------
alter table public.empresas_faturamento enable row level security;
drop policy if exists "empresas_fat_all" on public.empresas_faturamento;
create policy "empresas_fat_all" on public.empresas_faturamento for all to authenticated
  using (nivel_atual() in ('Administrador','Financeiro'))
  with check (nivel_atual() in ('Administrador','Financeiro'));

alter table public.contas_pagar enable row level security;
drop policy if exists "contas_pagar_all" on public.contas_pagar;
create policy "contas_pagar_all" on public.contas_pagar for all to authenticated
  using (nivel_atual() in ('Administrador','Financeiro'))
  with check (nivel_atual() in ('Administrador','Financeiro'));

-- ----------------------------------------------------------------------------
-- 13) Comunicação interna — aberta a qualquer papel logado (a aba não tem
--     restrição de nível hoje).
-- ----------------------------------------------------------------------------
alter table public.requisicoes_material enable row level security;
drop policy if exists "requisicoes_all" on public.requisicoes_material;
create policy "requisicoes_all" on public.requisicoes_material for all to authenticated
  using (true) with check (true);

alter table public.tarefas_internas enable row level security;
drop policy if exists "tarefas_all" on public.tarefas_internas;
create policy "tarefas_all" on public.tarefas_internas for all to authenticated
  using (true) with check (true);

alter table public.links_pagamento enable row level security;
drop policy if exists "links_all" on public.links_pagamento;
create policy "links_all" on public.links_pagamento for all to authenticated
  using (true) with check (true);

-- ============================================================================
-- FIM. Depois de validar o login novo e cada módulo (ver runbook), rode
-- separadamente (é destrutivo, por isso não está automático aqui):
--
--   drop table public.usuarios;
--
-- ============================================================================
