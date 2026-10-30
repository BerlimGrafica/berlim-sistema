"use client";
import { useEffect, useState } from 'react';
import { useSessao } from '@/context/SessaoContext';
import { useEquipamentos } from '@/hooks/useEquipamentos';
import { useRegistrosEquipamentos } from '@/hooks/useRegistrosEquipamentos';
import { useTecnicosManutencao } from '@/hooks/useTecnicosManutencao';
import { TINTAS, TIPOS_EQUIPAMENTO } from '@/lib/equipamentos/catalogo';
import { corDoNome } from '@/lib/prototipos/coresDoNome';
import BarraDeCor from '@/components/ui/BarraDeCor';

// Protótipo da nova tela de Equipamentos, no padrão do DESIGN.md, com duas
// opções para a lista de máquinas (lista por tipo e quadro de tintas).
//
// Como em /novaproducao, o HTML em public/prototipos/equipamentos.html é só a
// casca: as máquinas, os registros e os técnicos entram aqui, lidos com a
// sessão de quem está logado, no lugar do marcador /*EQUIPAMENTOS*/. Os mesmos
// hooks da tela atual, então nada novo é buscado no banco. Tudo o que se faz lá
// dentro (registrar, apagar, cadastrar, reordenar) fica só na tela.
export default function Page() {
    const { usuario, usuariosSistema, isAdmin, isDemo } = useSessao();
    const maquinasApi = useEquipamentos();
    const { registros, carregando } = useRegistrosEquipamentos();
    const tecnicos = useTecnicosManutencao();
    const [modelo, setModelo] = useState(null);

    useEffect(() => {
        let vivo = true;
        fetch('/prototipos/equipamentos.html').then(r => r.text()).then(t => { if (vivo) setModelo(t); });
        return () => { vivo = false; };
    }, []);

    if (!modelo || maquinasApi.carregando || carregando) {
        return <div className="min-h-[60vh] grid place-items-center"><BarraDeCor mostrarTexto texto="Carregando protótipo" /></div>;
    }

    const nomePorId = Object.fromEntries((usuariosSistema || []).map(u => [u.id, u.nome]));
    const dados = {
        maquinas: maquinasApi.equipamentos.map(e => ({
            id: e.id, nome: e.nome, modelo: e.modelo || '', tipo: e.tipo, cromia: e.cromia,
            cores: e.cores || [], ordem: e.ordem, arquivada: !!e.arquivado_em,
        })),
        registros: registros.map(r => ({
            id: r.id, eq: r.equipamento, tipo: r.tipo, data: r.data, contador: r.contador,
            cores: r.cores || [], desc: r.descricao || '', tecnico: r.tecnico_nome || '',
            valor: r.valor_centavos, por: nomePorId[r.criado_por] || '',
            meu: !!usuario?.id && r.criado_por === usuario.id,
        })),
        tipos: TIPOS_EQUIPAMENTO.map(t => ({ id: t.id, rotulo: t.rotulo })),
        tintas: Object.entries(TINTAS),
        tecnicos: tecnicos.map(t => t.nome),
        eu: usuario?.nome || '',
        admin: !!isAdmin,
        organizar: !isDemo,
        cores: Object.fromEntries((usuariosSistema || []).map(u => [u.nome, corDoNome(u.nome)])),
    };
    // "<" escapado para um nome nunca fechar o <script> do protótipo.
    const json = JSON.stringify(dados).replace(/</g, '\\u003c');
    const html = modelo.replace('/*EQUIPAMENTOS*/', `const DADOS = ${json};`);

    return (
        <iframe
            title="Protótipo da nova tela de Equipamentos"
            srcDoc={html}
            className="absolute inset-0 w-full h-full border-0"
        />
    );
}
