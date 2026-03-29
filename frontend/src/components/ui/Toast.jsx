import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const toastConfig = {
  success: { icon: CheckCircle, bg: "bg-green-50 border-green-200", text: "text-green-800", iconColor: "text-green-500" },
  error: { icon: AlertCircle, bg: "bg-red-50 border-red-200", text: "text-red-800", iconColor: "text-red-500" },
  info: { icon: Info, bg: "bg-teal-50 border-teal-200", text: "text-teal-800", iconColor: "text-teal-500" },
};

let toastId = 0;
let addToastFn = null;

export const toast = {
  success: (message) => addToastFn?.({ type: "success", message }),
  error: (message) => addToastFn?.({ type: "error", message }),
  info: (message) => addToastFn?.({ type: "info", message }),
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, message }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => {
            const config = toastConfig[t.type] || toastConfig.info;
            const Icon = config.icon;
            return (
              <div
                key={t.id}
                className={`
                  pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg
                  animate-slide-in-right
                  ${config.bg}
                `}
                role="alert"
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
                <p className={`flex-1 text-sm font-medium ${config.text}`}>{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};
