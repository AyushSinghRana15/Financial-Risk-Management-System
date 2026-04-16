import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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

import { FaChartLine, FaSync, FaChevronDown, FaChevronUp, FaInfoCircle, FaShieldAlt, FaExclamationTriangle, FaChartArea } from "react-icons/fa";
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
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        axios.get(API_ENDPOINTS.RISK.MARKET_FEATURES)
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
                API_ENDPOINTS.RISK.MARKET,
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

            {/* INFO TOGGLE BUTTON */}
            <motion.button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <FaInfoCircle className="text-lg" />
                <span>Know about Market Risk & VaR</span>
                <motion.div
                    animate={{ rotate: showInfo ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FaChevronDown className="text-lg" />
                </motion.div>
            </motion.button>

            {/* COLLAPSIBLE INFO SECTION */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 space-y-6">
                            
                            {/* What is Market Risk */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <FaChartLine className="text-blue-600 dark:text-blue-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">What is Market Risk?</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    Market Risk refers to the possibility of losses in investments due to changes in market prices or conditions. 
                                    This includes fluctuations in <span className="font-semibold text-blue-600 dark:text-blue-400">stock prices</span>, 
                                    <span className="font-semibold text-blue-600 dark:text-blue-400"> interest rates</span>, 
                                    <span className="font-semibold text-blue-600 dark:text-blue-400"> exchange rates</span>, and 
                                    <span className="font-semibold text-blue-600 dark:text-blue-400"> commodity prices</span>. 
                                    Even well-diversified portfolios are exposed to these systemic risks that affect entire markets.
                                </p>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 ml-11">
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Equity Risk</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Stock market volatility</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Interest Rate Risk</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Bond price sensitivity</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="font-medium text-sm text-gray-700 dark:text-gray-200">Currency Risk</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">FX rate fluctuations</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* What is VaR */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                        <FaShieldAlt className="text-indigo-600 dark:text-indigo-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">What is VaR (Value at Risk)?</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    VaR is a statistical measure that quantifies the <span className="font-semibold text-indigo-600 dark:text-indigo-400">maximum potential loss</span> of a portfolio 
                                    over a specific time period, at a given confidence level.
                                </p>
                                
                                {/* Example Box */}
                                <div className="mt-4 ml-11 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <div className="flex items-start gap-3">
                                        <FaExclamationTriangle className="text-indigo-500 dark:text-indigo-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">
                                                Example: 95% 1-Day VaR of 5%
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                This means we are <span className="font-bold text-indigo-600 dark:text-indigo-400">95% confident</span> that the portfolio 
                                                will not lose more than <span className="font-bold text-indigo-600 dark:text-indigo-400">5%</span> of its value in a single trading day.
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                In other words, there's only a 5% chance (1 in 20 days) that the portfolio could lose more than 5% in one day.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Levels */}
                                <div className="mt-4 ml-11">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Risk Level Interpretation:</p>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">VaR &lt; 2%: Low Risk</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">VaR 2-5%: Moderate Risk</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">VaR &gt; 5%: High Risk</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Confidence Level Explanation */}
                                <div className="mt-4 ml-11">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Confidence Level Explained:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300">95%</div>
                                                <p className="font-semibold text-blue-700 dark:text-blue-300">Standard Confidence</p>
                                            </div>
                                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-10">
                                                <li>• More commonly used in practice</li>
                                                <li>• Captures most typical market conditions</li>
                                                <li>• 5% chance of exceeding expected loss</li>
                                                <li>• Suitable for daily risk monitoring</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-sm font-bold text-red-600 dark:text-red-300">99%</div>
                                                <p className="font-semibold text-red-700 dark:text-red-300">High Confidence</p>
                                            </div>
                                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-10">
                                                <li>• More conservative risk estimate</li>
                                                <li>• Accounts for extreme market events</li>
                                                <li>• Only 1% chance of exceeding expected loss</li>
                                                <li>• Recommended for risk-averse portfolios</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Note:</span> The confidence level (95% vs 99%) affects how much potential loss we prepare for. 
                                            99% VaR will typically show a <span className="font-semibold text-red-500">higher VaR number</span> because it accounts for 
                                            more extreme scenarios, providing a more conservative (safer) estimate.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* Market Indicators Explained */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <FaChartLine className="text-purple-600 dark:text-purple-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Understanding Market Indicators</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    Our model uses multiple market indicators to assess risk. Each indicator represents a different aspect of market behavior. 
                                    Enter the values below based on current market data to get an accurate VaR prediction.
                                </p>
                                
                                {/* Indicator Types */}
                                <div className="mt-4 ml-11 space-y-4">
                                    {/* Current Values */}
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                                        <p className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                            Current Market Values
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 dark:text-gray-400">Stock Indices:</span>
                                                <span className="font-mono bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-purple-600 dark:text-purple-300">e.g., 17850.25</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 dark:text-gray-400">VIX:</span>
                                                <span className="font-mono bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-purple-600 dark:text-purple-300">e.g., 18.45</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 dark:text-gray-400">USD/INR:</span>
                                                <span className="font-mono bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-purple-600 dark:text-purple-300">e.g., 83.50</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 dark:text-gray-400">Gold:</span>
                                                <span className="font-mono bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-purple-600 dark:text-purple-300">e.g., 2020.50</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Returns */}
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
                                        <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            Daily Returns
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            Percentage change in price from yesterday to today.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                                Positive (+1.5%) = Market Up
                                            </span>
                                            <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                                                Negative (-1.5%) = Market Down
                                            </span>
                                            <span className="text-xs bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                                0.015 = 1.5%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Volatility */}
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
                                        <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                            Volatility
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            Measures how much prices fluctuate. Higher volatility = Higher VaR.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                                                Low Vol (&lt;0.5%) = Stable Market
                                            </span>
                                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                                                High Vol (&gt;1.5%) = Turbulent Market
                                            </span>
                                        </div>
                                    </div>

                                    {/* Historical Values */}
                                    <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600">
                                        <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-2 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                            Lagged Values (Historical)
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            Past values (1, 5, 10, 15, 20 days ago) help identify trends and patterns.
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>1-day lag = Yesterday's close</span>
                                            <span>•</span>
                                            <span>5-day lag = Last week's value</span>
                                            <span>•</span>
                                            <span>20-day lag = ~1 month ago</span>
                                        </div>
                                    </div>

                                    {/* How Values Affect Risk */}
                                    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                                        <p className="font-semibold text-red-700 dark:text-red-300 text-sm mb-3 flex items-center gap-2">
                                            <FaExclamationTriangle className="text-red-500" />
                                            What Increases Risk?
                                        </p>
                                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li className="flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span><b>High volatility</b> - Large daily swings indicate instability</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span><b>Negative returns</b> - Falling markets increase loss potential</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span><b>High VIX</b> - Fear index above 20 signals market stress</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span><b>INR weakening</b> - Currency depreciation affects international holdings</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Quick Reference */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                                        <p className="font-semibold text-green-700 dark:text-green-300 text-sm mb-3 flex items-center gap-2">
                                            <FaShieldAlt className="text-green-500" />
                                            Quick Value Reference
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                            <div className="text-center p-2 bg-white dark:bg-slate-700 rounded-lg">
                                                <p className="text-gray-500 dark:text-gray-400">Stock Return</p>
                                                <p className="font-mono font-semibold text-green-600 dark:text-green-300">±0.01 to ±0.03</p>
                                            </div>
                                            <div className="text-center p-2 bg-white dark:bg-slate-700 rounded-lg">
                                                <p className="text-gray-500 dark:text-gray-400">Daily Volatility</p>
                                                <p className="font-mono font-semibold text-yellow-600 dark:text-yellow-300">0.5 to 2.0</p>
                                            </div>
                                            <div className="text-center p-2 bg-white dark:bg-slate-700 rounded-lg">
                                                <p className="text-gray-500 dark:text-gray-400">VIX Range</p>
                                                <p className="font-mono font-semibold text-blue-600 dark:text-blue-300">10 to 35</p>
                                            </div>
                                            <div className="text-center p-2 bg-white dark:bg-slate-700 rounded-lg">
                                                <p className="text-gray-500 dark:text-gray-400">Input Format</p>
                                                <p className="font-mono font-semibold text-purple-600 dark:text-purple-300">Decimals</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                            Tip: Use decimal format. For 1.5%, enter <span className="font-mono bg-gray-200 dark:bg-slate-600 px-1 rounded">0.015</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
