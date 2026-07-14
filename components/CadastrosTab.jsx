"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import Icon from '@/components/Icon';
import { STATUSES_PRODUCAO, STATUSES_FINALIZADOS, RESPONSAVEIS, obterCorStatus, formatarValorFinanceiro, formatarMoeda, formatarTelefone, obterDataAtual, formatarDataExibicao, formatarMesAno } from '@/lib/utils';


export default function CadastrosTab() {
    const { usuario, setAbaCadastros, abaCadastros, isAdmin } = useAppContext();

    return (
        <>
            abaAtual === 'cadastros' && (
                    <div className="bg-[#EDEFF0] dark:bg-darkBg border-b border-gray-200 dark:border-darkBorder px-6 flex gap-6 z-20 overflow-x-auto no-scrollbar-style sticky top-[112px]">
                        {(usuario?.nivel === 'Administrador' || usuario?.nivel === 'ProduÃ§Ã£o/Atendimento') && (
                            <a onClick={() => setAbaCadastros('clientes')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'clientes' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                <Icon name="users" className="w-4 h-4" /> Clientes
                            </a>
                        )}
                        {isAdmin && (
                            <>
                                <a onClick={() => setAbaCadastros('produtos')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'produtos' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="package" className="w-4 h-4" /> CatÃ¡logo
                                </a>
                                <a onClick={() => setAbaCadastros('fornecedores')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'fornecedores' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="truck" className="w-4 h-4" /> Fornecedores / Locais
                                </a>
                                <a onClick={() => setAbaCadastros('usuarios')} className={`py-3 text-[13px] font-semibold cursor-pointer transition whitespace-nowrap border-b-[3px] flex items-center gap-2 ${abaCadastros === 'usuarios' ? 'border-brand text-brand' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                                    <Icon name="user" className="w-4 h-4" /> UsuÃ¡rios
                                </a>
                            </>
                        )}
                    </div>
                )
abaAtual === 'cadastros' && abaCadastros === 'produtos'
abaAtual === 'cadastros' && abaCadastros === 'clientes'
abaAtual === 'cadastros' && abaCadastros === 'usuarios'
abaAtual === 'cadastros' && abaCadastros === 'fornecedores'

        </>
    );
}
