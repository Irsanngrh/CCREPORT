import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, ShieldCheck, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-title">CC Report</div>
                <div className="sidebar-logo-sub">PT ASABRI (Persero)</div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Menu Utama</div>

                <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <LayoutDashboard size={16} /> Dashboard
                </NavLink>

                <NavLink to="/reports" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <FileText size={16} /> Rekap Laporan
                </NavLink>

                <NavLink to="/directors" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                    <Users size={16} /> Data Direksi
                </NavLink>

                {isAdmin && (
                    <>
                        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Pengaturan Sistem</div>

                        <NavLink to="/users" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                            <ShieldCheck size={16} /> Akun Pengguna
                        </NavLink>

                        <NavLink to="/logs" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                            <Activity size={16} /> Log Aktivitas
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={handleLogout} title="Keluar">
                    <div className="sidebar-avatar">{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sidebar-username">{user?.username || 'User'}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--color-text-muted)', marginTop: 1, textTransform: 'capitalize' }}>
                            {user?.role === 'admin' ? 'Administrator' : 'Karyawan'}
                        </div>
                    </div>
                    <LogOut size={14} className="sidebar-logout" />
                </div>
            </div>
        </aside>
    );
}
