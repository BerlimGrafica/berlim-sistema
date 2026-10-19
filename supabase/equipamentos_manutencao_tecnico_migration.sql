-- ============================================================================
-- Equipamentos: técnico e valor da manutenção
-- Rode no SQL Editor do Supabase, como o usuário padrão (postgres). É idempotente.
-- ============================================================================
--
-- PROBLEMA
-- O registro de manutenção dizia o que foi feito e o contador, mas não quem
-- fez nem quanto custou — justamente o que se procura depois: "quanto já
-- gastamos com a C5790?", "quem trocou a cabeça da última vez?".
--
-- SOLUÇÃO
-- Duas informações a mais na manutenção, as duas opcionais (manutenção feita
-- pela própria equipe não tem técnico nem custo):
--
-- - o técnico, escolhido entre os fornecedores do tipo Manutenção (Cadastros ›
--   Fornecedores / Locais). Guarda-se o id E o nome: se o fornecedor for
--   renomeado ou apagado, o histórico continua dizendo quem fez na época.
-- - o valor, em centavos, como todo dinheiro no sistema.
--
-- O valor fica só no histórico da máquina: não gera conta a pagar. O
-- Financeiro continua lançando a conta como sempre, sem risco de duplicar.
--
-- QUEM VÊ OS TÉCNICOS
-- A tabela de fornecedores só é lida por Administrador e Financeiro (contato e
-- observações são dados do Financeiro). Quem registra a manutenção é a
-- Produção, então ela lê uma vista com só id e nome dos técnicos — o mesmo
-- arranjo de fornecedores_terceirizacao_nomes. A vista roda com os
-- privilégios do dono (security_invoker = false), por isso precisa ser criada
-- pelo usuário padrão do SQL Editor; o WHERE é quem filtra as linhas.
-- ============================================================================

create or replace view public.fornecedores_manutencao_nomes
    with (security_invoker = false) as
    select id, nome from public.fornecedores
    where tipo = 'Manutenção';

revoke all on public.fornecedores_manutencao_nomes from anon;
grant select on public.fornecedores_manutencao_nomes to authenticated;

alter table public.equipamento_registros
    add column if not exists tecnico_id     bigint references public.fornecedores (id) on delete set null,
    add column if not exists tecnico_nome   text,
    add column if not exists valor_centavos integer check (valor_centavos is null or valor_centavos >= 0);

-- Técnico e valor só fazem sentido numa manutenção; num reabastecimento
-- ficariam soltos, sem dizer a que se referem.
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'equipamento_registros_tecnico_so_manutencao'
    ) then
        alter table public.equipamento_registros
            add constraint equipamento_registros_tecnico_so_manutencao check (
                tipo = 'Manutenção'
                or (tecnico_id is null and tecnico_nome is null and valor_centavos is null)
            );
    end if;
end $$;
