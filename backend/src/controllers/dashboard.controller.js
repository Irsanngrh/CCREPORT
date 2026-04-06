import prisma from '../db.js';

export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalDirectors,
            totalReports,
            totalTransactions,
            totalUsers,
            reportsThisMonth,
            transactionsThisMonth,
            recentLogs,
            activityByDay,
        ] = await Promise.all([
            prisma.director.count(),
            prisma.report.count(),
            prisma.transaction.count(),
            prisma.user.count(),
            prisma.report.count({ where: { month: currentMonth, year: currentYear } }),
            prisma.transaction.count({ where: { date: { gte: startOfMonth } } }),
            prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, username: true } } }
            }),
            // Count activity per day for last 7 days
            prisma.activityLog.groupBy({
                by: ['createdAt'],
                _count: { _all: true },
                where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            }),
        ]);

        // Aggregate activityByDay into day buckets
        const dayMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dayMap[key] = 0;
        }
        activityByDay.forEach(row => {
            const key = new Date(row.createdAt).toISOString().split('T')[0];
            if (key in dayMap) dayMap[key] += row._count._all;
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalDirectors,
                    totalReports,
                    totalTransactions,
                    totalUsers,
                    reportsThisMonth,
                    transactionsThisMonth,
                },
                recentLogs,
                activityChart: Object.entries(dayMap).map(([date, count]) => ({ date, count })),
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
