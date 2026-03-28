import { useState, useEffect } from "react";

function Settings() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        risk: "Medium"
    });

    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme") === "dark";
        setDarkMode(saved);
        if (saved) document.documentElement.classList.add("dark");
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const handleSave = () => {
        console.log("Saved:", form);
        alert("Settings saved (backend connect next)");
    };

    return (
        <div className="p-6 max-w-3xl space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-black dark:text-white">

            <h1 className="text-2xl font-bold">Settings</h1>

            {/* Profile Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Profile Settings</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900"
                />
            </div>

            {/* Password */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Security</h2>

                <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900"
                />
            </div>

            {/* Risk Preference */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Risk Preference</h2>

                <select
                    name="risk"
                    value={form.risk}
                    onChange={handleChange}
                    className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900"
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>
            </div>

            {/* UI Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Appearance</h2>

                <div className="flex items-center justify-between">
                    <span>Dark Mode</span>

                    <button
                        onClick={toggleTheme}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${darkMode ? "bg-blue-500" : "bg-gray-400"
                            }`}
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${darkMode ? "translate-x-6" : ""
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
                Save Changes
            </button>

        </div>
    );
}

export default Settings;