import express from 'express';
import {
    createTransaction,
    updateTransaction,
    deleteTransaction
} from '../controllers/transactions.controller.js';

const router = express.Router();

router.post('/reports/:reportId/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

export default router;
