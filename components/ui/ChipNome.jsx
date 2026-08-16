import { corPorNome } from '@/lib/utils/formatters';

// Chip/pílula com fundo colorido consistente pro nome — usado pra responsáveis e locais.
export function ChipNome({ nome, className = '' }) {
    const { bg, text } = corPorNome(nome);
    return (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-micro font-semibold ${text} leading-tight truncate ${bg} ${className}`} title={nome}>
            {nome}
        </span>
    );
}
