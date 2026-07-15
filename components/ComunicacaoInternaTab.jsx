"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';

export default function ComunicacaoInternaTab() {
    const { 
        abaComunicacao, setAbaComunicacao, 
        requisicoesMaterial, tarefasInternas, linksPagamento,
        setModalRequisicaoAberto, setNovaRequisicao,
        setModalTarefaAberto, setNovaTarefa,
        setModalLinkAberto, setNovoLink,
        excluirRequisicao, excluirTarefa, excluirLink,
        concluirRequisicao, concluirTarefa, concluirLink,
        usuario, isAdmin
    } = useAppContext();

    const [mostrarConcluidosReq, setMostrarConcluidosReq] = React.useState(false);
    const [mostrarConcluidosTarefas, setMostrarConcluidosTarefas] = React.useState(false);
    const [mostrarConcluidosLinks, setMostrarConcluidosLinks] = React.useState(false);

    const requisicoesVisiveis = mostrarConcluidosReq ? requisicoesMaterial : requisicoesMaterial.filter(r => r.status === 'Pendente');
    const tarefasVisiveis = mostrarConcluidosTarefas ? tarefasInternas : tarefasInternas.filter(t => t.status !== 'Concluída');
    const linksVisiveis = mostrarConcluidosLinks ? linksPagamento : linksPagamento.filter(l => l.status !== 'Inativo' && l.status !== 'Pago' && l.status !== 'Concluído');

    return (
        <>
            <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                <a onClick={() => setAbaComunicacao('requisicoes')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaComunicacao === 'requisicoes' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                    <Icon name="shopping-bag" className="w-4 h-4" /> Requisição de Material
                </a>
                <a onClick={() => setAbaComunicacao('tarefas')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaComunicacao === 'tarefas' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                    <Icon name="check-square" className="w-4 h-4" /> Tarefas
                </a>
                <a onClick={() => setAbaComunicacao('links')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaComunicacao === 'links' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                    <Icon name="link" className="w-4 h-4" /> Link de Pagamento
                </a>
            </div>

            {abaComunicacao === 'requisicoes' && (
                <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Requisição de Material</h1>
                            <p className="text-[13px] text-gray-500 mt-1.5 font-medium max-w-xl">
                                Solicite materiais para a produção ou escritório.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setMostrarConcluidosReq(!mostrarConcluidosReq)} className={`px-4 py-2 text-[13px] rounded-md font-semibold border transition ${mostrarConcluidosReq ? 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-darkElevated dark:border-darkBorder dark:text-gray-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-darkCard dark:border-darkBorder dark:text-gray-400 hover:bg-gray-50'}`}>
                                {mostrarConcluidosReq ? 'Ocultar Concluídos' : 'Mostrar Histórico'}
                            </button>
                            <button onClick={() => {
                                setNovaRequisicao({ id: null, itens: '', observacoes: '', status: 'Pendente' });
                                setModalRequisicaoAberto(true);
                            }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                <Icon name="plus" className="w-4 h-4" /> Nova Requisição
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requisicoesVisiveis.length > 0 ? requisicoesVisiveis.map(r => (
                            <div key={r.id} onClick={() => { setNovaRequisicao(r); setModalRequisicaoAberto(true); }} className={`bg-white dark:bg-darkCard rounded-xl shadow-sm border p-5 flex flex-col gap-3 cursor-pointer hover:border-brand/50 transition-colors ${r.status === 'Comprado' ? 'opacity-60 border-gray-200 dark:border-darkBorder' : 'border-gray-200 dark:border-darkBorder'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`font-bold ${r.status === 'Comprado' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>Requisição #{r.id}</h3>
                                        <p className="text-[11px] font-semibold text-brand mt-1">{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {r.status !== 'Comprado' && (
                                            <button onClick={(e) => { e.stopPropagation(); concluirRequisicao(r.id); }} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded" title="Concluir"><Icon name="check-circle" className="w-4 h-4" /></button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); excluirRequisicao(r.id); }} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Excluir"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-[13px] text-gray-600 dark:text-[#A1A1AA] mt-1 line-clamp-3" title={r.itens}>{r.itens}</p>
                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-darkBorder flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                                        <Icon name="user" className="w-3.5 h-3.5" /> {r.criado_por}
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                                        r.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                        r.status === 'Comprado' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                    }`}>{r.status}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center text-gray-400 text-[13px]">Nenhuma requisição encontrada.</div>
                        )}
                    </div>
                </main>
            )}

            {abaComunicacao === 'tarefas' && (
                <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Tarefas</h1>
                            <p className="text-[13px] text-gray-500 mt-1.5 font-medium max-w-xl">
                                Gerencie tarefas internas da equipe.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setMostrarConcluidosTarefas(!mostrarConcluidosTarefas)} className={`px-4 py-2 text-[13px] rounded-md font-semibold border transition ${mostrarConcluidosTarefas ? 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-darkElevated dark:border-darkBorder dark:text-gray-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-darkCard dark:border-darkBorder dark:text-gray-400 hover:bg-gray-50'}`}>
                                {mostrarConcluidosTarefas ? 'Ocultar Concluídas' : 'Mostrar Histórico'}
                            </button>
                            <button onClick={() => {
                                setNovaTarefa({ id: null, titulo: '', descricao: '', responsavel: '', prazo: '', status: 'Pendente' });
                                setModalTarefaAberto(true);
                            }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                <Icon name="plus" className="w-4 h-4" /> Nova Tarefa
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tarefasVisiveis.length > 0 ? tarefasVisiveis.map(t => (
                            <div key={t.id} onClick={() => { setNovaTarefa(t); setModalTarefaAberto(true); }} className={`bg-white dark:bg-darkCard rounded-xl shadow-sm border p-5 flex flex-col gap-3 cursor-pointer hover:border-brand/50 transition-colors ${t.status === 'Concluída' ? 'opacity-60 border-gray-200 dark:border-darkBorder' : 'border-gray-200 dark:border-darkBorder'}`}>
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold ${t.status === 'Concluída' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>{t.titulo}</h3>
                                    <div className="flex gap-1">
                                        {t.status !== 'Concluída' && (
                                            <button onClick={(e) => { e.stopPropagation(); concluirTarefa(t.id); }} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded" title="Concluir"><Icon name="check-circle" className="w-4 h-4" /></button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); excluirTarefa(t.id); }} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Excluir"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-[13px] text-gray-600 dark:text-[#A1A1AA]">{t.descricao}</p>
                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-darkBorder flex justify-between items-center">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                                        <Icon name="user" className="w-3.5 h-3.5" /> {t.responsavel || 'Sem responsável'}
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${t.status === 'Concluída' ? 'bg-gray-100 text-gray-500' : t.status === 'Em Andamento' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center text-gray-400 text-[13px]">Nenhuma tarefa encontrada.</div>
                        )}
                    </div>
                </main>
            )}

            {abaComunicacao === 'links' && (
                <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full fade-in">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-gray-100 dark:border-darkBorder pb-6 shrink-0">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Links de Pagamento</h1>
                            <p className="text-[13px] text-gray-500 mt-1.5 font-medium max-w-xl">
                                Organize seus links de pagamento (Mercado Pago, Asaas, etc) para envio rápido.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setMostrarConcluidosLinks(!mostrarConcluidosLinks)} className={`px-4 py-2 text-[13px] rounded-md font-semibold border transition ${mostrarConcluidosLinks ? 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-darkElevated dark:border-darkBorder dark:text-gray-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-darkCard dark:border-darkBorder dark:text-gray-400 hover:bg-gray-50'}`}>
                                {mostrarConcluidosLinks ? 'Ocultar Inativos' : 'Mostrar Histórico'}
                            </button>
                            <button onClick={() => {
                                setNovoLink({ id: null, titulo: '', link: '', valor: '', cliente: '', status: 'Ativo' });
                                setModalLinkAberto(true);
                            }} className="bg-brand hover:bg-brandHover text-white px-4 py-2 text-[13px] rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                <Icon name="plus" className="w-4 h-4" /> Novo Link
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {linksVisiveis.length > 0 ? linksVisiveis.map(l => (
                            <div key={l.id} onClick={() => { setNovoLink(l); setModalLinkAberto(true); }} className="bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-200 dark:border-darkBorder p-5 flex flex-col gap-3 group cursor-pointer hover:border-brand/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{l.titulo}</h3>
                                        <p className="text-[11px] font-semibold text-brand mt-1">{l.cliente}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {l.status !== 'Pago' && l.status !== 'Concluído' && (
                                            <button onClick={(e) => { e.stopPropagation(); concluirLink(l.id); }} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded" title="Concluir"><Icon name="check-circle" className="w-4 h-4" /></button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); excluirLink(l.id); }} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Excluir"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {l.valor && (
                                    <div className="text-[18px] font-black text-gray-800 dark:text-gray-200 mt-2">
                                        R$ {Number(l.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                    </div>
                                )}
                                <div className="mt-2 bg-gray-50 dark:bg-darkElevated p-2 rounded flex items-center justify-between border border-gray-100 dark:border-darkBorder">
                                    <span className="text-[11px] text-gray-500 truncate mr-2">{l.link}</span>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(l.link);
                                        alert('Link copiado!');
                                    }} className="text-brand hover:text-brandHover p-1 rounded" title="Copiar Link">
                                        <Icon name="copy" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center text-gray-400 text-[13px]">Nenhum link cadastrado.</div>
                        )}
                    </div>
                </main>
            )}
        </>
    );
}
