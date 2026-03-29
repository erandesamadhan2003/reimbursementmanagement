import express from 'express';
import { getAuditLogs } from '../controllers/analytics.controllers.js';
import { authMiddleware, requireRole, companyScope } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware, companyScope, requireRole(['admin']));

router.get('/', getAuditLogs);

export default router;