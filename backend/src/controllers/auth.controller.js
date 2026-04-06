import { logActivity, LOG_ACTIONS } from '../utils/activityLogger.js';
import { loginWithCredentials, rotateRefreshToken, revokeRefreshToken } from '../services/auth.service.js';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: IS_PROD, // HTTPS-only in production
    sameSite: IS_PROD ? 'strict' : 'lax', // Stricter CSRF protection in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { user, accessToken, refreshToken } = await loginWithCredentials(username, password);

        res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
        res.json({ success: true, data: { user, accessToken } });
        // Log after responding to not delay the response
        logActivity(user.id, LOG_ACTIONS.LOGIN, 'user', user.id, `Pengguna "${user.username}" berhasil masuk (login)`);
    } catch (err) {
        if (err.message === 'INVALID_CREDENTIALS') {
            return res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

export const refresh = async (req, res) => {
    try {
        const existingRefreshToken = req.cookies?.refresh_token;
        if (!existingRefreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }

        const { accessToken, newRefreshToken } = await rotateRefreshToken(existingRefreshToken);

        res.cookie('refresh_token', newRefreshToken, COOKIE_OPTIONS);
        res.json({ success: true, data: { accessToken } });
    } catch (err) {
        const code = err.message === 'TOKEN_EXPIRED' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
        res.clearCookie('refresh_token');
        return res.status(401).json({ success: false, code, message: 'Session tidak valid, silakan login kembali' });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;
        let loggedUserId = null;
        if (refreshToken) {
            loggedUserId = await revokeRefreshToken(refreshToken);
        }
        res.clearCookie('refresh_token');
        res.json({ success: true, message: 'Logged out' });
        if (loggedUserId) logActivity(loggedUserId, LOG_ACTIONS.LOGOUT, 'user', loggedUserId, `Pengguna berhasil keluar (logout)`);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const me = async (req, res) => {
    res.json({ success: true, data: { user: req.user } });
};
