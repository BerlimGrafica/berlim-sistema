-- ============================================================================
-- Locais de produção e técnicos: as vistas voltam a rodar como o dono
-- Rode no SQL Editor do Supabase, como o usuário padrão (postgres). É idempotente.
-- ============================================================================
--
-- PROBLEMA
-- O Atendimento voltou a ver só "Berlim" no local de produção do item da O.S.
-- A lista vem de fornecedores_terceirizacao_nomes, a vista que mostra só id e
-- nome para quem não lê a tabela fornecedores (só Administrador e Financeiro
-- leem). Ela só funciona rodando com os privilégios do dono
-- (security_invoker = false). Em 27/10/2026 rodava com os de quem consulta:
-- sem login, devolvia 0 linhas em vez dos 9 locais. Para quem não é
-- Administrador ou Financeiro a lista chegava vazia, e o select caía no
-- "Berlim" padrão.
--
-- O mais provável é ter sido aplicada a correção que o Security Advisor do
-- Supabase sugere para o aviso "Security Definer View", que é justamente
-- trocar a vista para security_invoker = true. Nestas duas vistas o aviso é
-- esperado e deve ficar. fornecedores_manutencao_nomes (técnicos da tela
-- Equipamentos, usada pela Produção) tem o mesmo arranjo e volta junto.
--
-- SOLUÇÃO
-- As duas vistas voltam a rodar com os privilégios do dono, o aviso fica no
-- próprio banco (comment, aparece na descrição da vista no painel) e quem não
-- está logado perde o acesso à de locais, como já era na de técnicos.
-- ============================================================================

alter view public.fornecedores_terceirizacao_nomes set (security_invoker = false);
alter view public.fornecedores_manutencao_nomes   set (security_invoker = false);

revoke all on public.fornecedores_terceirizacao_nomes from anon;
revoke all on public.fornecedores_manutencao_nomes   from anon;
grant select on public.fornecedores_terceirizacao_nomes to authenticated;
grant select on public.fornecedores_manutencao_nomes   to authenticated;

comment on view public.fornecedores_terceirizacao_nomes is
    'Locais de produção do item da O.S., para todos os níveis. Precisa rodar com os privilégios do dono (security_invoker = false): o aviso "Security Definer View" do Security Advisor é esperado aqui. Não aplique a correção sugerida, senão o Atendimento volta a ver só Berlim.';
comment on view public.fornecedores_manutencao_nomes is
    'Técnicos da manutenção na tela Equipamentos, para a Produção. Precisa rodar com os privilégios do dono (security_invoker = false): o aviso "Security Definer View" do Security Advisor é esperado aqui. Não aplique a correção sugerida, senão a Produção fica sem técnicos.';

-- Conferência: as duas linhas devem mostrar {security_invoker=false}.
select c.relname as vista, c.reloptions as opcoes, pg_get_userbyid(c.relowner) as dono
from pg_class c
where c.relnamespace = 'public'::regnamespace
  and c.relname in ('fornecedores_terceirizacao_nomes', 'fornecedores_manutencao_nomes');
