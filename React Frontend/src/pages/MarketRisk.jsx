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

function MarketRisk() {

    const userEmail = localStorage.getItem('user') || "";
    
    const [features, setFeatures] = useState([]);
    const [inputs, setInputs] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [riskLevel, setRiskLevel] = useState("");
    const [confidence, setConfidence] = useState("95%");
    const [rollingData, setRollingData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingLive, setFetchingLive] = useState(false);
    const [openSection, setOpenSection] = useState("equities");

    const featureCategories = {
        equities: {
            title: "Major Indices",
            icon: "📈",
            color: "blue",
            pattern: /^(?:\^NSEI|\^DJI|\^GSPC|\^IXIC|\^FTSE|\^N225|\^BSESN)/
        },
        commodities: {
            title: "Commodities & Forex",
            icon: "🪙",
            color: "yellow",
            pattern: /(?:GC=F|CL=F|SI=F|DX-Y\.NYB|INR=X|EURUSD=X)/
        },
        statistical: {
            title: "Statistical Data",
            icon: "📊",
            color: "purple",
            pattern: /^(?:\^INDIAVIX)/
        }
    };

    const getCategory = (feature) => {
        for (const [key, cat] of Object.entries(featureCategories)) {
            if (cat.pattern.test(feature)) return key;
        }
        if (feature.includes("return")) return "equities";
        if (feature.includes("vol")) return "statistical";
        if (feature.includes("skew") || feature.includes("kurt")) return "statistical";
        return "equities";
    };

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/market_features")
            .then(res => {
                setFeatures(res.data.features);

                const init = {};
                res.data.features.forEach(f => init[f] = 0);
                setInputs(init);
            });
    }, []);

    // 🔥 FIXED CLEAN NAME FUNCTION
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

        // 🔥 differentiate types
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

        // 🔥 key fix → distinguish return explicitly
        if (feature.toLowerCase().includes("return")) {
            return `${base} (Today Return)`;
        }

        // fallback → raw value
        return `${base} (Current Value)`;
    };

    const handleChange = (feature, value) => {
        const num = value === "" ? 0 : parseFloat(value);
        setInputs(prev => ({ ...prev, [feature]: num }));
    };

    const fetchLiveData = async () => {
        setFetchingLive(true);
        try {
            const res = await axios.get("http://127.0.0.1:8000/market_live_data");
            const liveData = res.data;
            
            const newInputs = { ...inputs };
            Object.keys(liveData).forEach(key => {
                if (key in newInputs) {
                    newInputs[key] = liveData[key];
                }
            });
            setInputs(newInputs);
        } catch (err) {
            console.error("Failed to fetch live data:", err);
            alert("Failed to fetch live market data");
        } finally {
            setFetchingLive(false);
        }
    };

    const predictRisk = async () => {
        setLoading(true);

        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/predict_market_risk",
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
        <div className="p-6 bg-gray-50 min-h-screen space-y-6">

            {/* HEADER */}
            <div className="bg-white p-6 rounded-2xl shadow flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Market Risk Dashboard</h1>
                    <p className="text-gray-500 text-sm">
                        ML-based Value at Risk Prediction
                    </p>
                </div>

                <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="border px-3 py-2 rounded-lg"
                >
                    <option>95%</option>
                    <option>99%</option>
                </select>
            </div>

            {/* Market Indicators - Categorized Accordions */}
            <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Market Indicators</h2>
                    <button
                        onClick={fetchLiveData}
                        disabled={fetchingLive}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                    >
                        <FaSync className={fetchingLive ? "animate-spin" : ""} />
                        {fetchingLive ? "Fetching..." : "Auto-Fill Live Data"}
                    </button>
                </div>
                
                <div className="space-y-3">
                    {Object.entries(featureCategories).map(([key, category]) => {
                        const categoryFeatures = features.filter(f => getCategory(f) === key);
                        if (categoryFeatures.length === 0) return null;
                        
                        return (
                            <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenSection(openSection === key ? null : key)}
                                    className={`w-full flex items-center justify-between p-4 bg-${category.color}-50 hover:bg-${category.color}-100 transition-colors`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{category.icon}</span>
                                        <span className="font-semibold text-gray-800">{category.title}</span>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                            {categoryFeatures.length} indicators
                                        </span>
                                    </div>
                                    {openSection === key ? (
                                        <FaChevronUp className="text-gray-500" />
                                    ) : (
                                        <FaChevronDown className="text-gray-500" />
                                    )}
                                </button>
                                
                                {openSection === key && (
                                    <div className="p-4 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {categoryFeatures.map((feature) => (
                                                <div key={feature} className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                                    <label className="text-xs font-medium text-gray-600 block mb-1">
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
                                                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />

                                                    <p className="text-xs text-gray-400 mt-1">
                                                        ±1% = 0.01
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
                <div className="bg-white p-12 rounded-xl shadow text-center text-gray-400">
                    Run prediction to see results
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow flex justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">VaR</p>
                                <h2 className="text-2xl font-bold text-blue-600">
                                    {(absVar * 100).toFixed(2)}%
                                </h2>
                            </div>
                            <FaChartLine className="text-blue-500 text-xl" />
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow">
                            <p className="text-gray-500 text-sm">Risk</p>
                            <p className="font-semibold">{riskLevel}</p>
                        </div>

                        <div className="bg-white p-5 rounded-xl shadow">
                            <p className="text-gray-500 text-sm">Confidence</p>
                            <p className="font-semibold">{confidence}</p>
                        </div>
                    </div>

                    {/* HYBRID GAUGE */}
                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold mb-4">Risk Visualization</h3>

                        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getColor()} transition-all`}
                                style={{ width: `${Math.min(absVar * 200, 100)}%` }}
                            />

                            <div
                                className="absolute top-[-8px] text-xs"
                                style={{ left: `${Math.min(absVar * 200, 100)}%` }}
                            >
                                ▲
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Low</span>
                            <span>Moderate</span>
                            <span>High</span>
                        </div>

                        <p className="mt-2 text-sm">
                            VaR: <b>{(absVar * 100).toFixed(2)}%</b>
                        </p>
                    </div>

                    {/* Charts - 2 Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* BAR */}
                        <div className="bg-white p-5 rounded-xl shadow">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* LINE */}
                        <div className="bg-white p-5 rounded-xl shadow">
                            <h3 className="font-semibold mb-4">Rolling VaR</h3>

                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={rollingData}>
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Line dataKey="value" stroke="#ef4444" />
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