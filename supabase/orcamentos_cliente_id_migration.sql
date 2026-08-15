-- ----------------------------------------------------------------------------
-- Vínculo por ID entre orçamentos formalizados e clientes
-- (orcamentos_formalizados.cliente_id -> clientes.id).
--
-- Contrapartida da migração já aplicada em pedidos (pedidos_cliente_id_migration.sql).
-- Até aqui o orçamento era casado com o cadastro SÓ pelo texto em
-- orcamentos_formalizados.cliente, e isso errava de forma silenciosa: o cadastro
-- tem dezenas de homônimos exatos (65 "Lucas", 13 "Silvana"), então buscar o
-- cliente pelo nome devolvia o registro de outra pessoa — gravando o telefone
-- errado no orçamento e no PDF impresso, e disparando (ou deixando de disparar)
-- o aviso de "cliente problemático" pela pessoa errada.
--
-- Nullable, sem backfill: orçamento sem vínculo é caso legítimo (venda avulsa,
-- e lead criado pelo agente de WhatsApp em /api/whatsapp/orcamento, que só tem
-- nome e telefone soltos da conversa). null passa a significar exatamente
-- "sem cliente do cadastro" — nunca mais "adivinha pelo nome".
--
-- on delete set null: mesmo motivo de pedidos — clientes são excluídos em
-- Cadastros sem checar erro de FK, e com "restrict" (padrão) o delete falharia
-- silenciosamente. Com set null o orçamento apenas perde o vínculo.
--
-- ATENÇÃO: rode ANTES de subir o código novo. O app passa a enviar cliente_id
-- no insert/update de orcamentos_formalizados, e sem a coluna o Supabase
-- rejeita a gravação (PGRST204, "column not found").
-- ----------------------------------------------------------------------------
alter table public.orcamentos_formalizados
    add column if not exists cliente_id bigint references public.clientes(id) on delete set null;

create index if not exists idx_orcamentos_formalizados_cliente_id
    on public.orcamentos_formalizados(cliente_id);
