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
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const receiptUrl = expense.receipt_url || expense.receiptUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-beige-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-teal-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-teal-900">
              {expense.title || expense.description || "Expense Detail"}
            </h1>
            <p className="text-sm text-teal-500 mt-0.5">
              ID: {expense._id?.slice(-8)}
            </p>
          </div>
        </div>
        <StatusBadge status={expense.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Info Card */}
          <div className="bg-white rounded-xl border border-beige-200 p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-teal-900 mb-4">Expense Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-50">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-teal-500">Amount</p>
                  <p className="text-lg font-bold text-teal-900">
                    {expense.currency || "$"}{parseFloat(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-50">
                  <Tag className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-teal-500">Category</p>
                  <p className="text-sm font-medium text-teal-900 capitalize">{expense.category || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-50">
                  <Calendar className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-teal-500">Date</p>
                  <p className="text-sm font-medium text-teal-900">
                    {expense.date
                      ? new Date(expense.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-50">
                  <User className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-xs text-teal-500">Submitted By</p>
                  <p className="text-sm font-medium text-teal-900">
                    {expense.user?.fullName || expense.submitter_name || "Employee"}
                  </p>
                </div>
              </div>
            </div>

            {expense.description && (
              <div className="mt-4 pt-4 border-t border-beige-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-50">
                    <FileText className="w-4 h-4 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-500">Description</p>
                    <p className="text-sm text-teal-800 mt-1">{expense.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Receipt Preview */}
          {receiptUrl && (
            <div className="bg-white rounded-xl border border-beige-200 p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-bold text-teal-900">Receipt</h2>
              </div>
              <div
                className="rounded-lg overflow-hidden border border-beige-200 bg-beige-50 cursor-pointer hover:shadow-md transition-all"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={receiptUrl}
                  alt="Receipt"
                  className="w-full max-h-80 object-contain"
                />
              </div>
            </div>
          )}

          {/* Approve / Reject Actions */}
          {canApprove && (
            <div className="bg-white rounded-xl border border-beige-200 p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <h2 className="text-lg font-bold text-teal-900 mb-4">Actions</h2>

              {!showRejectInput ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 rounded-lg transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-slide-up">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-teal-400" />
                    <textarea
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Reason for rejection..."
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-beige-200 bg-beige-50/50 text-sm text-teal-900 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                      autoFocus
                      aria-label="Rejection reason"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowRejectInput(false); setRejectComment(""); }}
                      className="flex-1 py-2 text-sm font-medium text-teal-700 border border-beige-200 hover:bg-beige-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectComment.trim() || actionLoading}
                      className="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-all"
                    >
                      {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Approval Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-beige-200 p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <h2 className="text-lg font-bold text-teal-900 mb-4">Approval Timeline</h2>
            <ApprovalTimeline approvalLogs={expense.approval_logs || expense.approvalLogs || []} />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && receiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="max-w-4xl max-h-[90vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={receiptUrl}
              alt="Receipt Full View"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
