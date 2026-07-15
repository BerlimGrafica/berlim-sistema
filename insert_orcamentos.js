const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://xbanoipgoleuahwbqksy.supabase.co',
    'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh'
);

const orcamentos = [
    {
        titulo: "Cavalete 100x60cm",
        texto: `1 Cavalete | 100x60cm | Dupla Face | Estrutura em madeira | Lona 440g - R$195,00
Prazo: 4-5 Dias Úteis`
    },
    {
        titulo: "Fotos 10x15cm (sem borda)",
        texto: `1 foto | 10x15cm | Papel fotográfico | somente frente | sem borda branca – R$4,50
10 fotos | 10x15cm | Papel fotográfico | somente frente | sem borda branca – R$40,00
50 fotos | 10x15cm | Papel fotográfico | somente frente | sem borda branca – R$175,00`
    },
    {
        titulo: "Fotos 10x15cm (com borda)",
        texto: `1 foto | 10x15cm | Papel fotográfico | somente frente | com borda branca – R$3,50
10 fotos | 10x15cm | Papel fotográfico | somente frente | com borda branca – R$30,00
50 fotos | 10x15cm | Papel fotográfico | somente frente | com borda branca – R$125,00`
    },
    {
        titulo: "Polaroids 7x9cm",
        texto: `3 Polaroids | 7x9cm | papel fotográfico | somente frente – R$9,00
30 Polaroids | 7x9cm | papel fotográfico | somente frente – R$82,50
60 Polaroids | 7x9cm | papel fotográfico | somente frente – R$150,00`
    },
    {
        titulo: "Fotos 20x14cm",
        texto: `2 fotos | 20x14cm | Papel fotográfico | somente frente – R$12,00
10 fotos | 20x14cm | Papel fotográfico | somente frente – R$55,00
50 fotos | 20x14cm | Papel fotográfico | somente frente – R$262,50`
    },
    {
        titulo: "Fotos A4",
        texto: `1 foto | A4 | Papel fotográfico | somente frente | bordas brancas – R$10,00
10 fotos | A4 | Papel fotográfico | somente frente | bordas brancas – R$90,00
50 fotos | A4 | Papel fotográfico | somente frente | bordas brancas – R$400,00`
    },
    {
        titulo: "Fotos 20x28cm",
        texto: `1 foto | 20x28cm | Papel fotográfico | somente frente – R$11,00
10 fotos | 20x28cm | Papel fotográfico | somente frente – R$100,00
50 fotos | 20x28cm | Papel fotográfico | somente frente – R$410,00`
    },
    {
        titulo: "Banner 50x100cm",
        texto: `1 Banner | 50x100cm | Lona 440g | Acabamento corda e bastão | Latex | Sem tripé | 4x0 | Refile - R$65,00
Prazo: 2-3 dias úteis`
    },
    {
        titulo: "Banner 90x120cm",
        texto: `1 Banner | 90x120cm | Lona 440g | Acabamento corda e bastão | Latex | Sem tripé | 4x0 | Refile - R$108,00
Prazo: 2-3 dias úteis`
    },
    {
        titulo: "Banner 100x150cm",
        texto: `1 Banner | 100x150cm | Lona 440g | Acabamento corda e bastão | Latex | Sem tripé | 4x0 | Refile - R$135,00
Prazo: 2-3 dias úteis`
    },
    {
        titulo: "Cartão de Visita SEM acabamento (100un)",
        texto: `100 Cartões | 9x5cm (aprox.) | Impressão Digital | Somente Frente | Couche 300g | Sem laminação e Sem verniz - R$52,90
100 Cartões | 9x5cm (aprox.) | Impressão Digital | Frente e Verso | Couche 300g | Sem laminação e Sem verniz - R$95,80
Cantos arredondados + R$15,00
Prazo: 1 dia útil`
    },
    {
        titulo: "Cartão de Visita COM laminação (100un)",
        texto: `100 Cartões | 9x5cm (aprox.) | Impressão digital | Somente frente | Couche 300g | COM laminação Brilho/fosca/holográfica (na frente) - R$64,50
100 Cartões | 9x5cm (aprox.) | Impressão digital | Frente e verso | Couche 300g | COM laminação Brilho/fosca/holográfica (na frente) - R$107,50
100 Cartões | 9x5cm (aprox.) | Impressão digital | Frente e verso | Couche 300g | COM laminação Brilho/fosca (frente e verso) - R$118,25
Prazo: 1 dia útil`
    },
    {
        titulo: "Cartão de Visita Offset (500/1000un)",
        texto: `Somente frente:
500 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x0 | Verniz na frente | Couche 300g | Refile - R$130,00
1.000 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x0 | Verniz na frente | Couche 300g | Refile - R$144,00

Frente e verso:
500 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Verniz na frente | Couche 300g | Refile - R$145,00
1.000 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Verniz na frente | Couche 300g | Refile - R$160,00
Prazo: 5-7 dias úteis`
    },
    {
        titulo: "Cartão de Visita Premium (500/1000un)",
        texto: `500 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Laminação fosca com verniz localizado | Couche 300g | Refile - R$205,00
1.000 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Laminação fosca com verniz localizado | Couche 300g | Refile - R$225,00
Prazo: 5-7 dias úteis`
    },
    {
        titulo: "Folhetos 10x14cm Offset (1000/2500un)",
        texto: `1000 Folhetos | 10x14cm | Couche brilho 90g | Apenas frente - R$200,00
1000 Folhetos | 10x14cm | Couche brilho 90g | Frente e verso - R$230,00
2500 Folhetos | 10x14cm | Couche brilho 90g | Apenas frente - R$280,00
2500 Folhetos | 10x14cm | Couche brilho 90g | Frente e verso - R$310,00
Prazo: 5-7 dias úteis`
    },
    {
        titulo: "Folhetos 20x14cm Offset (1000/2500un)",
        texto: `1000 Folhetos | 20x14cm | Couche Brilho 90g | Apenas frente - R$354,00
1000 Folhetos | 20x14cm | Couche Brilho 90g | Frente e verso - R$416,00
2500 Folhetos | 20x14cm | Couche Brilho 90g | Apenas frente - R$515,00
2500 Folhetos | 20x14cm | Couche Brilho 90g | Frente e verso - R$572,00
Prazo: 5-7 dias úteis`
    },
    {
        titulo: "100 Folhetos 10x14cm - Monolucido 120g",
        texto: `100 Folhetos | 10x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta (cores opacas) – R$47,00
100 Folhetos | 10x14cm | Monolucido 120g fosco | Frente e verso | Colorido | Jato de Tinta (cores opacas) – R$69,90
Prazo: 1 dia útil`
    },
    {
        titulo: "100 Folhetos 10x14cm - Couche 115g",
        texto: `100 Folhetos | 10x14cm | Couche 115g | Somente frente | Laser (cores saturadas) – R$62,00
100 Folhetos | 10x14cm | Couche 115g | Frente e verso | Laser (cores saturadas) – R$95,00
Prazo: 1 dia útil`
    },
    {
        titulo: "100 Folhetos 10x14cm - Couche 170g",
        texto: `100 Folhetos | 10x14cm | Couche 170g | Somente frente | Laser (cores saturadas) – R$88,00
100 Folhetos | 10x14cm | Couche 170g | Frente e verso | Laser (cores saturadas) – R$162,50
Prazo: 1 dia útil`
    },
    {
        titulo: "100 Folhetos 20x14cm - Monolucido 120g",
        texto: `100 Folhetos | 20x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta – R$62,50
100 Folhetos | 20x14cm | Monolucido 120g fosco | Frente e Verso | Colorido | Jato de Tinta – R$110,00
Prazo: 1 dia útil`
    },
    {
        titulo: "100 Folhetos 10x14cm - Offset 75g (Sulfite)",
        texto: `100 Folhetos | 10x14cm | Offset 75g fosco (Sulfite comum) | Só Frente | Colorido | Jato de Tinta – R$30,00
100 Folhetos | 10x14cm | Offset 75g fosco (Sulfite comum) | Frente e Verso | Colorido | Jato de Tinta - R$45,00
Prazo: 1 dia útil`
    },
    {
        titulo: "100 Folhetos 10x14cm - Offset 90g/120g/180g",
        texto: `Offset 90g fosco:
100 Folhetos | 10x14cm | Só Frente | Jato de Tinta – R$37,50
100 Folhetos | 10x14cm | Frente e verso | Jato de Tinta – R$60,00

Offset 120g fosco:
100 Folhetos | 10x14cm | Só Frente | Jato de Tinta – R$52,50
100 Folhetos | 10x14cm | Frente e verso | Jato de Tinta – R$77,50

Offset 180g fosco:
100 Folhetos | 10x14cm | Só Frente | Jato de Tinta – R$83,75
100 Folhetos | 10x14cm | Frente e verso | Jato de Tinta – R$127,50
Prazo: 1 dia útil`
    },
    {
        titulo: "500/1000 Folhetos 10x14cm - Monolucido 120g",
        texto: `500 Folhetos | 10x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta (cores opacas) – R$204,25
500 Folhetos | 10x14cm | Monolucido 120g fosco | Frente e Verso | Colorido | Jato de Tinta (cores opacas) – R$329,50

1000 Folhetos | 10x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta (cores opacas) – R$388,10
1000 Folhetos | 10x14cm | Monolucido 120g fosco | Frente e Verso | Colorido | Jato de Tinta (cores opacas) – R$612,50
Prazo: 1 dia útil`
    },
    {
        titulo: "Ímãs 7x10cm / 7x5cm",
        texto: `30 Imãs | 7x10cm | Com laminação fosca ou brilhante | Papel fotográfico Jato de tinta | sem arte - R$105,00
30 Imãs | 7x5cm | Com laminação fosca ou brilhante | Papel fotográfico Jato de tinta | sem arte - R$75,00
Prazo: 2-4 dias úteis`
    },
    {
        titulo: "Ímã para Carro 40x30cm",
        texto: `2 Imãs para carro | 40x30cm | Com laminação fosca | 0,8mm | Sem a arte – R$180,00`
    },
    {
        titulo: "Adesivo Vende-se A4",
        texto: `Adesivo de VENDE-SE | Tamanho A4 | Cor: Branca
1 unidade – R$25,00
2 unidades - R$45,00
3 unidades - R$60,00`
    },
    {
        titulo: "Wind Banner",
        texto: `1 Wind banner completo | formato faca | 65x190cm | Tecido poliéster | Frente e verso | Impressão ultra HD sublimática | Dupla-face costurado | Base plástica | Haste desmontável curva - R$300,00
1 Wind banner completo | formato faca | 65x250cm | Tecido poliéster | Frente e verso | Impressão ultra HD sublimática | Dupla-face costurado | Base plástica | Haste desmontável curva - R$340,00
1 Wind banner completo | formato faca | 65x300cm | Tecido poliéster | Frente e verso | Impressão ultra HD sublimática | Dupla-face costurado | Base plástica | Haste desmontável curva - R$380,00
Prazo: 5-7 dias úteis`
    },
    {
        titulo: "Banner Roll-up 80x200cm",
        texto: `1 Banner roll up | 80x200cm | Lona Brilho 440g | Somente frente | Sem verniz e sem laminação | Estrutura Inclusa - R$504,00
Prazo: 7 dias úteis`
    },
    {
        titulo: "Etiquetas Escolares Adesivas",
        texto: `100 adesivos (1x5cm) + 22 adesivos (3x5cm) + 4 adesivos (8x5cm) = 126 Etiquetas

Materiais:
• Adesivo vinílico - R$58,00 (resistente a água)
ou
• Adesivo vinílico c/ laminação fosca - R$72,00 (Maior durabilidade: resistente a lavagem comum)

Prazo: Arte + Produção: 2-3 dias úteis`
    },
    {
        titulo: "Chaveiros",
        texto: `5 chaveiros | 4,5 x 4,5 cm | quadrado | ilhós dourado | com argolinha dourada | Frente e verso: Frente colorida com a arte escolhida e o Verso com fundo branco e texto colorido – R$40,00
Prazo: Arte + Produção: 3-4 dias úteis`
    },
    {
        titulo: "Etiquetas Termocolantes",
        texto: `20 Etiquetas Termocolantes (4x1cm) + Folha de papel Manteiga para aplicação = R$20,00

Como essas etiquetas estarão em atrito constante, optamos por fazer a arte com fundo branco e apenas o nome da criança colorido, para não correr o risco da etiqueta se soltar da peça de roupa.

Prazo: Arte + Produção: 2 dias úteis`
    },
    {
        titulo: "Kit Volta às Aulas",
        texto: `• 126 Etiquetas adesivas (100 de 1x5cm + 22 de 3x5cm + 4 de 8x5cm) - Adesivo vinílico, resistente a água
• 5 chaveiros | 4,5 x 4,5 cm | quadrado | ilhós dourado | com argolinha | Frente e verso
• 20 Etiquetas Termocolantes (4x1cm) + Folha de papel Manteiga para aplicação

3 Materiais da mesma arte - R$98,00
Prazo: Arte + Produção: 4 dias úteis`
    }
];

async function inserir() {
    console.log(`Inserindo ${orcamentos.length} orçamentos pré-prontos...\n`);
    
    const { data, error } = await supabase
        .from('orcamentos_pre_prontos')
        .insert(orcamentos)
        .select();
    
    if (error) {
        console.error('ERRO:', error.message);
        process.exit(1);
    }
    
    console.log(`✅ ${data.length} orçamentos inseridos com sucesso!\n`);
    data.forEach((orc, i) => {
        console.log(`  ${i + 1}. ${orc.titulo} (id: ${orc.id})`);
    });
}

inserir();
