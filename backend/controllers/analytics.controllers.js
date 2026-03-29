import { Expense } from '../models/Expense.js';
import { AuditLog } from '../models/AuditLog.js';

/**
 * GET /api/analytics/summary
 * Admin: overall expense stats for company.
 */
export const getSummary = async (req, res) => {
  try {
    const companyId = req.company_id;

    const [pending, approved, rejected] = await Promise.all([
      Expense.find({ company_id: companyId, status: 'pending' }),
      Expense.find({ company_id: companyId, status: 'approved' }),
      Expense.find({ company_id: companyId, status: 'rejected' }),
    ]);

    const total_pending_amount = pending.reduce((sum, e) => sum + e.company_amount, 0);
    const total_approved_amount = approved.reduce((sum, e) => sum + e.company_amount, 0);

    // Average resolution hours for resolved expenses
    let avg_resolution_hours = 0;
    const resolved = [...approved, ...rejected].filter(
      (e) => e.approval_logs && e.approval_logs.length > 0
    );

    if (resolved.length > 0) {
      const totalHours = resolved.reduce((sum, e) => {
        const lastLog = e.approval_logs[e.approval_logs.length - 1];
        const hours = (lastLog.timestamp - e.created_at) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avg_resolution_hours = Math.round(totalHours / resolved.length);
    }

    const total = pending.length + approved.length + rejected.length;
    const approval_rate =
      total > 0 ? Math.round((approved.length / total) * 100) : 0;

    return res.json({
      success: true,
      data: {
        summary: {
          count_pending: pending.length,
          count_approved: approved.length,
          count_rejected: rejected.length,
          total_expenses: total,
          total_pending_amount: Math.round(total_pending_amount * 100) / 100,
          total_approved_amount: Math.round(total_approved_amount * 100) / 100,
          approval_rate,
          avg_resolution_hours,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/analytics/by-category
 * Admin: expense totals and counts grouped by category.
 */
export const getByCategory = async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $match: { company_id: req.user.company_id } },
      {
        $group: {
          _id: '$category',
          total_amount: { $sum: '$company_amount' },
          count: { $sum: 1 },
          pending_count: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          approved_count: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          rejected_count: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
          },
        },
      },
      { $sort: { total_amount: -1 } },
    ]);

    return res.json({
      success: true,
      data: {
        by_category: result.map((r) => ({
          category: r._id,
          total_amount: Math.round(r.total_amount * 100) / 100,
          count: r.count,
          pending_count: r.pending_count,
          approved_count: r.approved_count,
          rejected_count: r.rejected_count,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/audit
 * Admin: list all audit logs for company.
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await AuditLog.countDocuments({ company_id: req.company_id });
    const logs = await AuditLog.find({ company_id: req.company_id })
      .populate('actor_id', 'fullName email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        logs,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};