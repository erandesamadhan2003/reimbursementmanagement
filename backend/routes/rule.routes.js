import express from 'express';
import {
  createRule,
  getRules,
  updateRule,
  deleteRule,
} from '../controllers/rule.controllers.js';
import { authMiddleware, requireRole, companyScope } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware, companyScope, requireRole(['admin']));

router.post('/', createRule);
router.get('/', getRules);
router.patch('/:id', updateRule);
router.delete('/:id', deleteRule);

export default router;