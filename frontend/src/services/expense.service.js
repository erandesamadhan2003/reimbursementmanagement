import { api, EXPENSE_URL } from "../api/api";

/**
 * Submit a new expense — Employee only
 * @param {Object} expenseData - { amount, currency, category, description, date, receipt_url? }
 */
export const createExpense = async (expenseData) => {
    try {
        const response = await api.post(EXPENSE_URL.CREATE, expenseData);
        return response.data;
    } catch (error) {
        console.error("Create expense error:", error);
        throw error;
    }
};

/**
 * List expenses — role-filtered by backend
 * Employee → own expenses | Manager → team expenses | Admin → all
 * @param {Object} params - { status?: 'pending' | 'approved' | 'rejected' }
 */
export const listExpenses = async (params = {}) => {
    try {
        const response = await api.get(EXPENSE_URL.LIST, { params });
        return response.data;
    } catch (error) {
        console.error("List expenses error:", error);
        throw error;
    }
};

/**
 * Get full expense detail with approval_logs timeline
 * @param {string} id - Expense ID
 */
export const getExpenseById = async (id) => {
    try {
        const response = await api.get(EXPENSE_URL.GET_BY_ID(id));
        return response.data;
    } catch (error) {
        console.error("Get expense error:", error);
        throw error;
    }
};

/**
 * Approve an expense — Manager / Admin
 * @param {string} id - Expense ID
 * @param {Object} payload - { comment? }
 */
export const approveExpense = async (id, payload = {}) => {
    try {
        const response = await api.patch(EXPENSE_URL.APPROVE(id), payload);
        return response.data;
    } catch (error) {
        console.error("Approve expense error:", error);
        throw error;
    }
};

/**
 * Reject an expense — Manager / Admin
 * @param {string} id - Expense ID
 * @param {Object} payload - { comment } (required)
 */
export const rejectExpense = async (id, payload) => {
    try {
        const response = await api.patch(EXPENSE_URL.REJECT(id), payload);
        return response.data;
    } catch (error) {
        console.error("Reject expense error:", error);
        throw error;
    }
};

/**
 * Force-approve an expense regardless of pending steps — Admin only
 * Backend logs an AuditLog entry for every override.
 * @param {string} id - Expense ID
 * @param {string} comment - Required reason for override
 */
export const overrideExpense = async (id, comment = "") => {
    try {
        const response = await api.patch(EXPENSE_URL.OVERRIDE(id), { comment });
        return response.data;
    } catch (error) {
        console.error("Override expense error:", error);
        throw error;
    }
};

/**
 * OCR scan a receipt image — Employee only
 * Multipart form field name: "receipt"
 * Backend: POST /api/expenses/ocr → { success, data: { amount, currency, date, vendor, category, description } }
 * We return the inner `data` object so callers can directly autofill form fields.
 * @param {File} file - Receipt image (JPEG, PNG, WebP, max 10MB)
 */
export const ocrReceipt = async (file) => {
    try {
        const formData = new FormData();
        formData.append("receipt", file);
        // Don't manually set Content-Type — axios sets the boundary automatically for multipart
        const response = await api.post(EXPENSE_URL.OCR, formData);
        // Response shape: { success: true, data: { amount, currency, date, vendor, category, description } }
        return response.data.data ?? response.data;
    } catch (error) {
        console.error("OCR error:", error);
        throw error;
    }
};