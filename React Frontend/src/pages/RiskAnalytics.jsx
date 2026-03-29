import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line,
    ResponsiveContainer
} from "recharts";

const returnData = [
    { range: "-3%", value: 2 },
    { range: "-2%", value: 5 },
    { range: "-1%", value: 8 },
    { range: "0%", value: 12 },
    { range: "1%", value: 7 },
    { range: "2%", value: 4 }
];

const volatilityData = [
    { day: "Mon", vol: 0.02 },
    { day: "Tue", vol: 0.025 },
    { day: "Wed", vol: 0.018 },
    { day: "Thu", vol: 0.03 },
    { day: "Fri", vol: 0.022 }
];

function RiskAnalytics() {
    return (
        <div className="p-10 bg-gray-100 dark:bg-slate-900 min-h-screen">

            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
                Risk Analytics
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Return Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Return Distribution
                    </h2>

                    <ResponsiveContainer width="100%" height={300}>

                        <BarChart data={returnData}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="range" stroke="#6b7280" />

                            <YAxis stroke="#6b7280" />

                            <Tooltip />

                            <Bar dataKey="value" fill="#2563eb" />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

                {/* Volatility */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Rolling Volatility
                    </h2>

                    <ResponsiveContainer width="100%" height={300}>

                        <LineChart data={volatilityData}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="day" stroke="#6b7280" />

                            <YAxis stroke="#6b7280" />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="vol"
                                stroke="#dc2626"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>
    );
}

export default RiskAnalytics;
