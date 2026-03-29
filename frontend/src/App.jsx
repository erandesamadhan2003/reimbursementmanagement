import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ToastProvider } from "@/components/ui/Toast";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import "./App.css";

// Lazy loaded pages
const Home = lazy(() => import("@/pages/Home").then((m) => ({ default: m.Home })));
const Login = lazy(() => import("@/pages/auth/Login").then((m) => ({ default: m.Login })));
const Signup = lazy(() => import("@/pages/auth/Signup").then((m) => ({ default: m.Signup })));
const AuthCallBack = lazy(() => import("@/pages/auth/AuthCallBack").then((m) => ({ default: m.AuthCallBack })));
const Dashboard = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const SubmitExpense = lazy(() => import("@/pages/SubmitExpense").then((m) => ({ default: m.SubmitExpense })));
const ExpenseDetail = lazy(() => import("@/pages/ExpenseDetail").then((m) => ({ default: m.ExpenseDetail })));
const ManagerDashboard = lazy(() => import("@/pages/ManagerDashboard").then((m) => ({ default: m.ManagerDashboard })));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const Settings = lazy(() => import("@/pages/Settings").then((m) => ({ default: m.Settings })));

// Route guards
const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;
  if (!token || !isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;
  if (token && isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullPage message="Loading..." />}>
    {children}
  </Suspense>
);

const Router = createBrowserRouter([
  {
    path: "/",
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
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
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
        path: "approvals",
        element: (
          <RoleRoute roles={["manager", "admin"]}>
            <SuspenseWrapper>
              <ManagerDashboard />
            </SuspenseWrapper>
          </RoleRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleRoute roles={["admin"]}>
            <SuspenseWrapper>
              <AdminDashboard />
            </SuspenseWrapper>
          </RoleRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <SuspenseWrapper>
            <Settings />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={Router} />
    </ToastProvider>
  );
}

export default App;
