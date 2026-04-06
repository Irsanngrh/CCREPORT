import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { directorsApi } from '../api/axios.js';
import { getErrorMessage } from '../utils/helpers.js';

export default function DirectorCreatePage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', position: '' });
    const [creditCards, setCreditCards] = useState([{ bankName: '', cardNumber: '' }]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleCardChange = (index, field, value) => {
        const newCards = [...creditCards];
        newCards[index][field] = value;
        setCreditCards(newCards);
    };

    const addCard = () => setCreditCards([...creditCards, { bankName: '', cardNumber: '' }]);
    const removeCard = (index) => setCreditCards(creditCards.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const validCards = creditCards.filter(c => c.bankName.trim() && c.cardNumber.trim());

        if (validCards.length === 0) {
            setError('Minimal 1 Kartu Kredit yang valid diperlukan.');
            setSubmitting(false);
            return;
        }

        try {
            await directorsApi.create({
                name: form.name,
                position: form.position,
                creditCards: validCards
            });
            navigate('/directors');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="breadcrumb mb-4">
                <Link to="/directors" className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={13} /> Data Direksi
                </Link>
                <span className="breadcrumb-sep">/</span>
                <span>Tambah Direksi</span>
            </div>

            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Tambah Direksi Baru</h1>
                    <p className="page-subtitle">Buat profil direksi dan tetapkan daftar kartu kredit</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 640 }}>
                <div className="card-body">
                    {error && <div className="alert alert-danger mb-4">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Contoh: Budi Santoso"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Posisi / Jabatan</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Contoh: Direktur SDM"
                                    value={form.position}
                                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <div className="mb-1">
                                    <label className="form-label m-0">Daftar Kartu Kredit</label>
                                </div>

                                {creditCards.map((card, index) => (
                                    <div key={index} className="flex gap-2 mb-2 items-end">
                                        <div className="form-group mb-0" style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nama Bank Terbitan"
                                                value={card.bankName}
                                                onChange={(e) => handleCardChange(index, 'bankName', e.target.value)}
                                                required={index === 0}
                                            />
                                        </div>
                                        <div className="form-group mb-0" style={{ flex: 2 }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nomor Kartu (16 digit)"
                                                value={card.cardNumber}
                                                onChange={(e) => handleCardChange(index, 'cardNumber', e.target.value)}
                                                required={index === 0}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-icon danger mb-1"
                                            onClick={() => removeCard(index)}
                                            disabled={creditCards.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={addCard}>
                                    <Plus size={13} /> Tambah Kartu
                                </button>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Link to="/directors" className="btn btn-secondary">Batalkan</Link>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Simpan Profil'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
