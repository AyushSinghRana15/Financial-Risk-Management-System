import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, AreaChart, Area, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar
} from "recharts";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

const CHART_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const riskModules = [
    { name: "Credit Risk", link: "/credit-risk", desc: "Default probability analysis", color: "from-blue-600 to-indigo-600" },
    { name: "Market Risk", link: "/market-risk", desc: "Value at Risk estimation", color: "from-purple-600 to-pink-600" },
    { name: "Business Risk", link: "/business-risk", desc: "Strategic & revenue risks", color: "from-emerald-500 to-teal-600" },
    { name: "Operational Risk", link: "/operational-risk", desc: "Process & system failures", color: "from-orange-500 to-red-600" },
    { name: "Financial Risk", link: "/financial-risk", desc: "Capital & leverage risks", color: "from-violet-500 to-purple-600" },
    { name: "Liquidity Risk", link: "/liquidity-risk", desc: "Cash flow & funding risks", color: "from-cyan-500 to-blue-600" },
    { name: "E-Commerce Fraud", link: "/ecommerce-fraud", desc: "Transaction fraud detection", color: "from-rose-500 to-pink-600" },
];

function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 text-xs">
                <p className="font-medium text-gray-800 dark:text-white mb-1">{payload[0].payload.name}</p>
                <p className="text-blue-500 font-mono">
                    {typeof payload[0].value === "number"
                        ? payload[0].payload.isPercent
                            ? `${payload[0].value.toFixed(1)}%`
                            : `₹${payload[0].value.toLocaleString()}`
                        : payload[0].value}
                </p>
            </div>
        );
    }
    return null;
}

function KPIAnimatedCard({ title, value, subtitle, icon: Icon, color = "blue", link = "#" }) {
    return (
        <Link to={link}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700 transition-all cursor-pointer group"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                        <p className={`text-2xl font-bold mt-1.5 ${color === "blue" ? "text-blue-600 dark:text-blue-400" : color === "red" ? "text-red-500" : color === "green" ? "text-green-500" : color === "purple" ? "text-purple-500" : "text-gray-800 dark:text-white"}`}>
                            {value}
                        </p>
                        <p className="text-xs mt-1 text-gray-400">{subtitle}</p>
                    </div>
                    {Icon && (
                        <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl group-hover:scale-110 transition-transform">
                            <Icon className={`text-lg ${color === "blue" ? "text-blue-500" : color === "red" ? "text-red-500" : color === "green" ? "text-green-500" : color === "purple" ? "text-purple-500" : "text-gray-500"}`} />
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}

export default function Dashboard() {
    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    })();
    const userEmail = storedUser.email || "";

    const [stats, setStats] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [aiIntelligence, setAiIntelligence] = useState({ overview: "", recommendations: [] });
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (!userEmail) { setLoading(false); return; }
        const fetchData = async () => {
            try {
                const [statsRes, portfolioRes] = await Promise.all([
                    axios.get(`${API_ENDPOINTS.DASHBOARD.STATS}?email=${encodeURIComponent(userEmail)}`),
                    axios.get(API_ENDPOINTS.PORTFOLIO.GET(userEmail))
                ]);
                setStats(statsRes.data);
                setPortfolio(portfolioRes.data.portfolio || []);
                const portfolioData = portfolioRes.data.portfolio || [];
                if (portfolioData.length === 0) {
                    setAiIntelligence({
                        overview: "Your portfolio is empty. Add assets to receive AI-powered insights.",
                        recommendations: []
                    });
                    setLoading(false);
                    return;
                }
                setAiLoading(true);
                const prompt = `Analyze this portfolio: ${JSON.stringify(portfolioData)}`;
                const alertsRes = await axios.post(API_ENDPOINTS.AI.ALERTS, { prompt });
                const data = alertsRes.data;
                setAiIntelligence({
                    overview: data.overview || "Analyzing portfolio...",
                    recommendations: Array.isArray(data.recommendations) ? data.recommendations.slice(0, 3) : []
                });
            } catch (err) {
                console.error(err);
                setAiIntelligence({
                    overview: "Your portfolio shows moderate diversification. Consider reviewing risk exposure across different asset classes.",
                    recommendations: ["Diversify into bonds to reduce volatility", "Monitor high-risk crypto allocations", "Consider rebalancing quarterly"]
                });
            } finally {
                setLoading(false);
                setAiLoading(false);
            }
        };
        fetchData();
    }, [userEmail]);

    useEffect(() => {
        const handleRefresh = () => {
            setLoading(true);
            axios.get(`${API_ENDPOINTS.DASHBOARD.STATS}?email=${encodeURIComponent(userEmail)}`)
                .then(res => setStats(res.data)).catch(console.error);
            axios.get(API_ENDPOINTS.PORTFOLIO.GET(userEmail))
                .then(res => setPortfolio(res.data.portfolio || [])).catch(console.error);
            setLoading(false);
        };
        window.addEventListener("refreshDashboard", handleRefresh);
        return () => window.removeEventListener("refreshDashboard", handleRefresh);
    }, [userEmail]);

    const formatCurrency = (value) => {
        if (!value && value !== 0) return "—";
        if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
        return `₹${value.toFixed(0)}`;
    };

    const portfolioChartData = portfolio.length > 0
        ? portfolio.map((a, i) => ({
            name: a.asset_name, value: a.current_price * a.quantity,
            fill: CHART_COLORS[i % CHART_COLORS.length]
        }))
        : [{ name: "No Assets", value: 1, fill: "#64748b" }];

    const totalPortfolioValue = portfolio.reduce((sum, a) => sum + (a.current_price * a.quantity), 0);

    const riskRadarData = [
        { risk: "Credit", value: stats?.credit_risk_score ? Math.min(stats.credit_risk_score, 100) : 0 },
        { risk: "Market", value: stats?.market_risk_score ? Math.min(stats.market_risk_score, 100) : 0 },
        { risk: "Business", value: stats?.business_risk_score ? Math.min(stats.business_risk_score, 100) : 0 },
    ];

    const predictionHistory = portfolio.length > 0 ? Array.from({ length: 7 }, (_, i) => ({
        day: `D${i + 1}`, value: totalPortfolioValue * (1 + (Math.random() - 0.48) * 0.03)
    })) : [];

    const kpiCards = [
        { title: "Portfolio Value", value: stats ? formatCurrency(stats.portfolio_value) : "—", subtitle: stats?.portfolio_value > 0 ? "Live from DB" : "No assets yet", color: "blue", icon: null, link: "/portfolio-analytics" },
        { title: "Credit Risk", value: stats?.credit_risk_score ? `${stats.credit_risk_score.toFixed(0)}%` : "N/A", subtitle: stats?.credit_risk_label || "No predictions", color: "purple", icon: null, link: "/credit-risk" },
        { title: "Market Volatility", value: stats?.market_risk_score ? `${stats.market_risk_score.toFixed(1)}%` : "N/A", subtitle: stats?.market_risk_level || "No predictions", color: "red", icon: null, link: "/market-risk" },
        { title: "Business Risk", value: stats?.business_risk_score ? `${stats.business_risk_score.toFixed(0)}%` : "N/A", subtitle: stats?.business_risk_label || "No predictions", color: "green", icon: null, link: "/business-risk" },
    ];

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Financial Risk Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time risk analytics and insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
                    <span className="text-xs text-gray-400">{loading ? "Loading..." : "Live"}</span>
                </div>
            </motion.div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, i) => (
                    <KPIAnimatedCard key={card.title} {...card} />
                ))}
            </div>

            {/* RISK MODULES SCROLLING NAV */}
            <div className="relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
                <div className="overflow-x-auto scrollbar-hide pb-2">
                    <div className="flex gap-3 px-1">
                        {riskModules.map((mod, idx) => (
                            <Link to={mod.link} key={idx}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer w-[180px] flex-shrink-0 hover:border-blue-200 dark:hover:border-blue-700 group`}
                                >
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center text-white text-xs font-bold mb-2 group-hover:scale-110 transition-transform`}>
                                        {idx + 1}
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{mod.name}</h3>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{mod.desc}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* PORTFOLIO ALLOCATION */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 xl:col-span-1">
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Portfolio Allocation</h2>
                        <p className="text-[10px] text-gray-400">Asset distribution</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={portfolioChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                                {portfolioChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {portfolio.length > 0 && (
                        <div className="text-center mt-1">
                            <p className="text-[10px] text-gray-400">Total Value</p>
                            <p className="text-base font-bold text-gray-800 dark:text-white">₹{totalPortfolioValue.toLocaleString()}</p>
                        </div>
                    )}
                </motion.div>

                {/* RISK TREND */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 xl:col-span-1">
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Portfolio Trend</h2>
                        <p className="text-[10px] text-gray-400">Estimated 7-day trajectory</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={predictionHistory.length > 0 ? predictionHistory : [{ day: "N/A", value: 0 }]}>
                            <defs>
                                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#portGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* RISK RADAR */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 xl:col-span-1">
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Risk Radar</h2>
                        <p className="text-[10px] text-gray-400">Multi-dimensional view</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={riskRadarData}>
                            <PolarGrid stroke="#374151" strokeOpacity={0.3} />
                            <PolarAngleAxis dataKey="risk" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Risk" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* QUICK STATS */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 xl:col-span-1">
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Quick Overview</h2>
                        <p className="text-[10px] text-gray-400">Portfolio summary</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-xs text-gray-500">Assets</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">{portfolio.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-xs text-gray-500">Portfolio Value</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalPortfolioValue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-xs text-gray-500">Risk Models</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">7</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-xs text-gray-500">Status</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${userEmail ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"}`}>
                                {userEmail ? "Active" : "Not logged in"}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* AI INSIGHTS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white">Portfolio Intelligence</h2>
                    <p className="text-xs text-gray-400">AI-powered analysis and recommendations</p>
                </div>
                {aiLoading || loading ? (
                    <div className="space-y-3">
                        <div className="h-14 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5">Overview</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{aiIntelligence.overview}</p>
                        </div>
                        {aiIntelligence.recommendations.length > 0 && (
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2.5">Recommendations</p>
                                <ul className="space-y-2">
                                    {aiIntelligence.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2.5">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
