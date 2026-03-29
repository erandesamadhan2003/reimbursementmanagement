import { CheckCircle, XCircle, Clock, MessageSquare, ShieldCheck } from "lucide-react";

const stepIcons = {
  approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", line: "bg-green-300" },
  rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", line: "bg-red-300" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", line: "bg-slate-200" },
};

export const ApprovalTimeline = ({ approvalLogs = [], currentStep }) => {
  const defaultSteps = [
    { role: "Manager", label: "Manager Review", helper: "Direct manager validates policy and context" },
    { role: "Finance", label: "Finance Verification", helper: "Finance checks reimbursement eligibility and currency" },
    { role: "Director", label: "Director Approval", helper: "Final approver confirms the claim for payout" },
  ];

  const steps = defaultSteps.map((step, idx) => {
    const log = approvalLogs.find(
      (l) => l.role?.toLowerCase() === step.role.toLowerCase() ||
        l.approver_role?.toLowerCase() === step.role.toLowerCase()
    ) || approvalLogs[idx];

    let status = "pending";
    if (log) {
      if (log.action === "approved" || log.status === "approved") status = "approved";
      else if (log.action === "rejected" || log.status === "rejected") status = "rejected";
    }

    return {
      ...step,
      status,
      approver: log?.approver_name || log?.actor?.fullName || null,
      comment: log?.comment || null,
      timestamp: log?.timestamp || log?.createdAt || null,
      active: currentStep === idx + 1,
    };
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Approval chain</p>
            <p className="mt-1 text-sm text-slate-500">
              Requests move forward one step at a time and can still respect conditional rules like percentage approvals or specific approver overrides.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, idx) => {
          const config = stepIcons[step.status];
          const Icon = config.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                {!isLast && (
                  <div className={`mt-2 w-0.5 flex-1 min-h-[56px] ${config.line}`} />
                )}
              </div>

              <div className={`pb-8 ${isLast ? "pb-0" : ""} min-w-0 flex-1`}>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{step.helper}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      step.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : step.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}>
                      {step.status}
                    </span>
                  </div>

                  {step.approver && (
                    <p className="mt-3 text-sm text-slate-700">
                      Reviewed by <span className="font-semibold">{step.approver}</span>
                    </p>
                  )}

                  {step.timestamp && (
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                  )}

                  {step.comment && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <p className="text-sm text-slate-600">"{step.comment}"</p>
                    </div>
                  )}

                  {step.status === "pending" && !step.approver && (
                    <p className="mt-3 text-sm text-amber-700">Awaiting action from this stage.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
