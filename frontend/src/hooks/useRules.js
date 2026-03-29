import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addRule,
    clearRuleError,
    editRule,
    fetchRules,
    removeRule,
} from "@/store/slices/ruleSlice";


export const useRules = (autoFetch = true) => {
    const dispatch = useDispatch();
    const { rules, loading, error } = useSelector((state) => state.rules);

    useEffect(() => {
        if (autoFetch) dispatch(fetchRules());
    }, [autoFetch]);

    const createRule = async (ruleData) => {
        try {
            return await dispatch(addRule(ruleData)).unwrap();
        } catch (err) {
            console.error("Create rule error:", err);
            throw err;
        }
    };

    const updateRule = async (id, updates) => {
        try {
            return await dispatch(editRule({ id, updates })).unwrap();
        } catch (err) {
            console.error("Update rule error:", err);
            throw err;
        }
    };

    const deleteRule = async (id) => {
        try {
            return await dispatch(removeRule(id)).unwrap();
        } catch (err) {
            console.error("Delete rule error:", err);
            throw err;
        }
    };

    const refetch = () => dispatch(fetchRules());
    const clearError = () => dispatch(clearRuleError());

    const safeRules = Array.isArray(rules) ? rules : [];

    return {
        rules: safeRules,
        loading,
        error,
        createRule,
        updateRule,
        deleteRule,
        refetch,
        clearError,
    };
};