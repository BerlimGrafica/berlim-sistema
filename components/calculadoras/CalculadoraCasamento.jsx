"use client";
import { useState } from 'react';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { CustomSelect } from '@/components/ui/Dropdown';

export function CalculadoraCasamento() {
    // Estado do manual de padrinhos
    const [manual, setManual] = useState({
        qtdManuais: 20,
        largura: '9,5',
        altura: '9,5',
        qtdImpressoes: 90,
        papel: 'Papel Linho 180g',
        furo: 'Furo e Ilhós',
        qtdVariaveis: 6
    });

    const precosPapel = {
        'Couche 170g': 3.75,
        'Couche 250g': 4.25,
        'Offset 180g': 2.75,
        'Offset 240g': 3,
        'Papel Perolizado 180g': 6.5,
        'Papel Linho 180g': 3.5
    };

    const calcularManual = () => {
        const larg = parseFloat(String(manual.largura).replace(',', '.')) || 0;
        const alt = parseFloat(String(manual.altura).replace(',', '.')) || 0;
        const qtdManuais = parseInt(manual.qtdManuais) || 0;
        const qtdImpressoes = parseInt(manual.qtdImpressoes) || 0;
        const qtdVariaveis = parseInt(manual.qtdVariaveis) || 0;

        let qtdPorA4 = 0;
        if (larg > 0 && alt > 0) {
            qtdPorA4 = Math.floor(20 / larg) * Math.floor(28.7 / alt);
        }

        let qtdFolhasA4 = 0;
        if (qtdPorA4 > 0 && qtdImpressoes > 0) {
            qtdFolhasA4 = Math.ceil(qtdImpressoes / qtdPorA4) + 2;
        }

        const precoPapel = precosPapel[manual.papel] || 0;
        const custoImpressao = precoPapel * qtdFolhasA4;

        let custoFuro = 0;
        if (manual.furo === 'Somente furo') {
            custoFuro = qtdFolhasA4 * 2.5;
        } else if (manual.furo === 'Furo e Ilhós') {
            custoFuro = (qtdFolhasA4 * 2.5) + (qtdManuais * 3);
        }

        const custoVariavel = qtdVariaveis <= 30 ? qtdVariaveis * 5 : qtdVariaveis * 3;

        const valorFinal = custoImpressao + custoFuro + custoVariavel;

        const textoWhatsapp = `${qtdManuais} manuais | ${qtdImpressoes} impressões | ${manual.largura}x${manual.altura}cm | ${manual.papel} | ${manual.furo} | 4x0 (Colorido e somente frente) | Refile | Artes variáveis - R$ ${valorFinal.toFixed(2).replace('.', ',')}`;

        return { qtdPorA4, qtdFolhasA4, custoImpressao, custoFuro, custoVariavel, valorFinal, textoWhatsapp };
    };

    const resultManual = calcularManual();

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder border-t-[3px] border-t-brand dark:border-t-brand">
            <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Qtd. de Manuais</label>
                            <input type="number" value={manual.qtdManuais} onChange={e => setManual({...manual, qtdManuais: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white" />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Largura (cm)</label>
                                <input type="text" value={manual.largura} onChange={e => setManual({...manual, largura: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Altura (cm)</label>
                                <input type="text" value={manual.altura} onChange={e => setManual({...manual, altura: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Qtd. Impressões (quadradinhos)</label>
                            <input type="number" value={manual.qtdImpressoes} onChange={e => setManual({...manual, qtdImpressoes: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Tipo de Papel</label>
                            <CustomSelect
                                value={manual.papel}
                                onChange={(val) => setManual({...manual, papel: val})}
                                className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white cursor-pointer"
                                options={Object.keys(precosPapel).map(p => ({ value: p, label: p }))}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Só Furo?</label>
                            <CustomSelect
                                value={manual.furo}
                                onChange={(val) => setManual({...manual, furo: val})}
                                className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white cursor-pointer"
                                options={[
                                    { value: 'Sem furo', label: 'Sem furo' },
                                    { value: 'Somente furo', label: 'Somente furo' },
                                    { value: 'Furo e Ilhós', label: 'Furo e Ilhós' },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Qtd. Variações de Arte</label>
                            <input type="number" value={manual.qtdVariaveis} onChange={e => setManual({...manual, qtdVariaveis: e.target.value})} className="w-full bg-white dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-darkElevated rounded border border-gray-100 dark:border-darkBorder">
                        <div>
                            <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">Qtd. por A4</p>
                            <p className="font-bold dark:text-white">{resultManual.qtdPorA4}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">Folhas A4 necessárias</p>
                            <p className="font-bold dark:text-white">{resultManual.qtdFolhasA4}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">Custo Furo/Ilhós</p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">R$ {resultManual.custoFuro.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA]">Custo Variações</p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">R$ {resultManual.custoVariavel.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-gray-50 dark:bg-darkElevated p-3 rounded border border-gray-100 dark:border-darkBorder flex items-center gap-3 shadow-sm">
                            <div className="text-[11px] text-gray-600 dark:text-[#A1A1AA] flex-1 font-mono break-all line-clamp-2">
                                {resultManual.textoWhatsapp}
                            </div>
                            <Tooltip label="Copiar Texto">
                                <button onClick={() => navigator.clipboard.writeText(resultManual.textoWhatsapp)} aria-label="Copiar Texto" className="w-8 h-8 flex items-center justify-center shrink-0 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded hover:text-brand transition shadow-sm">
                                    <Icon name="copy" className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                        <span className="font-semibold text-brand">Total Estimado</span>
                        <span className="text-2xl font-black text-brand">R$ {resultManual.valorFinal.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
        </div>
    );
}
