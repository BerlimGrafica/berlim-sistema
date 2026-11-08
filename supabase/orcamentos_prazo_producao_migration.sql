-- ----------------------------------------------------------------------------
-- Prazo de produção do orçamento num campo próprio.
--
-- Antes o prazo ia escrito nas observações, porque o PDF imprime as
-- observações embaixo de "Prazo de Produção:". Misturava as duas coisas: um
-- orçamento com observação de verdade saía com ela no lugar do prazo.
--
-- É texto, não data: o prazo de um orçamento é relativo ("5 dias úteis"),
-- porque só começa a contar quando o cliente aprova. Orçamento antigo, sem o
-- campo, continua imprimindo as observações como prazo (ver PrintLayout).
-- ----------------------------------------------------------------------------

alter table public.orcamentos_formalizados add column if not exists prazo_producao text;

notify pgrst, 'reload schema';
