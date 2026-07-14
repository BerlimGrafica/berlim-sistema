"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';

function CalculadoraAdesivo({ produtos }) {
    const [largura, setLargura] = useState('');
    const [altura, setAltura] = useState('');
    const [tipo, setTipo] = useState('17');
    const [quantidade, setQuantidade] = useState('');

    const item15 = produtos?.find(p => Number(p.id) === 15);
    const item16 = produtos?.find(p => Number(p.id) === 16);
    const item17 = produtos?.find(p => Number(p.id) === 17);
    const item18 = produtos?.find(p => Number(p.id) === 18);
    const item19 = produtos?.find(p => Number(p.id) === 19);
    const item21 = produtos?.find(p => Number(p.id) === 21);

    const preco15 = item15 ? parseFloat(item15.preco_base) : 33.0;
    const preco16 = item16 ? parseFloat(item16.preco_base) : 33.0;
    const preco17 = item17 ? parseFloat(item17.preco_base) : 90.0;
    const preco18 = item18 ? parseFloat(item18.preco_base) : 130.0;
    const preco19 = item19 ? parseFloat(item19.preco_base) : 115.0;
    const preco21 = item21 ? parseFloat(item21.preco_base) : 55.0;

    const calculaCabem = (areaW, areaH, adW, adH) => {
        return Math.floor(areaW / adW) * Math.floor(areaH / adH);
    };

    const lRawNum = parseFloat(String(largura).replace(',', '.'));
    const aRawNum = parseFloat(String(altura).replace(',', '.'));
    const isTamanhoInvalido = (lRawNum > 0 && lRawNum < 3) || (aRawNum > 0 && aRawNum < 3);

    const copiarMaximos = () => {
        if (isNaN(lRawNum) || isNaN(aRawNum) || lRawNum <= 0 || aRawNum <= 0) {
            alert('Preencha largura e altura para calcular.');
            return;
        }
        if (isTamanhoInvalido) {
            alert('O tamanho mÃ­nimo permitido Ã© 3x3cm.');
            return;
        }

        const l = lRawNum + 0.2;
        const a = aRawNum + 0.2;
        const qSRA3 = calculaCabem(26, 39, l, a);
        const qMeio = calculaCabem(44, 94, l, a);
        const qMetro = calculaCabem(94, 94, l, a);

        let texto = '';

        if (tipo === '17') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | ImpressÃ£o Laser ou LÃ¡tex | Sem LaminaÃ§Ã£o | 1/2 corte | Entregue em folha A3 - R$ ${preco15.toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | ImpressÃ£o Laser ou LÃ¡tex | Sem LaminaÃ§Ã£o | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${(preco17 * 0.7333).toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | ImpressÃ£o LÃ¡tex | Sem LaminaÃ§Ã£o | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${preco17.toFixed(2).replace('.', ',')}\n\n`;
            }
            texto = texto.trim();
        } else if (tipo === '18') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | ImpressÃ£o Laser ou LÃ¡tex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha A3 - R$ ${preco21.toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | ImpressÃ£o Laser ou LÃ¡tex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${(preco18 * 0.7333).toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | ImpressÃ£o LÃ¡tex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${preco18.toFixed(2).replace('.', ',')}\n\n`;
            }
            texto = texto.trim();
        } else if (tipo === '19') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | ImpressÃ£o Laser ou LÃ¡tex | 1/2 corte | Entregue em folha A3 - R$ ${preco16.toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | ImpressÃ£o Laser ou LÃ¡tex | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${(preco19 * 0.7333).toFixed(2).replace('.', ',')}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | ImpressÃ£o LÃ¡tex | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${preco19.toFixed(2).replace('.', ',')}\n\n`;
            }
            texto = texto.trim();
        }

        navigator.clipboard.writeText(texto);
        alert('OrÃ§amentos de quantidades mÃ¡ximas copiados!');
    };

    const calcular = () => {
        if (isTamanhoInvalido) return '0,00';
        
        const lRaw = parseFloat(largura.replace(',', '.'));
        const aRaw = parseFloat(altura.replace(',', '.'));
        const qty = parseInt(quantidade) || 0;
        if (isNaN(lRaw) || isNaN(aRaw) || lRaw <= 0 || aRaw <= 0 || qty <= 0) return '0,00';
        
        // Sangria de 0,2cm
        const l = lRaw + 0.2;
        const a = aRaw + 0.2;
        
        const qSRA3 = calculaCabem(26, 39, l, a);
        const qMeio = calculaCabem(44, 94, l, a);
        const qMetro = calculaCabem(94, 94, l, a);

        let sra3Price = preco15;
        let basePrice = preco17;

        if (tipo === '17') {
            sra3Price = preco15;
            basePrice = preco17;
        } else if (tipo === '18') {
            sra3Price = preco21;
            basePrice = preco18;
        } else if (tipo === '19') {
            sra3Price = preco16;
            basePrice = preco19;
        }

        let total = 0;

        if (qSRA3 > 0 && qty <= qSRA3) {
            total = sra3Price;
        } else if (qMeio > 0 && qty <= qMeio) {
            total = basePrice * 0.7333;
        } else if (qMetro > 0 && qty <= qMetro) {
            total = basePrice;
        } else {
            if (qMetro > 0) {
                const metrosNecessarios = qty / qMetro;
                total = metrosNecessarios * basePrice;
            } else {
                const areaFisica = (l * a) / 10000;
                total = (areaFisica * qty) * basePrice;
            }
        }

        return total.toFixed(2);
    };

    const gerarTextoCopia = () => {
        if (isTamanhoInvalido) return '';
        
        const lRaw = parseFloat(largura.replace(',', '.'));
        const aRaw = parseFloat(altura.replace(',', '.'));
        const qty = parseInt(quantidade) || 0;
        if (isNaN(lRaw) || isNaN(aRaw) || lRaw <= 0 || aRaw <= 0 || qty <= 0) return '';
        
        let nomeTipo = 'Vinil';
        let lam = '';
        
        if (tipo === '17') {
            nomeTipo = item17 ? item17.nome : 'Adesivo Vinil Branco';
            lam = ' | Sem LaminaÃ§Ã£o';
        } else if (tipo === '18') {
            nomeTipo = item18 ? item18.nome : 'Adesivo Vinil Branco';
            lam = ' | Laminado Brilho/Fosco';
        } else if (tipo === '19') {
            nomeTipo = item19 ? item19.nome : 'Adesivo Vinil Transparente';
        }
        
        const val = calcular().replace('.', ',');
        
        // Calcular onde coube para gerar o texto de entrega
        const l = lRaw + 0.2;
        const a = aRaw + 0.2;
        const qSRA3 = Math.floor(26 / l) * Math.floor(39 / a);
        
        let entregaStr = '';
        if (qSRA3 > 0 && qty <= qSRA3) {
            entregaStr = ' | Entregue em folha A3';
        } else {
            entregaStr = ' | Entregue em folha de 1/2 metro';
        }
        
        const plural = qty > 1 ? 'Adesivos' : 'Adesivo';
        return `${qty} ${plural} | ${lRaw}x${aRaw}cm | ${nomeTipo}${lam} | 1/2 corte${entregaStr} - R$ ${val}`;
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder relative">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Calculadora de Adesivos (Vinil)</h3>
            
            {isTamanhoInvalido && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[12px] rounded border border-red-200 dark:border-red-900/50 flex items-center gap-2 font-medium">
                    <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
                    O tamanho mÃ­nimo permitido para adesivos Ã© de 3x3cm.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Largura UnitÃ¡ria (cm)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Altura UnitÃ¡ria (cm)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tipo de Adesivo</label>
                    <div className="relative">
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="17">{item17 ? item17.nome : 'Item 17'}</option>
                            <option value="18">{item18 ? item18.nome : 'Item 18'} (Laminado Brilho/Fosco)</option>
                            <option value="19">{item19 ? item19.nome : 'Item 19'}</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Quantidade</label>
                    <div className="flex gap-2">
                        <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                        <button onClick={copiarMaximos} className="bg-brand text-white px-3 rounded flex items-center justify-center hover:bg-brand/90 transition shadow-sm" title="Copiar orÃ§amentos de quantidades mÃ¡ximas">
                            <Icon name="copy" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-gray-50 dark:bg-darkElevated p-3 rounded border border-gray-100 dark:border-darkBorder flex items-center gap-3 shadow-sm">
                    <div className="text-[11px] text-gray-600 dark:text-[#A1A1AA] flex-1 font-mono break-all line-clamp-2">
                        {gerarTextoCopia() || 'Preencha as medidas para gerar o texto da proposta...'}
                    </div>
                    <button onClick={() => { if(gerarTextoCopia()) navigator.clipboard.writeText(gerarTextoCopia()) }} className="w-8 h-8 flex items-center justify-center shrink-0 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded hover:text-brand transition shadow-sm" title="Copiar Texto">
                        <Icon name="copy" className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                <span className="font-semibold text-brand">Total Estimado</span>
                <span className="text-2xl font-black text-brand">R$ {calcular().replace('.', ',')}</span>
            </div>
        </div>
    );
}

export default CalculadoraAdesivo;
