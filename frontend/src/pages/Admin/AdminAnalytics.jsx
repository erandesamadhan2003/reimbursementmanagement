import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/currency";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatCard } from "@/components/ui/StatCard";
import {
  BarChart3, TrendingUp, CheckCircle, XCircle, Clock,
  RefreshCw, DollarSign, Percent, Timer,
} from "lucide-react";

const CATEGORY_PALETTE = {
  travel: { bg: "bg-orange-50", bar: "bg-orange-400", text: "text-orange-600", border: "border-orange-100" },
  food: { bg: "bg-teal-50", bar: "bg-teal-500", text: "text-teal-600", border: "border-teal-100" },
  accommodation: { bg: "bg-peach-300/20", bar: "bg-peach-400", text: "text-peach-500", border: "border-peach-300/30" },
  utilities: { bg: "bg-purple-50", bar: "bg-purple-400", text: "text-purple-600", border: "border-purple-100" },
  other: { bg: "bg-beige-100", bar: "bg-teal-300", text: "text-teal-500", border: "border-beige-200" },
};

const HorizontalBar = ({ category, total_amount, count, pending_count, approved_count, rejected_count, maxAmount, user }) => {
  const palette = CATEGORY_PALETTE[category] || CATEGORY_PALETTE.other;
  const widthPct = maxAmount > 0 ? Math.max(4, Math.round((total_amount / maxAmount) * 100)) : 4;
  const approvalPct = count > 0 ? Math.round((approved_count / count) * 100) : 0;

  return (
    <div className={`rounded-2xl border ${palette.border} ${palette.bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold capitalize ${palette.text}`}>{category}</span>
          <span className="text-xs text-teal-400">{count} expenses</span>
        </div>
        <span className="text-sm font-bold text-teal-900">{formatCurrency(total_amount || 0, user?.company?.currency || "USD")}</span>
      </div>

      {/* Bar */}
      <div className="h-3 bg-white/60 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${palette.bar} transition-all duration-700 ease-out`}
          style={{ width: `${widthPct}%` }}
        />
      </div>

      {/* Status breakdown */}
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1 text-green-600 font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> {approved_count} approved
        </span>
        <span className="flex items-center gap-1 text-amber-500 font-medium">
          <Clock className="w-3.5 h-3.5" /> {pending_count} pending
        </span>
        <span className="flex items-center gap-1 text-red-400 font-medium">
          <XCircle className="w-3.5 h-3.5" /> {rejected_count} rejected
        </span>
        <span className="ml-auto font-bold text-teal-600">{approvalPct}% rate</span>
      </div>
    </div>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm ${className}`}>
    {children}
  </div>
);

export const AdminAnalytics = () => {
  const { user } = useAuth();
  const { summary, byCategory, approvalRate, loading, refetchAll } = useAnalytics();

  const maxAmount = byCategory?.reduce((max, cat) => Math.max(max, cat.total_amount || 0), 0) || 1;

  const totalSpend = (summary?.total_approved_amount || 0) + (summary?.total_pending_amount || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Analytics</h1>
          <p className="text-sm text-teal-500 mt-1">Company-wide expense insights and metrics</p>
        </div>
        <button
          onClick={refetchAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-white/70 border border-teal-200 hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching analytics..." />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BarChart3} label="Total Expenses" value={summary?.total_expenses || 0} />
            <StatCard icon={Clock} label="Pending" value={summary?.count_pending || 0} />
            <StatCard icon={CheckCircle} label="Approved" value={summary?.count_approved || 0} />
            <StatCard icon={XCircle} label="Rejected" value={summary?.count_rejected || 0} />
          </div>

          {/* Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Approved Amount */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-green-50 border border-green-100">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-teal-500 uppercase tracking-wide">Approved Value</span>
              </div>
              <p className="mt-3 text-4xl font-extrabold text-teal-950">
                {formatCurrency(summary?.total_approved_amount || 0, user?.company?.currency || "USD")}
              </p>
              <p className="text-xs text-teal-400 mt-1">{summary?.count_approved || 0} expenses paid out</p>
              <div className="mt-3 h-1.5 bg-beige-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: totalSpend > 0 ? `${Math.round((summary?.total_approved_amount / totalSpend) * 100)}%` : "0%" }}
                />
              </div>
            </GlassCard>

            {/* Pending Amount */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-teal-500 uppercase tracking-wide">Pending Value</span>
              </div>
              <p className="mt-3 text-4xl font-extrabold text-amber-600">
                {formatCurrency(summary?.total_pending_amount || 0, user?.company?.currency || "USD")}
              </p>
              <p className="text-xs text-teal-400 mt-1">{summary?.count_pending || 0} awaiting review</p>
              <div className="mt-3 h-1.5 bg-beige-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: totalSpend > 0 ? `${Math.round((summary?.total_pending_amount / totalSpend) * 100)}%` : "0%" }}
                />
              </div>
            </GlassCard>

            {/* KPI Row */}
            <div className="space-y-3">
              <GlassCard className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                  <Percent className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-teal-900">{approvalRate}%</p>
                  <p className="text-xs text-teal-500">Approval Rate</p>
                </div>
              </GlassCard>
              <GlassCard className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-peach-300/20 border border-peach-300/30">
                  <Timer className="w-4 h-4 text-peach-500" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-teal-900">{summary?.avg_resolution_hours || 0}h</p>
                  <p className="text-xs text-teal-500">Avg Resolution Time</p>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Category Breakdown */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-teal-900">Expenses by Category</h2>
              <TrendingUp className="w-5 h-5 text-teal-400" />
            </div>
            {byCategory?.length > 0 ? (
              <div className="space-y-3">
                {byCategory.map((cat) => (
                  <HorizontalBar key={cat.category} {...cat} maxAmount={maxAmount} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-teal-400">
                <BarChart3 className="w-10 h-10 opacity-30 mx-auto mb-2" />
                <p className="text-sm">No data available yet</p>
              </div>
            )}
          </GlassCard>

          {/* Summary Table */}
          {byCategory?.length > 0 && (
            <GlassCard>
              <div className="p-5 border-b border-beige-100">
                <h2 className="text-base font-bold text-teal-900">Category Summary Table</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-beige-50/60">
                    <tr>
                      {["Category", "Total Amount", "Total Count", "Approved", "Pending", "Rejected", "Approval %"].map((h) => (
                        <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {byCategory.map((cat, i) => {
                      const palette = CATEGORY_PALETTE[cat.category] || CATEGORY_PALETTE.other;
                      const rate = cat.count > 0 ? Math.round((cat.approved_count / cat.count) * 100) : 0;
                      return (
                        <tr key={cat.category} className="border-b border-beige-50 hover:bg-beige-50/40 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${palette.bg} ${palette.text} ${palette.border}`}>
                              {cat.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-teal-900">{formatCurrency(cat.total_amount || 0, user?.company?.currency || "USD")}</td>
                          <td className="py-3 px-4 text-sm text-teal-700">{cat.count}</td>
                          <td className="py-3 px-4 text-sm font-medium text-green-600">{cat.approved_count}</td>
                          <td className="py-3 px-4 text-sm font-medium text-amber-500">{cat.pending_count}</td>
                          <td className="py-3 px-4 text-sm font-medium text-red-400">{cat.rejected_count}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 bg-beige-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-teal-700">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};
