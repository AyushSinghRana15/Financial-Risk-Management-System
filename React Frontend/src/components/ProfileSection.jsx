import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfileSection() {

    const storedUser = localStorage.getItem('user');
    let userEmail = "";
    let userName = "";
    let userPicture = "";
    
    try {
        if (storedUser && storedUser !== "[object Object]") {
            const parsed = JSON.parse(storedUser);
            userEmail = parsed.email || "";
            userName = parsed.name || "";
            userPicture = parsed.picture || "";
        }
    } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
    }

    const [user, setUser] = useState({
        name: userName,
        email: userEmail,
        picture: userPicture,
        age: "-",
        risk_profile: "-"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:8000/profile?email=${encodeURIComponent(userEmail)}`)
            .then(res => {
                const data = res.data;
                setUser(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    email: data.email || prev.email,
                    age: data.age || "-",
                    risk_profile: data.risk_profile || "-"
                }));
            })
            .catch(err => {
                console.error("Profile load error:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userEmail]);

    if (!userEmail) {
        return (
            <div className="flex justify-center mt-20 text-gray-500">
                Please log in to view your profile.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center mt-20 text-gray-500 animate-pulse">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="flex justify-center mt-10 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border p-8">

                {/* Header */}
                <div className="mb-8 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Profile
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Your personal information and risk identity
                    </p>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                    {user.picture ? (
                        <img 
                            src={user.picture} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full border-4 border-blue-50 shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>
                    )}
                    <p className="mt-4 text-gray-800 font-bold text-xl">
                        {user.name || "User"}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-medium">
                        <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                        </svg>
                        Google Verified
                    </span>
                </div>

                {/* Fields */}
                <div className="space-y-6">

                    <Field label="Full Name" value={user.name} />
                    <Field label="Email Address" value={user.email} />
                    <Field label="Age" value={user.age} />

                    {/* Risk Profile */}
                    <div>
                        <label className="text-sm font-medium text-gray-500 block mb-2">Risk Preference</label>
                        <div>
                            {user.risk_profile && user.risk_profile !== "-" ? (
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm
                                    ${user.risk_profile === "High"
                                        ? "bg-red-100 text-red-700 border border-red-200"
                                        : user.risk_profile === "Medium"
                                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                            : "bg-green-100 text-green-700 border border-green-200"
                                    }`}>
                                    {user.risk_profile} Risk tolerance
                                </span>
                            ) : (
                                <span className="text-gray-400 italic">Not set (Configure in Settings)</span>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

// Reusable Field Component
function Field({ label, value }) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-500">{label}</label>
            <div className="mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">
                {value || "-"}
            </div>
        </div>
    );
}