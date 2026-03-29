import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/layouts/Navbar";
import { useEffect, useState } from "react";

export const Signup = () => {
  const { register, googleLoginHandler, loading, error, clearAuthError } =
    useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    clearAuthError();
  }, []); // Only clear error on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Create an Account
          </h2>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />

            <Input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing up..." : "Sign Up"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={googleLoginHandler}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Processing..." : "Sign Up with Google"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
