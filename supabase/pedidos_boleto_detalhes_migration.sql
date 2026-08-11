-- Campos administrativos do boleto, exclusivos da tela Financeiro > Boletos.
-- Não aparecem no modal da O.S. — só o valor e a data de pagamento do próprio
-- pagamento "Boleto" (dentro do bloco [PAGAMENTOS] em pedidos.servico)
-- continuam vinculados/visíveis lá, e esses dois já existem hoje.
alter table public.pedidos add column if not exists boleto_cnpj text;
alter table public.pedidos add column if not exists boleto_numero text;
alter table public.pedidos add column if not exists boleto_data_emissao date;
alter table public.pedidos add column if not exists boleto_protesto_negativacao boolean;
