import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    default: 'USD',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const Company = mongoose.model('Company', companySchema);