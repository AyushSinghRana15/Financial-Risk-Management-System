import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProfileSection() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        age: "",
        risk_profile: ""
    });

    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        axios.get("/profile")
            .then(res => setUser(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        axios.put("/profile", user)
            .then(() => {
                localStorage.setItem("user", JSON.stringify(user)); // sync navbar
                setEditMode(false);
            })
            .catch(err => console.error(err));
    };

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
                    <p className="mt-2 text-gray-700 font-medium">{user.name}</p>
                </div>

                {/* FORM / VIEW */}
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
                                    value={user[field]}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <div className="mt-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                                    {field === "risk_profile" ? (
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.risk_profile === "High"
                                                ? "bg-red-100 text-red-600"
                                                : user.risk_profile === "Medium"
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-green-100 text-green-600"
                                            }`}>
                                            {user.risk_profile || "-"}
                                        </span>
                                    ) : (
                                        user[field] || "-"
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                </div>

                {/* ACTION BUTTONS */}
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