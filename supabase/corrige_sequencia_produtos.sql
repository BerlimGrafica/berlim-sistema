-- ============================================================================
-- Catálogo voltando a numerar em sequência (ids de 5 dígitos)
-- Rode no SQL Editor do Supabase. É seguro e pode rodar mais de uma vez.
-- ============================================================================
--
-- O catálogo vinha numerando 1, 2, 3 … até 98, e os dois produtos seguintes
-- receberam 98018 e 98019. O sistema nunca envia o id — salvarProduto() e
-- duplicarProduto() (context/AppContext.jsx) mandam só nome, texto_padrao,
-- preco_base e ordem. Quem numera é o Postgres, com nextval() na sequência da
-- coluna. O salto está na sequência, não no código.
--
-- Nenhuma migration deste repositório mexe em id ou sequência de produtos, e
-- nenhuma outra tabela do banco tem id perto de 98 mil (a maior é pedidos, em
-- 18.396) — ou seja, a sequência é só do catálogo e ninguém mais depende dela.
-- O salto veio de alguma operação feita fora do código, direto no painel:
-- importação de CSV, duplicação de tabela ou restore.
--
-- A linha abaixo devolve a contagem para 98, de modo que o próximo produto
-- cadastrado receba 99. O filtro `id < 1000` é o ponto todo: com max(id) puro
-- a contagem voltaria para 98019 e nada mudaria.
-- ----------------------------------------------------------------------------

select setval(
    pg_get_serial_sequence('public.produtos', 'id'),
    (select max(id) from public.produtos where id < 1000)
);

-- Deve devolver: 98
-- ----------------------------------------------------------------------------
--
-- Os ids 99 até 98017 estão livres, então os próximos ~98 mil cadastros nunca
-- esbarram em 98018/98019.
--
-- Os dois produtos com id grande ficam como estão, de propósito: um item de
-- O.S. já aponta para um deles (pedido_itens.produto_id é FK para produtos.id),
-- e trocar o id do pai exigiria derrubar e recriar essa constraint em produção.
-- O id é interno, não aparece em tela nem no PDF.
