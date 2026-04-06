import prisma from '../db.js';
import { mapReport, mapReportWithTransactions } from '../utils/reportMapper.js';
import { logActivity, LOG_ACTIONS } from '../utils/activityLogger.js';

export const getAllReports = async (req, res) => {
    try {
        const { directorId, year, month, type, page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

        const filter = {};
        if (directorId) filter.directorId = Number(directorId);
        let targetYear = year ? Number(year) : new Date().getFullYear();
        filter.year = targetYear;
        if (month && type !== 'yearly') filter.month = Number(month);

        const [reports, totalCount] = await Promise.all([
            prisma.report.findMany({
                where: filter,
                include: { director: true, creditCard: true, _count: { select: { transactions: true } } },
                orderBy: { id: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.report.count({ where: filter })
        ]);

        const allReports = await prisma.report.findMany({ select: { year: true } });
        const availableYears = [...new Set(allReports.map(r => r.year))].sort((a, b) => b - a);
        if (availableYears.length === 0) availableYears.push(targetYear);

        let mappedReports = reports.map(mapReport);

        if (type === 'yearly') {
            const grouped = {};
            mappedReports.forEach(r => {
                const key = `${r.directorId}-${r.year}`;
                if (!grouped[key]) grouped[key] = { id: `agg-${key}`, directorId: r.directorId, director: r.director, year: r.year, creditLimit: 0, totalExpenses: 0, isAggregate: true };
                grouped[key].creditLimit += r.creditLimit;
                grouped[key].totalExpenses += r.totalExpenses;
            });
            mappedReports = Object.values(grouped).map(g => ({ ...g, remainingLimit: g.creditLimit - g.totalExpenses }));
        }

        res.json({ success: true, data: { reports: mappedReports, availableYears, filterYear: targetYear, pagination: { page: pageNum, limit: limitNum, total: totalCount } } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getReportBySlug = async (req, res) => {
    try {
        const { directorName, month, year, last4cc } = req.params;
        const reports = await prisma.report.findMany({
            where: { month: Number(month), year: Number(year), creditCard: { cardNumber: { endsWith: last4cc } } },
            include: { director: { include: { creditCards: true } }, creditCard: true, transactions: { orderBy: { date: 'asc' } } }
        });
        const report = reports.find(r => r.director.name.toLowerCase().replace(/\s+/g, '-') === directorName);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        const mappedReport = {
            ...report,
            totalExpenses: report.totalAmount,
            remainingLimit: report.creditLimit - report.totalAmount
        };

        res.json({ success: true, data: mappedReport });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await prisma.report.findUnique({
            where: { id: Number(id) },
            include: { director: { include: { creditCards: true } }, creditCard: true, transactions: { orderBy: { date: 'asc' } } }
        });
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        res.json({ success: true, data: mapReportWithTransactions(report) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createReport = async (req, res) => {
    try {
        const { directorId, creditCardId, month, year, creditLimit } = req.body;
        const existing = await prisma.report.findFirst({
            where: { directorId: Number(directorId), creditCardId: Number(creditCardId), month: Number(month), year: Number(year) }
        });
        if (existing) return res.status(400).json({ success: false, message: 'Report for this card in this period already exists.' });

        const report = await prisma.report.create({
            data: { directorId: Number(directorId), creditCardId: Number(creditCardId), month: Number(month), year: Number(year), creditLimit: Number(creditLimit), totalAmount: 0 },
            include: { director: true, creditCard: true }
        });
        await logActivity(req.user.id, LOG_ACTIONS.CREATE_REPORT, 'report', report.id,
            `Membuat laporan untuk ${report.director.name} - ${report.creditCard.bankName} ${report.creditCard.cardNumber} (${month}/${year})`);
        res.status(201).json({ success: true, data: report });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year, creditLimit, creditCardId } = req.body;
        const report = await prisma.report.update({
            where: { id: Number(id) },
            data: {
                ...(month !== undefined && { month: Number(month) }),
                ...(year !== undefined && { year: Number(year) }),
                ...(creditLimit !== undefined && { creditLimit: Number(creditLimit) }),
                ...(creditCardId !== undefined && { creditCardId: Number(creditCardId) }),
            },
            include: { director: true, creditCard: true }
        });
        await logActivity(req.user.id, LOG_ACTIONS.UPDATE_REPORT, 'report', id,
            `Mengubah laporan ${report.director.name} - ${report.creditCard.bankName} ${report.creditCard.cardNumber} (${report.month}/${report.year})`);
        res.json({ success: true, data: report });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await prisma.report.delete({
            where: { id: Number(id) },
            include: { director: true, creditCard: true }
        });
        await logActivity(req.user.id, LOG_ACTIONS.DELETE_REPORT, 'report', id,
            `Menghapus laporan ${report.director.name} - ${report.creditCard.bankName} ${report.creditCard.cardNumber} (${report.month}/${report.year})`);
        res.json({ success: true, message: 'Report deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const logExport = async (req, res) => {
    try {
        const { id, format } = req.params; // format: pdf | excel
        const report = await prisma.report.findUnique({
            where: { id: Number(id) },
            include: { director: true, creditCard: true }
        });
        const action = format === 'pdf' ? LOG_ACTIONS.EXPORT_PDF : LOG_ACTIONS.EXPORT_EXCEL;

        let desc = `Mengekspor Laporan ID ${id} sebagai ${format.toUpperCase()}`;
        if (report) {
            desc = `Mengekspor Laporan CC ${report.director.name} ${report.month}/${report.year} - ${report.creditCard.cardNumber.slice(-4)} sebagai ${format.toUpperCase()}`;
        }

        await logActivity(req.user.id, action, 'export', id, desc);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
