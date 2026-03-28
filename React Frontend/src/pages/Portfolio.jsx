import { useState, useEffect } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#8b5cf6", "#ec4899"];

const BASE_URL = "http://127.0.0.1:8000";

function Portfolio() {

    const storedUser = localStorage.getItem("user");
    let USER_EMAIL = "";
    let userName = "";
    let userPicture = "";
    
    try {
        if (storedUser && storedUser !== "[object Object]") {
            const parsed = JSON.parse(storedUser);
            USER_EMAIL = parsed.email || "";
            userName = parsed.name || "";
            userPicture = parsed.picture || "";
        }
    } catch (e) {
        console.error("Failed to parse user:", e);
    }

    const [assets, setAssets] = useState([]);
    const [risk, setRisk] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [form, setForm] = useState({
        asset_name: "",
        asset_type: "Stock",
        quantity: "",
        buy_price: "",
        current_price: ""
    });

    // 📥 Fetch profile
    const fetchProfile = async () => {
        if (!USER_EMAIL) return;

        try {
            const res = await fetch(`${BASE_URL}/profile?email=${USER_EMAIL}`);
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            console.error("Profile error:", err);
        }
    };

    const fetchPortfolio = async () => {
        if (!USER_EMAIL) return;

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

    const fetchRiskInsights = async () => {
        if (!USER_EMAIL) return;

        try {
            const res = await fetch(`${BASE_URL}/risk-analysis/${USER_EMAIL}`);
            const data = await res.json();
            setRisk(data);
        } catch (err) {
            console.error("Risk error:", err);
        }
    };

    useEffect(() => {
        if (!USER_EMAIL) return;

        fetchProfile();
        fetchPortfolio();
        fetchRiskInsights();
    }, [USER_EMAIL]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addAsset = async (e) => {
        e.preventDefault();

        if (!USER_EMAIL) {
            alert("Please login first");
            return;
        }

        const newAsset = {
            email: USER_EMAIL,
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

            fetchPortfolio();
            window.dispatchEvent(new Event("refreshDashboard"));

            setForm({
                asset_name: "",
                asset_type: "Stock",
                quantity: "",
                buy_price: "",
                current_price: ""
            });
            
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

        } catch (err) {
            console.error("Add error:", err);
        }
    };

    const deleteAsset = async (id) => {
        if (!USER_EMAIL) return;

        try {
            await fetch(`${BASE_URL}/portfolio/${id}/${USER_EMAIL}`, {
                method: "DELETE",
            });

            fetchPortfolio();

        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const totalValue = assets.reduce(
        (sum, a) => sum + (a.quantity * a.current_price),
        0
    );

    const portfolioData = assets.map(a => ({
        name: a.asset_name,
        value: a.quantity * a.current_price
    }));

    const volatility =
        assets.length > 0
            ? Math.sqrt(
                assets.reduce(
                    (sum, a) =>
                        sum +
                        Math.pow(
                            (a.current_price - a.buy_price) / a.buy_price,
                            2
                        ),
                    0
                ) / assets.length
            )
            : 0;

    return (
        <div className="p-10 bg-gray-100 dark:bg-slate-900 min-h-screen space-y-8">

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Portfolio Risk</h1>

            {!USER_EMAIL && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded text-yellow-800 dark:text-yellow-200">
                    Please login with Google to view your portfolio
                </div>
            )}

            {/* Profile Card */}
            {(userPicture || userName || USER_EMAIL) && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl shadow-lg text-white flex items-center gap-4">
                    {userPicture ? (
                        <img src={userPicture} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-xl font-bold">
                            {userName ? userName.charAt(0).toUpperCase() : "?"}
                        </div>
                    )}
                    <div>
                        <p className="font-bold">{userName || profile?.name || "User"}</p>
                        <p className="text-blue-100 text-sm">{USER_EMAIL || profile?.email}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
                    <h2 className="text-gray-500 dark:text-gray-400">Portfolio Value</h2>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        ₹ {totalValue.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
                    <h2 className="text-gray-500 dark:text-gray-400">Daily VaR</h2>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ₹ {(totalValue * 0.025).toFixed(0)}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
                    <h2 className="text-gray-500 dark:text-gray-400">Volatility</h2>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {(volatility * 100).toFixed(2)}%
                    </p>
                </div>

            </div>

            {risk && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                        AI Risk Insights
                    </h2>

                    <p className="font-bold text-lg text-gray-800 dark:text-white">
                        Risk Level: {risk.risk}
                    </p>

                    {risk.insights?.map((insight, i) => (
                        <p key={i} className="text-red-500 dark:text-red-400">
                            ⚠️ {insight}
                        </p>
                    ))}
                </div>
            )}

            {/* Premium Add Asset Form */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Asset</h2>
                </div>
                
                <form onSubmit={addAsset} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Asset Name</label>
                            <input 
                                name="asset_name" 
                                placeholder="e.g. AAPL" 
                                value={form.asset_name} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Asset Type</label>
                            <div className="relative">
                                <select 
                                    name="asset_type" 
                                    value={form.asset_type} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer pr-10 text-gray-800 dark:text-white"
                                >
                                    <option value="Stock">Stock</option>
                                    <option value="Crypto">Crypto</option>
                                    <option value="ETF">ETF</option>
                                    <option value="Commodity">Commodity</option>
                                    <option value="Bond">Bond</option>
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Quantity</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                placeholder="0" 
                                value={form.quantity} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Buy Price</label>
                            <input 
                                type="number" 
                                name="buy_price" 
                                placeholder="0.00" 
                                value={form.buy_price} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-800 dark:text-white"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Current Price</label>
                            <input 
                                type="number" 
                                name="current_price" 
                                placeholder="0.00" 
                                value={form.current_price} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-800 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] transition-all shadow-lg shadow-blue-500/25"
                    >
                        Add Asset to Portfolio
                    </button>
                </form>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Asset added successfully!
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b dark:border-slate-700">
                            <th className="p-2 text-left text-gray-600 dark:text-gray-400">Asset</th>
                            <th className="p-2 text-left text-gray-600 dark:text-gray-400">Type</th>
                            <th className="p-2 text-left text-gray-600 dark:text-gray-400">Qty</th>
                            <th className="p-2 text-left text-gray-600 dark:text-gray-400">Value</th>
                            <th className="p-2 text-left text-gray-600 dark:text-gray-400">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(a => (
                            <tr key={a.id} className="border-b dark:border-slate-700">
                                <td className="p-2 text-gray-800 dark:text-gray-200">{a.asset_name}</td>
                                <td className="p-2 text-gray-800 dark:text-gray-200">{a.asset_type}</td>
                                <td className="p-2 text-gray-800 dark:text-gray-200">{a.quantity}</td>
                                <td className="p-2 text-gray-800 dark:text-gray-200">
                                    ₹ {(a.quantity * a.current_price).toLocaleString()}
                                </td>
                                <td className="p-2">
                                    <button onClick={() => deleteAsset(a.id)} className="text-red-500 hover:text-red-600 dark:hover:text-red-400">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Asset Allocation</h2>

                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={portfolioData} dataKey="value" nameKey="name" outerRadius={120} label>
                            {portfolioData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
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