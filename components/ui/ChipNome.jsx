import { corPorNome, corContornoPorNome } from '@/lib/utils/formatters';

// Chip/pílula com cor consistente pro nome — usado pra responsáveis e locais.
//
// `variante`:
//   'cheio'    fundo na cor do nome, texto branco (o padrão; responsáveis)
//   'contorno' fundo da superfície, texto e contorno na cor (locais) — leve o
//              bastante para ficar embaixo do nome do cliente sem competir com
//              ele, e a cor continua dizendo de que local se trata
export function ChipNome({ nome, className = '', variante = 'cheio' }) {
    const cores = variante === 'contorno'
        ? `bg-superficie border ${corContornoPorNome(nome)}`
        : (() => { const { bg, text } = corPorNome(nome); return `${bg} ${text}`; })();
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-micro font-semibold leading-tight truncate ${cores} ${className}`} title={nome}>
            {nome}
        </span>
    );
}
