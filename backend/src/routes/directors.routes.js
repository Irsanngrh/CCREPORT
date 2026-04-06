import express from 'express';
import {
    getAllDirectors, getDirector, createDirector,
    updateDirector, deleteDirector
} from '../controllers/directors.controller.js';
import { validate, createDirectorSchema, updateDirectorSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getAllDirectors);
router.get('/:id', getDirector);
router.post('/', validate(createDirectorSchema), createDirector);
router.put('/:id', validate(updateDirectorSchema), updateDirector);
router.delete('/:id', deleteDirector);

export default router;
