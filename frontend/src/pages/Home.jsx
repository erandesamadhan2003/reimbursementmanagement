import { Navbar } from "@/layouts/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  ScanLine,
  GitBranch,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Expense Submission",
    description:
      "Submit expenses with receipt uploads and detailed categorization in seconds.",
    accent: "teal",
  },
  {
    icon: ScanLine,
    title: "Smart OCR Scanning",
    description:
      "Snap a photo of your receipt and let AI auto-fill amount, date, and vendor.",
    accent: "peach",
  },
  {
    icon: GitBranch,
    title: "Approval Workflows",
    description:
      "Multi-level approval chains — Manager, Finance, Director — tracked in real time.",
    accent: "teal",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Real-time dashboards with category breakdowns, approval rates, and trends.",
    accent: "peach",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Employees, managers, and admins each get tailored views and permissions.",
    accent: "teal",
  },
  {
    icon: CheckCircle,
    title: "Audit Trail",
    description:
      "Complete history of every action, approval, and override for compliance.",
    accent: "peach",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<2s", label: "Processing time" },
  { value: "256-bit", label: "Encryption" },
];

/* ── Icon wrapper ─────────────────────────────────────────────── */
const FeatureIcon = ({ icon: Icon, accent }) => {
  const isTeal = accent === "teal";
  return (
    <div
      className={`
        w-11 h-11 rounded-2xl flex items-center justify-center mb-4
        ${isTeal
          ? "bg-teal-50 border border-teal-100"
          : "bg-peach-200/40 border border-peach-300/60"}
      `}
    >
      <Icon
        className={`w-5 h-5 ${isTeal ? "text-teal-500" : "text-peach-500"}`}
      />
    </div>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-beige-50">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-32 w-[480px] h-[480px] rounded-full bg-teal-100/50 blur-3xl" />
          <div className="absolute top-48 -left-24 w-[360px] h-[360px] rounded-full bg-peach-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="
            inline-flex items-center gap-2
            px-3.5 py-1.5 rounded-full
            bg-white border border-teal-100
            text-xs font-bold text-teal-600
            shadow-[0_2px_12px_rgba(66,122,118,0.08)]
            mb-8 animate-fade-in
          ">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse-soft" />
            Modern Expense Management
          </div>

          {/* Headline */}
          <h1 className="
            text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.5rem]
            font-extrabold text-teal-900
            leading-[1.1] tracking-tight
            mb-6 animate-slide-up
          ">
            Expense tracking,{" "}
            <span className="
              inline-block
              text-transparent bg-clip-text
              bg-gradient-to-r from-teal-500 to-peach-400
            ">
              simplified.
            </span>
          </h1>

          {/* Sub */}
          <p
            className="text-lg sm:text-xl text-teal-600 max-w-xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "80ms" }}
          >
            Submit, track, and approve reimbursements with a clean workflow.
            Built for teams that value clarity and speed.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
            style={{ animationDelay: "160ms" }}
          >
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="
                    w-full sm:w-auto
                    px-7 py-3 rounded-xl
                    text-sm font-bold text-white
                    bg-teal-600 hover:bg-teal-500
                    shadow-[0_4px_20px_rgba(66,122,118,0.35)]
                    hover:shadow-[0_6px_28px_rgba(66,122,118,0.45)]
                    active:scale-[0.98]
                    transition-all duration-200
                    flex items-center justify-center gap-2
                  "
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="
                    w-full sm:w-auto
                    px-7 py-3 rounded-xl
                    text-sm font-semibold text-teal-700
                    bg-white border border-beige-300
                    hover:bg-beige-50 hover:border-teal-200
                    shadow-[0_2px_8px_rgba(23,65,67,0.06)]
                    active:scale-[0.98]
                    transition-all duration-200
                  "
                >
                  Sign In
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="
                  px-7 py-3 rounded-xl
                  text-sm font-bold text-white
                  bg-teal-600 hover:bg-teal-500
                  shadow-[0_4px_20px_rgba(66,122,118,0.35)]
                  hover:shadow-[0_6px_28px_rgba(66,122,118,0.45)]
                  active:scale-[0.98]
                  transition-all duration-200
                  flex items-center gap-2
                "
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <section className="border-y border-beige-200 bg-white/70 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-6 sm:gap-12 text-center divide-x divide-beige-200">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="stagger-1 px-4"
                style={{ "--stagger-delay": `${i * 0.1}s` }}
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-teal-400 font-medium mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-900 tracking-tight mb-4">
              Everything your team needs
            </h2>
            <p className="text-teal-500 max-w-md mx-auto leading-relaxed">
              A complete expense management solution built for modern teams who
              move fast.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="
                    group relative
                    bg-white rounded-2xl border border-beige-200 p-6
                    hover:shadow-[0_8px_32px_rgba(23,65,67,0.1)]
                    hover:-translate-y-1
                    transition-all duration-300
                    animate-fade-in-up
                  "
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <FeatureIcon icon={Icon} accent={feature.accent} />
                  <h3 className="text-base font-bold text-teal-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-teal-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="
            relative rounded-3xl p-10 sm:p-14 text-center
            bg-teal-900 overflow-hidden
          ">
            {/* Decorative circles */}
            <div className="pointer-events-none">
              <div className="absolute -top-20 -right-16 w-[300px] h-[300px] rounded-full bg-teal-800" />
              <div className="absolute -bottom-20 -left-12 w-[220px] h-[220px] rounded-full bg-teal-700/50" />
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-peach-400/10 blur-2xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-teal-200 mb-6">
                <Zap className="w-3.5 h-3.5" />
                No credit card required
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Ready to streamline<br className="hidden sm:block" /> your expenses?
              </h2>
              <p className="text-teal-300 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
                Join teams who trust ExpenseFlow for fast, transparent
                reimbursement management.
              </p>

              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/signup")}
                  className="
                    px-8 py-3 rounded-xl
                    text-sm font-bold text-teal-900
                    bg-peach-400 hover:bg-peach-300
                    shadow-[0_4px_20px_rgba(240,154,96,0.35)]
                    hover:shadow-[0_6px_28px_rgba(240,154,96,0.45)]
                    active:scale-[0.98]
                    transition-all duration-200
                  "
                >
                  Start for Free →
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-beige-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-base font-extrabold text-teal-900 tracking-tight">
            <span className="text-peach-400">Expense</span>Flow
          </p>
          <p className="text-xs text-teal-400 font-medium">
            © {new Date().getFullYear()} ExpenseFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};