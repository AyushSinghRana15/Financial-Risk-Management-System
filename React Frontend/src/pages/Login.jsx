import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaChartLine, FaQuestionCircle, FaTimes, FaExclamationTriangle, FaExternalLinkAlt, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import FinRiskLogo from "../assets/FinRisk.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
            Follow these steps to fix it:
          </p>
          
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
              <div>
                <p className="text-sm font-medium text-white">Go to Google Cloud Console</p>
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-1"
                >
                  Open Credentials Page <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>
            
            <div className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
              <div>
                <p className="text-sm font-medium text-white">Select your OAuth 2.0 Client ID</p>
                <p className="text-xs text-slate-400 mt-1">Click on the credential with "Authorized JavaScript origins"</p>
              </div>
            </div>
            
            <div className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">3</span>
              <div>
                <p className="text-sm font-medium text-white">Add Authorized Origin</p>
                <p className="text-xs text-slate-400 mt-1">In the "Authorized JavaScript origins" section, add:</p>
                <code className="block mt-2 p-2 bg-slate-950 rounded text-xs text-green-400 font-mono">
                  http://localhost:5173
                </code>
              </div>
            </div>
            
            <div className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">4</span>
              <div>
                <p className="text-sm font-medium text-white">Save & Retry</p>
                <p className="text-xs text-slate-400 mt-1">Click Save, then refresh this page</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-xs text-amber-200">
              <strong>Note:</strong> The origin must match exactly, including the protocol (http vs https) and port number.
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-slate-900/50 border-t border-slate-700">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

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
        className={`w-full pl-10 pr-10 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? "border-red-500" : "border-slate-600 hover:border-slate-500"
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
      const response = await axios.post(
        `${API_BASE_URL}/auth/google`,
        { credential: res.credential }
      );
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Google login failed");
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
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload = mode === "login" 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        payload
      );

      if (response.data.error) {
        setMessage(response.data.error);
        setMessageType("error");
      } else {
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || `${mode === "login" ? "Login" : "Registration"} failed. Please try again.`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950">
      
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"></div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "-2s" }}></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "-4s" }}></div>
      </div>

      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      ></div>

      <div className="relative z-10 glass-panel rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.15)] p-8 w-full max-w-md mx-4">
        
        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 group hover:scale-105 transition-transform duration-300">
            <img src={FinRiskLogo} alt="FinRisk Logo" className="w-full h-full object-contain" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
              FinRisk
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setMessage(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "login" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode("signup"); setMessage(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "signup" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 ml-1">Full Name</label>
              <InputField
                icon={FaUser}
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 ml-1">Email</label>
            <InputField
              icon={FaEnvelope}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 ml-1">Password</label>
            <InputField
              icon={FaLock}
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 ml-1">Confirm Password</label>
              <InputField
                icon={FaLock}
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${
              messageType === "error" 
                ? "bg-red-500/10 border border-red-500/30 text-red-400" 
                : "bg-green-500/10 border border-green-500/30 text-green-400"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              mode === "login" ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-slate-800/80 text-slate-500">or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          {scriptLoaded ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("Google login failed")}
              theme="filled_black"
              size="large"
              shape="rectangular"
              width="280"
            />
          ) : (
            <div className="text-center space-y-2">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-amber-400 text-sm font-medium">Google Sign-In unavailable</p>
              </div>
              <button
                onClick={() => setShowHelp(true)}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Fix Origin Configuration
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowHelp(true)}
            className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 mx-auto transition"
          >
            <FaQuestionCircle size={12} />
            Having trouble signing in?
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-slate-500/60 text-xs">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      {showHelp && <OriginHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
