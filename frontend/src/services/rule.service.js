import { api, RULE_URL } from "../api/api";

/**
 * Create a new approval rule — Admin only
 * @param {Object} ruleData - {
 *   name, amount_min, amount_max?, category?,
 *   steps: [{ order, approver_id, label }],
 *   conditional_type: 'none' | 'percentage' | 'specific' | 'hybrid',
 *   conditional_pct?, conditional_approver_id?
 * }
 */
export const createRule = async (ruleData) => {
    try {
        const response = await api.post(RULE_URL.CREATE, ruleData);
        return response.data;
    } catch (error) {
        console.error("Create rule error:", error);
        throw error;
    }
};

/**
 * List all approval rules for the company — Admin only
 */
export const listRules = async () => {
    try {
        const response = await api.get(RULE_URL.LIST);
        return response.data;
    } catch (error) {
        console.error("List rules error:", error);
        throw error;
    }
};

/**
 * Update an approval rule — Admin only
 * Only affects new expenses; in-flight expenses keep their original rule.
 * @param {string} id - Rule ID
 * @param {Object} updates - Partial ApprovalRule fields
 */
export const updateRule = async (id, updates) => {
    try {
        const response = await api.patch(RULE_URL.UPDATE(id), updates);
        return response.data;
    } catch (error) {
        console.error("Update rule error:", error);
        throw error;
    }
};

/**
 * Delete an approval rule — Admin only
 * @param {string} id - Rule ID
 */
export const deleteRule = async (id) => {
    try {
        const response = await api.delete(RULE_URL.DELETE(id));
        return response.data;
    } catch (error) {
        console.error("Delete rule error:", error);
        throw error;
    }
};