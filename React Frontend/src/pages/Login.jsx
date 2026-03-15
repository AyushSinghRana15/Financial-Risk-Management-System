import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        if (!email || !password) return;

        const user = {
            name: "Demo User",
            email: email,
            role: "Risk Analyst"
        };

        localStorage.setItem("user", JSON.stringify(user));

        navigate("/");
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

                    <button className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                        Login
                    </button>

                </form>

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