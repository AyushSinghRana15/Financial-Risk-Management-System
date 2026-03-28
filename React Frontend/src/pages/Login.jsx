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

            const response = await axios.post("http://127.0.0.1:8000/auth/google", {
                name: user.name,
                email: user.email,
                picture: user.picture
            });

            localStorage.setItem("user", JSON.stringify(response.data));

            navigate("/");

        } catch (err) {
            console.error(err);
            setMessage("❌ Google login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center space-y-6">

                <h2 className="text-2xl font-bold">
                    Welcome to FinRisk
                </h2>

                <p className="text-gray-500 text-sm">
                    Sign in using your Google account
                </p>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setMessage("❌ Google login failed")}
                    />
                </div>

                {message && (
                    <p className="text-sm text-red-500">
                        {message}
                    </p>
                )}

                <p className="text-xs text-gray-400">
                    By continuing, you agree to our terms & privacy policy
                </p>

            </div>
        </div>
    );
}