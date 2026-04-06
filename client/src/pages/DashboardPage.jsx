import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CreditCard, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import { api } from '../api/axios.js';
import { getErrorMessage, formatDate } from '../utils/helpers.js';
import { useAuth } from '../context/AuthContext.jsx';

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
    LOGIN: 'var(--color-text-muted)', LOGOUT: 'var(--color-text-muted)',
    CREATE_USER: 'var(--color-primary)', DELETE_USER: 'var(--color-danger)',
};

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{value ?? '-'}</div>
                    {sub && <div className="stat-sub">{sub}</div>}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color }} />
                </div>
            </div>
        </div>
    );
}

function ActivityBadge({ action }) {
    const label = ACTION_LABELS[action] || action;
    const color = ACTION_COLORS[action] || 'var(--color-text-muted)';
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', marginLeft: '-8px',
            borderRadius: 'var(--radius-sm)', fontSize: 11.5, fontWeight: 600,
            background: `${color}18`, color
        }}>
            {label}
        </span>
    );
}

export default function DashboardPage() {
    const { isAdmin } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/api/dashboard/stats')
            .then(res => setData(res.data.data))
            .catch(err => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Layout><div className="loading-full"><div className="spinner" /></div></Layout>;

    const { stats = {}, recentLogs = [], activityChart = [] } = data || {};
    const maxChart = Math.max(...activityChart.map(d => d.count), 1);

    return (
        <Layout>
            <div className="page-title-bar">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Ringkasan sistem dan aktivitas terbaru</p>
                </div>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="stats-grid" style={{ marginBottom: 20 }}>
                <StatCard icon={FileText} label="Total Laporan" value={stats.totalReports} sub={`${stats.reportsThisMonth ?? 0} bulan ini`} color="var(--color-primary)" />
                <StatCard icon={Users} label="Total Direksi" value={stats.totalDirectors} color="var(--color-success)" />
                <StatCard icon={CreditCard} label="Total Transaksi" value={stats.totalTransactions} sub={`${stats.transactionsThisMonth ?? 0} bulan ini`} color="var(--color-warning)" />
                <StatCard icon={TrendingUp} label="Total Pengguna" value={stats.totalUsers} color="var(--color-danger)" />
            </div>

            <div className="dashboard-grid">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>Aktivitas Terbaru</h2>
                        {isAdmin && (
                            <Link to="/logs" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 12.5 }}>
                                Lihat Semua <ArrowRight size={12} style={{ marginLeft: 4 }} />
                            </Link>
                        )}
                    </div>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 360, overflow: 'hidden' }}>
                        {recentLogs.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px 24px' }}>
                                <Activity size={32} className="empty-state-icon" />
                                <div className="empty-state-title">Belum ada aktivitas tercatat</div>
                            </div>
                        ) : (
                            <div style={{ overflowY: 'auto', height: '100%' }}>
                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th className="nowrap" style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-bg)', boxShadow: '0 1px 0 var(--color-border)' }}>Pengguna</th>
                                            <th className="nowrap" style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-bg)', boxShadow: '0 1px 0 var(--color-border)' }}>Aksi Sistem</th>
                                            <th style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-bg)', boxShadow: '0 1px 0 var(--color-border)' }}>Deskripsi Aktivitas</th>
                                            <th className="right nowrap" style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-bg)', boxShadow: '0 1px 0 var(--color-border)' }}>Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentLogs.map(log => (
                                            <tr key={log.id}>
                                                <td className="font-semibold nowrap">{log.user?.username}</td>
                                                <td className="nowrap"><ActivityBadge action={log.action} /></td>
                                                <td className="text-secondary text-sm">{log.description}</td>
                                                <td className="right text-muted text-sm nowrap">
                                                    {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    <div style={{ fontSize: 11 }}>{formatDate(log.createdAt)}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 12 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>Aktivitas - 7 Hari Terakhir</h2>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                                {activityChart.map(d => {
                                    const h = maxChart === 0 ? 0 : Math.max(4, (d.count / maxChart) * 120);
                                    const label = new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' });
                                    return (
                                        <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>
                                                {d.count > 0 ? d.count : ''}
                                            </span>
                                            <div style={{
                                                width: '100%', height: h,
                                                background: h > 4 ? 'var(--color-primary)' : 'var(--color-border)',
                                                borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease', opacity: h > 4 ? 0.85 : 0.4
                                            }} />
                                            <span style={{ fontSize: 10.5, color: 'var(--color-text-muted)' }}>{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
