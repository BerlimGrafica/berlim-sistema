"use client";

// Linhas-fantasma exibidas enquanto a primeira carga de uma listagem ainda não
// chegou. Substitui tanto o tbody vazio quanto o "Nenhum registro" mentiroso
// que aparecia durante o carregamento. Larguras pseudo-aleatórias mas
// determinísticas (nada de Math.random: precisa ser estável entre renders).
export function SkeletonLinhas({ linhas = 8, colunas }) {
    return (
        <>
            {Array.from({ length: linhas }).map((_, i) => (
                <tr key={i} className="border-b border-borda-fraca">
                    {Array.from({ length: colunas }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                            <div
                                className="h-3.5 rounded bg-realce animate-pulse"
                                style={{ width: `${50 + ((i * 7 + j * 13) % 45)}%` }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
