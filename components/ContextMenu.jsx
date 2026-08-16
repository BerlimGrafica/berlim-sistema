"use client";
import { useEffect, useRef, useState } from 'react';
import { useUi } from '@/context/UiContext';
import Icon from '@/components/Icon';

const LARGURA_MENU = 210;

// Menu de clique-direito genérico — qualquer tabela do sistema monta sua
// própria lista de itens (label, icon, onClick, tom, divisorAntes) e chama
// abrirContextMenu(e, itens); este componente cuida de posição (sem estourar
// a tela), fechamento (clique fora, Esc, scroll) e do visual, iguais em
// qualquer lugar do app.
export default function ContextMenu() {
    const { contextMenu, fecharContextMenu } = useUi();
    const menuRef = useRef(null);
    const [pos, setPos] = useState(null);

    useEffect(() => {
        if (!contextMenu) { setPos(null); return; }
        const alturaEstimada = contextMenu.itens.length * 34 + 16;
        const left = Math.min(contextMenu.x, window.innerWidth - LARGURA_MENU - 8);
        const top = Math.min(contextMenu.y, window.innerHeight - alturaEstimada - 8);
        setPos({ left: Math.max(8, left), top: Math.max(8, top) });
    }, [contextMenu]);

    useEffect(() => {
        if (!contextMenu) return;
        const aoTeclar = (e) => { if (e.key === 'Escape') fecharContextMenu(); };
        const aoRolar = () => fecharContextMenu();
        window.addEventListener('keydown', aoTeclar);
        window.addEventListener('scroll', aoRolar, true);
        window.addEventListener('resize', aoRolar);
        return () => {
            window.removeEventListener('keydown', aoTeclar);
            window.removeEventListener('scroll', aoRolar, true);
            window.removeEventListener('resize', aoRolar);
        };
    }, [contextMenu, fecharContextMenu]);

    if (!contextMenu || !pos) return null;

    return (
        <>
            <div className="fixed inset-0 z-[190] no-print" onClick={fecharContextMenu} onContextMenu={(e) => { e.preventDefault(); fecharContextMenu(); }}></div>
            <div
                ref={menuRef}
                style={{ left: pos.left, top: pos.top, width: LARGURA_MENU }}
                className="fixed z-[191] bg-elevado border border-borda rounded-lg shadow-2xl py-1.5 animate-toast-in no-print"
            >
                {contextMenu.itens.map((item, i) => (
                    <div key={i}>
                        {item.divisorAntes && <div className="my-1.5 border-t border-borda-fraca"></div>}
                        <button
                            type="button"
                            disabled={item.desabilitado}
                            onClick={() => { item.onClick(); fecharContextMenu(); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium text-left transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                item.tom === 'perigo'
                                    ? 'text-perigo hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-tinta-corpo hover:bg-realce'
                            }`}
                        >
                            <Icon name={item.icon} className="w-3.5 h-3.5 shrink-0" />
                            {item.label}
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
