import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";

export const DataTable = ({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage = "No data found",
  emptyAction,
}) => {
  if (loading) {
    return (
      <div className="glass-card p-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-10">
        <EmptyState message={emptyMessage} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row._id || row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-slate-100 ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onRowClick) onRowClick(row);
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-5 align-top text-sm text-slate-700"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
