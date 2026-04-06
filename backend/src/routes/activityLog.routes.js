import express from 'express';
import { getLogs, getLogFilters } from '../controllers/activityLog.controller.js';

const router = express.Router();

router.get('/', getLogs);
router.get('/filters', getLogFilters);

export default router;
