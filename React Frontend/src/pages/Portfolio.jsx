import { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"];

// 🔗 Backend URL
const BASE_URL = "http://127.0.0.1:8000";

// 🔥 TEMP USER (replace with Google OAuth later)
const USER_EMAIL = "test@gmail.com";

function Portfolio() {

    const [assets, setAssets] = useState([]);

    const [form, setForm] = useState({
        asset_name: "",
        asset_type: "",
        quantity: "",
        buy_price: "",
        current_price: ""
    });

    // 📥 Fetch portfolio from backend
    const fetchPortfolio = async () => {
        try {
            const res = await fetch(`${BASE_URL}/portfolio/get/${USER_EMAIL}`);
            const data = await res.json();

            if (data.portfolio) {
                setAssets(data.portfolio);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addAsset = async (e) => {
        e.preventDefault();

        const newAsset = {
            email: USER_EMAIL, // 🔥 REQUIRED
            asset_name: form.asset_name,
            asset_type: form.asset_type,
            quantity: Number(form.quantity),
            buy_price: Number(form.buy_price),
            current_price: Number(form.current_price),
        };

        try {
            await fetch(`${BASE_URL}/portfolio/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newAsset)
            });

            // 🔄 Refresh from DB
            fetchPortfolio();

            setForm({
                asset_name: "",
                asset_type: "",
                quantity: "",
                buy_price: "",
                current_price: ""
            });

        } catch (err) {
            console.error("Add error:", err);
        }
    };

    const deleteAsset = (id) => {
        // Optional: implement backend delete later
        setAssets(assets.filter(a => a.id !== id));
    };

    // 📊 Derived Data
    const totalValue = assets.reduce(
        (sum, a) => sum + (a.quantity * a.current_price),
        0
    );

    const portfolioData = assets.map(a => ({
        name: a.asset_name,
        value: a.quantity * a.current_price
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
                className="bg-white p-4 rounded-xl shadow grid md:grid-cols-5 gap-4"
            >
                <input
                    type="text"
                    name="asset_name"
                    placeholder="Asset Name"
                    value={form.asset_name}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />

                <input
                    type="text"
                    name="asset_type"
                    placeholder="Type (stock/crypto)"
                    value={form.asset_type}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />

                <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />

                <input
                    type="number"
                    name="buy_price"
                    placeholder="Buy Price"
                    value={form.buy_price}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />

                <input
                    type="number"
                    name="current_price"
                    placeholder="Current Price"
                    value={form.current_price}
                    onChange={handleChange}
                    className="p-2 border rounded"
                />

                <button className="bg-blue-600 text-white rounded col-span-full">
                    Add Asset
                </button>
            </form>

            {/* Asset Table */}
            <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2 text-left">Asset</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Qty</th>
                            <th className="p-2 text-left">Value</th>
                            <th className="p-2 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(a => (
                            <tr key={a.id} className="border-b">
                                <td className="p-2">{a.asset_name}</td>
                                <td className="p-2">{a.asset_type}</td>
                                <td className="p-2">{a.quantity}</td>
                                <td className="p-2">
                                    ₹ {(a.quantity * a.current_price).toLocaleString()}
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