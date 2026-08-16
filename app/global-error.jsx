"use client";

// Último recurso: erro no próprio layout raiz. Este arquivo SUBSTITUI o layout
// raiz quando ativo, então precisa dos próprios <html>/<body> e não pode
// depender do CSS global (estilos inline de propósito).
export default function GlobalError({ error }) {
    return (
        <html lang="pt-BR">
            <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDEFF0', fontFamily: 'system-ui, sans-serif', color: '#454545' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32, maxWidth: 420, textAlign: 'center' }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>O sistema encontrou um erro grave</h2>
                    <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
                        Recarregue a página. Se continuar, avise o Murilo{error?.digest ? ` (ref: ${error.digest})` : ''}.
                    </p>
                    <button type="button" onClick={() => window.location.reload()} style={{ background: '#F69F00', color: '#fff', border: 0, borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Recarregar o sistema
                    </button>
                </div>
            </body>
        </html>
    );
}
