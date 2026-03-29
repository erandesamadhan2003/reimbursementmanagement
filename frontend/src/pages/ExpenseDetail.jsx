import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  const metaCards = [
    {
      icon: DollarSign,
      label: "Amount",
      value: `${expense.currency || "$"}${parseFloat(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      icon: Tag,
      label: "Category",
      value: expense.category || "—",
    },
    {
      icon: Calendar,
      label: "Date",
      value: expense.date
        ? new Date(expense.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "—",
    },
    {
      icon: User,
      label: "Submitted By",
      value: expense.user?.fullName || expense.submitter_name || "Employee",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl border border-beige-200 bg-white/70 p-3 transition-all hover:bg-white"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-teal-700" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
              Expense detail
            </p>
            <h1 className="mt-2 text-teal-950">
              {expense.title || expense.description || "Expense Detail"}
            </h1>
            <p className="mt-2 text-sm text-teal-500">
              Reference ID: {expense._id?.slice(-8)}
            </p>
          </div>
        </div>
        <StatusBadge status={expense.status} size="md" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <div className="page-section p-5 sm:p-7 animate-fade-in-up">
            <h2 className="text-teal-950">Expense information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {metaCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-beige-100 bg-white/72 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-teal-50 p-2.5">
                        <Icon className="h-4 w-4 text-teal-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400">
                          {item.label}
                        </p>
                        <p className="mt-1 break-words text-sm font-semibold capitalize text-teal-900 sm:text-base">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {expense.description && (
              <div className="mt-5 border-t border-beige-100 pt-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-teal-50 p-2.5">
                    <FileText className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400">
                      Description
                    </p>
                    <p className="mt-2 text-sm text-teal-700 sm:text-base">{expense.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {receiptUrl && (
            <div className="page-section p-5 sm:p-7 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
              <div className="mb-4 flex items-center gap-2">
                <Image className="h-5 w-5 text-teal-500" />
                <h2 className="text-teal-950">Receipt</h2>
              </div>
              <div
                className="overflow-hidden rounded-[1.5rem] border border-beige-200 bg-beige-50 transition-all hover:shadow-lg cursor-pointer"
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
            <div className="page-section p-5 sm:p-7 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <h2 className="text-teal-950">Approval action</h2>
              <p className="mt-2 text-sm text-teal-500">
                Approve immediately or leave a clear rejection note for the submitter.
              </p>

              {!showRejectInput ? (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-green-600 disabled:bg-green-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </span>
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={actionLoading}
                    className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:bg-red-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </span>
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-3 animate-slide-up">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-teal-400" />
                    <textarea
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Reason for rejection..."
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-beige-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-teal-900 placeholder:text-teal-300 transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/12"
                      autoFocus
                      aria-label="Rejection reason"
                    />
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => { setShowRejectInput(false); setRejectComment(""); }}
                      className="flex-1 rounded-2xl border border-beige-200 px-4 py-3 text-sm font-medium text-teal-700 transition-colors hover:bg-beige-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectComment.trim() || actionLoading}
                      className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:bg-red-300"
                    >
                      {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="page-section p-5 sm:p-7 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-teal-950">Approval timeline</h2>
          <div className="mt-5">
            <ApprovalTimeline approvalLogs={expense.approval_logs || expense.approvalLogs || []} />
          </div>
        </div>
      </div>

      {lightboxOpen && receiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="max-h-[90vh] max-w-4xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
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
