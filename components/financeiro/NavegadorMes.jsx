"use client";
import Icon from '@/components/Icon';
import { CustomSelect } from '@/components/ui/Dropdown';
import { MESES } from '@/lib/utils/constants';
import { obterDataAtual } from '@/lib/utils/formatters';

// O mês é sempre uma string 'AAAA-MM', do mesmo formato que `vencimento` usa no
// banco. Isso deixa o filtro ser um startsWith, sem cálculo de primeiro/último
// dia e sem Date — que é onde o fuso costuma estragar a conta de mês.
export const mesCorrente = () => obterDataAtual().slice(0, 7);

export const mesDe = (data) => (data ? String(data).slice(0, 7) : '');

export const rotuloMes = (mes) => {
    if (!mes) return 'Todo o período';
    const [ano, m] = mes.split('-').map(Number);
    return `${MESES[m - 1]} ${ano}`;
};

// Aritmética em meses absolutos desde o ano 0: evita o Date, que viraria
// 31/02 → 03/03 ao andar de janeiro para fevereiro.
export const somarMeses = (mes, passo) => {
    const [ano, m] = mes.split('-').map(Number);
    const total = ano * 12 + (m - 1) + passo;
    return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
};

// Setas para andar mês a mês, um seletor para pular direto e um atalho de volta
// ao mês atual. `meses` são os que existem nos dados — a lista do seletor não
// inventa períodos vazios, mas as setas continuam alcançando qualquer um.
export function NavegadorMes({ valor, aoMudar, meses = [], className = '' }) {
    const atual = mesCorrente();
    const conhecidos = [...new Set([...meses, atual, ...(valor ? [valor] : [])])].sort().reverse();
    const opcoes = [
        ...conhecidos.map(m => ({ value: m, label: rotuloMes(m) })),
        { value: '', label: 'Todo o período' },
    ];

    // stroke-[3] engrossa o traço: o SVG do Icon vem com stroke-width="2" como
    // atributo, e regra de CSS ganha de atributo de apresentação.
    const Seta = ({ passo, rotulo, icone }) => (
        <button
            type="button"
            onClick={() => aoMudar(somarMeses(valor || atual, passo))}
            disabled={!valor}
            aria-label={rotulo}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-brand hover:bg-brand/10 transition disabled:opacity-30 disabled:hover:bg-transparent"
        >
            <Icon name={icone} className="w-6 h-6 stroke-[3]" />
        </button>
    );

    return (
        // O grupo mês+setas é centralizado, e "Hoje" fica fora do fluxo, preso à
        // direita: no fluxo normal, ele apareceria e sumiria conforme o mês
        // selecionado e empurraria o nome do mês para os lados a cada clique.
        <div className={`relative flex items-center justify-center gap-1 ${className}`}>
            <Seta passo={-1} rotulo="Mês anterior" icone="chevron-left" />
            {/* Sem caixa: o seletor encolhe até o conteúdo, então o
                justify-between de dentro do CustomSelect não tem folga para
                distribuir e o rótulo fica colado na setinha dele. */}
            <CustomSelect
                value={valor}
                onChange={aoMudar}
                options={opcoes}
                className="px-1 py-1 text-xl font-bold text-tinta hover:text-brand transition cursor-pointer"
            />
            <Seta passo={1} rotulo="Próximo mês" icone="chevron-right" />
            <button
                type="button"
                onClick={() => aoMudar(atual)}
                className={`absolute right-0 shrink-0 h-8 px-2.5 rounded-md text-mini font-semibold text-tinta-suave hover:text-brand hover:bg-brand/10 transition ${valor === atual ? 'invisible' : ''}`}
            >
                Hoje
            </button>
        </div>
    );
}
