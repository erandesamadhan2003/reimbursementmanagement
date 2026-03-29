import { Inbox } from "lucide-react";

export const EmptyState = ({
  message = "Nothing here yet",
  description,
  action,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-beige-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-teal-400" />
      </div>
      <h3 className="text-lg font-semibold text-teal-900 mb-1">{message}</h3>
      {description && (
        <p className="text-sm text-teal-500 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
