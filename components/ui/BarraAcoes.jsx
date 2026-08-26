"use client";
import { useState } from 'react';
import Icon from '@/components/Icon';

// Barra de ações fixa no rodapé, só no celular.
//
// No desktop os controles de uma tela (buscar, filtrar período, "Nova O.S.")
// moram no topo, onde há largura de sobra. No celular esse cabeçalho empurra a
// lista para baixo e ainda assim fica apertado — e, pior, some assim que a
// pessoa rola. O rodapé fixo resolve os dois: as ações ficam sempre no alcance
// do polegar e não disputam altura com o conteúdo.
//
// Cada ação é ou um GATILHO (`aoClicar`) ou um PAINEL (`conteudo`). O painel
// abre acima da barra e só um fica aberto por vez — dois campos abertos ao
// mesmo tempo numa tela dessa altura viram uma tela de formulário, não uma
// barra de ações.
//
// `ativo` acende um ponto no ícone: serve para o filtro dizer que está aplicado
// mesmo com o painel fechado. Sem isso, uma busca ou um período em vigor ficam
// invisíveis depois que o painel fecha, e a lista parece incompleta sem motivo.
//
// O componente também rende um espaçador no fluxo: a barra é `fixed` e sairia
// por cima do último registro da lista, que é justamente o mais difícil de
// alcançar rolando.
export function BarraAcoes({ acoes }) {
    const [aberta, setAberta] = useState(null);
    const painel = acoes.find(a => a.id === aberta && a.conteudo);

    return (
        <>
            {/* Espaçador: reserva no fluxo a altura que a barra ocupa por cima. */}
            <div className="lg:hidden h-[76px]" aria-hidden="true" />

            {painel && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-slate-900/20 dark:bg-black/40"
                    onClick={() => setAberta(null)}
                    aria-hidden="true"
                />
            )}

            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
                {painel && (
                    <div className="bg-superficie border-t border-borda px-4 py-3 shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-micro font-semibold uppercase tracking-wider text-tinta-suave">{painel.rotulo}</span>
                            <button type="button" onClick={() => setAberta(null)} aria-label="Fechar" className="p-1 text-tinta-suave hover:text-tinta transition">
                                <Icon name="x" className="w-4 h-4" />
                            </button>
                        </div>
                        {painel.conteudo}
                    </div>
                )}

                <div
                    className="bg-superficie border-t border-borda flex items-stretch justify-around px-2"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    {acoes.map(acao => {
                        const selecionada = aberta === acao.id;
                        return (
                            <button
                                key={acao.id}
                                type="button"
                                onClick={() => {
                                    if (acao.conteudo) setAberta(selecionada ? null : acao.id);
                                    else { setAberta(null); acao.aoClicar?.(); }
                                }}
                                aria-label={acao.rotulo}
                                aria-expanded={acao.conteudo ? selecionada : undefined}
                                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[60px] rounded-lg transition ${
                                    acao.destaque
                                        ? 'text-brand'
                                        : selecionada ? 'text-brand bg-brand/5' : 'text-tinta-suave active:bg-realce'
                                }`}
                            >
                                <span className={acao.destaque ? 'bg-brand text-white rounded-full p-1.5 flex' : 'flex'}>
                                    <Icon name={acao.icone} className="w-5 h-5" />
                                </span>
                                <span className="text-micro font-semibold tracking-wide">{acao.rotulo}</span>
                                {acao.ativo && !selecionada && (
                                    <span aria-hidden="true" className="absolute top-2 right-1/2 translate-x-4 w-2 h-2 rounded-full bg-brand" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
