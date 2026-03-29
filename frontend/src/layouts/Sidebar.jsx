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
  Users,
  BookOpen,
} from "lucide-react";

const NAV_ITEMS = {
  employee: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Submit Expense", icon: PlusCircle, path: "/dashboard/submit" },
    { label: "My Expenses", icon: Receipt, path: "/dashboard/expenses" },
    { label: "Settings", icon: Settings, path: "/dashboard/settings" },
  ],
  manager: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/manager" },
    { label: "Approvals", icon: CheckSquare, path: "/manager/approvals" },
    { label: "My Team", icon: Users, path: "/manager/team" },
    { label: "Reports", icon: BarChart3, path: "/manager/reports" },
    { label: "Settings", icon: Settings, path: "/manager/settings" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Approvals", icon: CheckSquare, path: "/admin/approvals" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Rules", icon: Settings, path: "/admin/rules" },
    { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    { label: "Audit Log", icon: BookOpen, path: "/admin/audit" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ],
};

export const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isManager } = useAuth();

  const userRole = user?.role || "employee";
  const filteredItems = NAV_ITEMS[userRole] || NAV_ITEMS.employee;

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => {
    // Exact match for root-level dashboard paths
    if (path === "/dashboard" || path === "/manager" || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const roleLabel = isAdmin ? "Admin" : isManager ? "Manager" : "Employee";
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "U";


  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-900 text-white shadow-lg lg:hidden"
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
          fixed left-0 top-0 z-20 flex h-screen w-[240px] flex-col border-r border-teal-900/10
          bg-gradient-to-b from-[#0f5c57] to-[#114d49] text-white
          transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:translate-x-0
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

        <div className="px-4 pt-5">
          <div className="h-px bg-white/10" />
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold transition-all duration-300 ease-out
                  ${active
                    ? "bg-teal-300/18 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
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
