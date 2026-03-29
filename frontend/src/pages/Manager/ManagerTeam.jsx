import { useUsers } from "@/hooks/useUser";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Users, Mail, Briefcase, Search } from "lucide-react";
import { useState } from "react";

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm ${className}`}>
    {children}
  </div>
);

const RoleBadge = ({ role }) => {
  const styles = {
    employee: "bg-blue-50 text-blue-600 border-blue-100",
    manager: "bg-teal-50 text-teal-700 border-teal-100",
    admin: "bg-peach-300/20 text-peach-500 border-peach-300/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${styles[role] || styles.employee}`}>
      {role}
    </span>
  );
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const COLORS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export const ManagerTeam = () => {
  const { users, loading } = useUsers();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  const employees = filtered.filter((u) => u.role === "employee");
  const managers = filtered.filter((u) => u.role === "manager");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">My Team</h1>
          <p className="text-sm text-teal-500 mt-1">
            {users.length} member{users.length !== 1 ? "s" : ""} in your organization
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team members..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-teal-900 placeholder:text-teal-300 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-400/10"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading team..." />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <GlassCard className="p-5 flex items-center gap-4">
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-teal-900">{users.length}</p>
                <p className="text-xs text-teal-500 font-medium">Total Members</p>
              </div>
            </GlassCard>
            <GlassCard className="p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-teal-900">{employees.length}</p>
                <p className="text-xs text-teal-500 font-medium">Employees</p>
              </div>
            </GlassCard>
            <GlassCard className="p-5 flex items-center gap-4">
              <div className="p-3 bg-peach-300/20 rounded-xl border border-peach-300/30">
                <Briefcase className="w-5 h-5 text-peach-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-teal-900">{managers.length}</p>
                <p className="text-xs text-teal-500 font-medium">Managers</p>
              </div>
            </GlassCard>
          </div>

          {/* Team grid */}
          {filtered.length === 0 ? (
            <GlassCard className="py-16 text-center">
              <Users className="w-10 h-10 text-teal-200 mx-auto mb-2" />
              <p className="text-sm text-teal-400">No team members found</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((member, i) => (
                <GlassCard key={member._id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-sm ${COLORS[i % COLORS.length]}`}
                    >
                      {initials(member.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-teal-900 truncate">{member.fullName || "Unknown"}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-teal-500 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="mt-2">
                        <RoleBadge role={member.role} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
