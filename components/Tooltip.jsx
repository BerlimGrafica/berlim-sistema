"use client";
import { useState, useRef, useLayoutEffect } from 'react';

export default function Tooltip({ label, children, className = '' }) {
    const [visible, setVisible] = useState(false);
    const [side, setSide] = useState('left');
    const wrapperRef = useRef(null);
    const bubbleRef = useRef(null);

    useLayoutEffect(() => {
        if (!visible) return;
        const wrapper = wrapperRef.current;
        const bubble = bubbleRef.current;
        if (!wrapper || !bubble) return;
        const margin = 8;
        const fitsLeft = wrapper.getBoundingClientRect().left - bubble.offsetWidth - margin > 0;
        setSide(fitsLeft ? 'left' : 'right');
    }, [visible]);

    if (!label) return children;

    return (
        <span
            ref={wrapperRef}
            className={`relative inline-flex ${className}`}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}
            <span
                ref={bubbleRef}
                role="tooltip"
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-md bg-gray-900 dark:bg-black dark:border dark:border-darkBorder px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'} ${side === 'left' ? 'right-full mr-2' : 'left-full ml-2'}`}
            >
                {label}
                <span className={`absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rotate-45 bg-gray-900 dark:bg-black ${side === 'left' ? '-right-[3px]' : '-left-[3px]'}`} />
            </span>
        </span>
    );
}
