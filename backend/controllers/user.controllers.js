import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import bcrypt from 'bcryptjs';

/**
 * POST /api/users
 * Admin creates an employee or manager within their company.
 * Body: { fullName, email, password, role, manager_id?, is_manager_approver? }
 */
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, manager_id, is_manager_approver } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, password, and role are required',
      });
    }

    if (!['employee', 'manager'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either employee or manager',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Validate manager_id belongs to same company if provided
    if (manager_id) {
      const manager = await User.findOne({
        _id: manager_id,
        company_id: req.company_id,
        role: 'manager',
        is_active: true,
      });
      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager_id — must be a manager in your company',
        });
      }
    }

    const newUser = await User.create({
      company_id: req.company_id,
      fullName,
      email,
      password,
      role,
      manager_id: manager_id || null,
      is_manager_approver: is_manager_approver ?? false,
      authProvider: 'local',
    });

    await AuditLog.create({
      company_id: req.company_id,
      actor_id: req.user._id,
      action: 'user.created',
      target_id: newUser._id,
      meta: { role, email },
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: sanitizeUser(newUser) },
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/users
 * Admin lists all users in their company.
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ company_id: req.company_id, is_active: true })
      .select('-password')
      .populate('manager_id', 'fullName email role')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: { users } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/users/:id
 * Admin updates role, manager_id, or is_manager_approver.
 */
export const updateUser = async (req, res) => {
  try {
    const { role, manager_id, is_manager_approver } = req.body;
    const targetUser = await User.findOne({
      _id: req.params.id,
      company_id: req.company_id,
      is_active: true,
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (targetUser._id.toString() === req.user._id.toString() && role) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot change their own role',
      });
    }

    const meta = { old: {}, new: {} };

    if (role && ['employee', 'manager'].includes(role)) {
      meta.old.role = targetUser.role;
      meta.new.role = role;
      targetUser.role = role;
    }

    if (manager_id !== undefined) {
      if (manager_id) {
        const manager = await User.findOne({
          _id: manager_id,
          company_id: req.company_id,
          role: 'manager',
          is_active: true,
        });
        if (!manager) {
          return res.status(400).json({
            success: false,
            message: 'Invalid manager_id',
          });
        }
      }
      meta.old.manager_id = targetUser.manager_id;
      meta.new.manager_id = manager_id;
      targetUser.manager_id = manager_id || null;
    }

    if (is_manager_approver !== undefined) {
      meta.old.is_manager_approver = targetUser.is_manager_approver;
      meta.new.is_manager_approver = is_manager_approver;
      targetUser.is_manager_approver = is_manager_approver;
    }

    await targetUser.save();

    await AuditLog.create({
      company_id: req.company_id,
      actor_id: req.user._id,
      action: 'user.role_changed',
      target_id: targetUser._id,
      meta,
    });

    return res.json({
      success: true,
      message: 'User updated successfully',
      user: sanitizeUser(targetUser),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/users/:id
 * Soft delete (sets is_active = false).
 */
export const deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findOne({
      _id: req.params.id,
      company_id: req.company_id,
      is_active: true,
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    targetUser.is_active = false;
    await targetUser.save();

    await AuditLog.create({
      company_id: req.company_id,
      actor_id: req.user._id,
      action: 'user.deactivated',
      target_id: targetUser._id,
      meta: { email: targetUser.email },
    });

    return res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};