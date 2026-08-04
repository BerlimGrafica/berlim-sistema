"use client";
import OSModal from "@/components/modals/OSModal";
import ProdutoModal from "@/components/modals/ProdutoModal";
import OrcamentoPreModal from "@/components/modals/OrcamentoPreModal";
import OrcamentoFormalizadoModal from "@/components/modals/OrcamentoFormalizadoModal";
import FornecedorModal from "@/components/modals/FornecedorModal";
import ClienteModal from "@/components/modals/ClienteModal";
import EmpresaFaturamentoModal from "@/components/modals/EmpresaFaturamentoModal";
import ContaModal from "@/components/modals/ContaModal";
import NotaFiscalModal from "@/components/modals/NotaFiscalModal";
import UsuarioModal from "@/components/modals/UsuarioModal";
import RequisicaoModal from "@/components/modals/RequisicaoModal";
import TarefaModal from "@/components/modals/TarefaModal";
import LinkPagamentoModal from "@/components/modals/LinkPagamentoModal";

export default function Modals() {
    return (
        <>
            <OSModal />
            <ProdutoModal />
            <OrcamentoPreModal />
            <OrcamentoFormalizadoModal />
            <FornecedorModal />
            <ClienteModal />
            <EmpresaFaturamentoModal />
            <ContaModal />
            <NotaFiscalModal />
            <UsuarioModal />
            <RequisicaoModal />
            <TarefaModal />
            <LinkPagamentoModal />
        </>
    );
}
