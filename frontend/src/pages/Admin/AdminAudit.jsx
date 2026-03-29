import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BookOpen, RefreshCw, Search, Filter } from "lucide-react";

const ACTION_META = {
  "expense.approved": { label: "Approved", color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  "expense.rejected": { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  "expense.overridden": { label: "Overridden", color: "bg-peach-300/20 text-peach-500 border-peach-300/30", dot: "bg-peach-400" },
  "user.created": { label: "User Created", color: "bg-teal-100 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  "user.role_changed": { label: "Role Changed", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  "user.deactivated": { label: "Deactivated", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
};

const ActionBadge = ({ action }) => {
  const meta = ACTION_META[action] || { label: action, color: "bg-beige-100 text-teal-600 border-beige-200", dot: "bg-teal-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const MetaPreview = ({ meta }) => {
  if (!meta || Object.keys(meta).length === 0) return <span className="text-teal-400">—</span>;
  const parts = [];
  if (meta.comment) parts.push(`"${meta.comment}"`);
  if (meta.step !== undefined) parts.push(`step ${meta.step}`);
  if (meta.old_role && meta.new_role) parts.push(`${meta.old_role} → ${meta.new_role}`);
  return (
    <span className="text-teal-600 text-xs italic truncate max-w-[200px]" title={JSON.stringify(meta)}>
      {parts.join(" · ") || JSON.stringify(meta).slice(0, 40)}
    </span>
  );
};

const ACTION_TYPES = ["all", ...Object.keys(ACTION_META)];

export const AdminAudit = () => {
  const { auditLog, loading, refetchAuditLog } = useAnalytics({ withAudit: true });
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const filtered = (Array.isArray(auditLog) ? auditLog : []).filter((log) => {
    const actor = log.actor_id?.fullName || log.actor_id?.email || "";
    const matchSearch = actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Audit Log</h1>
          <p className="text-sm text-teal-500 mt-1">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} · Full trail of all admin actions
          </p>
        </div>
        <button
          onClick={() => refetchAuditLog()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-white/70 border border-teal-200 hover:bg-white rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-beige-200 rounded-xl text-sm text-teal-900 placeholder:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
            placeholder="Search by actor or action..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-1 bg-beige-100 rounded-xl p-1 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-teal-400 ml-1 shrink-0" />
          {["all", "expense.approved", "expense.rejected", "expense.overridden", "user.created", "user.role_changed", "user.deactivated"].map((type) => (
            <button
              key={type}
              onClick={() => { setActionFilter(type); setPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${actionFilter === type ? "bg-white text-teal-900 shadow-sm" : "text-teal-500 hover:text-teal-700"}`}
            >
              {type === "all" ? "All" : (ACTION_META[type]?.label || type)}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      {loading ? (
        <LoadingSpinner message="Loading audit log..." />
      ) : paginated.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-teal-400 bg-white/50 rounded-2xl border border-beige-100">
          <BookOpen className="w-10 h-10 opacity-40" />
          <p className="text-sm font-medium">No audit events found</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige-50/60 border-b border-beige-100">
                <tr>
                  {["Actor", "Action", "Details", "Target ID", "Timestamp"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-teal-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((log, i) => (
                  <tr
                    key={log._id || i}
                    className="border-b border-beige-50 hover:bg-beige-50/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-semibold text-teal-900 whitespace-nowrap">
                          {log.actor_id?.fullName || "System"}
                        </p>
                        <p className="text-xs text-teal-400">{log.actor_id?.role || ""}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <MetaPreview meta={log.meta} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-teal-400 font-mono">
                        {log.target_id ? String(log.target_id).slice(-8) : "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-teal-500 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-beige-100">
              <p className="text-xs text-teal-500">
                Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-beige-100 rounded-lg disabled:opacity-40 transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${p === page ? "bg-teal-500 text-white" : "text-teal-600 hover:bg-beige-100"}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-600 hover:bg-beige-100 rounded-lg disabled:opacity-40 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
