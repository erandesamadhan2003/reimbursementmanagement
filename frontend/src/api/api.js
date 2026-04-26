import axios from "axios";

export const BASE_URL = "/api";

export const AUTH_URL = {
    REGISTER: `/auth/signup`,
    LOGIN: `/auth/login`,
    GOOGLE_AUTH: `/auth/google`,
    GET_PROFILE: `/auth/me`,
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