-- ============================================================================
-- Berlim Sistema — dinheiro em centavos (inteiro) nas colunas financeiras.
-- Rode este arquivo no SQL Editor do Supabase (Dashboard > SQL Editor).
--
-- Por quê: as colunas abaixo guardavam reais em ponto flutuante (numeric/float),
-- fonte clássica de erro de arredondamento em sistema financeiro. Passam a
-- guardar centavos como inteiro. O código do app (context/AppContext.jsx e os
-- componentes que leem/gravam essas colunas) já foi ajustado nesta mesma leva
-- de mudanças — rode este SQL bem na hora em que o deploy do código novo
-- terminar de publicar, pra minimizar a janela em que os dois lados ficam
-- temporariamente fora de sincronia (sem risco de perda de dado, só uns
-- segundos/minutos de valor 100x errado na tela pra quem estiver com a
-- página aberta).
--
-- Escopo: só as colunas numéricas reais abaixo. NÃO mexe em valores dentro de
-- JSON embutido em coluna de texto (itens/pagamentos guardados dentro de
-- pedidos.servico via "[ITENS_JSON]"/"[PAGAMENTOS]") — esses continuam em reais.
--
-- Idempotente: cada bloco só converte se a coluna ainda não for integer —
-- seguro rodar de novo sem duplicar a conversão.
-- ============================================================================

do $$
begin
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'pedidos' and column_name = 'valor_total') <> 'integer' then
    alter table public.pedidos alter column valor_total type integer using round(valor_total * 100)::integer;
  end if;
end $$;

do $$
begin
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'orcamentos_formalizados' and column_name = 'valor') <> 'integer' then
    alter table public.orcamentos_formalizados alter column valor type integer using round(valor * 100)::integer;
  end if;
end $$;

do $$
begin
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'contas_pagar' and column_name = 'valor') <> 'integer' then
    alter table public.contas_pagar alter column valor type integer using round(valor * 100)::integer;
  end if;
end $$;

do $$
begin
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'notas_fiscais' and column_name = 'valor_pago') <> 'integer' then
    alter table public.notas_fiscais alter column valor_pago type integer using round(valor_pago * 100)::integer;
  end if;
end $$;

do $$
begin
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'produtos' and column_name = 'preco_base') <> 'integer' then
    alter table public.produtos alter column preco_base type integer using round(preco_base * 100)::integer;
  end if;
end $$;

do $$
begin
  if (select data_type from information_schema.columns where table_schema = 'public' and table_name = 'links_pagamento' and column_name = 'valor') <> 'integer' then
    alter table public.links_pagamento alter column valor type integer using round(valor * 100)::integer;
  end if;
end $$;
