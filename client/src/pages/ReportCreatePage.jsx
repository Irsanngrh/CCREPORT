import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import { reportsApi, directorsApi } from '../api/axios.js';
import { getMonthName, getErrorMessage, getReportSlug, MONTH_NAMES } from '../utils/helpers.js';

export default function ReportCreatePage() {
    const navigate = useNavigate();

    const [directors, setDirectors] = useState([]);
    const [cards, setCards] = useState([]);

    const [form, setForm] = useState({
        directorId: '', creditCardId: '', month: '', year: new Date().getFullYear(), creditLimit: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        directorsApi.getAll().then((res) => setDirectors(res.data.data));
    }, []);

    const handleDirectorChange = (e) => {
        const dirId = e.target.value;
        const dir = directors.find((d) => String(d.id) === String(dirId));
        setCards(dir?.creditCards || []);
        setForm({ ...form, directorId: dirId, creditCardId: '' });
    };

    const handleCreditLimitChange = (val) => {
        const numberString = val.replace(/\D/g, '');
        const formatted = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setForm({ ...form, creditLimit: formatted });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                ...form,
                creditLimit: form.creditLimit.replace(/\./g, '')
            };
            const res = await reportsApi.create(payload);
            navigate(getReportSlug(res.data.data));
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="breadcrumb mb-4">
                <Link to="/reports" className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={13} /> Rekap Laporan
                </Link>
                <span className="breadcrumb-sep">/</span>
                <span>Laporan Baru</span>
            </div>

            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Buat Laporan Bulanan Baru</h1>
                    <p className="page-subtitle">Buat laporan penggunaan kartu kredit korporasi</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 560 }}>
                <div className="card-body">
                    {error && <div className="alert alert-danger mb-4">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Direktur / Direksi</label>
                                <CustomSelect
                                    value={form.directorId}
                                    onChange={handleDirectorChange}
                                    options={directors.map(d => ({ value: d.id, label: `${d.name} - ${d.position}` }))}
                                    placeholder="Pilih direktur..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Kartu Kredit</label>
                                <CustomSelect
                                    value={form.creditCardId}
                                    onChange={(e) => setForm({ ...form, creditCardId: e.target.value })}
                                    options={cards.map(c => ({ value: c.id, label: `${c.bankName} - ${c.cardNumber}` }))}
                                    placeholder="Pilih kartu kredit..."
                                    disabled={!form.directorId}
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Bulan Periode</label>
                                    <CustomSelect
                                        value={form.month}
                                        onChange={(e) => setForm({ ...form, month: e.target.value })}
                                        options={Object.entries(MONTH_NAMES).map(([k, v]) => ({ value: k, label: v }))}
                                        placeholder="Pilih bulan..."
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Tahun</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.year}
                                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                                        required
                                        min="2000"
                                        max="2100"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pagu Limit Kartu (Rp)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Contoh: 15.000.000"
                                    value={form.creditLimit}
                                    onChange={(e) => handleCreditLimitChange(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 mt-2">
                                <Link to="/reports" className="btn btn-secondary">Batalkan</Link>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Buat Laporan'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
