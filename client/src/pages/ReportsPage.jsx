import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Download, Trash2, Filter } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import ExportModal from '../components/ExportModal.jsx';
import { reportsApi } from '../api/axios.js';
import { getMonthName, formatRupiah, getErrorMessage, getReportSlug, MONTH_NAMES } from '../utils/helpers.js';

export default function ReportsPage() {
    const navigate = useNavigate();

    const [data, setData] = useState({ reports: [], availableYears: [], monthNames: MONTH_NAMES });
    const [directors, setDirectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filterYear, setFilterYear] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterDirector, setFilterDirector] = useState('');
    const [filterType, setFilterType] = useState('monthly');

    const [exportTarget, setExportTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [openDropdown, setOpenDropdown] = useState(null);
    const dropRef = useRef(null);

    const fetchReports = async (params = {}) => {
        setLoading(true);
        setError('');
        try {
            const res = await reportsApi.getAll({
                year: filterYear || undefined,
                month: filterMonth || undefined,
                directorId: filterDirector || undefined,
                type: filterType,
                ...params,
            });
            setData(res.data.data);
            if (!filterYear && res.data.data.filterYear) {
                setFilterYear(String(res.data.data.filterYear));
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(); }, [filterYear, filterMonth, filterDirector, filterType]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await reportsApi.delete(deleteTarget.id);
            setDeleteTarget(null);
            fetchReports();
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeleting(false);
        }
    };

    const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);

    const setFilter = (key, value) => {
        if (key === 'year') setFilterYear(value);
        if (key === 'month') setFilterMonth(value);
        if (key === 'director') setFilterDirector(value);
        if (key === 'type') setFilterType(value);
        setOpenDropdown(null);
    };

    const selectedDirectorName = data.reports
        .find((r) => String(r.directorId) === filterDirector)?.director?.name;

    return (
        <Layout>
            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Rekap Laporan</h1>
                    <p className="page-subtitle">Kelola laporan bulanan kartu kredit korporasi</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/reports/create')}>
                    <Plus size={15} /> Buat Laporan Baru
                </button>
            </div>

            <div className="filter-bar" ref={dropRef}>
                <div className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={13} />
                    <span>FILTER</span>
                </div>

                <div className="dropdown-wrapper">
                    <button className="filter-btn" onClick={() => toggleDropdown('director')}>
                        {selectedDirectorName || 'Semua Direksi'}
                    </button>
                    {openDropdown === 'director' && (
                        <div className="dropdown-menu">
                            <div className={`dropdown-item${!filterDirector ? ' active' : ''}`} onClick={() => setFilter('director', '')}>Semua Direksi</div>
                            {[...new Map(data.reports.map((r) => [r.directorId, r.director])).entries()].map(([id, dir]) => (
                                <div key={id} className={`dropdown-item${String(id) === filterDirector ? ' active' : ''}`} onClick={() => setFilter('director', String(id))}>
                                    {dir?.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {filterType === 'monthly' && (
                    <div className="dropdown-wrapper">
                        <button className="filter-btn" onClick={() => toggleDropdown('month')}>
                            {filterMonth ? getMonthName(Number(filterMonth)) : 'Semua Bulan'}
                        </button>
                        {openDropdown === 'month' && (
                            <div className="dropdown-menu">
                                <div className={`dropdown-item${!filterMonth ? ' active' : ''}`} onClick={() => setFilter('month', '')}>Semua Bulan</div>
                                {Object.entries(MONTH_NAMES).map(([k, v]) => (
                                    <div key={k} className={`dropdown-item${filterMonth === k ? ' active' : ''}`} onClick={() => setFilter('month', k)}>{v}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="dropdown-wrapper">
                    <button className="filter-btn" onClick={() => toggleDropdown('year')}>
                        {filterYear || 'Tahun'}
                    </button>
                    {openDropdown === 'year' && (
                        <div className="dropdown-menu">
                            {data.availableYears.map((y) => (
                                <div key={y} className={`dropdown-item${String(y) === filterYear ? ' active' : ''}`} onClick={() => setFilter('year', String(y))}>
                                    {y}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <span style={{ color: 'var(--color-border)', margin: '0 4px' }}>|</span>

                <button
                    className={`filter-btn${filterType === 'monthly' ? ' active' : ''}`}
                    onClick={() => setFilter('type', 'monthly')}
                >
                    Bulanan
                </button>
                <button
                    className={`filter-btn${filterType === 'yearly' ? ' active' : ''}`}
                    onClick={() => setFilter('type', 'yearly')}
                >
                    Tahunan
                </button>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-full"><div className="spinner" /></div>
                ) : data.reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-title">Tidak ada laporan ditemukan</div>
                        <div className="empty-state-desc">Coba sesuaikan filter pencarian periode tanggal Anda atau rekam laporan baru.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="nowrap">Nama Direksi</th>
                                <th className="nowrap">Periode</th>
                                {filterType !== 'yearly' && <th className="nowrap">Kartu Kredit</th>}
                                <th className="right nowrap">Pagu</th>
                                <th className="right nowrap">Realisasi</th>
                                <th className="right nowrap">Sisa Pagu</th>
                                {filterType !== 'yearly' && <th className="right nowrap">Aksi Lanjutan</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.reports.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        <span className="font-semibold">{r.director?.name}</span>
                                        <div className="text-sm text-muted" style={{ marginTop: 1 }}>{r.director?.position}</div>
                                    </td>
                                    <td>
                                        <span className="badge badge-default nowrap">
                                            {r.isAggregate ? r.year : `${getMonthName(r.month)} ${r.year}`}
                                        </span>
                                    </td>
                                    {filterType !== 'yearly' && (
                                        <td>
                                            {!r.isAggregate && (
                                                <>
                                                    <div className="text-sm font-medium">{r.creditCard?.bankName}</div>
                                                    <div className="text-sm font-mono text-muted">{r.creditCard?.cardNumber}</div>
                                                </>
                                            )}
                                        </td>
                                    )}
                                    <td className="right text-secondary nowrap">{formatRupiah(r.creditLimit)}</td>
                                    <td className="right font-semibold nowrap">{formatRupiah(r.totalExpenses)}</td>
                                    <td className="right nowrap">
                                        <span style={{ color: r.remainingLimit >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 500 }}>
                                            {formatRupiah(r.remainingLimit)}
                                        </span>
                                    </td>
                                    {filterType !== 'yearly' && (
                                        <td className="right nowrap">
                                            {!r.isAggregate && (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="btn-icon" title="Download" onClick={() => setExportTarget(r)}>
                                                        <Download size={14} />
                                                    </button>
                                                    <Link to={getReportSlug(r)} className="btn-icon" title="View Detail">
                                                        <Eye size={14} />
                                                    </Link>
                                                    <button className="btn-icon danger" title="Delete" onClick={() => setDeleteTarget(r)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {exportTarget && (
                <ExportModal report={exportTarget} onClose={() => setExportTarget(null)} />
            )}

            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
                            <Trash2 size={36} style={{ margin: '0 auto 16px', color: 'var(--color-danger)', opacity: 0.7 }} />
                            <h2 className="font-semibold" style={{ fontSize: 16, marginBottom: 8 }}>Hapus Laporan ini?</h2>
                            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                                {deleteTarget.director?.name} - {getMonthName(deleteTarget.month)} {deleteTarget.year}<br />
                                Tindakan ini bersifat absolut dan tidak dapat dikembalikan.
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
