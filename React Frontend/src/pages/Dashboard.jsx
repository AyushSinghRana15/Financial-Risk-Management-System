import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

export default function Dashboard() {

    // Parse email from stored JSON: { name, email }
    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    })();
    const userEmail = storedUser.email || "";

    const [stats, setStats] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, portfolioRes] = await Promise.all([
                    axios.get(`http://localhost:8000/dashboard/stats?email=${encodeURIComponent(userEmail)}`),
                    axios.get(`http://localhost:8000/portfolio/get/${encodeURIComponent(userEmail)}`)
                ]);

                setStats(statsRes.data);
                setPortfolio(portfolioRes.data.portfolio || []);

                const portfolioData = portfolioRes.data.portfolio || [];
                const prompt = `
                Analyze this portfolio and return ONLY short risk alerts:
                ${JSON.stringify(portfolioData)}

                Rules:
                - Max 3 alerts
                - Very short (1 line each)
                - No explanation
                `;

                const alertsRes = await axios.post("http://localhost:8000/ai-risk-alerts", { prompt });
                const text = alertsRes.data.response || "";
                const parsedAlerts = text.split("\n").map(a => a.trim()).filter(a => a.length > 0);
                setAlerts(parsedAlerts);

            } catch (err) {
                console.error(err);
                setAlerts(["Failed to load data"]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userEmail]);

    useEffect(() => {
        const handleRefresh = () => {
            setLoading(true);
            axios.get(`http://localhost:8000/dashboard/stats?email=${encodeURIComponent(userEmail)}`)
                .then(res => setStats(res.data))
                .catch(console.error);
            axios.get(`http://localhost:8000/portfolio/get/${encodeURIComponent(userEmail)}`)
                .then(res => setPortfolio(res.data.portfolio || []))
                .catch(console.error);
            setLoading(false);
        };

        window.addEventListener("refreshDashboard", handleRefresh);
        return () => window.removeEventListener("refreshDashboard", handleRefresh);
    }, [userEmail]);

    const formatCurrency = (value) => {
        if (!value && value !== 0) return "—";
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value.toFixed(0)}`;
    };

    const kpiCards = [
        {
            title: "Portfolio Value",
            value: stats ? formatCurrency(stats.portfolio_value) : "—",
            change: stats ? (stats.portfolio_value > 0 ? "Live from DB" : "No assets yet") : "Loading...",
            color: "blue",
            link: "/portfolio-analytics"
        },
        {
            title: "Credit Risk Exposure",
            value: stats ? (stats.credit_risk_score ? `${stats.credit_risk_score.toFixed(0)}%` : "N/A") : "—",
            change: stats ? (stats.credit_risk_label || "No predictions yet") : "Loading...",
            color: "purple",
            link: "/credit-risk"
        },
        {
            title: "Market Volatility",
            value: stats ? (stats.market_risk_score ? `${stats.market_risk_score.toFixed(1)}%` : "N/A") : "—",
            change: stats ? (stats.market_risk_level || "No predictions yet") : "Loading...",
            color: "red",
            link: "/market-risk"
        },
        {
            title: "Business Risk Score",
            value: stats ? (stats.business_risk_score ? `${stats.business_risk_score.toFixed(0)}%` : "N/A") : "—",
            change: stats ? (stats.business_risk_label || "No predictions yet") : "Loading...",
            color: "green",
            link: "/business-risk"
        }
    ];

    const colorMap = {
        blue: "border-blue-500",
        purple: "border-purple-500",
        red: "border-red-500",
        green: "border-green-500"
    };

    return (
        <div className="p-8">

            {/* Title */}
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
                Financial Risk Management Dashboard
            </h1>

            {/* KPI SCROLL */}
            <div className="relative mb-10 overflow-hidden">
                <div className="w-full h-[140px] overflow-hidden relative">
                    <div className="absolute top-0 left-0 flex gap-6 animate-scroll hover:[animation-play-state:paused] will-change-transform min-w-max">
                        {[...kpiCards, ...kpiCards].map((card, index) => (
                            <Link to={card.link} key={index}>
                                <div className={`kpi-card kpi-card-glow-${card.color} w-[260px] flex-shrink-0 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border-l-4 ${colorMap[card.color]} cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.title}</p>
                                    <h2 className="text-2xl font-bold mt-2 text-gray-800 dark:text-white">{card.value}</h2>
                                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{card.change}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODULE CARDS */}
            <div className="relative mt-10 overflow-hidden">
                <div className="w-full h-[220px] overflow-hidden relative">
                    <div className="absolute top-0 left-0 flex gap-6 animate-scroll hover:[animation-play-state:paused] min-w-max">
                        {[1, 2].map((_, i) => (
                            <div key={i} className="flex gap-6">

                                {[
                                    { name: "Credit Risk", link: "/credit-risk", color: "blue", desc: "Default probability analysis" },
                                    { name: "Market Risk", link: "/market-risk", color: "purple", desc: "Value at Risk estimation" },
                                    { name: "Business Risk", link: "/business-risk", color: "yellow", desc: "Strategic & revenue risks" },
                                    { name: "Operational Risk", link: "/operational-risk", color: "indigo", desc: "Process & system failures" },
                                    { name: "Financial Risk", link: "/financial-risk", color: "red", desc: "Capital & leverage risks" },
                                    { name: "Liquidity Risk", link: "/liquidity-risk", color: "teal", desc: "Cash flow & funding risks" }
                                ].map((mod, idx) => (
                                    <Link to={mod.link} key={idx}>
                                        <div className={`w-[320px] flex-shrink-0 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-l-4 border-${mod.color}-500 cursor-pointer`}>
                                            <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{mod.name}</h2>
                                            <p className="text-gray-600 dark:text-gray-400">{mod.desc}</p>
                                        </div>
                                    </Link>
                                ))}

                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

                {/* Portfolio Allocation */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Portfolio Allocation</h2>

                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <defs>
                                <linearGradient id="pieGradient" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                            <Pie 
                                data={portfolio.length > 0 
                                    ? portfolio.map(a => ({ name: a.asset_name, value: a.total_value }))
                                    : [{ name: "No Assets", value: 1 }]
                                } 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90} 
                                paddingAngle={3}
                            >
                                {["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899"].map((c, i) => (
                                    <Cell key={i} fill={c} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {portfolio.length > 0 && (
                        <div className="text-center -mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-white">
                                ₹ {portfolio.reduce((sum, a) => sum + (a.total_value || 0), 0).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Risk Trend */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Risk Trend</h2>

                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={Array.from({ length: 7 }, (_, i) => ({
                            day: `Day ${i + 1}`,
                            risk: (0.04 + (Math.random() * 0.01 - 0.005)) * 100
                        }))}>
                            <defs>
                                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: 'none', 
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="risk" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                fill="url(#riskGradient)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Risk Alerts */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Risk Alerts</h2>

                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Analyzing portfolio risk...</p>
                    ) : (
                        <ul className="space-y-3 text-sm">
                            {alerts.length > 0 ? (
                                alerts.map((alert, index) => (
                                    <li
                                        key={index}
                                        className={
                                            alert.toLowerCase().includes("high")
                                                ? "text-red-500 dark:text-red-400"
                                                : alert.toLowerCase().includes("consider")
                                                    ? "text-yellow-500 dark:text-yellow-400"
                                                    : "text-green-500 dark:text-green-400"
                                        }
                                    >
                                        ⚠️ {alert}
                                    </li>
                                ))
                            ) : (
                                <li className="text-green-500 dark:text-green-400">
                                    ✅ No major risks detected
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                {/* AI Insights */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">AI Insights</h2>

                    <p className="text-gray-700 dark:text-gray-300"><strong>Risk:</strong> High</p>

                    <ul className="list-disc ml-5 mt-2 text-gray-600 dark:text-gray-400">
                        <li>Portfolio is concentrated in crypto and equities</li>
                        <li>High volatility due to BTC exposure</li>
                        <li>Low diversification increases risk</li>
                    </ul>

                    <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">Suggestions:</p>
                    <ul className="list-disc ml-5 text-gray-600 dark:text-gray-400">
                        <li>Diversify into bonds and gold</li>
                        <li>Reduce crypto allocation</li>
                    </ul>
                </div>

            </div>

        </div>
    );
}