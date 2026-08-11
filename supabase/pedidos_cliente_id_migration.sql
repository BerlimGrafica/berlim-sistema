-- ----------------------------------------------------------------------------
-- Vínculo por ID entre pedidos e clientes (pedidos.cliente_id -> clientes.id).
-- Base pra agrupar/consolidar OS's do mesmo cliente com confiabilidade (ex:
-- um pagamento só cobrindo o saldo de várias OS's abertas), sem depender só
-- do texto solto em pedidos.cliente — ambíguo quando há nomes iguais/parecidos.
--
-- Nullable, sem backfill: OS's já existentes continuam sem cliente_id e
-- seguem casadas por nome (fallback). Só OS's criadas ou reeditadas a partir
-- de agora, com cliente escolhido no autocomplete, ganham o vínculo de verdade.
--
-- on delete set null: clientes podem ser excluídos em Cadastros (Administrador,
-- CadastrosTab.jsx) via supabase.from('clientes').delete()... sem checar erro
-- de FK — com "restrict" (padrão), excluir um cliente com OS antiga vinculada
-- falharia silenciosamente (delete não tem .catch nem checa {error}). Com
-- set null, o delete continua funcionando e a OS volta a cair no fallback por nome.
--
-- ATENÇÃO antes de rodar: confira em Supabase > Table Editor > clientes > id
-- se o tipo é bigint (padrão de identity column do Supabase). Se for outro
-- tipo, ajuste abaixo antes de executar.
-- ----------------------------------------------------------------------------
alter table public.pedidos
    add column if not exists cliente_id bigint references public.clientes(id) on delete set null;

create index if not exists idx_pedidos_cliente_id on public.pedidos(cliente_id);
