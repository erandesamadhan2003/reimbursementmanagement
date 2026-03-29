// services/approvalOrchestrator.js
// Core approval state machine. Called after expense creation and after each approve action.

import { ApprovalRule } from '../models/ApprovalRule.js';
import { Expense } from '../models/Expense.js';

/**
 * Find the best matching rule for an expense.
 * Matches by company, amount range (in company currency), and category (or null=all).
 * Returns the most specific (highest amount_min) rule.
 */
async function findMatchingRule(expense) {
  const query = {
    company_id: expense.company_id,
    amount_min: { $lte: expense.company_amount },
    $or: [
      { amount_max: null },
      { amount_max: { $gte: expense.company_amount } },
    ],
  };

  // Prefer category-specific rule over catch-all
  const categoryRule = await ApprovalRule.findOne({
    ...query,
    category: expense.category,
  }).sort({ amount_min: -1 });

  if (categoryRule) return categoryRule;

  const genericRule = await ApprovalRule.findOne({
    ...query,
    category: null,
  }).sort({ amount_min: -1 });

  return genericRule;
}

/**
 * Initiate approval flow after expense is created.
 * Mutates expense document. Caller must save.
 * @param {Expense} expense - unsaved expense document
 * @param {User} employee - the submitting employee (with manager_id, is_manager_approver)
 */
export async function initiateApproval(expense, employee) {
  const rule = await findMatchingRule(expense);

  if (!rule) {
    // No matching rule — auto approve
    expense.status = 'approved';
    expense.approval_logs.push({
      approver_id: employee._id,
      step: 0,
      action: 'approved',
      comment: 'Auto-approved: no matching rule',
      timestamp: new Date(),
    });
    return;
  }

  expense.rule_id = rule._id;
  const sortedSteps = [...rule.steps].sort((a, b) => a.order - b.order);

  // Inject manager as step-0 if is_manager_approver is true
  if (employee.manager_id && employee.is_manager_approver) {
    expense.current_step = -1; // -1 = manager pre-approval step
    expense.approval_logs.push({
      approver_id: employee.manager_id,
      step: -1,
      action: 'pending',
      timestamp: new Date(),
    });
  } else {
    const firstStep = sortedSteps[0];
    expense.current_step = firstStep.order;
    expense.approval_logs.push({
      approver_id: firstStep.approver_id,
      step: firstStep.order,
      action: 'pending',
      timestamp: new Date(),
    });
  }
}

/**
 * Check conditional rule satisfaction and determine if expense should be auto-approved.
 * @param {ApprovalRule} rule
 * @param {Array} approvalLogs - current approval_logs from expense
 * @returns {boolean}
 */
export function checkConditional(rule, approvalLogs) {
  const approvedLogs = approvalLogs.filter((l) => l.action === 'approved');
  const total = rule.steps.length;

  switch (rule.conditional_type) {
    case 'percentage':
      return (approvedLogs.length / total) * 100 >= rule.conditional_pct;

    case 'specific':
      return approvedLogs.some(
        (l) =>
          l.approver_id.toString() ===
          rule.conditional_approver_id.toString()
      );

    case 'hybrid': {
      const pctMet =
        (approvedLogs.length / total) * 100 >= rule.conditional_pct;
      const keyMet = approvedLogs.some(
        (l) =>
          l.approver_id.toString() ===
          rule.conditional_approver_id.toString()
      );
      return pctMet || keyMet;
    }

    case 'none':
    default:
      // Sequential: all steps must be approved
      return approvedLogs.length >= total;
  }
}

/**
 * Advance the approval chain after a step is approved.
 * Mutates expense. Caller must save.
 * @param {Expense} expense - populated with rule
 * @param {ApprovalRule} rule
 */
export async function advanceApproval(expense, rule) {
  const sortedSteps = [...rule.steps].sort((a, b) => a.order - b.order);

  // Check conditional satisfaction first (for percentage/specific/hybrid)
  const nonPendingLogs = expense.approval_logs.filter(
    (l) => l.action === 'approved'
  );

  if (rule.conditional_type !== 'none' && checkConditional(rule, expense.approval_logs)) {
    expense.status = 'approved';
    return;
  }

  // Find next step in sequence
  const currentOrder = expense.current_step;
  const nextStep = sortedSteps.find((s) => s.order > currentOrder);

  if (!nextStep) {
    // All steps completed sequentially — fully approved
    expense.status = 'approved';
    return;
  }

  // Advance to next step
  expense.current_step = nextStep.order;
  expense.approval_logs.push({
    approver_id: nextStep.approver_id,
    step: nextStep.order,
    action: 'pending',
    timestamp: new Date(),
  });
}