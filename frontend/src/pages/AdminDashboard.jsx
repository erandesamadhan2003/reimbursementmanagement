import { useAnalytics } from "@/hooks/useAnalytics";
import { useExpenses } from "@/hooks/useExpenses";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BarChart3, TrendingUp, Clock, DollarSign, PieChart, Building2, ShieldCheck } from "lucide-react";

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
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.92fr)]">
        <div className="glass-card p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin controls
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold text-slate-950 sm:text-4xl">
            Manage roles, policies, and reimbursement behavior from one place.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            This admin view is centered on approval configuration, company-wide monitoring, and high-level reimbursement visibility across employees, managers, and approvers.
          </p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Company setup</p>
              <p className="mt-1 text-sm text-slate-500">
                Company currency, employee roles, manager relationships, and conditional approval rules can all be surfaced from this admin experience.
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Pending liability</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              ${parseFloat(totalPending).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-sm text-slate-500">Current company exposure waiting to be resolved</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BarChart3} label="Total Expenses" value={totalExpenses} />
        <StatCard icon={TrendingUp} label="Approval Rate" value={`${approvalRate}%`} accent="green" />
        <StatCard icon={Clock} label="Avg. Resolution" value={`${avgResolution}`} accent="amber" />
        <StatCard icon={DollarSign} label="Pending Amount" value={`$${parseFloat(totalPending).toFixed(0)}`} accent="red" />
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-950">Expense breakdown by category</h2>
          </div>

          {byCategory && byCategory.length > 0 ? (
            <div className="space-y-5">
              {byCategory.map((cat, idx) => {
                const amount = cat.total_amount || cat.total || 0;
                const percentage = maxCategoryAmount > 0 ? (amount / maxCategoryAmount) * 100 : 0;
                const colors = [
                  "bg-teal-600",
                  "bg-emerald-500",
                  "bg-amber-500",
                  "bg-cyan-500",
                  "bg-slate-700",
                  "bg-teal-400",
                ];

                return (
                  <div key={idx}>
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium capitalize text-slate-800">
                        {cat.category || "Other"}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        ${parseFloat(amount).toLocaleString()} · {cat.count || 0} expense{(cat.count || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
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
            <p className="py-8 text-center text-sm text-slate-500">No category analytics available yet.</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-slate-950">Rule configuration view</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Multi-level sequence</p>
              <p className="mt-1">Define ordered approvers such as Manager, Finance, then Director.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Conditional approvals</p>
              <p className="mt-1">Support percentage-based, specific approver, or hybrid rules.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Role management</p>
              <p className="mt-1">Admins can create employees and managers, set reporting relationships, and override approvals when needed.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
