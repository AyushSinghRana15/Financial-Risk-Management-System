import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaChartLine, FaQuestionCircle, FaTimes, FaExclamationTriangle, FaExternalLinkAlt, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import FinRiskLogo from "../assets/FinRisk.png";
// Ensure this path matches your file structure exactly
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

function OriginHelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 border-b border-slate-700 flex items-center gap-3">
          <FaExclamationTriangle className="text-amber-400" size={24} />
          <h3 className="text-lg font-semibold text-white">Authorized Origin Configuration</h3>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white transition">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-slate-300">
          <p className="text-sm">
            The Google Sign-In button failed to load due to an <span className="text-red-400 font-medium">Unauthorized Origin</span> error (403).
          </p>

          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
              <div>
                <p className="text-sm font-medium text-white">Go to Google Cloud Console</p>
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-1">
                  Open Credentials Page <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
              <div>
                <p className="text-sm font-medium text-white">Add Authorized Origin</p>
                <p className="text-xs text-slate-400 mt-1">In "Authorized JavaScript origins", add both:</p>
                <code className="block mt-2 p-2 bg-slate-950 rounded text-xs text-green-400 font-mono">
                  https://finrisk.online
                </code>
                <code className="block mt-1 p-2 bg-slate-950 rounded text-xs text-green-400 font-mono">
                  http://localhost:5173
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700">
          <button onClick={onClose} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// InputField component stays the same as your original...
function InputField({ icon: Icon, type, name, placeholder, value, onChange, required, error }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={18} />
      </div>
      <input
        type={isPassword && showPassword ? "text" : type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full pl-10 pr-10 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${error ? "border-red-500" : "border-slate-600 hover:border-slate-500"
          }`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
        >
          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      )}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [showHelp, setShowHelp] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const checkGoogleScript = () => {
      const timeout = setTimeout(() => {
        if (!window.google || !window.google.accounts) {
          setScriptLoaded(false);
        }
      }, 3000);
      return () => clearTimeout(timeout);
    };

    if (!window.google || !window.google.accounts) {
      checkGoogleScript();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleGoogleSuccess = async (res) => {
    try {
      // Use API_ENDPOINTS for consistency
      const response = await axios.post(
        API_ENDPOINTS.AUTH.GOOGLE,
        { credential: res.credential }
      );
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Google login failed. Check console for CORS/Origin errors.");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (mode === "signup") {
      if (formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters");
        return;
      }
    }

    setLoading(true);

    try {
      // Determine the correct endpoint object
      const endpoint = mode === "login" ? API_ENDPOINTS.AUTH.LOGIN : API_ENDPOINTS.AUTH.SIGNUP;

      const payload = mode === "login"
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await axios.post(endpoint, payload);

      if (response.data.error) {
        setMessage(response.data.error);
        setMessageType("error");
      } else {
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Connection to server failed.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Keeping your existing Tailwind JSX structure exactly as it was... */
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"></div>
      <div className="relative z-10 glass-panel rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.15)] p-8 w-full max-w-md mx-4">
        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 group hover:scale-105 transition-transform duration-300">
            <img src={FinRiskLogo} alt="FinRisk Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">FinRisk</h1>
        </div>

        <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
          <button onClick={() => setMode("login")} className={`flex-1 py-2 text-sm rounded-lg ${mode === "login" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Login</button>
          <button onClick={() => setMode("signup")} className={`flex-1 py-2 text-sm rounded-lg ${mode === "signup" ? "bg-blue-600 text-white" : "text-slate-400"}`}>Sign Up</button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === "signup" && <InputField icon={FaUser} type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />}
          <InputField icon={FaEnvelope} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <InputField icon={FaLock} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          {mode === "signup" && <InputField icon={FaLock} type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />}

          {message && <div className={`p-3 rounded-lg text-sm text-center ${messageType === "error" ? "text-red-400 bg-red-500/10" : "text-green-400 bg-green-500/10"}`}>{message}</div>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50">
            {loading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div><div className="relative flex justify-center text-xs"><span className="px-4 bg-slate-900 text-slate-500">or continue with</span></div></div>

        <div className="flex justify-center">
          {scriptLoaded ? (
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMessage("Google login failed")} theme="filled_black" size="large" width="280" />
          ) : (
            <button onClick={() => setShowHelp(true)} className="text-xs text-amber-400 underline">Fix Google Login Error</button>
          )}
        </div>
      </div>
      {showHelp && <OriginHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}