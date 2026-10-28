"use client";
import { useRef, useState } from 'react';
import Icon from '@/components/Icon';

// Peças da tela de entrada (components/TelaEntrada.jsx) e da tela bloqueada
// (components/TelaBloqueada.jsx): as duas pedem senha do mesmo jeito.

export const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

// 16px no celular: abaixo disso o iPhone dá zoom na página ao tocar no campo.
export const campoInput = 'flex-1 min-w-0 h-full bg-transparent border-0 outline-none pl-10 pr-3 text-base lg:text-[14px] text-tinta placeholder:text-tinta-suave rounded-[9px] [&:-webkit-autofill]:shadow-[inset_0_0_0_40px_var(--campo)] [&:-webkit-autofill]:[-webkit-text-fill-color:var(--tinta)]';
export const campoIcone = 'absolute left-[13px] w-4 h-4 text-tinta-suave pointer-events-none';
export function campoCaixa(comErro) {
    return `relative flex items-center h-11 rounded-[9px] border bg-campo transition-[border-color,box-shadow] duration-150 focus-within:border-brand focus-within:ring-[3px] ${
        comErro ? 'border-perigo focus-within:border-perigo focus-within:ring-perigo/15' : 'border-borda-forte hover:border-tinta-fraca focus-within:ring-brand/20'
    }`;
}

export const botaoPrimario = `w-full h-11 rounded-[9px] inline-flex items-center justify-center gap-2 bg-brand hover:bg-brandHover disabled:bg-brandHover disabled:cursor-default text-sobre-brand text-[14px] font-semibold transition-colors duration-150 ${foco}`;
export const botaoSecundario = `w-full h-11 rounded-[9px] inline-flex items-center justify-center gap-2 border border-borda-forte bg-superficie hover:bg-sutil hover:border-tinta-fraca disabled:cursor-default text-tinta text-[14px] font-semibold transition-colors duration-150 ${foco}`;

export function Girando() {
    return <span aria-hidden="true" className="w-4 h-4 shrink-0 rounded-full border-2 border-current border-r-transparent animate-spin" />;
}

// Senha com o olho para mostrar o que foi digitado e o aviso de Caps Lock —
// a causa mais comum de "senha incorreta" no balcão.
export function CampoSenha({ id, value, onChange, comErro, placeholder, inputRef }) {
    const proprio = useRef(null);
    const ref = inputRef || proprio;
    const [ver, setVer] = useState(false);
    const [caps, setCaps] = useState(false);
    const conferirCaps = (e) => setCaps(!!e.getModifierState?.('CapsLock'));
    return (
        <>
            <div className={campoCaixa(comErro)}>
                <Icon name="lock" className={campoIcone} />
                <input
                    ref={ref}
                    id={id}
                    name="senha"
                    type={ver ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={conferirCaps}
                    onKeyUp={conferirCaps}
                    onBlur={() => setCaps(false)}
                    placeholder={placeholder}
                    aria-invalid={comErro || undefined}
                    className={campoInput}
                />
                <button
                    type="button"
                    onClick={() => { setVer(v => !v); ref.current?.focus(); }}
                    aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}
                    aria-pressed={ver}
                    className="w-[42px] h-full shrink-0 grid place-items-center rounded-r-[9px] text-tinta-suave hover:text-tinta transition-colors focus-visible:outline-2 focus-visible:-outline-offset-[3px] focus-visible:outline-brand"
                >
                    <Icon name={ver ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
            </div>
            {caps && (
                <p className="mt-2 flex items-start gap-[7px] text-[12.5px] font-semibold text-amber-700 dark:text-amber-300">
                    <Icon name="arrow-big-up" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Caps Lock ligado
                </p>
            )}
        </>
    );
}

export function AvisoErro({ children, className = '' }) {
    return (
        <p role="alert" className={`flex items-start gap-[9px] px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-perigo text-[13px] font-semibold leading-snug animate-fade-screen ${className}`}>
            <Icon name="alert-circle" className="w-4 h-4 mt-px shrink-0" />
            <span>{children}</span>
        </p>
    );
}

// O nome escrito, como na barra. Sobre o fundo de marca o "Gráfica" usa o azul
// clareado do logo: o original some no marinho.
export function LogotipoMarca({ className = '' }) {
    return (
        <span className={`font-black tracking-[-0.02em] leading-none whitespace-nowrap select-none ${className}`}>
            <span className="text-brand">BERLIM</span> <span className="text-[var(--marca-azul)]">Gráfica</span>
        </span>
    );
}

export function IconeGoogle() {
    return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.6 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.3-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6.5 29.6 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z" />
            <path fill="#4CAF50" d="M24 44.5c5.5 0 10.3-1.9 14-5l-6.5-5.3C29.5 35.7 26.9 36.5 24 36.5c-5.3 0-9.8-3.1-11.4-7.6l-6.6 5.1C9.5 40.1 16.2 44.5 24 44.5z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.3C41.4 35.9 44.5 30.4 44.5 24c0-1.2-.1-2.4-.3-3.5z" />
        </svg>
    );
}
