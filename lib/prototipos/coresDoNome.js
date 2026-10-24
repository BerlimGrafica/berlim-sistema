import { corPorNome } from '@/lib/utils/formatters';

// Os protótipos em public/prototipos são HTML puro: não enxergam as classes do
// Tailwind que corPorNome devolve. Aqui cada classe vira o hex dela, para que a
// cor de uma pessoa ou de um local no protótipo seja a mesma do sistema.
const HEX_POR_CLASSE = {
    'bg-green-500': '#22c55e', 'bg-black': '#000000', 'bg-purple-400': '#c084fc', 'bg-red-500': '#ef4444',
    'bg-yellow-400': '#facc15', 'bg-orange-500': '#f97316', 'bg-blue-500': '#3b82f6', 'bg-fuchsia-500': '#d946ef',
    'bg-teal-600': '#0d9488', 'bg-teal-500': '#14b8a6', 'bg-lime-600': '#65a30d', 'bg-rose-500': '#f43f5e',
    'bg-indigo-500': '#6366f1', 'bg-slate-500': '#64748b', 'bg-amber-500': '#f59e0b', 'bg-emerald-500': '#10b981',
    'bg-sky-500': '#0ea5e9',
};

// [fundo, texto] em hex.
export function corDoNome(nome) {
    const { bg, text } = corPorNome(nome);
    return [HEX_POR_CLASSE[bg] || '#64748b', text === 'text-gray-900' ? '#111827' : '#ffffff'];
}
