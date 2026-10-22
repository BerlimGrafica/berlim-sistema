-- ----------------------------------------------------------------------------
-- Horário limite da O.S. (opcional).
--
-- Algumas O.S. precisam sair até uma hora certa do dia do prazo ("entregar até
-- as 14h"). A data continua em `prazo`; a hora vem à parte e fica nula quando
-- não há limite — que é o caso da maioria. Sem data não há hora: o sistema
-- grava nulo nesse caso.
-- ----------------------------------------------------------------------------
alter table public.pedidos add column if not exists prazo_hora time;
