import { Link } from "react-router-dom";
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
export default function Dashboard() {

    const kpiCards = [
        {
            title: "Portfolio Value",
            value: "$12.4M",
            change: "+2.3% today",
            color: "blue",
            link: "/portfolio-analytics"
        },
        {
            title: "Credit Risk Exposure",
            value: "34%",
            change: "Moderate",
            color: "purple",
            link: "/credit-risk"
        },
        {
            title: "Market Volatility",
            value: "18%",
            change: "Medium",
            color: "red",
            link: "/market-risk"
        },
        {
            title: "Overall Risk Score",
            value: "78 / 100",
            change: "Healthy",
            color: "green",
            link: "/risk-analytics"
        }
    ];

    // ✅ FIX: Tailwind dynamic color mapping
    const colorMap = {
        blue: "border-blue-500",
        purple: "border-purple-500",
        red: "border-red-500",
        green: "border-green-500"
    };

    return (
        <div className="p-8">

            {/* Title */}
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                Financial Risk Management Dashboard
            </h1>

            {/* 🔥 KPI SCROLL SECTION (FIXED) */}
            <div className="relative mb-10 overflow-hidden">

                {/* ✅ FIX: give proper height */}
                <div className="w-full h-[140px] overflow-hidden relative">

                    <div className="absolute top-0 left-0 flex gap-6 animate-scroll hover:[animation-play-state:paused]">

                        {[...kpiCards, ...kpiCards].map((card, index) => (
                            <Link to={card.link} key={index}>
                                <div
                                    className={`w-[260px] flex-shrink-0 bg-white p-5 rounded-xl shadow 
                        border-l-4 ${colorMap[card.color]} cursor-pointer
                        transition-all duration-300
                        hover:shadow-xl hover:scale-105 hover:rotate-1`}
                                >
                                    <p className="text-gray-500 text-sm">{card.title}</p>
                                    <h2 className="text-2xl font-bold mt-2">{card.value}</h2>
                                    <p className="text-sm mt-1 text-gray-600">{card.change}</p>
                                </div>
                            </Link>
                        ))}

                    </div>

                </div>

            </div>
            {/* 🔥 MODULE CARDS */}
            <div className="relative mt-10 overflow-hidden">

                <div className="w-full h-[220px] overflow-hidden relative">

                    <div className="absolute top-0 left-0 flex gap-6 animate-scroll hover:[animation-play-state:paused]">

                        {[1, 2].map((_, i) => (
                            <div key={i} className="flex gap-6">

                                {/* Credit Risk */}
                                <Link to="/credit-risk">
                                    <div className="w-[320px] flex-shrink-0 bg-white p-6 rounded-xl shadow-md 
                                        transition-all duration-300 
                                        hover:shadow-2xl hover:-translate-y-2 hover:rotate-1 
                                        border-l-4 border-blue-500 cursor-pointer">
                                        <h2 className="text-lg font-semibold mb-2">Credit Risk</h2>
                                        <p className="text-gray-600">Default probability analysis</p>
                                    </div>
                                </Link>

                                {/* Market Risk */}
                                <Link to="/market-risk">
                                    <div className="w-[320px] flex-shrink-0 bg-white p-6 rounded-xl shadow-md 
                                        transition-all duration-300 
                                        hover:shadow-2xl hover:-translate-y-2 hover:-rotate-1 
                                        border-l-4 border-purple-500 cursor-pointer">
                                        <h2 className="text-lg font-semibold mb-2">Market Risk</h2>
                                        <p className="text-gray-600">Value at Risk estimation</p>
                                    </div>
                                </Link>

                                {/* Business Risk */}
                                <Link to="/business-risk">
                                    <div className="w-[320px] flex-shrink-0 bg-white p-6 rounded-xl shadow-md 
                                        transition-all duration-300 
                                        hover:shadow-2xl hover:-translate-y-2 hover:rotate-1 
                                        border-l-4 border-yellow-500 cursor-pointer">
                                        <h2 className="text-lg font-semibold mb-2">Business Risk</h2>
                                        <p className="text-gray-600">Strategic & revenue risks</p>
                                    </div>
                                </Link>

                                {/* Operational Risk */}
                                <Link to="/operational-risk">
                                    <div className="w-[320px] flex-shrink-0 bg-white p-6 rounded-xl shadow-md 
                                        transition-all duration-300 
                                        hover:shadow-2xl hover:-translate-y-2 hover:-rotate-1 
                                        border-l-4 border-indigo-500 cursor-pointer">
                                        <h2 className="text-lg font-semibold mb-2">Operational Risk</h2>
                                        <p className="text-gray-600">Process & system failures</p>
                                    </div>
                                </Link>

                                {/* Financial Risk */}
                                <Link to="/financial-risk">
                                    <div className="w-[320px] flex-shrink-0 bg-white p-6 rounded-xl shadow-md 
                                        transition-all duration-300 
                                        hover:shadow-2xl hover:-translate-y-2 hover:rotate-1 
                                        border-l-4 border-red-500 cursor-pointer">
                                        <h2 className="text-lg font-semibold mb-2">Financial Risk</h2>
                                        <p className="text-gray-600">Capital & leverage risks</p>
                                    </div>
                                </Link>

                                {/* Liquidity Risk */}
                                <Link to="/liquidity-risk">
                                    <div className="w-[320px] flex-shrink-0 bg-white p-6 rounded-xl shadow-md 
                                        transition-all duration-300 
                                        hover:shadow-2xl hover:-translate-y-2 hover:-rotate-1 
                                        border-l-4 border-teal-500 cursor-pointer">
                                        <h2 className="text-lg font-semibold mb-2">Liquidity Risk</h2>
                                        <p className="text-gray-600">Cash flow & funding risks</p>
                                    </div>
                                </Link>

                            </div>
                        ))}

                    </div>

                </div>

            </div>
            {/* 🔥 INSIGHTS & ANALYTICS */}
            {/* 🔥 INSIGHTS & ANALYTICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

                {/* 📊 Portfolio Allocation */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Portfolio Allocation</h2>

                    {(() => {
                        const portfolio = {
                            Stocks: 40,
                            Bonds: 20,
                            Crypto: 20,
                            Gold: 10,
                            Oil: 10
                        };

                        const pieData = Object.keys(portfolio).map((key) => ({
                            name: key,
                            value: portfolio[key]
                        }));

                        const colors = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6"];

                        return (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        label
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={colors[index % colors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        );
                    })()}
                </div>

                {/* 📈 Risk Trend */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Risk Trend</h2>

                    {(() => {
                        const baseRisk = 0.04; // replace later with API VaR

                        const riskData = Array.from({ length: 7 }, (_, i) => ({
                            day: `Day ${i + 1}`,
                            risk: (baseRisk + (Math.random() * 0.01 - 0.005)) * 100
                        }));

                        return (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={riskData}>
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="risk"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        );
                    })()}
                </div>

                {/* ⚠️ Risk Alerts */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Risk Alerts</h2>

                    {(() => {
                        const portfolio = {
                            Stocks: 40,
                            Bonds: 20,
                            Crypto: 20,
                            Gold: 10,
                            Oil: 10
                        };

                        const alerts = [];

                        if (portfolio.Crypto > 15) {
                            alerts.push({ text: "High crypto exposure", color: "text-red-500" });
                        }

                        if (portfolio.Stocks > 50) {
                            alerts.push({ text: "High stock concentration", color: "text-yellow-500" });
                        }

                        if (portfolio.Bonds >= 20) {
                            alerts.push({ text: "Portfolio has stability buffer", color: "text-green-500" });
                        }

                        if (alerts.length === 0) {
                            alerts.push({ text: "Portfolio looks balanced", color: "text-green-500" });
                        }

                        return (
                            <ul className="space-y-3 text-gray-600">
                                {alerts.map((alert, index) => (
                                    <li key={index} className={alert.color}>
                                        ⚠️ {alert.text}
                                    </li>
                                ))}
                            </ul>
                        );
                    })()}
                </div>

                {/* 🧠 AI Insights */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-4">AI Insights</h2>

                    {(() => {
                        const portfolio = {
                            Stocks: 40,
                            Bonds: 20,
                            Crypto: 20,
                            Gold: 10,
                            Oil: 10
                        };

                        let insight = "Your portfolio is moderately balanced. ";

                        if (portfolio.Crypto > 15) {
                            insight += "High crypto exposure may increase volatility. ";
                        }

                        if (portfolio.Stocks > 40) {
                            insight += "Stock-heavy allocation increases market sensitivity. ";
                        }

                        if (portfolio.Bonds >= 20) {
                            insight += "Bonds provide stability and reduce downside risk. ";
                        }

                        insight += "Consider diversification across uncorrelated assets.";

                        return (
                            <p className="text-gray-600">{insight}</p>
                        );
                    })()}
                </div>

            </div>

        </div>
    );
}