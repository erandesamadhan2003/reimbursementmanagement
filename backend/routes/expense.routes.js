import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  approveExpense,
  rejectExpense,
  overrideExpense,
} from '../controllers/expense.controllers.js';
import { scanReceipt, upload } from '../controllers/ocr.controllers.js';
import { authMiddleware, requireRole, companyScope } from '../middleware/auth.middleware.js';

const router = express.Router();

// All expense routes require auth + company scope
router.use(authMiddleware, companyScope);

// OCR — employee only, before /:id routes to avoid conflict
router.post(
  '/ocr',
  requireRole(['employee']),
  upload.single('receipt'),
  scanReceipt
);

// CRUD
router.post('/', requireRole(['employee']), createExpense);
router.get('/', getExpenses); // all roles, filtered inside controller
router.get('/:id', getExpenseById); // all roles, filtered inside controller

// Approval actions
router.patch(
  '/:id/approve',
  requireRole(['manager', 'admin']),
  approveExpense
);
router.patch(
  '/:id/reject',
  requireRole(['manager', 'admin']),
  rejectExpense
);
router.patch(
  '/:id/override',
  requireRole(['admin']),
  overrideExpense
);

export default router;