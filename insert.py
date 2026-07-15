import urllib.request
import json

URL = "https://xbanoipgoleuahwbqksy.supabase.co/rest/v1/orcamentos_pre_prontos"
KEY = "sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh"

orcamentos = [
    {
        "titulo": "Cavalete 100x60cm",
        "texto": "1 Cavalete | 100x60cm | Dupla Face | Estrutura em madeira | Lona 440g - R$195,00\nPrazo: 4-5 Dias Úteis"
    },
    {
        "titulo": "Fotos 10x15cm (sem borda)",
        "texto": "1 foto | 10x15cm | Papel fotográfico | somente frente | sem borda branca – R$4,50\n10 fotos | 10x15cm | Papel fotográfico | somente frente | sem borda branca – R$40,00\n50 fotos | 10x15cm | Papel fotográfico | somente frente | sem borda branca – R$175,00"
    },
    {
        "titulo": "Fotos 10x15cm (com borda)",
        "texto": "1 foto | 10x15cm | Papel fotográfico | somente frente | com borda branca – R$3,50\n10 fotos | 10x15cm | Papel fotográfico | somente frente | com borda branca – R$30,00\n50 fotos | 10x15cm | Papel fotográfico | somente frente | com borda branca – R$125,00"
    },
    {
        "titulo": "Polaroids 7x9cm",
        "texto": "3 Polaroids | 7x9cm | papel fotográfico | somente frente – R$9,00\n30 Polaroids | 7x9cm | papel fotográfico | somente frente – R$82,50\n60 Polaroids | 7x9cm | papel fotográfico | somente frente – R$150,00"
    },
    {
        "titulo": "Fotos 20x14cm",
        "texto": "2 fotos | 20x14cm | Papel fotográfico | somente frente – R$12,00\n10 fotos | 20x14cm | Papel fotográfico | somente frente – R$55,00\n50 fotos | 20x14cm | Papel fotográfico | somente frente – R$262,50"
    },
    {
        "titulo": "Fotos A4",
        "texto": "1 foto | A4 | Papel fotográfico | somente frente | bordas brancas – R$10,00\n10 fotos | A4 | Papel fotográfico | somente frente | bordas brancas – R$90,00\n50 fotos | A4 | Papel fotográfico | somente frente | bordas brancas – R$400,00"
    },
    {
        "titulo": "Fotos 20x28cm",
        "texto": "1 foto | 20x28cm | Papel fotográfico | somente frente – R$11,00\n10 fotos | 20x28cm | Papel fotográfico | somente frente – R$100,00\n50 fotos | 20x28cm | Papel fotográfico | somente frente – R$410,00"
    },
    {
        "titulo": "Banner 50x100cm",
        "texto": "1 Banner | 50x100cm | Lona 440g | Acabamento corda e bastão | Latex | Sem tripé | 4x0 | Refile - R$65,00\nPrazo: 2-3 dias úteis"
    },
    {
        "titulo": "Banner 90x120cm",
        "texto": "1 Banner | 90x120cm | Lona 440g | Acabamento corda e bastão | Latex | Sem tripé | 4x0 | Refile - R$108,00\nPrazo: 2-3 dias úteis"
    },
    {
        "titulo": "Banner 100x150cm",
        "texto": "1 Banner | 100x150cm | Lona 440g | Acabamento corda e bastão | Latex | Sem tripé | 4x0 | Refile - R$135,00\nPrazo: 2-3 dias úteis"
    },
    {
        "titulo": "Cartão de Visita SEM acabamento (100un)",
        "texto": "100 Cartões | 9x5cm (aprox.) | Impressão Digital | Somente Frente | Couche 300g | Sem laminação e Sem verniz - R$52,90\n100 Cartões | 9x5cm (aprox.) | Impressão Digital | Frente e Verso | Couche 300g | Sem laminação e Sem verniz - R$95,80\nCantos arredondados + R$15,00\nPrazo: 1 dia útil"
    },
    {
        "titulo": "Cartão de Visita COM laminação (100un)",
        "texto": "100 Cartões | 9x5cm (aprox.) | Impressão digital | Somente frente | Couche 300g | COM laminação Brilho/fosca/holográfica (na frente) - R$64,50\n100 Cartões | 9x5cm (aprox.) | Impressão digital | Frente e verso | Couche 300g | COM laminação Brilho/fosca/holográfica (na frente) - R$107,50\n100 Cartões | 9x5cm (aprox.) | Impressão digital | Frente e verso | Couche 300g | COM laminação Brilho/fosca (frente e verso) - R$118,25\nPrazo: 1 dia útil"
    },
    {
        "titulo": "Cartão de Visita Offset (500/1000un)",
        "texto": "Somente frente:\n500 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x0 | Verniz na frente | Couche 300g | Refile - R$130,00\n1.000 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x0 | Verniz na frente | Couche 300g | Refile - R$144,00\n\nFrente e verso:\n500 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Verniz na frente | Couche 300g | Refile - R$145,00\n1.000 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Verniz na frente | Couche 300g | Refile - R$160,00\nPrazo: 5-7 dias úteis"
    },
    {
        "titulo": "Cartão de Visita Premium (500/1000un)",
        "texto": "500 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Laminação fosca com verniz localizado | Couche 300g | Refile - R$205,00\n1.000 Cartões de visita | 8,8x4,8cm | Impressão Offset | 4x4 | Laminação fosca com verniz localizado | Couche 300g | Refile - R$225,00\nPrazo: 5-7 dias úteis"
    },
    {
        "titulo": "Folhetos 10x14cm Offset (1000/2500un)",
        "texto": "1000 Folhetos | 10x14cm | Couche brilho 90g | Apenas frente - R$200,00\n1000 Folhetos | 10x14cm | Couche brilho 90g | Frente e verso - R$230,00\n2500 Folhetos | 10x14cm | Couche brilho 90g | Apenas frente - R$280,00\n2500 Folhetos | 10x14cm | Couche brilho 90g | Frente e verso - R$310,00\nPrazo: 5-7 dias úteis"
    },
    {
        "titulo": "Folhetos 20x14cm Offset (1000/2500un)",
        "texto": "1000 Folhetos | 20x14cm | Couche Brilho 90g | Apenas frente - R$354,00\n1000 Folhetos | 20x14cm | Couche Brilho 90g | Frente e verso - R$416,00\n2500 Folhetos | 20x14cm | Couche Brilho 90g | Apenas frente - R$515,00\n2500 Folhetos | 20x14cm | Couche Brilho 90g | Frente e verso - R$572,00\nPrazo: 5-7 dias úteis"
    },
    {
        "titulo": "100 Folhetos 10x14cm - Monolucido 120g",
        "texto": "100 Folhetos | 10x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta (cores opacas) – R$47,00\n100 Folhetos | 10x14cm | Monolucido 120g fosco | Frente e verso | Colorido | Jato de Tinta (cores opacas) – R$69,90\nPrazo: 1 dia útil"
    },
    {
        "titulo": "100 Folhetos 10x14cm - Couche 115g",
        "texto": "100 Folhetos | 10x14cm | Couche 115g | Somente frente | Laser (cores saturadas) – R$62,00\n100 Folhetos | 10x14cm | Couche 115g | Frente e verso | Laser (cores saturadas) – R$95,00\nPrazo: 1 dia útil"
    },
    {
        "titulo": "100 Folhetos 10x14cm - Couche 170g",
        "texto": "100 Folhetos | 10x14cm | Couche 170g | Somente frente | Laser (cores saturadas) – R$88,00\n100 Folhetos | 10x14cm | Couche 170g | Frente e verso | Laser (cores saturadas) – R$162,50\nPrazo: 1 dia útil"
    },
    {
        "titulo": "100 Folhetos 20x14cm - Monolucido 120g",
        "texto": "100 Folhetos | 20x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta – R$62,50\n100 Folhetos | 20x14cm | Monolucido 120g fosco | Frente e Verso | Colorido | Jato de Tinta – R$110,00\nPrazo: 1 dia útil"
    },
    {
        "titulo": "100 Folhetos 10x14cm - Offset 75g (Sulfite)",
        "texto": "100 Folhetos | 10x14cm | Offset 75g fosco (Sulfite comum) | Só Frente | Colorido | Jato de Tinta – R$30,00\n100 Folhetos | 10x14cm | Offset 75g fosco (Sulfite comum) | Frente e Verso | Colorido | Jato de Tinta - R$45,00\nPrazo: 1 dia útil"
    },
    {
        "titulo": "100 Folhetos 10x14cm - Offset 90g/120g/180g",
        "texto": "Offset 90g fosco:\n100 Folhetos | 10x14cm | Só Frente | Jato de Tinta – R$37,50\n100 Folhetos | 10x14cm | Frente e verso | Jato de Tinta – R$60,00\n\nOffset 120g fosco:\n100 Folhetos | 10x14cm | Só Frente | Jato de Tinta – R$52,50\n100 Folhetos | 10x14cm | Frente e verso | Jato de Tinta – R$77,50\n\nOffset 180g fosco:\n100 Folhetos | 10x14cm | Só Frente | Jato de Tinta – R$83,75\n100 Folhetos | 10x14cm | Frente e verso | Jato de Tinta – R$127,50\nPrazo: 1 dia útil"
    },
    {
        "titulo": "500/1000 Folhetos 10x14cm - Monolucido 120g",
        "texto": "500 Folhetos | 10x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta (cores opacas) – R$204,25\n500 Folhetos | 10x14cm | Monolucido 120g fosco | Frente e Verso | Colorido | Jato de Tinta (cores opacas) – R$329,50\n\n1000 Folhetos | 10x14cm | Monolucido 120g fosco | Somente frente | Colorido | Jato de Tinta (cores opacas) – R$388,10\n1000 Folhetos | 10x14cm | Monolucido 120g fosco | Frente e Verso | Colorido | Jato de Tinta (cores opacas) – R$612,50\nPrazo: 1 dia útil"
    },
    {
        "titulo": "Ímãs 7x10cm / 7x5cm",
        "texto": "30 Imãs | 7x10cm | Com laminação fosca ou brilhante | Papel fotográfico Jato de tinta | sem arte - R$105,00\n30 Imãs | 7x5cm | Com laminação fosca ou brilhante | Papel fotográfico Jato de tinta | sem arte - R$75,00\nPrazo: 2-4 dias úteis"
    },
    {
        "titulo": "Ímã para Carro 40x30cm",
        "texto": "2 Imãs para carro | 40x30cm | Com laminação fosca | 0,8mm | Sem a arte – R$180,00"
    },
    {
        "titulo": "Adesivo Vende-se A4",
        "texto": "Adesivo de VENDE-SE | Tamanho A4 | Cor: Branca\n1 unidade – R$25,00\n2 unidades - R$45,00\n3 unidades - R$60,00"
    },
    {
        "titulo": "Wind Banner",
        "texto": "1 Wind banner completo | formato faca | 65x190cm | Tecido poliéster | Frente e verso | Impressão ultra HD sublimática | Dupla-face costurado | Base plástica | Haste desmontável curva - R$300,00\n1 Wind banner completo | formato faca | 65x250cm | Tecido poliéster | Frente e verso | Impressão ultra HD sublimática | Dupla-face costurado | Base plástica | Haste desmontável curva - R$340,00\n1 Wind banner completo | formato faca | 65x300cm | Tecido poliéster | Frente e verso | Impressão ultra HD sublimática | Dupla-face costurado | Base plástica | Haste desmontável curva - R$380,00\nPrazo: 5-7 dias úteis"
    },
    {
        "titulo": "Banner Roll-up 80x200cm",
        "texto": "1 Banner roll up | 80x200cm | Lona Brilho 440g | Somente frente | Sem verniz e sem laminação | Estrutura Inclusa - R$504,00\nPrazo: 7 dias úteis"
    },
    {
        "titulo": "Etiquetas Escolares Adesivas",
        "texto": "100 adesivos (1x5cm) + 22 adesivos (3x5cm) + 4 adesivos (8x5cm) = 126 Etiquetas\n\nMateriais:\n• Adesivo vinílico - R$58,00 (resistente a água)\nou\n• Adesivo vinílico c/ laminação fosca - R$72,00 (Maior durabilidade: resistente a lavagem comum)\n\nPrazo: Arte + Produção: 2-3 dias úteis"
    },
    {
        "titulo": "Chaveiros",
        "texto": "5 chaveiros | 4,5 x 4,5 cm | quadrado | ilhós dourado | com argolinha dourada | Frente e verso: Frente colorida com a arte escolhida e o Verso com fundo branco e texto colorido – R$40,00\nPrazo: Arte + Produção: 3-4 dias úteis"
    },
    {
        "titulo": "Etiquetas Termocolantes",
        "texto": "20 Etiquetas Termocolantes (4x1cm) + Folha de papel Manteiga para aplicação = R$20,00\n\nComo essas etiquetas estarão em atrito constante, optamos por fazer a arte com fundo branco e apenas o nome da criança colorido, para não correr o risco da etiqueta se soltar da peça de roupa.\n\nPrazo: Arte + Produção: 2 dias úteis"
    },
    {
        "titulo": "Kit Volta às Aulas",
        "texto": "• 126 Etiquetas adesivas (100 de 1x5cm + 22 de 3x5cm + 4 de 8x5cm) - Adesivo vinílico, resistente a água\n• 5 chaveiros | 4,5 x 4,5 cm | quadrado | ilhós dourado | com argolinha | Frente e verso\n• 20 Etiquetas Termocolantes (4x1cm) + Folha de papel Manteiga para aplicação\n\n3 Materiais da mesma arte - R$98,00\nPrazo: Arte + Produção: 4 dias úteis"
    }
]

data = json.dumps(orcamentos).encode("utf-8")
headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

req = urllib.request.Request(URL, data=data, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        response_data = response.read().decode("utf-8")
        print("Success:", len(json.loads(response_data)), "items inserted.")
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
