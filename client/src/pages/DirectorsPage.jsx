import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Users, Pencil, Trash2, CreditCard, ChevronDown } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { directorsApi } from '../api/axios.js';
import { getErrorMessage } from '../utils/helpers.js';
import { useToast } from '../context/ToastContext.jsx';

export default function DirectorsPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [directors, setDirectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchDirectors = async () => {
        try {
            const res = await directorsApi.getAll();
            setDirectors(res.data.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDirectors(); }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await directorsApi.delete(deleteTarget.id);
            setDeleteTarget(null);
            fetchDirectors();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Layout>
            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Data Direksi</h1>
                    <p className="page-subtitle">Kelola profil direksi dan rincian kartu kredit pendamping</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/directors/create')}>
                    <Plus size={15} /> Tambah Direksi
                </button>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-full"><div className="spinner" /></div>
                ) : directors.length === 0 ? (
                    <div className="empty-state">
                        <Users size={40} className="empty-state-icon" />
                        <div className="empty-state-title">Belum ada data direksi</div>
                        <div className="empty-state-desc">Tambahkan profil direktur pertama untuk mulai menggunakan sistem.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="nowrap">Nama Lengkap</th>
                                <th className="nowrap">Posisi / Jabatan</th>
                                <th>Daftar Kartu Kredit</th>
                                <th className="right nowrap">Aksi Lanjutan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {directors.map((d) => (
                                <tr key={d.id}>
                                    <td className="font-semibold">{d.name}</td>
                                    <td className="text-secondary">{d.position}</td>
                                    <td>
                                        {d.creditCards?.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {d.creditCards.map((c) => (
                                                    <div key={c.id} className="flex items-center gap-2">
                                                        <CreditCard size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                        <span className="text-sm font-medium">{c.bankName}</span>
                                                        <span className="font-mono text-muted text-sm">{c.cardNumber}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted text-sm">Tidak ada kartu</span>
                                        )}
                                    </td>
                                    <td className="right nowrap">
                                        <div className="flex gap-1 justify-end">
                                            <Link to={`/directors/${d.id}/edit`} className="btn-icon" title="Ubah Data">
                                                <Pencil size={14} />
                                            </Link>
                                            <button className="btn-icon danger" title="Hapus Permanen" onClick={() => setDeleteTarget(d)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modul Konfirmasi Penghapusan Direksi */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <Trash2 size={36} style={{ margin: '0 auto 16px', color: 'var(--color-danger)', opacity: 0.7 }} />
                            <h2 className="font-semibold" style={{ fontSize: 16, marginBottom: 8 }}>Hapus Direktur ini?</h2>
                            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                                <strong>{deleteTarget.name}</strong><br />
                                Semua laporan dan transaksi yang terkait akan dihapus secara permanen.
                            </p>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary w-full" onClick={() => setDeleteTarget(null)}>Batalkan</button>
                                <button className="btn btn-danger w-full" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Hapus Selamanya'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
