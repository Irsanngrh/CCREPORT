import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Download, Plus, Check, X, Trash2 } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import ExportModal from '../components/ExportModal.jsx';
import { reportsApi, transactionsApi } from '../api/axios.js';
import { getMonthName, formatRupiah, formatDate, getErrorMessage } from '../utils/helpers.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ReportDetailPage() {
    const { directorName, month, year, last4cc } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showExport, setShowExport] = useState(false);

    const [editingTrx, setEditingTrx] = useState(null); // { id, date, desc, amount }
    const [newTrx, setNewTrx] = useState({ transactionDate: '', description: '', amount: '' });
    const [savingNew, setSavingNew] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteTrxTarget, setDeleteTrxTarget] = useState(null);

    const fetchReport = async () => {
        try {
            const res = await reportsApi.getBySlug(directorName, month, year, last4cc);
            setReport(res.data.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, [directorName, month, year, last4cc]);

    const startEdit = (trx) => {
        // Format initial amount
        const amountString = String(Math.round(Number(trx.amount)));
        const formatted = amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        setEditingTrx({
            id: trx.id,
            transactionDate: trx.date?.slice(0, 10),
            description: trx.description,
            amount: formatted,
        });
    };

    const handleUpdateTrx = async () => {
        if (!editingTrx.transactionDate) {
            return toast.error('Harap pilih tanggal transaksi.');
        }
        if (!editingTrx.description.trim()) {
            return toast.error('Uraian transaksi tidak boleh kosong.');
        }
        let finalAmount = editingTrx.amount.replace(/\./g, '');
        if (!finalAmount) finalAmount = '0';

        setSavingEdit(true);
        try {
            await transactionsApi.update(editingTrx.id, {
                transactionDate: editingTrx.transactionDate,
                description: editingTrx.description,
                amount: finalAmount, // Send raw number
            });
            setEditingTrx(null);
            fetchReport();
            toast.success('Transaksi diperbarui');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSavingEdit(false);
        }
    };

    const confirmDeleteTrx = async () => {
        if (!deleteTrxTarget) return;
        setDeletingId(deleteTrxTarget.id);
        try {
            await transactionsApi.delete(deleteTrxTarget.id);
            setDeleteTrxTarget(null);
            fetchReport();
            toast.success('Transaksi dihapus');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddTrx = async (e) => {
        e.preventDefault();
        
        if (!newTrx.transactionDate) {
            return toast.error('Harap pilih tanggal transaksi.');
        }
        if (!newTrx.description.trim()) {
            return toast.error('Uraian transaksi tidak boleh kosong.');
        }
        let finalAmount = newTrx.amount.replace(/\./g, '');
        if (!finalAmount) finalAmount = '0';

        setSavingNew(true);
        try {
            await transactionsApi.create(report.id, {
                ...newTrx,
                amount: finalAmount
            });
            setNewTrx({ transactionDate: '', description: '', amount: '' });
            fetchReport();
            toast.success('Transaksi ditambahkan');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSavingNew(false);
        }
    };

    const handleAmountChange = (val, isEdit = false) => {
        // Remove non-digit chars
        const numberString = val.replace(/\D/g, '');
        // Add thousand separators
        const formatted = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        if (isEdit) {
            setEditingTrx({ ...editingTrx, amount: formatted });
        } else {
            setNewTrx({ ...newTrx, amount: formatted });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (newTrx.transactionDate && newTrx.description && newTrx.amount) {
                handleAddTrx(e);
            }
        }
    };

    const startOfMonth = report ? `${report.year}-${String(report.month).padStart(2, '0')}-01` : '';
    const endOfMonth = report
        ? new Date(report.year, report.month, 0).toISOString().slice(0, 10)
        : '';

    if (loading) return <Layout><div className="loading-full"><div className="spinner" /></div></Layout>;
    if (error) return <Layout><div className="alert alert-danger">{error}</div></Layout>;
    if (!report) return null;

    const totalExpenses = report.totalExpenses;
    const remainingLimit = report.remainingLimit;

    return (
        <Layout>
            {/* Navigasi Roti */}
            <div className="breadcrumb mb-4">
                <Link to="/reports" className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowLeft size={13} /> Rekap Laporan
                </Link>
                <span className="breadcrumb-sep">/</span>
                <span>{report.director?.name}</span>
                <span className="breadcrumb-sep">/</span>
                <span>{getMonthName(report.month)} {report.year}</span>
            </div>

            {/* Kartu Header Informasi */}
            <div className="card mb-6">
                <div className="card-body">
                    <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 16, marginBottom: 20 }}>
                        <div>
                            <h2 className="font-semibold" style={{ fontSize: 17 }}>{report.director?.name}</h2>
                            <p className="text-muted text-sm">{report.director?.position}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/reports/${directorName}/${month}/${year}/${last4cc}/edit`} className="btn btn-secondary btn-sm">
                                <Pencil size={13} /> Ubah
                            </Link>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowExport(true)}>
                                <Download size={13} /> Ekspor Laporan
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, background: 'var(--color-bg)', padding: '16px 20px', borderRadius: 'var(--radius)' }}>
                        <div>
                            <div className="stat-label mb-1" style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Periode Bulan</div>
                            <div className="font-semibold text-sm">{getMonthName(report.month)} {report.year}</div>
                        </div>
                        <div>
                            <div className="stat-label mb-1" style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Kartu Kredit</div>
                            <div className="font-semibold text-sm">{report.creditCard?.bankName} <span className="font-mono text-muted" style={{ fontSize: 12 }}>{report.creditCard?.cardNumber}</span></div>
                        </div>
                        <div>
                            <div className="stat-label mb-1" style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pagu Limit</div>
                            <div className="font-semibold text-sm text-secondary">Rp {formatRupiah(report.creditLimit)}</div>
                        </div>
                        <div>
                            <div className="stat-label mb-1" style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Realisasi Penggunaan</div>
                            <div className="font-semibold text-sm">Rp {formatRupiah(totalExpenses)}</div>
                        </div>
                        <div>
                            <div className="stat-label mb-1" style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sisa Limit (Saldo)</div>
                            <div className="font-semibold text-sm" style={{ color: remainingLimit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                Rp {formatRupiah(remainingLimit)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabel Transaksi */}
            <div className="flex justify-between items-center mb-4 mt-8">
                <h3 className="font-semibold" style={{ fontSize: 15 }}>Rincian Transaksi</h3>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="nowrap" style={{ width: '18%' }}>Tanggal Transaksi</th>
                            <th>Uraian / Keterangan Pembayaran</th>
                            <th className="right nowrap" style={{ width: '20%' }}>Nominal Pengeluaran (Rp)</th>
                            <th className="right nowrap" style={{ width: '14%' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.transactions?.map((trx) => (
                            <tr key={trx.id}>
                                {editingTrx?.id === trx.id ? (
                                    <>
                                        <td>
                                            <input
                                                type="date"
                                                className="input-inline"
                                                value={editingTrx.transactionDate}
                                                min={startOfMonth}
                                                max={endOfMonth}
                                                onChange={(e) => setEditingTrx({ ...editingTrx, transactionDate: e.target.value })}
                                                style={{ width: '100%' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="input-inline"
                                                value={editingTrx.description}
                                                onChange={(e) => setEditingTrx({ ...editingTrx, description: e.target.value })}
                                                style={{ width: '100%' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="input-inline"
                                                value={editingTrx.amount}
                                                onChange={(e) => handleAmountChange(e.target.value, true)}
                                                style={{ width: '100%', textAlign: 'right' }}
                                            />
                                        </td>
                                        <td className="right">
                                            <div className="flex gap-1 justify-end">
                                                <button className="btn-icon" title="Save" onClick={handleUpdateTrx} disabled={savingEdit}>
                                                    {savingEdit ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Check size={14} />}
                                                </button>
                                                <button className="btn-icon" title="Cancel" onClick={() => setEditingTrx(null)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="nowrap">
                                            <span className="badge badge-default" style={{ fontWeight: 400 }}>
                                                {formatDate(trx.date)}
                                            </span>
                                        </td>
                                        <td className="font-medium">{trx.description}</td>
                                        <td className="right nowrap">{formatRupiah(trx.amount)}</td>
                                        <td className="right nowrap">
                                            <div className="flex gap-1 justify-end">
                                                <button className="btn-icon" title="Ubah Data" onClick={() => startEdit(trx)}>
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    className="btn-icon danger"
                                                    title="Hapus Transaksi"
                                                    onClick={() => setDeleteTrxTarget(trx)}
                                                    disabled={deletingId === trx.id}
                                                >
                                                    {deletingId === trx.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={13} />}
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}

                        {/* Baris Tambah Transaksi Baru */}
                        <tr style={{ background: 'var(--color-bg)' }}>
                            <td style={{ padding: '10px 16px' }}>
                                <input
                                    type="date"
                                    className="input-inline"
                                    value={newTrx.transactionDate}
                                    min={startOfMonth}
                                    max={endOfMonth}
                                    onChange={(e) => setNewTrx({ ...newTrx, transactionDate: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                                <input
                                    type="text"
                                    className="input-inline"
                                    placeholder="Masukkan Uraian / Keterangan Penjelasan Transaksi..."
                                    value={newTrx.description}
                                    onChange={(e) => setNewTrx({ ...newTrx, description: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                                <input
                                    type="text"
                                    className="input-inline"
                                    placeholder="0"
                                    value={newTrx.amount}
                                    onChange={(e) => handleAmountChange(e.target.value, false)}
                                    onKeyDown={handleKeyDown}
                                    required
                                    style={{ width: '100%', textAlign: 'right' }}
                                />
                            </td>
                            <td style={{ padding: '10px 16px' }} className="right">
                                <button type="button" className="btn btn-primary btn-sm w-full" onClick={handleAddTrx} disabled={savingNew}>
                                    {savingNew ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <><Plus size={13} /> Simpan Baru</>}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {showExport && <ExportModal report={report} onClose={() => setShowExport(false)} />}

            {/* Modal Konfirmasi Hapus Transaksi */}
            {deleteTrxTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTrxTarget(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Hapus Transaksi</h3>
                            <button className="btn-icon" onClick={() => setDeleteTrxTarget(null)}><X size={18} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 16 }}>Apakah Anda yakin ingin menghapus transaksi ini?</p>
                            <div style={{ background: 'var(--color-bg)', padding: 12, borderRadius: 'var(--radius)' }}>
                                <div className="text-sm text-secondary">Tanggal</div>
                                <div className="font-medium mb-2">{formatDate(deleteTrxTarget.date)}</div>
                                <div className="text-sm text-secondary">Uraian Transaksi</div>
                                <div className="font-medium mb-2">{deleteTrxTarget.description}</div>
                                <div className="text-sm text-secondary">Nominal Pengeluaran</div>
                                <div className="font-medium" style={{ color: 'var(--color-danger)' }}>{formatRupiah(deleteTrxTarget.amount)}</div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDeleteTrxTarget(null)} disabled={deletingId}>Batal</button>
                            <button className="btn btn-danger" onClick={confirmDeleteTrx} disabled={deletingId}>
                                {deletingId ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Trash2 size={14} /> Hapus Transaksi</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
