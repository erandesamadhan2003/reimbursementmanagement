import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import "./App.css";
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { Dashboard } from "./pages/Dashboard";
import { useSelector } from "react-redux";
import { AuthCallBack } from "./pages/auth/AuthCallBack";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) {
    return null;
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) {
    return null; 
  }

  if (token && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/auth/callback",
    element: <AuthCallBack />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={Router} />
    </>
  );
}

export default App;
