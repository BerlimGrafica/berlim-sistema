// Fallback exibido enquanto o chunk de uma rota interna ainda está carregando
// (primeira navegação para a tela). O carregamento de DADOS é client-side e
// não passa por aqui — este arquivo só cobre o vão da navegação.
export default function Loading() {
    return (
        <main className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-[3px] border-gray-200 dark:border-darkBorder border-t-brand rounded-full animate-spin" aria-label="Carregando" />
        </main>
    );
}
