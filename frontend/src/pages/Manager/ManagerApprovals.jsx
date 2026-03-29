import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/currency";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  RefreshCw,
  CheckSquare,
} from "lucide-react";

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm ${className}`}>
    {children}
  </div>
);

const ApprovalModal = ({ expense, onClose, onApprove, onReject, processing }) => {
  const [comment, setComment] = useState("");
  const [action, setAction] = useState(null);
  const { user } = useAuth();

  const handleSubmit = () => {
    if (action === "approve") onApprove(expense._id, comment);
    else if (action === "reject") {
      if (!comment.trim()) return alert("A comment is required when rejecting.");
      onReject(expense._id, comment);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#fbf5ee] rounded-3xl shadow-2xl border border-white/60 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-beige-100">
          <h2 className="text-lg font-bold text-teal-900">Review Expense</h2>
          <p className="text-sm text-teal-500 mt-1 truncate">{expense.description || "Untitled"}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-2xl p-4">
              <p className="text-xs text-teal-500 uppercase tracking-wide font-semibold mb-1">Amount</p>
              <p className="text-base font-bold text-teal-900 truncate">
                {formatCurrency(expense.amount, expense.currency || user?.company?.currency || "USD")}
              </p>
            </div>
            <div className="bg-white/60 rounded-2xl p-4">
              <p className="text-xs text-teal-500 uppercase tracking-wide font-semibold mb-1">Category</p>
              <p className="text-sm font-bold text-teal-900 capitalize">{expense.category || "—"}</p>
            </div>
          </div>
          {expense.submittedBy && (
            <div className="bg-white/60 rounded-2xl p-4">
              <p className="text-xs text-teal-500 uppercase tracking-wide font-semibold mb-1">Submitted By</p>
              <p className="text-sm font-semibold text-teal-900">
                {expense.submittedBy?.fullName || expense.submittedBy?.name || "Unknown"}
              </p>
            </div>
          )}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-teal-800 mb-2">
              <MessageSquare className="w-4 h-4" />
              Comment {action === "reject" && <span className="text-red-400">(required)</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-teal-900 placeholder:text-teal-300 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/10 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction("approve")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                action === "approve"
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => setAction("reject")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                action === "reject"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              }`}
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-teal-700 bg-white/60 border border-teal-200 hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!action || processing}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {processing ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ManagerApprovals = () => {
  const { expenses, pendingExpenses, loading, approve, reject, refetch } = useExpenses();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = expenses
    .filter((e) => {
      const matchesStatus = filter === "all" || e.status === filter;
      const matchesSearch =
        !search ||
        (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.submittedBy?.fullName || "").toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  const handleApprove = async (id, comment) => {
    setProcessing(true);
    try {
      await approve(id, comment);
      setSelectedExpense(null);
      refetch();
    } catch { } finally { setProcessing(false); }
  };

  const handleReject = async (id, comment) => {
    setProcessing(true);
    try {
      await reject(id, comment);
      setSelectedExpense(null);
      refetch();
    } catch { } finally { setProcessing(false); }
  };

  const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {selectedExpense && (
        <ApprovalModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Approvals</h1>
          <p className="text-sm text-teal-500 mt-1">
            {pendingExpenses.length} expense{pendingExpenses.length !== 1 ? "s" : ""} awaiting your review
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-white/70 border border-teal-200 hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-teal-900 placeholder:text-teal-300 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/10"
          />
        </div>
        <div className="flex gap-1 bg-white/60 border border-slate-200 rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === f.value ? "bg-teal-600 text-white shadow-sm" : "text-teal-600 hover:bg-teal-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading expenses..." />
      ) : (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige-50/60 border-b border-beige-100">
                <tr>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Expense</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Amount</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Status</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Employee</th>
                  <th
                    className="py-3 px-5 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide cursor-pointer select-none"
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    <span className="flex items-center gap-1">
                      Date {sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </span>
                  </th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <CheckCircle className="w-10 h-10 text-teal-200 mx-auto mb-2" />
                      <p className="text-sm text-teal-400">No expenses found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((expense) => (
                    <tr key={expense._id} className="border-b border-beige-50 hover:bg-beige-50/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="text-sm font-semibold text-teal-900 truncate max-w-[180px]">
                          {expense.description || "Untitled"}
                        </p>
                        <p className="text-xs text-teal-400 capitalize">{expense.category}</p>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-teal-900">
                        {formatCurrency(expense.amount, expense.currency || user?.company?.currency || "USD")}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusBadge status={expense.status} />
                      </td>
                      <td className="py-3.5 px-5 text-sm text-teal-700">
                        {expense.submittedBy?.fullName || expense.submittedBy?.name || "—"}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-teal-500">
                        {expense.date ? new Date(expense.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3.5 px-5">
                        {expense.status === "pending" ? (
                          <button
                            onClick={() => setSelectedExpense(expense)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-all"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Review
                          </button>
                        ) : (
                          <span className="text-xs text-teal-300 font-medium">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
