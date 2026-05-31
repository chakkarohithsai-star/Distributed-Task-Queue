import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Cpu, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import API from "../api/axios";
import { loginSuccess } from "../redux/authSlice";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client"); // Default role selection
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Google SSO simulated states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [customGoogleRole, setCustomGoogleRole] = useState("client");
  const [showCustomFields, setShowCustomFields] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleSSO = async (profile) => {
    try {
      setLoading(true);
      setErrorMsg("");
      setShowGoogleModal(false);

      const res = await API.post("/auth/google-sso", {
        email: profile.email,
        name: profile.name,
        role: profile.role
      });

      // Save token, role, and profile details in localStorage on success
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role); 
      localStorage.setItem("name", res.data.name || "");
      localStorage.setItem("email", res.data.email || "");
      localStorage.setItem("userId", res.data.id || "");
      
      // Update Redux store
      dispatch(loginSuccess(res.data.token));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("[Google SSO] Auth Error:", error);
      setErrorMsg(error.response?.data?.message || "Connection refused by SSO server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please supply both credentials.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      // 1. Send authentication request to backend
      const res = await API.post("/auth/login", { email, password });
      
      // 2. Validate role alignment
      if (res.data.role !== role) {
        setErrorMsg(`Role mismatch. The account is registered as a '${res.data.role}', not a '${role}'.`);
        return;
      }

      // 3. Save token, role, and profile details in localStorage on success
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role); // Automatically saves the registered role
      localStorage.setItem("name", res.data.name || "");
      localStorage.setItem("email", res.data.email || "");
      localStorage.setItem("userId", res.data.id || "");
      
      // 4. Update Redux store
      dispatch(loginSuccess(res.data.token));

      // 5. Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("[Login] Auth Error:", error);
      setErrorMsg(error.response?.data?.message || "Connection refused by authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-between select-none relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/5 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-500/5 blur-[80px]" />

      <div className="flex-1 flex items-center justify-center p-6 w-full z-10">
        <form
          onSubmit={handleLogin}
          className="relative z-10 glass-card bg-slate-950/60 p-8 rounded-2xl w-full max-w-md border border-slate-900"
        >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="text-white animate-spin-slow" size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-2">AetherQueue Console</h2>
          <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Security Gateway</span>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Input */}
        <div className="mb-5 space-y-1.5">
          <label htmlFor="login-email" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-4 text-slate-500" size={18} />
            <input
              id="login-email"
              type="email"
              placeholder="operator@company.com"
              autoComplete="username"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-900 focus:border-indigo-500/50 text-white placeholder-slate-600 text-sm rounded-xl outline-none focus:shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)] transition-all duration-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-5 space-y-1.5">
          <label htmlFor="login-password" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Security Code</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-4 text-slate-500" size={18} />
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-900 focus:border-indigo-500/50 text-white placeholder-slate-600 text-sm rounded-xl outline-none focus:shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)] transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Role selection dropdown */}
        <div className="mb-6 space-y-1.5">
          <label htmlFor="login-role" className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Node Authority Role</label>
          <select
            id="login-role"
            className="w-full px-4 py-3 bg-slate-950/85 border border-slate-900 focus:border-indigo-500/50 text-white text-sm rounded-xl outline-none transition-all duration-300 cursor-pointer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="client" className="bg-[#0b0f19] text-white">Client (Queue Submitter)</option>
            <option value="worker" className="bg-[#0b0f19] text-white">Worker Node (Background Processor)</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform active:translate-y-0 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <span>{loading ? "Decrypting Node..." : "Authenticate Node"}</span>
          {!loading && <LogIn size={16} />}
        </button>

        {/* Google SSO Divider */}
        <div className="relative flex items-center justify-center my-5">
          <div className="border-t border-slate-900 w-full" />
          <span className="bg-[#0b0f19] px-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest absolute">Or</span>
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="w-full py-3 rounded-xl border border-slate-900 bg-slate-950/40 hover:bg-slate-900/40 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer"
          disabled={loading}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.69 3.42-4.51 6.76-4.51z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.71-4.92 3.71-8.6z"
            />
            <path
              fill="#FBBC05"
              d="M5.24 14.55c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.39 7.2A11.967 11.967 0 000 12c0 1.79.39 3.5 1.09 5.04l4.15-3.49z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.34 0-5.86-1.82-6.76-4.51L1.09 17.3A11.97 11.97 0 0012 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footnote Link */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Need operational access?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Register operator
          </Link>
        </p>
      </form>
      </div>

      {/* Simulated Google Accounts Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-[#ffffff] text-slate-800 p-8 rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl relative flex flex-col items-center">
            
            <svg className="w-8 h-8 mb-3 animate-spin-slow" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.69 3.42-4.51 6.76-4.51z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.71-4.92 3.71-8.6z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.55c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.39 7.2A11.967 11.967 0 000 12c0 1.79.39 3.5 1.09 5.04l4.15-3.49z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.34 0-5.86-1.82-6.76-4.51L1.09 17.3A11.97 11.97 0 0012 23z"
              />
            </svg>
            
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Sign in with Google</h2>
            <p className="text-slate-500 text-xs mt-1 mb-6 text-center">to continue to <strong className="text-indigo-600 font-bold">AetherQueue</strong></p>

            <div className="w-full space-y-3">
              {!showCustomFields ? (
                <>
                  <button
                    onClick={() => handleGoogleSSO({ email: "chakk.dev@gmail.com", name: "Chakk Dev", role: "client" })}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Chakk Dev</span>
                      <span className="text-[10px] text-slate-500 font-mono-custom">chakk.dev@gmail.com</span>
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 uppercase border border-indigo-500/20">Client</span>
                  </button>

                  <button
                    onClick={() => handleGoogleSSO({ email: "worker.alpha@gmail.com", name: "Worker Alpha", role: "worker" })}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Worker Alpha</span>
                      <span className="text-[10px] text-slate-500 font-mono-custom">worker.alpha@gmail.com</span>
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 uppercase border border-emerald-500/20">Worker</span>
                  </button>

                  <button
                    onClick={() => handleGoogleSSO({ email: "worker.beta@gmail.com", name: "Worker Beta", role: "worker" })}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Worker Beta</span>
                      <span className="text-[10px] text-slate-500 font-mono-custom">worker.beta@gmail.com</span>
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 uppercase border border-emerald-500/20">Worker</span>
                  </button>

                  <button
                    onClick={() => setShowCustomFields(true)}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-xl text-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-all cursor-pointer block"
                  >
                    Use another account
                  </button>
                </>
              ) : (
                <div className="space-y-3.5 w-full text-slate-800">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg outline-none text-slate-800 placeholder-slate-400 focus:border-indigo-500/50"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Gmail Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john.doe@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg outline-none text-slate-800 placeholder-slate-400 focus:border-indigo-500/50"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Role Authorization</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-lg outline-none text-slate-800 cursor-pointer"
                      value={customGoogleRole}
                      onChange={(e) => setCustomGoogleRole(e.target.value)}
                    >
                      <option value="client">Client (Queue Submitter)</option>
                      <option value="worker">Worker Node (Background Processor)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomFields(false)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!customGoogleEmail || !customGoogleName) return;
                        handleGoogleSSO({ email: customGoogleEmail, name: customGoogleName, role: customGoogleRole });
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setShowCustomFields(false);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl mt-4 transition-colors cursor-pointer"
              >
                Cancel Authentication
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Login;