"use client";
import Icon from '@/components/Icon';
import { CustomSelect } from '@/components/ui/Dropdown';

// A faixa de sub-abas de uma tela (Abertas / À dar Baixa / Baixadas...), nos
// dois desenhos: abas no desktop, seletor no celular.
//
// Mesmo raciocínio do TabelaCartoes — as abas são dados, não marcação. Sete
// telas repetem essa faixa hoje, cada uma com a mesma classe gigante colada em
// cada botão.
//
// No celular vira seletor pelo mesmo motivo do menu principal: uma fita que rola
// de lado esconde as opções e pode deixar a aba ativa fora da tela. E há uma
// diferença de peso proposital em relação ao menu — o menu fica na barra fixa,
// com fundo elevado; a sub-aba mora dentro da página, com borda mais leve e o
// rótulo "Ver" na frente. Dois seletores idênticos, um debaixo do outro, não
// diriam qual manda em qual.
export function SubAbas({ valor, aoMudar, abas, className = '' }) {
    return (
        <div className={`bg-fundo border-b border-borda z-20 sticky top-[var(--altura-cabecalho)] ${className}`}>
            {/* Celular. O seletor vem primeiro e o rótulo vai para o fim: assim ele
                começa na mesma margem do seletor de seções logo acima, e os dois
                terminam juntos — o "Ver" cai na mesma coluna da seta dos sites
                externos. Daí o w-11 nos dois: é a medida do alvo de toque, e é ela
                que mantém a coluna. */}
            <div className="lg:hidden px-4 py-2 flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                    <CustomSelect
                        value={valor}
                        onChange={aoMudar}
                        className="w-full bg-superficie border border-borda-fraca rounded px-3 py-1.5 text-corpo font-semibold text-tinta outline-none"
                        options={abas.map(a => ({
                            value: a.id,
                            // O sinal de pendência vira sufixo no rótulo, e não um ponto
                            // solto: dentro de um seletor fechado só o texto da opção
                            // escolhida aparece, então um ponto ao lado do ícone sumiria
                            // justamente quando a aba não está selecionada — que é
                            // quando ele precisa ser visto.
                            label: a.sinal ? `${a.rotulo} •` : a.rotulo,
                            icon: <Icon name={a.icone} className={`w-4 h-4 shrink-0 ${a.id === valor ? 'text-brand' : 'text-tinta-suave'}`} />,
                        }))}
                    />
                </div>
                <span className="w-11 shrink-0 text-center text-micro font-semibold uppercase tracking-wider text-tinta-suave">Ver</span>
            </div>

            {/* Desktop */}
            <div className="hidden lg:flex px-6 gap-6 overflow-x-auto no-scrollbar-style">
                {abas.map(({ id, rotulo, icone }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => aoMudar(id)}
                        className={`py-3 text-corpo font-semibold border-b-[3px] transition whitespace-nowrap shrink-0 flex items-center gap-2 ${valor === id ? 'border-brand text-brand' : 'border-transparent text-tinta-suave hover:text-tinta'}`}
                    >
                        <Icon name={icone} className="w-4 h-4" /> {rotulo}
                    </button>
                ))}
            </div>
        </div>
    );
}
