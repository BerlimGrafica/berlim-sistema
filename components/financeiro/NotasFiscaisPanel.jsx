"use client";
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import Icon from '@/components/Icon';
import { SkeletonLinhas } from '@/components/ui/SkeletonLinhas';
import Tooltip from '@/components/Tooltip';
import { formatarMoeda, centavosParaReais, mascararCliente } from '@/lib/utils/formatters';

export default function NotasFiscaisPanel() {
    const { isDemo, usuario } = useSessao();
    const { abrirContextMenu, avisar } = useUi();
    const { notasFiscaisPaginadas, dadosCarregados, setNotaFiscalEmEdicao, setModalNotaFiscalAberto, concluirNotaFiscal, duplicarNotaFiscal, reabrirNotaFiscal, excluirNotaFiscal, totalPaginasNotasFiscais, paginaNotasFiscais, setPaginaNotasFiscais } = useNotasFiscais();

    const abrirEdicaoNota = (n) => {
        setNotaFiscalEmEdicao({ ...n, valor_pago: n.valor_pago ? formatarMoeda(Math.round(n.valor_pago).toString()) : '' });
        setModalNotaFiscalAberto(true);
    };

    const montarItensContexto = (n) => [
        { label: 'Editar', icon: 'edit-3', onClick: () => abrirEdicaoNota(n) },
        { label: 'Duplicar', icon: 'layers', onClick: () => duplicarNotaFiscal(n) },
        ...(!n.concluido && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') ? [{ label: 'Concluir Nota', icon: 'check-circle', onClick: () => concluirNotaFiscal(n.id) }] : []),
        ...(n.concluido && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') ? [{ label: 'Gerar Nova Nota (Duplicar)', icon: 'rotate-ccw', onClick: () => reabrirNotaFiscal(n) }] : []),
        { label: 'Copiar linha', icon: 'copy', onClick: () => {
            const linha = [mascararCliente(n.cliente, isDemo) || n.razao_social || '', n.cnpj || '', n.contato || '', n.tipo_nota || '', n.servico_feito || ''].join('\t');
            navigator.clipboard.writeText(linha);
            avisar('Linha copiada!', 'sucesso');
        }},
        ...(usuario?.nivel === 'Administrador' ? [{ label: 'Excluir', icon: 'trash-2', tom: 'perigo', divisorAntes: true, onClick: () => excluirNotaFiscal(n.id) }] : []),
    ];

    return (
        <div>
            <div className="bg-superficie border border-borda rounded overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-50/50 dark:bg-darkHover/50 border-t-2 border-brand">
                            <tr className="border-b border-borda text-corpo font-semibold text-tinta-suave tracking-wide uppercase">
                                <th className="px-6 py-4 w-28">Data</th>
                                <th className="px-6 py-4 w-48">Cliente / Razão Social</th>
                                <th className="px-6 py-4 w-36">CPF / CNPJ</th>
                                <th className="px-6 py-4 w-40">Contato</th>
                                <th className="px-6 py-4 w-32">Tipo Nota</th>
                                {/* w-full faz esta coluna absorver toda a folga da tabela, mesmo
                                    padrão do "Serviço" na Produção. Antes era só min-w-[260px]:
                                    como o layout automático dimensiona pelo conteúdo, o texto longo
                                    de uma nota concluída esticava a coluna, a tabela estourava o
                                    container e o overflow-x-auto levava a coluna Ações pra fora da
                                    vista. Com w-full a folga vem toda daqui e o texto quebra em vez
                                    de empurrar as outras colunas. */}
                                <th className="px-6 py-4 w-full min-w-[260px]">Serviço / Valor</th>
                                <th className="px-6 py-4 w-48">Observações</th>
                                <th className="px-6 py-4 w-24 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notasFiscaisPaginadas.map(n => (
                                <tr key={n.id} onClick={() => abrirEdicaoNota(n)} onContextMenu={(e) => abrirContextMenu(e, montarItensContexto(n))} className="border-b border-borda-fraca hover:bg-sutil transition cursor-pointer">
                                    <td className="px-6 py-4 text-corpo dark:text-[#EDEDED] whitespace-nowrap">{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-corpo font-semibold dark:text-[#EDEDED]">{mascararCliente(n.cliente, isDemo) || 'Sem Identificação'}</div>
                                        <div className="text-mini text-tinta-suave">{isDemo ? '' : n.razao_social}</div>
                                    </td>
                                    <td className="px-6 py-4 text-corpo dark:text-[#EDEDED] whitespace-nowrap">{n.cnpj}</td>
                                    <td className="px-6 py-4 text-corpo dark:text-[#EDEDED] whitespace-nowrap">
                                        {n.contato ? (
                                            <div className="flex items-center gap-1.5">
                                                <Icon name={n.forma_envio === 'E-mail' ? 'mail' : 'phone'} className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                {n.contato}
                                            </div>
                                        ) : <span className="text-gray-400">---</span>}
                                    </td>
                                    <td className="px-6 py-4 text-corpo font-medium text-tinta-suave">
                                        <span className={`px-2 py-1 rounded text-mini font-bold ${n.tipo_nota === 'DANFE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : (n.tipo_nota === 'Serviço' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400')}`}>
                                            {n.tipo_nota || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-corpo dark:text-[#EDEDED]">{n.servico_feito || <span className="text-gray-400 italic">Pendente</span>}</div>
                                        <div className="text-mini font-semibold text-orange-500 dark:text-orange-400">{n.valor_pago ? `R$ ${centavosParaReais(n.valor_pago).toFixed(2).replace('.', ',')}` : ''}</div>
                                    </td>
                                    <td className="px-6 py-4 text-corpo text-tinta-suave max-w-[200px] truncate" title={n.observacoes || ''}>
                                        {n.observacoes || <span className="text-gray-400 italic">---</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">

                                            {!n.concluido && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                                                <Tooltip label="Concluir Nota">
                                                    <button onClick={(e) => { e.stopPropagation(); concluirNotaFiscal(n.id); }} aria-label="Concluir Nota" className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition">
                                                        <Icon name="check-circle" className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {n.concluido && (usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro') && (
                                                <Tooltip label="Gerar Nova Nota (Duplicar)">
                                                    <button onClick={(e) => { e.stopPropagation(); reabrirNotaFiscal(n); }} aria-label="Gerar Nova Nota (Duplicar)" className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition">
                                                        <Icon name="rotate-ccw" className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {usuario?.nivel === 'Administrador' && (
                                                <Tooltip label="Excluir Nota">
                                                    <button onClick={(e) => { e.stopPropagation(); excluirNotaFiscal(n.id); }} aria-label="Excluir Nota" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition">
                                                        <Icon name="trash-2" className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!dadosCarregados && notasFiscaisPaginadas.length === 0 && (
                                <SkeletonLinhas colunas={8} />
                            )}
                            {dadosCarregados && notasFiscaisPaginadas.length === 0 && (
                                <tr><td colSpan="8" className="px-4 py-12 text-center text-corpo text-gray-400">Nenhuma nota fiscal encontrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPaginasNotasFiscais > 1 && (
                    <div className="mt-6 flex justify-between items-center p-4 border-t border-borda">
                        <button onClick={() => setPaginaNotasFiscais(Math.max(1, paginaNotasFiscais - 1))} disabled={paginaNotasFiscais === 1} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Anterior</button>
                        <span className="text-corpo font-semibold dark:text-white">Página {paginaNotasFiscais} de {totalPaginasNotasFiscais}</span>
                        <button onClick={() => setPaginaNotasFiscais(Math.min(totalPaginasNotasFiscais, paginaNotasFiscais + 1))} disabled={paginaNotasFiscais === totalPaginasNotasFiscais} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Próxima</button>
                    </div>
                )}
            </div>
        </div>
    );
}
