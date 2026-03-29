import { api, ANALYTICS_URL, AUDIT_URL } from "../api/api";

/**
 * Get analytics summary — Admin only
 * Returns: { total_pending_amount, count_pending, count_approved, count_rejected, avg_resolution_hours }
 */
export const getAnalyticsSummary = async () => {
    try {
        const response = await api.get(ANALYTICS_URL.SUMMARY);
        return response.data;
    } catch (error) {
        console.error("Analytics summary error:", error);
        throw error;
    }
};

/**
 * Get expense totals grouped by category — Admin only
 * Returns: [{ category, total, count }]
 */
export const getAnalyticsByCategory = async () => {
    try {
        const response = await api.get(ANALYTICS_URL.BY_CATEGORY);
        return response.data;
    } catch (error) {
        console.error("Analytics by-category error:", error);
        throw error;
    }
};


//  Get audit log — Admin only

export const getAuditLog = async () => {
    try {
        const response = await api.get(AUDIT_URL.LIST);
        return response.data;
    } catch (error) {
        console.error("Audit log error:", error);
        throw error;
    }
};