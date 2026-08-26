"use client";
import { useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarCnpjCpf, formatarMoeda, formatarDataExibicao, mascararCliente, obterDataAtual } from '@/lib/utils/formatters';
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { CustomSelect } from '@/components/ui/Dropdown';

const OPCOES_PROTESTO = [
    { value: false, label: 'Não' },
    { value: true, label: 'Sim' },
];

const campoClass = "w-full bg-sutil border border-borda rounded px-2.5 py-1.5 text-mini outline-none hover:border-brand focus:border-brand transition text-tinta-corpo";

// Campo que guarda o próprio rascunho e só grava ao sair (ou no Enter).
//
// Antes CNPJ, número e valor eram três estados no componente da linha inteira.
// Com a linha virando definição de colunas — que é declarada uma vez para a
// lista toda —, o estado desce para onde de fato pertence: o campo. De quebra,
// digitar o CNPJ deixa de re-renderizar o valor ao lado.
function CampoRascunho({ inicial, aoConfirmar, formatar, prefixo, className = '', ...props }) {
    const [valor, setValor] = useState(inicial ?? '');
    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            {prefixo && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mini text-gray-400 pointer-events-none">{prefixo}</span>}
            <input
                type="text"
                value={valor}
                onChange={e => setValor(formatar ? formatar(e.target.value) : e.target.value)}
                onBlur={() => aoConfirmar(valor)}
                onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                className={`${campoClass} ${className}`}
                {...props}
            />
        </div>
    );
}

// Envolve os controles que abrem popover (datas, seleção) para o clique não
// vazar para a linha e abrir a O.S. por baixo.
function SemPropagar({ children }) {
    return <div onClick={(e) => e.stopPropagation()}>{children}</div>;
}

// A situação do boleto é derivada do prazo, não guardada — por isso vive aqui e
// não no banco. "amanhã" sai da própria string de hoje, e não de um Date novo,
// para dar exatamente um dia de diferença no fuso de obterDataAtual.
export function situacaoBoleto(p) {
    const hojeStr = obterDataAtual();
    const [ano, mes, dia] = hojeStr.split('-').map(Number);
    const amanha = new Date(ano, mes - 1, dia + 1);
    const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

    if (p.boleto.boleto_concluido) return { label: 'Pago', cor: 'bg-emerald-50 text-sucesso border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' };
    if (p.prazo_pagamento && p.prazo_pagamento < hojeStr) return { label: 'Vencido', cor: 'bg-red-50 text-perigo border-red-200 dark:bg-red-900/30 dark:border-red-800' };
    if (p.prazo_pagamento === hojeStr) return { label: 'Vence hoje', cor: 'bg-amber-50 text-aviso border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' };
    if (p.prazo_pagamento === amanhaStr) return { label: 'Vence amanhã', cor: 'bg-amber-50 text-aviso border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' };
    return { label: 'A Pagar', cor: 'bg-realce text-tinta-suave border-borda-forte' };
}

export function useColunasBoleto() {
    const { isDemo } = useSessao();
    const { confirmar, abrirContextMenu, avisar } = useUi();
    const { atualizarCampoInline, abrirEdicao, duplicarOS, imprimirOS } = usePedidos();
    const { atualizarPagamentoBoleto, concluirBoletoContasReceber } = useFinanceiro();

    const marcarConcluido = async (p) => {
        if (await confirmar(`Marcar o boleto da O.S. #${p.id} como concluído? A situação mudará para "Pago".`)) {
            concluirBoletoContasReceber(p);
        }
    };

    const aoContextMenu = (p, e) => abrirContextMenu(e, [
        { label: 'Editar', icon: 'edit-3', onClick: () => abrirEdicao(p) },
        { label: 'Duplicar', icon: 'layers', onClick: () => duplicarOS(p) },
        { label: 'Imprimir', icon: 'printer', onClick: () => imprimirOS(p) },
        { label: 'Copiar linha', icon: 'copy', onClick: () => {
            navigator.clipboard.writeText([
                `#${p.id}`, mascararCliente(p.cliente, isDemo), p.boleto_cnpj || '', p.boleto_numero || '',
                p.boleto.valor || '', formatarDataExibicao(p.boleto_data_emissao), formatarDataExibicao(p.prazo_pagamento),
                situacaoBoleto(p).label,
            ].join('\t'));
            avisar('Linha copiada!', 'sucesso');
        }},
        ...(!p.boleto.boleto_concluido ? [{ label: 'Marcar Boleto Concluído', icon: 'check-circle', divisorAntes: true, onClick: () => marcarConcluido(p) }] : []),
    ]);

    const colunas = [
        {
            papel: 'titulo',
            titulo: 'O.S.',
            celula: p => <span className="text-compacto font-bold text-tinta-fraca">#{p.id}</span>,
        },
        {
            papel: 'subtitulo',
            titulo: 'Cliente',
            celula: p => (
                <span className="text-corpo font-semibold text-tinta truncate max-w-[200px] block" title={mascararCliente(p.cliente, isDemo)}>
                    {mascararCliente(p.cliente, isDemo)}
                </span>
            ),
        },
        {
            papel: 'selo',
            titulo: 'Situação',
            thClassName: 'px-6 py-4 w-32 text-center',
            tdClassName: 'px-6 py-4 text-center',
            celula: p => {
                const s = situacaoBoleto(p);
                return <span className={`whitespace-nowrap px-2.5 py-1 text-mini font-semibold rounded border ${s.cor}`}>{s.label}</span>;
            },
        },
        {
            papel: 'bloco',
            titulo: 'Valor',
            thClassName: 'px-6 py-4 w-40 text-right',
            celula: p => (
                <CampoRascunho
                    key={`valor-${p.id}`}
                    inicial={p.boleto.valor}
                    formatar={formatarMoeda}
                    prefixo="R$"
                    placeholder="0,00"
                    className="pl-7 text-right"
                    aoConfirmar={valor => atualizarPagamentoBoleto(p, { valor })}
                />
            ),
        },
        {
            papel: 'bloco',
            titulo: 'CNPJ',
            thClassName: 'px-6 py-4 w-52',
            celula: p => (
                <CampoRascunho
                    key={`cnpj-${p.id}`}
                    inicial={p.boleto_cnpj}
                    formatar={formatarCnpjCpf}
                    placeholder="00.000.000/0000-00"
                    aoConfirmar={v => atualizarCampoInline(p.id, 'boleto_cnpj', v)}
                />
            ),
        },
        {
            papel: 'bloco',
            titulo: 'Número do Boleto',
            rotuloCartao: 'Número',
            thClassName: 'px-6 py-4 w-48',
            celula: p => (
                <CampoRascunho
                    key={`numero-${p.id}`}
                    inicial={p.boleto_numero}
                    placeholder="Nº do boleto"
                    aoConfirmar={v => atualizarCampoInline(p.id, 'boleto_numero', v)}
                />
            ),
        },
        {
            papel: 'bloco',
            titulo: 'Data de Emissão',
            rotuloCartao: 'Emissão',
            thClassName: 'px-6 py-4 w-36 text-center',
            tdClassName: 'px-6 py-4 text-center',
            celula: p => (
                <SemPropagar>
                    <CustomDatePicker value={p.boleto_data_emissao || ''} onChange={val => atualizarCampoInline(p.id, 'boleto_data_emissao', val)} placeholder="Definir emissão..." clearable className={campoClass} />
                </SemPropagar>
            ),
        },
        {
            papel: 'bloco',
            titulo: 'Prazo',
            thClassName: 'px-6 py-4 w-36 text-center',
            tdClassName: 'px-6 py-4 text-center',
            celula: p => (
                <SemPropagar>
                    <CustomDatePicker value={p.prazo_pagamento || ''} onChange={val => atualizarCampoInline(p.id, 'prazo_pagamento', val)} placeholder="Definir prazo..." clearable className={campoClass} />
                </SemPropagar>
            ),
        },
        {
            papel: 'bloco',
            titulo: <>Protesto/<br />Negativação</>,
            rotuloCartao: 'Protesto / Negativação',
            thClassName: 'px-6 py-4 w-28 text-center',
            tdClassName: 'px-6 py-4 text-center',
            celula: p => (
                <SemPropagar>
                    <CustomSelect value={!!p.boleto_protesto_negativacao} onChange={val => atualizarCampoInline(p.id, 'boleto_protesto_negativacao', val)} options={OPCOES_PROTESTO} className={`${campoClass} cursor-pointer`} />
                </SemPropagar>
            ),
        },
        {
            papel: 'acoes',
            titulo: 'Ação',
            thClassName: 'px-6 py-4 w-24 text-center',
            tdClassName: 'px-6 py-4 text-center',
            celula: p => p.boleto.boleto_concluido ? (
                <Icon name="check-circle" className="w-4 h-4 text-emerald-500 dark:text-emerald-400 inline-block" />
            ) : (
                <Tooltip label="Concluir Boleto">
                    <button type="button" aria-label="Concluir Boleto" onClick={(e) => { e.stopPropagation(); marcarConcluido(p); }} className="p-2 text-sucesso hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition">
                        <Icon name="check-circle" className="w-4 h-4" />
                    </button>
                </Tooltip>
            ),
        },
    ];

    return { colunas, aoClicar: abrirEdicao, aoContextMenu };
}
