import { useState } from "react";

function Settings() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        risk: "Medium",
        alerts: true,
        realtime: true
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleSwitch = (key) => {
        setForm({ ...form, [key]: !form[key] });
    };

    const handleSave = () => {
        console.log("Saved:", form);
        alert("Settings saved (connect backend next)");
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

                {/* Profile Info (Read-only mindset but editable optional) */}
                <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Profile Info
                    </h2>

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

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