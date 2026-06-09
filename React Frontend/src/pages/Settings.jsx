import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import SEO from "../components/SEO";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../components/Toast";

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
    
    const storedPrefs = (() => {
        try { return JSON.parse(localStorage.getItem('settings') || '{}'); }
        catch { return {}; }
    })();

    const [form, setForm] = useState({
        name: userName,
        email: userEmail,
        risk: "Medium",
        alerts: storedPrefs.alerts !== undefined ? storedPrefs.alerts : true,
        realtime: storedPrefs.realtime !== undefined ? storedPrefs.realtime : true
    });

    const [chatbotEnabled, setChatbotEnabled] = useState(
        storedPrefs.chatbotEnabled !== undefined ? storedPrefs.chatbotEnabled : true
    );
    const [notificationFilters, setNotificationFilters] = useState(
        storedPrefs.notificationFilters || {
            credit: true,
            market: true,
            business: true,
            liquidity: true,
            financial: true,
            fraud: true,
            tips: true
        }
    );
    const [defaultView, setDefaultView] = useState(
        storedPrefs.defaultView || "dashboard"
    );

    const [loading, setLoading] = useState(true);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
    const addToast = useToast();

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
        if (newMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    useEffect(() => {
        if (userEmail) {
            axios.get(`${API_ENDPOINTS.PROFILE}?email=${encodeURIComponent(userEmail)}`)
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
            await axios.put(API_ENDPOINTS.PROFILE, {
                email: userEmail,
                name: form.name,
                age: 22,
                risk_profile: form.risk
            });

            localStorage.setItem("settings", JSON.stringify({
                alerts: form.alerts,
                realtime: form.realtime,
                chatbotEnabled,
                notificationFilters,
                defaultView
            }));

            window.dispatchEvent(new Event("settingsChanged"));

            setSaveSuccess(true);
            addToast("Settings saved");
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert("Failed to save settings");
        }
    };

    return (
        <div className="flex justify-center mt-10 px-4">
            <SEO title="Settings" description="Configure your FinRisk preferences — chatbot settings, notification filters, and default dashboard view." path="/settings" />
            <div className="w-full max-w-3xl space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Settings
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage your preferences and system behavior
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 py-10">
                        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                    </div>
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

                {/* Appearance */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Appearance
                    </h2>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{darkMode ? "🌙" : "☀️"}</span>
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
                                darkMode ? "bg-blue-600" : "bg-gray-300"
                            }`}
                        >
                            <div
                                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                                    darkMode ? "translate-x-6" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* AI Chatbot */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        AI Chatbot
                    </h2>

                    <Toggle
                        label="Enable Chatbot"
                        value={chatbotEnabled}
                        onChange={() => setChatbotEnabled(!chatbotEnabled)}
                    />

                    <button
                        onClick={() => {
                            localStorage.removeItem("chatbot_history");
                            alert("Conversation history cleared.");
                        }}
                        className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm font-medium"
                    >
                        Clear Conversation History
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Disable the floating chatbot icon or reset its memory.
                    </p>
                </div>

                {/* Notification Filters */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Notification Filters
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                        Choose which risk alerts appear in your notification panel.
                    </p>

                    <Toggle
                        label="Credit Risk"
                        value={notificationFilters.credit}
                        onChange={() => setNotificationFilters(prev => ({ ...prev, credit: !prev.credit }))}
                    />
                    <Toggle
                        label="Market Risk"
                        value={notificationFilters.market}
                        onChange={() => setNotificationFilters(prev => ({ ...prev, market: !prev.market }))}
                    />
                    <Toggle
                        label="Business Risk"
                        value={notificationFilters.business}
                        onChange={() => setNotificationFilters(prev => ({ ...prev, business: !prev.business }))}
                    />
                    <Toggle
                        label="Liquidity Risk"
                        value={notificationFilters.liquidity}
                        onChange={() => setNotificationFilters(prev => ({ ...prev, liquidity: !prev.liquidity }))}
                    />
                    <Toggle
                        label="Financial Risk"
                        value={notificationFilters.financial}
                        onChange={() => setNotificationFilters(prev => ({ ...prev, financial: !prev.financial }))}
                    />
                    <Toggle
                        label="Fraud Detection"
                        value={notificationFilters.fraud}
                        onChange={() => setNotificationFilters(prev => ({ ...prev, fraud: !prev.fraud }))}
                    />
                    <Toggle
                        label="Daily Tips"
                        value={notificationFilters.tips}
                        onChange={() => setNotificationFilters(prev => ({ ...prev, tips: !prev.tips }))}
                    />
                </div>

                {/* Default Dashboard View */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Default Dashboard View
                    </h2>

                    <select
                        value={defaultView}
                        onChange={(e) => setDefaultView(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    >
                        <option value="dashboard">Overview Dashboard</option>
                        <option value="portfolio">Portfolio</option>
                        <option value="market">Market Data</option>
                        <option value="credit-risk">Credit Risk</option>
                        <option value="market-risk">Market Risk</option>
                    </select>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Choose which page loads first when you visit the app.
                    </p>
                </div>

                {/* System Controls */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border space-y-5">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
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
            <span className="text-gray-700 dark:text-gray-200">{label}</span>

            <button
                onClick={onChange}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${value ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
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