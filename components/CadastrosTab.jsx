"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSessao } from '@/context/SessaoContext';
import { useUi } from '@/context/UiContext';
import { useClientes } from '@/context/ClientesContext';
import { useCadastros } from '@/context/CadastrosContext';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import { SkeletonLinhas } from '@/components/ui/SkeletonLinhas';
import { formatarValorFinanceiro, centavosParaReais } from '@/lib/utils/formatters';
import { SubAbas } from '@/components/ui/SubAbas';
import { BarraAcoes } from '@/components/ui/BarraAcoes';
import { TabelaCartoes } from '@/components/ui/TabelaCartoes';
import { categoriaConta } from '@/lib/utils/constants';


export default function CadastrosTab() {
    const { usuario, isAdmin, usuariosSistema } = useSessao();
    const { carregarDados, confirmar, abrirContextMenu, avisar } = useUi();
    const { buscaCadClientes, setBuscaCadClientes, setNovoCliente, setModalClienteAberto, setLetraFiltroCliente, setPaginaClientes, letraFiltroCliente, clientesPaginados, clientesCadCarregados, totalPaginasClientes, paginaClientes, abrirEdicaoCliente } = useClientes();
    const { setAbaCadastros, abaCadastros, buscaCadProdutos, setBuscaCadProdutos, setNovoProduto, setModalProdutoAberto, produtosCatalogoFiltrados, handleDragStartProduto, handleDropProduto, abrirEdicaoProduto, draggedProdutoIndex, excluirProduto, setNovoUsuario, setModalUsuarioAberto, abrirEdicaoUsuario, fornecedores, setNovoFornecedor, setModalFornecedorAberto, duplicarProduto, duplicarFornecedor } = useCadastros();

    return (
        <>
            { (
                    <SubAbas
                        valor={abaCadastros}
                        aoMudar={setAbaCadastros}
                        abas={[
                            { id: 'clientes',     rotulo: 'Clientes',              icone: 'users',   ve: usuario?.nivel === 'Administrador' || usuario?.nivel === 'Atendimento' || usuario?.nivel === 'Produção' },
                            { id: 'produtos',     rotulo: 'Catálogo',              icone: 'package', ve: isAdmin },
                            { id: 'fornecedores', rotulo: 'Fornecedores / Locais', icone: 'truck',   ve: isAdmin },
                            { id: 'usuarios',     rotulo: 'Usuários',              icone: 'user',    ve: isAdmin },
                        ].filter(a => a.ve !== false)}
                    />
                )}
                <div key={abaCadastros} className="animate-fade-screen">
                {abaCadastros === 'produtos' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Catálogo</h1>
                                <p className="text-corpo text-tinta-suave mt-1">Gerencie os serviços, itens e preços base para orçamentos.</p>
                            </div>
                            <div className="hidden lg:flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaCadProdutos} onChange={e => setBuscaCadProdutos(e.target.value)} placeholder="Buscar produto..." className="w-56 bg-superficie border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                    {buscaCadProdutos && (
                                        <Tooltip label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                            <button type="button" onClick={() => setBuscaCadProdutos('')} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                                        </Tooltip>
                                    )}
                                </div>
                                <button onClick={() => { setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' }); setModalProdutoAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Produto
                                </button>
                            </div>
                        </div>
                        <div className="bg-superficie border border-borda rounded overflow-hidden">
                            {/* propsDaLinha carrega os atributos de arrastar-e-soltar: são de linha,
                                não de coluna, e valem só na tabela — eventos de drag do HTML não
                                disparam no toque, então a reordenação sempre foi de desktop. */}
                            <TabelaCartoes
                                itens={produtosCatalogoFiltrados}
                                chave={p => p.id}
                                aoClicar={p => abrirEdicaoProduto(p)}
                                propsDaLinha={(p, index) => ({
                                    draggable: true,
                                    onDragStart: (e) => handleDragStartProduto(e, index),
                                    onDragOver: (e) => e.preventDefault(),
                                    onDrop: (e) => handleDropProduto(e, index),
                                    className: draggedProdutoIndex === index ? 'opacity-50' : '',
                                })}
                                aoContextMenu={(p, e) => abrirContextMenu(e, [
                                    { label: 'Editar', icon: 'edit-3', onClick: () => abrirEdicaoProduto(p) },
                                    { label: 'Duplicar', icon: 'layers', onClick: () => duplicarProduto(p) },
                                    { label: 'Copiar linha', icon: 'copy', onClick: () => {
                                        navigator.clipboard.writeText([`#${p.id}`, p.nome, p.texto_padrao || '', `R$ ${formatarValorFinanceiro(centavosParaReais(p.preco_base))}`].join('\t'));
                                        avisar('Linha copiada!', 'sucesso');
                                    }},
                                    { label: 'Excluir', icon: 'trash-2', tom: 'perigo', divisorAntes: true, onClick: () => excluirProduto(p.id, { stopPropagation: () => {} }) },
                                ])}
                                colunas={[
                                    {
                                        papel: 'titulo',
                                        titulo: 'Nome do Produto',
                                        tdClassName: 'px-6 py-4 text-corpo font-medium text-tinta',
                                        celula: p => p.nome,
                                    },
                                    {
                                        papel: 'destaque',
                                        titulo: 'Preço Base',
                                        thClassName: 'px-6 py-4 w-36 text-right',
                                        tdClassName: 'px-6 py-4 text-corpo font-semibold text-gray-900 dark:text-gray-300 text-right',
                                        celula: p => `R$ ${formatarValorFinanceiro(centavosParaReais(p.preco_base))}`,
                                    },
                                    {
                                        titulo: 'ID',
                                        thClassName: 'px-6 py-4 w-24',
                                        tdClassName: 'px-6 py-4 text-corpo font-semibold text-gray-900 dark:text-gray-300 cursor-grab active:cursor-grabbing',
                                        celula: p => (
                                            <span className="flex items-center gap-2 whitespace-nowrap justify-end lg:justify-start">
                                                <Icon name="list" className="w-4 h-4 opacity-50 hidden lg:inline" />
                                                <span>#{p.id}</span>
                                            </span>
                                        ),
                                    },
                                    {
                                        titulo: 'Descrição Base',
                                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave truncate max-w-xs',
                                        celula: p => p.texto_padrao,
                                    },
                                    {
                                        papel: 'acoes',
                                        titulo: 'Excluir',
                                        thClassName: 'px-6 py-4 w-24 text-center',
                                        tdClassName: 'px-6 py-4 text-center',
                                        celula: p => (
                                            <Tooltip label="Excluir Produto">
                                                <button type="button" onClick={(e) => excluirProduto(p.id, e)} aria-label="Excluir Produto" className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30">
                                                    <Icon name="trash-2" className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </main>
                )}

{ abaCadastros === 'clientes' && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Clientes</h1>
                                <p className="text-corpo text-tinta-suave mt-1">Base de dados e informações de contato dos seus clientes.</p>
                            </div>
                            <div className="hidden lg:flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Icon name="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="text" value={buscaCadClientes} onChange={e => setBuscaCadClientes(e.target.value)} placeholder="Buscar cliente..." className="w-56 bg-superficie border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]" />
                                    {buscaCadClientes && (
                                        <Tooltip label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                            <button type="button" onClick={() => setBuscaCadClientes('')} aria-label="Limpar Busca" className="text-gray-400 hover:text-brand transition"><Icon name="x" className="w-4 h-4" /></button>
                                        </Tooltip>
                                    )}
                                </div>
                                <button onClick={() => { setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false }); setModalClienteAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Cliente
                                </button>
                            </div>
                        </div>
                        <div className="bg-superficie border border-borda rounded overflow-hidden">
                            <div className="p-4 border-b border-borda flex flex-wrap gap-1.5 items-center justify-center sm:justify-start">
                                <button onClick={() => { setLetraFiltroCliente(''); setPaginaClientes(1); }} className={`px-2 py-1 text-mini font-semibold rounded border ${!letraFiltroCliente ? 'bg-brand text-white border-brand' : 'bg-superficie text-tinta-suave border-borda hover:bg-sutil'}`}>Todas</button>
                                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(letra => (
                                    <button key={letra} onClick={() => { setLetraFiltroCliente(letra); setPaginaClientes(1); }} className={`px-2 py-1 text-mini font-semibold rounded border ${letraFiltroCliente === letra ? 'bg-brand text-white border-brand' : 'bg-superficie text-tinta-suave border-borda hover:bg-sutil'}`}>{letra}</button>
                                ))}
                            </div>
                            {/* Ver components/ui/TabelaCartoes.jsx. */}
                            <TabelaCartoes
                                itens={clientesPaginados}
                                chave={c => c.id}
                                carregando={!clientesCadCarregados && clientesPaginados.length === 0}
                                vazio={<span className="text-tinta-suave">Nenhum cliente encontrado.</span>}
                                aoClicar={c => abrirEdicaoCliente(c)}
                                colunas={[
                                    {
                                        papel: 'titulo',
                                        titulo: 'Cliente',
                                        tdClassName: 'px-6 py-4 text-corpo font-semibold',
                                        celula: c => (
                                            <span className={c.cliente_problema ? 'text-perigo' : 'text-gray-900 dark:text-gray-300'}>
                                                {c.nome}
                                                {c.cliente_problema && <Icon name="alert-triangle" className="w-3.5 h-3.5 inline text-red-500 ml-1" title="Cliente Problema" />}
                                            </span>
                                        ),
                                    },
                                    {
                                        papel: 'subtitulo',
                                        titulo: 'WhatsApp',
                                        thClassName: 'px-6 py-4 w-48',
                                        tdClassName: 'px-6 py-4 text-corpo font-medium text-tinta',
                                        celula: c => c.telefone || '---',
                                    },
                                    {
                                        titulo: 'E-mail',
                                        thClassName: 'px-6 py-4 w-64',
                                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave',
                                        celula: c => c.email || '---',
                                    },
                                    {
                                        titulo: 'Observações',
                                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave truncate max-w-xs',
                                        celula: c => c.observacoes || '---',
                                    },
                                    {
                                        papel: 'acoes',
                                        titulo: 'Ações',
                                        thClassName: 'px-6 py-4 w-24 text-center',
                                        tdClassName: 'px-6 py-4 text-center',
                                        celula: c => isAdmin && (
                                            <Tooltip label="Excluir Cliente">
                                                <button type="button" onClick={async (e) => { e.stopPropagation(); if (await confirmar(`Excluir o cliente ${c.nome}?`)) { supabase.from('clientes').delete().eq('id', c.id).then(() => carregarDados()); } }} aria-label="Excluir Cliente" className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30">
                                                    <Icon name="trash-2" className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                        {totalPaginasClientes > 1 && (
                            <div className="mt-6 flex justify-between items-center p-4">
                                <button onClick={() => setPaginaClientes(Math.max(1, paginaClientes - 1))} disabled={paginaClientes === 1} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Anterior</button>
                                <span className="text-corpo font-semibold dark:text-white">Página {paginaClientes} de {totalPaginasClientes}</span>
                                <button onClick={() => setPaginaClientes(Math.min(totalPaginasClientes, paginaClientes + 1))} disabled={paginaClientes === totalPaginasClientes} className="px-4 py-2 text-corpo font-semibold border border-borda rounded hover:bg-sutil disabled:opacity-50 dark:text-white transition">Próxima</button>
                            </div>
                        )}
                    </main>
                )}
{abaCadastros === 'clientes'}
                {abaCadastros === 'usuarios' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Usuários do Sistema</h1>
                                <p className="text-corpo text-tinta-suave mt-1">Gerencie os acessos da equipe (Administrador, Atendimento, Produção, Financeiro).</p>
                            </div>
                            <div className="hidden lg:flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoUsuario({ id: null, nome: '', email: '', senha: '', nivel: 'Atendimento' }); setModalUsuarioAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Usuário
                                </button>
                            </div>
                        </div>
                        <div className="bg-superficie border border-borda rounded overflow-hidden">
                            {/* Ver components/ui/TabelaCartoes.jsx. */}
                            <TabelaCartoes
                                itens={usuariosSistema}
                                chave={u => u.id}
                                aoClicar={u => abrirEdicaoUsuario(u)}
                                colunas={[
                                    {
                                        papel: 'titulo',
                                        titulo: 'Nome do Usuário',
                                        tdClassName: 'px-6 py-4 text-corpo font-semibold text-gray-900 dark:text-gray-300',
                                        celula: u => u.nome,
                                    },
                                    {
                                        papel: 'selo',
                                        titulo: 'Nível de Acesso',
                                        rotuloCartao: 'Nível',
                                        thClassName: 'px-6 py-4 w-48 text-right',
                                        tdClassName: 'px-6 py-4 text-right',
                                        celula: u => (
                                            <span className={`px-2 py-1 rounded text-micro uppercase tracking-wider border ${u.nivel === 'Administrador' ? 'bg-red-50 text-red-600 border-red-200' : u.nivel === 'Financeiro' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                                {u.nivel}
                                            </span>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </main>
                )}

                {abaCadastros === 'fornecedores' && isAdmin && (
                    <main className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6 border-b border-borda-fraca pb-6 shrink-0">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-tinta tracking-tight">Fornecedores e Locais</h1>
                                <p className="text-corpo text-tinta-suave mt-1">Gerencie os locais de produção e fornecedores externos.</p>
                            </div>
                            <div className="hidden lg:flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <button onClick={() => { setNovoFornecedor({ id: null, nome: '', contato: '', observacoes: '' }); setModalFornecedorAberto(true); }} className="bg-brand hover:bg-brandHover text-white h-[38px] px-4 text-corpo rounded-md font-semibold shadow-sm transition flex items-center gap-2">
                                    <Icon name="plus" className="w-4 h-4" /> Novo Fornecedor
                                </button>
                            </div>
                        </div>
                        <div className="bg-superficie border border-borda rounded overflow-hidden">
                            {/* Ver components/ui/TabelaCartoes.jsx. */}
                            <TabelaCartoes
                                itens={fornecedores}
                                chave={f => f.id}
                                vazio={<span className="text-corpo text-tinta-fraca">Nenhum fornecedor cadastrado.</span>}
                                aoClicar={f => { setNovoFornecedor({...f, observacoes: f.observacoes || ''}); setModalFornecedorAberto(true); }}
                                aoContextMenu={(f, e) => abrirContextMenu(e, [
                                    { label: 'Editar', icon: 'edit-3', onClick: () => { setNovoFornecedor({...f, observacoes: f.observacoes || ''}); setModalFornecedorAberto(true); } },
                                    { label: 'Duplicar', icon: 'layers', onClick: () => duplicarFornecedor(f) },
                                    { label: 'Copiar linha', icon: 'copy', onClick: () => {
                                        navigator.clipboard.writeText([`#${f.id}`, f.nome, f.tipo || '', f.contato || '', f.observacoes || ''].join('\t'));
                                        avisar('Linha copiada!', 'sucesso');
                                    }},
                                    { label: 'Excluir', icon: 'trash-2', tom: 'perigo', divisorAntes: true, onClick: async () => {
                                        if (await confirmar(`Excluir o fornecedor ${f.nome}?`)) {
                                            await supabase.from('fornecedores').delete().eq('id', f.id);
                                            carregarDados();
                                        }
                                    }},
                                ])}
                                colunas={[
                                    {
                                        papel: 'titulo',
                                        titulo: 'Nome do Fornecedor / Local',
                                        rotuloCartao: 'Nome',
                                        tdClassName: 'px-6 py-4 text-corpo font-medium text-tinta',
                                        celula: f => f.nome,
                                    },
                                    {
                                        papel: 'selo',
                                        titulo: 'Tipo',
                                        celula: f => (
                                            <span className={`px-2 py-1 rounded text-mini font-bold ${categoriaConta(f.tipo || 'Terceirização').chip}`}>
                                                {f.tipo || 'Terceirização'}
                                            </span>
                                        ),
                                    },
                                    {
                                        titulo: 'ID',
                                        thClassName: 'px-6 py-4 w-24',
                                        tdClassName: 'px-6 py-4 text-corpo font-semibold text-gray-900 dark:text-gray-300',
                                        celula: f => `#${f.id}`,
                                    },
                                    {
                                        titulo: 'Contato',
                                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave',
                                        celula: f => f.contato || '-',
                                    },
                                    {
                                        titulo: 'Observações',
                                        tdClassName: 'px-6 py-4 text-corpo text-tinta-suave',
                                        celula: f => f.observacoes || '-',
                                    },
                                    {
                                        papel: 'acoes',
                                        titulo: 'Ações',
                                        thClassName: 'px-6 py-4 w-24 text-center',
                                        tdClassName: 'px-6 py-4 text-center',
                                        celula: f => (
                                            <Tooltip label="Excluir Fornecedor">
                                                <button onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (await confirmar(`Excluir o fornecedor ${f.nome}?`)) {
                                                        await supabase.from('fornecedores').delete().eq('id', f.id);
                                                        carregarDados();
                                                    }
                                                }} aria-label="Excluir Fornecedor" className="p-2 text-red-500 hover:text-red-600 transition rounded hover:bg-red-50 dark:hover:bg-red-950/30">
                                                    <Icon name="trash-2" className="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </main>
                )}
                </div>


            {/* Cada sub-aba cria um tipo diferente de cadastro, então a ação primária
                acompanha a aba ativa. Só Catálogo e Clientes têm busca — as outras duas
                são listas curtas. */}
            <BarraAcoes
                acoes={[
                    abaCadastros === 'produtos' && {
                        id: 'buscar', icone: 'search', rotulo: 'Buscar',
                        ativo: !!buscaCadProdutos,
                        conteudo: (
                            <div className="relative">
                                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={buscaCadProdutos}
                                    onChange={e => setBuscaCadProdutos(e.target.value)}
                                    placeholder="Buscar produto..."
                                    className="w-full bg-elevado border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]"
                                />
                                {buscaCadProdutos && (
                                    <button type="button" onClick={() => setBuscaCadProdutos('')} aria-label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition">
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ),
                    },
                    abaCadastros === 'clientes' && {
                        id: 'buscar', icone: 'search', rotulo: 'Buscar',
                        ativo: !!buscaCadClientes,
                        conteudo: (
                            <div className="relative">
                                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={buscaCadClientes}
                                    onChange={e => setBuscaCadClientes(e.target.value)}
                                    placeholder="Buscar cliente..."
                                    className="w-full bg-elevado border border-borda rounded-md pl-9 pr-9 py-2 text-corpo outline-none focus:border-brand transition dark:text-[#EDEDED]"
                                />
                                {buscaCadClientes && (
                                    <button type="button" onClick={() => setBuscaCadClientes('')} aria-label="Limpar Busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition">
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ),
                    },
                    {
                        id: 'novo', icone: 'plus', destaque: true,
                        rotulo: abaCadastros === 'produtos' ? 'Novo Produto'
                            : abaCadastros === 'clientes' ? 'Novo Cliente'
                            : abaCadastros === 'usuarios' ? 'Novo Usuário' : 'Novo Fornecedor',
                        aoClicar: () => {
                            if (abaCadastros === 'produtos') {
                                setNovoProduto({ id: null, nome: '', texto_padrao: '', preco_base: '' });
                                setModalProdutoAberto(true);
                            } else if (abaCadastros === 'clientes') {
                                setNovoCliente({ id: null, nome: '', telefone: '', email: '', observacoes: '', cliente_problema: false });
                                setModalClienteAberto(true);
                            } else if (abaCadastros === 'usuarios') {
                                setNovoUsuario({ id: null, nome: '', email: '', senha: '', nivel: 'Atendimento' });
                                setModalUsuarioAberto(true);
                            } else {
                                setNovoFornecedor({ id: null, nome: '', contato: '', observacoes: '' });
                                setModalFornecedorAberto(true);
                            }
                        },
                    },
                ].filter(Boolean)}
            />
        </>
    );
}
