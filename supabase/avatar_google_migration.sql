-- ============================================================================
-- Berlim Sistema — Foto de perfil vinda da conta Google vinculada.
-- Rode este arquivo no SQL Editor do Supabase (Dashboard > SQL Editor).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Coluna nova em profiles. Fica nula até a pessoa vincular o Google.
-- ----------------------------------------------------------------------------
alter table public.profiles add column if not exists avatar_url text;

-- ----------------------------------------------------------------------------
-- 2) RPC para o próprio usuário atualizar SÓ o avatar_url da própria linha.
--    Não usamos uma política de RLS "self update" aqui de propósito: a tabela
--    profiles guarda `nivel` (nível de acesso), e uma policy genérica de
--    "usuário edita a própria linha" deixaria qualquer um se promover a
--    Administrador direto pelo client. Com SECURITY DEFINER, só esta coluna
--    fica gravável pelo próprio usuário; nome/nível continuam só por Admin.
-- ----------------------------------------------------------------------------
create or replace function public.atualizar_meu_avatar(novo_avatar_url text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set avatar_url = novo_avatar_url where id = auth.uid();
$$;

grant execute on function public.atualizar_meu_avatar(text) to authenticated;
