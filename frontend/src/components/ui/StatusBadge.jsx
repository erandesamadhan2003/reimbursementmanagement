const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "amber",
  },
  approved: {
    label: "Approved",
    color: "green",
  },
  rejected: {
    label: "Rejected",
    color: "red",
  },
};

const COLOR_STYLES = {
  amber: {
    container: "border border-amber-200/70 bg-amber-100/80 text-amber-800",
    dot: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.25)]",
  },
  green: {
    container: "border border-green-200/70 bg-green-100/80 text-green-800",
    dot: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.25)]",
  },
  red: {
    container: "border border-red-200/70 bg-red-100/80 text-red-800",
    dot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.25)]",
  },
};

export const StatusBadge = ({
  status = "pending",
  size = "sm",
  showDot = true,
  className = "",
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const styles = COLOR_STYLES[config.color] || COLOR_STYLES.amber;

  const sizeStyles = {
    sm: "text-[11px] px-3 py-1",
    md: "text-xs px-3.5 py-1.5",
    lg: "text-sm px-4 py-2",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide
        shadow-sm transition-all duration-300 ease-out hover:scale-[1.04]
        ${styles.container}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {showDot && (
        <span
          className={`
            h-1.5 w-1.5 rounded-full animate-pulse-soft
            ${styles.dot}
          `}
        />
      )}

      {config.label}
    </span>
  );
};
