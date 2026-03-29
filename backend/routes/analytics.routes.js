import express from 'express';
import {
  getSummary,
  getByCategory,
  getAuditLogs,
} from '../controllers/analytics.controllers.js';
import { authMiddleware, requireRole, companyScope } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware, companyScope, requireRole(['admin']));

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);

export default router;