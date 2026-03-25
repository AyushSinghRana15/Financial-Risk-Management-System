import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Verify() {
    const { token } = useParams();
    const [message, setMessage] = useState("Verifying...");
    const navigate = useNavigate();
    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/verify/${token}`)
            .then(() => {
                setMessage("✅ Email verified successfully!");

                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            })
            .catch(() => {
                setMessage("❌ Invalid or expired link");
            });
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md text-center w-96">
                <h2 className="text-xl font-bold mb-4">Email Verification</h2>
                <p>{message}</p>
            </div>
        </div>
    );
}