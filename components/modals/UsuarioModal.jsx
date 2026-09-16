"use client";
import { useMemo, useState } from 'react';
import { useCadastros } from "@/context/CadastrosContext";
import Icon from "@/components/Icon";
import { useModal } from '@/components/modals/useModal';
import {
    CARGOS, TELAS, TELAS_FIXAS,
    cargoDe, telasDoCargo, permissoesDe, usaPadraoDoCargo, normalizarTelas, idSub,
} from '@/lib/acesso/telas';

// Cadastro de acesso: quem é a pessoa, que cargo ela ocupa e o que ela abre —
// tela por tela, e sub-aba por sub-aba dentro de cada tela. As duas coisas numa
// tela só, porque são a mesma decisão: separar em abas esconderia justamente o
// efeito que o administrador precisa enxergar, que é escolher "Financeiro" e
// ver cinco telas acenderem e as outras apagarem, na hora.
//
// O cargo continua sendo o normal. A lista própria é a exceção, e por isso ela
// nasce desligada: enquanto o interruptor de personalizar estiver apagado, a
// lista mostra o padrão do cargo em modo somente-leitura, e o que vai para o
// banco é NULL — quer dizer, "siga o cargo, inclusive se o padrão do cargo
// mudar um dia". Congelar uma cópia do padrão faria cada usuário carregar para
// sempre a regra do dia em que foi cadastrado.
//
// Uma nota sobre legibilidade, porque foi a primeira coisa a dar errado aqui:
// o estado "desligado" NÃO é comunicado apagando o texto. Rótulo de tela e de
// sub-aba ficam em tinta cheia sempre; quem diz ligado/desligado é o
// interruptor, a caixa de marcação e a cor da moldura. Texto cinza-sobre-cinza
// é ilegível antes de ser informativo — e aqui a pessoa precisa LER a lista
// inteira justamente para decidir o que ligar.

function Interruptor({ ligado, travado = false }) {
    return (
        <span
            aria-hidden
            className={`relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors duration-200
                ${ligado ? 'bg-brand border-brand' : 'bg-realce border-borda-forte'} ${travado ? 'opacity-70' : ''}`}
        >
            <span className={`h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${ligado ? 'translate-x-[19px]' : 'translate-x-[3px]'}`} />
        </span>
    );
}

// Caixa de marcação das sub-abas. Quadrada de propósito: o interruptor manda na
// tela inteira e a caixa numa parte dela — formas iguais nos dois níveis fariam
// parecer que clicar em qualquer um faz a mesma coisa.
function Caixa({ marcada, travada = false }) {
    return (
        <span
            aria-hidden
            className={`w-[18px] h-[18px] shrink-0 rounded-[5px] border-2 flex items-center justify-center transition-colors duration-200
                ${marcada ? 'bg-brand border-brand text-white' : 'bg-elevado border-borda-forte text-transparent'} ${travada ? 'opacity-70' : ''}`}
        >
            <Icon name="check" className="w-3 h-3 stroke-[3]" />
        </span>
    );
}

export default function UsuarioModal() {
    const { modalUsuarioAberto, setModalUsuarioAberto, novoUsuario, setNovoUsuario, salvarUsuario } = useCadastros();
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Cargo e permissões são botões, não campos de formulário — o guarda de
    // fechamento do useModal lê <input>/<select> e não enxergaria uma
    // permissão alterada. A assinatura entrega esse estado a ele.
    const assinatura = () => JSON.stringify([novoUsuario.nivel, novoUsuario.telas]);
    const modal = useModal(modalUsuarioAberto, () => setModalUsuarioAberto(false), assinatura);

    const cargo = cargoDe(novoUsuario.nivel);
    const personalizado = !usaPadraoDoCargo(novoUsuario);
    const liberadas = useMemo(
        () => new Set(permissoesDe({ nivel: novoUsuario.nivel, telas: novoUsuario.telas })),
        [novoUsuario.nivel, novoUsuario.telas],
    );
    const quantasTelas = useMemo(() => TELAS.filter(t => liberadas.has(t.id)).length, [liberadas]);

    const iniciais = (novoUsuario.nome || '').trim().split(/\s+/).filter(Boolean)
        .slice(0, 2).map(p => p[0]).join('').toUpperCase();

    const mexer = (campos) => setNovoUsuario({ ...novoUsuario, ...campos });
    const gravar = (ids) => mexer({ telas: normalizarTelas(ids) });

    // Ligar ou desligar uma tela arrasta as sub-abas dela junto. O contrário —
    // uma tela acesa com todas as sub-abas apagadas — seria uma tela que abre
    // vazia, e ninguém quer dizer isso ao desmarcar a última sub-aba.
    const alternarTela = (tela) => {
        if (!personalizado || TELAS_FIXAS.includes(tela.id)) return;
        const atual = new Set(novoUsuario.telas);
        const subs = (tela.subtelas || []).map(s => idSub(tela.id, s.id));
        if (atual.has(tela.id)) {
            atual.delete(tela.id);
            subs.forEach(id => atual.delete(id));
        } else {
            atual.add(tela.id);
            subs.forEach(id => atual.add(id));
        }
        gravar([...atual]);
    };

    // E a recíproca: desmarcar a última sub-aba apaga a tela inteira, em vez de
    // deixar no menu um destino que não leva a lugar nenhum.
    const alternarSub = (tela, sub) => {
        if (!personalizado) return;
        const atual = new Set(novoUsuario.telas);
        const id = idSub(tela.id, sub.id);
        if (atual.has(id)) {
            atual.delete(id);
            const sobrou = (tela.subtelas || []).some(s => atual.has(idSub(tela.id, s.id)));
            if (!sobrou && !TELAS_FIXAS.includes(tela.id)) atual.delete(tela.id);
        } else {
            atual.add(id);
            atual.add(tela.id);
        }
        gravar([...atual]);
    };

    async function aoEnviar(e) {
        e.preventDefault();
        if (salvando) return;
        setSalvando(true);
        try { await salvarUsuario(e); } finally { setSalvando(false); }
    }

    if (!modalUsuarioAberto) return null;

    return (
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print transition-all cursor-pointer animate-modal-backdrop">
            <div
                className="bg-fundo w-full max-w-none sm:max-w-5xl h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-xl shadow-2xl border border-borda animate-modal-in cursor-default flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ---------- Cabeçalho ---------- */}
                <div className="px-5 sm:px-7 py-4 flex justify-between items-center gap-4 bg-brand text-white shrink-0">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-lg tracking-tight truncate">
                            {novoUsuario.id ? 'Editar Conta de Acesso' : 'Nova Conta de Acesso'}
                        </h3>
                        <p className="text-mini text-white/90 mt-0.5">
                            Defina o cargo e exatamente quais telas e sub-abas esta pessoa abre.
                        </p>
                    </div>
                    <button type="button" onClick={modal.fechar} aria-label="Fechar" className="text-white/80 hover:text-white transition shrink-0">
                        <Icon name="x" />
                    </button>
                </div>

                <form onSubmit={aoEnviar} className="flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                        <div className="grid lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">

                            {/* ---------- Coluna da identidade ---------- */}
                            <aside className="p-5 sm:p-7 flex flex-col gap-5 bg-superficie lg:border-r border-b lg:border-b-0 border-borda">
                                <div className="flex items-center gap-4">
                                    {/* A inicial troca conforme se digita o nome: é o retorno
                                        mais barato de que o formulário está vivo. */}
                                    <div className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center bg-realce border-2 ${personalizado ? 'border-brand' : 'border-borda-forte'} transition-colors`}>
                                        {iniciais
                                            ? <span className="text-lg font-black text-tinta tracking-tight">{iniciais}</span>
                                            : <Icon name="user" className="w-6 h-6 text-tinta-suave" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-corpo font-bold text-tinta truncate">{novoUsuario.nome || 'Sem nome'}</p>
                                        <span className={`mt-1 inline-block px-2 py-0.5 rounded text-mini font-bold uppercase tracking-wider border ${cargo.selo}`}>
                                            {cargo.rotulo}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-corpo font-semibold mb-1.5 text-tinta">Nome de Exibição</label>
                                    <input required value={novoUsuario.nome} onChange={e => mexer({ nome: e.target.value })} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo text-tinta outline-none focus:border-brand transition" placeholder="Ex: Giovana" />
                                </div>

                                {!novoUsuario.id && (
                                    <div>
                                        <label className="block text-corpo font-semibold mb-1.5 text-tinta">E-mail de acesso</label>
                                        <input required type="email" value={novoUsuario.email} onChange={e => mexer({ email: e.target.value })} className="w-full bg-elevado border border-borda-forte rounded px-3 py-2 text-corpo text-tinta outline-none focus:border-brand transition" placeholder="nome@empresa.com" />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-corpo font-semibold mb-1.5 text-tinta">{novoUsuario.id ? 'Nova Senha' : 'Senha'}</label>
                                    <div className="relative">
                                        <input
                                            required={!novoUsuario.id}
                                            type={mostrarSenha ? 'text' : 'password'}
                                            value={novoUsuario.senha}
                                            onChange={e => mexer({ senha: e.target.value })}
                                            className="w-full bg-elevado border border-borda-forte rounded pl-3 pr-10 py-2 text-corpo text-tinta outline-none focus:border-brand transition"
                                            placeholder={novoUsuario.id ? 'Em branco mantém a atual' : 'Mínimo 8 caracteres'}
                                            minLength={8}
                                        />
                                        <button type="button" onClick={() => setMostrarSenha(v => !v)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-tinta-suave hover:text-tinta transition">
                                            <Icon name={mostrarSenha ? 'lock' : 'eye'} className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Contagem viva: fecha o ciclo entre marcar uma sub-aba lá
                                    na lista e o que a pessoa vai receber. */}
                                <div className="mt-auto pt-4 border-t border-borda">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-black tabular-nums text-brand leading-none">{quantasTelas}</span>
                                        <span className="text-mini font-bold uppercase tracking-widest text-tinta-corpo">
                                            de {TELAS.length} telas liberadas
                                        </span>
                                    </div>
                                    <p className="text-mini text-tinta-suave mt-1.5">
                                        {personalizado
                                            ? 'Lista própria — não acompanha mudanças no cargo.'
                                            : `Padrão do cargo ${cargo.rotulo}.`}
                                    </p>
                                </div>
                            </aside>

                            {/* ---------- Coluna das permissões ---------- */}
                            <section className="p-5 sm:p-7 flex flex-col gap-7">

                                {/* ----- Cargo ----- */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-5 h-5 rounded-full bg-brand text-white text-mini font-black flex items-center justify-center shrink-0">1</span>
                                        <h4 className="text-corpo font-bold text-tinta">Cargo</h4>
                                        <span className="text-mini text-tinta-suave">define o padrão de acesso</span>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-2.5">
                                        {CARGOS.map((c, i) => {
                                            const ativo = c.valor === novoUsuario.nivel;
                                            return (
                                                <button
                                                    type="button"
                                                    key={c.valor}
                                                    onClick={() => mexer({ nivel: c.valor })}
                                                    style={{ animationDelay: `${i * 35}ms` }}
                                                    className={`animate-surgir text-left relative rounded-lg border-2 p-3 pr-9 transition-all duration-200
                                                        ${ativo
                                                            ? 'border-brand bg-brand/10 shadow-sm'
                                                            : 'border-borda-forte bg-superficie hover:border-brand/50 hover:bg-realce'}`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Icon name={c.icone} className={`w-4 h-4 shrink-0 ${ativo ? 'text-brand' : c.realce}`} />
                                                        <span className="text-corpo font-bold text-tinta">{c.rotulo}</span>
                                                    </span>
                                                    <span className="block text-mini text-tinta-corpo mt-1 leading-snug">{c.resumo}</span>
                                                    {ativo && (
                                                        <span className="animate-selo absolute top-3 right-3 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center">
                                                            <Icon name="check" className="w-2.5 h-2.5 stroke-[3]" />
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ----- Telas e sub-abas ----- */}
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-5 h-5 rounded-full text-mini font-black flex items-center justify-center shrink-0 transition-colors ${personalizado ? 'bg-brand text-white' : 'bg-realce text-tinta-suave'}`}>2</span>
                                            <h4 className={`text-corpo font-bold transition-colors ${personalizado ? 'text-tinta' : 'text-tinta-suave'}`}>Telas liberadas</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => mexer({ telas: personalizado ? null : telasDoCargo(novoUsuario.nivel) })}
                                            className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-mini font-bold uppercase tracking-wider transition-colors
                                                ${personalizado ? 'border-brand bg-brand/10 text-brand' : 'border-borda-forte bg-superficie text-tinta-corpo hover:border-brand/50 hover:bg-realce'}`}
                                        >
                                            <Interruptor ligado={personalizado} />
                                            Personalizar
                                        </button>
                                    </div>

                                    {/* A faixa de aviso fica FORA do bloco apagado, em contraste
                                        cheio: ela é a única parte que a pessoa precisa ler
                                        quando o resto está desligado, e é ela que diz onde
                                        clicar. O "Personalizar" dentro do texto liga de fato —
                                        quem tenta mexer na lista travada está tentando ligar
                                        isso, e obrigá-lo a achar o interruptor lá em cima seria
                                        cobrar pedágio por um engano que o desenho causou. */}
                                    {!personalizado && (
                                        <p className="mb-2.5 flex items-center gap-2 rounded-md border border-borda bg-superficie px-3 py-2 text-mini text-tinta-corpo">
                                            <Icon name="lock" className="w-3.5 h-3.5 shrink-0 text-tinta-suave" />
                                            <span>
                                                Seguindo o padrão do cargo {cargo.rotulo}.{' '}
                                                <button type="button" onClick={() => mexer({ telas: telasDoCargo(novoUsuario.nivel) })} className="font-bold text-brand hover:underline">
                                                    Personalizar
                                                </button>{' '}
                                                para abrir ou fechar telas e sub-abas uma a uma.
                                            </span>
                                        </p>
                                    )}

                                    {/* Desligado, o bloco inteiro é dessaturado e recuado.
                                        O cinza é o que faz a diferença: o laranja das telas
                                        acesas é o que dava a impressão de coisa viva, e foi por
                                        isso que dava vontade de clicar. `inert` fecha o engano
                                        pelo outro lado — a lista deixa de receber clique e de
                                        entrar na ordem de tabulação, em vez de aceitar o toque
                                        e não fazer nada. */}
                                    <div
                                        inert={!personalizado}
                                        className={`transition-[opacity,filter] duration-300 ${personalizado ? '' : 'opacity-50 grayscale cursor-not-allowed'}`}
                                    >

                                    {/* Uma coluna, e não duas: o cartão agora cresce ao abrir a
                                        gaveta, e numa grade de duas colunas isso deixaria um
                                        buraco do lado da tela expandida a cada clique. */}
                                    <div key={`${novoUsuario.nivel}-${personalizado}`} className="flex flex-col gap-2">
                                        {TELAS.map((t, i) => {
                                            const marcada = liberadas.has(t.id);
                                            const fixa = TELAS_FIXAS.includes(t.id);
                                            const travada = !personalizado || fixa;
                                            const subs = t.subtelas || [];
                                            const subsMarcadas = subs.filter(s => liberadas.has(idSub(t.id, s.id)));
                                            return (
                                                <div
                                                    key={t.id}
                                                    style={{ animationDelay: `${i * 30}ms` }}
                                                    className={`animate-surgir rounded-lg border-2 overflow-hidden transition-colors duration-200
                                                        ${marcada ? 'border-brand/70 bg-brand/[0.07]' : 'border-borda-forte bg-superficie'}`}
                                                >
                                                    {/* O cartão é um <div> com um botão dentro, e não um
                                                        botão só: as sub-abas também são botões, e um
                                                        botão dentro de outro não é marcação válida. */}
                                                    <button
                                                        type="button"
                                                        onClick={() => alternarTela(t)}
                                                        disabled={travada}
                                                        title={fixa ? 'A tela inicial não pode ser removida.' : undefined}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                                                            ${travada ? 'cursor-default' : 'cursor-pointer hover:bg-realce/60'}`}
                                                    >
                                                        <span className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center transition-colors
                                                            ${marcada ? 'bg-brand text-white' : 'bg-realce text-tinta-suave'}`}>
                                                            <Icon name={t.icone} className="w-4 h-4" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="text-corpo font-bold text-tinta truncate">{t.rotulo}</span>
                                                                {fixa && <Icon name="lock" className="w-3 h-3 text-tinta-suave shrink-0" />}
                                                            </span>
                                                            <span className="block text-mini text-tinta-corpo mt-0.5 leading-snug">{t.resumo}</span>
                                                        </span>
                                                        {subs.length > 0 && (
                                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-mini font-bold tabular-nums transition-colors
                                                                ${marcada ? 'bg-brand/20 text-brand' : 'bg-realce text-tinta-suave'}`}>
                                                                {subsMarcadas.length}/{subs.length}
                                                            </span>
                                                        )}
                                                        <Interruptor ligado={marcada} travado={travada} />
                                                    </button>

                                                    {/* As sub-abas continuam montadas com a tela
                                                        apagada — a gaveta precisa dos dois lados da
                                                        transição para animar o fechamento. `inert`
                                                        tira da ordem de tabulação o que está fora de
                                                        vista, senão o Tab entra numa gaveta fechada. */}
                                                    {subs.length > 0 && (
                                                        <div className="gaveta" data-aberta={marcada}>
                                                            <div>
                                                                <div inert={!marcada} className="border-t-2 border-brand/25 bg-fundo/60">
                                                                    {subs.map((s) => {
                                                                        const ligada = liberadas.has(idSub(t.id, s.id));
                                                                        // Sub-aba que o servidor só entrega a
                                                                        // Administrador aparece cadeada: marcar
                                                                        // não adiantaria, e um botão que aceita o
                                                                        // clique sem mudar nada é pior do que um
                                                                        // botão travado.
                                                                        const soAdmin = s.soAdmin && novoUsuario.nivel !== 'Administrador';
                                                                        const bloqueada = !personalizado || soAdmin;
                                                                        return (
                                                                            <button
                                                                                type="button"
                                                                                key={s.id}
                                                                                onClick={() => alternarSub(t, s)}
                                                                                disabled={bloqueada}
                                                                                title={soAdmin ? 'Gerenciar acessos é exclusivo do cargo Administrador.' : undefined}
                                                                                className={`w-full flex items-center gap-3 pl-4 pr-3 py-2 text-left border-b border-borda-fraca last:border-b-0 transition-colors
                                                                                    ${bloqueada ? 'cursor-default' : 'cursor-pointer hover:bg-realce'}`}
                                                                            >
                                                                                <Caixa marcada={ligada} travada={bloqueada} />
                                                                                <Icon name={s.icone} className={`w-4 h-4 shrink-0 ${ligada ? 'text-brand' : 'text-tinta-suave'}`} />
                                                                                <span className="text-corpo font-semibold text-tinta truncate">{s.rotulo}</span>
                                                                                {soAdmin && <Icon name="lock" className="w-3 h-3 ml-auto shrink-0 text-tinta-suave" />}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {personalizado && (
                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-mini">
                                            <button type="button" onClick={() => gravar(TELAS.map(t => t.id))} className="font-bold text-brand hover:underline">Marcar todas</button>
                                            <button type="button" onClick={() => gravar([...TELAS_FIXAS])} className="font-bold text-brand hover:underline">Deixar só a inicial</button>
                                            <button type="button" onClick={() => mexer({ telas: telasDoCargo(novoUsuario.nivel) })} className="font-bold text-brand hover:underline">Voltar ao padrão de {cargo.rotulo}</button>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* ---------- Rodapé ---------- */}
                    <div className="shrink-0 px-5 sm:px-7 py-4 border-t border-borda bg-superficie flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-mini text-tinta-suave">
                            {novoUsuario.id
                                ? 'As telas mudam para essa pessoa assim que você salvar, mesmo com ela conectada.'
                                : 'A conta passa a funcionar imediatamente após salvar.'}
                        </p>
                        <div className="flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={modal.fechar} className="px-4 py-2 rounded text-corpo font-semibold text-tinta-corpo hover:bg-realce transition">Cancelar</button>
                            <button type="submit" disabled={salvando} className="px-5 py-2 rounded text-corpo font-semibold bg-brand text-white hover:bg-brandHover transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                {salvando ? 'Salvando…' : 'Salvar Acesso'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
