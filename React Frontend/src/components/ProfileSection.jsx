import React, { useState, useEffect } from "react";
import API from "../services/api"; // ✅ use centralized API

export default function ProfileSection() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        age: "",
        risk_profile: ""
    });

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch profile
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

    // ✅ Handle input
    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    // ✅ Save profile
    const handleSave = () => {
        API.put("/profile", user)
            .then(() => {
                localStorage.setItem("user", JSON.stringify(user));
                setEditMode(false);
            })
            .catch(err => console.error(err));
    };

    // 🔄 Loading UI
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
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Profile
                    </h2>

                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
                        >
                            Edit
                        </button>
                    )}
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
                    {["name", "email", "age", "risk_profile"].map((field) => (
                        <div key={field}>
                            <label className="text-sm text-gray-500 capitalize">
                                {field.replace("_", " ")}
                            </label>

                            {editMode ? (
                                <input
                                    type="text"
                                    name={field}
                                    value={user[field] || ""}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-800">

                                    {field === "risk_profile" ? (
                                        user.risk_profile ? (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${user.risk_profile === "High"
                                                    ? "bg-red-100 text-red-600"
                                                    : user.risk_profile === "Medium"
                                                        ? "bg-yellow-100 text-yellow-600"
                                                        : "bg-green-100 text-green-600"
                                                }`}>
                                                {user.risk_profile}
                                            </span>
                                        ) : "-"
                                    ) : (
                                        user[field] || "-"
                                    )}

                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                {editMode && (
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}