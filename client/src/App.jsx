import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import ReportCreatePage from './pages/ReportCreatePage.jsx';
import ReportEditPage from './pages/ReportEditPage.jsx';
import ReportDetailPage from './pages/ReportDetailPage.jsx';
import DirectorsPage from './pages/DirectorsPage.jsx';
import DirectorCreatePage from './pages/DirectorCreatePage.jsx';
import DirectorEditPage from './pages/DirectorEditPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ActivityLogsPage from './pages/ActivityLogsPage.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading-full"><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return <div className="loading-full"><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />; // Non-admin goes to Dashboard
    return children;
};

const AuthRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/" replace />;
    return children;
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />

                {/* All authenticated users */}
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/reports/create" element={<ProtectedRoute><ReportCreatePage /></ProtectedRoute>} />
                <Route path="/reports/:directorName/:month/:year/:last4cc/edit" element={<ProtectedRoute><ReportEditPage /></ProtectedRoute>} />
                <Route path="/reports/:directorName/:month/:year/:last4cc" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
                <Route path="/directors" element={<ProtectedRoute><DirectorsPage /></ProtectedRoute>} />
                <Route path="/directors/create" element={<ProtectedRoute><DirectorCreatePage /></ProtectedRoute>} />
                <Route path="/directors/:id/edit" element={<ProtectedRoute><DirectorEditPage /></ProtectedRoute>} />

                {/* Admin-only — redirect to / if non-admin */}
                <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
                <Route path="/logs" element={<AdminRoute><ActivityLogsPage /></AdminRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
