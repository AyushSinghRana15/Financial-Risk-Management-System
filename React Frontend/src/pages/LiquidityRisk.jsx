import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

export default function LiquidityRisk() {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || "";
    
    const [features, setFeatures] = useState([]);
    const [labels, setLabels] = useState([]);
    const [formData, setFormData] = useState({});
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/liquidity/features`)
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

    const handleChange = (feature, value) => {
        setFormData(prev => ({
            ...prev,
            [feature]: Number(value)
        }));
    };

    const predict = async () => {
    try {
        setLoading(true);
        setResult(null);

        const res = await axios.post(
            `${API_BASE_URL}/liquidity/predict`,
            { ...formData, email: userEmail }
        );

        setResult(res.data);
        window.dispatchEvent(new Event("refreshDashboard"));

        if (userEmail) {
            axios.get(`${API_BASE_URL}/liquidity/history?email=${encodeURIComponent(userEmail)}`)
                .then(res => setHistory(res.data.history || []))
                .catch(console.error);
        }

    } catch (err) {
        console.error("Prediction Error:", err);
        alert("Prediction failed");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="p-6 bg-gray-100 dark:bg-slate-900 min-h-screen">

            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
                Liquidity Risk Prediction
            </h1>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">

                {/* INPUT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

               { 
               features.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-3">Loading features...</p>
    ) : (
        features.map((f, i) => (
            <div key={f}>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                    {labels[i] || f}
                </label>

                <input
                    type="number"
                    value={formData[f] ?? ""}
                    onChange={(e) => handleChange(f, e.target.value)}
                    className="w-full border dark:border-slate-600 p-2 rounded mt-1 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        ))
    )}

</div>

                {/* BUTTON */}
                <button
                    onClick={predict}
                    disabled={loading}
                    className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {loading ? "Analyzing..." : "Predict Liquidity Risk"}
                </button>

                {/* RESULT */}
                {result && (
                    <div className="mt-6 p-5 bg-gray-50 dark:bg-slate-700 rounded-xl shadow">

                        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                            Result
                        </h2>

                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {result.risk_level}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Prediction Class: {result.prediction}
                        </p>

                    </div>
                )}

                {/* Recent Predictions */}
                {history.length > 0 && (
                    <div className="mt-6 p-5 bg-gray-50 dark:bg-slate-700 rounded-xl">
                        <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Recent Predictions</h3>
                        <div className="space-y-2">
                            {history.map(h => (
                                <div key={h.id} className="flex justify-between items-center bg-white dark:bg-slate-600 p-3 rounded-lg shadow-sm">
                                    <span className="text-sm text-gray-700 dark:text-gray-200">{new Date(h.recorded_at).toLocaleDateString()}</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-100">Class {h.liquidity_score}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{h.risk_label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
