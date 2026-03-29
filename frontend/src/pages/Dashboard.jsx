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
  const { expenses, pendingExpenses, approvedExpenses, rejectedExpenses, loading } = useExpenses();
  const [activeFilter, setActiveFilter] = useState("all");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const filteredExpenses = activeFilter === "all"
    ? expenses
    : expenses.filter((e) => e.status === activeFilter);

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (val, row) => (
        <div>
          <p className="font-medium text-teal-900">{val || row.description || "Untitled"}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige-100 text-teal-700 capitalize">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val, row) => (
        <span className="font-semibold text-teal-900">
          {row.currency || "$"}{parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
        <span className="text-teal-500 text-sm">
          {val ? new Date(val).toLocaleDateString() : row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">
            {greeting}, {user?.fullName?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-sm text-teal-500 mt-1">
            Here's your expense overview
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/submit")}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Receipt}
          label="Total Expenses"
          value={expenses.length}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingExpenses.length}
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={approvedExpenses.length}
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={rejectedExpenses.length}
        />
      </div>

      {/* Filter tabs + Table */}
      <div>
        <div className="flex items-center gap-1 mb-4 p-1 bg-beige-100 rounded-lg w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${activeFilter === tab.key
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-teal-500 hover:text-teal-700"
                }
              `}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({tab.key === "pending" ? pendingExpenses.length
                    : tab.key === "approved" ? approvedExpenses.length
                    : rejectedExpenses.length})
                </span>
              )}
            </button>
          ))}
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
      </div>
    </div>
  );
};
