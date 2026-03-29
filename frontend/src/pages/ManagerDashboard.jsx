import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "@/components/ui/Toast";
import { ClipboardCheck, DollarSign, CheckCircle, XCircle, MessageSquare } from "lucide-react";

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { expenses, pendingExpenses, loading, approve, reject, refetch } = useExpenses();
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectComment, setRejectComment] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const totalPendingAmount = pendingExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0), 0
  );

  const handleApprove = async (e, expenseId) => {
    e.stopPropagation();
    setActionLoading(expenseId);
    try {
      await approve(expenseId);
      toast.success("Expense approved successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to approve expense");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectComment.trim()) return;
    setActionLoading(rejectModal.id);
    try {
      await reject(rejectModal.id, rejectComment);
      toast.success("Expense rejected");
      setRejectModal({ open: false, id: null });
      setRejectComment("");
      refetch();
    } catch (err) {
      toast.error("Failed to reject expense");
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: "submitter",
      label: "Employee",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-600">
            {(row.user?.fullName || row.submitter_name || "U").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-teal-900">{row.user?.fullName || row.submitter_name || "Employee"}</span>
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (val, row) => val || row.description || "Untitled",
    },
    {
      key: "category",
      label: "Category",
      render: (val) => (
        <span className="capitalize text-teal-700">{val || "—"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val, row) => (
        <span className="font-semibold text-teal-900">
          {row.currency || "$"}{parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => {
        if (row.status !== "pending") return null;
        const isLoading = actionLoading === row._id;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleApprove(e, row._id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 rounded-md transition-all"
              aria-label="Approve expense"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setRejectModal({ open: true, id: row._id }); }}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-md transition-all"
              aria-label="Reject expense"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-teal-900">Approvals</h1>
        <p className="text-sm text-teal-500 mt-1">Review and manage expense requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardCheck}
          label="Pending Requests"
          value={pendingExpenses.length}
        />
        <StatCard
          icon={DollarSign}
          label="Pending Amount"
          value={`$${totalPendingAmount.toFixed(0)}`}
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={expenses.filter((e) => e.status === "approved").length}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={expenses.filter((e) => e.status === "rejected").length}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        onRowClick={(row) => navigate(`/dashboard/expenses/${row._id}`)}
        emptyMessage="No expense requests to review"
      />

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectModal({ open: false, id: null })} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-beige-200 p-6 max-w-md w-full animate-scale-in">
            <h3 className="text-lg font-bold text-teal-900 mb-2">Reject Expense</h3>
            <p className="text-sm text-teal-500 mb-4">Please provide a reason for rejection.</p>

            <div className="relative mb-4">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-teal-400" />
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-beige-200 bg-beige-50/50 text-sm text-teal-900 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                aria-label="Rejection comment"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal({ open: false, id: null }); setRejectComment(""); }}
                className="px-4 py-2 text-sm font-medium text-teal-700 hover:bg-beige-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectComment.trim() || actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-all"
              >
                {actionLoading ? "Rejecting..." : "Reject Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
