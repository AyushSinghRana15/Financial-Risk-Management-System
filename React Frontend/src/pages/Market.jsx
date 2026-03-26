import { useEffect, useState } from "react";
import axios from "axios";

function Market() {

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

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
        }
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

    if (loading) return <div className="p-6">Loading market data...</div>;

    return (
        <div className="p-6 space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Market Overview</h1>
                <p className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Sections */}
            {["Indices", "Crypto", "Commodities"].map(category => (

                <div key={category}>
                    <h2 className="text-lg font-semibold mb-3 text-gray-700">
                        {category}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

                        {Object.entries(data)
                            .filter(([name]) => getCategory(name) === category)
                            .map(([name, item]) => {

                                const isUp = item.change >= 0;

                                return (
                                    <div
                                        key={name}
                                        className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
                                    >

                                        <h3 className="text-gray-500 text-sm">{name}</h3>

                                        <p className="text-2xl font-bold mt-1">
                                            {formatPrice(name, item.price)}
                                        </p>

                                        <p className={`mt-1 text-sm font-medium flex items-center gap-1 ${isUp ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {isUp ? "▲" : "▼"} {item.change}%
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {isUp ? "Market up" : "Market down"}
                                        </p>

                                    </div>
                                );
                            })}

                    </div>
                </div>

            ))}

        </div>
    );
}

export default Market;