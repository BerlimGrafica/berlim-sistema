-- ----------------------------------------------------------------------------
-- Impede que a mesma conta recorrente gere duas cobranças para a mesma parcela.
--
-- O QUE ACONTECEU
-- Uma conta recorrente gera a próxima cobrança quando é marcada como Paga. O
-- `concluirConta` só barra a reexecução enquanto a conta estiver com status
-- 'Pago' — se ela voltar para Pendente (por edição) e for paga de novo, gera
-- outra cópia, e nada verificava se aquela parcela já existia. Encontrado em
-- produção:
--
--   #19  CXS  parcela 1/11  venc 10/08  R$ 342,00  Pago
--   #34  CXS  parcela 2/11  venc 09/09  R$   0,00  Pendente
--   #37  CXS  parcela 2/11  venc 10/09  R$   0,00  Pendente
--
-- A mesma parcela 2 de 11, duas vezes. Some no meio de 48 linhas e inflaria as
-- despesas do período assim que alguém preenchesse o valor das duas.
--
-- POR QUE UMA COLUNA NOVA
-- Uma cópia não sabia de onde veio. Sem vínculo, a única verificação possível
-- seria comparar descrição + fornecedor + número da parcela — o que barraria
-- por engano duas compras distintas no mesmo fornecedor, ambas em 11x. Com o
-- vínculo explícito a regra fica exata e é o banco que a garante, não a tela:
-- vale para clique duplo, aba repetida, reenvio de rede e para qualquer código
-- futuro que insira nessa tabela.
--
-- A REGRA
-- Uma conta gera no máximo UMA sucessora. Isso é verdade tanto para o
-- parcelamento com fim (11x) quanto para a recorrência indefinida (conta de
-- luz), onde cada mês pago gera o mês seguinte, um por vez.
--
-- As linhas que já existem ficam com a coluna nula e não são afetadas — o
-- índice é parcial. A duplicata #34/#37 continua lá de propósito: apagar dado
-- de produção é decisão do dono, não da migração.
-- ----------------------------------------------------------------------------

alter table public.contas_pagar
    add column if not exists recorrente_origem_id bigint references public.contas_pagar(id) on delete set null;

comment on column public.contas_pagar.recorrente_origem_id is
    'Conta que gerou esta cobrança ao ser marcada como Paga. Nulo em contas criadas à mão.';

-- Uma origem, no máximo uma sucessora.
create unique index if not exists uniq_contas_pagar_recorrente_origem
    on public.contas_pagar (recorrente_origem_id)
    where recorrente_origem_id is not null;
