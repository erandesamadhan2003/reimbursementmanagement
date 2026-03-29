import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export const AuthCallBack = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyAuthToken } = useAuth();
  const [status, setStatus] = useState("processing");
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple executions
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const token = searchParams.get("token");

      if (!token) {
        console.error("No token found in URL");
        setStatus("error");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
        return;
      }

      try {
        console.log("Verifying token:", token);
        await verifyAuthToken(token);
        setStatus("success");
        // Navigation is handled in verifyAuthToken
      } catch (error) {
        console.error("Error during token verification:", error);
        setStatus("error");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    handleCallback();
  }, []); // Empty dependency array to run only once

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {status === "processing" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">
              Completing Google Authentication...
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while we verify your credentials
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-semibold">Authentication Failed</h2>
            <p className="text-gray-600 mt-2">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};
