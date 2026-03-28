import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Normal Login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("❌ Please enter email and password");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/login", {
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res.data));

      setMessage("✅ Login successful!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error;

      if (errorMsg === "Verify email first") {
        setMessage("📩 Please verify your email");
      } else if (errorMsg === "User not found") {
        setMessage("❌ User not found");
      } else {
        setMessage("❌ Invalid credentials");
      }
    }

    setLoading(false);
  };

  // 🔐 Google Login
  const handleGoogleSuccess = async (res) => {
    try {
      const user = jwtDecode(res.credential);

      const response = await axios.post("http://127.0.0.1:8000/auth/google", {
        name: user.name,
        email: user.email,
        picture: user.picture,
      });

      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/");
    } catch (err) {
      setMessage("❌ Google login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 space-y-6">
        <h2 className="text-2xl font-bold text-center">Login to FinRisk 🔐</h2>

        {/* Email Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <p className="text-center text-gray-400">OR</p>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("❌ Google login failed")}
          />
        </div>

        {/* Message */}
        {message && (
          <p className="text-sm text-center text-red-500">{message}</p>
        )}

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
