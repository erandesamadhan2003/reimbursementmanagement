import { useRouteError, useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export const GlobalError = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-teal-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-teal-950 mb-3 tracking-tight">Oops! Something snapped.</h1>
        <p className="text-teal-600 text-sm mb-6">
          We encountered an unexpected error while trying to load this page.
        </p>
        {error && (
          <div className="text-xs text-red-500/80 mb-6 bg-red-50/50 p-3 rounded-xl border border-red-100 font-mono text-left overflow-x-auto">
            {error.statusText || error.message || "Unknown error"}
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-teal-200 text-teal-700 font-bold rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-all shadow-sm"
          >
            <RefreshCcw className="w-4 h-4 text-teal-500" />
            Reload
          </button>
          <button
            onClick={() => navigate("/dashboard", { replace: true })}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-md active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
