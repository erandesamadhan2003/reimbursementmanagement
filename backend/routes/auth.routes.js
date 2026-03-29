import express from 'express';
import { getProfile, googleCallBack, login, logout, register } from '../controllers/auth.controllers.js';
import passport from 'passport';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'  
}));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login`, session: false }), googleCallBack);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', authMiddleware, logout);

export default router;