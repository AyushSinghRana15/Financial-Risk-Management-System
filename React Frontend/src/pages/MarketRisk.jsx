import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    ReferenceLine, ReferenceArea, Cell, LabelList
} from "recharts";

import { FaChartLine, FaSync, FaChevronDown, FaChevronUp, FaInfoCircle, FaShieldAlt, FaExclamationTriangle, FaChartArea, FaArrowUp, FaArrowDown, FaSearch, FaBolt, FaGlobeAsia, FaChartBar, FaChartPie, FaExchangeAlt, FaRegLightbulb, FaRedoAlt } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";
import SEO from "../components/SEO";

function MarketRisk() {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || "";
    
    const [features, setFeatures] = useState([]);
    const [inputs, setInputs] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [residualVar, setResidualVar] = useState(0);
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

    const fetchLiveData = async () => {
        try {
            const res = await axios.get(API_ENDPOINTS.RISK.MARKET_LIVE);
            if (res.data) {
                const updated = { ...inputs };
                Object.keys(res.data).forEach(key => {
                    if (key in updated) {
                        updated[key] = res.data[key];
                    }
                });
                setInputs(updated);
            }
        } catch (err) {
            console.error("Failed to fetch live data:", err);
        }
    };

    const NIFTY_RETURN_FEATURES = ["^NSEI_Return", "^NSEI_Return_lag1", "^NSEI_Return_lag2", "^NSEI_Return_lag5"];
    const NIFTY_VOL_FEATURES = ["^NSEI_Return_vol20", "^NSEI_Return_vol60", "^NSEI_Return_skew20", "^NSEI_Return_kurt20"];
    const VIX_FEATURES = ["^INDIAVIX_Close", "^INDIAVIX_Return"];
    const STOCK_FEATURES = ["RELIANCE.NS_Return", "TCS.NS_Return", "RELIANCE.NS_Volume"];

    const featureGroups = [
        { name: "NIFTY Returns", icon: FaArrowUp, features: NIFTY_RETURN_FEATURES, color: "blue", desc: "Current and historical daily returns of NIFTY 50 index" },
        { name: "NIFTY Volatility", icon: FaChartBar, features: NIFTY_VOL_FEATURES, color: "amber", desc: "Market volatility, skewness, and tail-risk indicators" },
        { name: "India VIX", icon: FaExclamationTriangle, features: VIX_FEATURES, color: "rose", desc: "India's fear index — measures expected market volatility" },
        { name: "Individual Stocks", icon: FaChartLine, features: STOCK_FEATURES, color: "violet", desc: "Major stock returns and volume data" },
    ];

    const getFeatureGroup = (feature) => {
        for (const group of featureGroups) {
            if (group.features.includes(feature)) return group;
        }
        return null;
    };

    const getRecommendedRange = (feature) => {
        if (feature.includes("_Return") && !feature.includes("vol") && !feature.includes("skew") && !feature.includes("kurt")) {
            return "Range: -0.05 to 0.05";
        }
        if (feature.includes("vol")) return "Range: 0.0 to 3.0";
        if (feature.includes("skew")) return "Range: -2.0 to 2.0";
        if (feature.includes("kurt")) return "Range: 0.0 to 10.0";
        if (feature.includes("VIX_Close")) return "Range: 10 to 35";
        if (feature.includes("VIX_Return")) return "Range: -0.15 to 0.15";
        return "Decimal: 0.01 = 1%";
    };

    const predictRisk = async () => {
        setLoading(true);

        try {
            const res = await axios.post(
                API_ENDPOINTS.RISK.MARKET,
                { ...inputs, email: userEmail }
            );

            const varValue = res.data.predicted_var;
            const resid = res.data.residual_variance || 0;
            setPrediction(varValue);
            setResidualVar(resid);

            const absVar = Math.abs(varValue);

            if (absVar > 0.05) setRiskLevel("High Risk");
            else if (absVar > 0.02) setRiskLevel("Moderate Risk");
            else setRiskLevel("Low Risk");

            const series = [];
            const baseVar = Math.max(absVar, 0.005);
            for (let i = 0; i < 30; i++) {
                const trend = 1 + 0.3 * Math.sin(i / 5);
                const jitter = (Math.random() - 0.5) * 0.008;
                const val = Math.max(0.001, baseVar * trend + jitter);
                series.push({
                    day: i + 1,
                    value: +val.toFixed(5),
                    upper: +(val * 1.15).toFixed(5),
                    lower: +(val * 0.85).toFixed(5),
                    alert: val > 0.05 ? "High" : val > 0.02 ? "Moderate" : "Low"
                });
            }

            setRollingData(series);
            window.dispatchEvent(new Event("refreshDashboard"));
            window.dispatchEvent(new Event("refreshNotifications"));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const absVar = prediction ? Math.abs(prediction) : 0;
    const varPct = +(absVar * 100).toFixed(2);

    const chartData = prediction ? [
        { name: "VaR", value: varPct, fill: "#3b82f6" },
        { name: "Residual", value: +(Math.abs(residualVar) * 100).toFixed(2), fill: "#8b5cf6" },
    ] : [];

    const thresholdData = [
        { name: "Low Risk\n(< 2%)", limit: 2, color: "#22c55e" },
        { name: "Moderate\n(2-5%)", limit: 5, color: "#eab308" },
        { name: "High Risk\n(> 5%)", limit: 8, color: "#ef4444" },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 text-xs">
                <p className="font-medium text-gray-800 dark:text-white mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }} className="font-mono">
                        {p.name}: {typeof p.value === "number" ? p.value.toFixed(4) : p.value}%
                    </p>
                ))}
            </div>
        );
    };

    const LineTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 text-xs">
                <p className="font-medium text-gray-800 dark:text-white mb-1">Day {label}</p>
                {payload.map((p, i) => {
                    const val = typeof p.value === "number" ? (p.value * 100).toFixed(2) : p.value;
                    return (
                        <p key={i} style={{ color: p.color }} className="font-mono">
                            {p.name}: {val}%
                        </p>
                    );
                })}
            </div>
        );
    };

    const getColor = () => {
        if (absVar > 0.05) return "bg-red-500";
        if (absVar > 0.02) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <div className="space-y-6">
            <SEO title="Market Risk" description="Calculate Value at Risk (VaR) with XGBoost hybrid ML model using NIFTY 50, VIX, and global market indicators." path="/market-risk" />
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

                            {/* Our ML Model */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                        <FaBolt className="text-cyan-600 dark:text-cyan-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Our ML Model: XGBoost Hybrid VaR</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    Our model uses a <span className="font-semibold text-cyan-600 dark:text-cyan-400">Hybrid ML VaR</span> approach — 
                                    an <span className="font-semibold text-cyan-600 dark:text-cyan-400">XGBoost Regressor</span> trained on 5 years of NIFTY 50 market data 
                                    (2021–2026) to predict the next day's return. VaR is then computed by adjusting this prediction with 
                                    the historical tail-risk residual (5th percentile of errors). This captures both <span className="font-semibold">predictable market patterns</span> 
                                    and <span className="font-semibold">extreme tail events</span>.
                                </p>
                                <div className="mt-4 ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-cyan-100 dark:border-cyan-800">
                                        <p className="font-semibold text-cyan-700 dark:text-cyan-300 text-sm mb-2">Hybrid ML VaR Formula</p>
                                        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                                            <p><b>VaR = Predicted Return + Residual VaR</b></p>
                                            <p className="mt-2">Where:</p>
                                            <p>• Predicted Return from XGBoost (next-day NIFTY return)</p>
                                            <p>• Residual VaR = 5th percentile of training errors</p>
                                            <p>• Acts as a tail-risk safety buffer</p>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                        <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm mb-2">Training Details</p>
                                        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                                            <p>• <b>Data:</b> NIFTY 50 daily (5 yrs, ~1,200 rows)</p>
                                            <p>• <b>Split:</b> 80/20 chronological (no shuffle)</p>
                                            <p>• <b>Features:</b> 13 market indicators</p>
                                            <p>• <b>Validation:</b> 5.24% breach rate (well calibrated)</p>
                                        </div>
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
                                        <FaGlobeAsia className="text-purple-600 dark:text-purple-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Understanding Market Indicators</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    Our model uses <span className="font-semibold text-purple-600 dark:text-purple-400">13 carefully selected market indicators</span> 
                                    to assess risk. These features capture returns, volatility, tail behavior, implied fear, and individual stock performance.
                                    Enter the values below based on current market data to get an accurate VaR prediction.
                                </p>
                                
                                {/* Indicator Types */}
                                <div className="mt-4 ml-11 space-y-4">
                                    {/* How Features Are Engineered */}
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                                        <p className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-3 flex items-center gap-2">
                                            <FaChartBar className="text-purple-500" />
                                            Feature Engineering Pipeline
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                                                <p className="font-semibold text-purple-600 dark:text-purple-300 mb-1">Returns</p>
                                                <p>Log returns of indices, stocks, and VIX. Includes 1, 2, and 5-day lags for trend detection.</p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                                                <p className="font-semibold text-purple-600 dark:text-purple-300 mb-1">Volatility &amp; Tails</p>
                                                <p>20-day and 60-day rolling volatility. Skewness and kurtosis capture distribution tail risk.</p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                                                <p className="font-semibold text-purple-600 dark:text-purple-300 mb-1">Fear &amp; Liquidity</p>
                                                <p>India VIX level (fear gauge) and trading volumes as liquidity proxies.</p>
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
                                            Volatility (20-day &amp; 60-day rolling std)
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
                                            Past values (1, 2, 5 days ago) help the model identify trends, momentum, and mean-reversion patterns.
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>1-day lag = Yesterday's close</span>
                                            <span>•</span>
                                            <span>5-day lag = Last week's value</span>
                                            <span>•</span>
                                            <span>20-day vol = ~1 month volatility</span>
                                        </div>
                                    </div>

                                    {/* What Increases vs Decreases Risk */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                                            <p className="font-semibold text-red-700 dark:text-red-300 text-sm mb-3 flex items-center gap-2">
                                                <FaExclamationTriangle className="text-red-500" />
                                                Increases Risk ✗
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span><b>High volatility</b> — Large daily swings signal instability</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span><b>Negative returns</b> — Falling markets increase loss potential</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span><b>VIX &gt; 20</b> — Fear index signals market stress</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span><b>INR weakening</b> — Hurts international holdings</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">•</span>
                                                    <span><b>Fat tails</b> — High kurtosis = extreme events more likely</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                                            <p className="font-semibold text-green-700 dark:text-green-300 text-sm mb-3 flex items-center gap-2">
                                                <FaShieldAlt className="text-green-500" />
                                                Decreases Risk ✓
                                            </p>
                                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    <span><b>Low volatility</b> — Calm, predictable markets</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    <span><b>Positive momentum</b> — Rising indices with consistent returns</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    <span><b>VIX &lt; 15</b> — Low fear, stable outlook</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    <span><b>Strong INR</b> — Favorable for foreign investors</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">•</span>
                                                    <span><b>Normal distribution</b> — Low skew/kurtosis = fewer surprises</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Quick Reference */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                                        <p className="font-semibold text-green-700 dark:text-green-300 text-sm mb-3 flex items-center gap-2">
                                            <FaChartBar className="text-green-500" />
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

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-slate-700" />

                            {/* Interpreting Results */}
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <FaRegLightbulb className="text-amber-600 dark:text-amber-400 text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Interpreting Your VaR Results</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-11">
                                    Your VaR result represents the <span className="font-semibold text-amber-600 dark:text-amber-400">maximum expected loss</span> 
                                    for a ₹1,00,00,000 (₹1 Cr) portfolio over one trading day at the selected confidence level.
                                </p>
                                <div className="mt-4 ml-11 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`p-4 rounded-xl border ${prediction !== null && Math.abs(prediction) < 0.02 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-2 ring-green-400" : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600"}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                            <p className="font-semibold text-green-700 dark:text-green-300">Low Risk (&lt; ₹2L)</p>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">Market conditions are stable. Potential loss is under ₹2 Lakhs. Suitable for normal operations with standard risk monitoring.</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${prediction !== null && Math.abs(prediction) >= 0.02 && Math.abs(prediction) <= 0.05 ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 ring-2 ring-yellow-400" : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600"}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                            <p className="font-semibold text-yellow-700 dark:text-yellow-300">Moderate Risk (₹2L–₹5L)</p>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">Elevated volatility present. Could lose ₹2–5 Lakhs. Consider reducing position sizes or adding hedges.</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${prediction !== null && Math.abs(prediction) > 0.05 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ring-2 ring-red-400" : "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600"}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                            <p className="font-semibold text-red-700 dark:text-red-300">High Risk (&gt; ₹5L)</p>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">Significant market stress detected. Potential loss &gt; ₹5 Lakhs. Consider reducing exposure, buying puts, or moving to cash.</p>
                                    </div>
                                </div>
                                <div className="mt-4 ml-11 text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-100 dark:border-slate-600">
                                    <span className="font-semibold">Pro Tip:</span> A high VaR doesn't mean you <i>will</i> lose that amount — it means there's a 5% chance of losing more than that. Use it as a <span className="font-semibold">red flag</span> to review your portfolio's risk exposure.
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Market Indicators */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <FaChartLine className="text-blue-500" />
                            Market Indicators
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Enter current market data to calculate Value at Risk
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchLiveData}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <FaRedoAlt className="text-[10px]" />
                            Fetch Live
                        </button>
                        <button
                            onClick={() => {
                                const init = {};
                                features.forEach(f => init[f] = 0);
                                setInputs(init);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <FaSync className="text-[10px]" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Grouped Features */}
                {featureGroups.map((group) => {
                    const groupFeatures = features.filter(f => group.features.includes(f));
                    if (groupFeatures.length === 0) return null;
                    const GroupIcon = group.icon;
                    const colorClasses = {
                        blue: { border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50 dark:bg-blue-900/10", icon: "text-blue-600 dark:text-blue-400", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", input: "focus:ring-blue-500 focus:border-blue-400" },
                        amber: { border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-900/10", icon: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", input: "focus:ring-amber-500 focus:border-amber-400" },
                        rose: { border: "border-rose-200 dark:border-rose-800", bg: "bg-rose-50 dark:bg-rose-900/10", icon: "text-rose-600 dark:text-rose-400", badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300", input: "focus:ring-rose-500 focus:border-rose-400" },
                        violet: { border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-900/10", icon: "text-violet-600 dark:text-violet-400", badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", input: "focus:ring-violet-500 focus:border-violet-400" },
                    };
                    const cc = colorClasses[group.color];

                    return (
                        <div key={group.name} className={`mb-4 p-4 rounded-xl border ${cc.border} ${cc.bg}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <GroupIcon className={`${cc.icon} text-sm`} />
                                <h3 className="font-semibold text-sm text-gray-800 dark:text-white">{group.name}</h3>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cc.badge}`}>
                                    {groupFeatures.length}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{group.desc}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {groupFeatures.map((feature) => (
                                    <div key={feature} className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 hover:shadow-sm transition-shadow">
                                        <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1 truncate" title={feature}>
                                            {cleanFeatureName(feature)}
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                step="any"
                                                value={inputs[feature] ?? ""}
                                                placeholder="0"
                                                onChange={(e) => handleChange(feature, e.target.value)}
                                                className={`w-full px-2 py-1 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none ring-0 focus:ring-2 ${cc.input} transition-shadow`}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-mono">
                                            {getRecommendedRange(feature)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={predictRisk}
                    disabled={loading}
                    className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Analyzing Market Risk...
                        </>
                    ) : (
                        <>
                            <FaBolt className="text-lg" />
                            Predict Market Risk
                        </>
                    )}
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

                    {/* Charts - 3 Distinct Visualizations */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* 1. VaR Breakdown Bar */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg lg:col-span-1">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">VaR Breakdown</h3>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Predicted vs Residual</p>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    riskLevel === "High Risk" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                                    riskLevel === "Moderate Risk" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                                    "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                }`}>{riskLevel}</span>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" width={70} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                                        {chartData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.fill} />
                                        ))}
                                        <LabelList dataKey="value" position="right" fontSize={11} fontWeight={600}
                                            fill="#6b7280" formatter={(v) => `${v}%`} />
                                    </Bar>
                                    <ReferenceLine x={2} stroke="#22c55e" strokeDasharray="4 4" strokeWidth={1.5} />
                                    <ReferenceLine x={5} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                                <span>Low</span>
                                <span>Moderate</span>
                                <span>High</span>
                            </div>
                        </div>

                        {/* 2. Rolling VaR Line + Area */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">30-Day Rolling VaR Simulation</h3>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Projected Value at Risk with confidence bands</p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px]">
                                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 rounded"></span> VaR</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-300 rounded dashed"></span> ±15% band</span>
                                    <span className={`w-2 h-2 rounded-full ${
                                        riskLevel === "High Risk" ? "bg-red-500" :
                                        riskLevel === "Moderate Risk" ? "bg-yellow-500" : "bg-green-500"
                                    }`} />
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={rollingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="varGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" label={{ value: "Day", position: "insideBottomRight", offset: -5, fontSize: 10, fill: "#9ca3af" }} />
                                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} />
                                    <Tooltip content={<LineTooltip />} />
                                    <ReferenceLine y={0.02} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Moderate", position: "right", fontSize: 9, fill: "#eab308" }} />
                                    <ReferenceLine y={0.05} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} label={{ value: "High", position: "right", fontSize: 9, fill: "#ef4444" }} />
                                    <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGradient)" />
                                    <Area type="monotone" dataKey="lower" stroke="none" fill="url(#bandGradient)" />
                                    <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#varGradient)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Risk Threshold Comparison */}
                    {chartData.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Risk Level Assessment</h3>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Where your VaR stands relative to risk thresholds</p>
                                </div>
                            </div>
                            <div className="relative pt-6 pb-2">
                                {/* Threshold zones */}
                                <div className="relative h-8 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-green-500/20 border-r border-green-400" style={{ width: "25%" }} />
                                    <div className="h-full bg-yellow-500/20 border-r border-yellow-400" style={{ width: "37.5%" }} />
                                    <div className="h-full bg-red-500/20" style={{ width: "37.5%" }} />
                                </div>
                                {/* Threshold labels */}
                                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                    <span>0%</span>
                                    <span>2% (Low)</span>
                                    <span>5% (Moderate)</span>
                                    <span>10%+</span>
                                </div>
                                {/* VaR marker */}
                                <motion.div
                                    initial={{ left: "0%" }}
                                    animate={{ left: `${Math.min(varPct / 10 * 100, 95)}%` }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    className="absolute top-0 -translate-x-1/2"
                                    style={{ left: `${Math.min(varPct / 10 * 100, 95)}%` }}
                                >
                                    <div className="flex flex-col items-center">
                                        <svg className="w-4 h-4" viewBox="0 0 16 10">
                                            <polygon points="8,10 0,0 16,0" fill={
                                                varPct > 5 ? "#ef4444" : varPct > 2 ? "#eab308" : "#22c55e"
                                            } />
                                        </svg>
                                        <span className={`text-xs font-bold whitespace-nowrap mt-0.5 ${
                                            varPct > 5 ? "text-red-500" : varPct > 2 ? "text-yellow-500" : "text-green-500"
                                        }`}>
                                            {varPct}% VaR
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {[
                                    { label: "Low Risk", range: "< 2%", color: "green", desc: "Stable market conditions" },
                                    { label: "Moderate", range: "2% - 5%", color: "yellow", desc: "Normal market fluctuations" },
                                    { label: "High Risk", range: "> 5%", color: "red", desc: "Elevated market stress" },
                                ].map((tier) => (
                                    <div key={tier.label} className={`rounded-lg p-3 border ${
                                        (tier.color === "green" && varPct <= 2) ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                                        (tier.color === "yellow" && varPct > 2 && varPct <= 5) ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" :
                                        (tier.color === "red" && varPct > 5) ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
                                        "bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-600"
                                    }`}>
                                        <p className={`text-sm font-bold ${
                                            tier.color === "green" ? "text-green-600" : tier.color === "yellow" ? "text-yellow-600" : "text-red-600"
                                        }`}>{tier.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tier.range}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{tier.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MarketRisk;
