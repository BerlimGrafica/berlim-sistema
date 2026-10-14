-- ============================================================================
-- Equipamentos: as máquinas e o histórico de reabastecimento e manutenção
-- Rode no SQL Editor do Supabase. É idempotente.
-- ============================================================================
--
-- PROBLEMA
-- O histórico de cada impressora vivia numa folha de papel pendurada nela:
-- data, cor reabastecida, contador de páginas, o que foi feito na manutenção.
-- A folha só pode ser lida de pé ao lado da máquina, não soma nada sozinha, e
-- quando enche ou some, o histórico vai junto.
--
-- SOLUÇÃO
-- Duas tabelas: as máquinas (equipamentos) e os registros de cada uma
-- (equipamento_registros), um por linha da antiga folha.
--
-- AS MÁQUINAS
-- Cadastradas pela tela, pelo administrador: nome interno (o que a equipe usa
-- para distinguir duas máquinas iguais), modelo, tipo, se é colorida ou
-- monocromática e quais tintas ela recebe. O tipo define o grupo em que a
-- máquina aparece na tela; `ordem` é a posição dela dentro do grupo.
--
-- Máquina não se apaga: arquiva-se. O histórico dela continua sendo um fato —
-- quanto rendeu cada carga, o que foi consertado — e some da tela só a
-- máquina. Por isso não há política de delete, e a chave estrangeira dos
-- registros é `restrict`.
--
-- Dois nomes iguais entre as máquinas em uso trariam de volta a confusão que o
-- nome interno resolve, então o banco recusa — sem diferenciar maiúsculas nem
-- espaços nas pontas. Uma máquina arquivada libera o nome.
--
-- OS REGISTROS
-- O check `tipo_coerente` garante, no banco, o que a tela também exige: um
-- reabastecimento sem cor ou uma manutenção sem descrição não diz nada a quem
-- ler o histórico depois.
--
-- Quem registrou pode apagar o próprio registro (corrigir um engano é
-- frequente, e não deve depender do administrador). Por isso `criado_por` é
-- preenchido pelo banco e o insert só passa se for o próprio usuário.
--
-- ORIGEM
-- Substitui as duas migrações da primeira versão da tela, em que as máquinas
-- moravam no código e só o nome interno ficava no banco
-- (equipamento_nomes). As seis WorkForce cadastradas naquela versão entram
-- aqui já com os nomes que receberam; a tabela de nomes deixa de ser usada e
-- é removida no fim.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Máquinas
-- ---------------------------------------------------------------------------

create table if not exists public.equipamentos (
    id           bigint generated always as identity primary key,
    nome         text        not null check (length(trim(nome)) between 1 and 40),
    nome_chave   text        generated always as (lower(trim(nome))) stored,
    modelo       text        check (modelo is null or length(modelo) <= 60),
    tipo         text        not null check (tipo in ('jato_pigmentada', 'jato_corante', 'laser', 'eco_solvente', 'latex', 'uv')),
    cromia       text        not null check (cromia in ('cor', 'mono')),
    cores        text[]      not null,
    ordem        integer     not null default 0,
    arquivado_em timestamptz,
    criado_em    timestamptz not null default now(),
    -- As tintas vêm de uma lista fechada (a mesma de lib/equipamentos/catalogo.js).
    -- Monocromática recebe só preto; colorida, ao menos uma tinta da lista.
    constraint equipamentos_cores_validas check (
        cores <@ array['preto', 'branco', 'amarelo', 'ciano', 'magenta', 'light-magenta',
                       'light-ciano', 'preto-medio', 'preto-fotografico', 'optimizer', 'verniz']
    ),
    constraint equipamentos_cromia_coerente check (
        (cromia = 'mono' and cores = array['preto'])
        or (cromia = 'cor' and coalesce(array_length(cores, 1), 0) > 0)
    )
);

create unique index if not exists equipamentos_nome_em_uso_unico
    on public.equipamentos (nome_chave) where arquivado_em is null;

alter table public.equipamentos enable row level security;

grant select, insert, update on public.equipamentos to authenticated;

drop policy if exists "equipamentos_select" on public.equipamentos;
create policy "equipamentos_select" on public.equipamentos
    for select to authenticated using (true);

drop policy if exists "equipamentos_insert" on public.equipamentos;
create policy "equipamentos_insert" on public.equipamentos
    for insert to authenticated with check (public.nivel_atual() = 'Administrador');

drop policy if exists "equipamentos_update" on public.equipamentos;
create policy "equipamentos_update" on public.equipamentos
    for update to authenticated
    using (public.nivel_atual() = 'Administrador')
    with check (public.nivel_atual() = 'Administrador');

-- Reordenar um grupo é gravar a posição de várias máquinas de uma vez. Numa
-- função só, a nova ordem entra inteira ou não entra — sem um grupo meio
-- reordenado se a conexão cair no meio. `security invoker`: a política de
-- update acima continua valendo, e quem não é administrador não altera nada.
create or replace function public.reordenar_equipamentos(ids bigint[])
returns void
language sql
security invoker
set search_path = public
as $$
    update public.equipamentos e
       set ordem = o.posicao
      from unnest(ids) with ordinality as o(id, posicao)
     where e.id = o.id;
$$;

grant execute on function public.reordenar_equipamentos(bigint[]) to authenticated;

-- As seis WorkForce da primeira versão. Só entram numa tabela vazia, para que
-- rodar a migração de novo não as duplique.
insert into public.equipamentos (nome, modelo, tipo, cromia, cores, ordem)
select nome, modelo, 'jato_pigmentada', 'cor', array['preto', 'amarelo', 'ciano', 'magenta'], ordem
  from (values
      ('Workforce - 01', 'WorkForce Pro WF-C579R', 1),
      ('Workforce - 02', 'WorkForce Pro WF-C5790', 2),
      ('Workforce - 03', 'WorkForce Pro WF-C5790', 3),
      ('Workforce - 04', 'WorkForce Pro WF-C5390', 4),
      ('Workforce - 05', 'WorkForce Pro WF-C5390', 5),
      ('Workforce - 06', 'WorkForce Pro WF-C5810', 6)
  ) as m(nome, modelo, ordem)
 where not exists (select 1 from public.equipamentos);

-- ---------------------------------------------------------------------------
-- Registros
-- ---------------------------------------------------------------------------

create table if not exists public.equipamento_registros (
    id          bigint generated always as identity primary key,
    equipamento bigint      not null references public.equipamentos (id) on delete restrict,
    tipo        text        not null check (tipo in ('Reabastecimento', 'Manutenção')),
    data        date        not null default current_date,
    -- Contador de páginas lido no painel da máquina. A tela avisa quando ele é
    -- menor que o último registrado, mas não impede — o contador pode ter sido
    -- zerado num reparo.
    contador    integer     check (contador is null or contador >= 0),
    cores       text[],
    descricao   text,
    criado_por  uuid        default auth.uid() references auth.users (id) on delete set null,
    criado_em   timestamptz not null default now(),
    constraint equipamento_registros_tipo_coerente check (
        (tipo = 'Reabastecimento' and coalesce(array_length(cores, 1), 0) > 0)
        or (tipo = 'Manutenção' and length(trim(coalesce(descricao, ''))) > 0)
    )
);

-- Na primeira versão a coluna `equipamento` era texto, com o identificador da
-- máquina no catálogo do código. Aqui ela vira referência à tabela de
-- máquinas. A conversão só é segura com a tabela vazia — e ela estava vazia
-- quando esta migração foi escrita; se não estiver, a migração para em vez de
-- adivinhar a qual máquina nova cada registro antigo pertence.
do $$
begin
    if exists (
        select 1 from information_schema.columns
         where table_schema = 'public' and table_name = 'equipamento_registros'
           and column_name = 'equipamento' and data_type = 'text'
    ) then
        if exists (select 1 from public.equipamento_registros) then
            raise exception 'equipamento_registros já tem linhas com a máquina em texto; converta-as antes de rodar esta migração.';
        end if;
        alter table public.equipamento_registros
            alter column equipamento type bigint using equipamento::bigint;
        alter table public.equipamento_registros
            add constraint equipamento_registros_equipamento_fkey
            foreign key (equipamento) references public.equipamentos (id) on delete restrict;
    end if;
end $$;

-- A tela lê por máquina, do mais recente para o mais antigo.
create index if not exists equipamento_registros_maquina_data_idx
    on public.equipamento_registros (equipamento, data desc, id desc);

alter table public.equipamento_registros enable row level security;

grant select, insert, delete on public.equipamento_registros to authenticated;

drop policy if exists "equipamento_registros_select" on public.equipamento_registros;
create policy "equipamento_registros_select" on public.equipamento_registros
    for select to authenticated using (true);

drop policy if exists "equipamento_registros_insert" on public.equipamento_registros;
create policy "equipamento_registros_insert" on public.equipamento_registros
    for insert to authenticated with check (criado_por = auth.uid());

drop policy if exists "equipamento_registros_delete" on public.equipamento_registros;
create policy "equipamento_registros_delete" on public.equipamento_registros
    for delete to authenticated
    using (criado_por = auth.uid() or public.nivel_atual() = 'Administrador');

-- Sem política de update, de propósito: um registro é um fato com data. Para
-- corrigir, apaga-se e registra-se de novo.

-- ---------------------------------------------------------------------------
-- Limpeza da primeira versão
-- ---------------------------------------------------------------------------

drop table if exists public.equipamento_nomes;
