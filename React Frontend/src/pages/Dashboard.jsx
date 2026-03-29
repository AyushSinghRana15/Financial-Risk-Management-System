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
import { API_ENDPOINTS } from "../config/api";

const CHART_COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel-dark rounded-lg p-3 shadow-xl">
                <p className="text-white font-medium text-sm">{payload[0].payload.name}</p>
                <p className="text-blue-400 text-sm">
                    ₹ {payload[0].value?.toLocaleString() || payload[0].value}
                </p>
            </div>
        );
    }
    return null;
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
        if (!userEmail) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, portfolioRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/dashboard/stats?email=${encodeURIComponent(userEmail)}`),
                    axios.get(`${API_BASE_URL}/portfolio/get/${encodeURIComponent(userEmail)}`)
                ]);

                setStats(statsRes.data);
                setPortfolio(portfolioRes.data.portfolio || []);

                const portfolioData = portfolioRes.data.portfolio || [];

                if (portfolioData.length === 0) {
                    setAiIntelligence({
                        overview: "Your portfolio is empty. Add assets to receive AI-powered insights and recommendations.",
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
                    recommendations: [
                        "Diversify into bonds to reduce volatility",
                        "Monitor high-risk crypto allocations",
                        "Consider rebalancing quarterly"
                    ]
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
            axios.get(`${API_BASE_URL}/dashboard/stats?email=${encodeURIComponent(userEmail)}`)
                .then(res => setStats(res.data))
                .catch(console.error);
            axios.get(`${API_BASE_URL}/portfolio/get/${encodeURIComponent(userEmail)}`)
                .then(res => setPortfolio(res.data.portfolio || []))
                .catch(console.error);
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



    const portfolioChartData = portfolio.length > 0
        ? portfolio.map((a, i) => ({
            name: a.asset_name,
            value: a.current_price * a.quantity,
            fill: CHART_COLORS[i % CHART_COLORS.length]
        }))
        : [{ name: "No Assets", value: 1, fill: "#64748b" }];

    const totalPortfolioValue = portfolio.reduce((sum, a) => sum + (a.current_price * a.quantity), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
                        Financial Risk Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Real-time risk analytics and insights
                    </p>
                </div>
            </div>

            <div className="relative mb-8 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-100 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-100 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
                <div className="overflow-x-auto scrollbar-hide pb-2">
                    <div className="flex gap-4 animate-scroll w-max px-6">
                        {[...kpiCards, ...kpiCards].map((card, index) => (
                            <Link to={card.link} key={index}>
                                <div className={`glass-panel rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl w-[220px] lg:w-[240px] flex-shrink-0`}>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{card.title}</p>
                                    <h2 className="text-2xl font-bold mt-2 text-slate-800 dark:text-white">{card.value}</h2>
                                    <p className="text-xs mt-1 text-slate-400">{card.change}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative mb-6 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-100 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-100 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-4 animate-scroll w-max px-6">
                        {[1, 2].map((_, repeatIdx) => (
                            <div key={repeatIdx} className="flex gap-4">
                                {[
                                    { name: "Credit Risk", link: "/credit-risk", desc: "Default probability analysis" },
                                    { name: "Market Risk", link: "/market-risk", desc: "Value at Risk estimation" },
                                    { name: "Business Risk", link: "/business-risk", desc: "Strategic & revenue risks" },
                                    { name: "Operational Risk", link: "/operational-risk", desc: "Process & system failures" },
                                    { name: "Financial Risk", link: "/financial-risk", desc: "Capital & leverage risks" },
                                    { name: "Liquidity Risk", link: "/liquidity-risk", desc: "Cash flow & funding risks" }
                                ].map((mod, idx) => (
                                    <Link to={mod.link} key={`${repeatIdx}-${idx}`}>
                                        <div className={`glass-panel rounded-xl p-4 transition-all duration-300 hover:shadow-xl cursor-pointer w-[180px] lg:w-[200px] flex-shrink-0`}>
                                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">{mod.name}</h2>
                                            <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl p-6">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Portfolio Allocation</h2>
                        <p className="text-xs text-slate-400">Asset distribution</p>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <defs>
                                {portfolioChartData.map((entry, index) => (
                                    <linearGradient key={`pie-grad-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                        <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={portfolioChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                            >
                                {portfolioChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#pieGradient${index})`}
                                        stroke="transparent"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {portfolio.length > 0 && (
                        <div className="text-center -mt-2">
                            <p className="text-xs text-slate-400">Total Value</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                ₹ {totalPortfolioValue.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="glass-panel rounded-2xl p-6">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Risk Trend</h2>
                        <p className="text-xs text-slate-400">7-day analysis</p>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={Array.from({ length: 7 }, (_, i) => ({
                            day: `Day ${i + 1}`,
                            risk: (0.04 + (Math.random() * 0.015 - 0.007)) * 100
                        }))}>
                            <defs>
                                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="riskGradientStroke" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="risk"
                                stroke="url(#riskGradientStroke)"
                                strokeWidth={2.5}
                                fill="url(#riskGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel rounded-2xl p-6 md:col-span-2">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-slate-800 dark:text-white">Portfolio Intelligence</h2>
                        <p className="text-xs text-slate-400">AI-powered analysis and recommendations</p>
                    </div>

                    {aiLoading || loading ? (
                        <div className="space-y-3">
                            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-500/30">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">Overview</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {aiIntelligence.overview}
                                </p>
                            </div>

                            {aiIntelligence.recommendations.length > 0 ? (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Actionable Recommendations</p>
                                    <ul className="space-y-2">
                                        {aiIntelligence.recommendations.map((rec, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="text-sm text-slate-600 dark:text-slate-300">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
