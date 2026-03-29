import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    approveExpense,
    createExpense,
    getExpenseById,
    listExpenses,
    ocrReceipt,
    overrideExpense,
    rejectExpense,
} from "@/services/expense.service";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchExpenses = createAsyncThunk(
    "expenses/fetchExpenses",
    async (params = {}, { rejectWithValue }) => {
        try {
            return await listExpenses(params);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch expenses");
        }
    }
);

export const fetchExpenseById = createAsyncThunk(
    "expenses/fetchExpenseById",
    async (id, { rejectWithValue }) => {
        try {
            return await getExpenseById(id);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch expense");
        }
    }
);

export const submitExpense = createAsyncThunk(
    "expenses/submitExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            return await createExpense(expenseData);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to submit expense");
        }
    }
);

export const approveExpenseThunk = createAsyncThunk(
    "expenses/approveExpense",
    async ({ id, comment }, { rejectWithValue }) => {
        try {
            return await approveExpense(id, { comment });
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to approve expense");
        }
    }
);

export const rejectExpenseThunk = createAsyncThunk(
    "expenses/rejectExpense",
    async ({ id, comment }, { rejectWithValue }) => {
        try {
            return await rejectExpense(id, { comment });
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to reject expense");
        }
    }
);

export const overrideExpenseThunk = createAsyncThunk(
    "expenses/overrideExpense",
    async ({ id, comment = "" }, { rejectWithValue }) => {
        try {
            return await overrideExpense(id, comment);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to override expense");
        }
    }
);

export const scanReceipt = createAsyncThunk(
    "expenses/scanReceipt",
    async (file, { rejectWithValue }) => {
        try {
            return await ocrReceipt(file);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "OCR scan failed");
        }
    }
);

// ─── Helper: update an expense in the list array ─────────────────────────────
const updateInList = (state, updatedExpense) => {
    const idx = state.expenses.findIndex((e) => e._id === updatedExpense._id);
    if (idx !== -1) state.expenses[idx] = updatedExpense;
    // Also update selectedExpense if it's the same one
    if (state.selectedExpense?._id === updatedExpense._id) {
        state.selectedExpense = updatedExpense;
    }
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
    expenses: [],           // list of expenses
    selectedExpense: null,  // detail view
    ocrData: null,          // auto-filled data from OCR
    ocrLoading: false,
    loading: false,
    error: null,
};

const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {
        clearExpenseError: (state) => { state.error = null; },
        clearSelectedExpense: (state) => { state.selectedExpense = null; },
        clearOcrData: (state) => { state.ocrData = null; },
    },
    extraReducers: (builder) => {
        builder
            // Fetch list
            .addCase(fetchExpenses.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload.expenses ?? action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Fetch by id
            .addCase(fetchExpenseById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchExpenseById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedExpense = action.payload.expense ?? action.payload;
            })
            .addCase(fetchExpenseById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Submit expense
            .addCase(submitExpense.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(submitExpense.fulfilled, (state, action) => {
                state.loading = false;
                const newExpense = action.payload.expense ?? action.payload;
                state.expenses.unshift(newExpense);
            })
            .addCase(submitExpense.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Approve
            .addCase(approveExpenseThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(approveExpenseThunk.fulfilled, (state, action) => {
                state.loading = false;
                updateInList(state, action.payload.expense ?? action.payload);
            })
            .addCase(approveExpenseThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Reject
            .addCase(rejectExpenseThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(rejectExpenseThunk.fulfilled, (state, action) => {
                state.loading = false;
                updateInList(state, action.payload.expense ?? action.payload);
            })
            .addCase(rejectExpenseThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // Override
            .addCase(overrideExpenseThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(overrideExpenseThunk.fulfilled, (state, action) => {
                state.loading = false;
                updateInList(state, action.payload.expense ?? action.payload);
            })
            .addCase(overrideExpenseThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // OCR scan
            .addCase(scanReceipt.pending, (state) => { state.ocrLoading = true; state.error = null; state.ocrData = null; })
            .addCase(scanReceipt.fulfilled, (state, action) => {
                state.ocrLoading = false;
                state.ocrData = action.payload;
            })
            .addCase(scanReceipt.rejected, (state, action) => { state.ocrLoading = false; state.error = action.payload; });
    },
});

export const { clearExpenseError, clearSelectedExpense, clearOcrData } = expenseSlice.actions;
export default expenseSlice.reducer;