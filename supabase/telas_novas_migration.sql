-- ============================================================================
-- Berlim Sistema — telas novas por usuário.
-- Rode este arquivo no SQL Editor do Supabase. É seguro rodar de novo.
--
-- Enquanto as telas novas estão em teste, elas valem só para quem tem esta
-- coluna ligada. Para essa pessoa, os mesmos endereços do menu abrem a versão
-- nova (lib/acesso/telasNovas.js); para o resto da equipe nada muda.
--
-- Todo mundo começa desligado. Para ligar para alguém, depois de rodar:
--   update public.profiles set telas_novas = true where nome = '<nome>';
-- e para desligar, o mesmo com false.
--
-- Nada a fazer em RLS: profiles_admin_write já cobre a coluna nova, e cada
-- pessoa já lê o próprio perfil (é dele que o sistema tira esta chave).
-- ============================================================================

alter table public.profiles add column if not exists telas_novas boolean not null default false;

comment on column public.profiles.telas_novas is
  'Usa as telas novas (em teste) no lugar das atuais. Padrão: não.';
