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
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Expense Submission",
    description: "Submit expenses with receipt uploads and detailed categorization in seconds.",
  },
  {
    icon: ScanLine,
    title: "Smart OCR Scanning",
    description: "Snap a photo of your receipt and let AI auto-fill amount, date, and vendor.",
  },
  {
    icon: GitBranch,
    title: "Approval Workflows",
    description: "Multi-level approval chains — Manager, Finance, Director — all tracked in real time.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Real-time dashboards with category breakdowns, approval rates, and trends.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Employees, managers, and admins each get tailored views and permissions.",
  },
  {
    icon: CheckCircle,
    title: "Audit Trail",
    description: "Complete history of every action, approval, and override for compliance.",
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-beige-50">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-xs font-semibold text-teal-600 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Modern Expense Management
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-teal-900 mb-6 leading-tight animate-slide-up">
            Expense tracking,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-peach-400">
              simplified
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-teal-600 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Submit, track, and approve reimbursements with a clean workflow. Built for teams that value clarity and speed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-3 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 text-sm font-medium text-teal-700 border border-beige-300 bg-white hover:bg-beige-50 rounded-lg transition-all"
                >
                  Sign In
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-beige-200 bg-white/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "<2s", label: "Processing" },
              { value: "256-bit", label: "Encryption" },
            ].map((stat, idx) => (
              <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <p className="text-2xl sm:text-3xl font-bold text-teal-500">{stat.value}</p>
                <p className="text-sm text-teal-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 mb-4">
              Everything you need
            </h2>
            <p className="text-teal-600 max-w-xl mx-auto">
              A complete expense management solution built for modern teams
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-beige-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="p-3 rounded-lg bg-teal-50 w-fit mb-4">
                    <Icon className="w-6 h-6 text-teal-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-teal-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto bg-teal-900 rounded-2xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] rounded-full bg-teal-800/50" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[300px] h-[300px] rounded-full bg-teal-700/30" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to streamline your expenses?
            </h2>
            <p className="text-teal-200 mb-8 max-w-lg mx-auto">
              Join teams who trust ExpenseFlow for fast, transparent reimbursement management.
            </p>
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-3 text-sm font-semibold text-teal-900 bg-peach-400 hover:bg-peach-300 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Start for Free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-beige-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-teal-900">
            <span className="text-peach-400">Expense</span>Flow
          </p>
          <p className="text-xs text-teal-500">
            © {new Date().getFullYear()} ExpenseFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
