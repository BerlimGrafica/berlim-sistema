-- ============================================================================
-- Berlim Sistema — telas liberadas por usuário.
-- Rode este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor)
-- DEPOIS de rls_and_auth_migration.sql. É seguro rodar de novo.
--
-- O que muda: profiles ganha uma coluna com a lista de telas daquela pessoa.
--   NULL  -> segue o padrão do cargo (é o estado de todo mundo hoje, e é o
--            que faz esta migração NÃO alterar o acesso de ninguém)
--   array -> lista própria, que substitui o padrão do cargo
--
-- A lista é plana e guarda os dois níveis de navegação, com os ids de
-- lib/acesso/telas.js:
--   'financeiro'          -> a tela
--   'financeiro:boletos'  -> uma sub-aba dela
--
-- Telas: inicio, producao, baixa, calculadoras, financeiro, vendas,
--        notas-fiscais, orcamentos, cadastros, comunicacao
--
-- Não há checagem dos ids aqui de propósito: o catálogo muda no código, e uma
-- lista repetida numa constraint viraria a primeira coisa a ficar desatualizada
-- — travando o cadastro por causa de uma tela nova. Quem peneira é
-- normalizarTelas(), na rota /api/usuarios, que descarta id desconhecido e
-- sub-aba órfã antes de gravar.
-- ============================================================================

alter table public.profiles add column if not exists telas text[];

comment on column public.profiles.telas is
  'Telas liberadas para este usuário (ids de lib/acesso/telas.js). NULL = herda o padrão do cargo.';

-- Lista vazia não existe: "sem nenhuma tela" seria uma conta que entra e não
-- tem para onde ir. Quem quer voltar ao padrão do cargo grava NULL.
alter table public.profiles drop constraint if exists profiles_telas_nao_vazio;
alter table public.profiles add constraint profiles_telas_nao_vazio
  check (telas is null or cardinality(telas) > 0);

-- Nada a fazer em RLS: a policy profiles_admin_write já cobre a coluna nova
-- (ela é "for all"), e a criação/edição de usuários passa pela rota
-- /api/usuarios, que valida o nível do chamador no servidor.
