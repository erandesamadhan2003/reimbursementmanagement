import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { ApprovalRule } from '../models/ApprovalRule.js';
import { Expense } from '../models/Expense.js';
import { AuditLog } from '../models/AuditLog.js';

faker.locale = 'en_IN';

const vendors = [
  'Uber', 'Ola', 'Swiggy', 'Zomato',
  'Taj Hotel', 'Marriott', 'Indigo Airlines',
  'Air India', 'MakeMyTrip', 'IRCTC',
  'Amazon', 'Flipkart', 'Croma',
];

const categories = ['travel', 'food', 'accommodation', 'utilities', 'other'];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  await Promise.all([
    Company.deleteMany(),
    User.deleteMany(),
    ApprovalRule.deleteMany(),
    Expense.deleteMany(),
    AuditLog.deleteMany(),
  ]);

  console.log('Database cleared');

  const company = await Company.create({
    name: 'TechNova Pvt Ltd',
    country: 'India',
    currency: 'INR',
  });

  const password = 'password123';

  // ADMIN
  const admin = await User.create({
    company_id: company._id,
    fullName: 'Aarav Mehta',
    email: 'admin@technova.com',
    password,
    role: 'admin',
  });

  // MANAGERS
  const managers = await User.insertMany([
    {
      company_id: company._id,
      fullName: 'Priya Sharma',
      email: 'priya@technova.com',
      password,
      role: 'manager',
    },
    {
      company_id: company._id,
      fullName: 'Rahul Verma',
      email: 'rahul@technova.com',
      password,
      role: 'manager',
    },
    {
      company_id: company._id,
      fullName: 'Neha Gupta (CFO)',
      email: 'cfo@technova.com',
      password,
      role: 'manager',
    },
  ]);

  // EMPLOYEES (10)
  const employees = [];
  for (let i = 0; i < 10; i++) {
    employees.push({
      company_id: company._id,
      fullName: faker.person.fullName(),
      email: `emp${i}@technova.com`,
      password,
      role: 'employee',
      manager_id: managers[i % 2]._id,
      is_manager_approver: i % 3 === 0,
    });
  }

  const empList = await User.insertMany(employees);

  // RULES
  const lowRule = await ApprovalRule.create({
    company_id: company._id,
    name: 'Low Expense',
    amount_min: 0,
    amount_max: 3000,
    steps: [{ order: 0, approver_id: managers[0]._id }],
    conditional_type: 'none',
  });

  const midRule = await ApprovalRule.create({
    company_id: company._id,
    name: 'Mid Expense',
    amount_min: 3001,
    amount_max: 10000,
    steps: [
      { order: 0, approver_id: managers[0]._id },
      { order: 1, approver_id: managers[1]._id },
    ],
    conditional_type: 'percentage',
    conditional_pct: 50,
  });

  const highRule = await ApprovalRule.create({
    company_id: company._id,
    name: 'High Expense',
    amount_min: 10001,
    amount_max: null,
    steps: [
      { order: 0, approver_id: managers[0]._id },
      { order: 1, approver_id: managers[2]._id },
    ],
    conditional_type: 'hybrid',
    conditional_pct: 60,
    conditional_approver_id: managers[2]._id,
  });

  const now = new Date();

  const expenses = [];

  for (let i = 0; i < 100; i++) {
    const emp = empList[i % empList.length];
    const amount = faker.number.int({ min: 200, max: 20000 });

    const createdAt = faker.date.between({
      from: new Date(now - 60 * 86400000),
      to: now,
    });

    let status = 'pending';
    if (i % 3 === 0) status = 'approved';
    if (i % 7 === 0) status = 'rejected';

    const rule =
      amount <= 3000
        ? lowRule
        : amount <= 10000
        ? midRule
        : highRule;

    const logs = [];

    if (status === 'approved') {
      logs.push({
        approver_id: rule.steps[0].approver_id,
        step: 0,
        action: 'approved',
        timestamp: new Date(createdAt.getTime() + 6 * 3600000),
      });

      if (rule.steps[1]) {
        logs.push({
          approver_id: rule.steps[1].approver_id,
          step: 1,
          action: 'approved',
          timestamp: new Date(createdAt.getTime() + 12 * 3600000),
        });
      }
    }

    if (status === 'rejected') {
      logs.push({
        approver_id: rule.steps[0].approver_id,
        step: 0,
        action: 'rejected',
        comment: 'Policy violation',
        timestamp: new Date(createdAt.getTime() + 4 * 3600000),
      });
    }

    if (status === 'pending') {
      logs.push({
        approver_id: rule.steps[0].approver_id,
        step: 0,
        action: 'pending',
        timestamp: new Date(createdAt.getTime() + 2 * 3600000),
      });
    }

    expenses.push({
      company_id: company._id,
      employee_id: emp._id,
      amount,
      currency: i % 4 === 0 ? 'USD' : 'INR',
      company_amount: i % 4 === 0 ? amount * 83 : amount,
      category: categories[i % categories.length],
      description: `${faker.company.name()} - ${vendors[i % vendors.length]}`,
      date: createdAt,
      status,
      rule_id: rule._id,
      current_step: 0,
      approval_logs: logs,
      created_at: createdAt,
    });
  }

  const createdExpenses = await Expense.insertMany(expenses);

  // AUDIT LOGS
  const auditLogs = createdExpenses.slice(0, 30).map((exp) => ({
    company_id: company._id,
    actor_id: managers[0]._id,
    action: `expense.${exp.status}`,
    target_id: exp._id,
    meta: { amount: exp.amount },
    timestamp: exp.created_at,
  }));

  await AuditLog.insertMany(auditLogs);

  console.log('Seed completed with 100 realistic expenses');
  console.log('Login: admin@technova.com / password123');

  process.exit();
};

seed();