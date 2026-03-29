import express from 'express';
import passport from 'passport';
import {
  signup,
  login,
  getMe,
  googleCallBack,
  logout,
} from '../controllers/auth.controllers.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { changePassword } from '../controllers/auth.controllers.js';

const router = express.Router();

// Public
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false,
  }),
  googleCallBack
);

// Protected
router.get('/me', authMiddleware, getMe);
router.patch('/change-password', authMiddleware, changePassword);
router.post('/logout', authMiddleware, logout);

export default router;