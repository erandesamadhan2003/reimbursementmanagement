import { ApprovalRule } from '../models/ApprovalRule.js';
import { User } from '../models/User.js';

/**
 * POST /api/rules
 * Admin creates a new approval rule.
 */
export const createRule = async (req, res) => {
  try {
    const {
      name,
      amount_min,
      amount_max,
      category,
      steps,
      conditional_type,
      conditional_pct,
      conditional_approver_id,
    } = req.body;

    if (!name || amount_min === undefined || !steps || steps.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'name, amount_min, and steps are required',
      });
    }

    // Validate step orders are unique and sequential starting from 0
    const orders = steps.map((s) => s.order);
    if (new Set(orders).size !== orders.length) {
      return res.status(400).json({
        success: false,
        message: 'Step orders must be unique',
      });
    }

    // Validate all approver_ids belong to this company
    const approverIds = steps.map((s) => s.approver_id);
    const validApprovers = await User.countDocuments({
      _id: { $in: approverIds },
      company_id: req.company_id,
      is_active: true,
    });

    if (validApprovers !== approverIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more approver_ids are invalid for this company',
      });
    }

    // Validate conditional logic
    if (
      (conditional_type === 'percentage' || conditional_type === 'hybrid') &&
      !conditional_pct
    ) {
      return res.status(400).json({
        success: false,
        message: 'conditional_pct is required for percentage/hybrid rules',
      });
    }

    if (
      (conditional_type === 'specific' || conditional_type === 'hybrid') &&
      !conditional_approver_id
    ) {
      return res.status(400).json({
        success: false,
        message: 'conditional_approver_id is required for specific/hybrid rules',
      });
    }

    const rule = await ApprovalRule.create({
      company_id: req.company_id,
      name,
      amount_min,
      amount_max: amount_max ?? null,
      category: category ?? null,
      steps: steps.sort((a, b) => a.order - b.order),
      conditional_type: conditional_type || 'none',
      conditional_pct: conditional_pct ?? null,
      conditional_approver_id: conditional_approver_id ?? null,
    });

    const populated = await ApprovalRule.findById(rule._id)
      .populate('steps.approver_id', 'fullName email role')
      .populate('conditional_approver_id', 'fullName email role');

    return res.status(201).json({ success: true, data: { rule: populated } });
  } catch (error) {
    console.error('createRule error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/rules
 * Admin lists all rules for their company.
 */
export const getRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company_id: req.company_id })
      .populate('steps.approver_id', 'fullName email role')
      .populate('conditional_approver_id', 'fullName email role')
      .sort({ amount_min: 1 });

    return res.json({ success: true, data: { rules } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/rules/:id
 * Admin updates a rule. Only affects new expenses.
 */
export const updateRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findOne({
      _id: req.params.id,
      company_id: req.company_id,
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    const allowed = [
      'name', 'amount_min', 'amount_max', 'category',
      'steps', 'conditional_type', 'conditional_pct', 'conditional_approver_id',
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        rule[key] = req.body[key];
      }
    }

    if (req.body.steps) {
      const orders = req.body.steps.map((s) => s.order);
      if (new Set(orders).size !== orders.length) {
        return res.status(400).json({
          success: false,
          message: 'Step orders must be unique',
        });
      }
      rule.steps = req.body.steps.sort((a, b) => a.order - b.order);
    }

    await rule.save();

    const populated = await ApprovalRule.findById(rule._id)
      .populate('steps.approver_id', 'fullName email role')
      .populate('conditional_approver_id', 'fullName email role');

    return res.json({ success: true, data: { rule: populated } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/rules/:id
 * Admin deletes a rule. In-flight expenses keep their rule snapshot.
 */
export const deleteRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findOneAndDelete({
      _id: req.params.id,
      company_id: req.company_id,
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    return res.json({ success: true, message: 'Rule deleted successfully', data: {} });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};