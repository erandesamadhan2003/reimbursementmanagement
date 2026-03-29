import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@/store/slices/authSlice";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ToastProvider } from "@/components/ui/Toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { GlobalError } from "@/components/ui/GlobalError";
import "./App.css";

// Lazy loaded pages
const Home = lazy(() => import("@/pages/Home").then((m) => ({ default: m.Home })));
const Login = lazy(() => import("@/pages/auth/Login").then((m) => ({ default: m.Login })));
const Signup = lazy(() => import("@/pages/auth/Signup").then((m) => ({ default: m.Signup })));
const AuthCallBack = lazy(() => import("@/pages/auth/AuthCallBack").then((m) => ({ default: m.AuthCallBack })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const SubmitExpense = lazy(() => import("@/pages/SubmitExpense").then((m) => ({ default: m.SubmitExpense })));
const ExpenseDetail = lazy(() => import("@/pages/ExpenseDetail").then((m) => ({ default: m.ExpenseDetail })));
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminAnalytics = lazy(() => import("@/pages/Admin/AdminAnalytics").then((m) => ({ default: m.AdminAnalytics })));
const AdminUsers = lazy(() => import("@/pages/Admin/AdminUsers").then((m) => ({ default: m.AdminUsers })));
const AdminRules = lazy(() => import("@/pages/Admin/AdminRules").then((m) => ({ default: m.AdminRules })));
const AdminAudit = lazy(() => import("@/pages/Admin/AdminAudit").then((m) => ({ default: m.AdminAudit })));
// Manager pages
const ManagerDashboard = lazy(() => import("@/pages/Manager/ManagerDashboard").then((m) => ({ default: m.ManagerDashboard })));
const ManagerApprovals = lazy(() => import("@/pages/Manager/ManagerApprovals").then((m) => ({ default: m.ManagerApprovals })));
const ManagerTeam = lazy(() => import("@/pages/Manager/ManagerTeam").then((m) => ({ default: m.ManagerTeam })));
const ManagerReports = lazy(() => import("@/pages/Manager/ManagerReports").then((m) => ({ default: m.ManagerReports })));

// Global Authentication Hydrator
const AuthInit = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const hasChecked = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user && !hasChecked.current) {
      hasChecked.current = true;
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  return children;
};

// Route guards

/** Shared loading check used by all guards */
const useAuthReady = () => {
  const { token, isAuthenticated, loading, user, error } = useSelector((state) => state.auth);
  const [tick, setTick] = useState(false);
  
  // We only care about the token in localStorage at initial mount 
  // to know if we need to let AuthInit fetch the user.
  const [initialHasToken] = useState(() => !!localStorage.getItem("token"));
  
  useEffect(() => { 
    const t = setTimeout(() => setTick(true), 10); 
    return () => clearTimeout(t); 
  }, []);
  
  // We are still loading if:
  // 1. We haven't rendered once (tick is false) to prevent hydration flashes
  // 2. Redux says it's actively fetching (loading is true)
  // 3. We started with a token but haven't resolved the user yet (unless it failed)
  const stillLoading = !tick || loading || (initialHasToken && !isAuthenticated && !error);
  
  return { token, isAuthenticated, loading, user, stillLoading };
};

/**
 * ProtectedRoute — any authenticated user can enter.
 * Admin/manager are kicked to their own section so they never land
 * on an employee-only page.
 */
const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated, stillLoading, user } = useAuthReady();

  if (stillLoading) return <LoadingSpinner fullPage message="Loading workspace..." />;
  if (!token || !isAuthenticated) return <Navigate to="/login" replace />;
  // Role-based redirect for privileged users who shouldn't be on /dashboard
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "manager") return <Navigate to="/manager" replace />;
  return children;
};

/**
 * PublicRoute — login/signup pages.
 * Redirects authenticated users to their role-specific home.
 * IMPORTANT: if a token exists but user hasn't loaded yet, show spinner
 * to avoid a flash of the login form followed by a redirect.
 */
const PublicRoute = ({ children }) => {
  const { token, isAuthenticated, stillLoading, user } = useAuthReady();

  // While we're still resolving who the user is (token present, Redux loading)
  if (stillLoading) return <LoadingSpinner fullPage message="Checking authentication..." />;

  if (token && isAuthenticated && user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/**
 * RoleRoute — only allows users whose role is in `roles`.
 * - Not authenticated → /login
 * - Authenticated but wrong role → their own home (no loop)
 */
const RoleRoute = ({ children, roles }) => {
  const { token, isAuthenticated, stillLoading, user } = useAuthReady();

  if (stillLoading) return <LoadingSpinner fullPage message="Verifying access..." />;

  // Not logged in at all
  if (!token || !isAuthenticated || !user) return <Navigate to="/login" replace />;

  // Logged in but wrong role — send to their own home, not /dashboard
  if (!roles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullPage message="Loading..." />}>
    {children}
  </Suspense>
);

/** Index of /dashboard — only employees land here; others are redirected above by ProtectedRoute */
const DashboardIndex = () => (
  <SuspenseWrapper>
    <Dashboard />
  </SuspenseWrapper>
);

const Router = createBrowserRouter([
  {
    path: "/",
    errorElement: <GlobalError />,
    element: (
      <SuspenseWrapper>
        <Home />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <Login />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SuspenseWrapper>
          <Signup />
        </SuspenseWrapper>
      </PublicRoute>
    ),
  },
  {
    path: "/auth/callback",
    element: (
      <SuspenseWrapper>
        <AuthCallBack />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/dashboard",
    errorElement: <GlobalError />,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardIndex />,
      },
      {
        path: "submit",
        element: (
          <SuspenseWrapper>
            <SubmitExpense />
          </SuspenseWrapper>
        ),
      },
      {
        path: "expenses",
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "expenses/:id",
        element: (
          <SuspenseWrapper>
            <ExpenseDetail />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin",
        element: <Navigate to="/admin" replace />,
      },
      {
        path: "settings",
        element: (
          <div className="page-section p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Settings</p>
            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-950">Workspace settings</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Settings are not wired up yet, but this space is now ready for profile, policy, notification, and reimbursement preference controls.
            </p>
          </div>
        ),
      },
    ],
  },
  // ── Manager routes ──────────────────────────────────────────────────────────
  {
    path: "/manager",
    errorElement: <GlobalError />,
    element: (
      <RoleRoute roles={["manager", "admin"]}>
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <ManagerDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "approvals",
        element: (
          <SuspenseWrapper>
            <ManagerApprovals />
          </SuspenseWrapper>
        ),
      },
      {
        path: "team",
        element: (
          <SuspenseWrapper>
            <ManagerTeam />
          </SuspenseWrapper>
        ),
      },
      {
        path: "reports",
        element: (
          <SuspenseWrapper>
            <ManagerReports />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <div className="page-section p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Settings</p>
            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-950">Manager Settings</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Manager settings space is ready for team-wide preference controls.
            </p>
          </div>
        ),
      },
    ],
  },
  // ── Admin routes ─────────────────────────────────────────────────────────────
  {
    path: "/admin",
    errorElement: <GlobalError />,
    element: (
      <RoleRoute roles={["admin"]}>
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <AdminDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "analytics",
        element: (
          <SuspenseWrapper>
            <AdminAnalytics />
          </SuspenseWrapper>
        ),
      },
      {
        path: "users",
        element: (
          <SuspenseWrapper>
            <AdminUsers />
          </SuspenseWrapper>
        ),
      },
      {
        path: "rules",
        element: (
          <SuspenseWrapper>
            <AdminRules />
          </SuspenseWrapper>
        ),
      },
      {
        path: "audit",
        element: (
          <SuspenseWrapper>
            <AdminAudit />
          </SuspenseWrapper>
        ),
      },
      {
        path: "approvals",
        element: (
          <SuspenseWrapper>
            <ManagerApprovals />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <div className="page-section p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Settings</p>
            <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-slate-950">Admin Settings</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Admin settings space is ready for company-wide preference controls.
            </p>
          </div>
        ),
      },
      {
        path: "dashboard",
        element: <Navigate to="/admin" replace />,
      },
    ],
  },
]);

function App() {
  return (
    <ToastProvider>
      <AuthInit>
        <RouterProvider router={Router} />
      </AuthInit>
    </ToastProvider>
  );
}

export default App;
