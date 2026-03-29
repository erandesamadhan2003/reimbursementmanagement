import { useAnalytics } from "@/hooks/useAnalytics";
import { useExpenses } from "@/hooks/useExpenses";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BarChart3, TrendingUp, Clock, DollarSign, PieChart } from "lucide-react";

export const AdminDashboard = () => {
  const { summary, byCategory, loading: analyticsLoading } = useAnalytics();
  const { expenses, loading: expensesLoading } = useExpenses();

  const loading = analyticsLoading || expensesLoading;

  if (loading && !summary) {
    return <LoadingSpinner fullPage message="Loading analytics..." />;
  }

  const totalExpenses = summary?.total_expenses || expenses.length || 0;
  const approvalRate = summary?.approval_rate || 0;
  const avgResolution = summary?.avg_resolution_hours || 0;
  const totalPending = summary?.total_pending_amount || 0;

  const maxCategoryAmount = byCategory?.length
    ? Math.max(...byCategory.map((c) => c.total_amount || c.total || 0))
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-teal-900">Analytics</h1>
        <p className="text-sm text-teal-500 mt-1">Company-wide expense insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Expenses"
          value={totalExpenses}
        />
        <StatCard
          icon={TrendingUp}
          label="Approval Rate"
          value={`${approvalRate}`}
        />
        <StatCard
          icon={Clock}
          label="Avg. Resolution"
          value={`${avgResolution}`}
        />
        <StatCard
          icon={DollarSign}
          label="Pending Amount"
          value={`$${parseFloat(totalPending).toFixed(0)}`}
        />
      </div>

      {/* Category Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-bold text-teal-900">By Category</h2>
          </div>

          {byCategory && byCategory.length > 0 ? (
            <div className="space-y-4">
              {byCategory.map((cat, idx) => {
                const amount = cat.total_amount || cat.total || 0;
                const percentage = maxCategoryAmount > 0 ? (amount / maxCategoryAmount) * 100 : 0;
                const colors = [
                  "bg-teal-500",
                  "bg-peach-400",
                  "bg-teal-300",
                  "bg-peach-300",
                  "bg-teal-700",
                  "bg-teal-200",
                ];
                return (
                  <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-teal-800 capitalize">
                        {cat.category || "Other"}
                      </span>
                      <span className="text-sm font-semibold text-teal-900">
                        ${parseFloat(amount).toLocaleString()} ({cat.count || 0})
                      </span>
                    </div>
                    <div className="h-2 bg-beige-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${colors[idx % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-teal-400 text-center py-8">No category data available</p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="bg-white rounded-xl border border-beige-200 p-6">
          <h2 className="text-lg font-bold text-teal-900 mb-6">Status Overview</h2>
          <div className="space-y-4">
            {[
              { label: "Pending", count: summary?.count_pending || 0, color: "bg-status-pending", lightBg: "bg-status-pending-bg" },
              { label: "Approved", count: summary?.count_approved || 0, color: "bg-status-approved", lightBg: "bg-status-approved-bg" },
              { label: "Rejected", count: summary?.count_rejected || 0, color: "bg-status-rejected", lightBg: "bg-status-rejected-bg" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-lg ${item.lightBg} animate-slide-up`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium text-teal-900">{item.label}</span>
                </div>
                <span className="text-xl font-bold text-teal-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
