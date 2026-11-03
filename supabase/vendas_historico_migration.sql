-- ----------------------------------------------------------------------------
-- Faturamento de antes do sistema (tabela vendas_historico).
--
-- O sistema começou a registrar vendas em agosto de 2026. O que foi vendido
-- antes existe só como um total por mês, numa planilha. Lançar esse total como
-- O.S. ("uma O.S. de R$ 80 mil sem cliente por mês") estragaria tudo que lê
-- O.S.: ranking de clientes, ticket médio, a receber, produtos, relatório do
-- dia. Por isso o histórico fica aqui, à parte: um número por mês, e só as
-- leituras de tendência (faturamento no tempo, comparativo de ano) o somam.
-- Ver metricas_vendas_migration.sql.
--
-- mes            primeiro dia do mês (2025-03-01 = março de 2025)
-- valor_centavos o faturamento do mês, em centavos, como no resto do sistema
-- origem         de onde veio o número ('planilha')
--
-- A partir de agosto de 2026 o número sai das O.S.: a trava abaixo impede
-- lançar aqui um mês que o sistema já conta, para nada entrar duas vezes.
--
-- Leitura para todo logado (é o mesmo alcance de pedidos.valor_total). Escrita
-- só por Administrador; a importação roda no SQL Editor, que ignora a RLS.
--
-- Os valores em si NÃO ficam neste arquivo: vão em vendas_historico_dados.sql,
-- fora do git (é faturamento real da gráfica).
-- ----------------------------------------------------------------------------

create table if not exists public.vendas_historico (
    mes date primary key,
    valor_centavos bigint not null,
    origem text not null default 'planilha',
    observacao text,
    criado_em timestamptz not null default now(),
    constraint vendas_historico_valor_positivo check (valor_centavos >= 0),
    constraint vendas_historico_primeiro_dia check (extract(day from mes) = 1),
    constraint vendas_historico_antes_do_sistema check (mes < date '2026-08-01')
);

alter table public.vendas_historico enable row level security;

drop policy if exists "vendas_historico_select" on public.vendas_historico;
drop policy if exists "vendas_historico_write" on public.vendas_historico;
create policy "vendas_historico_select" on public.vendas_historico for select to authenticated using (true);
create policy "vendas_historico_write" on public.vendas_historico for all to authenticated
  using (nivel_atual() = 'Administrador')
  with check (nivel_atual() = 'Administrador');

revoke all on public.vendas_historico from public, anon;
grant select, insert, update, delete on public.vendas_historico to authenticated;

notify pgrst, 'reload schema';
