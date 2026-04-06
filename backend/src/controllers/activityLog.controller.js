import prisma from '../db.js';

export const getLogs = async (req, res) => {
    try {
        const { userId, action, entity, dateFrom, dateTo, search, page = '1', limit = '50' } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(200, Math.max(1, parseInt(limit)));

        const where = {};

        if (userId) where.userId = Number(userId);
        if (action) where.action = action;
        if (entity) where.entity = entity;
        if (search) {
            where.description = { contains: search, mode: 'insensitive' };
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: { user: { select: { id: true, username: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.activityLog.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                logs,
                pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getLogFilters = async (req, res) => {
    try {
        // Fetch distinct action and entity values, and all users
        const [actions, entities, users] = await Promise.all([
            prisma.activityLog.findMany({ select: { action: true }, distinct: ['action'] }),
            prisma.activityLog.findMany({ select: { entity: true }, distinct: ['entity'] }),
            prisma.user.findMany({ select: { id: true, username: true } }),
        ]);

        res.json({
            success: true,
            data: {
                actions: actions.map(a => a.action).sort(),
                entities: entities.map(e => e.entity).sort(),
                users,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
