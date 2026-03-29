import axios from "axios";

export const BASE_URL = "http://localhost:3000/api";

export const AUTH_URL = {
    REGISTER: `/auth/register`,
    LOGIN: `/auth/login`,
    GOOGLE_AUTH: `/auth/google`,
    GET_PROFILE: `/auth/profile`,
    LOGOUT: `/auth/logout`,
}

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('Access forbidden');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('An error occurred:', error.response.data.message);
            }
        } else if (error.request) {
            console.error('Network error - no response from server');
        } else {
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export { api };

