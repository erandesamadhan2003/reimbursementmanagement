import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  actor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    // e.g. 'expense.approved', 'user.role_changed', 'expense.overridden'
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);