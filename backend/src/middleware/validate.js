import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        const messages = err.errors?.map(e => e.message).join(', ') || 'Validation failed';
        return res.status(400).json({ success: false, message: messages });
    }
};

// ─── Auth Schemas ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required').max(50),
    password: z.string().min(1, 'Password is required').max(128),
});

// ─── Director Schemas ──────────────────────────────────────────────────────────
export const createDirectorSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    position: z.string().min(1, 'Position is required').max(100),
    creditCards: z.array(z.object({
        bankName: z.string().min(1, 'Bank name is required').max(100),
        cardNumber: z.string().min(1, 'Card number is required').max(20),
    })).min(1, 'At least 1 credit card is required'),
});

export const updateDirectorSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    position: z.string().min(1, 'Position is required').max(100).optional(),
    creditCards: z.array(z.object({
        id: z.number().optional(),
        bankName: z.string().min(1, 'Bank name is required').max(100),
        cardNumber: z.string().min(1, 'Card number is required').max(20),
    })).min(1, 'At least 1 credit card is required').optional(),
});

// ─── Report Schemas ────────────────────────────────────────────────────────────
export const createReportSchema = z.object({
    directorId: z.coerce.number().int().positive('Director is required'),
    creditCardId: z.coerce.number().int().positive('Credit card is required'),
    month: z.coerce.number().int().min(1).max(12, 'Month must be between 1 and 12'),
    year: z.coerce.number().int().min(2000).max(2100),
    creditLimit: z.coerce.number().positive('Credit limit must be positive'),
});

export const updateReportSchema = z.object({
    creditCardId: z.coerce.number().int().positive().optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    creditLimit: z.coerce.number().positive().optional(),
});

// ─── Transaction Schemas ───────────────────────────────────────────────────────
export const createTransactionSchema = z.object({
    transactionDate: z.string().min(1, 'Transaction date is required'),
    description: z.string().min(1, 'Description is required').max(255),
    amount: z.coerce.number().positive('Amount must be positive'),
});

export const updateTransactionSchema = z.object({
    transactionDate: z.string().min(1, 'Transaction date is required').optional(),
    description: z.string().min(1, 'Description is required').max(255).optional(),
    amount: z.coerce.number().min(0, 'Amount cannot be negative').optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

// ─── User Schemas ──────────────────────────────────────────────────────────────
export const createUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric and underscore allowed'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    role: z.enum(['admin', 'user']).optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});
