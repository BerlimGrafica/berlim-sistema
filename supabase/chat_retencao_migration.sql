-- ============================================================================
-- Berlim Sistema — Retenção automática do Chat da Equipe.
-- Rode este arquivo no SQL Editor do Supabase (Dashboard > SQL Editor).
--
-- Hoje o chat (public.chat_mensagens) não tem nenhuma expurgo automático: o
-- app só busca as últimas 200 mensagens pra exibir (hooks/useChat.js),
-- mas a tabela cresce pra sempre até alguém apagar na mão. Esta migration
-- cria um job diário que apaga mensagens com mais de RETENCAO_DIAS dias.
--
-- Pré-requisito: extensão "pg_cron" habilitada no projeto (Dashboard >
-- Database > Extensions > pg_cron). Em projetos novos do Supabase ela já
-- costuma estar disponível, só precisa ser ativada.
-- ============================================================================

create extension if not exists pg_cron with schema extensions;

-- ----------------------------------------------------------------------------
-- 1) Função que apaga o que passou da retenção. Ajuste o "90" abaixo pro
--    número de dias que fizer sentido pra empresa.
-- ----------------------------------------------------------------------------
create or replace function public.limpar_chat_antigo()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.chat_mensagens where criado_em < now() - interval '90 days';
$$;

-- ----------------------------------------------------------------------------
-- 2) Agendamento: todo dia às 06:00 UTC (03:00 no horário de Brasília).
--    Reagendável sem erro — desagenda o job antigo antes de criar de novo.
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from cron.job where jobname = 'limpar_chat_antigo_diario') then
    perform cron.unschedule('limpar_chat_antigo_diario');
  end if;
end $$;

select cron.schedule(
  'limpar_chat_antigo_diario',
  '0 6 * * *',
  $$ select public.limpar_chat_antigo(); $$
);
