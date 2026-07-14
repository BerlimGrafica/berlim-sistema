"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';

function CalculadoraBanner() {
    const [largura, setLargura] = useState('');
    const [altura, setAltura] = useState('');
    const [tipo, setTipo] = useState('simples');
    const [acabamento, setAcabamento] = useState('bastao_corda');
    const [prazo, setPrazo] = useState('padrao');
    const [quantidade, setQuantidade] = useState(1);

    const calcular = () => {
        const l = parseFloat(largura.replace(',', '.'));
        const a = parseFloat(altura.replace(',', '.'));
        if (isNaN(l) || isNaN(a) || l <= 0 || a <= 0) return '0,00';
        
        let valorM2 = tipo === 'simples' ? 90.0 : 130.0;
        
        if (acabamento === 'sem_acabamento') {
            valorM2 -= 10.0;
        }

        let precoUnitario = 0;
        
        if (l <= 1 && a <= 1) { // none is > 1
            const areaFisica = l * a;
            if (areaFisica <= 0.5) precoUnitario = 65.0;
            else precoUnitario = valorM2;
        } else {
            const areaCobrada = Math.max(l, 1) * Math.max(a, 1);
            precoUnitario = areaCobrada * valorM2;
        }
        
        // Multiplicador de prazo
        let multiplicadorPrazo = 1.0;
        if (prazo === 'outro_dia') multiplicadorPrazo = 1.3; // +30%
        if (prazo === 'mesmo_dia') multiplicadorPrazo = 1.6; // +60%
        
        return ((precoUnitario * multiplicadorPrazo) * quantidade).toFixed(2);
    };

    const gerarTextoCopia = () => {
        const l = parseFloat(largura.replace(',', '.'));
        const a = parseFloat(altura.replace(',', '.'));
        if (isNaN(l) || isNaN(a) || l <= 0 || a <= 0) return '';
        
        const textTipo = tipo === 'simples' ? 'Lona 440g Brilho | Sem LaminaÃ§Ã£o (PelÃ­cula de proteÃ§Ã£o)' : 'Lona 440g Brilho | Laminado Brilho ou Fosco';
        const textAcab = acabamento === 'bastao_corda' ? 'Acabamento em BastÃ£o e Corda' : acabamento === 'ilhos' ? 'Acabamento em IlhÃ³s (Argolas de Ferro)' : 'Sem Acabamento';
        const val = calcular().replace('.', ',');
        const dim = `${Math.round(l * 100)}x${Math.round(a * 100)}cm`;
        
        const plural = quantidade > 1 ? 'Banners' : 'Banner';
        return `${quantidade} ${plural} | ${dim} | ${textTipo} | ${textAcab} - R$ ${val}`;
    };

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Calculadora de Banner / Lona</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Largura (m)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 1,50" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Altura (m)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 2,00" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tipo de Lona</label>
                    <div className="relative">
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="simples">Lona 440g Brilho (R$ 90/mÂ²)</option>
                            <option value="laminado">Lona 440g Brilho Laminada (R$ 130/mÂ²)</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Acabamento</label>
                    <div className="relative">
                        <select value={acabamento} onChange={e => setAcabamento(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="bastao_corda">BastÃ£o e Corda</option>
                            <option value="ilhos">IlhÃ³s (Argolas de ferro)</option>
                            <option value="sem_acabamento">Sem Acabamento (- R$ 10/mÂ²)</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Prazo de Entrega</label>
                    <div className="relative">
                        <select value={prazo} onChange={e => setPrazo(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded pl-3 pr-8 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition appearance-none cursor-pointer">
                            <option value="padrao">PadrÃ£o</option>
                            <option value="outro_dia">Para outro dia (+30%)</option>
                            <option value="mesmo_dia">Para o mesmo dia (+60%)</option>
                        </select>
                        <Icon name="chevron-down" className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(parseInt(e.target.value) || 1)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
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

export default CalculadoraBanner;
