import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addUser,
    clearUserError,
    editUser,
    fetchUsers,
    removeUser,
} from "@/store/slices/userSlice";


export const useUsers = (autoFetch = true) => {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchUsers());
        }
    }, [autoFetch]);

    const createUser = async (userData) => {
        try {
            return await dispatch(addUser(userData)).unwrap();
        } catch (err) {
            console.error("Create user error:", err);
            throw err;
        }
    };

    const updateUser = async (id, updates) => {
        try {
            return await dispatch(editUser({ id, updates })).unwrap();
        } catch (err) {
            console.error("Update user error:", err);
            throw err;
        }
    };

    const deleteUser = async (id) => {
        try {
            return await dispatch(removeUser(id)).unwrap();
        } catch (err) {
            console.error("Delete user error:", err);
            throw err;
        }
    };

    const refetch = () => dispatch(fetchUsers());

    const clearError = () => dispatch(clearUserError());

    // Derived lists — handy for dropdowns
    const safeUsers = Array.isArray(users) ? users : [];
    const employees = safeUsers.filter((u) => u.role === "employee");
    const managers = safeUsers.filter((u) => u.role === "manager");
    const managerApprovers = safeUsers.filter((u) => u.is_manager_approver);

    return {
        users: safeUsers,
        employees,
        managers,
        managerApprovers,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        refetch,
        clearError,
    };
};