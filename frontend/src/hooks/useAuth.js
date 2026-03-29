import { googleLogin } from "@/services/auth.service";
import { clearError, getCurrentUser, loginUser, logoutUser, registerUser, setCredentials, verifyUserToken } from "@/store/slices/authSlice";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router";

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const hasCheckedAuth = useRef(false);

    const { user, token, loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !user && !hasCheckedAuth.current) {
            hasCheckedAuth.current = true;
            dispatch(getCurrentUser());
        }
    }, []);

    const register = async (userData) => {
        try {
            const result = await dispatch(registerUser(userData)).unwrap();
            navigate('/dashboard');
            return result;
        } catch (err) {
            console.error('Registration error:', err);
            throw err;
        }
    }

    const login = async (credentials) => {
        try {
            const result = await dispatch(loginUser(credentials)).unwrap();
            navigate('/dashboard');
            return result;
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        }
    }

    const logout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
            // Navigate to login even if logout fails
            navigate('/login');
        }
    }

    const googleLoginHandler = () => {
        googleLogin();
    }

    const verifyAuthToken = async (token) => {
        try {
            // First set the token in localStorage
            localStorage.setItem('token', token);

            // Then fetch user data with the token
            const result = await dispatch(verifyUserToken(token)).unwrap();

            // Ensure credentials are properly set
            dispatch(setCredentials({
                user: result.user,
                token: token
            }));

            // Small delay to ensure state is updated
            setTimeout(() => {
                navigate('/dashboard');
            }, 100);

            return result;
        } catch (err) {
            navigate('/login');
            console.error('Token verification error:', err);
            throw err;
        }
    }

    const fetchCurrentUser = async () => {
        try {
            const result = await dispatch(getCurrentUser()).unwrap();
            return result;
        } catch (err) {
            console.error('Fetch current user error:', err);
            throw err;
        }
    }

    const clearAuthError = () => {
        dispatch(clearError())
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,

        register,
        login,
        logout,
        googleLoginHandler,
        verifyAuthToken,
        fetchCurrentUser,
        clearAuthError
    }
}