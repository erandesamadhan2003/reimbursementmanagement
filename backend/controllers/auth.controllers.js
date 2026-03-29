import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

export const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            authProvider: 'local'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({
                success: false,
                message: 'This email is registered with Google. Please use Google Sign-In'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

export const googleCallBack = async (req, res) => {
    const token = generateToken(req.user._id);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&userId=${req.user._id}`);
}

export const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

export const getProfile = async (req, res) => {
    return res.json({
        success: true,
        user: {
            id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            authProvider: req.user.authProvider,
            profilePicture: req.user.profilePicture
        }
    });
}


