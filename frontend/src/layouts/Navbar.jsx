import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <>
      <div className="flex justify-between items-center p-3 border-b">
        <div>
          <h5>Google Auth</h5>
        </div>

        <div>
          <Button
            variant="link"
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
          {isAuthenticated && (
            <Button
              variant="link"
              className="cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              dashboard
            </Button>
          )}
        </div>

        <div>
          {isAuthenticated ? (
            <>
              <span className="mr-4">Welcome, {user?.fullName}</span>
              <Button
                variant="link"
                className="cursor-pointer"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="link"
                className="cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                variant="link"
                className="cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Signup
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
