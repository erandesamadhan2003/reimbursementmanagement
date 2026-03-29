import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Receipt, Clock, CheckCircle, XCircle, PlusCircle } from "lucide-react";

const filterTabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    expenses,
    pendingExpenses,
    approvedExpenses,
    rejectedExpenses,
    loading,
  } = useExpenses();

  const [activeFilter, setActiveFilter] = useState("all");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const filteredExpenses =
    activeFilter === "all"
      ? expenses
      : expenses.filter((e) => e.status === activeFilter);

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (val, row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {val || row.description || "Untitled"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {row.category || "General"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val, row) => (
        <span className="font-semibold text-slate-900">
          {row.currency || "$"}
          {parseFloat(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "date",
      label: "Date",
      render: (val, row) => (
        <span className="text-sm text-slate-500">
          {val
            ? new Date(val).toLocaleDateString()
            : row.createdAt
              ? new Date(row.createdAt).toLocaleDateString()
              : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="page-section p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
            {greeting}
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.25rem,4vw,4.3rem)] font-extrabold leading-[0.95] text-slate-950">
            Welcome back, {user?.fullName?.split(" ")[0] || "there"}.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Track submissions, monitor approvals, and keep reimbursements moving from one clean dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard/submit")}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-800"
            >
              <PlusCircle className="h-4 w-4" />
              Submit Expense
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Review Pending
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="page-section p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">This month</p>
            <p className="mt-3 text-5xl font-bold text-slate-950">{expenses.length}</p>
            <p className="mt-2 text-sm text-slate-500">total requests tracked across your workflow</p>
          </div>
          <div className="page-section p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approved value</p>
            <p className="mt-3 text-5xl font-bold text-slate-950">
              ${approvedExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-2 text-sm text-slate-500">reimbursed across approved expenses</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Receipt} label="Total Expenses" value={expenses.length} />
        <StatCard icon={Clock} label="Pending" value={pendingExpenses.length} accent="amber" />
        <StatCard icon={CheckCircle} label="Approved" value={approvedExpenses.length} accent="green" />
        <StatCard icon={XCircle} label="Rejected" value={rejectedExpenses.length} accent="red" />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-950">Recent expenses</h2>
            <p className="mt-2 text-base text-slate-500">
              Filter and review your latest reimbursement activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-teal-700 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredExpenses}
          loading={loading}
          onRowClick={(row) => navigate(`/dashboard/expenses/${row._id}`)}
          emptyMessage="No expenses found"
          emptyAction={{
            label: "Submit your first expense",
            onClick: () => navigate("/dashboard/submit"),
          }}
        />
      </section>
    </div>
  );
};
