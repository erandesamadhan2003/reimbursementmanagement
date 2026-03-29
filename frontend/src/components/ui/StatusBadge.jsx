const statusConfig = {
  pending: {
    bg: "bg-status-pending-bg",
    text: "text-amber-700",
    dot: "bg-status-pending",
    label: "Pending",
  },
  approved: {
    bg: "bg-status-approved-bg",
    text: "text-green-700",
    dot: "bg-status-approved",
    label: "Approved",
  },
  rejected: {
    bg: "bg-status-rejected-bg",
    text: "text-red-700",
    dot: "bg-status-rejected",
    label: "Rejected",
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
