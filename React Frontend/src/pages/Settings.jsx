import { useState, useEffect } from "react";
import axios from "axios";

function Settings() {

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
    
    const [form, setForm] = useState({
        name: userName,
        email: userEmail,
        risk: "Medium",
        alerts: true,
        realtime: true
    });

    const [loading, setLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (userEmail) {
            axios.get(`http://localhost:8000/profile?email=${encodeURIComponent(userEmail)}`)
                .then(res => {
                    const data = res.data;
                    setForm(prev => ({
                        ...prev,
                        name: data.name || userName || "",
                        email: data.email || userEmail,
                        risk: data.risk_profile || "Medium"
                    }));
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [userEmail]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleSwitch = (key) => {
        setForm({ ...form, [key]: !form[key] });
    };

    const handleSave = async () => {
        try {
            await axios.put("http://localhost:8000/profile", {
                email: userEmail,
                name: form.name,
                age: 22,
                risk_profile: form.risk
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert("Failed to save settings");
        }
    };

    return (
        <div className="flex justify-center mt-10 px-4">
            <div className="w-full max-w-3xl space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Settings
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage your preferences and system behavior
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                <>
                {/* Google Profile Card - Read Only */}
                {(userPicture || userName || userEmail) && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                        <div className="flex items-center gap-4">
                            {userPicture ? (
                                <img 
                                    src={userPicture} 
                                    alt="Profile" 
                                    className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-3xl font-bold">
                                    {userName ? userName.charAt(0).toUpperCase() : "?"}
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold">{userName || "User"}</h2>
                                <p className="text-blue-100">{userEmail}</p>
                                <span className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-white/20 rounded-full text-sm">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                                    </svg>
                                    Google Account
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Risk Preference */}
                <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Risk Preference
                    </h2>

                    <select
                        name="risk"
                        value={form.risk}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>

                    <p className="text-xs text-gray-500">
                        This influences AI risk analysis and alerts.
                    </p>
                </div>

                {/* System Controls */}
                <div className="bg-white p-6 rounded-2xl shadow border space-y-5">
                    <h2 className="text-lg font-semibold text-gray-700">
                        System Controls
                    </h2>

                    {/* Alerts */}
                    <Toggle
                        label="AI Risk Alerts"
                        value={form.alerts}
                        onChange={() => toggleSwitch("alerts")}
                    />

                    {/* Real-time */}
                    <Toggle
                        label="Real-time Data"
                        value={form.realtime}
                        onChange={() => toggleSwitch("realtime")}
                    />
                </div>

                {/* Save */}
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                >
                    Save Changes
                </button>
                
                {saveSuccess && (
                    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Settings saved successfully!
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    );
}

/* Toggle Component */
function Toggle({ label, value, onChange }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>

            <button
                onClick={onChange}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${value ? "bg-blue-500" : "bg-gray-300"
                    }`}
            >
                <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${value ? "translate-x-6" : ""
                        }`}
                />
            </button>
        </div>
    );
}

export default Settings;