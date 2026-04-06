import express from 'express';
import {
    getAllReports, getReport, getReportBySlug,
    createReport, updateReport, deleteReport, logExport
} from '../controllers/reports.controller.js';
import { validate, createReportSchema, updateReportSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getAllReports);
router.get('/detail/:directorName/:month/:year/:last4cc', getReportBySlug);
router.get('/:id', getReport);
router.post('/', validate(createReportSchema), createReport);
router.put('/:id', validate(updateReportSchema), updateReport);
router.delete('/:id', deleteReport);
router.post('/:id/log-export/:format', logExport);

export default router;
