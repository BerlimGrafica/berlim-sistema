-- ============================================================================
-- Equipamentos: a equipe também organiza as máquinas
-- Rode no SQL Editor do Supabase. É idempotente.
-- ============================================================================
--
-- A primeira versão (equipamentos_migration.sql) deixava só o administrador
-- alterar as máquinas. Na prática quem está ao lado delas é a Produção, e a
-- decisão da gráfica foi: o único passo restrito ao administrador é CADASTRAR
-- uma máquina nova. Reordenar, editar e arquivar ficam com a equipe.
--
-- O que muda é só a política de update — e, com ela, a função
-- reordenar_equipamentos, que é `security invoker` e por isso segue a mesma
-- política. O insert continua só do administrador.
--
-- A conta de demonstração fica de fora: ela é de leitura em todo o sistema.
-- ============================================================================

drop policy if exists "equipamentos_update" on public.equipamentos;
create policy "equipamentos_update" on public.equipamentos
    for update to authenticated
    using (public.nivel_atual() in ('Administrador', 'Atendimento', 'Produção', 'Financeiro'))
    with check (public.nivel_atual() in ('Administrador', 'Atendimento', 'Produção', 'Financeiro'));
