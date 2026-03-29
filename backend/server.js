import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import { configurePassport } from './config/passport.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Authentication Server is running',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      googleAuth: 'GET /api/auth/google',
      getMe: 'GET /api/auth/me',
      logout: 'POST /api/auth/logout'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});