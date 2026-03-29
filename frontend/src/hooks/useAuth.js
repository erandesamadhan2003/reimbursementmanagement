import { googleLogin } from "@/services/auth.service";
import {
    clearError,
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    setCredentials,
    verifyUserToken,
} from "@/store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, token, loading, error, isAuthenticated } = useSelector(
        (state) => state.auth
    );

    // On mount authentication checks have been moved to the App.jsx AuthInit wrapper
    // to prevent router guard deadlocks.

    const register = async (userData) => {
        try {
            const result = await dispatch(registerUser(userData)).unwrap();
            if (result.user?.role === "admin") {
                navigate("/admin");
            } else if (result.user?.role === "manager") {
                navigate("/manager");
            } else {
                navigate("/dashboard");
            }
            return result;
        } catch (err) {
            console.error("Registration error:", err);
            throw err;
        }
    };

    const login = async (credentials) => {
        try {
            const result = await dispatch(loginUser(credentials)).unwrap();
            if (result.user?.role === "admin") {
                navigate("/admin");
            } else if (result.user?.role === "manager") {
                navigate("/manager");
            } else {
                navigate("/dashboard");
            }
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
            setTimeout(() => {
                if (result.user?.role === "admin") {
                    navigate("/admin");
                } else if (result.user?.role === "manager") {
                    navigate("/manager");
                } else {
                    navigate("/dashboard");
                }
            }, 100);
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