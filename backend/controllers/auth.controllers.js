import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Company } from "../models/Company.js";
import { getCurrencyForCountry } from "../utils/currency.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      company_id: user.company_id?.toString?.() ?? user.company_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
};

const userPublic = (user, company = null) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  company_id: user.company_id,
  manager_id: user.manager_id,
  is_manager_approver: user.is_manager_approver,
  authProvider: user.authProvider,
  profilePicture: user.profilePicture,
  ...(company && {
    company: {
      id: company._id,
      name: company.name,
      country: company.country,
      currency: company.currency,
    },
  }),
});

/**
 * POST /api/auth/signup
 * Creates Company + Admin user in one go.
 * Body: { fullName, email, password, companyName, country }
 */
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, companyName, country } = req.body;

    if (!fullName || !email || !password || !companyName || !country) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide fullName, email, password, companyName, and country",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Fetch currency from restcountries API
    const currency = await getCurrencyForCountry(country);

    // Create company
    const company = await Company.create({
      name: companyName,
      country,
      currency,
    });

    // Create admin user
    const admin = await User.create({
      company_id: company._id,
      fullName,
      email,
      password,
      role: "admin",
      authProvider: "local",
    });

    const token = generateToken(admin);

    return res.status(201).json({
      success: true,
      message: "Company and admin account created successfully",
      token,
      user: userPublic(admin, company),
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during signup",
    });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email, is_active: true });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message:
          "This email is registered with Google. Please use Google Sign-In",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const company = user.company_id
      ? await Company.findById(user.company_id)
      : null;

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: userPublic(user, company),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const company = req.user.company_id
      ? await Company.findById(req.user.company_id)
      : null;

    return res.json({
      success: true,
      data: { user: userPublic(req.user, company) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Google OAuth callback — generates JWT and redirects to frontend
 */
export const googleCallBack = async (req, res) => {
  const token = generateToken(req.user);
  res.redirect(
    `${process.env.FRONTEND_URL}/auth/callback?token=${token}&userId=${req.user._id}`,
  );
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user || !user.is_active) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "Password change not allowed for Google accounts",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent same password reuse
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be same as current password",
      });
    }

    // Update password (auto-hashed via pre-save hook)
    user.password = newPassword;
    await user.save();

    // Safe user response (no password)
    const userSafe = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      manager_id: user.manager_id,
      is_manager_approver: user.is_manager_approver,
      authProvider: user.authProvider,
      profilePicture: user.profilePicture,
    };

    return res.json({
      success: true,
      message: "Password updated successfully",
      user: userSafe,
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  return res.json({ success: true, message: "Logout successful" });
};
