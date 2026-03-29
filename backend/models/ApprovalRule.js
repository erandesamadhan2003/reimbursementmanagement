import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    approver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: { type: String, default: '' },
  },
  { _id: false }
);

const approvalRuleSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true,
  },
  amount_min: {
    type: Number,
    required: true,
    min: 0,
  },
  // null means no upper limit
  amount_max: {
    type: Number,
    default: null,
  },
  // null = applies to all categories
  category: {
    type: String,
    enum: ['travel', 'food', 'accommodation', 'utilities', 'other', null],
    default: null,
  },
  steps: {
    type: [stepSchema],
    validate: {
      validator: function (steps) {
        if (!steps || steps.length === 0) return false;
        const orders = steps.map((s) => s.order);
        return new Set(orders).size === orders.length; // unique orders
      },
      message: 'Step orders must be unique',
    },
  },
  conditional_type: {
    type: String,
    enum: ['none', 'percentage', 'specific', 'hybrid'],
    default: 'none',
  },
  conditional_pct: {
    type: Number,
    default: null,
  },
  conditional_approver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const ApprovalRule = mongoose.model('ApprovalRule', approvalRuleSchema);