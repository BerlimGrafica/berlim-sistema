"use client";
import { useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { usePedidos } from '@/context/PedidosContext';
import { useFinanceiro } from '@/context/FinanceiroContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarCnpjCpf, formatarMoeda, formatarDataExibicao, mascararCliente } from '@/lib/utils/formatters';
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { CustomSelect } from '@/components/ui/Dropdown';

const OPCOES_PROTESTO = [
    { value: false, label: 'Não' },
    { value: true, label: 'Sim' },
];

const campoClass = "w-full bg-sutil border border-borda rounded px-2.5 py-1.5 text-mini outline-none hover:border-brand focus:border-brand transition text-tinta-corpo";

export default function BoletoRow({ p, statusPagamento, statusPagamentoCor }) {
    const { isDemo } = useSessao();
    const { confirmar, abrirContextMenu, avisar } = useUi();
    const { atualizarCampoInline, abrirEdicao, duplicarOS, imprimirOS } = usePedidos();
    const { atualizarPagamentoBoleto, concluirBoletoContasReceber } = useFinanceiro();

    const [cnpj, setCnpj] = useState(p.boleto_cnpj || '');
    const [numero, setNumero] = useState(p.boleto_numero || '');
    const [valor, setValor] = useState(p.boleto.valor || '');

    const pago = !!p.boleto.boleto_concluido;

    const marcarConcluido = async () => {
        if (await confirmar(`Marcar o boleto da O.S. #${p.id} como concluído? A situação mudará para "Pago".`)) {
            concluirBoletoContasReceber(p);
        }
    };

    const itensContexto = [
        { label: 'Editar', icon: 'edit-3', onClick: () => abrirEdicao(p) },
        { label: 'Duplicar', icon: 'layers', onClick: () => duplicarOS(p) },
        { label: 'Imprimir', icon: 'printer', onClick: () => imprimirOS(p) },
        { label: 'Copiar linha', icon: 'copy', onClick: () => {
            const linha = [
                `#${p.id}`, mascararCliente(p.cliente, isDemo), p.boleto_cnpj || '', p.boleto_numero || '',
                p.boleto.valor || '', formatarDataExibicao(p.boleto_data_emissao), formatarDataExibicao(p.prazo_pagamento),
                p.boleto_protesto_negativacao ? 'Sim' : 'Não', statusPagamento, ].join('\t');
            navigator.clipboard.writeText(linha);
            avisar('Linha copiada!', 'sucesso');
        }},
        ...(!pago ? [{ label: 'Marcar Boleto Concluído', icon: 'check-circle', divisorAntes: true, onClick: marcarConcluido }] : []),
    ];

    return (
        <tr onClick={() => abrirEdicao(p)} onContextMenu={(e) => abrirContextMenu(e, itensContexto)} className="hover:bg-gray-50 dark:hover:bg-darkHover/50 transition-colors cursor-pointer group">
            <td className="px-6 py-4">
                <span className="text-compacto font-bold text-tinta-fraca">#{p.id}</span>
            </td>
            <td className="px-6 py-4">
                <span className="text-corpo font-semibold text-tinta truncate max-w-[200px] block" title={mascararCliente(p.cliente, isDemo)}>{mascararCliente(p.cliente, isDemo)}</span>
            </td>
            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <input type="text" value={cnpj} onChange={e => setCnpj(formatarCnpjCpf(e.target.value))} onBlur={() => atualizarCampoInline(p.id, 'boleto_cnpj', cnpj)} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} placeholder="00.000.000/0000-00" className={campoClass} />
            </td>
            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <input type="text" value={numero} onChange={e => setNumero(e.target.value)} onBlur={() => atualizarCampoInline(p.id, 'boleto_numero', numero)} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} placeholder="Nº do boleto" className={campoClass} />
            </td>
            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mini text-gray-400 pointer-events-none">R$</span>
                    <input type="text" value={valor} onChange={e => setValor(formatarMoeda(e.target.value))} onBlur={() => atualizarPagamentoBoleto(p, { valor })} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} placeholder="0,00" className={`${campoClass} pl-7 text-right`} />
                </div>
            </td>
            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                <CustomDatePicker value={p.boleto_data_emissao || ''} onChange={val => atualizarCampoInline(p.id, 'boleto_data_emissao', val)} placeholder="Definir emissão..." clearable className={campoClass} />
            </td>
            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                <CustomDatePicker value={p.prazo_pagamento || ''} onChange={val => atualizarCampoInline(p.id, 'prazo_pagamento', val)} placeholder="Definir prazo..." clearable className={campoClass} />
            </td>
            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                <CustomSelect value={!!p.boleto_protesto_negativacao} onChange={val => atualizarCampoInline(p.id, 'boleto_protesto_negativacao', val)} options={OPCOES_PROTESTO} className={`${campoClass} cursor-pointer`} />
            </td>
            <td className="px-6 py-4 text-center">
                <span className={`whitespace-nowrap px-2.5 py-1 text-mini font-semibold rounded border ${statusPagamentoCor}`}>
                    {statusPagamento}
                </span>
            </td>
            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                {pago ? (
                    <Icon name="check-circle" className="w-4 h-4 text-emerald-500 dark:text-emerald-400 inline-block" />
                ) : (
                    <Tooltip label="Concluir Boleto">
                        <button type="button" aria-label="Concluir Boleto" onClick={marcarConcluido} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition">
                            <Icon name="check-circle" className="w-4 h-4" />
                        </button>
                    </Tooltip>
                )}
            </td>
        </tr>
    );
}
