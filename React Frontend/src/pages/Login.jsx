import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
                password
            });

            const user = res.data;

            // store user (later we’ll replace with JWT)
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/");

        } catch (err) {
            const errorMsg = err.response?.data?.error;

            if (errorMsg === "Please verify your email first") {
                setMessage("📩 Please verify your email before logging in");
            } else if (errorMsg === "User not found") {
                setMessage("❌ User not found");
            } else {
                setMessage("❌ Invalid credentials");
            }
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-96">

                <h2 className="text-2xl font-bold mb-6 text-center">
                    Login to FinRisk
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border p-2 rounded-lg"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border p-2 rounded-lg"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {message && (
                    <p className="text-sm text-center mt-4 text-red-500">
                        {message}
                    </p>
                )}

                <p className="text-sm text-center mt-4">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-600">
                        Sign up
                    </Link>
                </p>

            </div>
        </div>
    );
}