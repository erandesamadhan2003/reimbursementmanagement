import mongoose from 'mongoose';

const approvalLogSchema = new mongoose.Schema(
  {
    approver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    step: { type: Number, required: true },
    action: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'overridden'],
      default: 'pending',
    },
    comment: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
  },
  // Converted amount in company currency at time of submission
  company_amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['travel', 'food', 'accommodation', 'utilities', 'other'],
    required: [true, 'Category is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Expense date is required'],
  },
  receipt_url: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  // Matched rule snapshot reference
  rule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule',
    default: null,
  },
  // Index into rule.steps currently awaiting (-1 = manager step-0)
  current_step: {
    type: Number,
    default: 0,
  },
  // Tracks step-0 manager pre-approval separately
  manager_approved: {
    type: Boolean,
    default: false,
  },
  approval_logs: {
    type: [approvalLogSchema],
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Virtual: resolution time in hours
expenseSchema.virtual('resolution_hours').get(function () {
  if (this.status === 'pending') return null;
  const lastLog = this.approval_logs[this.approval_logs.length - 1];
  if (!lastLog) return null;
  return Math.round(
    (lastLog.timestamp - this.created_at) / (1000 * 60 * 60)
  );
});

export const Expense = mongoose.model('Expense', expenseSchema);