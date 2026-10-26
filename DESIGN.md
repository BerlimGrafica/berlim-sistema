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
`kbd` de 10.5px com borda inferior de 2px, ao lado da ação ("Copiar texto `Enter`") e numa linha de dicas no rodapé da tela. Atalhos do sistema: `/` busca · `↑` `↓` navega · `Enter` age · `Esc` fecha ou limpa · `N` novo (item, O.S., texto) · `P` pagamento · `Ctrl S` salva. Letra só vale fora de campo de texto.

### Abas de filtro
O recorte principal de uma lista vira abas com contagem (Todas, Atrasadas, Hoje…) sobre a linha que separa o cabeçalho da lista; um traço `brand` de 2px desliza até a aba ativa (.34s). A contagem da aba ativa fica em `tinta`; a de alerta (Atrasadas) fica em `perigo` mesmo inativa. Ações da lista (recolher todas) entram na ponta direita como ícone com dica. No celular a faixa rola na horizontal, vai sozinha até a aba ativa e esmaece as bordas quando há mais abas. Busca e o botão primário ficam no cabeçalho, à direita do título — nunca na mesma linha das abas, com uma exceção: no computador a faixa gruda no topo ao rolar e, presa, recebe o botão primário compacto (32px, com `kbd`) na ponta direita, no mesmo lugar onde estava o botão grande. Ele entra deslizando 10px e o ícone de recolher escorrega para abrir espaço. Trocar de aba com a faixa presa leva ao começo da lista nova, logo abaixo da faixa. A lista nova entra do lado da aba escolhida (24px e esmaecendo, .3s), na mesma direção em que o traço anda; cabeçalho, faixa e títulos das colunas ficam parados. Se a aba precisa buscar no banco, quem entra primeiro são as linhas de espera (ver **Espera**).

### Lista agrupada
Cabeçalho de grupo leve (seta, bolinha da etapa, nome, contagem e alerta "x atrasadas"), lista densa em `superficie` com borda. Abrir/fechar o grupo troca só uma classe (grid `1fr → 0fr`, .36s) sem redesenhar a lista; "Recolher todas" faz o mesmo em todos. Grupos recolhidos não são guardados entre visitas. Linha que muda de grupo desliza até o lugar novo (FLIP). Ordem dentro do grupo: prazo, depois horário limite.

### Gaveta de detalhe
Clicar numa linha abre a gaveta: no computador desliza da borda direita (até 460px, fundo `fundo`, `sombra-janela`, véu atrás); no celular sobe de baixo como folha (88% da altura). Entra sem pressa, desacelerando (.46s), e fecha — X, `Esc` ou clique no véu — pelo mesmo caminho, um pouco mais rápida e acelerando para fora (.3s). Ela vive fora da lista: mexer em algo dentro dela troca só o conteúdo, sem repetir a entrada, e abrir ou fechar não redesenha a lista (o que atrasaria o primeiro quadro da animação).

O cabeçalho gruda no topo da gaveta ao rolar e traz o nº, a ação principal — **Abrir O.S. completa**, primário compacto com `Enter` — e o X; ganha uma linha embaixo só quando há conteúdo passando por ele. Depois vêm o nome em título de destaque, o aviso de cliente com pendência, Propriedades (com a data da venda), as Áreas do assunto e, no fim, as demais ações (Imprimir, Duplicar e Concluir ou Dar baixa).

### Pessoas
Bolinha de 24px com **duas letras** (nome simples: as duas primeiras, "Mu"; composto: inicial do primeiro e do último, "AL") na cor fixa de `corPorNome` — a mesma do chat e das etiquetas. Sobreposição de 3px; até três bolinhas e uma "+N" cinza. Como texto: "Ana", "Ana e Rafael", e a partir de três só "3 pessoas" (lista inteira no `title`). Nos protótipos as cores chegam por `lib/prototipos/coresDoNome.js`.

### Selos de prazo e horário
Prazo: "Atrasada · 28/08" (`perigo`), "Hoje" (`obs`), "Amanhã", "sex 24/10" (até 7 dias), "24/10", "Sem prazo". Horário limite só quando existe: "até 14:00" neutro, âmbar faltando 2h, vermelho depois que passa. Nas etapas de `STATUSES_SEM_ATRASO` (hoje só **Retirada**) o prazo vencido é neutro e não conta como atraso; Entrega conta.

### Resumo de pagamento
Um resumo só: total em número grande, barra do que já entrou (`fin`), "Recebido R$ x · Falta R$ y" (falta em `perigo`; "Quitado" ✓; "Pago a mais" em `obs-tinta`) e a lista de recebimentos. Cada valor aparece uma vez; o cabeçalho da área só mostra "Quitado".

### Prévia do WhatsApp
Texto que vai para o cliente aparece no balão do WhatsApp (cores e fonte do próprio WhatsApp, só ali). Clicar no balão vira campo com os asteriscos; ao sair, volta formatado com "editada". O ajuste vale só para a próxima cópia, com "Desfazer" e "Salvar no texto".

### Confirmação e desfazer
Ação que encerra pede o segundo clique no próprio botão ("Concluir?", "Clique de novo para excluir"). Ação reversível não pergunta: faz e mostra toast com "Desfazer" por 5s.

### Espera (carregamento)
Quando uma lista precisa buscar no banco (na tela de O.S., a primeira vez que se abre Baixadas, Canceladas ou Abandonadas; Abertas e À dar baixa já estão na memória), o lugar dela mostra **linhas de espera**: as mesmas colunas e a mesma caixa da lista, com barras em `borda` (a do título do grupo em `borda-forte`) que pulsam em onda de cima para baixo (1,4s, 90ms entre linhas). Quando as O.S. chegam, entram no lugar delas subindo 6px uma atrás da outra (22ms, só as dez primeiras), e nada pula porque as colunas já estavam certas. Só aparece se a busca passar de ~150ms e, aparecendo, fica pelo menos ~300ms, para não piscar. Voltar a uma aba já vista é na hora. O leitor de tela ouve "Carregando Baixadas…". Nada de rodinha girando no meio da tela.

### Troca de tema
O botão de lua/sol acende o tema a partir dele: o escuro se espalha em círculo saindo do botão até cobrir a tela (.6s, suave nas duas pontas) e, ao voltar ao claro, se recolhe para dentro do botão pelo mesmo caminho, um pouco mais rápido (.45s). O ícone troca junto com as cores. Feito com View Transitions (`lib/utils/trocarTema.js`); navegador sem suporte troca seco, e com movimento reduzido vira um esmaecer de .2s.

## Do's and Don'ts

### Do:
- **Do** começar cada tela neutra e só então decidir onde a cor tem trabalho a fazer.
- **Do** editar no lugar: propriedade → popover; linha → expande; balão → vira campo.
- **Do** dar atalho de teclado às ações frequentes e mostrar o atalho.
- **Do** testar toda tela em 390px e no tema escuro antes de dar por pronta.
- **Do** usar números tabulares em datas, horas e valores.
- **Do** mostrar o estado com selo pequeno e palavra ("até 14:00", "editada"), não só com cor.
- **Do** usar a cor de cada pessoa e de cada local de `corPorNome`, nunca uma cor nova.
- **Do** abrir o registro numa gaveta ou no lugar, sem tirar a pessoa da lista.
- **Do** protótipo antes de código: tela nova nasce em `public/prototipos/` com dados reais injetados pela página da rota (nada no arquivo público), e só vai para o sistema depois de aprovada.

### Don't:
- **Don't** pintar faixas inteiras de cor saturada (cabeçalhos de grupo, barras de título) — cor de área é tinta clara.
- **Don't** usar texto branco sobre o laranja de marca.
- **Don't** usar select nativo, `alert()` ou modal para escolha simples ou confirmação leve.
- **Don't** colocar borda lateral colorida grossa em cartão, linha ou aviso.
- **Don't** usar caixa alta espaçada em rótulos e títulos.
- **Don't** criar cartões iguais em grade como estrutura de página quando uma lista densa resolve.
- **Don't** misturar busca, chips e botões numa mesma faixa de ferramentas: busca no cabeçalho, filtros em abas.
- **Don't** repetir o mesmo valor em vários lugares do mesmo bloco (ex.: "falta pagar" no cabeçalho, no resumo e na lista).
- **Don't** deixar texto de propriedade vazar da coluna: corte com "…" e ponha o valor inteiro no `title`.
