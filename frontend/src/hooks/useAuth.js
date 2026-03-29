import { googleLogin } from "@/services/auth.service";
import {
    clearError,
    clearCredentials,
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    setCredentials,
    verifyUserToken,
} from "@/store/slices/authSlice";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const hasCheckedAuth = useRef(false);

    const { user, token, loading, error, isAuthenticated } = useSelector(
        (state) => state.auth
    );

    // On mount: if token exists in localStorage but user not in state, re-hydrate
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken && !user && !hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            dispatch(getCurrentUser());
        }
    }, []);

    const register = async (userData) => {
        try {
            const result = await dispatch(registerUser(userData)).unwrap();
            navigate("/dashboard");
            return result;
        } catch (err) {
            console.error("Registration error:", err);
            throw err;
        }
    };

    const login = async (credentials) => {
        try {
            const result = await dispatch(loginUser(credentials)).unwrap();
            navigate("/dashboard");
            return result;
        } catch (err) {
            console.error("Login error:", err);
            throw err;
        }
    };

    const logout = async () => {
        // logoutUser is synchronous (no API call) — it always succeeds
        await dispatch(logoutUser());
        navigate("/login");
    };

    const googleLoginHandler = () => {
        googleLogin();
    };

    /**
     * Used by AuthCallback page after OAuth redirect
     * Verifies the token received in URL params and navigates to dashboard
     */
    const verifyAuthToken = async (token) => {
        try {
            localStorage.setItem("token", token);
            const result = await dispatch(verifyUserToken(token)).unwrap();
            dispatch(setCredentials({ user: result.user, token }));
            setTimeout(() => navigate("/dashboard"), 100);
            return result;
        } catch (err) {
            navigate("/login");
            console.error("Token verification error:", err);
            throw err;
        }
    };

    const fetchCurrentUser = async () => {
        try {
            return await dispatch(getCurrentUser()).unwrap();
        } catch (err) {
            console.error("Fetch current user error:", err);
            throw err;
        }
    };

    const clearAuthError = () => dispatch(clearError());

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        // Role helpers
        isAdmin: user?.role === "admin",
        isManager: user?.role === "manager",
        isEmployee: user?.role === "employee",
        // Actions
        register,
        login,
        logout,
        googleLoginHandler,
        verifyAuthToken,
        fetchCurrentUser,
        clearAuthError,
    };
};