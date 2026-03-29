import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["employee", "manager", "admin"] },
  { label: "Submit Expense", icon: PlusCircle, path: "/dashboard/submit", roles: ["employee"] },
  { label: "My Expenses", icon: Receipt, path: "/dashboard/expenses", roles: ["employee"] },
  { label: "Approvals", icon: CheckSquare, path: "/dashboard/approvals", roles: ["manager", "admin"] },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/admin", roles: ["admin"] },
  { label: "Settings", icon: Settings, path: "/dashboard/settings", roles: ["employee", "manager", "admin"] },
];

export const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isManager } = useAuth();

  const userRole = user?.role || "employee";
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const roleLabel = isAdmin ? "Admin" : isManager ? "Manager" : "Employee";
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-900 text-white shadow-lg lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/28 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[272px] flex-col border-r border-slate-200 bg-[#0f5c57] text-white
          transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-100/70">
              Workspace
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              ExpenseFlow
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-teal-100/80 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold transition-all duration-200
                  ${active
                    ? "bg-white text-teal-900 shadow-[0_14px_30px_rgba(8,38,37,0.18)]"
                    : "text-teal-50/92 hover:bg-white/10"
                  }
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-teal-700" : "text-teal-100"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-2xl bg-white/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.fullName || "User"}
                </p>
                <p className="mt-0.5 text-xs text-teal-100/80">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-teal-50/92 transition-all hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
