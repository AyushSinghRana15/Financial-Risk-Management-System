import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip
} from "recharts";

export default function PortfolioAnalytics() {

    const data = [
        { x: "Stocks", y: "Stocks", value: 1 },
        { x: "Stocks", y: "Bonds", value: 0.3 },
        { x: "Stocks", y: "Crypto", value: 0.6 },
        { x: "Stocks", y: "Commodities", value: 0.4 },

        { x: "Bonds", y: "Stocks", value: 0.3 },
        { x: "Bonds", y: "Bonds", value: 1 },
        { x: "Bonds", y: "Crypto", value: 0.2 },
        { x: "Bonds", y: "Commodities", value: 0.5 },

        { x: "Crypto", y: "Stocks", value: 0.6 },
        { x: "Crypto", y: "Bonds", value: 0.2 },
        { x: "Crypto", y: "Crypto", value: 1 },
        { x: "Crypto", y: "Commodities", value: 0.3 },

        { x: "Commodities", y: "Stocks", value: 0.4 },
        { x: "Commodities", y: "Bonds", value: 0.5 },
        { x: "Commodities", y: "Crypto", value: 0.3 },
        { x: "Commodities", y: "Commodities", value: 1 }
    ];

    return (
        <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">

            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                Portfolio Risk Dashboard
            </h1>

            <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6">

                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Asset Correlation Matrix
                </h2>

                <ResponsiveContainer width="100%" height={400}>

                    <ScatterChart>

                        <XAxis dataKey="x" type="category" name="Asset X" stroke="#6b7280" />
                        <YAxis dataKey="y" type="category" name="Asset Y" stroke="#6b7280" />
                        <ZAxis dataKey="value" range={[100, 400]} />

                        <Tooltip />

                        <Scatter data={data} fill="#2563eb" />

                    </ScatterChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}
