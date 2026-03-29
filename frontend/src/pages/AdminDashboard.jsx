import { useAnalytics } from "@/hooks/useAnalytics";
import { useExpenses } from "@/hooks/useExpenses";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BarChart3, TrendingUp, Clock, DollarSign, PieChart, Activity } from "lucide-react";

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
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <div className="page-section p-6 sm:p-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-500">
            <Activity className="h-3.5 w-3.5" />
            Analytics
          </div>
          <h1 className="mt-4 text-teal-950">See company reimbursement health at a glance.</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base">
            The analytics view is now lighter, faster to scan, and responsive enough to keep charts and summaries readable on smaller screens.
          </p>
        </div>

        <div className="page-section p-5 animate-fade-in-up" style={{ animationDelay: "90ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-400">
            Pending liability
          </p>
          <p className="mt-3 text-3xl font-bold text-teal-950">
            ${parseFloat(totalPending).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-2 text-sm text-teal-500">
            Current reimbursement amount waiting to be resolved
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={BarChart3} label="Total Expenses" value={totalExpenses} index={0} />
        <StatCard icon={TrendingUp} label="Approval Rate" value={`${approvalRate}%`} accent="green" index={1} />
        <StatCard icon={Clock} label="Avg. Resolution" value={`${avgResolution}`} accent="amber" index={2} />
        <StatCard icon={DollarSign} label="Pending Amount" value={`$${parseFloat(totalPending).toFixed(0)}`} accent="red" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="page-section p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-teal-500" />
            <h2 className="text-teal-950">By Category</h2>
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
                  <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 70}ms` }}>
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium capitalize text-teal-800">
                        {cat.category || "Other"}
                      </span>
                      <span className="text-sm font-semibold text-teal-900">
                        ${parseFloat(amount).toLocaleString()} ({cat.count || 0})
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-beige-100">
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
            <p className="py-8 text-center text-sm text-teal-400">No category data available</p>
          )}
        </div>

        <div className="page-section p-6 sm:p-8">
          <h2 className="mb-6 text-teal-950">Status Overview</h2>
          <div className="space-y-4">
            {[
              { label: "Pending", count: summary?.count_pending || 0, color: "bg-status-pending", lightBg: "bg-status-pending-bg" },
              { label: "Approved", count: summary?.count_approved || 0, color: "bg-status-approved", lightBg: "bg-status-approved-bg" },
              { label: "Rejected", count: summary?.count_rejected || 0, color: "bg-status-rejected", lightBg: "bg-status-rejected-bg" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-2xl p-4 ${item.lightBg} animate-slide-up`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
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
