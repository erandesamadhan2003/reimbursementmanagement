import { Inbox } from "lucide-react";

export const EmptyState = ({
  message = "Nothing here yet",
  description,
  action,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{message}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-800"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
