import React, { useState, useEffect } from "react";
import API from "../services/api";

export default function ProfileSection() {

    const [user, setUser] = useState({
        name: "admin",
        email: "admin@123",
        age: "99",
        risk_profile: "Medium"
    });

    const [loading, setLoading] = useState(true);

    // Fetch profile
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
            <div className="flex justify-center mt-20 text-gray-500">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="flex justify-center mt-10 px-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border p-6">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Profile
                    </h2>
                    <p className="text-sm text-gray-500">
                        View your personal details
                    </p>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <p className="mt-2 text-gray-700 font-medium">
                        {user.name || "User"}
                    </p>
                </div>

                {/* Fields */}
                <div className="space-y-4">

                    {/* Name */}
                    <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg">
                            {user.name || "-"}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg">
                            {user.email || "-"}
                        </div>
                    </div>

                    {/* Age */}
                    <div>
                        <label className="text-sm text-gray-500">Age</label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg">
                            {user.age || "-"}
                        </div>
                    </div>

                    {/* Risk Profile */}
                    <div>
                        <label className="text-sm text-gray-500">Risk Profile</label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg">

                            {user.risk_profile ? (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${user.risk_profile === "High"
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