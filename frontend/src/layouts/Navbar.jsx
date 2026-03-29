import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ArrowRight } from "lucide-react";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close menu on route change */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const go = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-beige-200 shadow-[0_2px_16px_rgba(23,65,67,0.06)]"
          : "bg-transparent"
        }
      `}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => go("/")}
            className="text-xl font-extrabold tracking-tight focus-visible:outline-none"
          >
            <span className="text-peach-400">Expense</span>
            <span className={`transition-colors duration-300 ${scrolled ? "text-teal-900" : "text-teal-900"}`}>
              Flow
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => go("/dashboard")}
                  className="px-4 py-2 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-xl transition-all duration-150"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-teal-500 hover:text-teal-800 hover:bg-beige-100 rounded-xl transition-all duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => go("/login")}
                  className="px-4 py-2 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-xl transition-all duration-150"
                >
                  Sign In
                </button>
                <button
                  onClick={() => go("/signup")}
                  className="
                    ml-1 px-5 py-2 rounded-xl
                    text-sm font-bold text-white
                    bg-teal-600 hover:bg-teal-500
                    shadow-[0_4px_16px_rgba(66,122,118,0.3)]
                    hover:shadow-[0_6px_20px_rgba(66,122,118,0.4)]
                    active:scale-[0.98]
                    transition-all duration-150
                    flex items-center gap-1.5
                  "
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-xl hover:bg-beige-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? <X className="w-5 h-5 text-teal-900" />
              : <Menu className="w-5 h-5 text-teal-900" />
            }
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-beige-200 animate-slide-down">
            <div className="flex flex-col gap-1 pt-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => go("/dashboard")}
                    className="px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 rounded-xl text-left transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="px-4 py-2.5 text-sm font-semibold text-teal-500 hover:bg-beige-100 rounded-xl text-left transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => go("/login")}
                    className="px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 rounded-xl text-left transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => go("/signup")}
                    className="
                      mt-1 px-4 py-2.5 rounded-xl text-center
                      text-sm font-bold text-white
                      bg-teal-600 hover:bg-teal-500
                      transition-all duration-150
                    "
                  >
                    Get Started →
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