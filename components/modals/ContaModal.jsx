"use client";
import { useAppContext } from "@/context/AppContext";
import Icon from "@/components/Icon";
import { formatarMoeda } from '@/lib/utils/formatters';
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { CustomSelect } from '@/components/ui/Dropdown';
import { ToggleCard } from '@/components/ui/ToggleCard';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useFecharAoClicarFora } from '@/components/modals/useFecharAoClicarFora';

const CATEGORIAS_CONTA = [
    { value: 'Despesa', label: 'Despesa', icon: 'dollar-sign' },
    { value: 'Material', label: 'Material', icon: 'shopping-bag' },
    { value: 'Manutenção', label: 'Manutenção', icon: 'wrench' },
    { value: 'Terceirização', label: 'Terceirização', icon: 'package' },
];

export default function ContaModal() {
    const { modalContaAberto, setModalContaAberto, novaConta, setNovaConta, salvandoConta, salvarConta, fornecedores } = useAppContext();
    const fecharAoClicarFora = useFecharAoClicarFora();

    const tipoFornecedorContaNecessario = novaConta.categoria === 'Manutenção' ? 'Manutenção' : novaConta.categoria === 'Terceirização' ? 'Produção' : novaConta.categoria === 'Material' ? 'Material' : null;
    const fornecedoresParaConta = tipoFornecedorContaNecessario ? fornecedores.filter(f => f.tipo === tipoFornecedorContaNecessario) : [];

    if (!modalContaAberto) return null;

    return (
        <div {...fecharAoClicarFora(() => setModalContaAberto(false))} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div className="bg-[#EDEFF0] dark:bg-darkBg w-full max-w-md rounded shadow-2xl overflow-hidden border border-gray-200 dark:border-darkBorder animate-modal-in" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 py-5 flex justify-between items-center bg-brand text-white rounded-t">
                    <h3 className="font-semibold text-lg tracking-tight">{novaConta.id ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</h3>
                    <button onClick={() => setModalContaAberto(false)} className="text-white/70 hover:text-white transition"><Icon name="x" /></button>
                </div>
                <form onSubmit={salvarConta} className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700 dark:text-[#EDEDED]">Categoria</label>
                        <SegmentedControl
                            options={CATEGORIAS_CONTA}
                            value={novaConta.categoria || 'Despesa'}
                            onChange={val => setNovaConta({...novaConta, categoria: val, fornecedor_id: null, descricao: ''})}
                        />
                    </div>
                    {(!novaConta.categoria || novaConta.categoria === 'Despesa') ? (
                        <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-medium text-gray-700 dark:text-[#EDEDED]">Descrição</label>
                            <input required value={novaConta.descricao} onChange={e => setNovaConta({...novaConta, descricao: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: Conta de Energia" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-medium text-gray-700 dark:text-[#EDEDED]">Fornecedor de {novaConta.categoria}</label>
                            <div className="relative">
                                <CustomSelect
                                    value={novaConta.fornecedor_id || ''}
                                    onChange={(val) => {
                                        const fid = val ? Number(val) : null;
                                        const forn = fornecedoresParaConta.find(f => f.id === fid);
                                        setNovaConta({...novaConta, fornecedor_id: fid, descricao: forn ? forn.nome : ''});
                                    }}
                                    className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                                    options={[
                                        { value: '', label: 'Selecione um fornecedor...' },
                                        ...fornecedoresParaConta.map(f => ({ value: f.id, label: f.nome })),
                                    ]}
                                />
                            </div>
                            {fornecedoresParaConta.length === 0 && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Nenhum fornecedor com a flag &ldquo;{tipoFornecedorContaNecessario}&rdquo; cadastrado. Cadastre em Cadastros → Fornecedores.</p>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-medium text-gray-700 dark:text-[#EDEDED]">Valor (R$)</label>
                            <input required value={novaConta.valor} onChange={e => setNovaConta({...novaConta, valor: formatarMoeda(e.target.value)})} className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white font-medium transition" placeholder="0,00" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[13px] font-medium text-gray-700 dark:text-[#EDEDED]">Vencimento</label>
                            <CustomDatePicker value={novaConta.vencimento} onChange={val => setNovaConta({...novaConta, vencimento: val})} placeholder="Selecione uma data" className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-medium text-gray-700 dark:text-[#EDEDED]">Status</label>
                        <CustomSelect
                            value={novaConta.status}
                            onChange={(val) => setNovaConta({...novaConta, status: val})}
                            className="w-full bg-white dark:bg-darkElevated border border-gray-300 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
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
                        onChange={val => setNovaConta({...novaConta, recorrente: val})}
                    />
                    <div className="flex justify-end gap-3 mt-2">
                        <button type="button" onClick={() => setModalContaAberto(false)} className="px-4 py-2 rounded text-[13px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:bg-gray-100 dark:hover:bg-darkHover transition">Cancelar</button>
                        <button type="submit" disabled={salvandoConta} className="px-5 py-2 rounded text-[13px] font-medium bg-brand text-white hover:bg-brandHover transition shadow-sm disabled:opacity-50">
                            {salvandoConta ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
