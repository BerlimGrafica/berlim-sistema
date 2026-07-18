"use client";
import React, { useState } from 'react';
import Icon from '@/components/Icon';
import { SegmentedControl } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

const FORMAS_ENVIO = [
    { value: 'Whatsapp', label: 'WhatsApp', icon: 'phone' },
    { value: 'E-mail', label: 'E-mail', icon: 'mail' },
];

export default function SolicitarNota() {
    const [tipoPessoa, setTipoPessoa] = useState(null); // 'F' ou 'J'
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        cliente: '',
        razao_social: '',
        cnpj: '',
        forma_envio: 'Whatsapp',
        contato: '',
        endereco: '',
        observacao_cliente: '',
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
        if (name === 'contato' && form.forma_envio === 'Whatsapp') val = handleMaskTelefone(value);
        setForm(prev => ({ ...prev, [name]: val }));
    };

    const handleFormaEnvio = (val) => {
        setForm(prev => ({ ...prev, forma_envio: val, contato: '' }));
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
        <div className="min-h-screen flex items-center justify-center p-4 fade-in bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="w-full max-w-lg">
                <div className="flex justify-center mb-6">
                    <img src="https://www.berlimgraficarapida.com.br/wp-content/uploads/elementor/thumbs/logosite-rm0erpiqj90gcf7ff4jp8ujys78opflob1b9vn5jjs.png" alt="Berlim Gráfica" className="h-10 object-contain" />
                </div>

                <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                    {!success && (
                        <div className="h-1.5 bg-gray-100">
                            <div className={`h-full bg-brand transition-all duration-300 ${!tipoPessoa ? 'w-1/2' : 'w-full'}`}></div>
                        </div>
                    )}

                    <div className="p-8">
                        {success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                    <Icon name="check-circle" className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Dados Enviados!</h2>
                                <p className="text-[13px] text-gray-500 leading-relaxed">Recebemos as suas informações. A Berlim Gráfica fará a emissão da Nota Fiscal em breve e o envio será feito via <strong>{form.forma_envio}</strong>.</p>
                            </div>
                        ) : !tipoPessoa ? (
                            <div className="space-y-3">
                                <div className="text-center mb-6">
                                    <h1 className="text-xl font-bold text-gray-800 mb-1.5">Solicitação de Nota Fiscal</h1>
                                    <p className="text-[13px] text-gray-500">Por favor, indique como deseja emitir a sua nota fiscal.</p>
                                </div>

                                <button onClick={() => setTipoPessoa('F')} className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand text-gray-800 font-semibold py-4 px-5 rounded-xl shadow-sm transition group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand/10 flex items-center justify-center transition-colors">
                                            <Icon name="user" className="w-5 h-5 text-gray-500 group-hover:text-brand transition-colors" />
                                        </span>
                                        <span className="text-[15px]">Sou Pessoa Física</span>
                                    </div>
                                    <Icon name="chevron-right" className="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors" />
                                </button>

                                <button onClick={() => setTipoPessoa('J')} className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand text-gray-800 font-semibold py-4 px-5 rounded-xl shadow-sm transition group flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand/10 flex items-center justify-center transition-colors">
                                            <Icon name="users" className="w-5 h-5 text-gray-500 group-hover:text-brand transition-colors" />
                                        </span>
                                        <span className="text-[15px]">Sou Pessoa Jurídica</span>
                                    </div>
                                    <Icon name="chevron-right" className="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors" />
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5 fade-in">
                                <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-4">
                                    <h2 className="text-lg font-bold text-gray-800">Dados para Emissão</h2>
                                    <button type="button" onClick={() => setTipoPessoa(null)} className="text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition flex items-center gap-1">
                                        <Icon name="chevron-left" className="w-4 h-4" /> Voltar
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5">{tipoPessoa === 'F' ? 'Como quer ser chamado (Apelido)? *' : 'Seu Nome / Nome Fantasia *'}</label>
                                    <input type="text" name="cliente" required value={form.cliente} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition" placeholder={tipoPessoa === 'F' ? "Apelido" : "Como devemos identificar você?"} />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5">{tipoPessoa === 'F' ? 'Nome Completo *' : 'Razão Social *'}</label>
                                    <input type="text" name="razao_social" required value={form.razao_social} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition" placeholder={tipoPessoa === 'F' ? 'Seu Nome Completo' : 'Razão Social da Empresa'} />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5">{tipoPessoa === 'F' ? 'CPF *' : 'CNPJ *'}</label>
                                    <input type="text" name="cnpj" required value={form.cnpj} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition" placeholder={tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'} />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Endereço Completo *</label>
                                    <textarea name="endereco" required value={form.endereco} onChange={handleChange} rows={3} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition" placeholder="Rua, Número, Bairro, Cidade, Estado, CEP" />
                                </div>

                                <div className="pt-1 border-t border-gray-100">
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5 mt-4">Como prefere o envio da nota fiscal? *</label>
                                    <SegmentedControl options={FORMAS_ENVIO} value={form.forma_envio} onChange={handleFormaEnvio} />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5">{form.forma_envio === 'Whatsapp' ? 'WhatsApp para Envio *' : 'E-mail para Envio *'}</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Icon name={form.forma_envio === 'Whatsapp' ? 'phone' : 'mail'} className="w-4 h-4" />
                                        </span>
                                        <input
                                            type={form.forma_envio === 'Whatsapp' ? 'text' : 'email'}
                                            name="contato"
                                            required
                                            value={form.contato}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[13px] text-gray-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                                            placeholder={form.forma_envio === 'Whatsapp' ? '(00) 00000-0000' : 'seuemail@exemplo.com'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1.5">Observações <span className="normal-case font-medium text-gray-400">(opcional)</span></label>
                                    <textarea name="observacao_cliente" value={form.observacao_cliente} onChange={handleChange} rows={2} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition" placeholder="Alguma informação adicional sobre esta nota?" />
                                </div>

                                <button type="submit" disabled={loading} className="w-full bg-brand hover:bg-brandHover text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-brand/20 transition mt-2 disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            Enviando...
                                        </>
                                    ) : 'Enviar Dados'}
                                </button>
                                {errorMsg && (
                                    <p className="flex items-center justify-center gap-1.5 text-center text-[13px] font-semibold text-red-500">
                                        <Icon name="alert-triangle" className="w-4 h-4" /> {errorMsg}
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .fade-in { animation: fadeIn 0.4s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
