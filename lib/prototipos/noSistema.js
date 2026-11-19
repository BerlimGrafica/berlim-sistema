// As telas novas (public/prototipos/*.html) foram desenhadas para abrir sozinhas,
// com uma barra no topo que faz o papel do cabeçalho do sistema: o nome da
// tela, uma nota e um botão de tema próprio. Dentro do sistema essa barra
// sobra — o cabeçalho de verdade já está em cima — e o tema tem de ser o do
// sistema, o botão ao lado do sino.
//
// Esta função prepara o HTML de qualquer tela nova para rodar dentro do
// sistema, num lugar só, em vez de cada protótipo resolver do seu jeito:
//   - esconde a barra (.proto) e zera a altura que ela ocupava
//     (--altura-cabecalho), de onde as gavetas e as faixas presas se medem;
//   - segue o tema da página do sistema: começa com ele e acompanha cada troca.
//     O iframe é da mesma origem, então lê a classe `dark` do <html> lá de fora
//     (a mesma que o botão do sistema liga, em hooks/useAuth.js) e observa
//     quando ela muda. Depois de trocar, redesenha a tela, para o que é
//     calculado com as cores do tema (gráficos) acompanhar.
//
// Aberto sozinho (fora do sistema), o protótipo continua com a barra e o
// botão de tema dele.
const CSS = `<style id="no-sistema">
.proto { display: none !important; }
html { --altura-cabecalho: 0px !important; }
</style>`;

const SCRIPT = `<script>(() => {
  let fora;
  try { fora = window.parent !== window ? window.parent.document.documentElement : null; } catch (e) { fora = null; }
  if (!fora) return;
  const raiz = document.documentElement;
  const aplicar = (redesenhar) => {
    const escuro = fora.classList.contains('dark');
    if (raiz.classList.contains('dark') === escuro) return;
    raiz.classList.toggle('dark', escuro);
    if (redesenhar && typeof render === 'function') { try { render(); } catch (e) {} }
  };
  aplicar(false);
  new MutationObserver(() => aplicar(true)).observe(fora, { attributes: true, attributeFilter: ['class'] });
})();</script>`;

export function prepararNoSistema(html) {
    if (!html) return html;
    const fimBody = html.lastIndexOf('</body>');
    const comScript = fimBody >= 0 ? html.slice(0, fimBody) + SCRIPT + html.slice(fimBody) : html + SCRIPT;
    return comScript.replace('</head>', `${CSS}</head>`);
}
