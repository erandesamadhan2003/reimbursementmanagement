import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Verifies JWT and attaches req.user (with company_id, role, etc.)
 */
export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or deactivated',
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

/**
 * Role guard factory. Pass allowed roles array.
 * Usage: requireRole(['admin']) or requireRole(['admin', 'manager'])
 */
export const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }
  next();
};

/**
 * Ensure all routes in this company scope are company-isolated.
 * Attaches req.company_id for convenience.
 */
export const companyScope = (req, res, next) => {
  if (!req.user?.company_id) {
    return res.status(403).json({
      success: false,
      message: 'No company associated with this account',
    });
  }
  req.company_id = req.user.company_id;
  next();
};