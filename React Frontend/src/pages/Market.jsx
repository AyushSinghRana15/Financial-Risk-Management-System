import { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp, FaSync } from "react-icons/fa";

function Market() {

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [openSections, setOpenSections] = useState({
        Indices: true,
        Crypto: true,
        Commodities: true
    });

    useEffect(() => {
        fetchMarket();
    }, []);

    const fetchMarket = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/market-data");
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMarket();
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatPrice = (name, price) => {
        if (name.includes("BTC") || name.includes("ETH")) return `$${price}`;
        if (name.includes("Gold")) return `₹ ${price}`;
        return price.toLocaleString();
    };

    const getCategory = (name) => {
        if (name.includes("BTC") || name.includes("ETH")) return "Crypto";
        if (name.includes("Gold")) return "Commodities";
        return "Indices";
    };

    const getCategoryColors = (category) => {
        switch (category) {
            case "Indices":
                return {
                    bg: "bg-blue-500/10 dark:bg-blue-500/5",
                    border: "border-blue-200 dark:border-blue-800",
                    header: "bg-blue-50 dark:bg-blue-900/20",
                    icon: "📈"
                };
            case "Crypto":
                return {
                    bg: "bg-purple-500/10 dark:bg-purple-500/5",
                    border: "border-purple-200 dark:border-purple-800",
                    header: "bg-purple-50 dark:bg-purple-900/20",
                    icon: "₿"
                };
            case "Commodities":
                return {
                    bg: "bg-yellow-500/10 dark:bg-yellow-500/5",
                    border: "border-yellow-200 dark:border-yellow-800",
                    header: "bg-yellow-50 dark:bg-yellow-900/20",
                    icon: "🪙"
                };
            default:
                return {
                    bg: "bg-gray-500/10",
                    border: "border-gray-200",
                    header: "bg-gray-50",
                    icon: "📊"
                };
        }
    };

    if (loading) return (
        <div className="p-6 text-gray-500 dark:text-gray-400 flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse">Loading market data...</div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Market Overview</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Live market data
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                    <FaSync className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh Now"}
                </button>
            </div>

            {/* Accordion Sections */}
            {["Indices", "Crypto", "Commodities"].map(category => {
                const colors = getCategoryColors(category);
                const sectionItems = Object.entries(data).filter(([name]) => getCategory(name) === category);
                const isOpen = openSections[category];

                return (
                    <div 
                        key={category} 
                        className={`rounded-2xl border ${colors.border} overflow-hidden ${colors.bg}`}
                    >
                        {/* Accordion Header */}
                        <button
                            onClick={() => toggleSection(category)}
                            className={`w-full flex items-center justify-between p-4 ${colors.header} transition-colors hover:opacity-90`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{colors.icon}</span>
                                <div className="text-left">
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        {category}
                                    </h2>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {sectionItems.length} symbols
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isOpen ? (
                                    <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                                ) : (
                                    <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                                )}
                            </div>
                        </button>

                        {/* Accordion Content */}
                        {isOpen && (
                            <div className="p-4 bg-white dark:bg-slate-800/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {sectionItems.map(([name, item]) => {
                                        const isUp = item.change >= 0;
                                        
                                        return (
                                            <div
                                                key={name}
                                                className="group bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                        {name}
                                                    </h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        isUp 
                                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                                                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                                    }`}>
                                                        {isUp ? "+" : ""}{item.change}%
                                                    </span>
                                                </div>

                                                <p className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                                    {formatPrice(name, item.price)}
                                                </p>

                                                <div className={`flex items-center gap-1 text-sm font-medium ${
                                                    isUp 
                                                        ? "text-green-600 dark:text-green-400" 
                                                        : "text-red-600 dark:text-red-400"
                                                }`}>
                                                    {isUp ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5m10 10l-5-5-5 5" />
                                                        </svg>
                                                    )}
                                                    <span>{isUp ? "Market up" : "Market down"}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {sectionItems.length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        No data available
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Last Updated Footer */}
            <div className="text-center text-sm text-gray-400 dark:text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}

export default Market;
