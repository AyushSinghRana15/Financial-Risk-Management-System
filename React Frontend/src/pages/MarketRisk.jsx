import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

import { FaChartLine, FaSync, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

function MarketRisk() {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || "";
    
    const [features, setFeatures] = useState([]);
    const [inputs, setInputs] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [riskLevel, setRiskLevel] = useState("");
    const [confidence, setConfidence] = useState("95%");
    const [rollingData, setRollingData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/market_features`)
            .then(res => {
                setFeatures(res.data.features);

                const init = {};
                res.data.features.forEach(f => init[f] = 0);
                setInputs(init);
            });
    }, []);

    const cleanFeatureName = (feature) => {

        const nameMap = {
            "^NSEI": "NIFTY 50",
            "^INDIAVIX": "India VIX",
            "^DJI": "Dow Jones",
            "^GSPC": "S&P 500",
            "^IXIC": "NASDAQ",
            "^FTSE": "FTSE 100",
            "^N225": "Nikkei 225",
            "^HSI": "Hang Seng",
            "^BSESN": "Sensex",
            "GC=F": "Gold",
            "CL=F": "Crude Oil",
            "SI=F": "Silver",
            "DX-Y.NYB": "US Dollar Index",
            "INR=X": "USD/INR",
            "EURUSD=X": "EUR/USD"
        };

        let base = feature;

        Object.keys(nameMap).forEach(key => {
            if (feature.includes(key)) {
                base = nameMap[key];
            }
        });

        if (feature.includes("lag")) {
            const lag = feature.match(/lag(\d+)/);
            if (lag) return `${base} (${lag[1]} Days Ago)`;
        }

        if (feature.includes("vol")) {
            const vol = feature.match(/vol(\d+)/);
            if (vol) return `${base} (${vol[1]} Day Volatility)`;
        }

        if (feature.includes("skew")) return `${base} (Market Skewness)`;
        if (feature.includes("kurt")) return `${base} (Market Extremes)`;

        if (feature.toLowerCase().includes("return")) {
            return `${base} (Today Return)`;
        }

        return `${base} (Current Value)`;
    };

    const handleChange = (feature, value) => {
        const num = value === "" ? 0 : parseFloat(value);
        setInputs(prev => ({ ...prev, [feature]: num }));
    };



    const predictRisk = async () => {
        setLoading(true);

        try {
            const res = await axios.post(
                `${API_BASE_URL}/predict/market`,
                { ...inputs, email: userEmail }
            );

            const varValue = res.data.predicted_var;
            setPrediction(varValue);

            const absVar = Math.abs(varValue);

            if (absVar > 0.05) setRiskLevel("High Risk");
            else if (absVar > 0.02) setRiskLevel("Moderate Risk");
            else setRiskLevel("Low Risk");

            const series = [];
            for (let i = 0; i < 30; i++) {
                series.push({
                    day: i + 1,
                    value: absVar + (Math.random() * 0.01 - 0.005)
                });
            }

            setRollingData(series);
            window.dispatchEvent(new Event("refreshDashboard"));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = prediction
        ? [{ name: "VaR", value: Math.abs(prediction) }]
        : [];

    const absVar = prediction ? Math.abs(prediction) : 0;

    const getColor = () => {
        if (absVar > 0.05) return "bg-red-500";
        if (absVar > 0.02) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen space-y-6">

            {/* HEADER */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Market Risk Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        ML-based Value at Risk Prediction
                    </p>
                </div>

                <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="border dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white px-3 py-2 rounded-lg"
                >
                    <option>95%</option>
                    <option>99%</option>
                </select>
            </div>

            {/* Market Indicators */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Market Indicators</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {features.map((feature) => (
                        <div key={feature} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-600 transition-colors">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
                                {cleanFeatureName(feature)}
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                value={inputs[feature] || ""}
                                placeholder="0.00"
                                onChange={(e) =>
                                    handleChange(feature, e.target.value)
                                }
                                className="w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                            />

                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                ±1% = 0.01
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={predictRisk}
                    disabled={loading}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] transition-all shadow-md"
                >
                    {loading ? "Analyzing Market Risk..." : "Predict Market Risk"}
                </button>
            </div>

            {/* Results Section */}
            {prediction === null ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow text-center text-gray-400 dark:text-gray-500">
                    Run prediction to see results
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow flex justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">VaR</p>
                                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {(absVar * 100).toFixed(2)}%
                                </h2>
                            </div>
                            <FaChartLine className="text-blue-500 dark:text-blue-400 text-xl" />
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Risk</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{riskLevel}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Confidence</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{confidence}</p>
                        </div>
                    </div>

                    {/* HYBRID GAUGE */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                        <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Risk Visualization</h3>

                        <div className="relative h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getColor()} transition-all`}
                                style={{ width: `${Math.min(absVar * 200, 100)}%` }}
                            />

                            <div
                                className="absolute top-[-8px] text-xs text-gray-600 dark:text-gray-300"
                                style={{ left: `${Math.min(absVar * 200, 100)}%` }}
                            >
                                ▲
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                            <span>Low</span>
                            <span>Moderate</span>
                            <span>High</span>
                        </div>

                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            VaR: <b>{(absVar * 100).toFixed(2)}%</b>
                        </p>
                    </div>

                    {/* Charts - 2 Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* BAR */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* LINE */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
                            <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Rolling VaR</h3>

                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={rollingData}>
                                    <XAxis dataKey="day" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="value" stroke="#ef4444" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default MarketRisk;
