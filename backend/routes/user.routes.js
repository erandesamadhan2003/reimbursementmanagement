import express from 'express';
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/user.controllers.js';
import { authMiddleware, requireRole, companyScope } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user management routes: must be authenticated, admin, and company-scoped
router.use(authMiddleware, companyScope, requireRole(['admin']));

router.post('/', createUser);
router.get('/', getUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;