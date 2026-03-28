import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function ProfileSection() {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/profile")
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center mt-20 text-gray-500 animate-pulse">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="flex justify-center mt-10 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border p-6">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Profile
                    </h2>
                    <p className="text-sm text-gray-500">
                        Your personal information
                    </p>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                        {user?.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <p className="mt-3 text-gray-800 font-medium text-lg">
                        {user?.name || "User"}
                    </p>
                </div>

                {/* Fields */}
                <div className="space-y-5">

                    <Field label="Name" value={user?.name} />
                    <Field label="Email" value={user?.email} />
                    <Field label="Age" value={user?.age} />

                    {/* Risk Profile */}
                    <div>
                        <label className="text-sm text-gray-500">Risk Profile</label>
                        <div className="mt-1">
                            {user?.risk_profile ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${user.risk_profile === "High"
                                        ? "bg-red-100 text-red-600"
                                        : user.risk_profile === "Medium"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : "bg-green-100 text-green-600"
                                    }`}>
                                    {user.risk_profile}
                                </span>
                            ) : "-"}
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
            <label className="text-sm text-gray-500">{label}</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
                {value || "-"}
            </div>
        </div>
    );
}