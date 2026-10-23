---
name: Berlim Gráfica — ERP
description: Sistema interno da gráfica; o padrão nasceu no novo modal de O.S. e nos pré-prontos
colors:
  brand: "#F69F00"
  brand-hover: "#D98B00"
  brand-tinta: "#8A5400"
  sobre-brand: "#241600"
  brand-azul: "#006FB5"
  fundo: "#EDEFF0"
  superficie: "#FFFFFF"
  sutil: "#F9FAFB"
  realce: "#F3F4F6"
  borda-fraca: "#F0F1F3"
  borda: "#E5E7EB"
  borda-forte: "#D1D5DB"
  tinta: "#111827"
  tinta-corpo: "#374151"
  tinta-suave: "#6B7280"
  tinta-fraca: "#9CA3AF"
  perigo: "#DC2626"
  sucesso: "#059669"
  area-dados: "#475569"
  area-itens: "#2563EB"
  area-financeiro: "#059669"
  area-observacoes: "#D97706"
  local-berlim: "#F97316"
  local-futura: "#3B82F6"
typography:
  titulo-tela:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  titulo-destaque:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.018em"
  titulo-area:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 700
    lineHeight: 1.3
  corpo:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  rotulo:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1.4
  numero-grande:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.022em"
    fontFeature: "tnum"
rounded:
  selo: "5px"
  controle: "7px"
  botao: "8px"
  area: "10px"
  janela: "12px"
  pilula: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  botao-primario:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.sobre-brand}"
    rounded: "{rounded.botao}"
    height: "38px"
    padding: "0 16px"
  botao-primario-hover:
    backgroundColor: "{colors.brand-hover}"
  botao-secundario:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.botao}"
    height: "38px"
    padding: "0 16px"
  botao-pequeno:
    rounded: "{rounded.controle}"
    height: "32px"
    padding: "0 12px"
  area:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.area}"
  chip-filtro:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta-corpo}"
    rounded: "{rounded.pilula}"
    height: "30px"
    padding: "0 11px"
  chip-filtro-ativo:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.superficie}"
  selo:
    rounded: "{rounded.selo}"
    padding: "1px 7px"
---

# Design System: Berlim Gráfica — ERP

## Overview

**Creative North Star: "A bancada organizada"**

Uma gráfica funciona sobre bancadas: cada coisa tem lugar, as ferramentas ficam à mão e nada está ali para enfeitar. O sistema segue a mesma ideia. A tela é calma e neutra; a cor só aparece para dizer **onde** está cada coisa (a faixa tingida de cada área) e **o que precisa de atenção** (prazo, horário, cliente problema). O resto é texto bem hierarquizado, números alinhados e controles que só mostram a borda quando a mão chega perto.

O padrão foi estabelecido no novo modal de O.S. (`public/prototipos/novaos.html`, opção B) e confirmado nos pré-prontos (`public/prototipos/preprontos.html`). É o padrão de qualidade para toda tela nova ou refeita. A referência de acabamento é a de ferramentas como Linear e Notion — propriedades editáveis no lugar, atalhos de teclado, popovers em vez de modais —, traduzida para o vocabulário da gráfica.

É uma interface de trabalho (modo Operate): o balcão tem tela larga e tempo, o chão da produção tem um celular e uma mão livre. Toda tela nasce pensando nos dois.

**Key Characteristics:**
- Neutro por padrão; cor com função, nunca decoração.
- Campos sem caixa: só a linha de base, que acende no foco.
- Propriedades editáveis no lugar (clicou, abriu um popover), não formulários.
- Teclado de primeira classe: `/` busca, `↑↓` navega, `Enter` age, `Esc` volta, com dicas em `kbd`.
- Claro e escuro com o mesmo peso.

## Colors

Neutros frios em camadas, um laranja de marca usado com parcimônia e uma pequena família de cores de área que marcam regiões, não conteúdo.

### Primary
- **Laranja Berlim** (#F69F00): a ação principal da tela (um botão primário por contexto), o foco dos campos, a seleção de texto e o cursor. O texto sobre ele é o marrom-escuro **Sobre-marca** (#241600), não branco — branco sobre esse laranja não passa contraste.
- **Laranja-tinta** (#8A5400; #FFB938 no escuro): o laranja quando vira texto — links de ação ("Cadastrar cliente novo"), marcação de selecionado em listas.

### Secondary
- **Azul Berlim** (#006FB5): só na marca ("Gráfica" no logotipo). Não é cor de interface.

### Tertiary — cores de área
Cada área de uma tela tem uma cor que aparece **só** na faixa do cabeçalho (fundo tingido bem claro + ícone) e no foco dos campos dela; o conteúdo embaixo fica neutro.
- **Ardósia — Dados** (#475569): dados gerais, propriedades da O.S.
- **Azul — Itens** (#2563EB): itens, catálogo, o que se produz.
- **Verde — Financeiro** (#059669): pagamentos, totais, quitado.
- **Âmbar — Observações e atenção** (#D97706): observações, horário limite, avisos que não são erro.
- **Local**: Berlim (#F97316) e Futura (#3B82F6) têm cor fixa; os demais locais tiram a cor do nome (`corPorNome`).

### Neutral
- **Fundo** (#EDEFF0): a mesa, atrás de tudo.
- **Superfície** (#FFFFFF): áreas, listas, popovers.
- **Sutil** (#F9FAFB) e **Realce** (#F3F4F6): hover de linha, item selecionado, coluna lateral.
- **Bordas** em três pesos (#F0F1F3 / #E5E7EB / #D1D5DB): divisória entre linhas / contorno de área / linha de base de campo.
- **Tintas** em quatro pesos (#111827 / #374151 / #6B7280 / #9CA3AF): título e valor / corpo / rótulo e meta / dica e placeholder.
- **Perigo** (#DC2626) e **Sucesso** (#059669): só estado — saldo devedor, atrasado, excluir; quitado, copiado, concluído.

### Named Rules
**A Regra da Cor com Endereço.** Toda cor tem que responder "o que isso marca?". Se a resposta for "deixa mais bonito", sai.

**A Regra da Faixa.** A cor de área tinge o cabeçalho da área e mais nada — nunca o corpo inteiro, nunca uma borda lateral grossa.

## Typography

**Fonte:** Montserrat (com system-ui), a fonte da marca, em todas as funções.

**Character:** uma geométrica só, trabalhando por peso e tamanho. Números sempre tabulares para alinhar valores e datas.

### Hierarchy
- **Título de tela** (800, 22px, -0.02em): o nome da tela ("Textos pré-prontos"). Um por tela.
- **Título de destaque** (700, 24px, -0.018em): o objeto principal quando ele é o assunto (o cliente da O.S.). Pode ser um campo editável sem caixa.
- **Título de área** (700, 13.5px): o cabeçalho de cada área.
- **Corpo** (500–600, 13px, 1.5): conteúdo e controles. Valores em 600 e tinta; descrições em 500 e tinta-corpo.
- **Rótulo** (600, 11.5–12.5px, tinta-suave): rótulos de propriedade e de campo, em caixa normal.
- **Número grande** (700, 30px, tabular): o total que decide alguma coisa (total da O.S.).

### Named Rules
**A Regra da Caixa Normal.** Rótulos em caixa normal. Nada de eyebrow/kicker em caixa alta espaçada acima de título.

## Layout

- Telas de lista: conteúdo centrado com largura máxima (≈1120–1320px), respiro lateral de 24–28px no desktop e 12px no celular. Barra de busca grande no topo, filtros em chips logo abaixo, lista agrupada.
- Telas de edição: grade principal + coluna lateral de propriedades (~340px) em fundo Sutil.
- Agrupar por categoria/etapa com cabeçalho de grupo leve (ícone + nome + contagem), não faixa colorida pesada.
- Linhas densas (9–11px de padding vertical); a coluna que cresce é a do conteúdo, as de dado fixo têm a largura do que mostram.
- Abaixo de 760px: uma coluna; colunas laterais viram blocos na ordem de uso; filtros viram faixa rolável na horizontal; a ação principal desce para uma barra fixa no rodapé com alvos de 44px; o que era hover vira sempre visível.
- Ritmo: 4 / 8 / 12 / 16 / 24px. Mais espaço acima de um título do que abaixo.

## Elevation & Depth

Plano por padrão, com profundidade por camadas tonais (Fundo → Superfície → Sutil). Sombra só no que flutua.

### Shadow Vocabulary
- **Leve** (`0 1px 2px rgba(15,23,42,.06)`): item ativo de navegação, ícone de área.
- **Popover** (`0 12px 28px -8px rgba(15,23,42,.24), 0 1px 3px rgba(15,23,42,.08)`): popovers, menus, toast.
- **Janela** (`0 24px 56px -16px rgba(15,23,42,.32), 0 2px 8px rgba(15,23,42,.08)`): modal.

### Named Rules
**A Regra da Borda ou Sombra.** Cada elemento declara a elevação uma vez: borda (áreas, listas) ou sombra (o que flutua). Nunca os dois juntos num cartão.

## Shapes

Cantos suaves e consistentes: selo 5px, controle e popover 7–9px, botão 8px, área e lista 10px, janela 12px; pílula (99px) só para chips de filtro e interruptores. Divisórias de 1px. Nenhuma borda colorida lateral acima de 1px.

## Components

### Buttons
- **Primário:** laranja com texto Sobre-marca, 38px de altura (32px no tamanho pequeno), um por contexto. Hover escurece.
- **Secundário:** superfície com borda forte e texto tinta; hover em Sutil.
- **Texto:** sem fundo, tinta-suave; hover em Realce.
- **Ícone:** 28–30px, só ícone, aparece no hover da linha (sempre visível no celular).
- **Copiado/feito:** o botão vira verde (fundo Sucesso claro, ícone ✓) por ~1,4s em vez de abrir um aviso modal.
- **Perigo:** excluir pede segunda confirmação no próprio botão ("Clique de novo para excluir").

### Campos
- **Linha de base:** sem caixa, só `box-shadow` inferior de 1px (borda forte); hover escurece; foco vira 2px na cor da área (laranja fora de área). Erro: 2px vermelho.
- **Texto longo:** caixa com borda e raio 8px, foco com anel laranja suave.
- **Busca:** caixa de 40–52px com ícone, `kbd /` à direita e botão de limpar quando há texto.

### Propriedades (assinatura)
Lista `rótulo → valor` (rótulo com ícone, 78px; valor em 600). O valor é um botão sem borda que ganha fundo Realce no hover e abre um **popover** com as opções (status com bolinha de cor, pessoas com avatar, datas com atalhos "hoje / amanhã / sex"). Nada de select nativo.

### Áreas
Superfície + borda da cor da área + raio 10px. Cabeçalho tingido com ícone em quadradinho branco, título e meta à direita (contagem, total) na cor da área.

### Chips e selos
- **Chip de filtro:** pílula de 30px com contagem; ativo inverte (fundo tinta, texto superfície).
- **Chip de local:** contorno na cor do local, fundo superfície.
- **Selo:** 5px de raio, 11–12px, para estado curto (prazo, "até 14:00", "Rascunho"). Âmbar = atenção, vermelho = passou.

### Listas
Linha com título em 600 + uma linha de resumo em tinta-suave; meta (prazo, preço) à direita em números tabulares; ações no hover; linha ativa pelo teclado em Realce. Clique abre no lugar (expande) em vez de navegar.

### Popover e toast
Popover em superfície, raio 9px, sombra Popover, entra com 160ms deslizando 4px; itens com hover Realce e ✓ no selecionado. Toast escuro centrado no rodapé, 2,2s, com ícone de ✓ verde.

### Dicas de teclado
`kbd` de 10.5px com borda inferior de 2px, ao lado da ação ("Copiar texto `Enter`") e numa linha de dicas no rodapé da tela.

## Do's and Don'ts

### Do:
- **Do** começar cada tela neutra e só então decidir onde a cor tem trabalho a fazer.
- **Do** editar no lugar: propriedade → popover; linha → expande; balão → vira campo.
- **Do** dar atalho de teclado às ações frequentes e mostrar o atalho.
- **Do** testar toda tela em 390px e no tema escuro antes de dar por pronta.
- **Do** usar números tabulares em datas, horas e valores.
- **Do** mostrar o estado com selo pequeno e palavra ("até 14:00", "editada"), não só com cor.

### Don't:
- **Don't** pintar faixas inteiras de cor saturada (cabeçalhos de grupo, barras de título) — cor de área é tinta clara.
- **Don't** usar texto branco sobre o laranja de marca.
- **Don't** usar select nativo, `alert()` ou modal para escolha simples ou confirmação leve.
- **Don't** colocar borda lateral colorida grossa em cartão, linha ou aviso.
- **Don't** usar caixa alta espaçada em rótulos e títulos.
- **Don't** criar cartões iguais em grade como estrutura de página quando uma lista densa resolve.
