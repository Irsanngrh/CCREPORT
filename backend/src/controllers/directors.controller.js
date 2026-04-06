import prisma from '../db.js';
import { logActivity, LOG_ACTIONS } from '../utils/activityLogger.js';

export const getAllDirectors = async (req, res) => {
    try {
        const directors = await prisma.director.findMany({ include: { creditCards: true } });
        res.json({ success: true, data: directors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getDirector = async (req, res) => {
    try {
        const { id } = req.params;
        const director = await prisma.director.findUnique({
            where: { id: Number(id) },
            include: { creditCards: true, reports: true }
        });
        if (!director) return res.status(404).json({ success: false, message: 'Director not found' });
        res.json({ success: true, data: director });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createDirector = async (req, res) => {
    try {
        const { name, position, creditCards } = req.body;
        const director = await prisma.director.create({
            data: { name, position, creditCards: { create: creditCards || [] } },
            include: { creditCards: true }
        });
        await logActivity(req.user.id, LOG_ACTIONS.CREATE_DIRECTOR, 'director', director.id,
            `Membuat data direksi "${name}" (${position}) dengan ${(creditCards || []).length} kartu kredit`);
        res.status(201).json({ success: true, data: director });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateDirector = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, creditCards } = req.body;

        const existingCards = (creditCards || []).filter(c => c.id);
        const newCards = (creditCards || []).filter(c => !c.id);
        const cardIdsToKeep = existingCards.map(c => Number(c.id));

        const director = await prisma.director.update({
            where: { id: Number(id) },
            data: {
                name, position,
                creditCards: {
                    deleteMany: { id: { notIn: cardIdsToKeep } },
                    update: existingCards.map(c => ({
                        where: { id: Number(c.id) },
                        data: { bankName: c.bankName, cardNumber: c.cardNumber }
                    })),
                    create: newCards.map(c => ({ bankName: c.bankName, cardNumber: c.cardNumber }))
                }
            },
            include: { creditCards: true }
        });
        await logActivity(req.user.id, LOG_ACTIONS.UPDATE_DIRECTOR, 'director', id,
            `Mengubah data direksi "${name}" (${position})`);
        res.json({ success: true, data: director });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteDirector = async (req, res) => {
    try {
        const { id } = req.params;
        const director = await prisma.director.findUnique({ where: { id: Number(id) } });
        await prisma.director.delete({ where: { id: Number(id) } });
        await logActivity(req.user.id, LOG_ACTIONS.DELETE_DIRECTOR, 'director', id,
            `Menghapus data direksi "${director?.name || id}"`);
        res.json({ success: true, message: 'Director deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
