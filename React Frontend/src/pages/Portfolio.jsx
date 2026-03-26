import { useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"];

function Portfolio() {

    const [assets, setAssets] = useState([
        { id: 1, name: "HDFC Bank", value: 400000 },
        { id: 2, name: "Reliance", value: 300000 },
        { id: 3, name: "TCS", value: 200000 },
        { id: 4, name: "Infosys", value: 100000 }
    ]);

    const [form, setForm] = useState({
        name: "",
        value: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addAsset = (e) => {
        e.preventDefault();
        if (!form.name || !form.value) return;

        setAssets([
            ...assets,
            {
                id: Date.now(),
                name: form.name,
                value: Number(form.value)
            }
        ]);

        setForm({ name: "", value: "" });
    };

    const deleteAsset = (id) => {
        setAssets(assets.filter(a => a.id !== id));
    };

    // 📊 Derived Data
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

    const portfolioData = assets.map(a => ({
        name: a.name,
        value: a.value
    }));

    return (
        <div className="p-10 bg-gray-100 min-h-screen space-y-8">

            <h1 className="text-3xl font-bold">Portfolio Risk</h1>

            {/* KPI Cards */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-gray-500">Portfolio Value</h2>
                    <p className="text-2xl font-bold">
                        ₹ {totalValue.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-gray-500">Daily VaR</h2>
                    <p className="text-2xl font-bold text-red-600">
                        ₹ {(totalValue * 0.025).toFixed(0)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-gray-500">Volatility</h2>
                    <p className="text-2xl font-bold">
                        {(Math.random() * 3 + 1).toFixed(2)}%
                    </p>
                </div>

            </div>

            {/* Add Asset */}

            <form
                onSubmit={addAsset}
                className="bg-white p-4 rounded-xl shadow grid md:grid-cols-3 gap-4"
            >
                <input
                    type="text"
                    name="name"
                    placeholder="Asset Name"
                    value={form.name}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />

                <input
                    type="number"
                    name="value"
                    placeholder="Value (₹)"
                    value={form.value}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />

                <button className="bg-blue-600 text-white rounded">
                    Add Asset
                </button>
            </form>

            {/* Asset Table */}

            <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2 text-left">Asset</th>
                            <th className="p-2 text-left">Value</th>
                            <th className="p-2 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(a => (
                            <tr key={a.id} className="border-b">
                                <td className="p-2">{a.name}</td>
                                <td className="p-2">
                                    ₹ {a.value.toLocaleString()}
                                </td>
                                <td className="p-2">
                                    <button
                                        onClick={() => deleteAsset(a.id)}
                                        className="text-red-500"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pie Chart */}

            <div className="bg-white p-6 rounded-xl shadow">

                <h2 className="text-xl font-semibold mb-4">
                    Asset Allocation
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={portfolioData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={120}
                            label
                        >
                            {portfolioData.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default Portfolio;