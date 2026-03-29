import { useExpenses } from "@/hooks/useExpenses";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/currency";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatCard } from "@/components/ui/StatCard";
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Percent,
  RefreshCw,
} from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm ${className}`}>
    {children}
  </div>
);

const CATEGORY_PALETTE = {
  travel: { bg: "bg-orange-50", bar: "bg-orange-400", text: "text-orange-600", border: "border-orange-100" },
  food: { bg: "bg-teal-50", bar: "bg-teal-500", text: "text-teal-600", border: "border-teal-100" },
  accommodation: { bg: "bg-peach-300/20", bar: "bg-peach-400", text: "text-peach-500", border: "border-peach-300/30" },
  utilities: { bg: "bg-purple-50", bar: "bg-purple-400", text: "text-purple-600", border: "border-purple-100" },
  other: { bg: "bg-beige-100", bar: "bg-teal-300", text: "text-teal-500", border: "border-beige-200" },
};

const CategoryBar = ({ category, total_amount, count, approved_count, pending_count, maxAmount, currency }) => {
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
        <span className="text-sm font-bold text-teal-900">{formatCurrency(total_amount || 0, currency)}</span>
      </div>
      <div className="h-3 bg-white/60 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${palette.bar} transition-all duration-700 ease-out`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1 text-green-600 font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> {approved_count} approved
        </span>
        <span className="flex items-center gap-1 text-amber-500 font-medium">
          <Clock className="w-3.5 h-3.5" /> {pending_count} pending
        </span>
        <span className="ml-auto font-bold text-teal-600">{approvalPct}%</span>
      </div>
    </div>
  );
};

export const ManagerReports = () => {
  const { user } = useAuth();
  const { summary, byCategory, loading: analyticsLoading, refetchAll } = useAnalytics();
  const { expenses, pendingExpenses, approvedExpenses, rejectedExpenses, loading: expLoading } = useExpenses();

  const currency = user?.company?.currency || "USD";
  const loading = analyticsLoading || expLoading;
  const maxAmount = byCategory?.reduce((max, cat) => Math.max(max, cat.total_amount || 0), 0) || 1;
  const totalSpend = (summary?.total_approved_amount || 0) + (summary?.total_pending_amount || 0);
  const approvalRate = summary?.approval_rate || (
    expenses.length > 0
      ? Math.round((approvedExpenses.length / expenses.length) * 100)
      : 0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Reports</h1>
          <p className="text-sm text-teal-500 mt-1">Team expense analytics and insights</p>
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
        <LoadingSpinner message="Loading reports..." />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BarChart3} label="Total Expenses" value={summary?.total_expenses || expenses.length} />
            <StatCard icon={Clock} label="Pending" value={summary?.count_pending || pendingExpenses.length} />
            <StatCard icon={CheckCircle} label="Approved" value={summary?.count_approved || approvedExpenses.length} />
            <StatCard icon={XCircle} label="Rejected" value={summary?.count_rejected || rejectedExpenses.length} />
          </div>

          {/* Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-green-50 border border-green-100">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-teal-500 uppercase tracking-wide">Approved Value</span>
              </div>
              <p className="mt-3 text-4xl font-extrabold text-teal-950">
                {formatCurrency(summary?.total_approved_amount || 0, currency)}
              </p>
              <p className="text-xs text-teal-400 mt-1">{summary?.count_approved || approvedExpenses.length} expenses paid out</p>
              <div className="mt-3 h-1.5 bg-beige-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: totalSpend > 0 ? `${Math.round((summary?.total_approved_amount / totalSpend) * 100)}%` : "0%" }}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-teal-500 uppercase tracking-wide">Pending Value</span>
              </div>
              <p className="mt-3 text-4xl font-extrabold text-amber-600">
                {formatCurrency(summary?.total_pending_amount || 0, currency)}
              </p>
              <p className="text-xs text-teal-400 mt-1">{summary?.count_pending || pendingExpenses.length} awaiting review</p>
              <div className="mt-3 h-1.5 bg-beige-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: totalSpend > 0 ? `${Math.round((summary?.total_pending_amount / totalSpend) * 100)}%` : "0%" }}
                />
              </div>
            </GlassCard>

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
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-teal-900">{summary?.avg_resolution_hours || 0}h</p>
                  <p className="text-xs text-teal-500">Avg Resolution</p>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Category breakdown */}
          {byCategory?.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-teal-900">Expenses by Category</h2>
                <TrendingUp className="w-5 h-5 text-teal-400" />
              </div>
              <div className="space-y-3">
                {byCategory.map((cat) => (
                  <CategoryBar key={cat.category} {...cat} maxAmount={maxAmount} />
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};
