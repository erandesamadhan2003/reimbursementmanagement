import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    approveExpenseThunk,
    clearExpenseError,
    clearOcrData,
    clearSelectedExpense,
    fetchExpenseById,
    fetchExpenses,
    overrideExpenseThunk,
    rejectExpenseThunk,
    scanReceipt,
    submitExpense,
} from "@/store/slices/expenseSlice";

/**
 * useExpenses — Role-aware hook for all expense operations.
 *
 * @param {Object}  options
 * @param {boolean} options.autoFetch   - Fetch list on mount (default: true)
 * @param {string}  options.statusFilter - 'pending' | 'approved' | 'rejected' | undefined
 *
 * Usage:
 *   const { expenses, loading, submit, approve, reject } = useExpenses();
 *   const { expenses: pending } = useExpenses({ statusFilter: 'pending' });
 */
export const useExpenses = ({ autoFetch = true, statusFilter } = {}) => {
    const dispatch = useDispatch();
    const { expenses, selectedExpense, ocrData, ocrLoading, loading, error } =
        useSelector((state) => state.expenses);

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchExpenses(statusFilter ? { status: statusFilter } : {}));
        }
    }, [autoFetch, statusFilter]);

    // ── CRUD ──────────────────────────────────────────────────────────────────

    const submit = async (expenseData) => {
        try {
            return await dispatch(submitExpense(expenseData)).unwrap();
        } catch (err) {
            console.error("Submit expense error:", err);
            throw err;
        }
    };

    const loadExpense = async (id) => {
        try {
            return await dispatch(fetchExpenseById(id)).unwrap();
        } catch (err) {
            console.error("Load expense error:", err);
            throw err;
        }
    };

    // ── Approval actions ──────────────────────────────────────────────────────

    const approve = async (id, comment = "") => {
        try {
            return await dispatch(approveExpenseThunk({ id, comment })).unwrap();
        } catch (err) {
            console.error("Approve expense error:", err);
            throw err;
        }
    };

    const reject = async (id, comment) => {
        if (!comment) throw new Error("A comment is required when rejecting an expense.");
        try {
            return await dispatch(rejectExpenseThunk({ id, comment })).unwrap();
        } catch (err) {
            console.error("Reject expense error:", err);
            throw err;
        }
    };

    /** Admin only — force-approve regardless of pending steps. Comment is required. */
    const override = async (id, comment = "") => {
        try {
            return await dispatch(overrideExpenseThunk({ id, comment })).unwrap();
        } catch (err) {
            console.error("Override expense error:", err);
            throw err;
        }
    };

    // ── OCR ───────────────────────────────────────────────────────────────────

    /**
     * Scan a receipt image and return structured data.
     * The result is also stored in state.ocrData for reactive consumption.
     * @param {File} file
     */
    const scanOcr = async (file) => {
        try {
            return await dispatch(scanReceipt(file)).unwrap();
        } catch (err) {
            console.error("OCR scan error:", err);
            throw err;
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    const refetch = (params = {}) =>
        dispatch(fetchExpenses(statusFilter ? { status: statusFilter, ...params } : params));

    const clearError = () => dispatch(clearExpenseError());
    const clearSelected = () => dispatch(clearSelectedExpense());
    const clearOcr = () => dispatch(clearOcrData());

    // Derived counts
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const pendingExpenses = safeExpenses.filter((e) => e.status === "pending");
    const approvedExpenses = safeExpenses.filter((e) => e.status === "approved");
    const rejectedExpenses = safeExpenses.filter((e) => e.status === "rejected");

    return {
        expenses: safeExpenses,
        selectedExpense,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        ocrData,
        ocrLoading,
        loading,
        error,
        // Actions
        submit,
        loadExpense,
        approve,
        reject,
        override,
        scanOcr,
        refetch,
        clearError,
        clearSelected,
        clearOcr,
    };
};