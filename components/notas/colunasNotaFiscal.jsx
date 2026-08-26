"use client";
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { useNotasFiscais } from '@/context/NotasFiscaisContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { formatarMoeda, mascararCliente, centavosParaReais } from '@/lib/utils/formatters';

// Colunas da listagem de notas fiscais, usadas por duas telas: a rota
// /notas-fiscais (Atendimento) e a sub-aba do Financeiro.
//
// As duas tinham a mesma tabela copiada — mesmas oito colunas, mesmo menu de
// contexto, mesmas permissões, byte a byte. Duas cópias de uma regra de
// permissão são o tipo de coisa que só se descobre quando uma é corrigida e a
// outra não: alguém veria o botão de excluir numa tela e não na outra, com o
// mesmo usuário.
export function useColunasNotaFiscal() {
    const { isDemo, usuario } = useSessao();
    const { abrirContextMenu, avisar } = useUi();
    const {
        setNotaFiscalEmEdicao, setModalNotaFiscalAberto,
        concluirNotaFiscal, duplicarNotaFiscal, reabrirNotaFiscal, excluirNotaFiscal,
    } = useNotasFiscais();

    const podeFechar = usuario?.nivel === 'Administrador' || usuario?.nivel === 'Financeiro';
    const ehAdmin = usuario?.nivel === 'Administrador';

    const abrirEdicaoNota = (n) => {
        setNotaFiscalEmEdicao({ ...n, valor_pago: n.valor_pago ? formatarMoeda(Math.round(n.valor_pago).toString()) : '' });
        setModalNotaFiscalAberto(true);
    };

    const aoContextMenu = (n, e) => abrirContextMenu(e, [
        { label: 'Editar', icon: 'edit-3', onClick: () => abrirEdicaoNota(n) },
        { label: 'Duplicar', icon: 'layers', onClick: () => duplicarNotaFiscal(n) },
        ...(!n.concluido && podeFechar ? [{ label: 'Concluir Nota', icon: 'check-circle', onClick: () => concluirNotaFiscal(n.id) }] : []),
        ...(n.concluido && podeFechar ? [{ label: 'Gerar Nova Nota (Duplicar)', icon: 'rotate-ccw', onClick: () => reabrirNotaFiscal(n) }] : []),
        { label: 'Copiar linha', icon: 'copy', onClick: () => {
            navigator.clipboard.writeText([mascararCliente(n.cliente, isDemo) || n.razao_social || '', n.cnpj || '', n.contato || '', n.tipo_nota || '', n.servico_feito || ''].join('\t'));
            avisar('Linha copiada!', 'sucesso');
        }},
        ...(ehAdmin ? [{ label: 'Excluir', icon: 'trash-2', tom: 'perigo', divisorAntes: true, onClick: () => excluirNotaFiscal(n.id) }] : []),
    ]);

    const colunas = [
        {
            papel: 'titulo',
            titulo: 'Cliente / Razão Social',
            rotuloCartao: 'Cliente',
            thClassName: 'px-6 py-4 w-48',
            celula: n => (
                <>
                    <span className="block text-corpo font-semibold dark:text-[#EDEDED]">{mascararCliente(n.cliente, isDemo) || 'Sem Identificação'}</span>
                    <span className="block text-mini text-tinta-suave">{isDemo ? '' : n.razao_social}</span>
                </>
            ),
        },
        {
            papel: 'selo',
            titulo: 'Tipo Nota',
            rotuloCartao: 'Tipo',
            thClassName: 'px-6 py-4 w-32',
            tdClassName: 'px-6 py-4 text-corpo font-medium text-tinta-suave',
            celula: n => (
                <span className={`px-2 py-1 rounded text-mini font-bold ${n.tipo_nota === 'DANFE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : (n.tipo_nota === 'Serviço' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400')}`}>
                    {n.tipo_nota || 'N/A'}
                </span>
            ),
        },
        {
            // Serviço e valor são o miolo da nota — no cartão ocupam largura
            // inteira, e na tabela o w-full faz esta coluna absorver a folga, para
            // um texto longo quebrar aqui em vez de empurrar as outras colunas.
            papel: 'bloco',
            titulo: 'Serviço / Valor',
            thClassName: 'px-6 py-4 w-full min-w-[260px]',
            celula: n => (
                <>
                    <span className="block text-corpo dark:text-[#EDEDED]">{n.servico_feito || <span className="text-gray-400 italic">Pendente</span>}</span>
                    <span className="block text-mini font-semibold text-orange-500 dark:text-orange-400">{n.valor_pago ? `R$ ${centavosParaReais(n.valor_pago).toFixed(2).replace('.', ',')}` : ''}</span>
                </>
            ),
        },
        {
            titulo: 'CPF / CNPJ',
            thClassName: 'px-6 py-4 w-36',
            tdClassName: 'px-6 py-4 text-corpo dark:text-[#EDEDED] whitespace-nowrap',
            celula: n => n.cnpj,
        },
        {
            titulo: 'Contato',
            thClassName: 'px-6 py-4 w-40',
            tdClassName: 'px-6 py-4 text-corpo dark:text-[#EDEDED] whitespace-nowrap',
            celula: n => n.contato ? (
                <span className="flex items-center gap-1.5 justify-end lg:justify-start">
                    <Icon name={n.forma_envio === 'E-mail' ? 'mail' : 'phone'} className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {n.contato}
                </span>
            ) : <span className="text-gray-400">---</span>,
        },
        {
            titulo: 'Observações',
            thClassName: 'px-6 py-4 w-48',
            tdClassName: 'px-6 py-4 text-corpo text-tinta-suave max-w-[200px] truncate',
            celula: n => <span title={n.observacoes || ''}>{n.observacoes || <span className="text-gray-400 italic">---</span>}</span>,
        },
        {
            titulo: 'Data',
            thClassName: 'px-6 py-4 w-28',
            tdClassName: 'px-6 py-4 text-corpo dark:text-[#EDEDED] whitespace-nowrap',
            celula: n => new Date(n.created_at).toLocaleDateString('pt-BR'),
        },
        {
            papel: 'acoes',
            titulo: 'Ações',
            thClassName: 'px-6 py-4 w-24 text-right',
            tdClassName: 'px-6 py-4 text-right',
            celula: n => (
                <div className="flex items-center justify-end gap-2">
                    {!n.concluido && podeFechar && (
                        <Tooltip label="Concluir Nota">
                            <button onClick={(e) => { e.stopPropagation(); concluirNotaFiscal(n.id); }} aria-label="Concluir Nota" className="p-2 text-sucesso hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition">
                                <Icon name="check-circle" className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    )}
                    {n.concluido && podeFechar && (
                        <Tooltip label="Gerar Nova Nota (Duplicar)">
                            <button onClick={(e) => { e.stopPropagation(); reabrirNotaFiscal(n); }} aria-label="Gerar Nova Nota (Duplicar)" className="p-2 text-info hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition">
                                <Icon name="rotate-ccw" className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    )}
                    {ehAdmin && (
                        <Tooltip label="Excluir Nota">
                            <button onClick={(e) => { e.stopPropagation(); excluirNotaFiscal(n.id); }} aria-label="Excluir Nota" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition">
                                <Icon name="trash-2" className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    return { colunas, aoClicar: abrirEdicaoNota, aoContextMenu };
}
