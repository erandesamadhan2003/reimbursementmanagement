import { api, AUTH_URL, BASE_URL } from "../api/api";

/**
 * Register — POST /api/auth/signup
 * Creates Company + Admin in one request.
 * Body: { fullName, email, password, companyName, country }
 * Response: { success, token, user: { id, fullName, role, company: { name, currency } } }
 */
export const register = async (userData) => {
    try {
        const response = await api.post(AUTH_URL.REGISTER, userData);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

/**
 * Login — POST /api/auth/login
 * Body: { email, password }
 * Response: { success, token, user: { id, fullName, role, company: { name, currency } } }
 */
export const login = async (credentials) => {
    try {
        const response = await api.post(AUTH_URL.LOGIN, credentials);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

/**
 * Google OAuth — redirects browser to /api/auth/google
 * After consent, backend redirects to: FRONTEND_URL/auth/callback?token=<jwt>&userId=<id>
 */
export const googleLogin = () => {
    window.location.href = BASE_URL + AUTH_URL.GOOGLE_AUTH;
};

/**
 * Logout — JWT is stateless; there is no server-side logout endpoint.
 * Simply remove the token from localStorage and clear Redux state.
 */
export const logout = () => {
    localStorage.removeItem("token");
};

/**
 * Get current user — GET /api/auth/me
 * Response: { success, user: { id, fullName, email, role, company: { name, currency } } }
 */
export const getProfile = async () => {
    try {
        const response = await api.get(AUTH_URL.GET_PROFILE);
        return response.data;
    } catch (error) {
        console.error("Get profile error:", error);
        throw error;
    }
};

/**
 * Verify a token received via OAuth callback URL param.
 * Sets it in localStorage then fetches /auth/me to confirm it is valid.
 */
export const verifyToken = async (token) => {
    try {
        localStorage.setItem("token", token);
        const response = await getProfile();
        return response;
    } catch (error) {
        console.error("Token verification error:", error);
        localStorage.removeItem("token");
        throw error;
    }
};