"use client";
import { useEffect, useRef, useState } from 'react';
import { useFinanceiro } from '@/context/FinanceiroContext';
import { useCadastros } from '@/context/CadastrosContext';
import { useContaDoPrototipo } from '@/hooks/useContaDoPrototipo';
import { CATEGORIAS_CONTA } from '@/lib/utils/constants';
import { obterDataAtual } from '@/lib/utils/formatters';

// Protótipo da nova tela de Contas a pagar, no padrão do DESIGN.md.
//
// Como nos outros protótipos, public/prototipos/contas.html é só a casca: as
// contas entram aqui, no lugar do marcador /*CONTAS*/. Elas já estão na memória
// do sistema (FinanceiroContext carrega contas_pagar inteira, ~200 linhas), então
// esta tela não faz consulta nova. Marcar como paga e o novo modal de conta lá
// dentro só mudam a tela; o "Abrir no modal atual" do novo modal leva o que foi
// digitado para o modal de conta de hoje, que é quem grava — e, gravando, a
// memória atualiza e o protótipo se redesenha com a conta nova.
export default function Page() {
    const { contasPagar, dadosCarregados } = useFinanceiro();
    const { fornecedores } = useCadastros();
    const [modelo, setModelo] = useState(null);
    const iframeRef = useRef(null);
    useContaDoPrototipo(iframeRef);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/contas.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    if (!modelo || !dadosCarregados) {
        return <div className="p-6 text-corpo text-tinta-suave">Carregando protótipo…</div>;
    }

    const dados = {
        hoje: obterDataAtual(),
        contas: contasPagar.map(c => ({
            id: c.id, descricao: c.descricao || 'Conta', valor: c.valor || 0, vencimento: c.vencimento || '', status: c.status,
            categoria: c.categoria || 'Despesa',
            fornecedor: fornecedores.find(f => f.id === c.fornecedor_id)?.nome || '', fornecedorId: c.fornecedor_id || null,
            recorrente: !!c.recorrente, parcelas: c.recorrente_total_parcelas || null, parcela: c.recorrente_parcela_atual || null,
        })),
        categorias: Object.fromEntries(CATEGORIAS_CONTA.map(c => [c.value, { label: c.label, icone: c.icone }])),
        // Para o novo modal de conta: Material, Manutenção e Terceirização pedem
        // um fornecedor do mesmo tipo (a mesma regra do ContaModal de hoje).
        fornecedores: fornecedores.map(f => ({ id: f.id, nome: f.nome || '', tipo: f.tipo || '' })),
    };
    // "<" escapado para uma descrição nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*CONTAS*/', `const DADOS = ${json};`);

    // absolute inset-0 preenche a área da página abaixo da barra e da faixa de
    // pendências; a rolagem fica toda dentro do protótipo.
    return (
        <iframe
            ref={iframeRef}
            title="Protótipo da nova tela de Contas a pagar"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
