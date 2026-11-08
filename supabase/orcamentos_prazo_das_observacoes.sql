-- ----------------------------------------------------------------------------
-- Leva o prazo que estava escrito nas observações para o campo prazo_producao.
-- Rodar DEPOIS de orcamentos_prazo_producao_migration.sql. Pode rodar de novo:
-- só mexe em orçamento com o prazo ainda vazio.
--
-- Até o campo existir, o prazo ia nas observações (o PDF as imprimia como
-- "Prazo de Produção:"). Em 07/11/2026 eram 19 orçamentos, e todos tinham só o
-- prazo ali ("5-7 dias úteis", "Prazo de produção: 3-5 dias úteis", "04/09 - 17h").
--
-- O que faz:
--   - o texto vai para prazo_producao, sem o "Prazo de produção:" da frente;
--   - as observações ficam vazias (senão o PDF imprimiria o prazo duas vezes);
--   - a coluna antiga `descricao` guarda uma cópia das observações e, nos
--     orçamentos bem antigos, os itens: ela só é limpa quando é igual ao texto
--     levado. Com os itens dentro ela tem várias linhas e não é tocada.
-- Por segurança, só leva texto de UMA linha e até 80 caracteres: observação
-- maior ou com várias linhas pode ter outra coisa além do prazo, e fica onde
-- está para ser vista à mão.
--
-- O resultado lista os orçamentos que mudaram e o prazo que cada um ganhou.
-- ----------------------------------------------------------------------------

with alvo as (
    select id,
           coalesce(nullif(trim(observacoes), ''), trim(coalesce(descricao, ''))) as texto
    from public.orcamentos_formalizados
    where coalesce(trim(prazo_producao), '') = ''
)
update public.orcamentos_formalizados o
set prazo_producao = trim(regexp_replace(a.texto, '^\s*prazo(\s+de\s+produ[cç][aã]o)?\s*:?\s*', '', 'i')),
    observacoes = '',
    descricao = case when trim(coalesce(o.descricao, '')) = a.texto then '' else o.descricao end
from alvo a
where o.id = a.id
  and a.texto <> ''
  and position(E'\n' in a.texto) = 0
  and length(a.texto) <= 80
returning o.id, o.prazo_producao;
