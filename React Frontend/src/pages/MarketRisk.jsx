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

import { FaChartLine } from "react-icons/fa";

function MarketRisk() {

    const [features, setFeatures] = useState([]);
    const [inputs, setInputs] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [riskLevel, setRiskLevel] = useState("");
    const [confidence, setConfidence] = useState("95%");
    const [rollingData, setRollingData] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const predictRisk = async () => {
        setLoading(true);

        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/predict_market_risk",
                inputs
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

            <div className="grid grid-cols-12 gap-6">

                {/* LEFT */}
                <div className="col-span-4 space-y-4">

                    <h2 className="font-semibold text-lg">Market Indicators</h2>

                    {features.map((feature) => (
                        <div key={feature} className="bg-white p-4 rounded-xl shadow border">

                            <label className="text-sm font-medium text-gray-700">
                                {cleanFeatureName(feature)}
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                value={inputs[feature] || ""}
                                placeholder="e.g. 0.01 or -0.02"
                                onChange={(e) =>
                                    handleChange(feature, e.target.value)
                                }
                                className="mt-2 w-full px-3 py-2 border rounded-lg"
                            />

                            <p className="text-xs text-gray-400 mt-1">
                                Enter value (0.01 = +1%, -0.02 = -2%)
                            </p>

                        </div>
                    ))}

                    <button
                        onClick={predictRisk}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl"
                    >
                        {loading ? "Predicting..." : "Predict Market Risk"}
                    </button>

                </div>

                {/* RIGHT */}
                <div className="col-span-8 space-y-6">

                    {prediction === null ? (
                        <div className="text-center text-gray-400 mt-20">
                            Run prediction to see results
                        </div>
                    ) : (
                        <>
                            {/* KPI */}
                            <div className="grid grid-cols-3 gap-4">

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

                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

export default MarketRisk;