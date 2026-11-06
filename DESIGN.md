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
  serie-1: "#2A78D6"
  serie-2: "#EB6834"
  serie-3: "#1BAF7A"
  serie-4: "#EDA100"
  serie-5: "#E87BA4"
  serie-6: "#008300"
  serie-7: "#6250D6"
  serie-8: "#E34948"
  forma-pix: "#10B981"
  forma-credito: "#6366F1"
  forma-debito: "#0EA5E9"
  forma-link: "#C525C6"
  forma-dinheiro: "#F59E0B"
  forma-deposito: "#A04A10"
  forma-boleto: "#64748B"
  forma-estorno: "#EF4444"
  categoria-despesa: "#10B981"
  categoria-material: "#3B82F6"
  categoria-manutencao: "#F59E0B"
  categoria-terceirizacao: "#A855F7"
  categoria-impostos: "#F43F5E"
  processo-ciano: "#00AEEF"
  processo-magenta: "#EC008C"
  processo-amarelo: "#FFF200"
  processo-preto: "#231F20"
  logo-amarelo: "#F9AE1F"
  logo-laranja: "#F4701D"
  marca-1: "#0F2A45"
  marca-2: "#0A1C2E"
  marca-3: "#06111D"
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
  titulo-linha:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
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
  popover: "9px"
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

O padrão foi estabelecido no novo modal de O.S. (`public/prototipos/novaos.html`, opção B, em `/novaos`), confirmado nos pré-prontos (`public/prototipos/preprontos.html`, `/preprontos`) e na nova Produção (`public/prototipos/producao.html`, `/novaproducao`). É o padrão de qualidade para toda tela nova ou refeita — o objetivo é redesenhar o sistema inteiro nele.

A versão navegável deste documento, com cada componente em prévia ao vivo nos dois temas, é o design system **Berlim Gráfica ERP**: https://claude.ai/artifact/XSDkYFRAtdfGi6XBwcMdBi (privado; compartilhe pelo menu da página). Os dois dizem a mesma coisa: ao mudar um, mude o outro. A referência de acabamento é a de ferramentas como Linear e Notion — propriedades editáveis no lugar, atalhos de teclado, popovers em vez de modais —, traduzida para o vocabulário da gráfica.

É uma interface de trabalho (modo Operate): o balcão tem tela larga e tempo, o chão da produção tem um celular e uma mão livre. Toda tela nasce pensando nos dois.

**Key Characteristics:**
- Neutro por padrão; cor com função, nunca decoração.
- Campos sem caixa: só a linha de base, que acende no foco.
- Propriedades editáveis no lugar (clicou, abriu um popover), não formulários.
- Teclado de primeira classe: `/` busca, `↑↓` navega, `Enter` age, `Esc` volta, com dicas em `kbd`.
- Claro e escuro com o mesmo peso.
- Texto enxuto: rótulo curto e apoio que referencia, não explica (ver **A Regra do Texto que Aponta**).

## Colors

Neutros frios em camadas, um laranja de marca usado com parcimônia e uma pequena família de cores de área que marcam regiões, não conteúdo.

### Primary
- **Laranja Berlim** (#F69F00): a ação principal da tela (um botão primário por contexto), o foco dos campos, a seleção de texto e o cursor. O texto sobre ele é o marrom-escuro **Sobre-marca** (#241600), não branco — branco sobre esse laranja não passa contraste.
- **Laranja-tinta** (#8A5400; #FFB938 no escuro): o laranja quando vira texto — links de ação ("Cadastrar cliente novo"), marcação de selecionado em listas.

### Secondary
- **Azul Berlim** (#006FB5): só na marca ("Gráfica" no logotipo). Não é cor de interface.
- **Cores do logo** (`logo-amarelo` #F9AE1F, `logo-laranja` #F4701D): as duas do ícone, iguais nos dois temas. Só no próprio logo e na espera. Não são cor de interface.

### Tertiary — cores de área
Cada área de uma tela tem uma cor que aparece **só** na faixa do cabeçalho (fundo tingido bem claro + ícone) e no foco dos campos dela; o conteúdo embaixo fica neutro.
- **Ardósia — Dados** (#475569): dados gerais, propriedades da O.S.
- **Azul — Itens** (#2563EB): itens, catálogo, o que se produz.
- **Verde — Financeiro** (#059669): pagamentos, totais, quitado.
- **Âmbar — Observações e atenção** (#D97706): observações, horário limite, avisos que não são erro.
- **Local**: Berlim (#F97316) e Futura (#3B82F6) têm cor fixa; os demais locais tiram a cor do nome (`corPorNome`).

### Séries — fatias e linhas de gráfico
Quem já tem cor no sistema usa a dela: etapa, local, pessoa, **forma de pagamento** (PIX #10B981, crédito #6366F1, débito #0EA5E9, link #C525C6, dinheiro #F59E0B, depósito #A04A10, boleto #64748B, estorno #EF4444) e **categoria de conta** (despesa #64748B, material #2A78D6, manutenção #EB6834, terceirização #6250D6, impostos #E87BA4 — fonte única em `CATEGORIAS_CONTA`; a paleta evita vermelho, âmbar e verde, que já dizem vencido, amanhã e valor; na lista, uma bolinha da cor ao lado do nome, como a dos locais terceiros). Para o que não tem cor (cliente, produto, instituição), oito cores em ordem fixa, validadas para quem não distingue cores (tokens `serie-1` a `serie-8`, com tom próprio no escuro): azul #2A78D6, laranja #EB6834, verde-água #1BAF7A, amarelo #EDA100, rosa #E87BA4, verde #008300, violeta #6250D6, vermelho #E34948.
- Num ranking dos maiores (5 clientes, 5 produtos), as cores vão nessa ordem.
- Num gráfico em que se tira e põe item (as linhas de produtos de Vendas), a cor fica com o item enquanto ele estiver lá: tirar um não repinta os outros.
- No máximo oito de uma vez, sem repetir cor. Passou disso, o resto vira "os demais", em `borda-forte`.
- A cor marca a fatia e a bolinha; o texto (nome, valor, %) fica sempre nas tintas.

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

**A Regra do Texto que Aponta.** Texto de apoio aponta, não explica. O rótulo diz o assunto em duas ou três palavras ("A receber", não "A receber nas O.S. abertas"), e o que a própria tela já deixa claro fica de fora. Embaixo de um número vai só a referência que o situa — "média/dia R$ 4.249", "0% de outubro · R$ 101.720", "26 O.S." —, nunca a frase que conta o que ele é ("média de R$ 4.249 por dia com venda", "R$ 1.330 já prontos para cobrar"). Quando a frase inteira ajuda, ela vai na dica (`title`) do próprio elemento: não some, só sai da frente.

## Layout

- Telas de lista: conteúdo centrado com largura máxima (≈1120–1320px), respiro lateral de 24–28px no desktop e 12px no celular. Barra de busca grande no topo, filtros em chips logo abaixo, lista agrupada.
- Telas de edição: grade principal + coluna lateral de propriedades (~340px) em fundo Sutil.
- Agrupar por categoria/etapa com cabeçalho de grupo leve (ícone + nome + contagem), não faixa colorida pesada.
- Linhas densas (9–11px de padding vertical); a coluna que cresce é a do conteúdo, as de dado fixo têm a largura do que mostram.
- Abaixo de 760px: uma coluna; colunas laterais viram blocos na ordem de uso; filtros viram faixa rolável na horizontal; a ação principal desce para uma barra fixa no rodapé com alvos de 44px; o que era hover vira sempre visível.
- **A ação principal nunca some com a rolagem.** No computador, a faixa de filtros gruda logo abaixo do cabeçalho do sistema (`top: var(--altura-cabecalho)`) e, quando gruda, recebe o botão primário compacto; o cabeçalho da tabela gruda logo abaixo dela. No celular, quem garante é a barra do rodapé, e a faixa rola junto para não somar mais uma camada às barras do sistema. Nada de botão flutuante redondo no computador: ele cobre a coluna de ações das linhas.
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

Cantos suaves e consistentes: selo 5px, controle e popover 7–9px, botão 8px, área e lista 10px, janela 12px; pílula (99px) só para chips de filtro e interruptores. Divisórias de 1px. Nenhuma borda colorida lateral acima de 1px, com uma exceção: o **filete de prioridade** (ver **Selos de prazo e horário**).

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
- **Selo:** 5px de raio, 11–12px, para estado curto (prazo, "até 14:00", "Rascunho"). Âmbar = atenção (vence amanhã), vermelho = passou, vence hoje ou está devendo.

### Listas
Linha com o título (a informação principal: cliente, conta, produto) em `titulo-linha`, 14px e 600 — um ponto acima do corpo, para ser a primeira coisa que o olho acha (o nome do cliente na Produção e nas baixadas fica em 700) — + uma linha de resumo em tinta-suave; meta (prazo, preço) à direita em números tabulares; **ações da linha sempre à mostra** na ponta direita, nunca escondidas até o hover: botões de ícone de 30px em tinta-fraca (hover Realce), o de concluir/pagar em verde, que no primeiro clique vira a pergunta ("Concluir?", "Pagar?") e no segundo confirma — o mesmo da nova Produção; linha já concluída guarda o lugar sem o botão; linha ativa pelo teclado em Realce. Clique abre no lugar (expande) em vez de navegar.

### Popover e toast
Popover em superfície, raio 9px, sombra Popover, entra com 160ms deslizando 4px; itens com hover Realce e ✓ no selecionado. Toast escuro centrado no rodapé, 2,2s, com ícone de ✓ verde.

### Dicas de teclado
`kbd` de 10.5px com borda inferior de 2px, ao lado da ação ("Copiar texto `Enter`") e numa linha de dicas no rodapé da tela. Atalhos do sistema: `/` busca · `↑` `↓` navega · `Enter` age · `Esc` fecha ou limpa · `N` novo (item, O.S., texto) · `P` pagamento · `Ctrl S` salva. Letra só vale fora de campo de texto.

### Abas de filtro
O recorte principal de uma lista vira abas com contagem (Todas, Atrasadas, Hoje…) sobre a linha que separa o cabeçalho da lista; um traço `brand` de 2px desliza até a aba ativa (.34s). A contagem da aba ativa fica em `tinta`; a de alerta (Atrasadas) fica em `perigo` mesmo inativa. Ações da lista (recolher todas) entram na ponta direita como ícone com dica. No celular a faixa rola na horizontal, vai sozinha até a aba ativa e esmaece as bordas quando há mais abas. Busca e o botão primário ficam no cabeçalho, à direita do título — nunca na mesma linha das abas, com uma exceção: no computador a faixa gruda no topo ao rolar e, presa, recebe o botão primário compacto (32px, com `kbd`) na ponta direita, no mesmo lugar onde estava o botão grande. Ele entra deslizando 10px e o ícone de recolher escorrega para abrir espaço. Trocar de aba com a faixa presa leva ao começo da lista nova, logo abaixo da faixa. A lista nova entra do lado da aba escolhida (24px e esmaecendo, .3s), na mesma direção em que o traço anda; cabeçalho, faixa e títulos das colunas ficam parados. Se a aba precisa buscar no banco, quem entra primeiro são as linhas de espera (ver **Espera**).

### Filtro de período
Toda lista que filtra por data usa o **mesmo botão de período** (ícone de calendário, nome do período e seta), na linha da busca. Ele abre um popover com os atalhos à esquerda — Todo o período, Este mês, Mês passado, Últimos 30 dias, Este ano — e um calendário de intervalo à direita: o primeiro clique marca o início, o segundo o fim, e o título leva aos meses e aos anos. **Próximo mês** só entra onde a data pode estar no futuro (vencimento de conta e de boleto). A dica do botão diz por qual data ele filtra ("Filtrar pelo vencimento").

Nada de setas de mês, seletor próprio de uma tela ou campo de data nativo. Uma tela só foge do padrão quando o calendário é o próprio conteúdo (os calendários de vendas e de contas a pagar). O período inicial é o que a pessoa procura ali: Este mês para vencimentos, Este ano para o que ainda se cobra. E o que importa não some por estar fora do período: uma linha logo abaixo da busca avisa "Mais 1 conta vencida de antes de 01/11 · Ver todo o período".

### Lista agrupada
Cabeçalho de grupo leve (seta, bolinha da etapa, nome, contagem e alerta "x atrasadas"), lista densa em `superficie` com borda. Abrir/fechar o grupo troca só uma classe (grid `1fr → 0fr`, .36s) sem redesenhar a lista; "Recolher todas" faz o mesmo em todos. Grupos recolhidos não são guardados entre visitas. Linha que muda de grupo desliza até o lugar novo (FLIP). Ordem dentro do grupo: prazo, depois horário limite.

### Gaveta de detalhe
Clicar numa linha abre a gaveta: no computador desliza da borda direita (até 460px, fundo `fundo`, `sombra-janela`, véu atrás); no celular sobe de baixo como folha (88% da altura). Entra sem pressa, desacelerando (.46s), e fecha — X, `Esc` ou clique no véu — pelo mesmo caminho, um pouco mais rápida e acelerando para fora (.3s). Ela vive fora da lista: mexer em algo dentro dela troca só o conteúdo, sem repetir a entrada, e abrir ou fechar não redesenha a lista (o que atrasaria o primeiro quadro da animação).

O cabeçalho gruda no topo da gaveta ao rolar e traz o nº à esquerda e, à direita, só ícones do mesmo peso: abrir a O.S. inteira (⤢) e o X. Ganha uma linha embaixo só quando há conteúdo passando por ele. Botão cheio nunca vai no cabeçalho, espremido entre o nº e o X. Abrir a O.S. inteira é só o ⤢ e o `Enter`, sem um botão laranja repetindo a mesma ação na gaveta. No celular, onde não há `Enter` nem dica ao passar o mouse, o ⤢ e o X têm alvo de 44px. Depois do cabeçalho vêm o nome em título de destaque, o aviso de cliente com pendência, Propriedades (com a data da venda), as Áreas do assunto e, no fim, as demais ações (Imprimir, Duplicar e Concluir ou Dar baixa).

### Pessoas
Bolinha de 24px com **duas letras** (nome simples: as duas primeiras, "Mu"; composto: inicial do primeiro e do último, "AL") na cor fixa de `corPorNome` — a mesma do chat e das etiquetas. Sobreposição de 3px; até três bolinhas e uma "+N" cinza. Como texto: "Ana", "Ana e Rafael", e a partir de três só "3 pessoas" (lista inteira no `title`). Nos protótipos as cores chegam por `lib/prototipos/coresDoNome.js`.

### Selos de prazo e horário
**A régua de prazo e vencimento é uma só no sistema todo** (prazo de O.S., conta a pagar, boleto, conta a receber): vencido, vence **hoje** ou está devendo → vermelho (`perigo`); vence **amanhã** → âmbar (`obs`); o resto, neutro. É a mesma régua do campo de prazo da tela atual ("verde por padrão, amarelo faltando 1 dia, vermelho no último dia ou atrasado"). Vale para selo, texto do prazo, quadrinho de data e o fundo dos grupos ("Para hoje" e "Atrasadas" em vermelho claro, "Amanhã" em âmbar claro). Data que não é prazo (dia em que a nota foi pedida, dia da venda) fica neutra.

**Quadrinho de data.** Em lista com prazo ou vencimento, a data entra num quadrinho de 40px no começo da linha: o **dia** grande (13.5px, 700) e, embaixo, o **mês** abreviado ("03 / nov"). Ele é só a data: "Hoje", "Amanhã", "Em 3 dias", "Há 4 dias" vão no texto ao lado (ou à direita), nunca repetidos dentro do quadrinho. Fundo e contorno seguem a régua (vermelho claro, âmbar claro ou neutro); sem data, o quadrinho fica tracejado. Quando o quadrinho é o próprio controle do prazo, clicar nele abre o popover de data.

**Filete de prioridade.** Toda linha de lista com prazo ou vencimento ganha um filete de 3px no canto esquerdo, por dentro (`box-shadow: inset 3px 0 0`, sem mexer no alinhamento): vermelho para vencido ou vence hoje, âmbar para amanhã, nenhum para o resto. Linha paga, concluída ou numa etapa que não atrasa não tem filete. Classes nos protótipos: `pri-alta` e `pri-media`.

Prazo: "Atrasada · 28/08" (`perigo`), "Hoje" (`perigo`), "Amanhã" (`obs`), "sex 24/10" (até 7 dias), "24/10", "Sem prazo". Horário limite só quando existe: "até 14:00" neutro, âmbar faltando 2h, vermelho depois que passa. Nas etapas de `STATUSES_SEM_ATRASO` (**Aguardando Pagamento** e **Aguardando Retorno**, que esperam o cliente antes da arte, e **Retirada**, já pronta) o prazo vencido é neutro, o de hoje também, e nenhuma delas conta como atraso; Entrega conta.

### Resumo de pagamento
Um resumo só: total em número grande, barra do que já entrou (`fin`), "Recebido R$ x · Falta R$ y" (falta em `perigo`; "Quitado" ✓; "Pago a mais" em `obs-tinta`) e a lista de recebimentos. Cada valor aparece uma vez; o cabeçalho da área só mostra "Quitado".

### Quadro de composição
Mostra como um total se divide: de onde veio, como foi pago, em que conta caiu, para onde foi o gasto. É uma Área, com o total na meta do cabeçalho, e três partes:
- **O destaque:** o maior pedaço em número de 22px com "%" pequeno e uma frase curta, como "**84%** feito em Berlim", "**75%** pago em PIX" ou "**99%** já pago". Um selo de estado pode ir na ponta direita ("2 vencidas").
- **A barra fatiada:** 10px de altura, uma fatia por pedaço na cor dele (ver **Séries**), 2px de folga entre as fatias e canto de 3px.
- **A lista:** uma linha por pedaço, com quadradinho da cor, nome em 600, valor e a parte em %. O texto fica nas tintas, nunca na cor da fatia. Um dado de apoio curto pode ir ao lado do nome, em `tinta-suave` ("3 O.S.").

Quando a lista mostra só os primeiros (os 5 maiores clientes do mês), o que falta para o total vira a última linha, "os demais", em `borda-forte` e `tinta-suave`, e a barra soma 100%. Valor negativo (estorno) entra na lista em `perigo` e fica fora da barra. Linha que abre algo (as contas de uma categoria) ganha a seta › na ponta, `sutil` no hover e `Enter`. Quadros de composição lado a lado têm a mesma altura.

Substitui o ranking com uma barra por linha: a barra única mostra a proporção de uma vez, e a lista dá os números exatos. Em uso: Vendas (por local, formas de pagamento, instituições, por categoria e situação das contas) e Início (melhores clientes, mais vendidos e como pagaram).

### Dado de antes do sistema (planilha)
O sistema registra vendas desde agosto de 2026. O faturamento anterior existe só como um **total por mês**, importado de uma planilha (`vendas_historico`), e entra apenas nas leituras de tendência: as séries por mês e por ano, o comparativo do ano e o vendido de um período. Recebido, a receber, ticket, rankings, produtos e clientes contam só as O.S.
- **Hachura a 135°** no tom da série marca o que veio da planilha: traço de 2px e vão de 3px a 30% do tom sobre a superfície, opaco. A coluna toda da planilha é hachurada; o ano que mistura as duas origens tem a parte da planilha hachurada embaixo e a das O.S. cheia em cima. A origem nunca fica só na cor.
- A legenda diz "planilha · antes de ago/2026", e a dica da coluna diz "planilha" (ou quanto veio dela, na coluna que mistura).
- No calendário, um mês da planilha não tem dia: no lugar da grade vai o total do mês, com a mesma hachura e a altura da grade.
- Período que pega esses meses ganha uma **nota** acima dos números, com a hachura na frente: quanto veio da planilha, onde ele soma e onde não. Mês cortado pelo período fica de fora e a nota diz qual. Nunca se inventa um pedaço de mês.
- Comparativo de ano é sempre nos mesmos meses fechados (jan até o mês passado) dos dois anos.

### Prévia do WhatsApp
Texto que vai para o cliente aparece no balão do WhatsApp (cores e fonte do próprio WhatsApp, só ali). Clicar no balão vira campo com os asteriscos; ao sair, volta formatado com "editada". O ajuste vale só para a próxima cópia, com "Desfazer" e "Salvar no texto".

### Confirmação e desfazer
Ação que encerra pede o segundo clique no próprio botão ("Concluir?", "Clique de novo para excluir"). Ação reversível não pergunta: faz e mostra toast com "Desfazer" por 5s.

### Espera (carregamento)
A espera de página inteira — abrir o sistema, a primeira ida a uma tela, um protótipo carregando — é o **logo sendo impresso** (ver **Motivos do ofício**). Quando uma lista precisa buscar no banco (na tela de O.S., a primeira vez que se abre Baixadas, Canceladas ou Abandonadas; Abertas e À dar baixa já estão na memória), o lugar dela mostra **linhas de espera**: as mesmas colunas e a mesma caixa da lista, com barras em `borda` (a do título do grupo em `borda-forte`) que pulsam em onda de cima para baixo (1,4s, 90ms entre linhas). Quando as O.S. chegam, entram no lugar delas subindo 6px uma atrás da outra (22ms, só as dez primeiras), e nada pula porque as colunas já estavam certas. Só aparece se a busca passar de ~150ms e, aparecendo, fica pelo menos ~300ms, para não piscar. Voltar a uma aba já vista é na hora. O leitor de tela ouve "Carregando Baixadas…". Nada de rodinha girando no meio da tela.

### Troca de tema
O botão de lua/sol acende o tema a partir dele: o escuro se espalha em círculo saindo do botão até cobrir a tela (.6s, suave nas duas pontas) e, ao voltar ao claro, se recolhe para dentro do botão pelo mesmo caminho, um pouco mais rápido (.45s). O ícone troca junto com as cores. Feito com View Transitions (`lib/utils/trocarTema.js`); navegador sem suporte troca seco, e com movimento reduzido vira um esmaecer de .2s.

### Barra do sistema
Faixa de 56px em `superficie` (`--altura-barra`), com linha `borda` embaixo no computador, que encontra a borda do menu lateral no canto. À esquerda, o botão do menu, com o centro no mesmo eixo dos ícones do menu recolhido, e o nome **BERLIM Gráfica** nas cores do logo, que leva ao Início. À direita, três grupos separados por um fio de 1×20px em `borda`:
- os sites das terceirizadas numa moldura só, com um clique cada;
- as ferramentas do dia (chat, pendências, tema), em ícones de 36px, `tinta-suave`, com `realce` no hover;
- a conta.

A cor da barra fica só nos contadores, no canto do ícone, vazados por um anel da cor da barra. O do chat é laranja com texto `sobre-brand`. O das pendências tem a cor da mais grave: vermelho, âmbar ou azul.

A conta é a bolinha da pessoa (foto do Google ou iniciais na cor do nome), com nome e cargo em caixa normal e ⌄. Ela abre um menu com o vínculo do Google e **Sair do sistema**. Os dois encerram algo, então pedem o segundo clique no próprio item ("Clique de novo para sair", que volta ao normal em 4s).

Pendências e conta abrem como popover: raio 9px, borda e `sombra-pop`, descendo 4px em .16s. Fecham com clique fora ou com `Esc`, que devolve o foco ao botão. A conta aberta pelo teclado já leva o foco ao primeiro item, e as setas andam pelos itens.

No celular ficam o ícone da marca, chat, pendências, tema e só a bolinha da conta. Os sites descem para a faixa do seletor de seções, num botão com os três ícones sobrepostos.

### Motivos do ofício
É uma gráfica: quando uma tela pede um desenho, ele vem da própria impressão — prova, registro, sangria, tinta, carimbo —, nunca de ilustração genérica. **Um motivo por tela**, em 1px e sutil, e ele tem que explicar alguma coisa (está carregando, não há nada, quantas cabem, quando foi aprovado). As cores de processo (`processo-ciano`, `-magenta`, `-amarelo`, `-preto`) só aparecem nos motivos e nas tintas das máquinas. O motivo nunca substitui a palavra.
- **Logo sendo impresso** (`components/ui/LogoCarregando.jsx`, `.logo-carregando`): o logo em `borda-forte`, com a geometria do ícone (barras e vãos de 6px, 40px de altura), e a tinta nas cores do logo entrando por cima e saindo por baixo, barra a barra (ciclo de 2s, 120ms entre as barras; a barra partida enche um pedaço de cada vez), com "Carregando…" quando cabe. A tinta aparece já nos primeiros 100ms, porque a espera curta só vê o começo; as quatro barras ficam cheias juntas por quase 300ms e nunca fica tudo vazio. Só CSS, porque aparece antes do JavaScript da página. É a espera de página inteira; lista que está chegando continua com as linhas de espera. Com movimento reduzido, o logo cheio só respira.
- **Folha de prova em branco**: o estado vazio de lista é a folha (76×84) com as marcas de registro em `tinta-fraca`, acima do texto que diz o que não foi achado. Sempre a mesma, em toda lista.
- **Retícula e marcas de corte** (`components/ui/Reticula.jsx`, `.fundo-marca`, `.marcas-de-corte`): só nas telas de marca, entrada e bloqueio. Fundo de `marca-1` a `marca-3`, pontos de meio-tom a 45° que "imprimem" numa varredura diagonal, e o cartão emoldurado por traços de 1px nos quatro cantos, do lado de fora. Nunca em tela de trabalho.
- **Montagem na folha** (`components/calculadoras/MontagemNaFolha.jsx`): na calculadora de Adesivos, num painel **ao lado** da caixa da calculadora, que fica como sempre foi. Desenho em escala da folha que o preço usa (SRA3, meio metro ou metro), com sangria em magenta a 10% e a linha de corte tracejada em magenta — o magenta da faca fica só no desenho, nunca em texto —, as cotas, o número por folha e o aviso âmbar quando deitado cabe mais.
- **Contador mecânico** (`components/equipamentos/ContadorMecanico.jsx`): o último contador de páginas da máquina, um dígito por janela, nos tons do card (nunca caixa preta), zeros à esquerda em `tinta-fraca`. Os dígitos que mudam giram até o número novo, o da direita primeiro.
- **Linha da prova** (`PrintOrcamento`): no pé do documento impresso, acima da faixa da marca, em 7,5px cinza à direita: "Orçamento nº 22 · gerado em 29/10/2026 às 12:35 · por Murilo". Só no papel.
- **OK para impressão**: o marcador da arte diz quando e quem — "Cliente aprovou · 29/10 às 12:32 · por Murilo" —; desligado, "Aguardando OK do cliente". O filtro se chama "Aguardando OK".
- **Carimbo de baixa**: "BAIXADA" com a data, em moldura dupla `tinta-suave` girada -2°, ao lado do cliente da O.S. finalizada. Bate uma vez (.42s) e fica parado; sem cor de estado.
- **Calendário de vendas**: cada dia no tom de quanto vendeu, em cinco tons de `fin` (14 a 100%), com a legenda de até quanto vale cada tom; clicar no dia abre o relatório do dia. O mês vem do banco ao ser aberto, um por vez.
- **Calendário de contas a pagar**: o mesmo desenho, como segunda vista da lista de contas ("Lista | Calendário" no cabeçalho da área, lembrada na sessão). O que falta pagar no dia fica em **vermelho**, em cinco tons pelo valor (`cal-pagar`: #A51D1D no claro, #F87171 no escuro, escolhidos para o texto passar 4.5:1 em todos; texto em `cal-forte` nos dois mais fortes); o dia **todo pago fica verde** (`fin` a 16%, valor em `fin-tinta`). Os valores levam centavos ("R$ 885,00"), como no resto do Financeiro, e no resumo do mês o a pagar vai em `perigo` e o pago em `fin-tinta`. A situação vai num selo redondo com o ícone do grupo da lista — triângulo vencida, relógio vence hoje, calendário amanhã, ✓ tudo pago — e no contorno da régua de prazo: vermelho para vencida ou vence hoje, âmbar para amanhã. Como todo dia a pagar é vermelho, quem diz que venceu é o selo e o contorno. Segue o período: as setas trocam o período para o mês ao lado. Clicar no dia mostra embaixo as contas dele, com as mesmas linhas da lista (pagar, abrir). Sai da memória, sem consulta.

Testado e recusado: a tira de densidade marcando a etapa da O.S. na gaveta da Produção (29/10/2026).

## Do's and Don'ts

### Do:
- **Do** começar cada tela neutra e só então decidir onde a cor tem trabalho a fazer.
- **Do** editar no lugar: propriedade → popover; linha → expande; balão → vira campo.
- **Do** dar atalho de teclado às ações frequentes e mostrar o atalho.
- **Do** testar toda tela em 390px e no tema escuro antes de dar por pronta.
- **Do** usar números tabulares em datas, horas e valores.
- **Do** mostrar o estado com selo pequeno e palavra ("até 14:00", "editada"), não só com cor.
- **Do** escrever o texto de apoio como referência curta — o número e o que o situa ("26 O.S.", "0% de outubro") —, com a explicação completa na dica.
- **Do** usar a cor de cada pessoa e de cada local de `corPorNome`, nunca uma cor nova.
- **Do** mostrar como um total se divide com o quadro de composição (destaque, barra fatiada e lista), não com uma barra por linha.
- **Do** abrir o registro numa gaveta ou no lugar, sem tirar a pessoa da lista.
- **Do** tirar o desenho de uma tela do próprio ofício da impressão (ver **Motivos do ofício**), um por tela.
- **Do** protótipo antes de código: tela nova nasce em `public/prototipos/` com dados reais injetados pela página da rota (nada no arquivo público), e só vai para o sistema depois de aprovada.

### Don't:
- **Don't** pintar faixas inteiras de cor saturada (cabeçalhos de grupo, barras de título) — cor de área é tinta clara.
- **Don't** usar texto branco sobre o laranja de marca.
- **Don't** usar select nativo, `alert()` ou modal para escolha simples ou confirmação leve.
- **Don't** colocar borda lateral colorida grossa em cartão, linha ou aviso (o filete de prioridade de 3px das listas com prazo é a única exceção).
- **Don't** usar caixa alta espaçada em rótulos e títulos.
- **Don't** criar cartões iguais em grade como estrutura de página quando uma lista densa resolve.
- **Don't** misturar busca, chips e botões numa mesma faixa de ferramentas: busca no cabeçalho, filtros em abas.
- **Don't** pôr botão de atualizar: o tempo real atualiza a tela, e uma lista que veio do banco relê só as linhas das O.S. que mudaram.
- **Don't** lançar um total antigo como O.S. sem cliente para o gráfico fechar: ele estraga ranking, ticket e a receber. Vai para `vendas_historico` e aparece hachurado (ver **Dado de antes do sistema**).
- **Don't** deixar ação rara e que encerra algo (sair, desvincular) solta na barra do sistema, ao lado de um ícone de uso diário: ela vai no menu da conta.
- **Don't** repetir o mesmo valor em vários lugares do mesmo bloco (ex.: "falta pagar" no cabeçalho, no resumo e na lista).
- **Don't** escrever na tela uma frase que explica o que o rótulo e o contexto já dizem ("por dia com venda", "já prontos para cobrar"): se for útil, ela vai na dica.
- **Don't** deixar texto de propriedade vazar da coluna: corte com "…" e ponha o valor inteiro no `title`.
- **Don't** usar as cores de processo (C, M, Y, K) fora dos motivos do ofício e das tintas das máquinas, nem o magenta da faca em texto.
- **Don't** pôr retícula ou marcas de corte em tela de trabalho: são da marca (entrada e bloqueio).
