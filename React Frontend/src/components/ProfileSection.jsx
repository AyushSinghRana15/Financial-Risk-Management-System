import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import SEO from "../components/SEO";

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
    });
    const [editingAge, setEditingAge] = useState(false);
    const [ageInput, setAgeInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        axios.get(`${API_ENDPOINTS.PROFILE}?email=${encodeURIComponent(userEmail)}`)
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

    const saveAge = async () => {
        const age = parseInt(ageInput, 10);
        if (isNaN(age) || age < 1 || age > 150) return;
        setSaving(true);
        try {
            await axios.put(API_ENDPOINTS.PROFILE, {
                email: userEmail,
                name: user.name,
                age: age,
                risk_profile: user.risk_profile
            });
            setUser(prev => ({ ...prev, age: age }));
            setEditingAge(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error("Failed to save age:", err);
            alert("Failed to save age");
        } finally {
            setSaving(false);
        }
    };

    if (!userEmail) {
        return (
            <div className="flex justify-center mt-20 text-gray-500 dark:text-gray-400">
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
            <SEO title="Profile" description="View and edit your FinRisk profile including name, email, and account settings." path="/profile" />
            <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 p-8">

                {/* Header */}
                <div className="mb-8 border-b dark:border-slate-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Profile
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                    <p className="mt-4 text-gray-800 dark:text-white font-bold text-xl">
                        {user.name || "User"}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-xs text-gray-600 dark:text-gray-300 font-medium">
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

                    {/* Editable Age */}
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Age</label>
                        {editingAge ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={ageInput}
                                    onChange={(e) => setAgeInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") saveAge(); if (e.key === "Escape") setEditingAge(false); }}
                                    className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                                    min={1}
                                    max={150}
                                    autoFocus
                                    disabled={saving}
                                />
                                <button
                                    onClick={saveAge}
                                    disabled={saving}
                                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                                >
                                    {saving ? "..." : "Save"}
                                </button>
                                <button
                                    onClick={() => setEditingAge(false)}
                                    className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => { setAgeInput(String(user.age)); setEditingAge(true); }}
                                className="mt-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl text-gray-800 dark:text-gray-200 font-medium cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-between group"
                            >
                                <span>{user.age || "-"}</span>
                                <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Click to edit</span>
                            </div>
                        )}
                    </div>



                </div>

            </div>

            {saved && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce z-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Age updated successfully!
                </div>
            )}
        </div>
    );
}

// Reusable Field Component
function Field({ label, value }) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
            <div className="mt-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl text-gray-800 dark:text-gray-200 font-medium">
                {value || "-"}
            </div>
        </div>
    );
}