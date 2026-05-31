import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Cpu, LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";
import { logout } from "../redux/authSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Read authentication status from Redux
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Theme switcher state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    // Clear credentials from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    // Fire Redux logout action
    dispatch(logout());
    // Redirect to home landing portal
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center max-w-full">
      {/* Brand logo & name */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <Cpu className="text-white animate-spin-slow" size={16} />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white leading-none">AetherQueue</h1>
          <span className="text-[7px] font-bold text-indigo-400 tracking-[0.25em] uppercase block">Control Node</span>
        </div>
      </Link>

      {/* Navigation options */}
      <div className="flex items-center gap-6">
        {/* Premium Sun/Moon Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center justify-center shadow-inner"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {isAuthenticated ? (
          <>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <LayoutDashboard size={15} className="text-indigo-400" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Disconnect</span>
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Register Node
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;