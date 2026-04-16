import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaQuestionCircle, FaTimes, FaExclamationTriangle, FaExternalLinkAlt } from "react-icons/fa";
import FinRiskLogo from "../assets/FinRisk.png";
import { API_ENDPOINTS } from "../config/api";

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

export default function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [showHelp, setShowHelp] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

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

  const handleGoogleSuccess = async (res) => {
    try {
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

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"></div>
      <div className="relative z-10 glass-panel rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.15)] p-8 w-full max-w-md mx-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 group hover:scale-105 transition-transform duration-300">
            <img src={FinRiskLogo} alt="FinRisk Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">FinRisk</h1>
            <p className="text-slate-400 mt-2 text-sm">Financial Risk Management System</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${messageType === "error" ? "text-red-400 bg-red-500/10" : "text-green-400 bg-green-500/10"}`}>
              {message}
            </div>
          )}

          <div className="flex justify-center">
            {scriptLoaded ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setMessage("Google login failed")}
                theme="filled_black"
                size="large"
                width="320"
              />
            ) : (
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition"
              >
                <FaExclamationTriangle className="text-amber-400" />
                <span className="text-sm">Fix Google Login Error</span>
              </button>
            )}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setShowHelp(true)}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition"
            >
              <FaQuestionCircle />
              Having trouble signing in?
            </button>
          </div>
        </div>
      </div>
      {showHelp && <OriginHelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
