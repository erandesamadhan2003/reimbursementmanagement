import { getProfile, login, logout, register, verifyToken } from "@/services/auth.service";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
};

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (userData, { rejectWithValue }) => {
        try {
            // POST /api/auth/signup
            // Body: { fullName, email, password, companyName, country }
            // Returns: { success, token, user: { id, fullName, role, company: { name, currency } } }
            return await register(userData);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Registration failed");
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials, { rejectWithValue }) => {
        try {
            // POST /api/auth/login
            // Body: { email, password }
            // Returns: { success, token, user: { id, fullName, role, company: { name, currency } } }
            return await login(credentials);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Login failed");
        }
    }
);

// JWT is stateless — no server-side logout endpoint exists.
// Just removes the token from localStorage (done in auth.service.js).
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    logout();
});

export const verifyUserToken = createAsyncThunk(
    "auth/verifyUserToken",
    async (token, { rejectWithValue }) => {
        try {
            // Sets token in localStorage then calls GET /auth/me
            // Returns: { success, user: { id, fullName, email, role, company } }
            return await verifyToken(token);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Token verification failed");
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            // GET /api/auth/me
            // Returns: { success, user: { id, fullName, email, role, company } }
            return await getProfile();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to get user profile");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            if (action.payload.token) {
                localStorage.setItem("token", action.payload.token);
            }
        },
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token");
        },
        setToken: (state, action) => {
            state.token = action.payload;
            if (action.payload) {
                localStorage.setItem("token", action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Register ────────────────────────────────────────────────────
            // POST /api/auth/signup → { success, token, user }
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;   // { id, fullName, role, company }
                state.token = action.payload.token;
                if (action.payload.token) localStorage.setItem("token", action.payload.token);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── Login ───────────────────────────────────────────────────────
            // POST /api/auth/login → { success, token, user }
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;   // { id, fullName, role, company }
                state.token = action.payload.token;
                if (action.payload.token) localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── Logout (synchronous, no API call) ───────────────────────────
            .addCase(logoutUser.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                // localStorage already cleared inside logout() service call
            })

            // ── Verify OAuth token ──────────────────────────────────────────
            // Token comes from ?token= URL param after Google OAuth redirect.
            // Validates it by calling GET /auth/me.
            // Response: { success, user: { id, fullName, email, role, company } }
            .addCase(verifyUserToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyUserToken.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = state.token || localStorage.getItem("token");
            })
            .addCase(verifyUserToken.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload;
                localStorage.removeItem("token");
            })

            // ── Get current user ────────────────────────────────────────────
            // GET /api/auth/me → { success, user: { id, fullName, email, role, company } }
            // Called on app mount to rehydrate state from stored token.
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                // Token is invalid — clear everything so ProtectedRoute redirects to /login
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.error = action.payload;
                localStorage.removeItem("token");
            });
    },
});

export const { clearError, setCredentials, clearCredentials, setToken } = authSlice.actions;
export default authSlice.reducer;