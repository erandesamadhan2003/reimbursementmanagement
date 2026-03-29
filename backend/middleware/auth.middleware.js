import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
export const authMiddleware = async (req, res, next) => {
    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');

        if(!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found, authorization denied'
            });
        }
        
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
}

