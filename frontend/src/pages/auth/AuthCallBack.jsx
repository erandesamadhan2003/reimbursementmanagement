import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CheckCircle, XCircle } from "lucide-react";

export const AuthCallBack = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyAuthToken } = useAuth();
  const [status, setStatus] = useState("processing");
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
        return;
      }

      try {
        await verifyAuthToken(token);
        setStatus("success");
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-teal-900/5 border border-beige-200 p-8 max-w-sm w-full text-center animate-scale-in">
        {status === "processing" && (
          <>
            <LoadingSpinner size="lg" message="Completing authentication..." />
            <p className="text-sm text-teal-500 mt-2">Please wait while we verify your credentials</p>
          </>
        )}

        {status === "success" && (
          <div className="animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-approved-bg flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-teal-900">Authentication Successful!</h2>
            <p className="text-sm text-teal-500 mt-2">Redirecting to dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-rejected-bg flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-teal-900">Authentication Failed</h2>
            <p className="text-sm text-teal-500 mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};
