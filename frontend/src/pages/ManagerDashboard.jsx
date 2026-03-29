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
  GitBranch,
  ShieldCheck,
} from "lucide-react";

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { expenses, pendingExpenses, loading, approve, reject, refetch } = useExpenses();

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
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-sm font-bold text-teal-700">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{name}</p>
              <p className="truncate text-xs text-slate-500">{row.user?.role || "Employee"}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Expense",
      render: (val, row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {val || row.description || "Untitled"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {row.category || "General"} · Submitted for reimbursement
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-900">
            {row.currency || "$"}
            {parseFloat(val || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-slate-500">Visible in company currency</p>
        </div>
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
        if (row.status !== "pending") return <span className="text-xs text-slate-400">Completed</span>;
        const busy = actionLoading === row._id;
        return (
          <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => handleApprove(e, row._id)}
              disabled={busy}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy ? "Working..." : "Approve"}
            </button>
            <button
              onClick={(e) => openRejectModal(e, row._id)}
              disabled={busy}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.92fr)]">
        <div className="glass-card p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Manager approvals
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold text-slate-950 sm:text-4xl">
            Approve expenses with clear next-step visibility.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
            Review requests, add comments, and move claims to the next approver only after your decision. This view is focused on the manager-first approval stage from your workflow.
          </p>
        </div>

        <div className="glass-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workflow summary</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Sequential approvals</p>
                <p className="text-sm text-slate-500">Manager to Finance to Director can be chained in order.</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Pending exposure</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                ${totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {pendingExpenses.length} request{pendingExpenses.length !== 1 ? "s" : ""} waiting for action
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Pending Requests" value={pendingExpenses.length} accent="amber" />
        <StatCard icon={DollarSign} label="Pending Amount" value={`$${totalPendingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="amber" />
        <StatCard icon={CheckCircle} label="Approved" value={expenses.filter((e) => e.status === "approved").length} accent="green" />
        <StatCard icon={XCircle} label="Rejected" value={expenses.filter((e) => e.status === "rejected").length} accent="red" />
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_360px]">
        <DataTable
          columns={columns}
          data={expenses}
          loading={loading}
          onRowClick={(row) => navigate(`/dashboard/expenses/${row._id}`)}
          emptyMessage="No expense requests to review"
        />

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-slate-950">Approval rules</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Percentage rule</p>
              <p className="mt-1">Example: 60% of assigned approvers can mark a request approved.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Specific approver rule</p>
              <p className="mt-1">Example: CFO approval can auto-complete the flow immediately.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Hybrid rule</p>
              <p className="mt-1">Combine sequence and conditional logic, such as 60% or CFO approval.</p>
            </div>
          </div>
        </div>
      </section>

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="glass-card relative w-full max-w-md p-6">
            <button
              onClick={closeRejectModal}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-xl font-semibold text-slate-950">Reject request</h2>
            <p className="mt-2 text-sm text-slate-500">
              Add a comment so the employee understands what needs to change before resubmitting.
            </p>

            <div className="relative mt-5">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={closeRejectModal}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectComment.trim() || !!actionLoading}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
