import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/helpers.js';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src="/logo.png" alt="ASABRI Logo" style={{ width: 240, height: 'auto', marginBottom: 0 }} />
                    <p className="login-subtitle" style={{ marginTop: 12, fontSize: 13.5 }}>Pelaporan Penggunaan Kartu Kredit Korporasi</p>
                </div>

                <div className="login-card">
                    {error && (
                        <div className="alert alert-danger mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    className="form-control"
                                    placeholder="Masukkan nama pengguna Anda"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="Masukkan kata sandi Anda"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        style={{ paddingRight: '38px' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)' }}
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                style={{ marginTop: '8px', height: '40px', fontSize: '14px' }}
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-muted" style={{ textAlign: 'center', marginTop: 24, fontSize: 12 }}>
                    PT ASABRI (Persero) &mdash; Sistem Internal
                </p>
            </div>
        </div>
    );
}
