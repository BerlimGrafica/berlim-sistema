// Carregando: a barra de controle de cor da impressão (C, M, Y, K), um
// quadrado de cada vez. É para a espera que não tem o que desenhar ainda —
// abrir o sistema, a primeira ida a uma tela. Lista que está chegando continua
// com as linhas de espera (SkeletonLinhas), que já mostram a forma do que vem.
// O estilo está em app/globals.css (.barra-de-cor).
export default function BarraDeCor({ texto = 'Carregando', mostrarTexto = false, className = '' }) {
    return (
        <div role="status" className={`inline-flex flex-col items-center gap-3 ${className}`}>
            <span aria-hidden="true" className="barra-de-cor"><i /><i /><i /><i /></span>
            {mostrarTexto
                ? <span className="text-[12.5px] font-medium text-tinta-suave">{texto}…</span>
                : <span className="sr-only">{texto}</span>}
        </div>
    );
}
