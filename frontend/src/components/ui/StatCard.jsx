import { useEffect, useState, useRef } from "react";

export const StatCard = ({ icon: Icon, label, value, trend, trendLabel, className = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const numericValue = typeof value === "number" ? value : parseInt(value) || 0;

  useEffect(() => {
    if (numericValue === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const end = numericValue;
    const duration = 800;
    const stepTime = Math.max(Math.floor(duration / end), 16);
    const increment = Math.max(1, Math.ceil(end / (duration / stepTime)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [numericValue]);

  const formattedValue = typeof value === "string" && value.startsWith("$")
    ? `$${displayValue.toLocaleString()}`
    : typeof value === "string" && value.includes(".")
      ? value
      : displayValue.toLocaleString();

  return (
    <div
      ref={ref}
      className={`
        relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/60
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(42,82,80,0.08)]
        hover:-translate-y-1 transition-all duration-500 ease-out
        animate-scale-in group
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
            {Icon && <Icon className="w-6 h-6 text-teal-600 drop-shadow-sm" />}
          </div>
          {trend !== undefined && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${
                trend >= 0
                  ? "bg-green-100/80 text-green-700 border border-green-200/50"
                  : "bg-red-100/80 text-red-700 border border-red-200/50"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-extrabold bg-gradient-to-br from-teal-900 to-teal-700 bg-clip-text text-transparent mb-1 tracking-tight">{formattedValue}</p>
        <p className="text-sm font-medium text-teal-600/80">{label}</p>
        {trendLabel && <p className="text-xs font-medium text-teal-400 mt-1">{trendLabel}</p>}
      </div>
      </div>
    </div>
  );
};
