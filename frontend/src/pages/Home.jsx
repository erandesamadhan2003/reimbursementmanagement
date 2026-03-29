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
      "Upload receipts and categorize expenses instantly with zero friction.",
  },
  {
    icon: ScanLine,
    title: "Smart OCR",
    description:
      "AI extracts amount, date and vendor automatically from receipts.",
  },
  {
    icon: GitBranch,
    title: "Approval Flows",
    description:
      "Multi-level approvals with real-time tracking and notifications.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Clear dashboards with insights, trends and expense breakdowns.",
  },
  {
    icon: Shield,
    title: "Role Access",
    description:
      "Granular permissions for employees, managers and admins.",
  },
  {
    icon: CheckCircle,
    title: "Audit Logs",
    description:
      "Full history of approvals and actions for compliance.",
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/20 blur-[120px]" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
          Expense tracking{" "}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 text-transparent bg-clip-text">
            reimagined.
          </span>
        </h1>

        <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
          Fast, clean and powerful expense management built for modern teams.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:scale-105 transition"
              >
                Get Started <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition"
              >
                Login
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-teal-500 rounded-xl hover:bg-teal-400 flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How it works</h2>
          <p className="text-gray-400">
            Submit, approve and track expenses in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Submit Expense",
              desc: "Upload receipt or enter details in seconds.",
            },
            {
              step: "02",
              title: "Approval Flow",
              desc: "Managers review and approve instantly.",
            },
            {
              step: "03",
              title: "Track & Analyze",
              desc: "Monitor spending with real-time insights.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <p className="text-teal-400 font-bold mb-2">{item.step}</p>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-gray-400">
            Powerful tools to manage expenses effortlessly
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition hover:scale-[1.03]"
              >
                <Icon className="text-teal-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-12 text-black">
          <Zap className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify expenses?
          </h2>
          <p className="mb-6">
            Join teams using ExpenseFlow today.
          </p>

          {!isAuthenticated && (
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3 bg-black text-white rounded-xl hover:scale-105 transition"
            >
              Start Free
            </button>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} ExpenseFlow
      </footer>
    </div>
  );
};