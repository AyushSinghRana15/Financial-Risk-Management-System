import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleGoogleSuccess = async (res) => {
    try {
      const user = jwtDecode(res.credential);

      const response = await axios.post(
        "http://127.0.0.1:8000/auth/google",
        {
          name: user.name,
          email: user.email,
          picture: user.picture,
        }
      );

      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("Google login failed");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950">
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }}></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-4s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "-1s" }}></div>
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] p-10 w-96 space-y-8">
        
        {/* Logo & Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
            <span className="text-4xl">🏦</span>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              FinRisk
            </h1>
            <p className="text-blue-200/80 text-sm mt-1">
              AI-Powered Financial Risk Management
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10"></div>

        {/* Google Login */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-white/70 text-sm">
            Sign in to continue
          </p>
          
          <div className="transform hover:scale-105 transition-transform duration-200">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage("Google login failed")}
              theme="filled_blue"
              size="large"
              shape="rectangular"
              width="280"
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className="text-sm text-center text-red-300 bg-red-500/20 py-2 rounded-lg">
            {message}
          </p>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/40 text-xs">
            Secure authentication powered by Google OAuth
          </p>
        </div>
      </div>
    </div>
  );
}
