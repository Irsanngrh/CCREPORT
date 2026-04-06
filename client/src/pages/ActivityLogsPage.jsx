import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import { api } from '../api/axios.js';
import { getErrorMessage, formatDate } from '../utils/helpers.js';

const ACTION_LABELS = {
    CREATE_REPORT: 'Laporan Dibuat', UPDATE_REPORT: 'Laporan Diperbarui', DELETE_REPORT: 'Laporan Dihapus',
    CREATE_DIRECTOR: 'Direksi Dibuat', UPDATE_DIRECTOR: 'Direksi Diperbarui', DELETE_DIRECTOR: 'Direksi Dihapus',
    CREATE_TRANSACTION: 'Transaksi Ditambah', UPDATE_TRANSACTION: 'Transaksi Diperbarui', DELETE_TRANSACTION: 'Transaksi Dihapus',
    EXPORT_PDF: 'Ekspor PDF', EXPORT_EXCEL: 'Ekspor Excel',
    LOGIN: 'Masuk (Login)', LOGOUT: 'Keluar (Logout)',
    CREATE_USER: 'Pengguna Dibuat', DELETE_USER: 'Pengguna Dihapus', CHANGE_PASSWORD: 'Kata Sandi Diubah',
};

const ACTION_COLORS = {
    CREATE_REPORT: 'var(--color-success)', UPDATE_REPORT: 'var(--color-primary)', DELETE_REPORT: 'var(--color-danger)',
    CREATE_DIRECTOR: 'var(--color-success)', UPDATE_DIRECTOR: 'var(--color-primary)', DELETE_DIRECTOR: 'var(--color-danger)',
    CREATE_TRANSACTION: 'var(--color-success)', UPDATE_TRANSACTION: 'var(--color-primary)', DELETE_TRANSACTION: 'var(--color-danger)',
    EXPORT_PDF: 'var(--color-warning)', EXPORT_EXCEL: 'var(--color-warning)',
    LOGIN: 'var(--color-text-secondary)', LOGOUT: 'var(--color-text-secondary)',
    CREATE_USER: 'var(--color-primary)', DELETE_USER: 'var(--color-danger)',
};

const ENTITY_LABELS = {
    report: 'Laporan', director: 'Direksi', transaction: 'Transaksi',
    user: 'Pengguna', export: 'Ekspor',
};

function ActionBadge({ action }) {
    const label = ACTION_LABELS[action] || action;
    const color = ACTION_COLORS[action] || 'var(--color-text-muted)';
    return (
        <span style={{
            display: 'inline-block', padding: '3px 9px', marginLeft: '-8px',
            borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600,
            background: `${color}18`, color, whiteSpace: 'nowrap'
        }}>
            {label}
        </span>
    );
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [filterOptions, setFilterOptions] = useState({ actions: [], entities: [], users: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        userId: '', action: '', entity: '', dateFrom: '', dateTo: '', search: '',
    });
    const [page, setPage] = useState(1);
    const LIMIT = 50;

    // Fetch unique user, action, and entity values for dropdown population
    useEffect(() => {
        api.get('/api/logs/filters').then(res => setFilterOptions(res.data.data)).catch(() => { });
    }, []);

    const fetchLogs = useCallback(() => {
        setLoading(true);
        const params = { ...filters, page, limit: LIMIT };
        // Strip empty values
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        api.get('/api/logs', { params })
            .then(res => {
                setLogs(res.data.data.logs);
                setPagination(res.data.data.pagination);
            })
            .catch(err => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [filters, page]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleFilterChange = (key, value) => {
        setFilters(f => ({ ...f, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ userId: '', action: '', entity: '', dateFrom: '', dateTo: '', search: '' });
        setPage(1);
    };

    const hasFilters = Object.values(filters).some(v => v !== '');

    const actionOptions = filterOptions.actions.map(a => ({ value: a, label: ACTION_LABELS[a] || a }));
    const entityOptions = filterOptions.entities.map(e => ({ value: e, label: ENTITY_LABELS[e] || e }));
    const userOptions = [...filterOptions.users].sort((a, b) => a.id - b.id).map(u => ({ value: u.id, label: u.username }));

    return (
        <Layout>
            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Log Aktivitas</h1>
                    <p className="page-subtitle">
                        {pagination.total > 0 ? `${pagination.total} aktivitas ditemukan` : 'Pantau seluruh aktivitas sistem'}
                    </p>
                </div>
                {hasFilters && (
                    <button className="btn btn-secondary" onClick={clearFilters}>
                        <X size={13} /> Hapus Filter
                    </button>
                )}
            </div>

            {/* Metrics and Filters Wrapper */}
            <div className="card mb-4">
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Pengguna (User)</label>
                            <CustomSelect
                                value={filters.userId}
                                onChange={e => handleFilterChange('userId', e.target.value)}
                                options={[{ value: '', label: 'Semua Pengguna' }, ...userOptions]}
                                placeholder="Semua Pengguna"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Aksi Sistem</label>
                            <CustomSelect
                                value={filters.action}
                                onChange={e => handleFilterChange('action', e.target.value)}
                                options={[{ value: '', label: 'Semua Aksi' }, ...actionOptions]}
                                placeholder="Semua Aksi"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Modul</label>
                            <CustomSelect
                                value={filters.entity}
                                onChange={e => handleFilterChange('entity', e.target.value)}
                                options={[{ value: '', label: 'Semua Modul' }, ...entityOptions]}
                                placeholder="Semua Modul"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cari Deskripsi</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ paddingLeft: 30 }}
                                    placeholder="Ketik kata kunci..."
                                    value={filters.search}
                                    onChange={e => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date range filter component */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Dari Tanggal</label>
                            <input type="date" className="form-control" value={filters.dateFrom}
                                onChange={e => handleFilterChange('dateFrom', e.target.value)} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Sampai Tanggal</label>
                            <input type="date" className="form-control" value={filters.dateTo}
                                onChange={e => handleFilterChange('dateTo', e.target.value)} />
                        </div>
                        <div style={{ flex: 'none', paddingBottom: 1 }}>
                            <button className="btn btn-primary" onClick={fetchLogs}>
                                <Filter size={13} /> FILTER
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Logs Data Table Rendering */}
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-full"><div className="spinner" /></div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <Activity size={40} className="empty-state-icon" />
                        <div className="empty-state-title">Aktivitas tidak ditemukan</div>
                        <div className="empty-state-desc">Coba sesuaikan jangka waktu atau keyword pencarian Anda.</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="nowrap">#</th>
                                <th className="nowrap">Pengguna</th>
                                <th className="nowrap">Aksi Sistem</th>
                                <th className="nowrap">Kategori Modul</th>
                                <th>Detail Deskripsi</th>
                                <th className="right nowrap">Tanggal &amp; Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, idx) => (
                                <tr key={log.id}>
                                    <td className="text-muted text-sm">{(page - 1) * LIMIT + idx + 1}</td>
                                    <td className="font-semibold nowrap">{log.user?.username}</td>
                                    <td><ActionBadge action={log.action} /></td>
                                    <td>
                                        <span className="badge badge-default">
                                            {ENTITY_LABELS[log.entity] || log.entity}
                                        </span>
                                    </td>
                                    <td className="text-secondary" style={{ maxWidth: 340 }}>
                                        {log.description}
                                    </td>
                                    <td className="right text-muted text-sm nowrap">
                                        {new Date(log.createdAt).toLocaleString('id-ID', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Active Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    <span className="text-muted text-sm">
                        Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} data)
                    </span>
                    <div className="flex gap-2">
                        <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                            <ChevronLeft size={14} />
                        </button>
                        <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
}
