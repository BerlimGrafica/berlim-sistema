"use client";
import Icon from '@/components/Icon';
import { CustomDateRangePicker } from '@/components/ui/DateRangePicker';
import { obterDataAtual, formatarDataExibicao } from '@/lib/utils/formatters';

// Período do painel de Vendas. Existe porque "Resumo do Período" não tinha
// período nenhum: mostrava o que estivesse carregado na memória do navegador.

export const primeiroDiaDoMes = (iso) => `${iso.slice(0, 7)}-01`;

export const ultimoDiaDoMes = (iso) => {
    const [ano, mes] = iso.split('-').map(Number);
    const ultimo = new Date(ano, mes, 0).getDate();
    return `${ano}-${String(mes).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`;
};

export function periodoPadrao() {
    const hoje = obterDataAtual();
    return { inicio: primeiroDiaDoMes(hoje), fim: ultimoDiaDoMes(hoje) };
}

function atalhos() {
    const hoje = obterDataAtual();
    const ano = hoje.slice(0, 4);
    const doze = new Date(Number(ano), Number(hoje.slice(5, 7)) - 1 - 11, 1);
    const inicioDoze = `${doze.getFullYear()}-${String(doze.getMonth() + 1).padStart(2, '0')}-01`;
    return [
        { rotulo: 'Este mês', inicio: primeiroDiaDoMes(hoje), fim: ultimoDiaDoMes(hoje) },
        { rotulo: 'Este ano', inicio: `${ano}-01-01`, fim: `${ano}-12-31` },
        { rotulo: '12 meses', inicio: inicioDoze, fim: ultimoDiaDoMes(hoje) },
        { rotulo: 'Tudo', inicio: '2000-01-01', fim: '2099-12-31' },
    ];
}

export function rotuloPeriodo(inicio, fim) {
    const encontrado = atalhos().find(a => a.inicio === inicio && a.fim === fim);
    if (encontrado) return encontrado.rotulo;
    return `${formatarDataExibicao(inicio)} a ${formatarDataExibicao(fim)}`;
}

export default function SeletorPeriodo({ inicio, fim, onChange, carregando }) {
    const lista = atalhos();

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md p-1">
                {lista.map(a => {
                    const ativo = a.inicio === inicio && a.fim === fim;
                    return (
                        <button
                            key={a.rotulo}
                            type="button"
                            onClick={() => onChange(a.inicio, a.fim)}
                            className={`px-3 py-1.5 text-[12px] font-semibold rounded transition ${ativo
                                ? 'bg-brand text-white shadow-sm'
                                : 'text-gray-500 dark:text-[#888888] hover:bg-gray-100 dark:hover:bg-darkHover'}`}
                        >
                            {a.rotulo}
                        </button>
                    );
                })}
            </div>

            <CustomDateRangePicker
                startValue={inicio}
                endValue={fim}
                onChangeStart={(v) => onChange(v, fim)}
                onChangeEnd={(v) => onChange(inicio, v)}
                placeholder="Período personalizado"
                className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-md px-3 py-2 text-[12px] outline-none hover:border-brand transition dark:text-[#EDEDED] min-w-[210px]"
            />

            {carregando && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                    <Icon name="clock" className="w-3.5 h-3.5 animate-pulse" /> somando…
                </span>
            )}
        </div>
    );
}
