import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createRule, deleteRule, listRules, updateRule } from "@/services/rule.service";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchRules = createAsyncThunk(
    "rules/fetchRules",
    async (_, { rejectWithValue }) => {
        try {
            return await listRules();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch rules");
        }
    }
);

export const addRule = createAsyncThunk(
    "rules/addRule",
    async (ruleData, { rejectWithValue }) => {
        try {
            return await createRule(ruleData);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create rule");
        }
    }
);

export const editRule = createAsyncThunk(
    "rules/editRule",
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            return await updateRule(id, updates);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update rule");
        }
    }
);

export const removeRule = createAsyncThunk(
    "rules/removeRule",
    async (id, { rejectWithValue }) => {
        try {
            await deleteRule(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete rule");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
    rules: [],
    loading: false,
    error: null,
};

const ruleSlice = createSlice({
    name: "rules",
    initialState,
    reducers: {
        clearRuleError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchRules.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchRules.fulfilled, (state, action) => {
                state.loading = false;
                state.rules = action.payload.rules ?? action.payload;
            })
            .addCase(fetchRules.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Add
            .addCase(addRule.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(addRule.fulfilled, (state, action) => {
                state.loading = false;
                state.rules.push(action.payload.rule ?? action.payload);
            })
            .addCase(addRule.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Edit
            .addCase(editRule.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(editRule.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.rule ?? action.payload;
                const idx = state.rules.findIndex((r) => r._id === updated._id);
                if (idx !== -1) state.rules[idx] = updated;
            })
            .addCase(editRule.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Remove
            .addCase(removeRule.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(removeRule.fulfilled, (state, action) => {
                state.loading = false;
                state.rules = state.rules.filter((r) => r._id !== action.payload);
            })
            .addCase(removeRule.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { clearRuleError } = ruleSlice.actions;
export default ruleSlice.reducer;