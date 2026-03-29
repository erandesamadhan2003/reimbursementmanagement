import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    clearAnalyticsError,
    fetchAnalyticsByCategory,
    fetchAnalyticsSummary,
    fetchAuditLog,
} from "@/store/slices/analyticsSlice";

/**
 * useAnalytics — Admin-only hook for dashboard metrics and audit log.
 *
 * @param {Object}  options
 * @param {boolean} options.autoFetch  - Fetch summary + categories on mount (default: true)
 * @param {boolean} options.withAudit  - Also fetch audit log on mount (default: false)
 *
 * Usage:
 *   const { summary, byCategory, loading } = useAnalytics();
 *   const { auditLog } = useAnalytics({ withAudit: true });
 */
export const useAnalytics = ({ autoFetch = true, withAudit = false } = {}) => {
    const dispatch = useDispatch();
    const { summary, byCategory, auditLog, loading, error } = useSelector(
        (state) => state.analytics
    );

    useEffect(() => {
        if (autoFetch) {
            dispatch(fetchAnalyticsSummary());
            dispatch(fetchAnalyticsByCategory());
        }
        if (withAudit) {
            dispatch(fetchAuditLog());
        }
    }, [autoFetch, withAudit]);

    const refetchSummary = () => dispatch(fetchAnalyticsSummary());
    const refetchByCategory = () => dispatch(fetchAnalyticsByCategory());
    const refetchAuditLog = () => dispatch(fetchAuditLog());

    const refetchAll = () => {
        dispatch(fetchAnalyticsSummary());
        dispatch(fetchAnalyticsByCategory());
        dispatch(fetchAuditLog());
    };

    const clearError = () => dispatch(clearAnalyticsError());

    // Backend already computes approval_rate in the summary object.
    // Fall back to client-side calculation only if the field is missing.
    const approvalRate = summary?.approval_rate ??
        (summary && summary.count_approved + summary.count_rejected > 0
            ? Math.round(
                (summary.count_approved /
                    (summary.count_approved + summary.count_rejected)) *
                100
            )
            : 0);

    return {
        summary,
        byCategory,
        auditLog,
        approvalRate,
        loading,
        error,
        refetchSummary,
        refetchByCategory,
        refetchAuditLog,
        refetchAll,
        clearError,
    };
};