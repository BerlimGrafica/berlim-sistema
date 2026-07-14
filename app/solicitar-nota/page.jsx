"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://xbanoipgoleuahwbqksy.supabase.co',
    'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh'
);

export default function SolicitarNota() {
    const [tipoPessoa, setTipoPessoa] = useState(null); // 'F' ou 'J'
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        cliente: '',
        razao_social: '',
        cnpj: '',
        contato: '',
        endereco: '',
        tipo_nota: ''
    });

    const handleMaskCnpjCpf = (v) => {
        v = v.replace(/\D/g, '');
        if (tipoPessoa === 'J') {
            let x = v.match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
            if (!x) return v;
            return !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' : '') + x[3] + (x[4] ? '/' : '') + x[4] + (x[5] ? '-' : '') + x[5];
        } else {
            let x = v.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
            if (!x) return v;
            return !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' : '') + x[3] + (x[4] ? '-' : '') + x[4];
        }
    };

    const handleMaskTelefone = (v) => {
        let x = v.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        if (!x) return v;
        if (!x[2]) {
            return x[1] ? '(' + x[1] : '';
        } else if (x[1].length === 2) {
            return '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        }
        return v;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (name === 'cnpj') val = handleMaskCnpjCpf(value);
        if (name === 'contato') val = handleMaskTelefone(value);
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        
        try {
            const { error } = await supabase.from('notas_fiscais').insert([form]);
            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            console.error("Erro ao enviar:", err);
            setErrorMsg('Falha ao enviar os dados. Ocorreu um erro no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 fade-in">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl p-8">
                {success ? (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 text-brand mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Dados Enviados!</h2>
                        <p className="text-sm text-gray-500">Recebemos as suas informações. A Berlim Gráfica fará a emissão da Nota Fiscal em breve.</p>
                    </div>
                ) : !tipoPessoa ? (
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Solicitação de Nota Fiscal</h1>
                        <p className="text-sm text-gray-500 mb-8">Por favor, indique como deseja emitir a sua nota fiscal.</p>
                        
                        <button onClick={() => setTipoPessoa('F')} className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand text-gray-800 font-semibold py-4 px-4 rounded-xl shadow transition group flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-gray-500 group-hover:text-brand transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <span className="text-lg">Sou Pessoa Física</span>
                            </div>
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-brand transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>

                        <button onClick={() => setTipoPessoa('J')} className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand text-gray-800 font-semibold py-4 px-4 rounded-xl shadow transition group flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-gray-500 group-hover:text-brand transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z"></path></svg>
                                <span className="text-lg">Sou Pessoa Jurídica</span>
                            </div>
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-brand transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5 fade-in">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
                            <h2 className="text-lg font-bold text-gray-800">Dados para Emissão</h2>
                            <button type="button" onClick={() => setTipoPessoa(null)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                Voltar
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{tipoPessoa === 'F' ? 'Como quer ser chamado (Apelido)? *' : 'Seu Nome / Nome Fantasia *'}</label>
                            <input type="text" name="cliente" required value={form.cliente} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-brand transition" placeholder={tipoPessoa === 'F' ? "Apelido" : "Como devemos identificar você?"} />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{tipoPessoa === 'F' ? 'Nome Completo *' : 'Razão Social *'}</label>
                            <input type="text" name="razao_social" required value={form.razao_social} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-brand transition" placeholder={tipoPessoa === 'F' ? 'Seu Nome Completo' : 'Razão Social da Empresa'} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">{tipoPessoa === 'F' ? 'CPF *' : 'CNPJ *'}</label>
                                <input type="text" name="cnpj" required value={form.cnpj} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-brand transition" placeholder={tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Contato (WhatsApp) *</label>
                                <input type="text" name="contato" required value={form.contato} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-brand transition" placeholder="(00) 00000-0000" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço Completo *</label>
                            <textarea name="endereco" required value={form.endereco} onChange={handleChange} rows={3} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-brand transition" placeholder="Rua, Número, Bairro, Cidade, Estado, CEP" />
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-brand hover:bg-brandHover text-gray-800 font-bold py-3 px-4 rounded-lg shadow-lg transition mt-4">
                            {loading ? 'Enviando...' : 'Enviar Dados'}
                        </button>
                        {errorMsg && <p className="text-center text-sm font-semibold mt-4 text-red-500">{errorMsg}</p>}
                    </form>
                )}
            </div>
            <style jsx>{`
                .fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
