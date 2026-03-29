import { api, AUTH_URL, BASE_URL } from "../api/api";

export const register = async (userData) => {
    try {
        const response = await api.post(AUTH_URL.REGISTER, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

export const login = async (credentials) => {
    try {
        const response = await api.post(AUTH_URL.LOGIN, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export const googleLogin = () => {
    window.location.href = BASE_URL + AUTH_URL.GOOGLE_AUTH;
}

export const logout = async () => {
    try {
        const response = await api.post(AUTH_URL.LOGOUT);
        localStorage.removeItem('token');
        return response.data;
    } catch (error) {
        console.error("Logout error:", error);
        localStorage.removeItem('token');
        throw error;
    }
}

export const getProfile = async () => {
    try {
        const response = await api.get(AUTH_URL.GET_PROFILE);
        return response.data;
    } catch (error) {
        console.error("Get profile error:", error);
        throw error;
    }
}

export const verifyToken = async (token) => {
    try {
        localStorage.setItem('token', token);
        const response = await getProfile();
        return response;
    } catch (error) {
        console.error("Token verification error:", error);
        localStorage.removeItem('token');
        throw error;
    }
}
