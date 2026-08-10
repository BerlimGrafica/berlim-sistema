// Selos das bandeiras de cartão usadas no select de pagamento. Não são os
// logos oficiais (evita reprodução de marca registrada) — são chips
// estilizados só pra dar reconhecimento visual rápido ao lado do nome.
export function BandeiraIcon({ nome, className = "w-6 h-4" }) {
    const moldura = (bg, children) => (
        <svg viewBox="0 0 24 16" className={`${className} shrink-0`} xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="23" height="15" rx="3" fill={bg} stroke="currentColor" strokeOpacity="0.15" />
            {children}
        </svg>
    );
    const texto = (label, fill) => (
        <text x="12" y="11.3" textAnchor="middle" fontSize="7.5" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif" fill={fill} textLength="19" lengthAdjust="spacingAndGlyphs">{label}</text>
    );

    switch (nome) {
        case 'Visa':
            return moldura('white', texto('VISA', '#1434CB'));
        case 'MasterCard':
            return moldura('white', <><circle cx="9.5" cy="8" r="5" fill="#EB001B" /><circle cx="14.5" cy="8" r="5" fill="#F79E1B" fillOpacity="0.85" /></>);
        case 'Elo':
            return moldura('white', texto('elo', '#1A1A1A'));
        case 'American Express':
            return moldura('#2E77BC', texto('AMEX', 'white'));
        case 'HiperCard':
            return moldura('#C8102E', texto('HIPER', 'white'));
        case 'Maestro':
            return moldura('white', <><circle cx="9.5" cy="8" r="5" fill="#0099DF" /><circle cx="14.5" cy="8" r="5" fill="#ED0006" fillOpacity="0.85" /></>);
        case 'RedeShop':
            return moldura('#E4003A', texto('REDE', 'white'));
        default:
            return null;
    }
}
