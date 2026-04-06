import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import { reportsApi } from '../api/axios.js';
import { getErrorMessage, MONTH_NAMES } from '../utils/helpers.js';

export default function ReportEditPage() {
    const { directorName, month, year, last4cc } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({ creditCardId: '', month: '', year: '', creditLimit: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportsApi.getBySlug(directorName, month, year, last4cc).then((res) => {
            const r = res.data.data;
            setReport(r);
            setCards(r.director?.creditCards || []);
            setForm({
                creditCardId: String(r.creditCardId),
                month: String(r.month),
                year: String(r.year),
                creditLimit: String(Math.round(Number(r.creditLimit))),
            });
        }).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false));
    }, [directorName, month, year, last4cc]);

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
            await reportsApi.update(report.id, payload);
            navigate(`/reports/${directorName}/${month}/${year}/${last4cc}`);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const currentYear = new Date().getFullYear();

    if (loading) return <Layout><div className="loading-full"><div className="spinner" /></div></Layout>;

    return (
        <Layout>
            <div className="breadcrumb mb-4">
                <Link to={`/reports/${directorName}/${month}/${year}/${last4cc}`} className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={13} /> Detail Laporan
                </Link>
                <span className="breadcrumb-sep">/</span>
                <span>Ubah</span>
            </div>

            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Ubah Laporan</h1>
                    <p className="page-subtitle">{report?.director?.name}</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 560 }}>
                <div className="card-body">
                    {error && <div className="alert alert-danger mb-4">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label">Kartu Kredit</label>
                                <CustomSelect
                                    value={form.creditCardId}
                                    onChange={(e) => setForm({ ...form, creditCardId: e.target.value })}
                                    options={cards.map(c => ({ value: c.id, label: `${c.bankName} - ${c.cardNumber}` }))}
                                    placeholder="Pilih kartu kredit..."
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
                                    value={form.creditLimit}
                                    onChange={(e) => handleCreditLimitChange(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 mt-2">
                                <Link to={`/reports/${directorName}/${month}/${year}/${last4cc}`} className="btn btn-secondary">Batalkan</Link>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
