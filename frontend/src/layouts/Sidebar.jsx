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
  ChevronLeft,
  ChevronRight,
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
  const [collapsed, setCollapsed] = useState(false);
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

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const roleLabel = isAdmin ? "Admin" : isManager ? "Manager" : "Employee";
  const roleBadgeColor = isAdmin
    ? "bg-peach-400 text-teal-900"
    : isManager
      ? "bg-teal-300 text-teal-900"
      : "bg-teal-100 text-teal-700";

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-teal-900 text-white shadow-lg hover:bg-teal-800 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-teal-900 text-white
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-teal-800 shrink-0">
          {!collapsed && (
            <h1 className="text-lg font-bold tracking-tight animate-fade-in">
              <span className="text-peach-400">Expense</span>Flow
            </h1>
          )}
          {collapsed && (
            <span className="text-peach-400 font-bold text-xl mx-auto">E</span>
          )}

          {/* Close on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-teal-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse toggle on desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-teal-800 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${active
                    ? "bg-teal-500 text-white shadow-md"
                    : "text-teal-100 hover:bg-teal-800 hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-teal-300"}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-teal-800 p-3 shrink-0">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold shrink-0">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName || "User"}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
                  {roleLabel}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={`
              mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg
              text-sm text-teal-200 hover:bg-red-500/20 hover:text-red-300
              transition-colors
              ${collapsed ? "justify-center" : ""}
            `}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
