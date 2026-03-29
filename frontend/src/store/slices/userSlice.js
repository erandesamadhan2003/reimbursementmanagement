import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createUser, deleteUser, listUsers, updateUser } from "@/services/user.service";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            return await listUsers();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
        }
    }
);

export const addUser = createAsyncThunk(
    "users/addUser",
    async (userData, { rejectWithValue }) => {
        try {
            return await createUser(userData);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create user");
        }
    }
);

export const editUser = createAsyncThunk(
    "users/editUser",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await updateUser(id, updates);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update user");
        }
    }
);

export const removeUser = createAsyncThunk(
    "users/removeUser",
    async (id, { rejectWithValue }) => {
        try {
            await deleteUser(id);
            return id; // return id so we can remove from state
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete user");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
    users: [],         // array of User documents
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearUserError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all users
            .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                const p = action.payload;
                const extracted = p?.data?.users || p?.users || p?.data || p;
                state.users = Array.isArray(extracted) ? extracted : [];
            })
            .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Add user
            .addCase(addUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(addUser.fulfilled, (state, action) => {
                state.loading = false;
                const newUser = action.payload?.user ?? action.payload?.data ?? action.payload;
                if (!Array.isArray(state.users)) state.users = [];
                state.users.push(newUser);
            })
            .addCase(addUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Edit user
            .addCase(editUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(editUser.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.user ?? action.payload;
                const idx = state.users.findIndex((u) => u._id === updated._id);
                if (idx !== -1) state.users[idx] = updated;
            })
            .addCase(editUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Remove user
            .addCase(removeUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(removeUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter((u) => u._id !== action.payload);
            })
            .addCase(removeUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;