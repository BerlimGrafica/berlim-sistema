"use client";
import { corPorNome } from '@/lib/utils/formatters';

// A bolinha de uma pessoa: a foto do Google quando ela vinculou a conta, senão
// as iniciais na cor do nome — a mesma do chat, das etiquetas e da barra.
export function iniciais(nome) {
    if (!nome) return '?';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function Avatar({ nome, avatarUrl, className = 'w-7 h-7 text-micro' }) {
    if (avatarUrl) {
        return <img src={avatarUrl} alt={nome} referrerPolicy="no-referrer" className={`${className} rounded-full object-cover shrink-0`} />;
    }
    const { bg, text } = corPorNome(nome);
    return (
        <div title={nome} className={`${className} rounded-full ${bg} flex items-center justify-center font-bold ${text} shrink-0`}>
            {iniciais(nome)}
        </div>
    );
}
