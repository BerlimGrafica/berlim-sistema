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

// `aoMudarPeriodo` é o próprio setState do VendasTab, e não um callback
// (inicio, fim). O CustomDateRangePicker chama onChangeStart e onChangeEnd no
// MESMO evento ao começar um período novo, e as duas chamadas enxergam as props
// da renderização atual: montar o par a partir delas fazia a segunda desfazer a
// primeira, devolvendo o início ao valor antigo — a data de início não mudava
// nunca. Com atualização funcional, cada uma altera só o seu campo.
export default function SeletorPeriodo({ inicio, fim, aoMudarPeriodo, carregando }) {
    const lista = atalhos();

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-superficie border border-borda rounded-md p-1">
                {lista.map(a => {
                    const ativo = a.inicio === inicio && a.fim === fim;
                    return (
                        <button
                            key={a.rotulo}
                            type="button"
                            onClick={() => aoMudarPeriodo({ inicio: a.inicio, fim: a.fim })}
                            className={`px-3 py-1.5 text-compacto font-semibold rounded transition ${ativo
                                ? 'bg-brand text-white shadow-sm'
                                : 'text-tinta-suave hover:bg-realce'}`}
                        >
                            {a.rotulo}
                        </button>
                    );
                })}
            </div>

            <CustomDateRangePicker
                startValue={inicio}
                endValue={fim}
                onChangeStart={(v) => aoMudarPeriodo(p => ({ ...p, inicio: v }))}
                onChangeEnd={(v) => aoMudarPeriodo(p => ({ ...p, fim: v }))}
                placeholder="Período personalizado"
                className="bg-superficie border border-borda rounded-md px-3 py-2 text-compacto outline-none hover:border-brand transition dark:text-[#EDEDED] min-w-[210px]"
            />

            {carregando && (
                <span className="flex items-center gap-1.5 text-mini font-semibold text-gray-400">
                    <Icon name="clock" className="w-3.5 h-3.5 animate-pulse" /> somando…
                </span>
            )}
        </div>
    );
}
