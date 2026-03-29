import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap, Shield, BarChart2 } from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const Login = () => {
  const { login, googleLoginHandler, loading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { clearAuthError(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await login(formData); } catch { /* handled by hook */ }
  };

  const update = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex bg-beige-50 dark:bg-[#0d1117]">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f4f4a] relative overflow-hidden items-center justify-center p-14 flex-col">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-teal-800/60 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-peach-500/10 blur-[120px] translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 max-w-lg w-full">
          {/* Logo */}
          <div className="mb-14">
            <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              <span className="text-peach-400">Expense</span>Flow
            </h1>
            <p className="text-teal-200 text-lg mt-4 leading-relaxed font-medium">
              Streamline expense management with intelligent tracking and approval workflows.
            </p>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-4 mb-14">
            {[
              { value: "Smart", sub: "OCR Scanning", icon: Zap },
              { value: "Fast", sub: "Approvals", icon: Shield },
              { value: "Live", sub: "Tracking", icon: BarChart2 },
            ].map((s) => (
              <div key={s.value} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center">
                <s.icon className="w-6 h-6 text-teal-300 mb-3" />
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-teal-300 mt-1 uppercase tracking-wider font-bold">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Testimonial-style quote */}
          <div className="px-6 py-5 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-xl relative">
            <div className="absolute top-4 left-4 text-4xl text-peach-400/20 font-serif leading-none">"</div>
            <p className="text-base text-white/90 leading-relaxed italic relative z-10 px-2">
              ExpenseFlow cut our reimbursement cycle from 2 weeks to 2 days without lifting a finger.
            </p>
            <p className="text-sm text-peach-300 font-bold mt-4 px-2">— Finance Lead, Acme Corp</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto relative z-10">
        <div className="w-full max-w-md absolute top-8 text-center lg:hidden">
            <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">
              <span className="text-peach-500">Expense</span>Flow
            </h1>
        </div>

        <div className="w-full max-w-[420px] mt-12 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-teal-950 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-base text-teal-600 dark:text-teal-400 font-medium mt-2">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div role="alert" className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm font-semibold text-red-600 dark:text-red-400 animate-scale-in flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-[0.06em] text-teal-700 dark:text-teal-300 mb-2.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-teal-500/60 dark:text-teal-400/60 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={update("email")}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: "3rem" }}
                  className="
                    w-full h-12 pr-4 rounded-xl
                    border border-beige-300 dark:border-white/10 
                    bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-md
                    text-base font-medium text-teal-950 dark:text-white placeholder:text-teal-400 dark:placeholder:text-teal-600
                    focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
                    transition-all duration-200 shadow-sm
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label htmlFor="login-password" className="block text-[11px] font-bold uppercase tracking-[0.06em] text-teal-700 dark:text-teal-300">
                  Password
                </label>
                <button type="button" className="text-[11px] font-bold tracking-wide text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-white transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-teal-500/60 dark:text-teal-400/60 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={update("password")}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
                  className="
                    w-full h-12 rounded-xl
                    border border-beige-300 dark:border-white/10 
                    bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-md
                    text-base font-medium text-teal-950 dark:text-white placeholder:text-teal-400 dark:placeholder:text-teal-600
                    focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
                    transition-all duration-200 shadow-sm
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 text-teal-500 hover:text-teal-800 dark:text-teal-400 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full mt-6 h-12 rounded-xl
                flex items-center justify-center gap-2
                text-base font-bold text-white
                bg-gradient-to-r from-teal-700 to-teal-500 hover:from-teal-800 hover:to-teal-600
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_4px_14px_rgba(42,82,80,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
                hover:shadow-[0_6px_20px_rgba(42,82,80,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            {/* Divider */}
            <div className="relative mt-8 mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-beige-300 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-beige-50 dark:bg-[#0d1117] px-4 text-[10px] font-bold uppercase tracking-widest text-teal-500 dark:text-teal-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            {/* Google */}
            <button
              type="button"
              onClick={googleLoginHandler}
              disabled={loading}
              className="
                w-full h-12 rounded-xl
                flex items-center justify-center gap-3
                text-sm font-bold text-teal-900 dark:text-white
                bg-white dark:bg-[#161b22] border border-beige-300 dark:border-white/10
                hover:bg-beige-100 dark:hover:bg-[#212830]
                shadow-sm active:scale-[0.98]
                transition-all duration-200
              "
            >
              <GoogleIcon />
              Google Authentication
            </button>
          </form>

          <p className="text-center text-sm font-medium text-teal-600 dark:text-teal-400 mt-10">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="font-bold text-teal-800 dark:text-teal-200 hover:text-teal-950 dark:hover:text-white transition-colors underline underline-offset-4 decoration-2 decoration-teal-500/30"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};