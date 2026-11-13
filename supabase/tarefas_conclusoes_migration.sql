-- Rotinas: cada vez que alguém faz a tarefa de todo dia vira uma linha aqui,
-- com o dia, a hora e quem fez.
--
-- Antes, a rotina guardava só o último dia (tarefas_internas.ultima_conclusao):
-- dava para saber se a de hoje já tinha sido feita, mas não quantas vezes, a que
-- horas nem por quem, e nada disso aparecia em Concluídas. A rotina continua
-- disponível o dia inteiro: cada clique em "Fiz" acrescenta uma linha.
--
-- Mesmas regras de acesso das tarefas (demo_role_migration.sql): todos leem;
-- o acesso de demonstração não grava. Não apaga nem muda nada que já existe.
-- Pode rodar mais de uma vez.

create table if not exists public.tarefas_conclusoes (
    id bigint generated always as identity primary key,
    tarefa_id bigint not null references public.tarefas_internas(id) on delete cascade,
    concluida_em timestamptz not null default now(),
    concluida_por text not null default ''
);

-- Concluídas lê por período (o mais recente primeiro); a lista de hoje, por tarefa.
create index if not exists tarefas_conclusoes_em_idx on public.tarefas_conclusoes (concluida_em desc);
create index if not exists tarefas_conclusoes_tarefa_idx on public.tarefas_conclusoes (tarefa_id, concluida_em desc);

alter table public.tarefas_conclusoes enable row level security;
drop policy if exists "conclusoes_select" on public.tarefas_conclusoes;
drop policy if exists "conclusoes_insert" on public.tarefas_conclusoes;
drop policy if exists "conclusoes_delete" on public.tarefas_conclusoes;
create policy "conclusoes_select" on public.tarefas_conclusoes for select to authenticated using (true);
create policy "conclusoes_insert" on public.tarefas_conclusoes for insert to authenticated with check (nivel_atual() <> 'demo');
-- Apagar é o "Desfazer" logo depois do clique.
create policy "conclusoes_delete" on public.tarefas_conclusoes for delete to authenticated using (nivel_atual() <> 'demo');
