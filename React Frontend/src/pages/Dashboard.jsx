import { Link } from "react-router-dom";

export default function Dashboard() {
    return (
        <div className="p-8">

            {/* Title */}
            <h1 className="text-3xl font-bold mb-8 text-gray-800">
                Financial Risk Management Dashboard
            </h1>

            {/* KPI SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

                <Link to="/portfolio-analytics">
                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-500 cursor-pointer">
                        <p className="text-gray-500 text-sm">Portfolio Value</p>
                        <h2 className="text-2xl font-bold mt-2">$12.4M</h2>
                        <p className="text-green-500 text-sm mt-1">+2.3% today</p>
                    </div>
                </Link>

                <Link to="/credit-risk">
                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-l-4 border-purple-500 cursor-pointer">
                        <p className="text-gray-500 text-sm">Credit Risk Exposure</p>
                        <h2 className="text-2xl font-bold mt-2">34%</h2>
                        <p className="text-yellow-500 text-sm mt-1">Moderate</p>
                    </div>
                </Link>

                <Link to="/market-risk">
                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-l-4 border-red-500 cursor-pointer">
                        <p className="text-gray-500 text-sm">Market Volatility</p>
                        <h2 className="text-2xl font-bold mt-2">18%</h2>
                        <p className="text-orange-500 text-sm mt-1">Medium</p>
                    </div>
                </Link>

                <Link to="/risk-analytics">
                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-l-4 border-green-500 cursor-pointer">
                        <p className="text-gray-500 text-sm">Overall Risk Score</p>
                        <h2 className="text-2xl font-bold mt-2">78 / 100</h2>
                        <p className="text-green-500 text-sm mt-1">Healthy</p>
                    </div>
                </Link>

            </div>

            {/* MODULE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <Link to="/credit-risk">
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 border-blue-500 cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">📊</div>
                            <h2 className="text-lg font-semibold">Credit Risk Model</h2>
                        </div>
                        <p className="text-gray-600">
                            Predict borrower default probability
                        </p>
                    </div>
                </Link>

                <Link to="/market-risk">
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 border-purple-500 cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">📈</div>
                            <h2 className="text-lg font-semibold">Market Risk (VaR)</h2>
                        </div>
                        <p className="text-gray-600">
                            Estimate Value at Risk for portfolio
                        </p>
                    </div>
                </Link>

                <Link to="/risk-analytics">
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 border-l-4 border-green-500 cursor-pointer">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">📉</div>
                            <h2 className="text-lg font-semibold">Risk Analytics</h2>
                        </div>
                        <p className="text-gray-600">
                            Analyze volatility and financial indicators
                        </p>
                    </div>
                </Link>

            </div>

        </div>
    );
}