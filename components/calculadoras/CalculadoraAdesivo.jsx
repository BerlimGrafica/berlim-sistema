"use client";
import { useState } from 'react';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { CustomSelect } from '@/components/ui/Dropdown';
import { centavosParaReais } from '@/lib/utils/formatters';
import { useUi } from '@/context/UiContext';

export function CalculadoraAdesivo({ produtos }) {
    const { avisar } = useUi();
    const [largura, setLargura] = useState('');
    const [altura, setAltura] = useState('');
    const [tipo, setTipo] = useState('17');
    const [prazo, setPrazo] = useState('padrao');
    const [quantidade, setQuantidade] = useState('');

    const item15 = produtos?.find(p => Number(p.id) === 15);
    const item16 = produtos?.find(p => Number(p.id) === 16);
    const item17 = produtos?.find(p => Number(p.id) === 17);
    const item18 = produtos?.find(p => Number(p.id) === 18);
    const item19 = produtos?.find(p => Number(p.id) === 19);
    const item21 = produtos?.find(p => Number(p.id) === 21);

    const preco15 = item15 ? centavosParaReais(item15.preco_base) : 33.0;
    const preco16 = item16 ? centavosParaReais(item16.preco_base) : 33.0;
    const preco17 = item17 ? centavosParaReais(item17.preco_base) : 90.0;
    const preco18 = item18 ? centavosParaReais(item18.preco_base) : 130.0;
    const preco19 = item19 ? centavosParaReais(item19.preco_base) : 115.0;
    const preco21 = item21 ? centavosParaReais(item21.preco_base) : 55.0;
    const precoMeioMetroTransparente = 80.0;

    // O 1/2 metro tem regra própria por tipo: o transparente usa um valor fixo,
    // o laminado é o dobro do SRA3 dele (item 21) e o sem laminação sai por
    // 0,7333 do metro.
    const precoMeioMetro = (t) => {
        if (t === '19') return precoMeioMetroTransparente;
        if (t === '18') return preco21 * 2;
        return preco17 * 0.7333;
    };

    // Multiplicador de prazo
    let multiplicadorPrazo = 1.0;
    if (prazo === 'outro_dia') multiplicadorPrazo = 1.3; // +30%
    if (prazo === 'mesmo_dia') multiplicadorPrazo = 1.6; // +60%

    // Todo preço exibido/copiado já sai com o prazo aplicado.
    const fmtPrazo = (v) => (v * multiplicadorPrazo).toFixed(2).replace('.', ',');

    const calculaCabem = (areaW, areaH, adW, adH) => {
        return Math.floor(areaW / adW) * Math.floor(areaH / adH);
    };

    const lRawNum = parseFloat(String(largura).replace(',', '.'));
    const aRawNum = parseFloat(String(altura).replace(',', '.'));
    const isTamanhoInvalido = (lRawNum > 0 && lRawNum < 3) || (aRawNum > 0 && aRawNum < 3);

    const copiarMaximos = () => {
        if (isNaN(lRawNum) || isNaN(aRawNum) || lRawNum <= 0 || aRawNum <= 0) {
            avisar('Preencha largura e altura para calcular.');
            return;
        }
        if (isTamanhoInvalido) {
            avisar('O tamanho mínimo permitido é 3x3cm.');
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
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Sem Laminação | 1/2 corte | Entregue em folha A3 - R$ ${fmtPrazo(preco15)}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Sem Laminação | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${fmtPrazo(precoMeioMetro('17'))}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Látex | Sem Laminação | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${fmtPrazo(preco17)}\n\n`;
            }
            texto = texto.trim();
        } else if (tipo === '18') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha A3 - R$ ${fmtPrazo(preco21)}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Laser ou Látex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${fmtPrazo(precoMeioMetro('18'))}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Branco | Impressão Látex | Laminado Brilho/Fosco | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${fmtPrazo(preco18)}\n\n`;
            }
            texto = texto.trim();
        } else if (tipo === '19') {
            const qtd1 = Math.floor(qSRA3 / 10) * 10;
            const qtd2 = Math.floor(qMeio / 10) * 10;
            const qtd3 = Math.floor(qMetro / 10) * 10;

            if (qtd1 > 0) {
                texto += `${qtd1} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | Impressão Laser ou Látex | 1/2 corte | Entregue em folha A3 - R$ ${fmtPrazo(preco16)}\n\n`;
            }
            if (qtd2 > 0) {
                texto += `${qtd2} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | Impressão Laser ou Látex | 1/2 corte | Entregue em folha A3 ou 1/2 metro - R$ ${fmtPrazo(precoMeioMetro('19'))}\n\n`;
            }
            if (qtd3 > 0) {
                texto += `${qtd3} Adesivos | ${lRawNum}x${aRawNum}cm | Adesivo Vinil Transparente | Impressão Látex | 1/2 corte | Entregue em folha de 1/2 metro - R$ ${fmtPrazo(preco19)}\n\n`;
            }
            texto = texto.trim();
        }

        navigator.clipboard.writeText(texto);
        avisar('Orçamentos de quantidades máximas copiados!', 'sucesso');
    };

    const copiarTexto = () => {
        if (isNaN(lRawNum) || isNaN(aRawNum) || lRawNum <= 0 || aRawNum <= 0) {
            avisar('Preencha largura e altura para calcular.');
            return;
        }
        if (isTamanhoInvalido) {
            avisar('O tamanho mínimo permitido é 3x3cm.');
        }

        const texto = gerarTextoCopia();
        if (texto) navigator.clipboard.writeText(texto);
    };

    const calcular = () => {
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
            total = precoMeioMetro(tipo);
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

        return (total * multiplicadorPrazo).toFixed(2);
    };

    const calcularMetrosTotais = () => {
        const lRaw = parseFloat(largura.replace(',', '.'));
        const aRaw = parseFloat(altura.replace(',', '.'));
        const qty = parseInt(quantidade) || 0;
        if (isNaN(lRaw) || isNaN(aRaw) || lRaw <= 0 || aRaw <= 0 || qty <= 0) return '0,00';

        const l = lRaw + 0.2;
        const a = aRaw + 0.2;
        const qMetro = calculaCabem(94, 94, l, a);
        if (qMetro <= 0) return '0,00';

        return (qty / qMetro).toFixed(2);
    };

    const gerarTextoCopia = () => {
        const lRaw = parseFloat(largura.replace(',', '.'));
        const aRaw = parseFloat(altura.replace(',', '.'));
        const qty = parseInt(quantidade) || 0;
        if (isNaN(lRaw) || isNaN(aRaw) || lRaw <= 0 || aRaw <= 0 || qty <= 0) return '';

        let nomeTipo = 'Vinil';
        let lam = '';

        if (tipo === '17') {
            nomeTipo = 'Adesivo Vinil Branco';
            lam = ' | Sem Laminação';
        } else if (tipo === '18') {
            nomeTipo = 'Adesivo Vinil Branco';
            lam = ' | Laminado Brilho/Fosco';
        } else if (tipo === '19') {
            nomeTipo = 'Adesivo Vinil Transparente';
        }

        const val = calcular().replace('.', ',');

        // Calcular onde coube para gerar o texto de entrega e o tipo de impressão
        const l = lRaw + 0.2;
        const a = aRaw + 0.2;
        const qSRA3 = calculaCabem(26, 39, l, a);
        const qMeio = calculaCabem(44, 94, l, a);

        let entregaStr = '';
        let impressaoStr = '';
        if (qSRA3 > 0 && qty <= qSRA3) {
            impressaoStr = ' | Impressão Laser';
            entregaStr = ' | Entregue em folha A3';
        } else if (qMeio > 0 && qty <= qMeio) {
            impressaoStr = ' | Impressão Laser ou Látex';
            entregaStr = ' | Entregue em folha A3 ou 1/2 metro';
        } else {
            impressaoStr = ' | Impressão Látex';
            entregaStr = ' | Entregue em folha de 1/2 metro';
        }

        const plural = qty > 1 ? 'Adesivos' : 'Adesivo';
        return `${qty} ${plural} | ${lRaw}x${aRaw}cm | ${nomeTipo}${lam}${impressaoStr} | 1/2 corte${entregaStr} - R$ ${val}`;
    };

    return (
        <div className="bg-superficie p-6 rounded border border-borda border-t-[3px] border-t-brand dark:border-t-brand">
            {isTamanhoInvalido && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-compacto rounded border border-red-200 dark:border-red-900/50 flex items-center gap-2 font-medium">
                    <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
                    O tamanho mínimo permitido para adesivos é de 3x3cm.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-mini font-semibold text-tinta-suave mb-1">Largura Unitária (cm)</label>
                    <input type="text" value={largura} onChange={e => setLargura(e.target.value)} className="w-full bg-sutil border border-borda rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-mini font-semibold text-tinta-suave mb-1">Altura Unitária (cm)</label>
                    <input type="text" value={altura} onChange={e => setAltura(e.target.value)} className="w-full bg-sutil border border-borda rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" placeholder="Ex: 5" />
                </div>
                <div>
                    <label className="block text-mini font-semibold text-tinta-suave mb-1">Tipo de Adesivo</label>
                    <CustomSelect
                        value={tipo}
                        onChange={setTipo}
                        className="w-full bg-sutil border border-borda rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition cursor-pointer"
                        options={[
                            { value: '17', label: item17 ? item17.nome : 'Item 17' },
                            { value: '18', label: `${item18 ? item18.nome : 'Item 18'} (Laminado Brilho/Fosco)` },
                            { value: '19', label: item19 ? item19.nome : 'Item 19' },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-mini font-semibold text-tinta-suave mb-1">Prazo de Entrega</label>
                    <CustomSelect
                        value={prazo}
                        onChange={setPrazo}
                        className="w-full bg-sutil border border-borda rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition cursor-pointer"
                        options={[
                            { value: 'padrao', label: 'Padrão' },
                            { value: 'outro_dia', label: 'Para outro dia (+30%)' },
                            { value: 'mesmo_dia', label: 'Para o mesmo dia (+60%)' },
                        ]}
                    />
                </div>
                <div>
                    <label className="block text-mini font-semibold text-tinta-suave mb-1">Quantidade</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="w-full bg-sutil border border-borda rounded px-3 py-2 text-corpo outline-none focus:border-brand dark:text-white transition" />
                </div>
                <div className="flex flex-col justify-end">
                    <Tooltip label="Copiar orçamentos de quantidades máximas" className="w-full">
                        <button onClick={copiarMaximos} className="w-full bg-brand text-white px-3 py-2 rounded text-corpo font-semibold flex items-center justify-center gap-2 hover:bg-brand/90 transition shadow-sm">
                            <Icon name="copy" className="w-4 h-4" />
                            Quantidades Máximas
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 bg-sutil p-3 rounded border border-borda-fraca flex items-center gap-3 shadow-sm">
                    <div className="text-mini text-tinta-suave flex-1 font-mono break-all line-clamp-2">
                        {gerarTextoCopia() || 'Preencha as medidas para gerar o texto da proposta...'}
                    </div>
                    <Tooltip label="Copiar Texto">
                        <button onClick={copiarTexto} aria-label="Copiar Texto" className="w-8 h-8 flex items-center justify-center shrink-0 bg-superficie border border-borda rounded hover:text-brand transition shadow-sm">
                            <Icon name="copy" className="w-4 h-4" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-sutil p-4 rounded-lg flex items-center justify-between border border-borda-fraca">
                    <span className="font-semibold text-tinta-suave">Total em Metros</span>
                    <span className="text-2xl font-black text-tinta">{calcularMetrosTotais().replace('.', ',')} m</span>
                </div>
                <div className="flex-1 bg-brand/10 p-4 rounded-lg flex items-center justify-between border border-brand/20">
                    <span className="font-semibold text-brand">Total Estimado</span>
                    <span className="text-2xl font-black text-brand">R$ {calcular().replace('.', ',')}</span>
                </div>
            </div>
        </div>
    );
}
