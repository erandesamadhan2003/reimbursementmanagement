import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { ApprovalTimeline } from "@/components/ApprovalTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Tag,
  User,
  Image,
  CheckCircle,
  XCircle,
  MessageSquare,
  Receipt,
  Coins,
} from "lucide-react";

export const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedExpense, loading, loadExpense, approve, reject, clearSelected } = useExpenses({ autoFetch: false });
  const { isAdmin, isManager } = useAuth();
  const [rejectComment, setRejectComment] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (id) loadExpense(id);
    return () => clearSelected();
  }, [id]);

  const expense = selectedExpense;

  if (loading || !expense) {
    return <LoadingSpinner fullPage message="Loading expense details..." />;
  }

  const canApprove = (isManager || isAdmin) && expense.status === "pending";

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approve(expense._id);
      toast.success("Expense approved!");
      loadExpense(id);
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) return;
    setActionLoading(true);
    try {
      await reject(expense._id, rejectComment);
      toast.success("Expense rejected");
      setShowRejectInput(false);
      setRejectComment("");
      loadExpense(id);
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const receiptUrl = expense.receipt_url || expense.receiptUrl;

  const detailCards = [
    {
      icon: DollarSign,
      label: "Amount",
      value: formatCurrency(expense.amount, expense.currency || expense.employee_id?.company?.currency || "USD"),
    },
    {
      icon: Coins,
      label: "Company currency",
      value: expense.companyCurrency || expense.company_currency || "Default company currency",
    },
    {
      icon: Tag,
      label: "Category",
      value: expense.category || "Uncategorized",
    },
    {
      icon: Calendar,
      label: "Expense date",
      value: expense.date
        ? new Date(expense.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "Not provided",
    },
    {
      icon: User,
      label: "Submitted by",
      value: expense.user?.fullName || expense.submitter_name || "Employee",
    },
    {
      icon: Receipt,
      label: "Current status",
      value: expense.status || "pending",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
              Expense detail
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              {expense.title || expense.description || "Expense request"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Reference ID: {expense._id?.slice(-8)}
            </p>
          </div>
        </div>
        <StatusBadge status={expense.status} size="md" />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <div className="space-y-6">
          <div className="glass-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-950">Expense overview</h2>
            <p className="mt-2 text-sm text-slate-500">
              Review the submitted reimbursement details, employee context, and supporting information before taking action.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {detailCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 break-words text-sm font-semibold capitalize text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {expense.description && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-teal-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Description
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{expense.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {receiptUrl && (
            <div className="glass-card p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-2">
                <Image className="h-5 w-5 text-teal-700" />
                <h2 className="text-xl font-semibold text-slate-950">Receipt attachment</h2>
              </div>
              <div
                className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:shadow-md"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={receiptUrl}
                  alt="Receipt"
                  className="max-h-[28rem] w-full object-contain"
                />
              </div>
            </div>
          )}

          {canApprove && (
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-950">Manager or admin action</h2>
              <p className="mt-2 text-sm text-slate-500">
                Approve to move the request forward in sequence, or reject with a comment so the employee can revise it.
              </p>

              {!showRejectInput ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:bg-emerald-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve and continue flow
                    </span>
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={actionLoading}
                    className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject with comment
                    </span>
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Explain why this claim is being rejected..."
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                      autoFocus
                      aria-label="Rejection reason"
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => { setShowRejectInput(false); setRejectComment(""); }}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectComment.trim() || actionLoading}
                      className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:bg-red-300"
                    >
                      {actionLoading ? "Rejecting..." : "Confirm rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950">Approval workflow</h2>
          <p className="mt-2 text-sm text-slate-500">
            Follow each stage of the reimbursement process, including sequence-based approvals and any conditional outcome logic.
          </p>
          <div className="mt-6">
            <ApprovalTimeline
              approvalLogs={expense.approval_logs || expense.approvalLogs || []}
              currentStep={expense.currentStep || expense.current_step}
            />
          </div>
        </div>
      </section>

      {lightboxOpen && receiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={receiptUrl}
              alt="Receipt Full View"
              className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
