import { useState } from "react";

function Settings() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        risk: "Medium"
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        console.log("Saved:", form);
        alert("Settings saved (backend connect next)");
    };

    return (
        <div className="p-6 max-w-3xl space-y-6">

            <h1 className="text-2xl font-bold">Settings</h1>

            {/* Profile Settings */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Profile Settings</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Password */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Security</h2>

                <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            {/* Risk Preference */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Risk Preference</h2>

                <select
                    name="risk"
                    value={form.risk}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>
            </div>

            {/* UI Settings */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-lg font-semibold">Appearance</h2>

                <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    Dark Mode (Coming Soon)
                </label>
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