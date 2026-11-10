-- Compras: a lista do que falta, um item por linha, ligada à conta a pagar.
--
-- A tabela continua sendo requisicoes_material: a tela de hoje, os avisos do
-- sino e o tempo real seguem funcionando sem mudança. Cada pedido novo da tela
-- de Compras é uma linha com UM item (o texto em `itens`); os pedidos antigos,
-- com vários itens em linhas do texto, ficam como estão e aparecem inteiros.
--
-- O que entra:
-- - fornecedor_id: de onde se compra (fornecedores do tipo Material). Opcional:
--   quem anota o que falta nem sempre sabe.
-- - urgente: era escrito no texto ("URGENTE!"); agora é uma marca.
-- - conta_id: a conta a pagar que o "Comprei" criou. Vários itens comprados de
--   uma vez apontam para a mesma conta.
-- - comprado_em / comprado_por: quando e quem marcou "Comprei".
--
-- Não apaga nem converte nada. Pode rodar mais de uma vez.

alter table public.requisicoes_material
    add column if not exists fornecedor_id bigint references public.fornecedores(id) on delete set null,
    add column if not exists urgente boolean not null default false,
    add column if not exists conta_id bigint references public.contas_pagar(id) on delete set null,
    add column if not exists comprado_em date,
    add column if not exists comprado_por text;

-- Os pedidos antigos que diziam "urgente" no texto e ainda esperam compra
-- ganham a marca (os já comprados ficam como estão).
update public.requisicoes_material
   set urgente = true
 where status = 'Pendente' and itens ilike '%urgente%' and urgente = false;

create index if not exists requisicoes_material_conta_id_idx on public.requisicoes_material (conta_id);
