import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser, changePassword } from '../controllers/users.controller.js';
import { validate, createUserSchema, changePasswordSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/me/change-password', validate(changePasswordSchema), changePassword);

export default router;
