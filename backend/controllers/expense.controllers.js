import { Expense } from '../models/Expense.js';
import { Company } from '../models/Company.js';
import { ApprovalRule } from '../models/ApprovalRule.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { convertAmount } from '../utils/currency.js';
import { initiateApproval, advanceApproval } from '../services/approvalOrchestrator.js';

/**
 * POST /api/expenses
 * Employee submits an expense.
 */
export const createExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date, receipt_url } = req.body;

    if (!amount || !currency || !category || !description || !date) {
      return res.status(400).json({
        success: false,
        message: 'amount, currency, category, description, and date are required',
      });
    }

    if (new Date(date) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expense date cannot be in the future',
      });
    }

    const company = await Company.findById(req.company_id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Convert to company currency
    const company_amount = await convertAmount(amount, currency, company.currency);

    const expense = new Expense({
      company_id: req.company_id,
      employee_id: req.user._id,
      amount,
      currency: currency.toUpperCase(),
      company_amount,
      category,
      description,
      date: new Date(date),
      receipt_url: receipt_url || null,
    });

    // Run approval orchestrator
    await initiateApproval(expense, req.user);
    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate('employee_id', 'fullName email')
      .populate('rule_id', 'name')
      .populate('approval_logs.approver_id', 'fullName email role');

    return res.status(201).json({
      success: true,
      message: 'Expense submitted successfully',
      data: { expense: populated },
    });
  } catch (error) {
    console.error('createExpense error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/expenses
 * Role-filtered:
 *   employee → own expenses
 *   manager  → expenses where they are a current pending approver
 *   admin    → all company expenses
 * Query: ?status=pending|approved|rejected&page=1&limit=20
 */
export const getExpenses = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { company_id: req.company_id };

    if (status) filter.status = status;

    if (req.user.role === 'employee') {
      filter.employee_id = req.user._id;
    } else if (req.user.role === 'manager') {
      // Manager sees expenses where they have a pending approval log
      filter['approval_logs'] = {
        $elemMatch: { approver_id: req.user._id, action: 'pending' },
      };
    }
    // admin: no additional filter

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .populate('employee_id', 'fullName email')
      .populate('rule_id', 'name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        expenses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/expenses/:id
 * Full expense detail with approval_logs timeline.
 */
export const getExpenseById = async (req, res) => {
  try {
    const filter = { _id: req.params.id, company_id: req.company_id };

    // Employee can only see their own
    if (req.user.role === 'employee') {
      filter.employee_id = req.user._id;
    }

    const expense = await Expense.findOne(filter)
      .populate('employee_id', 'fullName email role')
      .populate('rule_id')
      .populate('approval_logs.approver_id', 'fullName email role');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    return res.json({ success: true, data: { expense } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/expenses/:id/approve
 * Manager or Admin approves current step.
 * Body: { comment? }
 */
export const approveExpense = async (req, res) => {
  try {
    const { comment } = req.body;
    const expense = await Expense.findOne({
      _id: req.params.id,
      company_id: req.company_id,
      status: 'pending',
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or not in pending status',
      });
    }

    // Verify this user is the current pending approver
    const pendingLog = expense.approval_logs.find(
      (l) =>
        l.action === 'pending' &&
        l.approver_id.toString() === req.user._id.toString()
    );

    if (!pendingLog && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not the current approver for this expense',
      });
    }

    // Log the approval
    if (pendingLog) {
      pendingLog.action = 'approved';
      pendingLog.comment = comment || '';
      pendingLog.timestamp = new Date();
    }

    // Handle manager step-0 separately
    if (expense.current_step === -1) {
      expense.manager_approved = true;
      // Find the rule and advance to first rule step
      if (expense.rule_id) {
        const rule = await ApprovalRule.findById(expense.rule_id);
        if (rule) {
          const sortedSteps = [...rule.steps].sort((a, b) => a.order - b.order);
          const firstStep = sortedSteps[0];
          expense.current_step = firstStep.order;
          expense.approval_logs.push({
            approver_id: firstStep.approver_id,
            step: firstStep.order,
            action: 'pending',
            timestamp: new Date(),
          });
        } else {
          expense.status = 'approved';
        }
      } else {
        expense.status = 'approved';
      }
    } else if (expense.rule_id) {
      const rule = await ApprovalRule.findById(expense.rule_id);
      if (rule) {
        await advanceApproval(expense, rule);
      } else {
        expense.status = 'approved';
      }
    } else {
      expense.status = 'approved';
    }

    await expense.save();

    await AuditLog.create({
      company_id: req.company_id,
      actor_id: req.user._id,
      action: 'expense.approved',
      target_id: expense._id,
      meta: { step: pendingLog?.step, comment },
    });

    const populated = await Expense.findById(expense._id)
      .populate('employee_id', 'fullName email')
      .populate('approval_logs.approver_id', 'fullName email role');

    return res.json({
      success: true,
      message: expense.status === 'approved'
        ? 'Expense fully approved'
        : 'Step approved, awaiting next approver',
      data: { expense: populated },
    });
  } catch (error) {
    console.error('approveExpense error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/expenses/:id/reject
 * Manager or Admin rejects. Comment required.
 */
export const rejectExpense = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A comment is required when rejecting an expense',
      });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      company_id: req.company_id,
      status: 'pending',
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or not in pending status',
      });
    }

    // Verify this user is a pending approver (or admin)
    const pendingLog = expense.approval_logs.find(
      (l) =>
        l.action === 'pending' &&
        l.approver_id.toString() === req.user._id.toString()
    );

    if (!pendingLog && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not the current approver for this expense',
      });
    }

    if (pendingLog) {
      pendingLog.action = 'rejected';
      pendingLog.comment = comment;
      pendingLog.timestamp = new Date();
    }

    expense.status = 'rejected';
    await expense.save();

    await AuditLog.create({
      company_id: req.company_id,
      actor_id: req.user._id,
      action: 'expense.rejected',
      target_id: expense._id,
      meta: { comment },
    });

    const populated = await Expense.findById(expense._id)
      .populate('employee_id', 'fullName email')
      .populate('approval_logs.approver_id', 'fullName email role');

    return res.json({
      success: true,
      message: 'Expense rejected',
      data: { expense: populated },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/expenses/:id/override
 * Admin force-approves regardless of remaining steps.
 */
export const overrideExpense = async (req, res) => {
  try {
    const { comment } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      company_id: req.company_id,
      status: 'pending',
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or already resolved',
      });
    }

    // Mark all remaining pending logs as overridden
    expense.approval_logs.forEach((log) => {
      if (log.action === 'pending') {
        log.action = 'overridden';
        log.comment = comment || 'Admin override';
        log.timestamp = new Date();
      }
    });

    expense.status = 'approved';
    await expense.save();

    await AuditLog.create({
      company_id: req.company_id,
      actor_id: req.user._id,
      action: 'expense.overridden',
      target_id: expense._id,
      meta: { comment: comment || 'Admin override' },
    });

    const populated = await Expense.findById(expense._id)
      .populate('employee_id', 'fullName email')
      .populate('approval_logs.approver_id', 'fullName email role');

    return res.json({
      success: true,
      message: 'Expense force-approved by admin',
      data: { expense: populated },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};