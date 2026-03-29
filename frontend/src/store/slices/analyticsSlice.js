import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    getAnalyticsByCategory,
    getAnalyticsSummary,
    getAuditLog,
} from "@/services/analytics.service";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAnalyticsSummary = createAsyncThunk(
    "analytics/fetchSummary",
    async (_, { rejectWithValue }) => {
        try {
            return await getAnalyticsSummary();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch analytics summary");
        }
    }
);

export const fetchAnalyticsByCategory = createAsyncThunk(
    "analytics/fetchByCategory",
    async (_, { rejectWithValue }) => {
        try {
            return await getAnalyticsByCategory();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch analytics by category");
        }
    }
);

export const fetchAuditLog = createAsyncThunk(
    "analytics/fetchAuditLog",
    async (_, { rejectWithValue }) => {
        try {
            return await getAuditLog();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch audit log");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
    summary: null,      // { total_pending_amount, count_pending, count_approved, count_rejected, avg_resolution_hours }
    byCategory: [],     // [{ category, total, count }]
    auditLog: [],       // [{ actor, action, target, meta, timestamp }]
    loading: false,
    error: null,
};

const analyticsSlice = createSlice({
    name: "analytics",
    initialState,
    reducers: {
        clearAnalyticsError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            // Summary
            // GET /api/analytics/summary → { summary: { count_pending, count_approved, count_rejected, total_expenses, total_pending_amount, total_approved_amount, approval_rate, avg_resolution_hours } }
            .addCase(fetchAnalyticsSummary.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.summary = action.payload?.data?.summary ?? action.payload?.summary ?? action.payload;
            })
            .addCase(fetchAnalyticsSummary.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // By category
            // GET /api/analytics/by-category → { by_category: [{ category, total_amount, count, pending_count, approved_count, rejected_count }] }
            .addCase(fetchAnalyticsByCategory.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAnalyticsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                const p = action.payload;
                const extracted = p?.data?.by_category || p?.by_category || p?.data?.byCategory || p?.data || p;
                state.byCategory = Array.isArray(extracted) ? extracted : [];
            })
            .addCase(fetchAnalyticsByCategory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Audit log
            // GET /api/audit → { total, page, pages, logs: [{ actor_id, action, target_id, meta, timestamp }] }
            .addCase(fetchAuditLog.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAuditLog.fulfilled, (state, action) => {
                state.loading = false;
                const p = action.payload;
                const extracted = p?.data?.logs || p?.logs || p?.data || p;
                state.auditLog = Array.isArray(extracted) ? extracted : [];
            })
            .addCase(fetchAuditLog.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;