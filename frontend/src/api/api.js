import axios from "axios";

export const BASE_URL = "http://localhost:3000/api";

export const AUTH_URL = {
    // POST /api/auth/signup  → creates Company + Admin, returns { success, token, user }
    REGISTER: `/auth/signup`,
    // POST /api/auth/login   → returns { success, token, user }
    LOGIN: `/auth/login`,
    // GET  /api/auth/google  → redirects to Google OAuth consent
    GOOGLE_AUTH: `/auth/google`,
    // GET  /api/auth/me      → returns current user + company from JWT
    GET_PROFILE: `/auth/me`,
    // No server-side logout endpoint — JWT is stateless; logout is client-side only
    // (remove token from localStorage + clear Redux state)
};

export const USER_URL = {
    CREATE: `/users`,
    LIST: `/users`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
};

export const EXPENSE_URL = {
    CREATE: `/expenses`,
    LIST: `/expenses`,
    GET_BY_ID: (id) => `/expenses/${id}`,
    APPROVE: (id) => `/expenses/${id}/approve`,
    REJECT: (id) => `/expenses/${id}/reject`,
    OVERRIDE: (id) => `/expenses/${id}/override`,
    OCR: `/expenses/ocr`,
};

export const RULE_URL = {
    CREATE: `/rules`,
    LIST: `/rules`,
    UPDATE: (id) => `/rules/${id}`,
    DELETE: (id) => `/rules/${id}`,
};

export const ANALYTICS_URL = {
    SUMMARY: `/analytics/summary`,
    BY_CATEGORY: `/analytics/by-category`,
};

export const AUDIT_URL = {
    LIST: `/audit`,
};

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    break;
                case 403:
                    console.error("Access forbidden");
                    break;
                case 404:
                    console.error("Resource not found");
                    break;
                case 500:
                    console.error("Server error");
                    break;
                default:
                    console.error("An error occurred:", error.response?.data?.message);
            }
        } else if (error.request) {
            console.error("Network error - no response from server");
        } else {
            console.error("Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export { api };