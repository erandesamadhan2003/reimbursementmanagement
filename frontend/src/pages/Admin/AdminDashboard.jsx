import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useExpenses } from "@/hooks/useExpenses";
import { useUsers } from "@/hooks/useUser";
import { formatCurrency } from "@/utils/currency";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Users, Receipt, CheckCircle, XCircle, Clock, TrendingUp,
  ArrowRight, ShieldCheck, BarChart3, BookOpen, Settings,
  AlertTriangle, Zap,
} from "lucide-react";

const CATEGORY_COLORS = {
  travel: "#F09A60",
  food: "#427A76",
  accommodation: "#FCC9A3",
  utilities: "#6EADA8",
  other: "#A8D1CE",
};

const CategoryBar = ({ category, total_amount, count, approved_count, pending_count, user }) => {
  const max = total_amount || 1;
  const pct = Math.min(100, Math.round((approved_count / Math.max(count, 1)) * 100));
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold capitalize text-teal-800">{category}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-teal-500">{count} expenses</span>
          <span className="text-sm font-bold text-teal-900">{formatCurrency(total_amount || 0, user?.company?.currency || "USD")}</span>
        </div>
      </div>
      <div className="h-2.5 bg-beige-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[category] || "#427A76" }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-teal-400">{pct}% approved</span>
        {pending_count > 0 && (
          <span className="text-[10px] text-amber-500">{pending_count} pending</span>
        )}
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, desc, path, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="group flex items-center gap-4 p-4 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 hover:border-teal-200 shadow-sm hover:shadow-md transition-all duration-300 text-left"
    >
      <div className={`p-3 rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-teal-900 text-sm">{label}</p>
        <p className="text-xs text-teal-500 truncate">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-teal-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
    </button>
  );
};

const RecentExpenseRow = ({ expense, navigate }) => (
  <tr
    className="border-b border-beige-100 hover:bg-beige-50/50 transition-colors cursor-pointer"
    onClick={() => navigate(`/dashboard/expenses/${expense._id}`)}
  >
    <td className="py-3 px-4">
      <div>
        <p className="text-sm font-medium text-teal-900 truncate max-w-[180px]">
          {expense.description || "Untitled"}
        </p>
        <p className="text-xs text-teal-500 capitalize">{expense.category}</p>
      </div>
    </td>
    <td className="py-3 px-4 text-sm font-semibold text-teal-900">
      {formatCurrency(expense.amount || 0, expense.currency)}
    </td>
    <td className="py-3 px-4"><StatusBadge status={expense.status} /></td>
    <td className="py-3 px-4 text-xs text-teal-500">
      {expense.date ? new Date(expense.date).toLocaleDateString() : "—"}
    </td>
  </tr>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { summary, byCategory, loading: analyticsLoading } = useAnalytics();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { users, loading: usersLoading } = useUsers();

  const isLoading = analyticsLoading || expensesLoading;
  const recentExpenses = [...expenses].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  ).slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-peach-400/20 to-peach-500/20 border border-peach-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-peach-500" />
              <span className="text-xs font-semibold text-peach-500 uppercase tracking-wide">Admin Control</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-teal-900">
            {greeting}, {user?.fullName?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-sm text-teal-500 mt-1">
            {user?.company?.name} · Here's what's happening today
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/analytics")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-white/70 border border-teal-200 hover:bg-white rounded-xl transition-all shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Receipt}
              label="Total Expenses"
              value={summary?.total_expenses || expenses.length}
            />
            <StatCard
              icon={Clock}
              label="Pending Review"
              value={summary?.count_pending || 0}
            />
            <StatCard
              icon={CheckCircle}
              label="Approved"
              value={summary?.count_approved || 0}
            />
            <StatCard
              icon={Users}
              label="Team Members"
              value={users.length}
            />
          </div>

          {/* Second row — amount stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-teal-300" />
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">Total Approved Value</span>
              </div>
              <p className="mt-3 text-4xl font-extrabold text-white">
                {formatCurrency(summary?.total_approved_amount || 0, user?.company?.currency || "USD")}
              </p>
              <p className="text-xs text-teal-400 mt-1">{summary?.count_approved || 0} expenses paid out</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-orange-100" />
                <span className="text-xs font-semibold text-orange-100 uppercase tracking-wide">Pending Amount</span>
              </div>
              <p className="mt-3 text-4xl font-extrabold text-white">
                {formatCurrency(summary?.total_pending_amount || 0, user?.company?.currency || "USD")}
              </p>
              <p className="text-xs text-orange-100/80 mt-1">Awaiting your team's action</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-indigo-100" />
                <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">Approval Rate</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">
                {summary?.approval_rate || 0}%
              </p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Avg {summary?.avg_resolution_hours || 0}h resolution time
              </p>
            </div>
          </div>

          {/* Main content split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Expenses */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-beige-100">
                <h2 className="font-bold text-teal-900 text-base">Recent Expenses</h2>
                <button
                  onClick={() => navigate("/admin/analytics")}
                  className="text-xs text-teal-500 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {recentExpenses.length === 0 ? (
                <div className="py-12 text-center text-teal-400 text-sm">No expenses yet</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-beige-50/60">
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Expense</th>
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Amount</th>
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Status</th>
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((exp) => (
                      <RecentExpenseRow key={exp._id} expense={exp} navigate={navigate} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sidebar: Category breakdown + Quick Actions */}
            <div className="space-y-4">
              {/* Category breakdown */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
                <h2 className="font-bold text-teal-900 text-base mb-4">By Category</h2>
                {byCategory?.length > 0 ? (
                  <div className="space-y-4">
                    {byCategory.map((cat) => (
                      <CategoryBar key={cat.category} {...cat} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-teal-400 text-center py-4">No data yet</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
                <h2 className="font-bold text-teal-900 text-base mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <QuickAction
                    icon={Users}
                    label="Manage Users"
                    desc="Add, edit, or deactivate team members"
                    path="/admin/users"
                    color="bg-teal-50 text-teal-600"
                  />
                  <QuickAction
                    icon={Settings}
                    label="Approval Rules"
                    desc="Configure multi-step approval chains"
                    path="/admin/rules"
                    color="bg-peach-300/30 text-peach-500"
                  />
                  <QuickAction
                    icon={BarChart3}
                    label="Analytics"
                    desc="Deep dive into expense trends"
                    path="/admin/analytics"
                    color="bg-teal-100 text-teal-700"
                  />
                  <QuickAction
                    icon={BookOpen}
                    label="Audit Log"
                    desc="Full trail of all admin actions"
                    path="/admin/audit"
                    color="bg-beige-100 text-teal-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
