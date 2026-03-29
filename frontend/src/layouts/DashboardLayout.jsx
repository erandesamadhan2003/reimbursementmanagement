import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          {/* Left — spacing for mobile menu button */}
          <div className="lg:hidden w-10" />

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
              <input
                type="search"
                placeholder="Search expenses..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/80 border border-white/60 shadow-inner text-sm text-teal-900 placeholder:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all hover:bg-white"
                aria-label="Search expenses"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              className="relative p-2.5 rounded-xl bg-white/60 border border-white hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 pointer-cursor"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-teal-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-peach-400 rounded-full" />
            </button>

            {/* User */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-teal-900">{user?.fullName || "User"}</p>
                <p className="text-xs text-teal-500">{user?.company?.name || "Company"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm flex items-center justify-center text-white text-sm font-bold shadow-[0_4px_12px_rgba(42,82,80,0.2)]">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
