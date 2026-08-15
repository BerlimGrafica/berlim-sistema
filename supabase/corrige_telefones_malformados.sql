-- ============================================================================
-- Correção dos telefones fixos malformados pela máscara antiga
-- Rode no SQL Editor do Supabase. É idempotente e seguro.
-- ============================================================================
--
-- CONTEXTO
-- A máscara antiga forçava o corte de celular (5-4) em número de 10 dígitos,
-- jogando o hífen uma casa para a direita:
--
--     digitado  1144576742
--     gravado   (11) 44576-742     <- errado
--     correto   (11) 4457-6742
--
-- Os DÍGITOS sempre ficaram certos — só a posição do hífen saiu errada. Por
-- isso dá para reconstruir o valor correto sem consultar ninguém.
--
-- ESCOPO
-- Apenas 6 registros do cadastro têm esse defeito. Outros ~6.305 telefones
-- estão gravados sem o espaço depois do DDD ("(11)96180-7672"), o que é
-- cosmético: dígitos e hífen corretos. Como a busca agora compara dígitos
-- (ver telefone_digits_migration.sql), esse espaço não afeta nada — não vale
-- reescrever 6.305 linhas por causa dele.
--
-- SEGURANÇA
-- Cada UPDATE confere o valor atual no WHERE. Se alguém já tiver corrigido o
-- registro à mão, a linha simplesmente não é tocada. Rodar duas vezes não faz
-- diferença.
-- ----------------------------------------------------------------------------

-- Antes: confira o que será alterado (deve retornar as 6 linhas abaixo)
--
--   select id, nome, telefone from public.clientes
--    where id in (2061, 6946, 6960, 7001, 7015, 7033);

update public.clientes set telefone = '(11) 8528-1297'
 where id = 2061 and telefone = '(11) 85281-297';   -- Erivan

update public.clientes set telefone = '(11) 4330-8411'
 where id = 6946 and telefone = '(11) 43308-411';   -- Rainha Refrigeração

update public.clientes set telefone = '(11) 4457-6742'
 where id = 6960 and telefone = '(11) 44576-742';   -- Silvana

update public.clientes set telefone = '(11) 2786-2007'
 where id = 7001 and telefone = '(11) 27862-007';   -- Vanessa dos Santos

update public.clientes set telefone = '(45) 9973-8540'
 where id = 7015 and telefone = '(45) 99738-540';   -- Mara Aquino

update public.clientes set telefone = '(35) 9805-8990'
 where id = 7033 and telefone = '(35) 98058-990';   -- João Vitor Félix

-- Depois: confirme o resultado
--
--   select id, nome, telefone, telefone_digits from public.clientes
--    where id in (2061, 6946, 6960, 7001, 7015, 7033);


-- ----------------------------------------------------------------------------
-- ROLLBACK — só se precisar desfazer
-- ----------------------------------------------------------------------------
-- update public.clientes set telefone = '(11) 85281-297' where id = 2061;
-- update public.clientes set telefone = '(11) 43308-411' where id = 6946;
-- update public.clientes set telefone = '(11) 44576-742' where id = 6960;
-- update public.clientes set telefone = '(11) 27862-007' where id = 7001;
-- update public.clientes set telefone = '(45) 99738-540' where id = 7015;
-- update public.clientes set telefone = '(35) 98058-990' where id = 7033;
