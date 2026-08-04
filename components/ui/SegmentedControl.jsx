"use client";
import Icon from '@/components/Icon';

// ==== CONTROLE SEGMENTADO (seletor de categoria com indicador deslizante) ====
export function SegmentedControl({ options, value, onChange, className = '' }) {
    const activeIndex = Math.max(0, options.findIndex(o => o.value === value));
    return (
        <div className={`relative flex bg-gray-100 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded-lg p-1 ${className}`}>
            <div
                className="absolute top-1 bottom-1 rounded-md bg-white dark:bg-darkCard shadow-sm transition-all duration-200 ease-out"
                style={{
                    width: `calc((100% - 8px) / ${options.length})`,
                    left: `calc(4px + (100% - 8px) / ${options.length} * ${activeIndex})`
                }}
            ></div>
            {options.map(opt => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-semibold rounded-md transition-colors duration-200 cursor-pointer ${value === opt.value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    {opt.icon && <Icon name={opt.icon} className="w-3.5 h-3.5" />}
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
