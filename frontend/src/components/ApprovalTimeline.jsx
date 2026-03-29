import { CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";

const stepIcons = {
  approved: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", line: "bg-green-300" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", line: "bg-red-300" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", line: "bg-beige-200" },
};

export const ApprovalTimeline = ({ approvalLogs = [], currentStep }) => {
  // Default approval chain
  const defaultSteps = [
    { role: "Manager", label: "Manager Review" },
    { role: "Finance", label: "Finance Verification" },
    { role: "Director", label: "Director Approval" },
  ];

  // Map logs to steps
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
    };
  });

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const config = stepIcons[step.status];
        const Icon = config.icon;
        const isLast = idx === steps.length - 1;

        return (
          <div key={idx} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              <div className={`p-1.5 rounded-full ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[40px] ${config.line} transition-colors`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
              <p className="text-sm font-semibold text-teal-900">{step.label}</p>
              {step.approver && (
                <p className="text-xs text-teal-600 mt-0.5">
                  by {step.approver}
                </p>
              )}
              {step.timestamp && (
                <p className="text-xs text-teal-400 mt-0.5">
                  {new Date(step.timestamp).toLocaleString()}
                </p>
              )}
              {step.comment && (
                <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-beige-50 border border-beige-200">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-teal-700 italic">"{step.comment}"</p>
                </div>
              )}
              {step.status === "pending" && !step.approver && (
                <p className="text-xs text-amber-500 mt-1">Awaiting review</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
