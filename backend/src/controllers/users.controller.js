import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { logActivity, LOG_ACTIONS } from '../utils/activityLogger.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true }
        });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) return res.status(400).json({ success: false, message: 'Username already exists' });

        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { username, password: hashed, role: role || 'user' },
            select: { id: true, username: true, role: true }
        });
        await logActivity(req.user.id, LOG_ACTIONS.CREATE_USER, 'user', user.id,
            `Membuat pengguna "${username}" - ID ${user.id}`);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role } = req.body;

        const existing = await prisma.user.findFirst({
            where: { username, NOT: { id: Number(id) } }
        });
        if (existing) return res.status(400).json({ success: false, message: 'Username already taken' });

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { username, role: role || 'user' },
            select: { id: true, username: true, role: true }
        });

        await logActivity(req.user.id, LOG_ACTIONS.UPDATE_USER, 'user', user.id, `Mengubah pengguna "${username}" - ID ${user.id}`);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (Number(id) === req.user.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        await prisma.user.delete({ where: { id: Number(id) } });
        await logActivity(req.user.id, LOG_ACTIONS.DELETE_USER, 'user', id,
            `Menghapus pengguna "${user?.username || 'Unknown'}" - ID ${id}`);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
