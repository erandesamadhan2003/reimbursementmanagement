import { api, USER_URL } from "../api/api";

/**
 * Create a new user (employee or manager) — Admin only
 * POST /api/users
 * @param {Object} userData - { fullName, email, password, role, manager_id?, is_manager_approver? }
 *   - role must be "employee" or "manager" (not "admin")
 *   - manager_id: ObjectId of an existing manager in the company (for employees)
 *   - is_manager_approver: if true, this employee's manager is auto-injected as step-0 approver
 */
export const createUser = async (userData) => {
    try {
        const response = await api.post(USER_URL.CREATE, userData);
        return response.data;
    } catch (error) {
        console.error("Create user error:", error);
        throw error;
    }
};

/**
 * List all users in the company — Admin only
 */
export const listUsers = async () => {
    try {
        const response = await api.get(USER_URL.LIST);
        return response.data;
    } catch (error) {
        console.error("List users error:", error);
        throw error;
    }
};

/**
 * Update a user's role, manager assignment, or manager-approver flag — Admin only
 * @param {string} id - User ID
 * @param {Object} updates - { role?, manager_id?, is_manager_approver? }
 */
export const updateUser = async (id, updates) => {
    try {
        const response = await api.patch(USER_URL.UPDATE(id), updates);
        return response.data;
    } catch (error) {
        console.error("Update user error:", error);
        throw error;
    }
};

/**
 * Soft-delete a user — Admin only
 * @param {string} id - User ID
 */
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(USER_URL.DELETE(id));
        return response.data;
    } catch (error) {
        console.error("Delete user error:", error);
        throw error;
    }
};