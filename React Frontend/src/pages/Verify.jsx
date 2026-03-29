import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const res = await axios.get(`${API_BASE_URL}/auth/verify/${token}`);

        setMessage(res.data.message || "Email verified successfully!");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        const errorMsg = err.response?.data?.error;
        setMessage(errorMsg || "Invalid or expired link");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyUser();
    } else {
      setMessage("Invalid verification link");
      setLoading(false);
    }
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md text-center w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Email Verification</h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Please wait...</p>
        ) : (
          <p
            className={`font-medium ${
              message.includes("Invalid") ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
