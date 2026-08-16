"use client";
import Icon from '@/components/Icon';

// ==== COMPONENTE DE SWITCH (TOGGLE) ====
function Switch({ checked, onChange, color = 'brand', className = '' }) {
    // O `dark:` repetido não é redundante: sem ele o toggle ligado fica cinza no
    // tema escuro. Os dois utilitários que disputam o fundo do trilho empatam em
    // especificidade (0,2,0) —
    //     .peer-checked\:bg-brand:is(:where(.peer):checked~*)
    //     .dark\:bg-darkBorder:is(.dark *)
    // — e no empate vale a ordem no CSS gerado, onde `dark:` sai depois e ganha.
    // No tema claro o concorrente é só `.bg-gray-300` (0,1,0), que perde; por isso
    // o bug aparecia exclusivamente no escuro. `dark:peer-checked:` soma as duas
    // condições e vai a (0,3,0), passando à frente das duas.
    const coresAtivas = {
        brand: 'peer-checked:bg-brand dark:peer-checked:bg-brand',
        red: 'peer-checked:bg-red-500 dark:peer-checked:bg-red-500',
        blue: 'peer-checked:bg-blue-500 dark:peer-checked:bg-blue-500',
    };
    return (
        <span className={`relative inline-flex items-center shrink-0 ${className}`}>
            <input
                type="checkbox"
                checked={!!checked}
                onChange={e => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <span className={`block w-9 h-5 rounded-full bg-gray-300 dark:bg-darkBorder peer transition-colors duration-200 ${coresAtivas[color] || coresAtivas.brand} peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-focus-visible:ring-offset-1 dark:peer-focus-visible:ring-offset-darkBg after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-4`}></span>
        </span>
    );
}

// ==== CARTÃO DE OPÇÃO COM SWITCH (ícone + título + descrição + toggle) ====
export function ToggleCard({ icon, title, description, checked, onChange, color = 'brand' }) {
    const estilos = {
        brand: { borda: 'border-brand/40 bg-brand/5 dark:bg-brand/10', iconeAtivo: 'bg-brand/15 text-brand', tituloAtivo: 'text-brand' },
        red: { borda: 'border-red-300 dark:border-red-800/60 bg-red-50 dark:bg-red-950/20', iconeAtivo: 'bg-red-100 dark:bg-red-900/40 text-perigo', tituloAtivo: 'text-red-700 dark:text-red-400' },
        blue: { borda: 'border-blue-300 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/20', iconeAtivo: 'bg-blue-100 dark:bg-blue-900/40 text-info', tituloAtivo: 'text-blue-700 dark:text-blue-400' },
    };
    const e = estilos[color] || estilos.brand;
    return (
        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors duration-200 select-none ${checked ? e.borda : 'border-borda bg-elevado hover:bg-sutil'}`}>
            <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${checked ? e.iconeAtivo : 'bg-gray-100 dark:bg-darkBorder/40 text-tinta-fraca'}`}>
                <Icon name={icon} className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0">
                <span className={`block text-corpo font-semibold transition-colors duration-200 ${checked ? e.tituloAtivo : 'text-tinta-corpo'}`}>{title}</span>
                {description && <span className="block text-mini leading-snug text-tinta-suave mt-0.5">{description}</span>}
            </span>
            <Switch checked={checked} onChange={onChange} color={color} />
        </label>
    );
}
