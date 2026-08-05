-- ----------------------------------------------------------------------------
-- Permite que uma conta a pagar recorrente tenha um número limitado de
-- repetições (ex: parcelamento de 10 meses de um ar-condicionado), em vez de
-- só o modo "recorrente para sempre" (ex: conta de energia).
--
-- recorrente_total_parcelas: null = recorrente pra sempre; N = para de gerar
--   uma nova cobrança pendente depois que a parcela N for paga.
-- recorrente_parcela_atual: em qual parcela (1-based) esta linha está. Toda
--   cópia gerada automaticamente nasce com parcela_atual + 1 em relação à
--   conta que originou ela.
-- ----------------------------------------------------------------------------
alter table public.contas_pagar add column if not exists recorrente_total_parcelas integer;
alter table public.contas_pagar add column if not exists recorrente_parcela_atual integer not null default 1;
