-- ----------------------------------------------------------------------------
-- Adiciona coluna para registrar quando uma O.S. foi marcada como "Cancelado",
-- permitindo que a aba "Canceladas" oculte automaticamente pedidos cancelados
-- há mais de 15 dias (mesma lógica já usada para Abandonado após 31 dias).
-- ----------------------------------------------------------------------------
alter table public.pedidos add column if not exists cancelado_em timestamptz;

-- Backfill: pedidos já cancelados passam a contar os 15 dias a partir de agora,
-- em vez de já nascerem "vencidos" e sumirem no primeiro carregamento após a migration.
update public.pedidos
set cancelado_em = now()
where status = 'Cancelado' and cancelado_em is null;
