export const StatCard = ({
  icon: Icon,
  label,
  value,
  className = "",
  accent = "teal",
}) => {
  const accentStyles = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`glass-card p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentStyles[accent] || accentStyles.teal}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};
