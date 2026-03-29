import { Outlet } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

export const DashboardLayout = () => {
  const { user } = useAuth();
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-dvh bg-[#f6f8fb] text-slate-900">
      <div className="flex min-h-dvh">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#f6f8fb]/96 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
              <div className="hidden max-w-xl flex-1 md:block">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search expenses, receipts, or employees"
                    aria-label="Search expenses"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button
                  aria-label="View notifications"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900"
                >
                  <Bell className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.company?.name || "Company"}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-sm font-bold text-white">
                    {initial}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
