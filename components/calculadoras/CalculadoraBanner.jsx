"use client";
import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { CustomSelect } from '@/components/ui/Dropdown';
import { useAppContext } from '@/context/AppContext';

export function CalculadoraBanner() {
    const { avisar } = useAppContext();
    const [largura, setLargura] = useState('');
    const [altura, setAltura] = useState('');
    const [tipo, setTipo] = useState('simples');
    const [acabamento, setAcabamento] = useState('bastao_corda');
    const [prazo, setPrazo] = useState('padrao');
    const [quantidade, setQuantidade] = useState(1);
    const avisoValorAltoDisparado = useRef(false);

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

        const textTipo = tipo === 'simples' ? 'Lona 440g Brilho | Sem Laminação (Película de proteção)' : 'Lona 440g Brilho | Laminado Brilho ou Fosco';
        const textAcab = acabamento === 'bastao_corda' ? 'Acabamento em Bastão e Corda' : acabamento === 'ilhos' ? 'Acabamento em Ilhós (Argolas de Ferro)' : 'Sem Acabamento';
        const val = calcular().replace('.', ',');
        const dim = `${Math.round(l * 100)}x${Math.round(a * 100)}cm`;

        const plural = quantidade > 1 ? 'Banners' : 'Banner';
        return `${quantidade} ${plural} | ${dim} | ${textTipo} | ${textAcab} - R$ ${val}`;
    };

    const valorCalculado = parseFloat(calcular());

    useEffect(() => {
        if (valorCalculado > 300) {
            if (!avisoValorAltoDisparado.current) {
                avisoValorAltoDisparado.current = true;
                avisar('Consultar disponibilidade com o Murilo/Giovana');
            }
        } else {
            avisoValorAltoDisparado.current = false;
        }
    }, [valorCalculado]);

    return (
        <div className="bg-white dark:bg-darkCard p-6 rounded border border-gray-200 dark:border-darkBorder border-t-[3px] border-t-brand dark:border-t-brand">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Largura (m)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 1,50" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Altura (m)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 2,00" />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Tipo de Lona</label>
                    <CustomSelect
                        value={tipo}
                        onChange={setTipo}
                        className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                        options={[
                            { value: 'simples', label: 'Lona 440g Brilho (R$ 90/m²)' },
                            { value: 'laminado', label: 'Lona 440g Brilho Laminada (R$ 130/m²)' },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Acabamento</label>
                    <CustomSelect
                        value={acabamento}
                        onChange={setAcabamento}
                        className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                        options={[
                            { value: 'bastao_corda', label: 'Bastão e Corda' },
                            { value: 'ilhos', label: 'Ilhós (Argolas de ferro)' },
                            { value: 'sem_acabamento', label: 'Sem Acabamento (- R$ 10/m²)' },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Prazo de Entrega</label>
                    <CustomSelect
                        value={prazo}
                        onChange={setPrazo}
                        className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition cursor-pointer"
                        options={[
                            { value: 'padrao', label: 'Padrão' },
                            { value: 'outro_dia', label: 'Para outro dia (+30%)' },
                            { value: 'mesmo_dia', label: 'Para o mesmo dia (+60%)' },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA] mb-1">Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(parseInt(e.target.value) || 1)} className="w-full bg-gray-50 dark:bg-darkElevated border border-gray-200 dark:border-darkBorder rounded px-3 py-2 text-[13px] outline-none focus:border-brand dark:text-white transition" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-gray-50 dark:bg-darkElevated p-3 rounded border border-gray-100 dark:border-darkBorder flex items-center gap-3 shadow-sm">
                    <div className="text-[11px] text-gray-600 dark:text-[#A1A1AA] flex-1 font-mono break-all line-clamp-2">
                        {gerarTextoCopia() || 'Preencha as medidas para gerar o texto da proposta...'}
                    </div>
                    <Tooltip label="Copiar Texto">
                        <button onClick={() => { if(gerarTextoCopia()) navigator.clipboard.writeText(gerarTextoCopia()) }} aria-label="Copiar Texto" className="w-8 h-8 flex items-center justify-center shrink-0 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded hover:text-brand transition shadow-sm">
                            <Icon name="copy" className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                <span className="font-semibold text-brand">Total Estimado</span>
                <span className="text-2xl font-black text-brand">R$ {calcular().replace('.', ',')}</span>
            </div>
        </div>
    );
}
