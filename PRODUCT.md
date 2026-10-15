# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A equipe interna da Berlim Gráfica, uma gráfica em São Paulo. Cada pessoa entra com um cargo, e cada cargo vê só as telas liberadas para ela:

- **Atendimento** — balcão e WhatsApp: recebe o cliente, abre O.S., faz orçamento, cobra.
- **Produção** — chão da gráfica: toca as O.S. até a entrega e cuida das máquinas.
- **Financeiro** — contas a pagar e a receber, boletos, notas fiscais.
- **Administrador** — acesso completo; o dono acompanha vendas e decide.

As telas liberadas podem ser ajustadas por pessoa, além do padrão do cargo.

## Product Purpose

ERP próprio da gráfica. Concentra num lugar só o que antes vivia em planilha, papel e memória: ordens de serviço e produção, orçamentos, calculadoras de preço, financeiro, vendas e o atendimento por WhatsApp.

Sucesso é a equipe trabalhar a partir do sistema em vez de ao lado dele — e confiar no que ele mostra.

## Operating Context

- Usado no **computador do balcão e do escritório** e no **celular, no chão da produção**. No celular, as ações ficam numa barra fixa no rodapé, ao alcance do polegar.
- Dados em Supabase, atualizados em tempo real entre as pessoas.
- Vocabulário da casa: O.S. (ordem de serviço), etapas da produção (Produzir, Produção, Avisar Cliente, Entrega, Retirada), Futura (gráfica parceira que terceiriza parte dos serviços), baixa (encerrar a O.S.).
- Muitos registros ainda nascem de anotação à mão; trazer esses cadernos para o sistema é parte do trabalho contínuo.

## Capabilities and Constraints

- Next.js (App Router) + React + Tailwind CSS v4 + Supabase. Já existe um sistema visual estabelecido no código (tokens em `app/globals.css`).
- Permissões por tela e por sub-aba, por pessoa (`lib/acesso/telas.js`).
- Mudanças de banco entram como arquivos em `supabase/*.sql`, rodados no SQL Editor do Supabase.
- Valores monetários guardados em centavos.

## Brand Commitments

- Nome: **Berlim Gráfica**.
- Cor da marca: laranja `#F69F00`.
- Fonte: **Montserrat**.
- Tema claro e escuro, ambos de primeira classe.

## Evidence on Hand

- Dados reais de clientes, pedidos, contas e vendas no banco.
- Logo da Berlim Gráfica no projeto.
- Máquinas da gráfica: cadastradas no próprio sistema pelo administrador (nome interno, modelo, tipo, tintas). Sem fotos — a equipe distingue as máquinas pelo nome interno.
- Não há depoimentos, métricas públicas nem material de marketing — e não devem ser inventados.

## Product Principles

1. **Número tem que ser confiável.** Um total que diverge de outro, ou um aviso que diz algo falso, faz a equipe voltar para a planilha. Tudo que soma precisa bater com a fonte.
2. **O sistema se molda à gráfica, não o contrário.** Os fluxos seguem o jeito que a equipe já trabalha; o que é anotado à mão hoje vira tela no formato em que já é anotado.
3. **Cada pessoa vê o que é dela.** Telas, avisos e pendências seguem o cargo e as permissões de quem está logado.
4. **Feito para o lugar onde se usa.** O balcão tem tela larga e tempo; o chão da produção tem um celular, uma mão livre e pressa.
