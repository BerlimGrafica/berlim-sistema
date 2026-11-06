// Carregando: o logo sendo impresso. Ele fica em cinza, como a chapa, e a tinta
// entra por cima e sai por baixo, barra a barra. É para a espera que não tem o
// que desenhar ainda — abrir o sistema, a primeira ida a uma tela. Lista que está
// chegando continua com as linhas de espera (SkeletonLinhas), que já mostram a
// forma do que vem.
// O estilo está em app/globals.css (.logo-carregando). Só CSS: esta tela aparece
// antes de o JavaScript da página rodar.
export default function LogoCarregando({ texto = 'Carregando', mostrarTexto = false, className = '' }) {
    return (
        <div role="status" className={`logo-carregando-caixa inline-flex flex-col items-center gap-3.5 ${className}`}>
            <span aria-hidden="true" className="logo-carregando">
                <span className="logo-barra"><i /></span>
                <span className="logo-barra"><i /></span>
                <span className="logo-partida">
                    <span className="logo-barra"><i /></span>
                    <span className="logo-barra"><i /></span>
                </span>
                <span className="logo-barra"><i /></span>
            </span>
            {mostrarTexto
                ? <span className="text-[12.5px] font-medium text-tinta-suave">{texto}…</span>
                : <span className="sr-only">{texto}</span>}
        </div>
    );
}
