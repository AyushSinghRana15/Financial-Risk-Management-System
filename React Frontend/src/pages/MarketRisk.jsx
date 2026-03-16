import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";

import { FaChartLine, FaShieldAlt } from "react-icons/fa";

function MarketRisk() {

    const [features, setFeatures] = useState([]);
    const [inputs, setInputs] = useState({});
    const [prediction, setPrediction] = useState(null);
    const [riskLevel, setRiskLevel] = useState("");
    const [confidence, setConfidence] = useState("95%");
    const [rollingData, setRollingData] = useState([]);

    // Load features from backend
    useEffect(() => {

        axios.get("http://127.0.0.1:8000/market_features")
            .then(res => {

                setFeatures(res.data.features);

                const init = {};
                res.data.features.forEach(f => init[f] = 0);

                setInputs(init);

            });

    }, []);

    // Clean feature names
    const cleanFeatureName = (feature) => {

        let name = feature.replace("^", "");

        name = name.replace("NSEI", "NIFTY 50");
        name = name.replace("INDIAVIX", "India VIX");

        name = name.replace("_", " ");

        return name;

    };

    // Handle input change
    const handleChange = (feature, value) => {

        const num = value === "" ? 0 : parseFloat(value);

        setInputs({
            ...inputs,
            [feature]: num
        });

    };

    // Prediction
    const predictRisk = async () => {

        try {

            const res = await axios.post(
                "http://127.0.0.1:8000/predict_market_risk",
                inputs
            );

            const varValue = res.data.predicted_var;

            setPrediction(varValue);

            const absVar = Math.abs(varValue);

            if (absVar > 0.05) {

                setRiskLevel("High Risk");

            }
            else if (absVar > 0.02) {

                setRiskLevel("Moderate Risk");

            }
            else {

                setRiskLevel("Low Risk");

            }

            // Simulated rolling VaR
            const series = [];

            for (let i = 0; i < 30; i++) {

                series.push({
                    day: i + 1,
                    value: absVar + (Math.random() * 0.01 - 0.005)
                });

            }

            setRollingData(series);

        }
        catch (err) {

            console.error(err);

        }

    };

    const chartData = prediction
        ? [{ name: "VaR", value: Math.abs(prediction) }]
        : [];

    const absVar = prediction ? Math.abs(prediction) : 0;

    return (

        <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>

            {/* Header */}

            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                    marginBottom: "25px"
                }}
            >

                <h1 style={{ marginBottom: "5px" }}>
                    📉 Market Risk Dashboard
                </h1>

                <p style={{ color: "#777" }}>
                    Machine Learning based Value at Risk (VaR)
                </p>

                <div style={{ marginTop: "15px" }}>

                    <label style={{ fontSize: "14px", marginRight: "10px" }}>
                        Confidence Level
                    </label>

                    <select
                        value={confidence}
                        onChange={(e) => setConfidence(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ddd"
                        }}
                    >

                        <option>95%</option>
                        <option>99%</option>

                    </select>

                </div>

            </div>

            {/* Market Indicators */}

            <h2>Market Indicators</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "15px",
                    marginBottom: "20px"
                }}
            >

                {features.map((feature) => (

                    <div
                        key={feature}
                        style={{
                            background: "white",
                            padding: "15px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                        }}
                    >

                        <label><b>{cleanFeatureName(feature)}</b></label>

                        <input
                            type="number"
                            step="0.01"
                            value={inputs[feature] || ""}
                            onChange={(e) =>
                                handleChange(feature, e.target.value)
                            }
                            style={{
                                width: "100%",
                                marginTop: "8px",
                                padding: "6px"
                            }}
                        />

                    </div>

                ))}

            </div>

            <button
                onClick={predictRisk}
                style={{
                    padding: "12px 25px",
                    background: "#1f77b4",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "16px",
                    cursor: "pointer"
                }}
            >
                Predict Market Risk
            </button>

            {/* Risk Metrics */}

            {prediction !== null && (

                <>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3,1fr)",
                            gap: "20px",
                            marginTop: "30px"
                        }}
                    >

                        {/* VaR Card */}

                        <div className="card">

                            <FaChartLine size={30} color="#1f77b4" />

                            <h3>Predicted VaR</h3>

                            <h1>{(absVar * 100).toFixed(2)}%</h1>

                        </div>

                        {/* Risk Level */}

                        <div className="card">

                            <FaShieldAlt size={30} color="#e74c3c" />

                            <h3>Risk Level</h3>

                            <h2>{riskLevel}</h2>

                        </div>

                        {/* Confidence */}

                        <div className="card">

                            <h3>Confidence</h3>

                            <h2>{confidence}</h2>

                        </div>

                    </div>

                    {/* Risk Gauge */}

                    <div style={{ marginTop: "25px" }}>

                        <h3>Risk Gauge</h3>

                        <div
                            style={{
                                height: "20px",
                                background: "#eee",
                                borderRadius: "10px",
                                overflow: "hidden"
                            }}
                        >

                            <div
                                style={{
                                    width: `${Math.min(absVar * 100 * 2, 100)}%`,
                                    height: "100%",
                                    background:
                                        absVar > 0.05
                                            ? "#e74c3c"
                                            : absVar > 0.02
                                                ? "#f39c12"
                                                : "#2ecc71"
                                }}
                            />

                        </div>

                    </div>

                    {/* VaR Chart */}

                    <h3 style={{ marginTop: "30px" }}>VaR Visualization</h3>

                    <ResponsiveContainer width="100%" height={300}>

                        <BarChart data={chartData}>

                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Bar dataKey="value" fill="#1f77b4" />

                        </BarChart>

                    </ResponsiveContainer>

                    {/* Rolling VaR */}

                    <h3 style={{ marginTop: "30px" }}>Rolling VaR (30 Days)</h3>

                    <ResponsiveContainer width="100%" height={300}>

                        <LineChart data={rollingData}>

                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <CartesianGrid strokeDasharray="3 3" />

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#e74c3c"
                                strokeWidth={2}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </>

            )}

        </div>

    );

}

export default MarketRisk;