import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, setAuthHeader, clearAuthHeader } from '../api/axios.js';

const AuthContext = createContext(null);

// Decode JWT payload without a library
function decodeJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Attempt to restore session via httpOnly cookie
    useEffect(() => {
        api.post('/api/auth/refresh')
            .then((res) => {
                const { accessToken } = res.data.data;
                setAuthHeader(accessToken);
                // Decode role from the token directly (avoids an extra /me request)
                const payload = decodeJwt(accessToken);
                setUser(payload ? { id: payload.id, username: payload.username, role: payload.role } : null);
            })
            .catch(() => { }) // No valid session
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (username, password) => {
        const res = await api.post('/api/auth/login', { username, password });
        const { accessToken, user: u } = res.data.data;
        setAuthHeader(accessToken);
        setUser(u); // u already contains { id, username, role }
        return u;
    }, []);

    const logout = useCallback(async () => {
        try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
        clearAuthHeader();
        setUser(null);
    }, []);

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
