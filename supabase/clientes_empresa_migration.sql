-- ----------------------------------------------------------------------------
-- Empresa do cliente (clientes.empresa).
--
-- Parte dos clientes compra em nome de uma empresa: o cadastro guarda a
-- pessoa de contato em `nome` e a empresa aqui. No sistema o cliente aparece
-- como "Nome • Empresa" (ver rotuloCliente em lib/utils/formatters.js) — é
-- esse texto que vai para pedidos.cliente e orcamentos_formalizados.cliente
-- quando o cliente é escolhido.
--
-- Nullable, sem backfill: cliente sem empresa é o caso comum.
--
-- Pode rodar antes ou depois do código novo: enquanto a coluna não existe, o
-- app não manda a empresa e a busca procura só pelo nome. Mas o campo Empresa
-- só grava depois desta migração.
-- ----------------------------------------------------------------------------
alter table public.clientes
    add column if not exists empresa text
    check (empresa is null or length(trim(empresa)) between 1 and 120);
