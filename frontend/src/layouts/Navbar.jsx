import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-beige-200"
          : "bg-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold tracking-tight"
          >
            <span className="text-peach-400">Expense</span>
            <span className="text-teal-900">Flow</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors rounded-lg hover:bg-teal-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors rounded-lg hover:bg-teal-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors rounded-lg hover:bg-teal-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-beige-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5 text-teal-900" /> : <Menu className="w-5 h-5 text-teal-900" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-beige-200 animate-slide-up">
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                    className="px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg text-left transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg text-left transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { navigate("/login"); setMenuOpen(false); }}
                    className="px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg text-left transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate("/signup"); setMenuOpen(false); }}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-lg text-center transition-all"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
