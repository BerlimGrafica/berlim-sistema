-- ============================================================================
-- Berlim Sistema — Chat da Equipe (canal único, visível a todos os logados).
-- Rode este arquivo no SQL Editor do Supabase (Dashboard > SQL Editor).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tabela de mensagens. Canal único: sem coluna de sala/destinatário —
--    toda linha é visível a qualquer usuário autenticado.
-- ----------------------------------------------------------------------------
create table if not exists public.chat_mensagens (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  conteudo text not null check (char_length(trim(conteudo)) > 0),
  criado_em timestamptz not null default now()
);

create index if not exists chat_mensagens_criado_em_idx on public.chat_mensagens (criado_em);

alter table public.chat_mensagens enable row level security;

-- ----------------------------------------------------------------------------
-- 2) Políticas: qualquer logado lê tudo (canal único da empresa); só insere
--    em nome de si mesmo; só apaga a própria mensagem (Administrador apaga
--    qualquer uma, para moderação).
-- ----------------------------------------------------------------------------
drop policy if exists "chat_select" on public.chat_mensagens;
drop policy if exists "chat_insert" on public.chat_mensagens;
drop policy if exists "chat_delete" on public.chat_mensagens;

create policy "chat_select" on public.chat_mensagens
  for select to authenticated using (true);

create policy "chat_insert" on public.chat_mensagens
  for insert to authenticated with check (usuario_id = auth.uid());

create policy "chat_delete" on public.chat_mensagens
  for delete to authenticated
  using (usuario_id = auth.uid() or nivel_atual() = 'Administrador');

-- ----------------------------------------------------------------------------
-- 3) Realtime: adiciona a tabela à publicação padrão do Supabase, se ainda
--    não estiver nela (evita erro em reexecução).
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_mensagens'
  ) then
    alter publication supabase_realtime add table public.chat_mensagens;
  end if;
end $$;
