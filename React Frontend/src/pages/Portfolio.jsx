import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const portfolioData = [
    { name: "HDFC Bank", value: 400 },
    { name: "Reliance", value: 300 },
    { name: "TCS", value: 200 },
    { name: "Infosys", value: 100 }
];

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#f59e0b"];

function Portfolio() {
    return (
        <div className="p-10 bg-gray-100 min-h-screen">

            <h1 className="text-3xl font-bold mb-8">
                Portfolio Risk
            </h1>

            {/* Portfolio Metrics */}

            <div className="grid grid-cols-3 gap-6 mb-8">

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-gray-500">Portfolio Value</h2>
                    <p className="text-2xl font-bold">₹ 12,50,000</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-gray-500">Daily VaR</h2>
                    <p className="text-2xl font-bold text-red-600">₹ 32,000</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-gray-500">Volatility</h2>
                    <p className="text-2xl font-bold">2.4%</p>
                </div>

            </div>

            {/* Portfolio Allocation Chart */}

            <div className="bg-white p-6 rounded-xl shadow">

                <h2 className="text-xl font-semibold mb-4">
                    Asset Allocation
                </h2>

                <ResponsiveContainer width="100%" height={300}>

                    <PieChart>

                        <Pie
                            data={portfolioData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={120}
                            label
                        >

                            {portfolioData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}

                        </Pie>

                        <Tooltip />

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default Portfolio;