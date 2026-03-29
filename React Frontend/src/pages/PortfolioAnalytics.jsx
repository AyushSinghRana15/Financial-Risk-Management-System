import { useState, useEffect } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from "recharts";
import { FaChartPie, FaChartBar, FaWallet, FaArrowUp, FaArrowDown, FaSync } from "react-icons/fa";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const ASSET_TYPE_COLORS = {
    "Stock": "#3b82f6",
    "Crypto": "#f59e0b",
    "ETF": "#10b981",
    "Commodity": "#ef4444",
    "Bond": "#8b5cf6",
    "Default": "#6b7280"
};

function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
                <p className="text-white font-medium">{payload[0].payload.name}</p>
                <p className="text-blue-400 text-sm">
                    {payload[0].dataKey === "value" ? `₹ ${payload[0].value.toLocaleString()}` : `${payload[0].value.toFixed(2)}%`}
                </p>
            </div>
        );
    }
    return null;
}

function KPICard({ title, value, subtitle, icon: Icon, trend, colorClass = "text-blue-500" }) {
    const isPositive = trend > 0;
    const isNegative = trend < 0;

    return (
        <div className="glass-panel rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                    <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
                    {subtitle && (
                        <p className={`text-xs mt-1 ${isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-slate-400"}`}>
                            {isPositive && <FaArrowUp className="inline mr-1" />}
                            {isNegative && <FaArrowDown className="inline mr-1" />}
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                        <Icon className={`text-lg ${colorClass}`} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PortfolioAnalytics() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || "";

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPortfolio = async () => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/portfolio/get/${encodeURIComponent(userEmail)}`);
            const data = await res.json();

            if (data.portfolio) {
                setAssets(data.portfolio);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, [userEmail]);

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
            profitLoss,
            growth,
            invested,
            current,
            type: a.asset_type
        };
    }).sort((a, b) => b.growth - a.growth);

    const correlationData = generateCorrelationMatrix(assets);

    function generateCorrelationMatrix(assets) {
        if (assets.length < 2) return [];

        const types = [...new Set(assets.map(a => a.asset_type))];
        const matrix = [];

        types.forEach(type1 => {
            types.forEach(type2 => {
                let correlation = 0;
                if (type1 === type2) {
                    correlation = 1;
                } else {
                    const type1Assets = assets.filter(a => a.asset_type === type1);
                    const type2Assets = assets.filter(a => a.asset_type === type2);

                    if (type1Assets.length > 0 && type2Assets.length > 0) {
                        const type1Growth = type1Assets.reduce((sum, a) => {
                            const returns = (a.current_price - a.buy_price) / a.buy_price;
                            return sum + returns;
                        }, 0) / type1Assets.length;

                        const type2Growth = type2Assets.reduce((sum, a) => {
                            const returns = (a.current_price - a.buy_price) / a.buy_price;
                            return sum + returns;
                        }, 0) / type2Assets.length;

                        const correlationValue = type1Growth * type2Growth;
                        correlation = Math.max(-1, Math.min(1, correlationValue * 5));
                    }
                }

                matrix.push({ x: type1, y: type2, value: parseFloat(correlation.toFixed(2)) });
            });
        });

        return matrix;
    }

    const getCorrelationColor = (value) => {
        if (value >= 0.7) return "bg-green-500";
        if (value >= 0.3) return "bg-green-400";
        if (value >= 0) return "bg-green-200";
        if (value >= -0.3) return "bg-red-200";
        if (value >= -0.7) return "bg-red-400";
        return "bg-red-500";
    };

    const uniqueTypes = [...new Set(assets.map(a => a.asset_type))];

    if (!userEmail) {
        return (
            <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Please login to view portfolio analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            Portfolio Analytics
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Real-time performance insights
                        </p>
                    </div>
                    <button
                        onClick={fetchPortfolio}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <FaSync className={loading ? "animate-spin" : ""} size={14} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center">
                        <FaWallet className="mx-auto text-4xl text-slate-400 mb-4" />
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No assets in portfolio</p>
                        <p className="text-sm text-slate-400 mt-2">Add assets in the Portfolio page to see analytics</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPICard
                                title="Total Invested"
                                value={`₹ ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                icon={FaWallet}
                                colorClass="text-slate-700 dark:text-slate-200"
                            />
                            <KPICard
                                title="Current Value"
                                value={`₹ ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                icon={FaChartPie}
                                colorClass="text-blue-600 dark:text-blue-400"
                            />
                            <KPICard
                                title="Total P/L"
                                value={`${totalProfitLoss >= 0 ? "+" : ""}₹ ${Math.abs(totalProfitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                trend={totalProfitLoss}
                                icon={totalProfitLoss >= 0 ? FaArrowUp : FaArrowDown}
                                colorClass={totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}
                            />
                            <KPICard
                                title="Return"
                                value={`${profitPercentage >= 0 ? "+" : ""}${profitPercentage.toFixed(2)}%`}
                                trend={profitPercentage}
                                icon={profitPercentage >= 0 ? FaArrowUp : FaArrowDown}
                                colorClass={profitPercentage >= 0 ? "text-green-500" : "text-red-500"}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-panel rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <FaChartPie className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Asset Allocation</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Distribution by asset type</p>
                                    </div>
                                </div>

                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={allocationData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {allocationData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={ASSET_TYPE_COLORS[entry.name] || ASSET_TYPE_COLORS.Default}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="glass-panel rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <FaChartBar className="text-green-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Top Performers</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">By percentage growth</p>
                                    </div>
                                </div>

                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={performanceData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} stroke="#6b7280" />
                                        <YAxis type="category" dataKey="name" width={60} stroke="#6b7280" />
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            formatter={(value) => [`${value.toFixed(2)}%`, "Growth"]}
                                        />
                                        <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                                            {performanceData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.growth >= 0 ? "#10b981" : "#ef4444"}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <FaChartBar className="text-purple-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Asset Correlation Matrix</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Diversification analysis across asset types</p>
                                </div>
                            </div>

                            {uniqueTypes.length >= 2 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr>
                                                <th className="p-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Asset Type</th>
                                                {uniqueTypes.map(type => (
                                                    <th key={type} className="p-3 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                                                        {type}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {uniqueTypes.map(rowType => (
                                                <tr key={rowType} className="border-t border-slate-200 dark:border-slate-700">
                                                    <td className="p-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        {rowType}
                                                    </td>
                                                    {uniqueTypes.map(colType => {
                                                        const cellData = correlationData.find(c => c.x === rowType && c.y === colType);
                                                        const value = cellData?.value || 0;

                                                        return (
                                                            <td key={colType} className="p-3 text-center">
                                                                <div
                                                                    className={`inline-flex items-center justify-center w-14 h-10 rounded-lg ${getCorrelationColor(value)} ${rowType === colType ? 'ring-2 ring-blue-400' : ''}`}
                                                                >
                                                                    <span className="text-xs font-medium text-white">
                                                                        {value.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-green-500"></div> High correlation
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-green-200"></div> Low correlation
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-red-200"></div> Negative correlation
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-slate-400 py-8">Add more asset types to see correlation matrix</p>
                            )}
                        </div>

                        <div className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Asset Details</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">Asset</th>
                                            <th className="p-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">Type</th>
                                            <th className="p-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400">Invested</th>
                                            <th className="p-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400">Current</th>
                                            <th className="p-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400">P/L</th>
                                            <th className="p-3 text-right text-sm font-medium text-slate-600 dark:text-slate-400">Return</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performanceData.map((asset, index) => (
                                            <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    {asset.fullName}
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                                                        style={{
                                                            backgroundColor: `${ASSET_TYPE_COLORS[asset.type] || ASSET_TYPE_COLORS.Default}20`,
                                                            color: ASSET_TYPE_COLORS[asset.type] || ASSET_TYPE_COLORS.Default
                                                        }}
                                                    >
                                                        {asset.type}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                    ₹ {asset.invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="p-3 text-sm text-slate-600 dark:text-slate-400 text-right">
                                                    ₹ {asset.current.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className={`p-3 text-sm font-medium text-right ${asset.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                    {asset.profitLoss >= 0 ? "+" : ""}₹ {Math.abs(asset.profitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className={`p-3 text-sm font-medium text-right ${asset.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                    {asset.growth >= 0 ? "+" : ""}{asset.growth.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
