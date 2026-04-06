import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import directorsRoutes from './routes/directors.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';
import usersRoutes from './routes/users.routes.js';
import activityLogRoutes from './routes/activityLog.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { authenticate, requireAdmin } from './middleware/auth.js';

dotenv.config({ path: '../.env' });

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET environment variable is required');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use(generalLimiter);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── Public Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);

// ─── Protected Routes (any authenticated user) ─────────────────────────────────
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/directors', authenticate, directorsRoutes);
app.use('/api/reports', authenticate, reportsRoutes);
app.use('/api', authenticate, transactionsRoutes);

// ─── Admin-only Routes ─────────────────────────────────────────────────────────
app.use('/api/users', authenticate, requireAdmin, usersRoutes);
app.use('/api/logs', authenticate, requireAdmin, activityLogRoutes);

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
