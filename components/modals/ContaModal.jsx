"use client";
import { useCadastros } from "@/context/CadastrosContext";
import { useFinanceiro } from "@/context/FinanceiroContext";
import Icon from "@/components/Icon";
import { formatarMoeda } from '@/lib/utils/formatters';
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { CustomSelect } from '@/components/ui/Dropdown';
import { ToggleCard } from '@/components/ui/ToggleCard';
import { useModal } from '@/components/modals/useModal';

const CATEGORIAS_CONTA = [
    { value: 'Despesa', label: 'Despesa', icon: 'dollar-sign', corBorda: 'border-emerald-500', corFundo: 'bg-emerald-50 dark:bg-emerald-900/20', corIcone: 'bg-emerald-500', corTexto: 'text-emerald-700 dark:text-emerald-300' },
    { value: 'Material', label: 'Material', icon: 'shopping-bag', corBorda: 'border-blue-500', corFundo: 'bg-blue-50 dark:bg-blue-900/20', corIcone: 'bg-blue-500', corTexto: 'text-blue-700 dark:text-blue-300' },
    { value: 'Manutenção', label: 'Manutenção', icon: 'wrench', corBorda: 'border-amber-500', corFundo: 'bg-amber-50 dark:bg-amber-900/20', corIcone: 'bg-amber-500', corTexto: 'text-amber-700 dark:text-amber-300' },
    { value: 'Terceirização', label: 'Terceirização', icon: 'package', corBorda: 'border-purple-500', corFundo: 'bg-purple-50 dark:bg-purple-900/20', corIcone: 'bg-purple-500', corTexto: 'text-purple-700 dark:text-purple-300' },
    // Imposto não tem fornecedor: a conta é descrita à mão, como a Despesa.
    // Quem decide isso é tipoFornecedorContaNecessario, logo abaixo.
    { value: 'Impostos', label: 'Impostos', icon: 'file-text', corBorda: 'border-rose-500', corFundo: 'bg-rose-50 dark:bg-rose-900/20', corIcone: 'bg-rose-500', corTexto: 'text-rose-700 dark:text-rose-300' },
];

export default function ContaModal() {
    const { fornecedores } = useCadastros();
    const { modalContaAberto, setModalContaAberto, novaConta, setNovaConta, salvandoConta, salvarConta } = useFinanceiro();
    const modal = useModal(modalContaAberto, () => setModalContaAberto(false));

    const tipoFornecedorContaNecessario = novaConta.categoria === 'Manutenção' ? 'Manutenção' : novaConta.categoria === 'Terceirização' ? 'Terceirização' : novaConta.categoria === 'Material' ? 'Material' : null;
    const fornecedoresParaConta = tipoFornecedorContaNecessario ? fornecedores.filter(f => f.tipo === tipoFornecedorContaNecessario) : [];

    if (!modalContaAberto) return null;

    return (
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-fundo w-full max-w-none sm:max-w-lg h-full sm:h-auto rounded-none sm:rounded shadow-2xl overflow-hidden border border-borda animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                    <h3 className="font-semibold text-lg tracking-tight">{novaConta.id ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</h3>
                    <button onClick={modal.fechar} className="text-white/70 hover:text-white transition"><Icon name="x" /></button>
                </div>
                <form onSubmit={salvarConta} className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-corpo font-medium text-tinta-corpo">Categoria</label>
                        {/* Três por linha com cinco categorias fecha em 3+2. Em quatro
                            colunas a quinta ficaria sozinha, e em cinco cada botão teria
                            ~85px — "Terceirização" não caberia numa linha. */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {CATEGORIAS_CONTA.map(opt => {
                                const selecionado = (novaConta.categoria || 'Despesa') === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setNovaConta({...novaConta, categoria: opt.value, fornecedor_id: null, descricao: ''})}
                                        className={`group relative flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border-2 transition-all cursor-pointer ${selecionado ? `${opt.corBorda} ${opt.corFundo} shadow-sm` : 'border-borda bg-elevado hover:border-gray-300 dark:hover:border-darkHover hover:bg-gray-50 dark:hover:bg-darkHover/50'}`}
                                    >
                                        {selecionado && (
                                            <span className={`absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-white ${opt.corIcone}`}>
                                                <Icon name="check" className="w-2.5 h-2.5" />
                                            </span>
                                        )}
                                        <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${selecionado ? `${opt.corIcone} text-white` : 'bg-realce text-tinta-fraca group-hover:text-tinta-suave'}`}>
                                            <Icon name={opt.icon} className="w-4 h-4" />
                                        </div>
                                        <span className={`text-compacto font-semibold text-center leading-tight ${selecionado ? opt.corTexto : 'text-tinta-suave'}`}>{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* O que decide entre descrever à mão e escolher um fornecedor é
                        a categoria PRECISAR de fornecedor — não ela ser "Despesa".
                        Escrito do outro jeito, qualquer categoria nova sem fornecedor
                        (Impostos é a primeira) caía no seletor com a lista vazia. */}
                    {!tipoFornecedorContaNecessario ? (
                        <div className="flex flex-col gap-1">
                            <label className="text-corpo font-medium text-tinta-corpo">Descrição</label>
                            <input required value={novaConta.descricao} onChange={e => setNovaConta({...novaConta, descricao: e.target.value})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Ex: Conta de Energia" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <label className="text-corpo font-medium text-tinta-corpo">Fornecedor de {novaConta.categoria}</label>
                            <div className="relative">
                                <CustomSelect
                                    value={novaConta.fornecedor_id || ''}
                                    onChange={(val) => {
                                        const fid = val ? Number(val) : null;
                                        const forn = fornecedoresParaConta.find(f => f.id === fid);
                                        setNovaConta({...novaConta, fornecedor_id: fid, descricao: forn ? forn.nome : ''});
                                    }}
                                    className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition cursor-pointer"
                                    options={[
                                        { value: '', label: 'Selecione um fornecedor...' },
                                        ...fornecedoresParaConta.map(f => ({ value: f.id, label: f.nome })),
                                    ]}
                                />
                            </div>
                            {fornecedoresParaConta.length === 0 && (
                                <p className="text-mini text-aviso mt-1">Nenhum fornecedor com a flag &ldquo;{tipoFornecedorContaNecessario}&rdquo; cadastrado. Cadastre em Cadastros → Fornecedores.</p>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-corpo font-medium text-tinta-corpo">Valor (R$)</label>
                            <input required value={novaConta.valor} onChange={e => setNovaConta({...novaConta, valor: formatarMoeda(e.target.value)})} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white font-medium transition" placeholder="0,00" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-corpo font-medium text-tinta-corpo">Vencimento</label>
                            <CustomDatePicker value={novaConta.vencimento} onChange={val => setNovaConta({...novaConta, vencimento: val})} placeholder="Selecione uma data" className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-corpo font-medium text-tinta-corpo">Status</label>
                        <CustomSelect
                            value={novaConta.status}
                            onChange={(val) => setNovaConta({...novaConta, status: val})}
                            className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition cursor-pointer"
                            options={[
                                { value: 'Pendente', label: 'Pendente' },
                                { value: 'Pago', label: 'Pago' },
                            ]}
                        />
                    </div>
                    <ToggleCard
                        icon="repeat"
                        title="Conta Recorrente"
                        description="Ao marcar como Pago, uma nova cobrança pendente é criada automaticamente com o mesmo vencimento."
                        checked={novaConta.recorrente || false}
                        onChange={val => setNovaConta({...novaConta, recorrente: val, recorrente_total_parcelas: val ? novaConta.recorrente_total_parcelas : null})}
                    />
                    {novaConta.recorrente && (
                        <div className="-mt-1 px-4 py-3.5 rounded-lg border border-brand/30 bg-brand/[0.04] dark:bg-brand/[0.06] flex flex-col gap-3">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <span className="text-compacto font-semibold text-tinta-suave">Duração</span>
                                <div className="flex items-center gap-1 p-1 bg-superficie border border-borda rounded-lg shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setNovaConta({...novaConta, recorrente_total_parcelas: null})}
                                        className={`h-8 px-3 rounded-md text-compacto font-semibold transition ${!novaConta.recorrente_total_parcelas ? 'bg-brand text-white shadow-sm' : 'text-tinta-suave hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        Indefinido
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNovaConta({...novaConta, recorrente_total_parcelas: novaConta.recorrente_total_parcelas || 10})}
                                        className={`h-8 px-3 rounded-md text-compacto font-semibold transition ${novaConta.recorrente_total_parcelas ? 'bg-brand text-white shadow-sm' : 'text-tinta-suave hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        Parcelado
                                    </button>
                                </div>
                            </div>
                            {novaConta.recorrente_total_parcelas ? (
                                <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-brand/20 dark:border-brand/20">
                                    <span className="text-compacto text-tinta-suave">Repetir por quantas vezes?</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="2"
                                            value={novaConta.recorrente_total_parcelas}
                                            onChange={e => setNovaConta({...novaConta, recorrente_total_parcelas: Math.max(2, Number(e.target.value) || 2)})}
                                            className="w-16 h-8 bg-elevado border border-borda-forte rounded-md text-corpo font-semibold text-center outline-none focus:border-brand dark:text-white transition"
                                        />
                                        <span className="text-compacto text-tinta-suave">vezes</span>
                                    </div>
                                </div>
                            ) : null}
                            {novaConta.recorrente_total_parcelas && novaConta.recorrente_parcela_atual > 1 && (
                                <span className="self-start text-mini font-medium px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-info">
                                    Esta é a parcela {novaConta.recorrente_parcela_atual} de {novaConta.recorrente_total_parcelas}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={modal.fechar} className="px-4 py-2 rounded text-corpo font-medium text-tinta-suave hover:bg-realce transition">Cancelar</button>
                        <button type="submit" disabled={salvandoConta} className="px-5 py-2 rounded text-corpo font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm disabled:opacity-50">
                            {salvandoConta ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
