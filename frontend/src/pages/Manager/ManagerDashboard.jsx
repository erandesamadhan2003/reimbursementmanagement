import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  ArrowRight,
  Briefcase,
  BarChart3,
  Receipt,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

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

const PendingRow = ({ expense, navigate }) => (
  <tr
    className="border-b border-beige-100 hover:bg-beige-50/50 transition-colors cursor-pointer"
    onClick={() => navigate(`/manager/approvals`)}
  >
    <td className="py-3 px-4">
      <div>
        <p className="text-sm font-medium text-teal-900 truncate max-w-[160px]">
          {expense.description || "Untitled"}
        </p>
        <p className="text-xs text-teal-500 capitalize">{expense.category}</p>
      </div>
    </td>
    <td className="py-3 px-4 text-sm font-semibold text-teal-900">
      {expense.currency || "₹"}{parseFloat(expense.amount || 0).toLocaleString()}
    </td>
    <td className="py-3 px-4">
      <StatusBadge status={expense.status} />
    </td>
    <td className="py-3 px-4 text-xs text-teal-500">
      {expense.submittedBy?.fullName || expense.submittedBy?.name || "—"}
    </td>
  </tr>
);

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenses, pendingExpenses, approvedExpenses, rejectedExpenses, loading } = useExpenses();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const recentPending = [...pendingExpenses]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const pendingAmount = pendingExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-400/20 to-teal-500/20 border border-teal-400/30">
              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Manager Panel</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-teal-900">
            {greeting}, {user?.fullName?.split(" ")[0] || "Manager"}! 👋
          </h1>
          <p className="text-sm text-teal-500 mt-1">
            {user?.company?.name} · Here's your team's activity today
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/manager/reports")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-white/70 border border-teal-200 hover:bg-white rounded-xl transition-all shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Reports
          </button>
          <button
            onClick={() => navigate("/manager/approvals")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <CheckSquare className="w-4 h-4" />
            Review Approvals
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Receipt} label="Total Expenses" value={expenses.length} />
            <StatCard icon={Clock} label="Pending Review" value={pendingExpenses.length} />
            <StatCard icon={CheckCircle} label="Approved" value={approvedExpenses.length} />
            <StatCard icon={XCircle} label="Rejected" value={rejectedExpenses.length} />
          </div>

          {/* Financial summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-teal-300" />
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">Total Volume</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">
                ₹{totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-teal-400 mt-1">{expenses.length} expenses submitted</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-100" />
                <span className="text-xs font-semibold text-amber-100 uppercase tracking-wide">Awaiting Your Action</span>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">
                ₹{pendingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-amber-100/80 mt-1">{pendingExpenses.length} pending approvals</p>
            </div>
          </div>

          {/* Content split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending expenses table */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-beige-100">
                <h2 className="font-bold text-teal-900 text-base">Pending Approvals</h2>
                <button
                  onClick={() => navigate("/manager/approvals")}
                  className="text-xs text-teal-500 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {recentPending.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="w-10 h-10 text-teal-200 mx-auto mb-2" />
                  <p className="text-sm text-teal-400">All caught up! No pending approvals.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-beige-50/60">
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Expense</th>
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Amount</th>
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Status</th>
                      <th className="py-2.5 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPending.map((exp) => (
                      <PendingRow key={exp._id} expense={exp} navigate={navigate} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-5">
              <h2 className="font-bold text-teal-900 text-base mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <QuickAction
                  icon={CheckSquare}
                  label="Review Approvals"
                  desc="Approve or reject pending expenses"
                  path="/manager/approvals"
                  color="bg-teal-50 text-teal-600"
                />
                <QuickAction
                  icon={Users}
                  label="My Team"
                  desc="View team members & activity"
                  path="/manager/team"
                  color="bg-blue-50 text-blue-600"
                />
                <QuickAction
                  icon={BarChart3}
                  label="Reports"
                  desc="Team expense analytics"
                  path="/manager/reports"
                  color="bg-peach-300/30 text-peach-500"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
