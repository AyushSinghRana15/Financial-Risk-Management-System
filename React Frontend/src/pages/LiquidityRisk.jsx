import { useEffect, useState } from "react";
import axios from "axios";

export default function LiquidityRisk() {

    const userEmail = localStorage.getItem('user') || "";
    
    const [features, setFeatures] = useState([]);
    const [labels, setLabels] = useState([]);
    const [formData, setFormData] = useState({});
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = "http://127.0.0.1:8000/liquidity";

    // ----------------------------
    // LOAD FEATURES
    // ----------------------------
    useEffect(() => {
        axios.get(`${API_URL}/features`)
            .then(res => {
                setFeatures(res.data.features);
                setLabels(res.data.labels);

                let init = {};
                res.data.features.forEach(f => init[f] = 0);
                setFormData(init);
            })
            .catch(() => {
                alert("Backend not connected");
          });
        
        if (userEmail) {
            axios.get(`${API_URL}/history?email=${encodeURIComponent(userEmail)}`)
                .then(res => setHistory(res.data.history || []))
                .catch(console.error);
        }
    }, [userEmail]);

    // ----------------------------
    // HANDLE CHANGE
    // ----------------------------
    const handleChange = (feature, value) => {
        setFormData(prev => ({
            ...prev,
            [feature]: Number(value)
        }));
    };

    // ----------------------------
    // PREDICT
    // ----------------------------
    const predict = async () => {
    try {
        setLoading(true);
        setResult(null);

        const res = await axios.post(
            `${API_URL}/predict`,
            { ...formData, email: userEmail }
        );

        setResult(res.data);
        window.dispatchEvent(new Event("refreshDashboard"));

        if (userEmail) {
            axios.get(`${API_URL}/history?email=${encodeURIComponent(userEmail)}`)
                .then(res => setHistory(res.data.history || []))
                .catch(console.error);
        }

    } catch (err) {
        console.error("Prediction Error:", err);
        alert("Prediction failed ❌");
    } finally {
        setLoading(false);
    }
};

    // ----------------------------
    // UI
    // ----------------------------
    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            <h1 className="text-3xl font-bold mb-6">
                Liquidity Risk Prediction
            </h1>

            <div className="bg-white p-6 rounded-xl shadow">

                {/* INPUT GRID */}
                <div className="grid grid-cols-3 gap-4">

               { 
               features.length === 0 ? (
             <p className="text-gray-500">Loading features...</p>
    ) : (
        features.map((f, i) => (
            <div key={f}>
                <label className="text-sm text-gray-600">
                    {labels[i] || f}
                </label>

                <input
                    type="number"
                    value={formData[f] ?? ""}
                    onChange={(e) => handleChange(f, e.target.value)}
                    className="w-full border p-2 rounded mt-1"
                />
            </div>
        ))
    )}

</div>

                {/* BUTTON */}
                <button
                    onClick={predict}
                    disabled={loading}
                    className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl"
                >
                    {loading ? "Analyzing..." : "Predict Liquidity Risk"}
                </button>

                {/* RESULT */}
                {result && (
                    <div className="mt-6 p-5 bg-gray-50 rounded-xl shadow">

                        <h2 className="text-lg font-semibold mb-3">
                            Result
                        </h2>

                        <p className="text-xl font-bold text-blue-600">
                            {result.risk_level}
                        </p>

                        <p className="text-sm text-gray-500">
                            Prediction Class: {result.prediction}
                        </p>

                    </div>
                )}

                {/* Recent Predictions */}
                {history.length > 0 && (
                    <div className="mt-6 p-5 bg-gray-50 rounded-xl">
                        <h3 className="font-semibold mb-3">Recent Predictions</h3>
                        <div className="space-y-2">
                            {history.map(h => (
                                <div key={h.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                                    <span className="text-sm">{new Date(h.recorded_at).toLocaleDateString()}</span>
                                    <span className="font-medium">Class {h.liquidity_score}</span>
                                    <span className="text-sm">{h.risk_label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}