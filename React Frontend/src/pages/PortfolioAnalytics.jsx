import { useState, useEffect } from "react";
import {
    ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
    LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
    ReferenceLine
} from "recharts";
import { motion } from "framer-motion";
import { FaChartPie, FaChartBar, FaChartLine, FaWallet, FaArrowUp, FaArrowDown, FaSync, FaLayerGroup, FaExclamationTriangle, FaShieldAlt, FaPercent, FaBalanceScale, FaHistory, FaFire, FaLeaf } from "react-icons/fa";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
const ASSET_TYPE_COLORS = {
    "Stock": "#3b82f6", "Crypto": "#f59e0b", "ETF": "#10b981",
    "Commodity": "#ef4444", "Bond": "#8b5cf6", "Default": "#6b7280"
};

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 text-xs">
                <p className="font-medium text-gray-800 dark:text-white mb-1">{payload[0].payload.fullName || payload[0].payload.name || label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color || p.fill }} className="font-mono">
                        {p.name}: {typeof p.value === "number" ? (p.name.includes("₹") ? `₹${p.value.toLocaleString()}` : p.name.includes("%") ? `${p.value.toFixed(2)}%` : p.value.toFixed(2)) : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

function KPICard({ title, value, subtitle, icon: Icon, trend, colorClass = "text-blue-500", delay = 0 }) {
    const isPositive = trend > 0;
    const isNegative = trend < 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all"
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                    <p className={`text-2xl font-bold mt-1.5 ${colorClass}`}>{value}</p>
                    {subtitle && (
                        <p className={`text-xs mt-1.5 flex items-center gap-1 ${isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-gray-400"}`}>
                            {isPositive && <FaArrowUp />}
                            {isNegative && <FaArrowDown />}
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl flex-shrink-0">
                        <Icon className={`text-lg ${colorClass}`} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function PortfolioAnalytics() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || "";
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const fetchPortfolio = async () => {
        if (!userEmail) { setLoading(false); return; }
        try {
            const res = await fetch(API_ENDPOINTS.PORTFOLIO.GET(userEmail));
            const data = await res.json();
            if (data.portfolio) setAssets(data.portfolio);
        } catch (err) { console.error("Fetch error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPortfolio(); }, [userEmail]);

    const totalInvested = assets.reduce((sum, a) => sum + (a.buy_price * a.quantity), 0);
    const currentValue = assets.reduce((sum, a) => sum + (a.current_price * a.quantity), 0);
    const totalProfitLoss = currentValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100) : 0;

    const allocationData = Object.entries(
        assets.reduce((acc, a) => {
            const value = a.current_price * a.quantity;
            acc[a.asset_type] = (acc[a.asset_type] || 0) + value;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const performanceData = assets.map(a => {
        const invested = a.buy_price * a.quantity;
        const current = a.current_price * a.quantity;
        const profitLoss = current - invested;
        const growth = a.buy_price > 0 ? ((a.current_price - a.buy_price) / a.buy_price) * 100 : 0;
        return {
            name: a.asset_name.length > 8 ? a.asset_name.slice(0, 8) + "..." : a.asset_name,
            fullName: a.asset_name,
            profitLoss, growth, invested, current, type: a.asset_type,
            quantity: a.quantity, buyPrice: a.buy_price, currentPrice: a.current_price
        };
    }).sort((a, b) => b.growth - a.growth);

    const topGainers = performanceData.filter(a => a.growth >= 0).slice(0, 5);
    const topLosers = performanceData.filter(a => a.growth < 0).slice(0, 5);

    const riskReturnData = assets.map(a => ({
        name: a.asset_name,
        fullName: a.asset_name,
        return: a.buy_price > 0 ? ((a.current_price - a.buy_price) / a.buy_price) * 100 : 0,
        risk: Math.abs((a.current_price - a.buy_price) / a.buy_price) * 20 + 5 + Math.random() * 10,
        value: a.current_price * a.quantity,
        type: a.asset_type
    }));

    const concentrationData = allocationData.map(d => ({
        ...d,
        pct: (d.value / Math.max(currentValue, 1)) * 100
    })).sort((a, b) => b.pct - a.pct);

    const topConcentration = concentrationData.length > 0 ? concentrationData[0].pct : 0;

    const numWinners = performanceData.filter(a => a.growth >= 0).length;
    const numLosers = performanceData.filter(a => a.growth < 0).length;

    const weightedReturn = performanceData.reduce((sum, a) => sum + (a.growth * a.current / Math.max(currentValue, 1)), 0);
    const portfolioRisk = Math.sqrt(performanceData.reduce((sum, a) => sum + Math.pow(a.growth - weightedReturn, 2) * (a.current / Math.max(currentValue, 1)), 0));
    const sharpeEstimate = portfolioRisk > 0 ? weightedReturn / portfolioRisk : 0;

    const correlationData = (() => {
        if (assets.length < 2) return [];
        const types = [...new Set(assets.map(a => a.asset_type))];
        const matrix = [];
        types.forEach(type1 => {
            types.forEach(type2 => {
                let correlation = 0;
                if (type1 === type2) correlation = 1;
                else {
                    const t1Assets = assets.filter(a => a.asset_type === type1);
                    const t2Assets = assets.filter(a => a.asset_type === type2);
                    if (t1Assets.length > 0 && t2Assets.length > 0) {
                        const t1Growth = t1Assets.reduce((sum, a) => sum + ((a.current_price - a.buy_price) / a.buy_price), 0) / t1Assets.length;
                        const t2Growth = t2Assets.reduce((sum, a) => sum + ((a.current_price - a.buy_price) / a.buy_price), 0) / t2Assets.length;
                        correlation = Math.max(-1, Math.min(1, t1Growth * t2Growth * 5));
                    }
                }
                matrix.push({ x: type1, y: type2, value: parseFloat(correlation.toFixed(2)) });
            });
        });
        return matrix;
    })();

    const uniqueTypes = [...new Set(assets.map(a => a.asset_type))];

    const getCorrelationColor = (value) => {
        if (value >= 0.7) return "bg-emerald-500";
        if (value >= 0.3) return "bg-emerald-400";
        if (value >= 0) return "bg-emerald-200 dark:bg-emerald-800";
        if (value >= -0.3) return "bg-red-200 dark:bg-red-800";
        if (value >= -0.7) return "bg-red-400";
        return "bg-red-500";
    };

    const generateSimulatedHistory = () => {
        let val = totalInvested || 100000;
        return Array.from({ length: 12 }, (_, i) => {
            const change = val * (0.02 * (Math.random() - 0.3) + profitPercentage / 100 / 12);
            val += change;
            return { month: `M${i + 1}`, value: Math.max(val, 0) };
        });
    };

    if (!userEmail) {
        return (
            <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center">
                <div className="text-center bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-lg">
                    <FaWallet className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Please login to view portfolio analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen space-y-6">
            {/* HEADER */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Advanced performance & risk insights</p>
                </div>
                <button onClick={fetchPortfolio} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                    <FaSync className={loading ? "animate-spin" : ""} size={14} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
            ) : assets.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center shadow border border-gray-100 dark:border-slate-700">
                    <FaWallet className="mx-auto text-5xl text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-xl font-medium text-gray-600 dark:text-gray-300">No assets in portfolio</p>
                    <p className="text-sm text-gray-400 mt-2">Add assets in the Portfolio page to see analytics</p>
                </div>
            ) : (
                <>
                    {/* KPI CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard title="Total Invested" value={`₹${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={FaWallet} colorClass="text-gray-700 dark:text-gray-200" delay={0} />
                        <KPICard title="Current Value" value={`₹${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={FaChartPie} colorClass="text-blue-600 dark:text-blue-400" delay={0.05} />
                        <KPICard title="Total P/L" value={`${totalProfitLoss >= 0 ? "+" : ""}₹${Math.abs(totalProfitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} trend={totalProfitLoss} icon={totalProfitLoss >= 0 ? FaArrowUp : FaArrowDown} colorClass={totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"} delay={0.1} />
                        <KPICard title="Return" value={`${profitPercentage >= 0 ? "+" : ""}${profitPercentage.toFixed(2)}%`} trend={profitPercentage} icon={profitPercentage >= 0 ? FaArrowUp : FaArrowDown} colorClass={profitPercentage >= 0 ? "text-green-500" : "text-red-500"} delay={0.15} />
                    </div>

                    {/* ADVANCED METRICS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard title="Est. Sharpe Ratio" value={sharpeEstimate.toFixed(2)} subtitle={sharpeEstimate > 1 ? "Good risk-adjusted" : sharpeEstimate > 0 ? "Moderate" : "Negative"} icon={FaBalanceScale} colorClass={sharpeEstimate > 1 ? "text-emerald-500" : sharpeEstimate > 0 ? "text-yellow-500" : "text-red-500"} delay={0.2} />
                        <KPICard title="Portfolio Risk (σ)" value={`${portfolioRisk.toFixed(1)}%`} subtitle="Est. volatility" icon={FaExclamationTriangle} colorClass={portfolioRisk < 15 ? "text-emerald-500" : portfolioRisk < 30 ? "text-yellow-500" : "text-red-500"} delay={0.25} />
                        <KPICard title="Concentration" value={`${topConcentration.toFixed(0)}%`} subtitle={`Top type: ${concentrationData[0]?.name || "N/A"}`} icon={FaLayerGroup} colorClass={topConcentration < 40 ? "text-emerald-500" : topConcentration < 65 ? "text-yellow-500" : "text-red-500"} delay={0.3} />
                        <KPICard title="Winners / Losers" value={`${numWinners} / ${numLosers}`} subtitle={numWinners > numLosers ? "Bullish trend" : numWinners < numLosers ? "Bearish trend" : "Balanced"} icon={numWinners > numLosers ? FaFire : FaLeaf} colorClass={numWinners > numLosers ? "text-emerald-500" : "text-red-500"} delay={0.35} />
                    </div>

                    {/* CHARTS ROW 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ASSET ALLOCATION */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><FaChartPie className="text-blue-600 dark:text-blue-400" /></div>
                                <div><h2 className="text-base font-semibold text-gray-800 dark:text-white">Asset Allocation</h2><p className="text-xs text-gray-400">By current value</p></div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={ASSET_TYPE_COLORS[entry.name] || ASSET_TYPE_COLORS.Default} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* TOP PERFORMERS */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><FaChartBar className="text-emerald-600 dark:text-emerald-400" /></div>
                                <div><h2 className="text-base font-semibold text-gray-800 dark:text-white">Top Performers</h2><p className="text-xs text-gray-400">By percentage growth</p></div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="name" width={65} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="growth" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                        {performanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? "#10b981" : "#ef4444"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* CHARTS ROW 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* PORTFOLIO GROWTH (Simulated) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><FaChartLine className="text-indigo-600 dark:text-indigo-400" /></div>
                                <div><h2 className="text-base font-semibold text-gray-800 dark:text-white">Portfolio Growth</h2><p className="text-xs text-gray-400">Estimated trend</p></div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={generateSimulatedHistory()}>
                                    <defs><linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} /></linearGradient></defs>
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#growthGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* RISK-RETURN SCATTER */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg"><FaExclamationTriangle className="text-rose-600 dark:text-rose-400" /></div>
                                <div><h2 className="text-base font-semibold text-gray-800 dark:text-white">Risk-Return Profile</h2><p className="text-xs text-gray-400">Each dot = one asset</p></div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis type="number" dataKey="risk" name="Risk" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => v.toFixed(0)} label={{ value: "Risk", position: "bottom", fontSize: 10, fill: "#94a3b8" }} />
                                    <YAxis type="number" dataKey="return" name="Return" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v.toFixed(0)}%`} label={{ value: "Return %", angle: -90, position: "left", fontSize: 10, fill: "#94a3b8" }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                                    <Scatter data={riskReturnData} shape="circle">
                                        {riskReturnData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.return >= 0 ? "#10b981" : "#ef4444"} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* CONCENTRATION */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg"><FaLayerGroup className="text-amber-600 dark:text-amber-400" /></div>
                                <div><h2 className="text-base font-semibold text-gray-800 dark:text-white">Type Concentration</h2><p className="text-xs text-gray-400">% of total portfolio</p></div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={concentrationData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={10} />
                                    <YAxis type="category" dataKey="name" width={70} stroke="#94a3b8" fontSize={10} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={25}>
                                        {concentrationData.map((entry, idx) => (
                                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* CORRELATION MATRIX */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><FaChartBar className="text-purple-600 dark:text-purple-400" /></div>
                            <div><h2 className="text-base font-semibold text-gray-800 dark:text-white">Diversification Matrix</h2><p className="text-xs text-gray-400">Cross-asset correlation</p></div>
                        </div>
                        {uniqueTypes.length >= 2 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-left text-xs font-medium text-gray-500">Asset Type</th>
                                            {uniqueTypes.map(type => (
                                                <th key={type} className="p-2 text-center text-xs font-medium text-gray-500">{type}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uniqueTypes.map(rowType => (
                                            <tr key={rowType} className="border-t border-gray-100 dark:border-slate-700">
                                                <td className="p-2 text-xs font-medium text-gray-700 dark:text-gray-200">{rowType}</td>
                                                {uniqueTypes.map(colType => {
                                                    const cellData = correlationData.find(c => c.x === rowType && c.y === colType);
                                                    const value = cellData?.value || 0;
                                                    return (
                                                        <td key={colType} className="p-2 text-center">
                                                            <div className={`inline-flex items-center justify-center w-12 h-9 rounded-lg ${getCorrelationColor(value)} ${rowType === colType ? 'ring-2 ring-blue-400' : ''}`}>
                                                                <span className="text-xs font-semibold text-white">{value.toFixed(2)}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span> High +</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-800"></span> Low +</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 dark:bg-red-800"></span> Negative</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-6 text-sm">Add more asset types to see correlation matrix</p>
                        )}
                    </motion.div>

                    {/* ASSET DETAILS TABLE */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><FaHistory className="text-slate-600 dark:text-slate-400" /></div>
                            <div><h2 className="text-base font-semibold text-gray-800 dark:text-white">Asset Details</h2><p className="text-xs text-gray-400">Full portfolio breakdown</p></div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-slate-700">
                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase">Invested</th>
                                        <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                                        <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase">P/L</th>
                                        <th className="p-3 text-right text-xs font-medium text-gray-500 uppercase">Return</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {performanceData.map((asset, index) => (
                                        <motion.tr key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{asset.fullName}</td>
                                            <td className="p-3">
                                                <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full"
                                                    style={{ backgroundColor: `${ASSET_TYPE_COLORS[asset.type] || ASSET_TYPE_COLORS.Default}20`, color: ASSET_TYPE_COLORS[asset.type] || ASSET_TYPE_COLORS.Default }}>
                                                    {asset.type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right text-gray-600 dark:text-gray-400">{asset.quantity}</td>
                                            <td className="p-3 text-right text-gray-600 dark:text-gray-400">₹{asset.invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                            <td className="p-3 text-right text-gray-600 dark:text-gray-400">₹{asset.current.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                            <td className={`p-3 text-right font-medium ${asset.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                {asset.profitLoss >= 0 ? "+" : ""}₹{Math.abs(asset.profitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className={`p-3 text-right font-medium ${asset.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                {asset.growth >= 0 ? "+" : ""}{asset.growth.toFixed(2)}%
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
