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
      <div className="bg-white rounded-xl border border-beige-200 overflow-hidden">
        <div className="p-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-beige-200 p-8">
        <EmptyState message={emptyMessage} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-beige-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-beige-200 bg-beige-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-teal-600 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-100">
            {data.map((row, idx) => (
              <tr
                key={row._id || row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-all duration-200
                  hover:bg-teal-50/50 hover:shadow-sm
                  ${onRowClick ? "cursor-pointer" : ""}
                  animate-fade-in
                `}
                style={{ animationDelay: `${idx * 30}ms` }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onRowClick) onRowClick(row);
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-sm text-teal-800">
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
