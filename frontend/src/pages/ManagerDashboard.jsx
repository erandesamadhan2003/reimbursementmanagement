import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "@/hooks/useExpenses";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "@/components/ui/Toast";
import {
  ClipboardCheck,
  DollarSign,
  CheckCircle,
  XCircle,
  MessageSquare,
  X,
  ShieldCheck,
} from "lucide-react";

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { expenses, pendingExpenses, loading, approve, reject, refetch } =
    useExpenses();

  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectComment, setRejectComment] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const totalPendingAmount = pendingExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount || 0),
    0
  );

  const handleApprove = async (e, expenseId) => {
    e.stopPropagation();
    setActionLoading(expenseId);
    try {
      await approve(expenseId);
      toast.success("Expense approved");
      refetch();
    } catch {
      toast.error("Failed to approve expense");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (e, id) => {
    e.stopPropagation();
    setRejectModal({ open: true, id });
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, id: null });
    setRejectComment("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectComment.trim()) return;
    setActionLoading(rejectModal.id);
    try {
      await reject(rejectModal.id, rejectComment);
      toast.success("Expense rejected");
      closeRejectModal();
      refetch();
    } catch {
      toast.error("Failed to reject expense");
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: "submitter",
      label: "Employee",
      render: (_, row) => {
        const name = row.user?.fullName || row.submitter_name || "Employee";
        const initial = name.charAt(0).toUpperCase();
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="
              flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl
              bg-gradient-to-br from-teal-400 to-teal-600 text-xs font-bold text-white
              shadow-[0_6px_18px_rgba(66,122,118,0.24)]
            ">
              {initial}
            </div>
            <span className="truncate text-sm font-semibold text-teal-900">
              {name}
            </span>
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Title",
      render: (val, row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-teal-800">
            {val || row.description || "Untitled"}
          </p>
          <p className="mt-1 truncate text-xs text-teal-500">
            {row.category || "General"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val, row) => (
        <span className="text-sm font-bold tabular-nums text-teal-900">
          {row.currency || "$"}
          {parseFloat(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
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
        const busy = actionLoading === row._id;
        return (
          <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => handleApprove(e, row._id)}
              disabled={busy}
              aria-label="Approve expense"
              className="
                inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2
                text-xs font-bold text-white shadow-[0_2px_8px_rgba(34,197,94,0.2)]
                transition-all duration-150 hover:bg-emerald-600 active:scale-95 disabled:opacity-50
              "
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {busy ? "..." : "Approve"}
            </button>
            <button
              onClick={(e) => openRejectModal(e, row._id)}
              disabled={busy}
              aria-label="Reject expense"
              className="
                inline-flex items-center gap-1 rounded-xl bg-red-500 px-3 py-2
                text-xs font-bold text-white shadow-[0_2px_8px_rgba(239,68,68,0.2)]
                transition-all duration-150 hover:bg-red-600 active:scale-95 disabled:opacity-50
              "
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <div className="page-section p-6 sm:p-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Manager view
          </div>
          <h1 className="mt-4 text-teal-950">Review requests faster with clearer decision flow.</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base">
            Pending approvals, total exposure, and actions now stay readable on smaller screens while keeping the high-value items visible first.
          </p>
        </div>

        <div className="page-section p-5 animate-fade-in-up" style={{ animationDelay: "90ms" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-400">
            Pending exposure
          </p>
          <p className="mt-3 text-3xl font-bold text-teal-950">
            ${totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-sm text-teal-500">
            {pendingExpenses.length} request{pendingExpenses.length !== 1 ? "s" : ""} awaiting review right now
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Pending Requests" value={pendingExpenses.length} accent="amber" index={0} />
        <StatCard icon={DollarSign} label="Pending Amount" value={`$${totalPendingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="amber" index={1} />
        <StatCard icon={CheckCircle} label="Approved" value={expenses.filter((e) => e.status === "approved").length} accent="green" index={2} />
        <StatCard icon={XCircle} label="Rejected" value={expenses.filter((e) => e.status === "rejected").length} accent="red" index={3} />
      </div>

      {pendingExpenses.length > 0 && (
        <div className="animate-slide-up rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {pendingExpenses.length} expense{pendingExpenses.length !== 1 ? "s" : ""} awaiting your review
                </p>
                <p className="text-xs text-amber-700">
                  Keep approvals moving to avoid reimbursement delays.
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-amber-800">
              Total pending: ${totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        onRowClick={(row) => navigate(`/dashboard/expenses/${row._id}`)}
        emptyMessage="No expense requests to review"
      />

      {rejectModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Reject expense"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeRejectModal}
          />

          <div className="
            page-section relative z-10 w-full max-w-md rounded-[1.8rem] p-6 sm:p-8
            animate-scale-in
          ">
            <button
              onClick={closeRejectModal}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-xl p-1.5 text-teal-400 transition-colors hover:bg-beige-100 hover:text-teal-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>

            <h2 className="text-teal-950">Reject expense</h2>
            <p className="mt-2 text-sm text-teal-500">
              Add a clear reason so the employee can correct and resubmit quickly.
            </p>

            <div className="relative mt-5">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-teal-400" />
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                autoFocus
                aria-label="Rejection comment"
                className="
                  w-full rounded-2xl border border-beige-200 bg-white/80 py-3 pl-10 pr-4
                  text-sm text-teal-900 placeholder:text-teal-300 transition-all resize-none
                  focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/12
                "
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={closeRejectModal}
                className="flex-1 rounded-2xl border border-beige-200 px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-beige-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectComment.trim() || !!actionLoading}
                className="
                  flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white
                  shadow-[0_10px_24px_rgba(239,68,68,0.18)] transition-all duration-150
                  hover:bg-red-600 active:scale-[0.98]
                  disabled:cursor-not-allowed disabled:opacity-40
                "
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
