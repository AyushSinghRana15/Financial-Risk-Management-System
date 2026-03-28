import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("🔄 Verifying your email...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/verify/${token}`);

        setMessage(res.data.message || "✅ Email verified successfully!");

        // 👉 redirect after success
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        const errorMsg = err.response?.data?.error;
        setMessage(errorMsg ? `❌ ${errorMsg}` : "❌ Invalid or expired link");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyUser();
    } else {
      setMessage("❌ Invalid verification link");
      setLoading(false);
    }
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center w-96">
        <h2 className="text-xl font-bold mb-4">Email Verification</h2>

        {loading ? (
          <p className="text-gray-500">⏳ Please wait...</p>
        ) : (
          <p
            className={`font-medium ${
              message.includes("❌") ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
