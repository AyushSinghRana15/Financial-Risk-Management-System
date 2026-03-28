import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // 🔐 Google Login ONLY
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
      setMessage("❌ Google login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Welcome to FinRisk 🚀
        </h2>

        <p className="text-center text-gray-500 text-sm">
          Sign in with Google to continue
        </p>

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
      </div>
    </div>
  );
}