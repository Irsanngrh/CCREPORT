import prisma from '../db.js';
import { logActivity, LOG_ACTIONS } from '../utils/activityLogger.js';

export const createTransaction = async (req, res) => {
    const { reportId } = req.params;
    const { transactionDate, description, amount } = req.body;
    try {
        let reportData;
        const transaction = await prisma.$transaction(async (tx) => {
            const newTx = await tx.transaction.create({
                data: { reportId: Number(reportId), date: new Date(transactionDate), description, amount: Number(amount) }
            });
            reportData = await tx.report.update({
                where: { id: Number(reportId) },
                data: { totalAmount: { increment: Number(amount) } },
                include: { director: true, creditCard: true }
            });
            return newTx;
        });
        await logActivity(req.user.id, LOG_ACTIONS.CREATE_TRANSACTION, 'transaction', transaction.id,
            `Menambahkan transaksi "${description}" - Rp ${Number(amount).toLocaleString('id-ID')} pada laporan ${reportData.director.name} - ${reportData.creditCard.bankName} ${reportData.creditCard.cardNumber} (${reportData.month}/${reportData.year})`);
        res.status(201).json({ success: true, data: transaction });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { transactionDate, description, amount } = req.body;
    try {
        let reportData;
        const transaction = await prisma.$transaction(async (tx) => {
            const oldTx = await tx.transaction.findUnique({ where: { id: Number(id) } });
            if (!oldTx) throw new Error('Transaction not found');
            const diff = Number(amount) - oldTx.amount;
            const updatedTx = await tx.transaction.update({
                where: { id: Number(id) },
                data: { date: new Date(transactionDate), description, amount: Number(amount) }
            });
            if (diff !== 0) {
                reportData = await tx.report.update({ where: { id: oldTx.reportId }, data: { totalAmount: { increment: diff } }, include: { director: true, creditCard: true } });
            } else {
                reportData = await tx.report.findUnique({ where: { id: oldTx.reportId }, include: { director: true, creditCard: true } });
            }
            return updatedTx;
        });
        await logActivity(req.user.id, LOG_ACTIONS.UPDATE_TRANSACTION, 'transaction', id,
            `Mengubah transaksi "${description}" - Rp ${Number(amount).toLocaleString('id-ID')} pada laporan ${reportData.director.name} - ${reportData.creditCard.bankName} ${reportData.creditCard.cardNumber} (${reportData.month}/${reportData.year})`);
        res.json({ success: true, data: transaction });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        let desc = '';
        await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({ where: { id: Number(id) } });
            if (!transaction) throw new Error('Transaction not found');
            const reportData = await tx.report.update({ where: { id: transaction.reportId }, data: { totalAmount: { decrement: transaction.amount } }, include: { director: true, creditCard: true } });
            desc = `Menghapus transaksi "${transaction.description}" - Rp ${transaction.amount.toLocaleString('id-ID')} pada laporan ${reportData.director.name} - ${reportData.creditCard.bankName} ${reportData.creditCard.cardNumber} (${reportData.month}/${reportData.year})`;
            await tx.transaction.delete({ where: { id: Number(id) } });
        });
        await logActivity(req.user.id, LOG_ACTIONS.DELETE_TRANSACTION, 'transaction', id, desc);
        res.json({ success: true, message: 'Transaction deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
