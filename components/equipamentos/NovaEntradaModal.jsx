"use client";
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/Icon';
import { useModal } from '@/components/modals/useModal';
import { CustomDatePicker } from '@/components/ui/DatePicker';
import { obterDataAtual, formatarDataExibicao, formatarMoeda, paraCentavos } from '@/lib/utils/formatters';
import { tintasDe, tintaPorId, fundoDaTinta } from '@/lib/equipamentos/catalogo';
import {
    ultimaCargaPorTinta, ultimoRegistroComContador, tintasMaisAntigas, diasDesde, idadeCurta, formatarContador,
} from '@/lib/equipamentos/historico';

// Uma linha nova na folha da máquina: carga de tinta ou manutenção.
//
// Pensado para o celular, de pé ao lado da impressora: alvos grandes para o
// polegar, teclado numérico no contador, a data já preenchida com hoje. O que
// a pessoa precisa para preencher certo — há quanto tempo cada tinta não é
// trocada, qual foi o último contador — aparece dentro do próprio formulário,
// no lugar em que é útil, em vez de obrigar a fechar e consultar o histórico.
//
// Montado sempre e entregue por portal, pelos mesmos dois motivos do relatório
// do dia em Vendas: o useModal foi escrito para modal que nunca desmonta (a
// dupla montagem do StrictMode desfaria o histórico do navegador e o fecharia
// sozinho), e o layout deixa a página inteira `inert` enquanto há modal aberto —
// renderizado de dentro dela, o modal ficaria inerte junto.

const TIPOS = [
    { valor: 'Reabastecimento', rotulo: 'Reabastecimento', icone: 'droplet' },
    { valor: 'Manutenção', rotulo: 'Manutenção', icone: 'wrench' },
];

// Um check legível sobre qualquer tinta: preto sobre o amarelo e o branco,
// branco sobre o preto e o magenta. Luminância relativa da WCAG, sem tabela de
// exceções para manter em dia quando uma cor nova entrar no catálogo.
function checkContrasta(hex) {
    const canal = (i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const lum = 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
    return lum > 0.4 ? 'text-gray-900' : 'text-white';
}

const soDigitos = (s) => String(s || '').replace(/\D/g, '').slice(0, 9);

// "Feita pela equipe" é a escolha padrão do técnico: a manutenção interna
// (limpeza, troca de peça pela própria Produção) é a mais comum, e não tem
// técnico nem, quase sempre, custo.
const EQUIPE = 'equipe';

function Formulario({ equipamento, nome, registros, tecnicos, aoSalvar, aoFechar, fecharComGuarda }) {
    const hoje = obterDataAtual();
    const [tipo, setTipo] = useState('Reabastecimento');
    const [cores, setCores] = useState(() => new Set());
    const [contador, setContador] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tecnico, setTecnico] = useState(EQUIPE);
    const [valor, setValor] = useState('');
    const [data, setData] = useState(hoje);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null);

    const tintas = tintasDe(equipamento);
    const ultimaCarga = ultimaCargaPorTinta(registros, equipamento.id);
    const maisAntigas = tintasMaisAntigas(ultimaCarga, tintas, hoje);
    const ultimoComContador = ultimoRegistroComContador(registros, equipamento.id);
    const contadorNumero = contador ? Number(contador) : null;

    // Contador menor que o último é quase sempre um dígito trocado. Avisa, mas
    // não impede: um reparo pode ter zerado o contador da máquina.
    const contadorRecuou = contadorNumero != null && ultimoComContador?.contador != null
        && contadorNumero < ultimoComContador.contador;

    const ehCarga = tipo === 'Reabastecimento';
    const falta = ehCarga && cores.size === 0 ? 'Escolha ao menos uma cor.'
        : contadorNumero == null ? 'Informe o contador de páginas.'
        : !ehCarga && !descricao.trim() ? 'Descreva o que foi feito.'
        : !data ? 'Informe a data.'
        : null;

    const alternarCor = (id) => setCores(atual => {
        const novo = new Set(atual);
        if (novo.has(id)) novo.delete(id);
        else novo.add(id);
        return novo;
    });

    async function salvar(e) {
        e.preventDefault();
        if (falta || salvando) return;
        setSalvando(true);
        setErro(null);
        const escolhido = tecnicos.find(t => t.id === tecnico);
        const resultado = await aoSalvar({
            equipamento: equipamento.id,
            tipo,
            data,
            contador: contadorNumero,
            // Na ordem do catálogo, não na ordem dos toques: é assim que o
            // histórico lista, e duas cargas iguais ficam iguais no banco.
            cores: ehCarga ? tintas.filter(t => cores.has(t)) : null,
            descricao: ehCarga ? null : descricao.trim(),
            // Técnico e valor só existem na manutenção — e só vão no registro
            // nela, para o reabastecimento não depender das colunas novas. O
            // nome vai junto do id: se o fornecedor for renomeado ou apagado,
            // o histórico continua dizendo quem fez.
            ...(ehCarga ? {} : {
                tecnico_id: escolhido?.id ?? null,
                tecnico_nome: escolhido?.nome ?? null,
                valor_centavos: valor ? paraCentavos(valor) : null,
            }),
        });
        setSalvando(false);
        if (resultado?.erro) {
            setErro(resultado.erro);
            return;
        }
        // Fecha sem o guarda de alterações: os campos estão preenchidos, mas
        // foram salvos — perguntar "descartar?" aqui seria mentir.
        aoFechar();
    }

    return (
        <form onSubmit={salvar} className="flex flex-col min-h-0 flex-1">
            <div className="px-4 sm:px-6 py-3.5 flex items-center gap-3 bg-brand text-white shrink-0">
                <span className="w-11 h-11 shrink-0 rounded-lg bg-white/15 grid place-items-center">
                    <Icon name="printer" className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 id="equip-modal-titulo" className="font-bold text-base tracking-tight truncate">Nova entrada</h2>
                    <p className="text-mini text-amber-50 truncate">{nome}</p>
                </div>
                <button type="button" onClick={fecharComGuarda} aria-label="Fechar" className="p-2 -mr-2 rounded-lg text-amber-50 hover:text-white hover:bg-white/10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-white">
                    <Icon name="x" className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-4 sm:px-6 py-5 flex flex-col gap-6">
                <fieldset>
                    <legend className="sr-only">Tipo de entrada</legend>
                    {/* Botões com aria-pressed, e não role="radio": o papel de rádio
                        promete navegação por setas e um único item focável no grupo,
                        e prometer sem cumprir é pior que não prometer. Dois botões
                        alternáveis dizem a verdade, com o fieldset dando o grupo. */}
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-realce">
                        {TIPOS.map(t => {
                            const ativo = tipo === t.valor;
                            return (
                                <button
                                    key={t.valor}
                                    type="button"
                                    aria-pressed={ativo}
                                    onClick={() => setTipo(t.valor)}
                                    className={`h-12 rounded-lg flex items-center justify-center gap-2 text-corpo font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand ${
                                        ativo ? 'bg-superficie text-tinta shadow-sm' : 'text-tinta-suave hover:text-tinta'
                                    }`}
                                >
                                    <Icon name={t.icone} className={`w-4 h-4 ${ativo ? 'text-brand' : ''}`} />
                                    {t.rotulo}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                {ehCarga && (
                    <fieldset>
                        <legend className="text-corpo font-semibold text-tinta mb-3">Quais cores?</legend>
                        <div className="grid grid-cols-4 gap-2">
                            {tintas.map(id => {
                                const tinta = tintaPorId(id);
                                const marcada = cores.has(id);
                                const ultima = ultimaCarga[id];
                                const dias = ultima ? diasDesde(ultima.data, hoje) : null;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        role="checkbox"
                                        aria-checked={marcada}
                                        onClick={() => alternarCor(id)}
                                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                                            marcada ? 'border-brand bg-brand/5' : 'border-borda bg-superficie hover:border-borda-forte'
                                        }`}
                                    >
                                        <span
                                            className="relative w-10 h-10 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/25 grid place-items-center"
                                            style={{ background: fundoDaTinta(id) }}
                                        >
                                            {marcada && <Icon name="check" className={`w-5 h-5 ${checkContrasta(tinta.cor)}`} />}
                                        </span>
                                        <span className="text-mini font-semibold text-tinta leading-tight text-center">{tinta.rotulo}</span>
                                        <span className={`text-micro tabular-nums ${maisAntigas.has(id) ? 'text-tinta font-bold' : 'text-tinta-suave'}`}>
                                            {ultima ? idadeCurta(dias) : 'nunca'}
                                            <span className="sr-only"> desde a última carga{maisAntigas.has(id) ? ', a mais antiga da máquina' : ''}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                )}

                <div className="flex flex-col gap-2">
                    <label htmlFor="equip-contador" className="text-corpo font-semibold text-tinta">Contador de páginas</label>
                    <input
                        id="equip-contador"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="O número do painel da máquina"
                        value={contador ? formatarContador(Number(contador)) : ''}
                        onChange={e => setContador(soDigitos(e.target.value))}
                        className="h-12 w-full rounded-xl border border-borda-forte bg-elevado px-4 text-lg font-semibold tabular-nums text-tinta outline-none transition-colors focus:border-brand placeholder:text-base placeholder:font-normal placeholder:text-tinta-suave"
                    />
                    {contadorRecuou ? (
                        <p className="text-mini font-semibold text-aviso">
                            Menor que o último registrado ({formatarContador(ultimoComContador.contador)}, em {formatarDataExibicao(ultimoComContador.data).slice(0, 5)}). Confira o número.
                        </p>
                    ) : ultimoComContador ? (
                        <p className="text-mini text-tinta-suave">
                            Último: <span className="tabular-nums font-semibold">{formatarContador(ultimoComContador.contador)}</span> em {formatarDataExibicao(ultimoComContador.data).slice(0, 5)}
                        </p>
                    ) : null}
                </div>

                {!ehCarga && (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="equip-descricao" className="text-corpo font-semibold text-tinta">O que foi feito</label>
                        <textarea
                            id="equip-descricao"
                            rows={3}
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            placeholder="Ex.: troca do fusor, limpeza da cabeça de impressão"
                            className="w-full rounded-xl border border-borda-forte bg-elevado px-4 py-3 text-corpo text-tinta outline-none transition-colors focus:border-brand resize-y placeholder:text-tinta-suave"
                        />
                    </div>
                )}

                {!ehCarga && (
                    <div className="flex flex-col gap-2">
                        <p id="equip-tecnico-rotulo" className="text-corpo font-semibold text-tinta">Quem fez</p>
                        {/* Pílulas e não uma lista suspensa: são poucos técnicos, e
                            de pé ao lado da máquina um toque vale mais que abrir e
                            rolar um menu. aria-pressed pelo mesmo motivo do
                            seletor de tipo acima. */}
                        <div role="group" aria-labelledby="equip-tecnico-rotulo" className="flex flex-wrap gap-2">
                            {[{ id: EQUIPE, nome: 'Equipe' }, ...tecnicos].map(t => {
                                const ativo = tecnico === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        aria-pressed={ativo}
                                        onClick={() => setTecnico(t.id)}
                                        className={`min-h-11 px-4 rounded-full border text-corpo font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                                            ativo ? 'bg-tinta text-fundo border-tinta' : 'bg-superficie text-tinta-suave border-borda hover:text-tinta hover:border-borda-forte'
                                        }`}
                                    >
                                        {t.nome}
                                    </button>
                                );
                            })}
                        </div>
                        {tecnicos.length === 0 && (
                            <p className="text-mini text-tinta-suave">
                                Nenhum técnico cadastrado. Eles vêm de Cadastros › Fornecedores, com o tipo Manutenção.
                            </p>
                        )}
                    </div>
                )}

                {!ehCarga && (
                    <div className="flex flex-col gap-2">
                        <label htmlFor="equip-valor" className="text-corpo font-semibold text-tinta">
                            Valor <span className="font-normal text-tinta-suave">(opcional)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-corpo font-semibold text-tinta-suave pointer-events-none" aria-hidden="true">R$</span>
                            <input
                                id="equip-valor"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="0,00"
                                value={valor}
                                onChange={e => setValor(formatarMoeda(e.target.value))}
                                className="h-12 w-full rounded-xl border border-borda-forte bg-elevado pl-11 pr-4 text-lg font-semibold tabular-nums text-tinta outline-none transition-colors focus:border-brand placeholder:text-base placeholder:font-normal placeholder:text-tinta-suave"
                            />
                        </div>
                        <p className="text-mini text-tinta-suave">Fica no histórico da máquina. Não lança conta a pagar.</p>
                    </div>
                )}

                {/* O seletor de data compartilhado não aceita id nem rótulo, então
                    o nome chega pelo grupo. O próprio seletor ainda não é alcançável
                    pelo teclado — defeito do componente comum, não desta tela. */}
                <div className="flex flex-col gap-2" role="group" aria-labelledby="equip-data-rotulo">
                    <span id="equip-data-rotulo" className="text-corpo font-semibold text-tinta">Data</span>
                    <CustomDatePicker
                        value={data}
                        onChange={setData}
                        placeholder="Escolher data"
                        className="h-12 w-full rounded-xl border border-borda-forte bg-elevado px-4 text-corpo text-tinta outline-none hover:border-brand transition-colors"
                    />
                </div>

                {erro && (
                    <p role="alert" className="text-mini font-semibold text-perigo">Não foi possível salvar: {erro}</p>
                )}
            </div>

            {/* O aviso do que falta vem ANTES dos botões, também no celular: é
                ele que explica por que o Salvar está apagado, e embaixo dos
                botões ficava fora do caminho do olho, colado na borda da tela. */}
            <div className="px-4 sm:px-6 py-3 border-t border-borda bg-superficie shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                <p className="flex-1 text-mini font-semibold text-tinta-suave" aria-live="polite">{falta}</p>
                <div className="flex gap-2">
                    <button type="button" onClick={fecharComGuarda} className="h-12 px-5 rounded-xl text-corpo font-semibold text-tinta-suave hover:bg-realce transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!!falta || salvando}
                        className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-brand text-white text-corpo font-bold shadow-sm transition-colors hover:bg-brandHover disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        {salvando ? 'Salvando…' : 'Salvar'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function NovaEntradaModal({ equipamento, nome, registros, tecnicos = [], aoSalvar, aoFechar }) {
    const modal = useModal(!!equipamento, aoFechar);

    if (!equipamento || typeof document === 'undefined') return null;

    return createPortal(
        <div {...modal.props} className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-black/80 glass no-print cursor-pointer animate-modal-backdrop">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="equip-modal-titulo"
                className="bg-fundo w-full max-w-none sm:max-w-lg h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-xl shadow-2xl overflow-hidden border border-borda animate-modal-in flex flex-col cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* key pela máquina: abrir outra máquina começa um formulário
                    limpo, sem carregar as cores marcadas na anterior. */}
                <Formulario
                    key={equipamento.id}
                    equipamento={equipamento}
                    nome={nome}
                    registros={registros}
                    tecnicos={tecnicos}
                    aoSalvar={aoSalvar}
                    aoFechar={aoFechar}
                    fecharComGuarda={modal.fechar}
                />
            </div>
        </div>,
        document.body,
    );
}
