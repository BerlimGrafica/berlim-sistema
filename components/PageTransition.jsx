"use client";
import { usePathname } from 'next/navigation';

// Aplica um fade toda vez que a rota muda — a troca de key força o React a
// remontar o container, o que reinicia a animação de entrada.
export default function PageTransition({ children }) {
    const pathname = usePathname();
    return <div key={pathname} className="animate-fade-screen">{children}</div>;
}
