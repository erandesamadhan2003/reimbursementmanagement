import { Button } from "@/components/ui/button";
import { Navbar } from "@/layouts/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Google Auth
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Secure and seamless authentication powered by Google OAuth 2.0. Get
            started in seconds with your Google account.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {!isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="px-8 py-6 text-lg"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="px-8 py-6 text-lg"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="px-8 py-6 text-lg"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Secure Authentication
            </h3>
            <p className="text-gray-600">
              Industry-standard OAuth 2.0 protocol ensures your data is always
              protected.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Sign in with Google in seconds. No lengthy forms or password to
              remember.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              User Friendly
            </h3>
            <p className="text-gray-600">
              Simple and intuitive interface designed for the best user
              experience.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Trusted by Users Worldwide
          </h2>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">100%</p>
              <p className="text-gray-600">Secure</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 mb-2">&lt;2s</p>
              <p className="text-gray-600">Sign In Time</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 mb-2">24/7</p>
              <p className="text-gray-600">Available</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust our authentication system.
          </p>
          {!isAuthenticated && (
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="px-10 py-6 text-lg"
            >
              Create Free Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
